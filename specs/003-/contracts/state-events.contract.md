# Contract: 状态同步事件契约

**Version**: 1.0.0
**Created**: 2025-10-10
**Owner**: Feature 003 - 项目结构优化

## Purpose

定义主应用与微应用之间的状态同步事件协议，确保跨应用状态共享的一致性。基于`SharedStateManager`类实现标准化状态同步。

---

## 1. 事件协议

### 1.1 状态更新事件

**事件名称**: `state:update`

**发送方**: 任何应用(主应用或微应用)

**接收方**: 所有应用

**载荷格式**:

```typescript
interface StateSyncEventPayload {
  /** 命名空间 */
  namespace: 'user' | 'notification' | 'permission' | 'system';

  /** 状态键名 */
  key: string;

  /** 状态值 */
  value: any;

  /** 事件时间戳 */
  timestamp: number;

  /** 发送方应用名称(可选) */
  sourceApp?: string;
}
```

**示例**:

```javascript
// 更新用户头像
bus.$emit('state:update', {
  namespace: 'user',
  key: 'info',
  value: { id: 123, username: 'admin', avatar: '/new-avatar.png' },
  timestamp: Date.now(),
  sourceApp: 'system-app'
})

// 更新通知数量
bus.$emit('state:update', {
  namespace: 'notification',
  key: 'unreadCount',
  value: 5,
  timestamp: Date.now()
})
```

---

## 2. 标准命名空间

### 2.1 user命名空间

**用途**: 用户相关状态(个人信息、偏好设置)

**持久化**: ✅ localStorage

**标准键**:

| Key | Type | Description |
|-----|------|-------------|
| `info` | `UserInfo` | 用户基本信息(id, username, avatar等) |
| `preferences` | `Object` | 用户偏好设置(theme, language等) |
| `authStatus` | `boolean` | 认证状态 |

**示例**:

```javascript
// 更新用户信息
setState('user', 'info', {
  id: 123,
  username: 'admin',
  displayName: '管理员',
  avatar: '/avatar.png'
})

// 更新偏好设置
setState('user', 'preferences', {
  theme: 'dark',
  language: 'zh-CN'
})
```

### 2.2 notification命名空间

**用途**: 通知相关状态

**持久化**: ❌ 内存

**标准键**:

| Key | Type | Description |
|-----|------|-------------|
| `unreadCount` | `number` | 未读通知数量 |
| `latestNotifications` | `Array` | 最新通知列表(最多10条) |

**示例**:

```javascript
setState('notification', 'unreadCount', 3)
setState('notification', 'latestNotifications', [
  { id: 1, title: '系统更新', time: '2025-10-10 10:00' },
  { id: 2, title: '新消息', time: '2025-10-10 09:30' }
])
```

### 2.3 permission命名空间

**用途**: 权限相关状态

**持久化**: ❌ 内存

**标准键**:

| Key | Type | Description |
|-----|------|-------------|
| `roles` | `string[]` | 用户角色列表 |
| `permissions` | `string[]` | 用户权限列表 |

**示例**:

```javascript
setState('permission', 'roles', ['admin', 'developer'])
setState('permission', 'permissions', ['user:read', 'user:write', 'system:manage'])
```

### 2.4 system命名空间

**用途**: 全局系统状态

**持久化**: ✅ localStorage

**标准键**:

| Key | Type | Description |
|-----|------|-------------|
| `theme` | `'light' \| 'dark'` | 主题模式 |
| `language` | `string` | 界面语言 |
| `sidebarCollapsed` | `boolean` | 侧边栏折叠状态 |

**示例**:

```javascript
setState('system', 'theme', 'dark')
setState('system', 'language', 'zh-CN')
setState('system', 'sidebarCollapsed', true)
```

---

## 3. SharedStateManager类接口

### 3.1 导出路径

**主应用文件**: `main-app/src/store/shared-state.js`

**Composable**: `shared/src/composables/useSharedState.js`

```javascript
// 主应用
export class SharedStateManager {
  constructor(bus);
  setState(namespace, key, value);
  getState(namespace, key);
  subscribe(namespace, key, callback);
  unsubscribe(callback);
}

// Composable(微应用使用)
export function useSharedState(namespace, key, defaultValue) {
  return {
    state: Ref,
    setState: Function
  }
}
```

