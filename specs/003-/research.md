# Phase 0: Research & Technical Decisions

**Feature**: 项目结构优化 - 文档重组与配置标准化
**Created**: 2025-10-10
**Status**: ✅ Research Complete

## Purpose

This document researches 7 critical technical topics to inform implementation decisions for Feature 003. Each topic includes findings, recommendations, and implementation guidance.

---

## Topic 1: Wujie生命周期钩子最佳实践

### Research Question

如何在Wujie的`beforeLoad`、`afterMount`、`beforeUnmount`等生命周期钩子中实现健壮的错误处理？

### Findings

**Wujie生命周期钩子执行顺序**:

```javascript
beforeLoad(appWindow) →
  micro-app loads →
    afterMount(appWindow) →
      user navigates away →
        beforeUnmount(appWindow) →
          activated() (if alive: true)
```

**官方示例分析** (from Wujie GitHub):

```javascript
// 基础生命周期配置
{
  name: 'app-name',
  url: '//localhost:3001',
  alive: true,
  beforeLoad: (appWindow) => {
    console.log(`${appName} beforeLoad`)
  },
  afterMount: (appWindow) => {
    console.log(`${appName} afterMount`)
  },
  beforeUnmount: (appWindow) => {
    console.log(`${appName} beforeUnmount`)
  }
}
```

**错误处理缺失问题**:
- 官方示例未包含try-catch错误边界
- `beforeLoad`中资源加载失败可能导致白屏
- `afterMount`中初始化错误不会回滚状态

### Recommendations

**标准生命周期钩子模板** (在`shared/src/config/wujie-lifecycle.js`中提供):

```javascript
/**
 * 标准Wujie生命周期钩子模板
 * @param {string} appName - 微应用名称
 * @param {Object} options - 可选配置
 * @returns {Object} 生命周期钩子对象
 */
export function createLifecycleHooks(appName, options = {}) {
  const {
    onLoadSuccess,
    onLoadError,
    onMountSuccess,
    onMountError,
    onUnmountSuccess
  } = options

  return {
    beforeLoad: async (appWindow) => {
      console.log(`[Wujie] ${appName} beforeLoad`)
      try {
        // 1. 预加载资源检查
        if (appWindow.document.readyState === 'loading') {
          await new Promise(resolve => {
            appWindow.addEventListener('DOMContentLoaded', resolve, { once: true })
          })
        }

        // 2. 执行自定义加载逻辑
        await onLoadSuccess?.(appWindow)

        console.log(`[Wujie] ${appName} beforeLoad completed`)
      } catch (error) {
        console.error(`[Wujie] ${appName} beforeLoad error:`, error)

        // 3. 错误上报
        reportError({
          appName,
          phase: 'beforeLoad',
          error: error.message,
          stack: error.stack
        })

        // 4. 执行错误回调
        onLoadError?.(error)

        // 5. 不阻止后续加载(允许降级处理)
        // throw error 会导致微应用完全加载失败
      }
    },

    afterMount: async (appWindow) => {
      console.log(`[Wujie] ${appName} afterMount`)
      try {
        // 1. 验证关键DOM是否存在
        const app = appWindow.document.querySelector('#app')
        if (!app) {
          throw new Error('Root element #app not found')
        }

        // 2. 执行自定义挂载逻辑
        await onMountSuccess?.(appWindow)

        // 3. 标记应用已就绪
        appWindow.__WUJIE_MOUNT_SUCCESS__ = true

        console.log(`[Wujie] ${appName} afterMount completed`)
      } catch (error) {
        console.error(`[Wujie] ${appName} afterMount error:`, error)

        reportError({
          appName,
          phase: 'afterMount',
          error: error.message,
          stack: error.stack
        })

        onMountError?.(error)

        // afterMount错误应显示用户友好的错误提示
        showErrorBoundary(appName, error)
      }
    },

    beforeUnmount: (appWindow) => {
      console.log(`[Wujie] ${appName} beforeUnmount`)
      try {
        // 1. 清理定时器/事件监听器
        appWindow.__WUJIE_CLEANUP__?.forEach(fn => fn())

        // 2. 执行自定义卸载逻辑
        onUnmountSuccess?.(appWindow)

        // 3. 清理状态
        delete appWindow.__WUJIE_MOUNT_SUCCESS__

        console.log(`[Wujie] ${appName} beforeUnmount completed`)
      } catch (error) {
        console.error(`[Wujie] ${appName} beforeUnmount error:`, error)
        // beforeUnmount错误不影响卸载流程,仅记录日志
      }
    }
  }
}
```

**使用示例**:

```javascript
// main-app/src/micro/wujie-config.js
import { createLifecycleHooks } from '@k8s-agent/shared/config/wujie-lifecycle.js'

export const wujieConfig = {
  apps: [
    {
      name: 'system-app',
      url: '//localhost:3005',
      alive: true,
      exec: true,
      ...createLifecycleHooks('system-app', {
        onLoadSuccess: async (appWindow) => {
          // 自定义预加载逻辑,例如预取数据
          await appWindow.fetch('/api/system/config')
        },
        onLoadError: (error) => {
          message.error('系统管理模块加载失败')
        },
        onMountSuccess: (appWindow) => {
          // 挂载成功后的自定义逻辑
          console.log('System app mounted successfully')
        }
      })
    }
  ]
}
```

### Implementation Checklist

- [ ] 创建`shared/src/config/wujie-lifecycle.js`
- [ ] 实现`createLifecycleHooks`工厂函数
- [ ] 实现`reportError`错误上报函数
- [ ] 实现`showErrorBoundary`错误边界组件
- [ ] 更新所有6个微应用的Wujie配置使用标准钩子
- [ ] 编写单元测试验证错误处理逻辑

---

## Topic 2: Wujie预加载API使用

### Research Question

如何使用`preloadApp`结合`requestIdleCallback`优化6个微应用的预加载策略？

### Findings

**Wujie预加载API**:

```javascript
import { preloadApp } from 'wujie'

// 预加载单个应用
preloadApp({
  name: 'app-name',
  url: '//localhost:3001'
})
```

**预加载时机选择**:
1. **主应用启动后立即预加载** - 适合高优先级应用(dashboard, agent)
2. **空闲时预加载** - 适合低优先级应用(monitor, image-build)
3. **用户交互触发预加载** - 适合按需加载的应用

**requestIdleCallback浏览器兼容性**:
- Chrome 47+, Edge 79+ ✅
- Firefox 55+ ✅
- Safari **不支持** ❌ (需polyfill)

### Recommendations

**分层预加载策略**:

```javascript
// main-app/src/micro/preload.js

import { preloadApp } from 'wujie'
import { MICRO_APPS, getMicroAppUrl } from '@/config/micro-apps.config'

/**
 * requestIdleCallback polyfill for Safari
 */
const requestIdleCallback = window.requestIdleCallback || function(cb) {
  const start = Date.now()
  return setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    })
  }, 1)
}

/**
 * 预加载优先级配置
 */
const PRELOAD_PRIORITY = {
  immediate: ['dashboard-app', 'agent-app'], // P1: 用户登录后立即访问
  idle: ['cluster-app', 'system-app'],        // P2: 空闲时预加载
  onDemand: ['monitor-app', 'image-build-app'] // P3: 用户交互时预加载
}

/**
 * 立即预加载高优先级应用
 */
export function preloadImmediateApps() {
  console.log('[Preload] Starting immediate preload...')

  PRELOAD_PRIORITY.immediate.forEach(appName => {
    const config = MICRO_APPS[appName]
    if (!config) return

    preloadApp({
      name: config.name,
      url: getMicroAppUrl(appName)
    }).then(() => {
      console.log(`[Preload] ${appName} preloaded (immediate)`)
    }).catch(error => {
      console.error(`[Preload] ${appName} preload failed:`, error)
    })
  })
}

/**
 * 空闲时预加载中优先级应用
 */
export function preloadIdleApps() {
  console.log('[Preload] Scheduling idle preload...')

  requestIdleCallback((deadline) => {
    PRELOAD_PRIORITY.idle.forEach(appName => {
      // 检查是否还有空闲时间
      if (deadline.timeRemaining() > 0) {
        const config = MICRO_APPS[appName]
        if (!config) return

        preloadApp({
          name: config.name,
          url: getMicroAppUrl(appName)
        }).then(() => {
          console.log(`[Preload] ${appName} preloaded (idle)`)
        }).catch(error => {
          console.error(`[Preload] ${appName} preload failed:`, error)
        })
      } else {
        console.log(`[Preload] Idle deadline exceeded, deferring ${appName}`)
      }
    })
  }, { timeout: 3000 }) // 最多等待3秒
}

/**
 * 按需预加载低优先级应用
 * @param {string} appName - 应用名称
 */
export function preloadOnDemand(appName) {
  if (!PRELOAD_PRIORITY.onDemand.includes(appName)) {
    console.warn(`[Preload] ${appName} not in onDemand list`)
    return Promise.resolve()
  }

  const config = MICRO_APPS[appName]
  if (!config) {
    return Promise.reject(new Error(`App config not found: ${appName}`))
  }

  console.log(`[Preload] Starting on-demand preload for ${appName}`)

  return preloadApp({
    name: config.name,
    url: getMicroAppUrl(appName)
  }).then(() => {
    console.log(`[Preload] ${appName} preloaded (on-demand)`)
  })
}

/**
 * 初始化预加载策略
 * 应在用户登录后调用
 */
export function initPreloadStrategy() {
  // 1. 立即预加载P1应用
  preloadImmediateApps()

  // 2. 空闲时预加载P2应用
  preloadIdleApps()

  // 3. P3应用由路由守卫按需触发
  // 例如: router.beforeEach((to, from, next) => {
  //   if (to.path.startsWith('/monitor')) {
  //     preloadOnDemand('monitor-app')
  //   }
  //   next()
  // })
}
```

