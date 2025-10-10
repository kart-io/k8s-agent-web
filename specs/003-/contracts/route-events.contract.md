# Contract: 路由同步事件契约

**Version**: 1.0.0
**Created**: 2025-10-10
**Owner**: Feature 003 - 项目结构优化

## Purpose

定义主应用与微应用之间的路由同步事件协议，确保所有6个微应用的路由同步行为一致。基于`RouteSync`类实现标准化路由同步。

---

## 1. 事件协议

### 1.1 路由同步事件

**事件名称**: `${targetApp}-route-change`

**发送方**: 主应用(main-app)

**接收方**: 对应的微应用

**载荷格式**:

```typescript
interface RouteSyncEventPayload {
  /** 事件类型 */
  type: 'sync';

  /** 源应用名称(固定为'main-app') */
  sourceApp: 'main-app';

  /** 目标应用名称 */
  targetApp: string; // 例: 'system-app'

  /** 目标路径(去除basePath后的子路径) */
  path: string; // 例: '/users'

  /** 完整路径(包含query和hash) */
  fullPath: string; // 例: '/users?page=1#list'

  /** 路由元信息 */
  meta?: {
    title?: string;
    [key: string]: any;
  };

  /** 事件时间戳 */
  timestamp: number;
}
```

**示例**:

```javascript
// 主应用发送
bus.$emit('system-app-route-change', {
  type: 'sync',
  sourceApp: 'main-app',
  targetApp: 'system-app',
  path: '/users',
  fullPath: '/users?page=1',
  meta: { title: '用户管理' },
  timestamp: 1728551234567
})
```

### 1.2 路由上报事件

**事件名称**: `route:report`

**发送方**: 微应用

**接收方**: 主应用

**载荷格式**:

```typescript
interface RouteReportEventPayload {
  /** 事件类型 */
  type: 'report';

  /** 源应用名称(微应用名称) */
  sourceApp: string; // 例: 'system-app'

  /** 目标应用(固定为'main-app') */
  targetApp: 'main-app';

  /** 当前路径 */
  path: string;

  /** 完整路径 */
  fullPath: string;

  /** 事件时间戳 */
  timestamp: number;
}
```

**用途**: 微应用主动上报路由变化(可选，用于调试)

### 1.3 路由错误事件

**事件名称**: `route:error`

**发送方**: RouteSync类

**接收方**: 错误监控系统

**载荷格式**:

```typescript
interface RouteErrorEventPayload {
  /** 事件类型 */
  type: 'error';

  /** 应用名称 */
  appName: string;

  /** 错误消息 */
  error: string;

  /** 目标路径 */
  path: string;

  /** 事件时间戳 */
  timestamp: number;
}
```

---

## 2. RouteSync类接口

### 2.1 导出路径

**文件**: `shared/src/core/route-sync.js`

```javascript
export class RouteSync {
  constructor(appName, router, bus);
  notifyMicroApp(appName, path, meta);
  setupListener();
  destroy();
}
```

### 2.2 类型定义

```typescript
class RouteSync {
  /**
   * 构造函数
   * @param appName - 应用名称('main-app'或微应用名称)
   * @param router - Vue Router实例
   * @param bus - Wujie EventBus(微应用环境)
   */
  constructor(
    appName: string | null,
    router: Router,
    bus?: EventBus
  );

  /**
   * 通知微应用路由变化(仅主应用调用)
   * @param appName - 目标微应用名称
   * @param path - 目标路径(子路径)
   * @param meta - 路由元信息
   */
  notifyMicroApp(
    appName: string,
    path: string,
    meta?: Record<string, any>
  ): void;

  /**
   * 设置监听器(仅微应用调用)
   */
  setupListener(): void;

  /**
   * 销毁实例
   */
  destroy(): void;
}
```

---

## 3. 主应用集成

### 3.1 MicroAppContainer.vue

```vue
<template>
  <div class="micro-app-container">
    <WujieVue
      :name="microAppName"
      :url="microAppUrl"
      :props="appProps"
    />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WujieVue from 'wujie-vue3'
import { RouteSync } from '@k8s-agent/shared/core/route-sync.js'

const route = useRoute()
const router = useRouter()

// 获取微应用名称
const microAppName = computed(() => route.meta.microApp)

// 创建RouteSync实例
const routeSync = new RouteSync(null, router)

// 监听路由变化,同步到微应用
watch(() => route.path, (newPath) => {
  const appName = microAppName.value
  if (!appName) return

  // 提取basePath和subPath
  // 例: /system/users → basePath='system', subPath='/users'
  const basePath = newPath.split('/')[1]
  const subPath = newPath.replace(`/${basePath}`, '') || '/'

  // 通知微应用(自动防抖50ms)
  routeSync.notifyMicroApp(appName, subPath, {
    title: route.meta.title
  })
}, { immediate: true })

// 组件卸载时销毁
onBeforeUnmount(() => {
  routeSync.destroy()
})
</script>
```

