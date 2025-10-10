# Shared State Event Protocol Specification

**Version**: 1.0.0
**Date**: 2025-10-09
**Status**: Draft

## Overview

This document defines the event protocol for shared state management across micro-applications in the K8s Agent Web system, enabling reactive state synchronization using Wujie's event bus.

## State Management Architecture

**State Provider**: `SharedStateManager` (main app)
**State Storage**: Vue `reactive()` object
**Event Bus**: Wujie (`wujie-vue3`)
**Pattern**: Publish-Subscribe with Reactive Updates

## Namespace Convention

States are organized by namespace to prevent key collisions between micro-apps.

**Format**: `${namespace}:${key}`

**Standard Namespaces**:

| Namespace | Purpose | Example Keys |
|-----------|---------|--------------|
| `user` | User profile and auth | `info`, `preferences`, `permissions` |
| `notification` | Alerts and messages | `unreadCount`, `latestMessage` |
| `permission` | Role and access control | `roleChanged`, `menuUpdated` |
| `system` | Global app settings | `theme`, `language`, `featureFlags` |
| `[app-name]` | App-specific state | `dashboard:widgets`, `agent:filters` |

## Event Types

### 1. state:update

**Direction**: Bidirectional (Main App ↔ Micro-Apps)
**Purpose**: Broadcast state change to all subscribed apps
**Emitter**: `SharedStateManager.setState()`
**Listener**: All micro-apps with subscriptions

**Payload**:

```typescript
{
  namespace: string,      // State category (e.g., 'user')
  key: string,            // State identifier (e.g., 'info')
  value: any,             // New state value (JSON-serializable)
  timestamp: number,      // Unix timestamp in milliseconds
  version?: number        // Optional version for conflict resolution
}
```

**Example**:

```javascript
// Main app or micro-app updates state
sharedStateManager.setState('user', 'info', {
  id: 123,
  username: 'admin',
  avatar: '/avatars/admin.png',
  roles: ['admin']
})

// Event emitted automatically
bus.$emit('state:update', {
  namespace: 'user',
  key: 'info',
  value: { id: 123, username: 'admin', avatar: '/avatars/admin.png', roles: ['admin'] },
  timestamp: 1696834567890,
  version: 1
})

// All subscribed micro-apps receive update
sharedStateManager.subscribe('user', 'info', (value) => {
  console.log('User info updated:', value)
  // Update local UI components
})
```

**Behavior**:
- Event is broadcast to ALL apps (no targeting)
- Only apps with subscriptions to `${namespace}:${key}` react to update
- Value MUST be JSON-serializable (no functions, symbols, circular refs)
- Updates trigger Vue reactivity (components re-render automatically)

---

### 2. state:subscribe

**Direction**: Micro-App → Main App
**Purpose**: Register interest in specific state key (optional, for telemetry)
**Emitter**: `SharedStateManager.subscribe()`
**Listener**: Main app (for subscription tracking/debugging)

**Payload**:

```typescript
{
  namespace: string,      // State namespace
  key: string,            // State key
  appName: string,        // Subscribing app name
  timestamp: number
}
```

**Example**:

```javascript
// Micro-app subscribes
sharedStateManager.subscribe('notification', 'unreadCount', (count) => {
  badgeCount.value = count
})

// Optional telemetry event emitted
bus.$emit('state:subscribe', {
  namespace: 'notification',
  key: 'unreadCount',
  appName: 'dashboard-app',
  timestamp: 1696834567890
})
```

**Behavior**:
- This event is OPTIONAL (used for debugging/telemetry)
- Main app MAY track active subscriptions for memory leak detection
- Not required for functional state synchronization

---

### 3. state:unsubscribe

**Direction**: Micro-App → Main App
**Purpose**: Remove subscription when app unmounts (cleanup)
**Emitter**: `SharedStateManager` cleanup hook
**Listener**: Main app (for subscription tracking)

**Payload**:

```typescript
{
  namespace: string,      // State namespace
  key: string,            // State key
  appName: string,        // Unsubscribing app name
  timestamp: number
}
```

**Example**:

```javascript
// Micro-app unmounts (automatic cleanup)
onUnmounted(() => {
  sharedStateManager.unsubscribe('notification', 'unreadCount')
})

// Cleanup event emitted
bus.$emit('state:unsubscribe', {
  namespace: 'notification',
  key: 'unreadCount',
  appName: 'dashboard-app',
  timestamp: 1696834567900
})
```

**Behavior**:
- Called automatically on app unmount
- Prevents memory leaks from dangling subscriptions
- Main app removes callback from subscription map

---

## SharedStateManager API

### Main App Implementation

