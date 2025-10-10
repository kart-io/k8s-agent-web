# Route Event Protocol Specification

**Version**: 1.0.0
**Date**: 2025-10-09
**Status**: Draft

## Overview

This document defines the standardized event protocol for route synchronization between the main application and micro-applications in the K8s Agent Web system using Wujie's event bus.

## Event Bus Architecture

**Event Bus Provider**: Wujie (`wujie-vue3`)
**Access Pattern**:
- Main app: `WujieVue.bus`
- Micro-apps: `window.$wujie.bus`

**Event Naming Convention**: `route:{action}`

## Event Types

### 1. route:sync

**Direction**: Main App → Micro-App
**Purpose**: Notify target micro-app to navigate to a specific route
**Emitter**: Main app `RouteSync` class
**Listener**: Micro-app `RouteSync` listener

**Payload**:

```typescript
{
  type: 'sync',
  sourceApp: string,      // Always 'main-app'
  targetApp: string,      // Target micro-app name (e.g., 'system-app')
  path: string,           // Relative path within micro-app (e.g., '/users')
  fullPath: string,       // Complete path from main app (e.g., '/system/users?page=1')
  meta: {
    title?: string,       // Page title for breadcrumb/tab
    requiresAuth?: boolean,
    [key: string]: any    // Additional route meta
  },
  timestamp: number       // Unix timestamp in milliseconds
}
```

**Example**:

```javascript
// Main app emits
bus.$emit('route:sync', {
  type: 'sync',
  sourceApp: 'main-app',
  targetApp: 'system-app',
  path: '/users',
  fullPath: '/system/users?page=1&sort=name',
  meta: {
    title: '用户管理',
    requiresAuth: true,
    icon: 'UserOutlined'
  },
  timestamp: 1696834567890
})

// Micro-app receives and navigates
window.$wujie.bus.$on('route:sync', (payload) => {
  if (payload.targetApp === 'system-app') {
    router.push(payload.path)
  }
})
```

**Behavior**:
- Micro-app MUST check `targetApp` matches its own name before processing
- Micro-app MUST ignore duplicate paths (compare with current route)
- Navigation errors MUST emit `route:error` event
- Debounce: Maximum one sync per 50ms per micro-app

---

### 2. route:report

**Direction**: Micro-App → Main App
**Purpose**: Report internal route changes to main app for URL sync and breadcrumb updates
**Emitter**: Micro-app `RouteSync` class
**Listener**: Main app (optional, for telemetry/logging)

**Payload**:

```typescript
{
  type: 'report',
  sourceApp: string,      // Micro-app name (e.g., 'system-app')
  targetApp: 'main-app',  // Always 'main-app'
  path: string,           // Micro-app internal path (e.g., '/users/123')
  fullPath: string,       // Complete path (e.g., '/system/users/123?tab=profile')
  meta: {
    title?: string,       // Page title
    breadcrumb?: string[], // Breadcrumb trail
    [key: string]: any
  },
  timestamp: number
}
```

**Example**:

```javascript
// Micro-app emits after navigation
window.$wujie.bus.$emit('route:report', {
  type: 'report',
  sourceApp: 'system-app',
  targetApp: 'main-app',
  path: '/users/123',
  fullPath: '/system/users/123?tab=profile',
  meta: {
    title: '用户详情 - 张三',
    breadcrumb: ['系统管理', '用户管理', '用户详情']
  },
  timestamp: 1696834568000
})

// Main app updates browser URL and breadcrumb (optional)
WujieVue.bus.$on('route:report', (payload) => {
  // Update main app router or breadcrumb component
})
```

**Behavior**:
- Micro-app SHOULD emit after `router.afterEach()` hook
- Main app MAY ignore reports (optional listener)
- Used for analytics, logging, or breadcrumb synchronization

---

### 3. route:error

**Direction**: Bidirectional (Main App ↔ Micro-App)
**Purpose**: Report route synchronization or navigation failures
**Emitter**: Either main app or micro-app `RouteSync` class
**Listener**: Monitoring/logging service

**Payload**:

```typescript
{
  type: 'error',
  sourceApp: string,      // App where error occurred
  targetApp?: string,     // Intended target (if applicable)
  path: string,           // Attempted path
  fullPath: string,       // Full attempted path
  error: {
    code: string,         // Error code (see Error Codes below)
    message: string,      // Human-readable error message
    stack?: string        // Stack trace (if available)
  },
  timestamp: number
}
```

**Error Codes**:

| Code | Description | Cause |
|------|-------------|-------|
| `APP_NOT_LOADED` | Target micro-app not loaded | Wujie hasn't mounted the app yet |
| `NAVIGATION_CANCELLED` | Vue Router navigation cancelled | Navigation guard rejected |
| `INVALID_PATH` | Path doesn't match any route | 404 or malformed path |
| `BUS_UNAVAILABLE` | Event bus not accessible | Wujie not initialized |
| `TIMEOUT` | Navigation timeout | Network issues or slow app |