### 3.2 路由同步流程

```
User navigates to /system/users
  ↓
Main app router updates (route.path = '/system/users')
  ↓
watch(() => route.path) triggers
  ↓
Extract: basePath='system', subPath='/users'
  ↓
routeSync.notifyMicroApp('system-app', '/users', { title: '用户管理' })
  ↓
Debounce 50ms (prevent event storms)
  ↓
Emit: bus.$emit('system-app-route-change', {
  type: 'sync',
  sourceApp: 'main-app',
  targetApp: 'system-app',
  path: '/users',
  fullPath: '/users',
  meta: { title: '用户管理' },
  timestamp: 1728551234567
})
  ↓
Micro-app listener receives event
  ↓
Micro-app router navigates to /users
```

---

## 4. 微应用集成

### 4.1 main.js

```javascript
// system-app/src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { RouteSync } from '@k8s-agent/shared/core/route-sync.js'
import App from './App.vue'
import routes from './router/routes'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory('/'), // ✅ 标准history模式
  routes
})

app.use(router)

// ✅ 在Wujie环境下设置路由同步
if (window.$wujie?.bus) {
  const routeSync = new RouteSync('system-app', router, window.$wujie.bus)
  routeSync.setupListener()

  // 可选: 上报路由变化到主应用
  router.afterEach((to) => {
    window.$wujie.bus.$emit('route:report', {
      type: 'report',
      sourceApp: 'system-app',
      targetApp: 'main-app',
      path: to.path,
      fullPath: to.fullPath,
      timestamp: Date.now()
    })
  })
}

app.mount('#app')
```

### 4.2 路由同步流程

```
Main app emits: 'system-app-route-change'
  ↓
Micro-app listener receives event
  ↓
RouteSync.setupListener() handler:
  - Extract: path='/users'
  - Check duplicate: lastSyncedPath !== '/users'
  ↓
router.push('/users')
  ↓
Micro-app updates view
  ↓
router.afterEach() triggers
  ↓
Emit: 'route:report' (optional, for debugging)
```

---

## 5. 防抖与去重机制

### 5.1 防抖(Debounce)

**目的**: 防止快速连续路由变化导致事件风暴。

**实现**:

```javascript
class RouteSync {
  constructor(appName, router, bus) {
    this.debounceTimer = null
    this.debounceDelay = 50 // 50ms
  }

  notifyMicroApp(appName, path, meta) {
    // 清除之前的定时器
    clearTimeout(this.debounceTimer)

    // 延迟执行
    this.debounceTimer = setTimeout(() => {
      this.bus.$emit(`${appName}-route-change`, {
        type: 'sync',
        sourceApp: 'main-app',
        targetApp: appName,
        path,
        fullPath: path,
        meta,
        timestamp: Date.now()
      })
    }, this.debounceDelay)
  }
}
```

### 5.2 去重(Duplicate Prevention)

**目的**: 避免循环同步(主应用 → 微应用 → 主应用 → ...)。

**实现**:

```javascript
class RouteSync {
  constructor(appName, router, bus) {
    this.lastSyncedPath = null
  }

  setupListener() {
    this.bus.$on(`${this.appName}-route-change`, (payload) => {
      const { path } = payload

      // 去重检查
      if (this.lastSyncedPath === path) {
        console.log(`[RouteSync] Duplicate path ignored: ${path}`)
        return
      }

      // 更新lastSyncedPath
      this.lastSyncedPath = path

      // 导航到目标路径
      this.router.push(path).catch(err => {
        // 处理导航错误
        this.bus.$emit('route:error', {
          type: 'error',
          appName: this.appName,
          error: err.message,
          path,
          timestamp: Date.now()
        })
      })
    })
  }
}
```

---

## 6. 错误处理

### 6.1 导航失败

**场景**: 微应用路由不存在、导航守卫拒绝等。

**处理**:

```javascript
this.router.push(path).catch(err => {
  console.error(`[RouteSync] Navigation failed:`, err)

  // 发送错误事件
  this.bus.$emit('route:error', {
    type: 'error',
    appName: this.appName,
    error: err.message,
    path,
    timestamp: Date.now()
  })

  // ❌ 不要重新抛出错误(避免影响其他逻辑)
})
```

### 6.2 监听错误事件

**主应用监听**:

```javascript
// main-app/src/main.js
window.WujieVue.bus.$on('route:error', (payload) => {
  console.error(`[Route Error] ${payload.appName}:`, payload.error)

  // 可选: 显示用户提示
  message.error(`路由导航失败: ${payload.error}`)

  // 可选: 上报到监控平台
  if (window.__MONITORING__) {
    window.__MONITORING__.captureException(new Error(payload.error), {
      tags: {
        app: payload.appName,
        type: 'route-error'
      },
      extra: payload
    })
  }
})
```

---

## 7. 测试契约

### 7.1 单元测试

```javascript
import { describe, it, expect, vi } from 'vitest'
import { RouteSync } from '@k8s-agent/shared/core/route-sync.js'

describe('RouteSync', () => {
  it('should emit route-change event with correct payload', (done) => {
    const mockBus = {
      $emit: vi.fn()
    }

    const routeSync = new RouteSync(null, {}, mockBus)

    routeSync.notifyMicroApp('test-app', '/users', { title: 'Users' })

    // 等待防抖
    setTimeout(() => {
      expect(mockBus.$emit).toHaveBeenCalledWith('test-app-route-change', {
        type: 'sync',
        sourceApp: 'main-app',
        targetApp: 'test-app',
        path: '/users',
        fullPath: '/users',
        meta: { title: 'Users' },
        timestamp: expect.any(Number)
      })
      done()
    }, 100)
  })

  it('should debounce rapid calls', (done) => {
    const mockBus = {
      $emit: vi.fn()
    }

    const routeSync = new RouteSync(null, {}, mockBus)

    // 快速调用3次
    routeSync.notifyMicroApp('test-app', '/path1')
    routeSync.notifyMicroApp('test-app', '/path2')
    routeSync.notifyMicroApp('test-app', '/path3')

    setTimeout(() => {
      // 只应触发1次(最后一次)
      expect(mockBus.$emit).toHaveBeenCalledTimes(1)
      expect(mockBus.$emit.mock.calls[0][1].path).toBe('/path3')
      done()
    }, 100)
  })

  it('should prevent duplicate navigation', () => {
    const mockRouter = {
      push: vi.fn().mockResolvedValue()
    }

    const mockBus = {
      $on: vi.fn()
    }

    const routeSync = new RouteSync('test-app', mockRouter, mockBus)
    routeSync.setupListener()

    // 获取监听器回调
    const listener = mockBus.$on.mock.calls[0][1]

    // 第一次调用
    listener({ path: '/users' })
    expect(mockRouter.push).toHaveBeenCalledWith('/users')

    // 第二次调用相同路径
    listener({ path: '/users' })
    expect(mockRouter.push).toHaveBeenCalledTimes(1) // ✅ 没有重复调用
  })

  it('should emit error event on navigation failure', async () => {
    const mockRouter = {
      push: vi.fn().mockRejectedValue(new Error('Route not found'))
    }

    const mockBus = {
      $on: vi.fn(),
      $emit: vi.fn()
    }

    const routeSync = new RouteSync('test-app', mockRouter, mockBus)
    routeSync.setupListener()

    const listener = mockBus.$on.mock.calls[0][1]

    await listener({ path: '/invalid' })

    expect(mockBus.$emit).toHaveBeenCalledWith('route:error', {
      type: 'error',
      appName: 'test-app',
      error: 'Route not found',
      path: '/invalid',
      timestamp: expect.any(Number)
    })
  })
})
```

### 7.2 E2E测试

```javascript
import { test, expect } from '@playwright/test'

test('Route sync between main app and micro-app', async ({ page }) => {
  // 1. 登录主应用
  await page.goto('http://localhost:3000/login')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', 'admin123')
  await page.click('button[type="submit"]')

  // 2. 导航到微应用路由
  await page.goto('http://localhost:3000/system/users')

  // 3. 等待微应用加载
  await page.waitForSelector('[data-wujie-app="system-app"]')

  // 4. 验证微应用路由正确
  const iframe = page.frameLocator('[data-wujie-app="system-app"]')
  await expect(iframe.locator('.user-list')).toBeVisible()

  // 5. 在微应用内导航
  await iframe.locator('a[href="/roles"]').click()

  // 6. 验证主应用URL同步
  await expect(page).toHaveURL('http://localhost:3000/system/roles')
})
```