```javascript
import { reactive } from 'vue'
import WujieVue from 'wujie-vue3'

export class SharedStateManager {
  constructor() {
    this.state = reactive({})
    this.subscriptions = new Map() // Map<fullKey, callback[]>
    this.bus = WujieVue.bus
    this.setupBusListeners()
  }

  /**
   * Set state value and broadcast to all apps
   */
  setState(namespace, key, value) {
    const fullKey = `${namespace}:${key}`
    this.state[fullKey] = value

    this.bus.$emit('state:update', {
      namespace,
      key,
      value,
      timestamp: Date.now(),
      version: this.state[`${fullKey}:version`] || 1
    })

    // Increment version for conflict resolution
    this.state[`${fullKey}:version`] = (this.state[`${fullKey}:version`] || 0) + 1

    // Trigger local subscriptions
    const callbacks = this.subscriptions.get(fullKey) || []
    callbacks.forEach(cb => cb(value))
  }

  /**
   * Get current state value
   */
  getState(namespace, key) {
    const fullKey = `${namespace}:${key}`
    return this.state[fullKey]
  }

  /**
   * Subscribe to state changes
   */
  subscribe(namespace, key, callback) {
    const fullKey = `${namespace}:${key}`
    if (!this.subscriptions.has(fullKey)) {
      this.subscriptions.set(fullKey, [])
    }
    this.subscriptions.get(fullKey).push(callback)

    // Optional telemetry
    this.bus.$emit('state:subscribe', {
      namespace,
      key,
      appName: 'main-app', // Or dynamic app name
      timestamp: Date.now()
    })

    // Return initial value if exists
    return this.getState(namespace, key)
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(namespace, key, callback) {
    const fullKey = `${namespace}:${key}`
    const callbacks = this.subscriptions.get(fullKey) || []
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }

    this.bus.$emit('state:unsubscribe', {
      namespace,
      key,
      appName: 'main-app',
      timestamp: Date.now()
    })
  }

  /**
   * Listen for state updates from other apps
   */
  setupBusListeners() {
    this.bus.$on('state:update', ({ namespace, key, value, timestamp }) => {
      const fullKey = `${namespace}:${key}`

      // Update reactive state
      this.state[fullKey] = value

      // Trigger subscriptions
      const callbacks = this.subscriptions.get(fullKey) || []
      callbacks.forEach(cb => cb(value))
    })
  }
}
```

### Micro-App Usage

```javascript
// In micro-app main.js or composable
import { ref, onUnmounted } from 'vue'

export function useSharedState(namespace, key, defaultValue) {
  const state = ref(defaultValue)
  const bus = window.$wujie?.bus

  if (!bus) {
    console.warn('[SharedState] Wujie bus not available')
    return { state }
  }

  // Subscribe to updates
  const listener = (payload) => {
    if (payload.namespace === namespace && payload.key === key) {
      state.value = payload.value
    }
  }
  bus.$on('state:update', listener)

  // Request initial value
  bus.$emit('state:get', { namespace, key })

  // Cleanup on unmount
  onUnmounted(() => {
    bus.$off('state:update', listener)
    bus.$emit('state:unsubscribe', { namespace, key, appName: 'micro-app' })
  })

  // Method to update state
  const setState = (value) => {
    state.value = value
    bus.$emit('state:update', {
      namespace,
      key,
      value,
      timestamp: Date.now()
    })
  }

  return { state, setState }
}
```

**Usage Example**:

```vue
<script setup>
import { useSharedState } from '@/composables/useSharedState'

const { state: userInfo, setState: setUserInfo } = useSharedState('user', 'info', {})

function updateAvatar(newAvatar) {
  setUserInfo({ ...userInfo.value, avatar: newAvatar })
}
</script>

<template>
  <img :src="userInfo.avatar" />
</template>
```

---

## Common Use Cases

### 1. User Info Synchronization

```javascript
// System app: User updates profile
const updateProfile = async (newProfile) => {
  await api.updateProfile(newProfile)
  sharedStateManager.setState('user', 'info', newProfile)
}

// Dashboard app: Avatar updates automatically
const { state: userInfo } = useSharedState('user', 'info', {})
// userInfo is reactive, components re-render when updated
```

### 2. Notification Count Sync

```javascript
// Main app: Receives new notification via WebSocket
socket.on('notification', (data) => {
  const currentCount = sharedStateManager.getState('notification', 'unreadCount') || 0
  sharedStateManager.setState('notification', 'unreadCount', currentCount + 1)
})

// All micro-apps: Badge updates automatically
const { state: unreadCount } = useSharedState('notification', 'unreadCount', 0)
```

### 3. Permission Changes