### 3.2 类型定义

```typescript
class SharedStateManager {
  /**
   * 构造函数
   * @param bus - Wujie EventBus
   */
  constructor(bus: EventBus);

  /**
   * 设置共享状态
   * @param namespace - 命名空间
   * @param key - 状态键
   * @param value - 状态值
   */
  setState(
    namespace: string,
    key: string,
    value: any
  ): void;

  /**
   * 获取共享状态
   * @param namespace - 命名空间
   * @param key - 状态键
   * @returns 状态值
   */
  getState(
    namespace: string,
    key: string
  ): any;

  /**
   * 订阅状态变化
   * @param namespace - 命名空间
   * @param key - 状态键
   * @param callback - 回调函数
   */
  subscribe(
    namespace: string,
    key: string,
    callback: (value: any) => void
  ): void;

  /**
   * 取消订阅
   * @param callback - 回调函数
   */
  unsubscribe(callback: Function): void;
}

// Composable返回类型
interface UseSharedStateReturn<T> {
  /** 响应式状态 */
  state: Ref<T>;

  /** 更新状态函数 */
  setState: (value: T) => void;
}
```

---

## 4. 主应用集成

### 4.1 SharedStateManager实现

```javascript
// main-app/src/store/shared-state.js
import { reactive } from 'vue'

export class SharedStateManager {
  constructor(bus) {
    this.bus = bus
    this.store = reactive({})
    this.listeners = new Map()

    // 监听状态更新事件
    this.bus.$on('state:update', this.handleStateUpdate.bind(this))

    // 从localStorage恢复持久化状态
    this.restorePersistedState()
  }

  /**
   * 设置状态
   */
  setState(namespace, key, value) {
    if (!this.store[namespace]) {
      this.store[namespace] = reactive({})
    }

    this.store[namespace][key] = value

    // 持久化到localStorage(仅user和system命名空间)
    if (['user', 'system'].includes(namespace)) {
      this.persistState(namespace, key, value)
    }

    // 广播状态更新事件
    this.bus.$emit('state:update', {
      namespace,
      key,
      value,
      timestamp: Date.now(),
      sourceApp: 'main-app'
    })

    // 通知订阅者
    this.notifyListeners(namespace, key, value)
  }

  /**
   * 获取状态
   */
  getState(namespace, key) {
    return this.store[namespace]?.[key]
  }

  /**
   * 订阅状态变化
   */
  subscribe(namespace, key, callback) {
    const listenerKey = `${namespace}.${key}`
    if (!this.listeners.has(listenerKey)) {
      this.listeners.set(listenerKey, [])
    }
    this.listeners.get(listenerKey).push(callback)
  }

  /**
   * 取消订阅
   */
  unsubscribe(callback) {
    for (const [key, callbacks] of this.listeners) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 处理状态更新事件(来自微应用)
   */
  handleStateUpdate(payload) {
    const { namespace, key, value, sourceApp } = payload

    // 如果是自己发送的,忽略(避免循环)
    if (sourceApp === 'main-app') return

    // 更新本地store(不再触发事件)
    if (!this.store[namespace]) {
      this.store[namespace] = reactive({})
    }
    this.store[namespace][key] = value

    // 持久化
    if (['user', 'system'].includes(namespace)) {
      this.persistState(namespace, key, value)
    }

    // 通知订阅者
    this.notifyListeners(namespace, key, value)
  }

  /**
   * 通知订阅者
   */
  notifyListeners(namespace, key, value) {
    const listenerKey = `${namespace}.${key}`
    const callbacks = this.listeners.get(listenerKey) || []
    callbacks.forEach(cb => cb(value))
  }

  /**
   * 持久化状态
   */
  persistState(namespace, key, value) {
    const storageKey = `shared_state:${namespace}.${key}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch (error) {
      console.error('[SharedState] Failed to persist state:', error)
    }
  }

  /**
   * 恢复持久化状态
   */
  restorePersistedState() {
    const persistedNamespaces = ['user', 'system']

    persistedNamespaces.forEach(namespace => {
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith(`shared_state:${namespace}.`)) {
          const key = storageKey.replace(`shared_state:${namespace}.`, '')
          try {
            const value = JSON.parse(localStorage.getItem(storageKey))
            if (!this.store[namespace]) {
              this.store[namespace] = reactive({})
            }
            this.store[namespace][key] = value
          } catch (error) {
            console.error('[SharedState] Failed to restore state:', storageKey, error)
          }
        }
      })
    })
  }
}
```

### 4.2 在main.js中初始化

```javascript
// main-app/src/main.js
import { createApp } from 'vue'
import WujieVue from 'wujie-vue3'
import { SharedStateManager } from '@/store/shared-state'
import App from './App.vue'

