# Contract: Wujie生命周期钩子契约

**Version**: 1.0.0
**Created**: 2025-10-10
**Owner**: Feature 003 - 项目结构优化

## Purpose

定义`shared/src/config/wujie-lifecycle.js`的导出接口、生命周期钩子标准和错误处理规范，确保所有6个微应用的Wujie配置一致。

---

## 1. 导出接口

### 1.1 createLifecycleHooks函数

**导出路径**: `@k8s-agent/shared/config/wujie-lifecycle.js`

```javascript
/**
 * 创建标准Wujie生命周期钩子
 * @param {string} appName - 微应用名称
 * @param {LifecycleHooksOptions} [options={}] - 可选配置
 * @returns {LifecycleHooks} 生命周期钩子对象
 */
export function createLifecycleHooks(
  appName: string,
  options?: LifecycleHooksOptions
): LifecycleHooks
```

**类型定义**:

```typescript
interface LifecycleHooksOptions {
  /** beforeLoad成功回调 */
  onLoadSuccess?: (appWindow: Window) => void | Promise<void>;

  /** beforeLoad错误回调 */
  onLoadError?: (error: Error) => void;

  /** afterMount成功回调 */
  onMountSuccess?: (appWindow: Window) => void;

  /** afterMount错误回调 */
  onMountError?: (error: Error) => void;

  /** beforeUnmount成功回调 */
  onUnmountSuccess?: (appWindow: Window) => void;
}

interface LifecycleHooks {
  /** 应用加载前钩子 */
  beforeLoad: (appWindow: Window) => void | Promise<void>;

  /** 应用挂载后钩子 */
  afterMount: (appWindow: Window) => void | Promise<void>;

  /** 应用卸载前钩子 */
  beforeUnmount: (appWindow: Window) => void;
}
```

### 1.2 辅助函数

#### reportError()

上报生命周期错误到监控平台。

```javascript
/**
 * 上报生命周期错误
 * @param {ErrorReport} report - 错误报告
 */
export function reportError(report: ErrorReport): void

interface ErrorReport {
  appName: string;
  phase: 'beforeLoad' | 'afterMount' | 'beforeUnmount';
  error: string;
  stack?: string;
  timestamp?: number;
}
```

#### showErrorBoundary()

显示错误边界UI。

```javascript
/**
 * 显示错误边界UI
 * @param {string} appName - 应用名称
 * @param {Error} error - 错误对象
 */
export function showErrorBoundary(appName: string, error: Error): void
```

---

## 2. 生命周期规范

### 2.1 beforeLoad钩子

**职责**: 应用资源加载前的预处理和验证。

**执行时机**: Wujie开始加载微应用HTML之前。

**标准行为**:

1. ✅ 等待DOM Ready(如果`appWindow.document.readyState === 'loading'`)
2. ✅ 执行自定义预加载逻辑(`onLoadSuccess`)
3. ✅ 捕获并记录错误(不阻止后续加载)
4. ✅ 调用`reportError()`上报错误
5. ❌ **不应该**抛出异常(会导致白屏)

**示例**:

```javascript
beforeLoad: async (appWindow) => {
  console.log(`[Wujie] ${appName} beforeLoad`)
  try {
    // 1. 等待DOM Ready
    if (appWindow.document.readyState === 'loading') {
      await new Promise(resolve => {
        appWindow.addEventListener('DOMContentLoaded', resolve, { once: true })
      })
    }

    // 2. 执行自定义逻辑
    await onLoadSuccess?.(appWindow)

    console.log(`[Wujie] ${appName} beforeLoad completed`)
  } catch (error) {
    console.error(`[Wujie] ${appName} beforeLoad error:`, error)
    reportError({ appName, phase: 'beforeLoad', error: error.message, stack: error.stack })
    onLoadError?.(error)
    // ❌ 不要 throw error
  }
}
```

### 2.2 afterMount钩子

**职责**: 应用挂载完成后的初始化和验证。

**执行时机**: 微应用的Vue实例挂载完成后。

**标准行为**:

1. ✅ 验证关键DOM元素存在(如`#app`)
2. ✅ 执行自定义挂载逻辑(`onMountSuccess`)
3. ✅ 标记应用已就绪(`appWindow.__WUJIE_MOUNT_SUCCESS__ = true`)
4. ✅ 捕获错误并显示ErrorBoundary
5. ✅ 调用`reportError()`和`showErrorBoundary()`

**示例**:

```javascript
afterMount: async (appWindow) => {
  console.log(`[Wujie] ${appName} afterMount`)
  try {
    // 1. 验证DOM
    const app = appWindow.document.querySelector('#app')
    if (!app) {
      throw new Error('Root element #app not found')
    }

    // 2. 执行自定义逻辑
    await onMountSuccess?.(appWindow)

    // 3. 标记就绪
    appWindow.__WUJIE_MOUNT_SUCCESS__ = true

    console.log(`[Wujie] ${appName} afterMount completed`)
  } catch (error) {
    console.error(`[Wujie] ${appName} afterMount error:`, error)
    reportError({ appName, phase: 'afterMount', error: error.message, stack: error.stack })
    onMountError?.(error)
    showErrorBoundary(appName, error)
  }
}
```

### 2.3 beforeUnmount钩子

**职责**: 应用卸载前的清理工作。

**执行时机**: 用户离开微应用页面之前。

**标准行为**:

1. ✅ 清理定时器/事件监听器(`appWindow.__WUJIE_CLEANUP__`)
2. ✅ 执行自定义卸载逻辑(`onUnmountSuccess`)
3. ✅ 清理状态标记
4. ✅ 捕获错误但不阻止卸载
5. ❌ **不应该**显示错误UI(用户已离开)

**示例**:

```javascript
beforeUnmount: (appWindow) => {
  console.log(`[Wujie] ${appName} beforeUnmount`)
  try {
    // 1. 清理资源
    appWindow.__WUJIE_CLEANUP__?.forEach(fn => fn())

    // 2. 执行自定义逻辑
    onUnmountSuccess?.(appWindow)

    // 3. 清理状态
    delete appWindow.__WUJIE_MOUNT_SUCCESS__

    console.log(`[Wujie] ${appName} beforeUnmount completed`)
  } catch (error) {
    console.error(`[Wujie] ${appName} beforeUnmount error:`, error)
    // ❌ 不显示ErrorBoundary,仅记录日志
  }
}
```

---

## 3. 使用示例

### 3.1 基础使用(无自定义逻辑)

```javascript
// main-app/src/micro/wujie-config.js
import { createLifecycleHooks } from '@k8s-agent/shared/config/wujie-lifecycle.js'

export const wujieConfig = {
  apps: [
    {
      name: 'dashboard-app',
      url: '//localhost:3001',
      alive: true,
      exec: true,
      ...createLifecycleHooks('dashboard-app') // ✅ 使用标准钩子
    }
  ]
}
```

### 3.2 带自定义逻辑

```javascript
import { createLifecycleHooks } from '@k8s-agent/shared/config/wujie-lifecycle.js'
import { message } from 'ant-design-vue'

export const wujieConfig = {
  apps: [
    {
      name: 'system-app',
      url: '//localhost:3005',
      alive: true,
      exec: true,
      ...createLifecycleHooks('system-app', {
        // 加载前预取配置
        onLoadSuccess: async (appWindow) => {
          const config = await fetch('/api/system/config').then(r => r.json())
          appWindow.__SYSTEM_CONFIG__ = config
        },

        onLoadError: (error) => {
          message.error('系统管理模块加载失败,请刷新重试')
        },

        // 挂载后初始化WebSocket
        onMountSuccess: (appWindow) => {
          const ws = new WebSocket('ws://localhost:8080/system')
          appWindow.__SYSTEM_WS__ = ws

          // 注册清理函数
          appWindow.__WUJIE_CLEANUP__ = appWindow.__WUJIE_CLEANUP__ || []
          appWindow.__WUJIE_CLEANUP__.push(() => {
            ws.close()
            delete appWindow.__SYSTEM_WS__
          })
        },

        onMountError: (error) => {
          message.error('系统管理模块初始化失败')
        },

        // 卸载时关闭WebSocket
        onUnmountSuccess: (appWindow) => {
          appWindow.__SYSTEM_WS__?.close()
        }
      })
    }
  ]
}
```

### 3.3 错误处理示例

```javascript
// 模拟加载失败
createLifecycleHooks('broken-app', {
  onLoadSuccess: async (appWindow) => {
    throw new Error('Simulated load error')
  },

  onLoadError: (error) => {
    console.error('Load failed:', error.message)
    // 可选: 显示降级UI
    showFallbackUI('broken-app')
  }
})

// 结果:
// 1. 错误被捕获,不会白屏
// 2. reportError()自动调用
// 3. onLoadError回调执行
// 4. 应用继续尝试挂载(允许降级处理)
```

---

## 4. 清理机制规范

### 4.1 清理函数注册

微应用应在`afterMount`阶段注册需要清理的资源：

```javascript
// 微应用内部(main.js)
if (window.__POWERED_BY_WUJIE__) {
  window.__WUJIE_CLEANUP__ = window.__WUJIE_CLEANUP__ || []

  // 注册定时器清理
  const timer = setInterval(() => {
    console.log('Polling...')
  }, 5000)

  window.__WUJIE_CLEANUP__.push(() => {
    clearInterval(timer)
  })

  // 注册事件监听器清理
  const handleResize = () => { /* ... */ }
  window.addEventListener('resize', handleResize)

  window.__WUJIE_CLEANUP__.push(() => {
    window.removeEventListener('resize', handleResize)
  })
}
```