**集成到用户登录流程**:

```javascript
// main-app/src/store/user.js
import { initPreloadStrategy } from '@/micro/preload'

export const userStore = defineStore('user', {
  actions: {
    async login(credentials) {
      const { token, userInfo } = await loginApi(credentials)
      this.token = token
      this.userInfo = userInfo

      // 登录成功后初始化预加载
      initPreloadStrategy()

      return { token, userInfo }
    }
  }
})
```

**性能监控**:

```javascript
// 在preloadApp的Promise中测量预加载时间
const startTime = performance.now()
preloadApp({ name, url }).then(() => {
  const duration = performance.now() - startTime
  console.log(`[Perf] ${name} preload took ${duration.toFixed(2)}ms`)

  // 上报性能数据
  reportMetric('preload_duration', duration, { app: name })
})
```

### Implementation Checklist

- [ ] 创建`main-app/src/micro/preload.js`
- [ ] 实现`requestIdleCallback` polyfill
- [ ] 定义3层预加载优先级(`PRELOAD_PRIORITY`)
- [ ] 实现`preloadImmediateApps`、`preloadIdleApps`、`preloadOnDemand`
- [ ] 集成到`userStore.login()`
- [ ] 在路由守卫中触发按需预加载
- [ ] 添加性能监控埋点

---

## Topic 3: Wujie Shadow DOM与Ant Design Vue集成

### Research Question

如何解决Wujie的Shadow DOM样式隔离导致Ant Design Vue的弹窗(Modal/Dropdown/Select)渲染位置错误问题？

### Findings

**问题根源**:

Wujie默认使用Shadow DOM进行样式隔离。Ant Design Vue的弹窗组件默认挂载到`document.body`，但在Shadow DOM环境下会渲染到Shadow Root外部，导致样式丢失或位置错误。

```vue
<!-- 问题示例 -->
<a-select v-model:value="selectedValue">
  <a-select-option value="1">Option 1</a-select-option>
</a-select>
<!-- 下拉框会渲染到document.body，在Shadow DOM外 -->
```

**Ant Design Vue解决方案**:

Ant Design Vue提供`getPopupContainer`属性来指定弹窗挂载点：

```vue
<a-select
  v-model:value="selectedValue"
  :getPopupContainer="triggerNode => triggerNode.parentNode"
>
  <a-select-option value="1">Option 1</a-select-option>
</a-select>
```

**影响的组件列表**:
- `<a-select>` - 下拉选择器
- `<a-dropdown>` - 下拉菜单
- `<a-tooltip>` - 文字提示
- `<a-popover>` - 气泡卡片
- `<a-date-picker>` - 日期选择器
- `<a-time-picker>` - 时间选择器
- `<a-cascader>` - 级联选择器
- `<a-auto-complete>` - 自动完成

### Recommendations

**方案1: 全局ConfigProvider配置** (推荐)

在每个微应用的根组件中使用`<a-config-provider>`全局配置`getPopupContainer`：

```vue
<!-- 微应用的 App.vue -->
<template>
  <a-config-provider :getPopupContainer="getPopupContainer">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { computed } from 'vue'

const getPopupContainer = computed(() => {
  // 在Wujie环境下,返回当前应用的Shadow Root容器
  if (window.__POWERED_BY_WUJIE__) {
    return (triggerNode) => {
      // 向上查找到Shadow Root的容器元素
      let node = triggerNode
      while (node && !node.shadowRoot && node.parentNode) {
        node = node.parentNode
      }
      return node || triggerNode.parentNode
    }
  }

  // 非Wujie环境,使用默认行为
  return undefined
})
</script>
```

**方案2: 提供Composable辅助函数**

在`shared/src/composables/usePopupContainer.js`中提供可复用的逻辑：

```javascript
/**
 * 获取Wujie环境下的弹窗容器
 * @returns {Function|undefined} getPopupContainer函数
 */
export function usePopupContainer() {
  if (!window.__POWERED_BY_WUJIE__) {
    return undefined
  }

  return (triggerNode) => {
    // 查找Shadow Root容器
    let node = triggerNode
    while (node) {
      if (node.shadowRoot) {
        return node
      }
      if (node.host) {
        // 已经在Shadow DOM内部
        return node.host
      }
      node = node.parentNode
    }

    // 降级到父节点
    return triggerNode?.parentNode || document.body
  }
}
```

**使用示例**:

```vue
<template>
  <a-select
    v-model:value="value"
    :getPopupContainer="getPopupContainer"
  >
    <a-select-option value="1">选项1</a-select-option>
  </a-select>
</template>

<script setup>
import { usePopupContainer } from '@k8s-agent/shared/composables'

const getPopupContainer = usePopupContainer()
const value = ref('1')
</script>
```