const app = createApp(App)

app.use(WujieVue)

// 初始化SharedStateManager
const sharedStateManager = new SharedStateManager(window.WujieVue.bus)

// 通过provide注入到所有组件
app.provide('sharedState', sharedStateManager)

app.mount('#app')
```

---

## 5. 微应用集成

### 5.1 useSharedState Composable

```javascript
// shared/src/composables/useSharedState.js
import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * 使用共享状态
 * @param {string} namespace - 命名空间
 * @param {string} key - 状态键
 * @param {*} defaultValue - 默认值
 * @returns {{ state: Ref, setState: Function }}
 */
export function useSharedState(namespace, key, defaultValue = null) {
  const state = ref(defaultValue)

  // 检查Wujie环境
  if (!window.$wujie?.bus) {
    console.warn('[useSharedState] Not in Wujie environment')
    return {
      state,
      setState: (value) => { state.value = value }
    }
  }

  const bus = window.$wujie.bus

  /**
   * 更新状态
   */
  const setState = (value) => {
    state.value = value

    // 广播状态更新
    bus.$emit('state:update', {
      namespace,
      key,
      value,
      timestamp: Date.now(),
      sourceApp: window.$wujie.id // 微应用名称
    })
  }

  /**
   * 监听状态更新
   */
  const handleUpdate = (payload) => {
    if (payload.namespace === namespace && payload.key === key) {
      // 如果是自己发送的,忽略
      if (payload.sourceApp === window.$wujie.id) return

      state.value = payload.value
    }
  }

  onMounted(() => {
    bus.$on('state:update', handleUpdate)

    // 请求初始状态(从主应用)
    bus.$emit('state:request', { namespace, key })
  })

  onBeforeUnmount(() => {
    bus.$off('state:update', handleUpdate)
  })

  return {
    state,
    setState
  }
}
```

### 5.2 在微应用中使用

```vue
<!-- system-app/src/views/UserProfile.vue -->
<template>
  <div class="user-profile">
    <a-avatar :src="userInfo.avatar" />
    <span>{{ userInfo.username }}</span>

    <a-button @click="updateAvatar">
      更换头像
    </a-button>
  </div>
</template>

<script setup>
import { useSharedState } from '@k8s-agent/shared/composables'

// ✅ 使用共享状态
const { state: userInfo, setState: setUserInfo } = useSharedState('user', 'info', {
  username: '',
  avatar: ''
})

async function updateAvatar() {
  const newAvatar = await uploadAvatar() // 上传头像

  // ✅ 更新共享状态(自动同步到所有应用)
  setUserInfo({
    ...userInfo.value,
    avatar: newAvatar
  })
}
</script>
```

### 5.3 跨应用状态同步示例

**场景**: 用户在system-app中更新头像,dashboard-app的用户信息自动更新

**system-app**:

```javascript
// system-app/src/views/UserSettings.vue
const { state: userInfo, setState: setUserInfo } = useSharedState('user', 'info', {})

async function updateProfile(newData) {
  // 更新后端
  await api.put('/user/profile', newData)

  // ✅ 更新共享状态
  setUserInfo({
    ...userInfo.value,
    ...newData
  })
}
```

**dashboard-app** (自动接收更新):

```vue
<!-- dashboard-app/src/components/UserCard.vue -->
<template>
  <div class="user-card">
    <!-- ✅ 头像自动更新 -->
    <a-avatar :src="userInfo.avatar" />
    <span>{{ userInfo.username }}</span>
  </div>
</template>

<script setup>
import { useSharedState } from '@k8s-agent/shared/composables'

// ✅ 监听共享状态,自动响应变化
const { state: userInfo } = useSharedState('user', 'info', {})
</script>
```

**流程**:

```
system-app: setUserInfo({ avatar: '/new.png' })
  ↓