**Example**:

```javascript
// Micro-app emits error
window.$wujie.bus.$emit('route:error', {
  type: 'error',
  sourceApp: 'cluster-app',
  targetApp: 'main-app',
  path: '/invalid-route',
  fullPath: '/clusters/invalid-route',
  error: {
    code: 'INVALID_PATH',
    message: 'Route not found: /invalid-route',
    stack: 'Error: Route not found...'
  },
  timestamp: 1696834569000
})
```

**Behavior**:
- Errors MUST NOT block navigation in other apps
- Main app MAY display toast notification for errors
- Errors SHOULD be logged to monitoring service
- No retry attempts on error (caller decides retry logic)

---

## Implementation Guidelines

### Main App RouteSync Class

```javascript
import WujieVue from 'wujie-vue3'

export class RouteSync {
  constructor(router) {
    this.router = router
    this.bus = WujieVue.bus
    this.debounceTimers = new Map()
  }

  notifyMicroApp(targetApp, path, meta = {}) {
    // Debounce logic
    if (this.debounceTimers.has(targetApp)) {
      clearTimeout(this.debounceTimers.get(targetApp))
    }

    this.debounceTimers.set(targetApp, setTimeout(() => {
      this.bus.$emit('route:sync', {
        type: 'sync',
        sourceApp: 'main-app',
        targetApp,
        path,
        fullPath: this.router.currentRoute.value.fullPath,
        meta,
        timestamp: Date.now()
      })
      this.debounceTimers.delete(targetApp)
    }, 50))
  }
}
```

### Micro-App RouteSync Class

```javascript
export class RouteSync {
  constructor(appName, router, bus) {
    this.appName = appName
    this.router = router
    this.bus = bus
    this.lastPath = null
  }

  setupListener() {
    this.bus.$on('route:sync', (payload) => {
      if (payload.targetApp !== this.appName) return
      if (payload.path === this.lastPath) return

      this.lastPath = payload.path
      this.router.push(payload.path).catch((err) => {
        this.bus.$emit('route:error', {
          type: 'error',
          sourceApp: this.appName,
          path: payload.path,
          fullPath: payload.fullPath,
          error: {
            code: 'NAVIGATION_CANCELLED',
            message: err.message,
            stack: err.stack
          },
          timestamp: Date.now()
        })
      })
    })
  }

  reportNavigation(to) {
    this.bus.$emit('route:report', {
      type: 'report',
      sourceApp: this.appName,
      targetApp: 'main-app',
      path: to.path,
      fullPath: to.fullPath,
      meta: { title: to.meta.title },
      timestamp: Date.now()
    })
  }
}
```

---

## Migration from Legacy Pattern

### Old Pattern (Deprecated)

```javascript
// Main app (MicroAppContainer.vue)
bus.$emit(`${appName}-route-change`, subPath)

// Micro-app (main.js)
window.$wujie.bus.$on('system-app-route-change', (subPath) => {
  router.push(subPath)
})
```

**Issues**:
- Event name coupling (requires string interpolation)
- No metadata support
- No error handling
- Requires setTimeout delays

### New Pattern (Recommended)

```javascript
// Main app
routeSync.notifyMicroApp('system-app', '/users', { title: '用户管理' })

// Micro-app
routeSync.setupListener()
```

**Benefits**:
- Standardized event names
- Type-safe payloads
- Built-in error handling
- No delays required (debounced internally)

---

## Testing

### Unit Tests

```javascript
describe('RouteSync', () => {
  it('should emit route:sync event with correct payload', () => {
    const bus = { $emit: vi.fn() }
    const sync = new RouteSync('main-app', mockRouter, bus)

    sync.notifyMicroApp('system-app', '/users')

    expect(bus.$emit).toHaveBeenCalledWith('route:sync', {
      type: 'sync',
      sourceApp: 'main-app',
      targetApp: 'system-app',
      path: '/users',
      fullPath: expect.any(String),
      meta: {},
      timestamp: expect.any(Number)
    })
  })
})
```

### E2E Tests (Playwright)

```javascript
test('route sync between main and micro-app', async ({ page }) => {
  await page.goto('http://localhost:3000')

  // Navigate via main app menu
  await page.click('text=系统管理')
  await page.click('text=用户管理')

  // Verify micro-app URL updated
  await expect(page).toHaveURL('/system/users')

  // Verify micro-app content rendered
  await expect(page.locator('h1')).toContainText('用户管理')
})
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-09 | Initial protocol specification |

## References

- [Wujie Event Communication](https://wujie-micro.github.io/doc/guide/communication.html)
- [Vue Router Navigation](https://router.vuejs.org/guide/essentials/navigation.html)
- [K8s Agent Web Architecture](../../WUJIE_MIGRATION_COMPLETE.md)