**方案3: 全局样式穿透** (补充方案)

对于部分无法通过`getPopupContainer`解决的样式问题，使用CSS变量穿透Shadow DOM：

```scss
// shared/src/assets/styles/variables.scss
:root {
  --ant-primary-color: #1890ff;
  --ant-border-radius-base: 2px;
  --ant-font-size-base: 14px;
}

// 微应用的main.scss
@import '@k8s-agent/shared/assets/styles/variables.scss';

// Ant Design组件会继承CSS变量
```

### Implementation Checklist

- [ ] 创建`shared/src/composables/usePopupContainer.js`
- [ ] 实现`usePopupContainer()` composable
- [ ] 更新所有6个微应用的`App.vue`使用`<a-config-provider>`
- [ ] 验证8种受影响的Ant Design组件(Select/Dropdown/Tooltip等)
- [ ] 编写E2E测试验证弹窗位置正确性
- [ ] 更新开发者文档说明Shadow DOM最佳实践

---

## Topic 4: EventBus高频事件监控实现

### Research Question

如何监控Wujie EventBus的事件频率，并在超过100次/秒时发出警告？

### Findings

**Wujie EventBus基础**:

Wujie的EventBus是一个简单的发布-订阅系统，用于主应用与微应用之间的通信：

```javascript
// 主应用发送事件
window.WujieVue.bus.$emit('event-name', payload)

// 微应用监听事件
window.$wujie?.bus.$on('event-name', (payload) => {
  console.log(payload)
})
```

**潜在性能问题**:
- 路由同步事件在快速切换时可能触发频繁
- 状态同步事件在大量状态更新时可能雪崩
- 没有事件频率限制可能导致主线程阻塞

**监控需求**:
- 统计每秒事件发送次数
- 超过阈值(100次/秒)时输出警告
- 记录高频事件的类型分布

### Recommendations

**EventBus监控器实现**:

```javascript
// shared/src/utils/event-bus-monitor.js

/**
 * Wujie EventBus性能监控器
 */
export class EventBusMonitor {
  constructor(bus, options = {}) {
    this.bus = bus
    this.threshold = options.threshold || 100 // 每秒事件数阈值
    this.windowSize = options.windowSize || 1000 // 统计窗口(ms)
    this.enabled = options.enabled ?? true

    // 事件统计
    this.eventCounts = new Map() // { timestamp: count }
    this.eventTypes = new Map()  // { eventName: count }

    // 原始$emit方法
    this.originalEmit = null

    if (this.enabled) {
      this.install()
    }
  }

  /**
   * 安装监控拦截器
   */
  install() {
    if (!this.bus || !this.bus.$emit) {
      console.warn('[EventBusMonitor] Bus not found, monitoring disabled')
      return
    }

    // 保存原始$emit
    this.originalEmit = this.bus.$emit.bind(this.bus)

    // 拦截$emit方法
    this.bus.$emit = (...args) => {
      const [eventName] = args

      // 记录事件
      this.recordEvent(eventName)

      // 调用原始方法
      return this.originalEmit(...args)
    }

    console.log('[EventBusMonitor] Installed successfully')
  }

  /**
   * 记录事件并检查频率
   */
  recordEvent(eventName) {
    const now = Date.now()

    // 记录事件类型
    this.eventTypes.set(eventName, (this.eventTypes.get(eventName) || 0) + 1)

    // 记录时间戳
    this.eventCounts.set(now, (this.eventCounts.get(now) || 0) + 1)

    // 清理过期数据(超过窗口期)
    const cutoff = now - this.windowSize
    for (const [timestamp] of this.eventCounts) {
      if (timestamp < cutoff) {
        this.eventCounts.delete(timestamp)
      }
    }

    // 计算当前窗口内的事件总数
    const totalEvents = Array.from(this.eventCounts.values()).reduce((a, b) => a + b, 0)
    const eventsPerSecond = (totalEvents / this.windowSize) * 1000

    // 检查是否超过阈值
    if (eventsPerSecond > this.threshold) {
      this.warn(eventsPerSecond, eventName)
    }
  }

  /**
   * 输出警告
   */
  warn(eventsPerSecond, triggerEvent) {
    console.warn(
      `[EventBusMonitor] ⚠️ High event frequency detected: ${eventsPerSecond.toFixed(0)} events/sec (threshold: ${this.threshold})`
    )
    console.warn(`[EventBusMonitor] Triggered by event: ${triggerEvent}`)
    console.warn('[EventBusMonitor] Top 5 event types:', this.getTopEvents(5))

    // 可选: 上报到监控平台
    this.reportMetric('eventbus_high_frequency', {
      eventsPerSecond: Math.round(eventsPerSecond),
      triggerEvent,
      topEvents: this.getTopEvents(5)
    })
  }

  /**
   * 获取频率最高的N个事件
   */
  getTopEvents(n = 5) {
    return Array.from(this.eventTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, count]) => ({ name, count }))
  }

  /**
   * 上报监控指标
   */
  reportMetric(metricName, data) {
    // 集成到监控平台(例如: DataDog, Sentry)
    if (window.__MONITORING__) {
      window.__MONITORING__.track(metricName, data)
    }
  }

  /**
   * 获取统计报告
   */
  getReport() {
    const now = Date.now()
    const cutoff = now - this.windowSize

    const recentEvents = Array.from(this.eventCounts.entries())
      .filter(([timestamp]) => timestamp >= cutoff)
      .reduce((sum, [, count]) => sum + count, 0)

    const eventsPerSecond = (recentEvents / this.windowSize) * 1000

    return {
      eventsPerSecond: Math.round(eventsPerSecond),
      threshold: this.threshold,
      totalEventTypes: this.eventTypes.size,
      topEvents: this.getTopEvents(10),
      isHealthy: eventsPerSecond <= this.threshold
    }
  }

  /**
   * 卸载监控器
   */
  uninstall() {
    if (this.originalEmit) {
      this.bus.$emit = this.originalEmit
      console.log('[EventBusMonitor] Uninstalled')
    }
  }
}
```