Emit: bus.$emit('state:update', { namespace: 'user', key: 'info', value: {...} })
  ↓
main-app: handleStateUpdate() → update local store
  ↓
dashboard-app: handleUpdate() → state.value = payload.value
  ↓
dashboard-app: UserCard re-renders with new avatar ✅
```

---

## 6. 状态初始化请求协议

### 6.1 状态请求事件

**事件名称**: `state:request`

**发送方**: 微应用(首次挂载时)

**接收方**: 主应用

**载荷格式**:

```typescript
interface StateRequestPayload {
  namespace: string;
  key: string;
  requestId?: string; // 可选的请求ID
}
```

**主应用响应**:

```javascript
// main-app/src/main.js
sharedStateManager.bus.$on('state:request', (payload) => {
  const { namespace, key } = payload
  const value = sharedStateManager.getState(namespace, key)

  // 发送当前状态
  sharedStateManager.bus.$emit('state:update', {
    namespace,
    key,
    value,
    timestamp: Date.now(),
    sourceApp: 'main-app'
  })
})
```

---

## 7. 持久化规范

### 7.1 localStorage键名格式

**格式**: `shared_state:{namespace}.{key}`

**示例**:

```
shared_state:user.info
shared_state:user.preferences
shared_state:system.theme
shared_state:system.language
```

### 7.2 持久化命名空间

| Namespace | 持久化 | 原因 |
|-----------|--------|------|
| `user` | ✅ Yes | 用户信息需要跨会话保持 |
| `system` | ✅ Yes | 系统设置(主题、语言)需要保持 |
| `notification` | ❌ No | 通知是临时状态 |
| `permission` | ❌ No | 权限应从后端重新获取 |

### 7.3 持久化清理

**时机**: 用户登出时清理所有持久化状态

```javascript
// main-app/src/store/user.js
export const userStore = defineStore('user', {
  actions: {
    async logout() {
      // 清理localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('shared_state:')) {
          localStorage.removeItem(key)
        }
      })

      // 清理SharedStateManager
      sharedStateManager.store.user = {}
      sharedStateManager.store.system = {}

      // 跳转登录页
      router.push('/login')
    }
  }
})
```

---

## 8. 测试契约

### 8.1 单元测试

```javascript
import { describe, it, expect, vi } from 'vitest'
import { SharedStateManager } from '@/store/shared-state'

describe('SharedStateManager', () => {
  it('should set and get state', () => {
    const mockBus = {
      $on: vi.fn(),
      $emit: vi.fn()
    }

    const manager = new SharedStateManager(mockBus)

    manager.setState('user', 'info', { id: 123 })

    expect(manager.getState('user', 'info')).toEqual({ id: 123 })
  })

  it('should emit state:update event when setState', () => {
    const mockBus = {
      $on: vi.fn(),
      $emit: vi.fn()
    }

    const manager = new SharedStateManager(mockBus)

    manager.setState('notification', 'unreadCount', 5)

    expect(mockBus.$emit).toHaveBeenCalledWith('state:update', {
      namespace: 'notification',
      key: 'unreadCount',
      value: 5,
      timestamp: expect.any(Number),
      sourceApp: 'main-app'
    })
  })

  it('should notify subscribers when state changes', () => {
    const mockBus = {
      $on: vi.fn(),
      $emit: vi.fn()
    }

    const manager = new SharedStateManager(mockBus)
    const callback = vi.fn()

    manager.subscribe('user', 'info', callback)
    manager.setState('user', 'info', { id: 456 })

    expect(callback).toHaveBeenCalledWith({ id: 456 })
  })

  it('should persist user and system namespaces to localStorage', () => {
    const mockBus = {
      $on: vi.fn(),
      $emit: vi.fn()
    }

    const manager = new SharedStateManager(mockBus)

    manager.setState('user', 'preferences', { theme: 'dark' })

    expect(localStorage.getItem('shared_state:user.preferences')).toBe(
      JSON.stringify({ theme: 'dark' })
    )
  })

  it('should NOT persist notification namespace', () => {
    const mockBus = {
      $on: vi.fn(),
      $emit: vi.fn()
    }

    const manager = new SharedStateManager(mockBus)

    manager.setState('notification', 'unreadCount', 3)

    expect(localStorage.getItem('shared_state:notification.unreadCount')).toBeNull()
  })

  it('should restore persisted state on initialization', () => {
    localStorage.setItem('shared_state:system.theme', JSON.stringify('dark'))

    const mockBus = {
      $on: vi.fn(),
      $emit: vi.fn()
    }

    const manager = new SharedStateManager(mockBus)

    expect(manager.getState('system', 'theme')).toBe('dark')
  })
})
```

### 8.2 useSharedState Composable测试

```javascript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useSharedState } from '@k8s-agent/shared/composables'