---

## 8. 性能监控

### 8.1 路由同步延迟

**监控指标**: 从主应用触发路由变化到微应用完成导航的时间。

```javascript
// 在RouteSync类中添加性能监控
notifyMicroApp(appName, path, meta) {
  const startTime = performance.now()

  clearTimeout(this.debounceTimer)
  this.debounceTimer = setTimeout(() => {
    this.bus.$emit(`${appName}-route-change`, {
      type: 'sync',
      sourceApp: 'main-app',
      targetApp: appName,
      path,
      fullPath: path,
      meta: { ...meta, _syncStartTime: startTime },
      timestamp: Date.now()
    })
  }, this.debounceDelay)
}

// 微应用setupListener中测量
setupListener() {
  this.bus.$on(`${this.appName}-route-change`, (payload) => {
    const { path, meta } = payload
    const startTime = meta?._syncStartTime

    this.router.push(path).then(() => {
      if (startTime) {
        const duration = performance.now() - startTime
        console.log(`[Perf] Route sync took ${duration.toFixed(2)}ms`)

        // 上报性能数据
        if (window.__MONITORING__) {
          window.__MONITORING__.trackMetric('route_sync_duration', duration, {
            app: this.appName,
            path
          })
        }
      }
    })
  })
}
```

### 8.2 事件频率监控

**目的**: 检测路由同步事件是否过于频繁(可能是循环同步)。

```javascript
// 集成EventBusMonitor
import { EventBusMonitor } from '@k8s-agent/shared/utils/event-bus-monitor.js'

const monitor = new EventBusMonitor(window.WujieVue.bus, {
  threshold: 50 // 路由同步事件每秒不应超过50次
})

// 监控报告
setInterval(() => {
  const report = monitor.getReport()
  const routeSyncEvents = report.topEvents.filter(e => e.name.includes('route-change'))

  if (routeSyncEvents.length > 0 && routeSyncEvents[0].count > 50) {
    console.warn('[RouteSync] High frequency route sync detected:', routeSyncEvents)
  }
}, 5000)
```

---

## 9. 迁移指南

### 9.1 从setTimeout方案迁移

**迁移前**:

```javascript
// ❌ 旧代码(使用setTimeout)
watch(() => route.path, (newPath) => {
  const appName = route.meta.microApp
  const subPath = newPath.replace(`/${appName.replace('-app', '')}`, '')

  setTimeout(() => {
    window.WujieVue.bus.$emit(`${appName}-route-change`, subPath)
  }, 100)
})
```

**迁移后**:

```javascript
// ✅ 新代码(使用RouteSync)
import { RouteSync } from '@k8s-agent/shared/core/route-sync.js'

const routeSync = new RouteSync(null, router)

watch(() => route.path, (newPath) => {
  const appName = route.meta.microApp
  const basePath = newPath.split('/')[1]
  const subPath = newPath.replace(`/${basePath}`, '') || '/'

  routeSync.notifyMicroApp(appName, subPath, { title: route.meta.title })
})
```

### 9.2 迁移检查清单

- [ ] 主应用导入`RouteSync`类
- [ ] 删除所有`setTimeout(..., 100)`路由同步代码
- [ ] 替换为`routeSync.notifyMicroApp()`
- [ ] 微应用导入`RouteSync`类
- [ ] 删除旧的`window.$wujie.bus.$on`监听器
- [ ] 替换为`routeSync.setupListener()`
- [ ] 验证直接导航(如`/system/users`)立即生效
- [ ] 验证防抖机制(快速切换路由不会卡顿)
- [ ] 验证去重机制(相同路径不会重复导航)
- [ ] 检查错误事件是否正确触发

---

## 10. 验收标准

- [ ] `RouteSync`类正确导出并可用
- [ ] 主应用可通过`notifyMicroApp()`发送路由同步事件
- [ ] 微应用可通过`setupListener()`接收并响应路由事件
- [ ] 防抖机制生效(50ms内重复调用只触发1次)
- [ ] 去重机制生效(相同路径不会重复导航)
- [ ] 导航失败自动触发`route:error`事件
- [ ] 性能监控正确记录同步延迟
- [ ] 所有7个应用成功迁移到RouteSync
- [ ] 单元测试覆盖率≥90%
- [ ] E2E测试验证完整同步流程

---

**签署**:
- 开发团队: ___________
- 审核人: ___________
- 日期: 2025-10-10