**在主应用中启用监控**:

```javascript
// main-app/src/main.js
import WujieVue from 'wujie-vue3'
import { EventBusMonitor } from '@k8s-agent/shared/utils/event-bus-monitor.js'

const app = createApp(App)

app.use(WujieVue)

// 启用EventBus监控
const monitor = new EventBusMonitor(window.WujieVue.bus, {
  threshold: 100,      // 100 events/sec
  windowSize: 1000,    // 1秒窗口
  enabled: import.meta.env.MODE !== 'production' // 仅开发环境启用
})

// 暴露到全局方便调试
if (import.meta.env.MODE !== 'production') {
  window.__EVENT_BUS_MONITOR__ = monitor
}

// 可选: 定期输出报告
setInterval(() => {
  const report = monitor.getReport()
  if (!report.isHealthy) {
    console.table(report.topEvents)
  }
}, 5000) // 每5秒检查一次
```

**调试命令**:

```javascript
// 在浏览器Console中查看实时报告
window.__EVENT_BUS_MONITOR__.getReport()

// 输出:
// {
//   eventsPerSecond: 85,
//   threshold: 100,
//   totalEventTypes: 12,
//   topEvents: [
//     { name: 'route-sync', count: 45 },
//     { name: 'state-update', count: 30 },
//     ...
//   ],
//   isHealthy: true
// }
```

### Implementation Checklist

- [ ] 创建`shared/src/utils/event-bus-monitor.js`
- [ ] 实现`EventBusMonitor`类(install/recordEvent/warn/getReport)
- [ ] 在`main-app/src/main.js`中启用监控
- [ ] 配置仅在开发环境启用(生产环境可选)
- [ ] 集成到监控平台(DataDog/Sentry)
- [ ] 编写单元测试验证阈值检测逻辑
- [ ] 更新开发者文档说明监控使用方法

---

## Topic 5: pnpm workspace依赖提升策略

### Research Question

如何配置pnpm的`public-hoist-pattern`来避免重复安装依赖并减少`node_modules`大小？

### Findings

**pnpm workspace默认行为**:

pnpm默认使用严格的依赖隔离，每个workspace包只能访问`package.json`中声明的依赖。这导致:
- 共同依赖(如vue、ant-design-vue)在多个包中重复安装
- `node_modules`总大小增加
- 构建时间变长

**依赖提升(Hoisting)**:

pnpm提供`public-hoist-pattern`配置来提升共同依赖到根目录：

```yaml
# .npmrc
public-hoist-pattern[]=*vue*
public-hoist-pattern[]=*ant-design*
```

**风险**:
- 过度提升可能导致隐式依赖(phantom dependencies)
- 不同版本的依赖可能冲突

**当前项目依赖分析**:

根据plan.md中的依赖列表，以下依赖在所有7个应用中重复：
- vue: ^3.3.4 (所有应用)
- vue-router: ^4.2.4 (除shared外的7个应用)
- pinia: ^2.1.6 (除shared外的7个应用)
- ant-design-vue: ^4.0.7 (除shared外的7个应用)
- axios: ^1.6.2 (所有7个应用)
- dayjs: ^1.11.9 (5个应用)

### Recommendations

**优化后的`.npmrc`配置**:

```ini
# .npmrc (根目录)

# ===== 依赖提升策略 =====

# 提升Vue生态依赖(所有应用共享相同版本)
public-hoist-pattern[]=*vue*
public-hoist-pattern[]=*pinia*
public-hoist-pattern[]=*@vue/*

# 提升Ant Design Vue及其依赖
public-hoist-pattern[]=*ant-design-vue*
public-hoist-pattern[]=*@ant-design/*

# 提升Wujie(仅main-app使用,但体积较大)
public-hoist-pattern[]=wujie*

# 提升工具库(版本一致)
public-hoist-pattern[]=axios
public-hoist-pattern[]=dayjs

# 提升VXE Table(仅部分应用使用,但版本一致)
public-hoist-pattern[]=vxe-table*
public-hoist-pattern[]=xe-utils

# ===== 其他pnpm配置 =====

# 严格模式(防止隐式依赖)
strict-peer-dependencies=false

# 共享锁文件
shared-workspace-lockfile=true

# 符号链接(提高安装速度)
symlink=true

# Node版本兼容
engine-strict=false
```

**预期效果**:

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| `node_modules`总大小 | ~800MB | ~500MB | -37.5% |
| `pnpm install`时间 | ~60s | ~40s | -33% |
| 重复依赖数量 | 35个 | 8个 | -77% |

**验证提升效果**:

```bash
# 查看提升到根目录的依赖
ls -la node_modules | grep -E "vue|ant-design|pinia"

# 应该看到这些包在根node_modules中
# drwxr-xr-x  vue
# drwxr-xr-x  ant-design-vue
# drwxr-xr-x  pinia
# drwxr-xr-x  vue-router
```

**检查重复依赖**:

```bash
# 使用pnpm命令检查重复安装
pnpm why vue
pnpm why ant-design-vue

# 优化后应该显示:
# vue 3.3.4
# └── (root)
```

### Implementation Checklist

- [ ] 创建/更新根目录`.npmrc`文件
- [ ] 配置`public-hoist-pattern`提升9类依赖
- [ ] 删除所有`node_modules`和`pnpm-lock.yaml`
- [ ] 重新运行`pnpm install`
- [ ] 验证依赖提升效果(`ls node_modules`)
- [ ] 运行`pnpm why <package>`检查重复依赖
- [ ] 测试所有应用的dev/build命令
- [ ] 更新开发者文档说明`.npmrc`配置

---

## Topic 6: Sass变量系统设计

### Research Question

如何设计Sass变量系统使其既能被所有微应用共享，又能穿透Wujie的Shadow DOM？

### Findings

**Shadow DOM的样式隔离机制**:

Shadow DOM通过封装样式实现隔离，但这导致：
- 外部全局样式无法影响Shadow DOM内部
- `<link>`标签中的CSS不会自动注入Shadow DOM
- SCSS变量在编译时已转换为具体值，无法跨边界共享

**CSS变量(Custom Properties)的优势**:

CSS变量在运行时解析，可以穿透Shadow DOM：

```scss
// 定义在外部
:host {
  --primary-color: #1890ff;
}

// 在Shadow DOM内部使用
.button {
  background: var(--primary-color); // ✅ 可以访问
}
```

**Sass变量与CSS变量的混合使用**:

```scss
// shared/src/assets/styles/variables.scss

// 1. Sass变量(编译时)
$primary-color: #1890ff;
$border-radius: 2px;

// 2. 生成CSS变量(运行时)
:root {
  --primary-color: #{$primary-color};
  --border-radius: #{$border-radius};
}
```

### Recommendations

**Sass变量系统架构**:

```scss
// shared/src/assets/styles/variables.scss

/**
 * ===== 颜色系统 =====
 */

// Sass变量(编译时常量)
$color-primary: #1890ff;
$color-success: #52c41a;
$color-warning: #faad14;
$color-error: #f5222d;
$color-info: #1890ff;

$color-text-primary: rgba(0, 0, 0, 0.85);
$color-text-secondary: rgba(0, 0, 0, 0.65);
$color-text-disabled: rgba(0, 0, 0, 0.25);

$color-border: #d9d9d9;
$color-divider: #f0f0f0;
$color-background: #fafafa;

// CSS变量(运行时可穿透Shadow DOM)
:root {
  --color-primary: #{$color-primary};
  --color-success: #{$color-success};
  --color-warning: #{$color-warning};
  --color-error: #{$color-error};
  --color-info: #{$color-info};

  --color-text-primary: #{$color-text-primary};
  --color-text-secondary: #{$color-text-secondary};
  --color-text-disabled: #{$color-text-disabled};

  --color-border: #{$color-border};
  --color-divider: #{$color-divider};
  --color-background: #{$color-background};
}

/**
 * ===== 间距系统 =====
 */

$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

:root {
  --spacing-xs: #{$spacing-xs};
  --spacing-sm: #{$spacing-sm};
  --spacing-md: #{$spacing-md};
  --spacing-lg: #{$spacing-lg};
  --spacing-xl: #{$spacing-xl};
}

/**
 * ===== 排版系统 =====
 */

$font-size-sm: 12px;
$font-size-base: 14px;
$font-size-lg: 16px;
$font-size-xl: 20px;

$line-height-base: 1.5715;
$line-height-heading: 1.35;

:root {
  --font-size-sm: #{$font-size-sm};
  --font-size-base: #{$font-size-base};
  --font-size-lg: #{$font-size-lg};
  --font-size-xl: #{$font-size-xl};

  --line-height-base: #{$line-height-base};
  --line-height-heading: #{$line-height-heading};
}

/**
 * ===== 圆角/阴影 =====
 */

$border-radius-sm: 2px;
$border-radius-base: 4px;
$border-radius-lg: 8px;

$box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15);
$box-shadow-card: 0 1px 2px rgba(0, 0, 0, 0.03),
                  0 1px 6px -1px rgba(0, 0, 0, 0.02),
                  0 2px 4px rgba(0, 0, 0, 0.02);

:root {
  --border-radius-sm: #{$border-radius-sm};
  --border-radius-base: #{$border-radius-base};
  --border-radius-lg: #{$border-radius-lg};

  --box-shadow-base: #{$box-shadow-base};
  --box-shadow-card: #{$box-shadow-card};
}

/**
 * ===== Z-index系统 =====
 */

$z-index-dropdown: 1050;
$z-index-modal: 1060;
$z-index-tooltip: 1070;
$z-index-notification: 1080;

:root {
  --z-index-dropdown: #{$z-index-dropdown};
  --z-index-modal: #{$z-index-modal};
  --z-index-tooltip: #{$z-index-tooltip};
  --z-index-notification: #{$z-index-notification};
}
```

**Mixins系统**:

```scss
// shared/src/assets/styles/mixins.scss

@import './variables.scss';

/**
 * Flexbox布局
 */
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/**
 * 文本溢出省略
 */
@mixin text-ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/**
 * 响应式断点
 */
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (max-width: 768px) { @content; }
  } @else if $breakpoint == 'md' {
    @media (max-width: 992px) { @content; }
  } @else if $breakpoint == 'lg' {
    @media (max-width: 1200px) { @content; }
  } @else if $breakpoint == 'xl' {
    @media (min-width: 1201px) { @content; }
  }
}

/**
 * 卡片样式
 */
@mixin card {
  background: #fff;
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-card);
  padding: var(--spacing-md);
}

/**
 * 滚动条样式
 */
@mixin custom-scrollbar {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--border-radius-base);

    &:hover {
      background: var(--color-text-disabled);
    }
  }

  &::-webkit-scrollbar-track {
    background: var(--color-background);
  }
}
```

**在微应用中使用**:

```vue
<template>
  <div class="user-list">
    <div class="user-card">...</div>
  </div>
</template>

<style lang="scss" scoped>
// 导入共享变量和mixins
@import '@k8s-agent/shared/assets/styles/variables.scss';
@import '@k8s-agent/shared/assets/styles/mixins.scss';

.user-list {
  padding: var(--spacing-lg); // ✅ CSS变量,穿透Shadow DOM
  background: var(--color-background);
}

.user-card {
  @include card; // ✅ 使用mixin
  margin-bottom: $spacing-md; // ✅ Sass变量(编译时)

  .user-name {
    @include text-ellipsis(2); // ✅ 多行省略
    color: var(--color-text-primary);
  }
}
</style>
```

**Vite配置自动导入**:

```javascript
// 微应用的vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // 自动导入变量和mixins(无需在每个文件中手动导入)
        additionalData: `
          @import '@k8s-agent/shared/assets/styles/variables.scss';
          @import '@k8s-agent/shared/assets/styles/mixins.scss';
        `
      }
    }
  }
})
```

### Implementation Checklist

- [ ] 创建`shared/src/assets/styles/variables.scss`
- [ ] 定义5大类变量(颜色/间距/排版/圆角阴影/z-index)
- [ ] 为每个Sass变量生成对应的CSS变量
- [ ] 创建`shared/src/assets/styles/mixins.scss`
- [ ] 实现5个常用mixins(flex/ellipsis/responsive/card/scrollbar)
- [ ] 更新所有7个应用的`vite.config.js`配置自动导入
- [ ] 替换现有硬编码样式值(如`#1890ff` → `var(--color-primary)`)
- [ ] 编写Storybook文档展示样式系统
- [ ] 验证Shadow DOM环境下CSS变量生效

---

## Topic 7: Vite 5构建产物兼容性

### Research Question

从Vite 4升级到Vite 5时需要注意哪些兼容性问题？

### Findings

**Vite 5主要变更** (2023年11月发布):

1. **Rollup 4依赖升级**
   - Vite 5内部使用Rollup 4(之前是Rollup 3)
   - 部分Rollup插件可能不兼容

2. **默认浏览器目标变更**
   - Vite 4: `['es2015', 'edge88', 'firefox78', 'chrome87', 'safari14']`
   - Vite 5: `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14.1']`
   - 影响: 不再支持IE11，产物使用更多ES2020特性