### 4.2 清理时机

`beforeUnmount`钩子会自动调用所有注册的清理函数：

```javascript
beforeUnmount: (appWindow) => {
  // ✅ 自动执行所有清理函数
  appWindow.__WUJIE_CLEANUP__?.forEach(fn => fn())
}
```

---

## 5. 错误上报规范

### 5.1 reportError()实现

```javascript
// shared/src/config/wujie-lifecycle.js

export function reportError(report) {
  const {
    appName,
    phase,
    error,
    stack,
    timestamp = Date.now()
  } = report

  // 1. Console日志
  console.error(`[Wujie Error] ${appName} - ${phase}:`, {
    error,
    stack,
    timestamp
  })

  // 2. 上报到监控平台
  if (window.__MONITORING__) {
    window.__MONITORING__.captureException(new Error(error), {
      tags: {
        app: appName,
        phase,
        framework: 'wujie'
      },
      extra: {
        stack,
        timestamp
      }
    })
  }

  // 3. 可选: 上报到自定义日志服务
  if (import.meta.env.PROD) {
    fetch('/api/logs/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appName, phase, error, stack, timestamp })
    }).catch(() => {
      // 忽略上报失败
    })
  }
}
```

### 5.2 集成Sentry示例

```javascript
// main-app/src/main.js
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: 'https://your-sentry-dsn',
  environment: import.meta.env.MODE
})

// 全局暴露监控接口
window.__MONITORING__ = {
  captureException: Sentry.captureException
}
```

---

## 6. ErrorBoundary集成

### 6.1 showErrorBoundary()实现

```javascript
// shared/src/config/wujie-lifecycle.js
import { createApp, h } from 'vue'
import ErrorBoundary from '@k8s-agent/shared/components/ErrorBoundary.vue'

export function showErrorBoundary(appName, error) {
  // 查找微应用容器
  const container = document.querySelector(`[data-wujie-app="${appName}"]`)
  if (!container) {
    console.warn(`[ErrorBoundary] Container not found for ${appName}`)
    return
  }

  // 创建ErrorBoundary实例
  const errorApp = createApp({
    render: () => h(ErrorBoundary, {
      appName,
      error: error.message,
      onRetry: () => {
        // 重新加载微应用
        window.location.reload()
      }
    })
  })

  // 挂载到容器
  container.innerHTML = ''
  errorApp.mount(container)
}
```

### 6.2 ErrorBoundary组件

```vue
<!-- shared/src/components/ErrorBoundary.vue -->
<template>
  <div class="error-boundary">
    <div class="error-icon">⚠️</div>
    <h2>{{ appName }} 加载失败</h2>
    <p class="error-message">{{ error }}</p>
    <a-button type="primary" @click="onRetry">
      重新加载
    </a-button>
  </div>
</template>

<script setup>
defineProps({
  appName: String,
  error: String,
  onRetry: Function
})
</script>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-message {
  color: var(--color-text-secondary);
  margin: 16px 0;
}
</style>
```

---

## 7. 测试契约

### 7.1 单元测试

```javascript
import { describe, it, expect, vi } from 'vitest'
import { createLifecycleHooks, reportError } from '@k8s-agent/shared/config/wujie-lifecycle.js'

describe('Wujie Lifecycle Hooks', () => {
  it('should create hooks with default behavior', () => {
    const hooks = createLifecycleHooks('test-app')

    expect(hooks).toHaveProperty('beforeLoad')
    expect(hooks).toHaveProperty('afterMount')
    expect(hooks).toHaveProperty('beforeUnmount')
    expect(typeof hooks.beforeLoad).toBe('function')
  })

  it('should call onLoadSuccess in beforeLoad', async () => {
    const onLoadSuccess = vi.fn()
    const hooks = createLifecycleHooks('test-app', { onLoadSuccess })

    const mockWindow = {
      document: { readyState: 'complete' }
    }

    await hooks.beforeLoad(mockWindow)
    expect(onLoadSuccess).toHaveBeenCalledWith(mockWindow)
  })

  it('should catch errors in beforeLoad without throwing', async () => {
    const onLoadError = vi.fn()
    const hooks = createLifecycleHooks('test-app', {
      onLoadSuccess: () => { throw new Error('Test error') },
      onLoadError
    })

    const mockWindow = {
      document: { readyState: 'complete' }
    }

    await expect(hooks.beforeLoad(mockWindow)).resolves.not.toThrow()
    expect(onLoadError).toHaveBeenCalled()
  })

  it('should set __WUJIE_MOUNT_SUCCESS__ in afterMount', async () => {
    const hooks = createLifecycleHooks('test-app')

    const mockWindow = {
      document: {
        querySelector: () => ({ id: 'app' })
      }
    }

    await hooks.afterMount(mockWindow)
    expect(mockWindow.__WUJIE_MOUNT_SUCCESS__).toBe(true)
  })

  it('should execute cleanup functions in beforeUnmount', () => {
    const cleanup1 = vi.fn()
    const cleanup2 = vi.fn()

    const hooks = createLifecycleHooks('test-app')

    const mockWindow = {
      __WUJIE_CLEANUP__: [cleanup1, cleanup2]
    }

    hooks.beforeUnmount(mockWindow)
    expect(cleanup1).toHaveBeenCalled()
    expect(cleanup2).toHaveBeenCalled()
  })
})

describe('reportError', () => {
  it('should log error to console', () => {
    const consoleError = vi.spyOn(console, 'error')

    reportError({
      appName: 'test-app',
      phase: 'beforeLoad',
      error: 'Test error'
    })

    expect(consoleError).toHaveBeenCalled()
  })

  it('should call monitoring API if available', () => {
    const captureException = vi.fn()
    window.__MONITORING__ = { captureException }

    reportError({
      appName: 'test-app',
      phase: 'afterMount',
      error: 'Mount error'
    })

    expect(captureException).toHaveBeenCalled()
  })
})
```