describe('useSharedState', () => {
  it('should return reactive state', () => {
    window.$wujie = {
      bus: {
        $on: vi.fn(),
        $off: vi.fn(),
        $emit: vi.fn()
      },
      id: 'test-app'
    }

    const { state, setState } = useSharedState('user', 'info', { username: 'test' })

    expect(state.value).toEqual({ username: 'test' })

    setState({ username: 'updated' })

    expect(state.value).toEqual({ username: 'updated' })
  })

  it('should emit state:update when setState called', () => {
    const mockEmit = vi.fn()

    window.$wujie = {
      bus: {
        $on: vi.fn(),
        $off: vi.fn(),
        $emit: mockEmit
      },
      id: 'test-app'
    }

    const { setState } = useSharedState('user', 'info', {})

    setState({ id: 123 })

    expect(mockEmit).toHaveBeenCalledWith('state:update', {
      namespace: 'user',
      key: 'info',
      value: { id: 123 },
      timestamp: expect.any(Number),
      sourceApp: 'test-app'
    })
  })

  it('should update state when receiving state:update event', async () => {
    let updateHandler

    window.$wujie = {
      bus: {
        $on: vi.fn((event, handler) => {
          if (event === 'state:update') {
            updateHandler = handler
          }
        }),
        $off: vi.fn(),
        $emit: vi.fn()
      },
      id: 'test-app'
    }

    const { state } = useSharedState('user', 'info', { username: 'initial' })

    // 模拟接收到状态更新
    updateHandler({
      namespace: 'user',
      key: 'info',
      value: { username: 'updated' },
      sourceApp: 'other-app'
    })

    expect(state.value).toEqual({ username: 'updated' })
  })
})
```

---

## 9. 性能优化

### 9.1 批量更新

对于需要同时更新多个状态的场景,使用批量更新API：

```javascript
// SharedStateManager中添加batchSetState方法
batchSetState(updates) {
  updates.forEach(({ namespace, key, value }) => {
    if (!this.store[namespace]) {
      this.store[namespace] = reactive({})
    }
    this.store[namespace][key] = value

    if (['user', 'system'].includes(namespace)) {
      this.persistState(namespace, key, value)
    }
  })

  // 批量广播(减少事件数量)
  this.bus.$emit('state:batch-update', {
    updates,
    timestamp: Date.now(),
    sourceApp: 'main-app'
  })
}

// 使用示例
manager.batchSetState([
  { namespace: 'user', key: 'info', value: {...} },
  { namespace: 'user', key: 'preferences', value: {...} },
  { namespace: 'system', key: 'theme', value: 'dark' }
])
```

### 9.2 状态去重

防止相同值重复触发更新：

```javascript
setState(namespace, key, value) {
  const currentValue = this.getState(namespace, key)

  // ✅ 深度比较,避免无意义的更新
  if (JSON.stringify(currentValue) === JSON.stringify(value)) {
    console.log(`[SharedState] Skipped duplicate update: ${namespace}.${key}`)
    return
  }

  // ... 正常更新逻辑
}
```

---

## 10. 验收标准

- [ ] `SharedStateManager`类正确导出并可用
- [ ] `useSharedState` composable在微应用中可用
- [ ] 4个标准命名空间(user/notification/permission/system)定义完整
- [ ] user和system命名空间状态正确持久化到localStorage
- [ ] notification和permission命名空间不持久化
- [ ] 跨应用状态同步实时生效(延迟<100ms)
- [ ] 登出时正确清理所有持久化状态
- [ ] 单元测试覆盖率≥90%
- [ ] E2E测试验证跨应用状态同步

---

**签署**:
- 开发团队: ___________
- 审核人: ___________
- 日期: 2025-10-10