```javascript
// Admin app: Changes user role
const changeRole = async (userId, newRoles) => {
  await api.updateUserRoles(userId, newRoles)

  if (userId === currentUser.id) {
    sharedStateManager.setState('permission', 'roleChanged', {
      userId,
      newRoles,
      timestamp: Date.now()
    })
  }
}

// All apps: Menu visibility updates
const { state: roleChanged } = useSharedState('permission', 'roleChanged', null)
watch(roleChanged, (change) => {
  if (change) {
    // Reload menu or update UI permissions
    location.reload() // or dynamic menu update
  }
})
```

---

## Conflict Resolution Strategy

**Default Strategy**: Last Write Wins (LWW)

When multiple apps update the same state simultaneously:

1. Use `timestamp` to determine order
2. Latest timestamp overwrites earlier values
3. Optional `version` field for optimistic locking

**Example**:

```javascript
// App A updates at T1
setState('user', 'preferences', { theme: 'dark' }) // timestamp: 1000

// App B updates at T2 (later)
setState('user', 'preferences', { theme: 'light' }) // timestamp: 1001

// Result: App B wins, final state is { theme: 'light' }
```

**Conflict Logging**:

```javascript
if (existingTimestamp && newTimestamp < existingTimestamp) {
  console.warn('[SharedState] Late write detected, discarding', {
    namespace,
    key,
    existing: existingTimestamp,
    new: newTimestamp
  })
  // Optionally emit conflict event
  bus.$emit('state:conflict', { namespace, key, timestamps: [existingTimestamp, newTimestamp] })
}
```

---

## LocalStorage Persistence (Optional)

For state that should survive page reloads:

```javascript
const PERSIST_NAMESPACES = ['user', 'system']

setState(namespace, key, value) {
  // ... emit event ...

  // Persist to localStorage if in whitelist
  if (PERSIST_NAMESPACES.includes(namespace)) {
    const storageKey = `shared_state_${namespace}_${key}`
    localStorage.setItem(storageKey, JSON.stringify(value))
  }
}

// On app load, restore from localStorage
PERSIST_NAMESPACES.forEach(namespace => {
  Object.keys(localStorage).forEach(storageKey => {
    if (storageKey.startsWith(`shared_state_${namespace}_`)) {
      const key = storageKey.replace(`shared_state_${namespace}_`, '')
      const value = JSON.parse(localStorage.getItem(storageKey))
      this.state[`${namespace}:${key}`] = value
    }
  })
})
```

---

## Testing

### Unit Tests

```javascript
describe('SharedStateManager', () => {
  it('should emit state:update event on setState', () => {
    const bus = { $emit: vi.fn(), $on: vi.fn() }
    const manager = new SharedStateManager(bus)

    manager.setState('user', 'info', { id: 123 })

    expect(bus.$emit).toHaveBeenCalledWith('state:update', {
      namespace: 'user',
      key: 'info',
      value: { id: 123 },
      timestamp: expect.any(Number)
    })
  })

  it('should trigger subscriptions on state update', () => {
    const manager = new SharedStateManager()
    const callback = vi.fn()

    manager.subscribe('user', 'info', callback)
    manager.setState('user', 'info', { id: 456 })

    expect(callback).toHaveBeenCalledWith({ id: 456 })
  })
})
```

### E2E Tests

```javascript
test('state sync across micro-apps', async ({ page, context }) => {
  // Open main app
  await page.goto('http://localhost:3000/system/profile')

  // Update user avatar
  await page.fill('[name="avatar"]', '/new-avatar.png')
  await page.click('button:has-text("保存")')

  // Open second tab with dashboard
  const dashboard = await context.newPage()
  await dashboard.goto('http://localhost:3000/dashboard')

  // Verify avatar updated in dashboard
  await expect(dashboard.locator('img.user-avatar')).toHaveAttribute('src', '/new-avatar.png')
})
```

---

## Performance Considerations

**Throttling**: For high-frequency updates (e.g., mouse positions), use throttling:

```javascript
let throttleTimer = null
const throttledSetState = (namespace, key, value) => {
  if (throttleTimer) return
  throttleTimer = setTimeout(() => {
    sharedStateManager.setState(namespace, key, value)
    throttleTimer = null
  }, 100) // Max 10 updates/sec
}
```

**Memory Limits**: Limit stored state size:

```javascript
const MAX_STATE_SIZE = 1024 * 1024 // 1MB
const stateSize = JSON.stringify(this.state).length
if (stateSize > MAX_STATE_SIZE) {
  console.error('[SharedState] State size exceeded limit')
  // Implement eviction policy (LRU, etc.)
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-09 | Initial state event protocol |

## References

- [Vue Reactivity API](https://vuejs.org/api/reactivity-core.html)
- [Wujie Communication](https://wujie-micro.github.io/doc/guide/communication.html)
- [Pinia State Management](https://pinia.vuejs.org/)