### 7.2 集成测试

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { WujieVue } from 'wujie-vue3'
import { createLifecycleHooks } from '@k8s-agent/shared/config/wujie-lifecycle.js'

describe('Lifecycle Integration', () => {
  it('should handle complete lifecycle flow', async () => {
    const lifecycle = {
      loadCalled: false,
      mountCalled: false,
      unmountCalled: false
    }

    const hooks = createLifecycleHooks('integration-test', {
      onLoadSuccess: () => { lifecycle.loadCalled = true },
      onMountSuccess: () => { lifecycle.mountCalled = true },
      onUnmountSuccess: () => { lifecycle.unmountCalled = true }
    })

    const mockWindow = {
      document: {
        readyState: 'complete',
        querySelector: () => ({ id: 'app' })
      }
    }

    // 1. beforeLoad
    await hooks.beforeLoad(mockWindow)
    expect(lifecycle.loadCalled).toBe(true)

    // 2. afterMount
    await hooks.afterMount(mockWindow)
    expect(lifecycle.mountCalled).toBe(true)
    expect(mockWindow.__WUJIE_MOUNT_SUCCESS__).toBe(true)

    // 3. beforeUnmount
    hooks.beforeUnmount(mockWindow)
    expect(lifecycle.unmountCalled).toBe(true)
    expect(mockWindow.__WUJIE_MOUNT_SUCCESS__).toBeUndefined()
  })
})
```

---

## 8. 迁移指南

### 8.1 从硬编码钩子迁移

**迁移前**:

```javascript
// ❌ 旧代码(硬编码,无错误处理)
export const wujieConfig = {
  apps: [
    {
      name: 'system-app',
      url: '//localhost:3005',
      beforeLoad: (appWindow) => {
        console.log('system-app beforeLoad')
      },
      afterMount: (appWindow) => {
        console.log('system-app afterMount')
      }
    }
  ]
}
```

**迁移后**:

```javascript
// ✅ 新代码(使用标准钩子)
import { createLifecycleHooks } from '@k8s-agent/shared/config/wujie-lifecycle.js'

export const wujieConfig = {
  apps: [
    {
      name: 'system-app',
      url: '//localhost:3005',
      ...createLifecycleHooks('system-app')
    }
  ]
}
```

### 8.2 迁移检查清单

- [ ] 删除所有硬编码的`beforeLoad`/`afterMount`/`beforeUnmount`
- [ ] 导入`createLifecycleHooks`函数
- [ ] 为每个微应用调用`createLifecycleHooks(appName)`
- [ ] 将自定义逻辑移到`options`回调中
- [ ] 测试所有生命周期阶段正常工作
- [ ] 验证错误处理(模拟加载/挂载失败)
- [ ] 验证清理机制(检查资源是否释放)

---

## 9. 验收标准

- [ ] `createLifecycleHooks()`正确返回3个钩子函数
- [ ] `beforeLoad`错误不会导致白屏
- [ ] `afterMount`错误显示ErrorBoundary UI
- [ ] `beforeUnmount`自动执行所有清理函数
- [ ] `reportError()`正确上报到监控平台
- [ ] `showErrorBoundary()`显示用户友好的错误提示
- [ ] 所有6个微应用成功迁移到标准钩子
- [ ] 单元测试覆盖率≥95%
- [ ] 集成测试验证完整生命周期流程

---

**签署**:
- 开发团队: ___________
- 审核人: ___________
- 日期: 2025-10-10