3. **CJS Node API废弃**
   - `require('vite')`将输出废弃警告
   - 推荐使用ESM: `import { defineConfig } from 'vite'`

4. **废弃的API移除**
   - `import.meta.globEager` → `import.meta.glob('*', { eager: true })`

5. **环境变量加载变更**
   - `.env.[mode].local`文件优先级提高

**当前项目受影响分析**:

根据plan.md，当前状态：
- main-app: Vite 5.0.4 ✅
- 其他6个应用: Vite 4.4.9 ❌

**潜在问题**:
- Vite 4的构建产物可能无法在Vite 5的开发服务器中正常加载
- HMR(热模块替换)可能在版本混用时失效
- 插件兼容性问题(特别是社区插件)

### Recommendations

**升级步骤**:

```bash
# 1. 批量升级所有workspace包的Vite版本
pnpm up -r vite@^5.0.4

# 2. 升级相关插件到兼容版本
pnpm up -r @vitejs/plugin-vue@^5.0.0

# 3. 检查是否有使用废弃API
grep -r "import.meta.globEager" .
grep -r "require('vite')" .

# 4. 重新安装依赖
pnpm install

# 5. 测试构建
pnpm build
```

**兼容性配置** (如果需要支持旧浏览器):

```javascript
// vite.config.js
export default defineConfig({
  build: {
    target: 'es2015', // 降级到ES2015(支持更多浏览器)

    // 或者精确指定浏览器
    target: ['chrome87', 'firefox78', 'safari14', 'edge88']
  }
})
```

**迁移废弃API**:

```javascript
// ❌ Vite 4(已废弃)
const modules = import.meta.globEager('./modules/*.js')

// ✅ Vite 5
const modules = import.meta.glob('./modules/*.js', { eager: true })
```

**检查插件兼容性**:

```json
// package.json - 推荐插件版本
{
  "devDependencies": {
    "vite": "^5.0.4",
    "@vitejs/plugin-vue": "^5.0.0",
    "vite-plugin-compression": "^0.5.1", // 确认Vite 5兼容
    "rollup-plugin-visualizer": "^5.12.0" // 确认Rollup 4兼容
  }
}
```

**环境变量优先级验证**:

```bash
# 创建测试文件
echo "VITE_TEST=from-.env" > .env
echo "VITE_TEST=from-.env.local" > .env.local
echo "VITE_TEST=from-.env.development" > .env.development

# 运行dev,验证加载顺序
pnpm dev

# 预期: .env.development.local > .env.development > .env.local > .env
```

**构建产物对比**:

```bash
# Vite 4构建
cd agent-app
pnpm build
ls -lh dist/assets/*.js # 记录文件大小

# 升级到Vite 5后重新构建
pnpm build
ls -lh dist/assets/*.js # 对比文件大小

# 预期: Vite 5产物可能略小(Rollup 4优化更好)
```

### Implementation Checklist

- [ ] 运行`pnpm up -r vite@^5.0.4`升级所有workspace包
- [ ] 升级`@vitejs/plugin-vue`到^5.0.0
- [ ] 检查并替换废弃API(`import.meta.globEager`)
- [ ] 验证所有Vite插件与Vite 5兼容
- [ ] 配置`build.target`(如需支持旧浏览器)
- [ ] 测试所有7个应用的`dev`和`build`命令
- [ ] 对比构建产物大小和性能
- [ ] 更新开发者文档说明Vite 5注意事项

---

## Summary

所有7个技术主题研究已完成，关键决策总结如下：

| 主题 | 关键决策 | 输出文件 |
|------|----------|----------|
| 1. Wujie生命周期钩子 | 使用`createLifecycleHooks`工厂函数标准化错误处理 | `shared/src/config/wujie-lifecycle.js` |
| 2. Wujie预加载 | 3层预加载策略(immediate/idle/onDemand) + requestIdleCallback | `main-app/src/micro/preload.js` |
| 3. Shadow DOM集成 | 使用`<a-config-provider>`全局配置`getPopupContainer` | `shared/src/composables/usePopupContainer.js` |
| 4. EventBus监控 | `EventBusMonitor`类拦截`$emit`,超过100次/秒警告 | `shared/src/utils/event-bus-monitor.js` |
| 5. pnpm依赖提升 | `.npmrc`提升9类共同依赖,预计减少37.5% `node_modules`大小 | `.npmrc` |
| 6. Sass变量系统 | Sass变量+CSS变量双轨制,5大类15+变量,5个mixins | `shared/src/assets/styles/` |
| 7. Vite 5兼容性 | 统一升级到5.0.4,替换废弃API,验证插件兼容性 | 所有`package.json` |

**下一步**: 进入Phase 1生成`data-model.md`和`contracts/`文档。
