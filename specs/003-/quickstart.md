# Quick Start Guide: Feature 003 实施指南

**Feature**: 项目结构优化 - 文档重组与配置标准化
**Created**: 2025-10-10
**Target Audience**: 开发者

## Purpose

本指南帮助开发者快速理解并实施Feature 003的各项优化措施。包括API配置统一、Wujie生命周期标准化、样式变量系统等7个核心改进。

---

## 目录

1. [前置准备](#1-前置准备)
2. [API配置统一](#2-api配置统一)
3. [Wujie生命周期标准化](#3-wujie生命周期标准化)
4. [Wujie预加载优化](#4-wujie预加载优化)
5. [Shadow DOM集成](#5-shadow-dom集成)
6. [EventBus监控](#6-eventbus监控)
7. [依赖提升优化](#7-依赖提升优化)
8. [Sass变量系统](#8-sass变量系统)
9. [Vite 5升级](#9-vite-5升级)
10. [文档重组](#10-文档重组)
11. [验收与测试](#11-验收与测试)

---

## 1. 前置准备

### 1.1 环境要求

- Node.js >= 18.x
- pnpm >= 8.x
- Git

### 1.2 备份当前代码

```bash
# 创建新分支
git checkout -b feature/003-project-optimization

# 确认当前分支
git branch
```

### 1.3 安装依赖

```bash
# 根目录执行
pnpm install
```

---

## 2. API配置统一

### 2.1 创建统一配置文件

**步骤1**: 创建`shared/src/config/api.config.js`

```bash
touch shared/src/config/api.config.js
```

**步骤2**: 复制配置模板(参考`data-model.md` > API配置模型)

```javascript
// shared/src/config/api.config.js
export const ApiConfig = {
  baseURL: {
    development: 'http://localhost:8080/api',
    test: 'https://test-api.k8s-agent.com',
    production: 'https://api.k8s-agent.com'
  },
  timeout: 10000,
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatus: [408, 429, 500, 502, 503, 504]
  },
  headers: {
    common: {
      'Content-Type': 'application/json;charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    authenticated: {
      'Authorization': null
    }
  },
  errorHandling: {
    showGlobalMessage: true,
    ignoredErrorCodes: [401, 403],
    customMessages: {
      401: '登录已过期,请重新登录',
      403: '无权访问此资源',
      404: '请求的资源不存在',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用'
    }
  }
}

export function getBaseURL(env = import.meta.env.MODE) {
  return ApiConfig.baseURL[env] || ApiConfig.baseURL.development
}

export function createAxiosInstance(options = {}) {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: ApiConfig.timeout,
    ...options
  })

  // 请求拦截器: 注入token
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // 响应拦截器: 错误处理 + 重试
  instance.interceptors.response.use(
    response => response,
    async error => {
      // 自动重试逻辑
      const config = error.config
      if (!config || !config.retry) {
        config.retry = { count: 0 }
      }

      if (
        ApiConfig.retry.retryableStatus.includes(error.response?.status) &&
        config.retry.count < ApiConfig.retry.maxRetries
      ) {
        config.retry.count++
        await new Promise(resolve => setTimeout(resolve, ApiConfig.retry.retryDelay))
        return instance(config)
      }

      // 401处理
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }

      // 全局错误提示
      if (
        ApiConfig.errorHandling.showGlobalMessage &&
        !ApiConfig.errorHandling.ignoredErrorCodes.includes(error.response?.status)
      ) {
        const msg = ApiConfig.errorHandling.customMessages[error.response?.status] || '请求失败'
        message.error(msg)
      }

      return Promise.reject(error)
    }
  )

  return instance
}
```

### 2.2 迁移各应用的API配置

**迁移checklist** (对所有7个应用执行):

```bash
# 示例: agent-app
cd agent-app

# 1. 删除旧的request.js
rm src/utils/request.js  # 或 src/api/request.js

# 2. 更新所有API文件
# 查找所有使用axios.create的文件
grep -r "axios.create" src/

# 3. 替换为统一配置
# 将以下代码:
#   import axios from 'axios'
#   const api = axios.create({ baseURL: '...', timeout: 10000 })
#
# 替换为:
#   import { createAxiosInstance } from '@k8s-agent/shared/config/api.config.js'
#   const api = createAxiosInstance()
```

**示例迁移**:

```javascript
// ❌ 迁移前: agent-app/src/api/agent.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function getAgentList(params) {
  const response = await api.get('/agents', { params })
  return response.data
}

// ✅ 迁移后: agent-app/src/api/agent.js
import { createAxiosInstance } from '@k8s-agent/shared/config/api.config.js'

const api = createAxiosInstance()

export async function getAgentList(params) {
  const response = await api.get('/agents', { params })
  return response.data
}
```

### 2.3 验证

```bash
# 启动应用测试API调用
pnpm dev

# 检查Console,应看到统一的错误处理消息
# 检查Network,应看到正确的Authorization头
```

---

## 3. Wujie生命周期标准化

### 3.1 创建生命周期钩子模板

**步骤1**: 创建`shared/src/config/wujie-lifecycle.js`

```bash
touch shared/src/config/wujie-lifecycle.js
```

**步骤2**: 复制实现代码(参考`research.md` > Topic 1)

关键函数:

```javascript
export function createLifecycleHooks(appName, options = {}) {
  const { onLoadSuccess, onLoadError, onMountSuccess, onMountError, onUnmountSuccess } = options

  return {
    beforeLoad: async (appWindow) => {
      console.log(`[Wujie] ${appName} beforeLoad`)
      try {
        // 等待DOM Ready
        if (appWindow.document.readyState === 'loading') {
          await new Promise(resolve => {
            appWindow.addEventListener('DOMContentLoaded', resolve, { once: true })
          })
        }

        await onLoadSuccess?.(appWindow)
        console.log(`[Wujie] ${appName} beforeLoad completed`)
      } catch (error) {
        console.error(`[Wujie] ${appName} beforeLoad error:`, error)
        reportError({ appName, phase: 'beforeLoad', error: error.message, stack: error.stack })
        onLoadError?.(error)
      }
    },

    afterMount: async (appWindow) => {
      // 实现参考research.md
    },

    beforeUnmount: (appWindow) => {
      // 实现参考research.md
    }
  }
}

export function reportError(report) {
  console.error(`[Wujie Error] ${report.appName} - ${report.phase}:`, report)
  // 集成Sentry等监控平台
}

export function showErrorBoundary(appName, error) {
  // 显示错误边界UI
}
```

### 3.2 更新wujie-config.js

```javascript
// main-app/src/micro/wujie-config.js
import { createLifecycleHooks } from '@k8s-agent/shared/config/wujie-lifecycle.js'
import { MICRO_APPS, getMicroAppUrl } from '@/config/micro-apps.config'

export const wujieConfig = {
  apps: Object.values(MICRO_APPS).map(app => ({
    name: app.name,
    url: getMicroAppUrl(app.name),
    exec: app.wujie.exec,
    alive: app.wujie.alive,
    sync: app.wujie.sync,

    // ✅ 使用标准生命周期钩子
    ...createLifecycleHooks(app.name, {
      onLoadSuccess: async (appWindow) => {
        // 可选: 应用特定的预加载逻辑
      },
      onLoadError: (error) => {
        message.error(`${app.name} 加载失败`)
      }
    })
  }))
}
```

### 3.3 验证

```bash
# 启动应用
pnpm dev

# 查看Console,应看到生命周期日志:
# [Wujie] dashboard-app beforeLoad
# [Wujie] dashboard-app beforeLoad completed
# [Wujie] dashboard-app afterMount
# [Wujie] dashboard-app afterMount completed
```

---

## 4. Wujie预加载优化

### 4.1 创建预加载配置

```bash
touch main-app/src/micro/preload.js
```

**实现代码**:

```javascript
// main-app/src/micro/preload.js
import { preloadApp } from 'wujie'
import { MICRO_APPS, getMicroAppUrl } from '@/config/micro-apps.config'

const requestIdleCallback = window.requestIdleCallback || function(cb) {
  const start = Date.now()
  return setTimeout(() => {
    cb({ didTimeout: false, timeRemaining: () => Math.max(0, 50 - (Date.now() - start)) })
  }, 1)
}

const PRELOAD_PRIORITY = {
  immediate: ['dashboard-app', 'agent-app'],
  idle: ['cluster-app', 'system-app'],
  onDemand: ['monitor-app', 'image-build-app']
}

export function preloadImmediateApps() {
  console.log('[Preload] Starting immediate preload...')

  PRELOAD_PRIORITY.immediate.forEach(appName => {
    const config = MICRO_APPS[appName]
    if (!config) return

    const startTime = performance.now()
    preloadApp({
      name: config.name,
      url: getMicroAppUrl(appName)
    }).then(() => {
      const duration = performance.now() - startTime
      console.log(`[Preload] ${appName} preloaded (${duration.toFixed(0)}ms)`)
    }).catch(error => {
      console.error(`[Preload] ${appName} preload failed:`, error)
    })
  })
}

export function preloadIdleApps() {
  console.log('[Preload] Scheduling idle preload...')

  requestIdleCallback((deadline) => {
    PRELOAD_PRIORITY.idle.forEach(appName => {
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
      }
    })
  }, { timeout: 3000 })
}

export function initPreloadStrategy() {
  preloadImmediateApps()
  preloadIdleApps()
}
```

### 4.2 集成到登录流程

```javascript
// main-app/src/store/user.js
import { initPreloadStrategy } from '@/micro/preload'

export const userStore = defineStore('user', {
  actions: {
    async login(credentials) {
      const { token, userInfo } = await loginApi(credentials)
      this.token = token
      this.userInfo = userInfo

      // ✅ 登录成功后预加载微应用
      initPreloadStrategy()

      return { token, userInfo }
    }
  }
})
```

---

## 5. Shadow DOM集成

### 5.1 创建usePopupContainer composable

```bash
touch shared/src/composables/usePopupContainer.js
```

```javascript
// shared/src/composables/usePopupContainer.js
export function usePopupContainer() {
  if (!window.__POWERED_BY_WUJIE__) {
    return undefined
  }

  return (triggerNode) => {
    let node = triggerNode
    while (node) {
      if (node.shadowRoot) return node
      if (node.host) return node.host
      node = node.parentNode
    }
    return triggerNode?.parentNode || document.body
  }
}
```

### 5.2 更新各微应用的App.vue

**迁移checklist** (对所有6个微应用执行):

```vue
<!-- 例: system-app/src/App.vue -->
<template>
  <a-config-provider :getPopupContainer="getPopupContainer">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { usePopupContainer } from '@k8s-agent/shared/composables'

const getPopupContainer = usePopupContainer()
</script>
```

### 5.3 验证

```bash
# 启动应用
pnpm dev

# 测试Select下拉框、DatePicker等组件
# 确认弹窗位置正确,样式正常
```

---

## 6. EventBus监控

### 6.1 创建监控器

```bash
touch shared/src/utils/event-bus-monitor.js
```

**实现代码**(参考`research.md` > Topic 4):

```javascript
export class EventBusMonitor {
  constructor(bus, options = {}) {
    this.bus = bus
    this.threshold = options.threshold || 100
    this.windowSize = options.windowSize || 1000
    this.enabled = options.enabled ?? true

    this.eventCounts = new Map()
    this.eventTypes = new Map()
    this.originalEmit = null

    if (this.enabled) {
      this.install()
    }
  }

  install() {
    if (!this.bus || !this.bus.$emit) {
      console.warn('[EventBusMonitor] Bus not found')
      return
    }

    this.originalEmit = this.bus.$emit.bind(this.bus)
    this.bus.$emit = (...args) => {
      const [eventName] = args
      this.recordEvent(eventName)
      return this.originalEmit(...args)
    }

    console.log('[EventBusMonitor] Installed successfully')
  }

  recordEvent(eventName) {
    // 实现参考research.md
  }

  getReport() {
    // 返回性能报告
  }
}
```

### 6.2 启用监控

```javascript
// main-app/src/main.js
import WujieVue from 'wujie-vue3'
import { EventBusMonitor } from '@k8s-agent/shared/utils/event-bus-monitor.js'

app.use(WujieVue)

const monitor = new EventBusMonitor(window.WujieVue.bus, {
  threshold: 100,
  enabled: import.meta.env.MODE !== 'production'
})

if (import.meta.env.MODE !== 'production') {
  window.__EVENT_BUS_MONITOR__ = monitor
}
```

### 6.3 查看监控报告

```javascript
// 浏览器Console中执行
window.__EVENT_BUS_MONITOR__.getReport()

// 输出:
// {
//   eventsPerSecond: 85,
//   threshold: 100,
//   isHealthy: true,
//   topEvents: [...]
// }
```

---

## 7. 依赖提升优化

### 7.1 创建.npmrc配置

```bash
touch .npmrc
```

```ini
# .npmrc
# 提升Vue生态依赖
public-hoist-pattern[]=*vue*
public-hoist-pattern[]=*pinia*
public-hoist-pattern[]=*@vue/*

# 提升Ant Design Vue
public-hoist-pattern[]=*ant-design-vue*
public-hoist-pattern[]=*@ant-design/*

# 提升Wujie
public-hoist-pattern[]=wujie*

# 提升工具库
public-hoist-pattern[]=axios
public-hoist-pattern[]=dayjs

# 提升VXE Table
public-hoist-pattern[]=vxe-table*
public-hoist-pattern[]=xe-utils

# 其他配置
strict-peer-dependencies=false
shared-workspace-lockfile=true
symlink=true
engine-strict=false
```

### 7.2 重新安装依赖

```bash
# 删除所有node_modules和lockfile
rm -rf node_modules pnpm-lock.yaml
find . -name "node_modules" -type d -exec rm -rf {} +

# 重新安装
pnpm install

# 验证提升效果
ls -la node_modules | grep -E "vue|ant-design|pinia"
# 应该看到这些包在根node_modules中
```

### 7.3 检查重复依赖

```bash
# 检查vue是否重复安装
pnpm why vue

# 应该显示:
# vue 3.3.4
# └── (root)

# 检查其他关键依赖
pnpm why ant-design-vue
pnpm why pinia
```

---

## 8. Sass变量系统

### 8.1 创建变量文件

```bash
mkdir -p shared/src/assets/styles
touch shared/src/assets/styles/variables.scss
touch shared/src/assets/styles/mixins.scss
```

**variables.scss**(参考`research.md` > Topic 6):

```scss
// shared/src/assets/styles/variables.scss

// 颜色系统
$color-primary: #1890ff;
$color-success: #52c41a;
$color-warning: #faad14;
$color-error: #f5222d;

:root {
  --color-primary: #{$color-primary};
  --color-success: #{$color-success};
  --color-warning: #{$color-warning};
  --color-error: #{$color-error};
}

// 间距系统
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

// ... 其他变量
```

**mixins.scss**:

```scss
// shared/src/assets/styles/mixins.scss
@import './variables.scss';

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

@mixin card {
  background: #fff;
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-card);
  padding: var(--spacing-md);
}
```

### 8.2 配置Vite自动导入

**更新所有微应用的vite.config.js**:

```javascript
// 例: system-app/vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import '@k8s-agent/shared/assets/styles/variables.scss';
          @import '@k8s-agent/shared/assets/styles/mixins.scss';
        `
      }
    }
  }
})
```

### 8.3 使用样式变量

```vue
<style lang="scss" scoped>
.user-card {
  @include card; // 使用mixin
  margin-bottom: $spacing-md; // 使用Sass变量

  .user-name {
    color: var(--color-text-primary); // 使用CSS变量(穿透Shadow DOM)
    @include text-ellipsis(2);
  }
}
</style>
```

---

## 9. Vite 5升级

### 9.1 批量升级Vite版本

```bash
# 升级所有workspace包的Vite到5.0.4
pnpm up -r vite@^5.0.4

# 升级相关插件
pnpm up -r @vitejs/plugin-vue@^5.0.0
```

### 9.2 检查废弃API

```bash
# 搜索废弃的API
grep -r "import.meta.globEager" .

# 如果找到,替换为:
# import.meta.glob('*', { eager: true })
```

### 9.3 验证构建

```bash
# 测试所有应用的构建
pnpm build

# 检查构建产物
ls -lh main-app/dist/assets/*.js
ls -lh agent-app/dist/assets/*.js
```

---

## 10. 文档重组

### 10.1 创建docs目录结构

```bash
mkdir -p docs/{architecture,features,troubleshooting,components}
```

### 10.2 迁移文档

**批量移动脚本**:

```bash
# architecture类(8个文档)
mv WUJIE_MIGRATION_COMPLETE.md docs/architecture/
mv MIGRATION_TO_WUJIE.md docs/architecture/
mv ROOT_CAUSE_ANALYSIS.md docs/architecture/
mv SHARED_COMPONENTS_MIGRATION.md docs/architecture/
mv PROXY_ISSUE_FIX.md docs/architecture/
mv DYNAMIC_MENU_GUIDE.md docs/architecture/
mv SUBMENU_GUIDE.md docs/architecture/
mv main-app/DYNAMIC_ROUTES.md docs/architecture/

# features类(12个文档)
mv QUICK_START.md docs/features/
mv START_GUIDE.md docs/features/
mv MAKEFILE_GUIDE.md docs/features/
mv COMPONENTS_GUIDE.md docs/features/
mv MOCK_GUIDE.md docs/features/
mv SUB_APPS_MOCK_GUIDE.md docs/features/

# troubleshooting类(3个文档)
mv TROUBLESHOOTING.md docs/troubleshooting/
mv COMMON_ISSUES.md docs/troubleshooting/
mv DEBUG_GUIDE.md docs/troubleshooting/
```

### 10.3 创建文档索引

```bash
touch docs/README.md
```

```markdown
# K8s Agent Web - 文档中心

## 架构设计

- [Wujie迁移完整文档](architecture/WUJIE_MIGRATION_COMPLETE.md)
- [Wujie迁移步骤](architecture/MIGRATION_TO_WUJIE.md)
- [根因分析](architecture/ROOT_CAUSE_ANALYSIS.md)
- [共享组件迁移](architecture/SHARED_COMPONENTS_MIGRATION.md)
- [代理问题修复](architecture/PROXY_ISSUE_FIX.md)
- [动态菜单指南](architecture/DYNAMIC_MENU_GUIDE.md)
- [子菜单指南](architecture/SUBMENU_GUIDE.md)
- [动态路由实现](architecture/DYNAMIC_ROUTES.md)

## 功能使用

- [快速开始](features/QUICK_START.md)
- [启动指南](features/START_GUIDE.md)
- [Makefile指南](features/MAKEFILE_GUIDE.md)
- [组件指南](features/COMPONENTS_GUIDE.md)
- [Mock数据指南](features/MOCK_GUIDE.md)
- [微应用Mock指南](features/SUB_APPS_MOCK_GUIDE.md)

## 故障排查

- [故障排查指南](troubleshooting/TROUBLESHOOTING.md)
- [常见问题](troubleshooting/COMMON_ISSUES.md)
- [调试指南](troubleshooting/DEBUG_GUIDE.md)
```

---

## 11. 验收与测试

### 11.1 单元测试

```bash
# 运行所有单元测试
pnpm test

# 运行特定模块测试
pnpm test shared/src/config/api.config.test.js
pnpm test shared/src/config/wujie-lifecycle.test.js
```

### 11.2 E2E测试

```bash
# 启动应用
pnpm dev

# 运行E2E测试
pnpm test:e2e

# 或手动测试场景:
# 1. 登录 → 验证API配置(检查Network)
# 2. 导航到/system/users → 验证路由同步(检查URL)
# 3. 更新用户头像 → 验证状态同步(检查其他应用是否更新)
# 4. 打开Select下拉框 → 验证Shadow DOM集成(检查弹窗位置)
```

### 11.3 性能检查

```bash
# 1. 检查预加载性能
# 打开Console,应看到:
# [Preload] dashboard-app preloaded (450ms)
# [Preload] agent-app preloaded (520ms)

# 2. 检查EventBus频率
window.__EVENT_BUS_MONITOR__.getReport()
# 应该显示 eventsPerSecond < 100

# 3. 检查依赖大小
du -sh node_modules
# 应该比优化前减少 ~200-300MB
```

### 11.4 验收checklist

```markdown
- [ ] API配置统一(所有7个应用使用createAxiosInstance)
- [ ] Wujie生命周期标准化(所有6个微应用使用createLifecycleHooks)
- [ ] Wujie预加载生效(登录后自动预加载2个P1应用)
- [ ] Shadow DOM集成(Ant Design组件弹窗位置正确)
- [ ] EventBus监控启用(开发环境可查看报告)
- [ ] 依赖提升生效(根node_modules包含vue/ant-design-vue/pinia)
- [ ] Sass变量系统可用(所有应用可使用共享变量/mixins)
- [ ] Vite 5升级完成(所有应用统一使用5.0.4)
- [ ] 文档重组完成(44个MD文档归类到docs/)
- [ ] 所有单元测试通过
- [ ] 所有E2E测试通过
```

---

## 12. 常见问题

### Q1: createAxiosInstance报错"Cannot find module"

**原因**: shared包未正确构建

**解决**:

```bash
cd shared
pnpm build
cd ..
pnpm install
```

### Q2: Vite 5升级后构建报错

**原因**: 可能有插件不兼容Vite 5

**解决**:

```bash
# 检查插件版本
pnpm list @vitejs/plugin-vue

# 确保版本>=5.0.0
pnpm up @vitejs/plugin-vue@^5.0.0
```

### Q3: 样式变量未生效

**原因**: Vite配置的additionalData路径错误

**解决**: 确保路径以`@k8s-agent/shared/`开头,不要使用相对路径

### Q4: 依赖提升后应用无法启动

**原因**: 某些包需要特定版本

**解决**:

```bash
# 检查错误日志
pnpm dev

# 如果是版本冲突,在.npmrc中添加排除规则:
# public-hoist-pattern[]=!problematic-package
```

---

## 13. 下一步

完成Feature 003实施后:

1. **提交代码**:

```bash
git add .
git commit -m "feat: 项目结构优化 - 完成Feature 003实施"
git push origin feature/003-project-optimization
```

2. **创建PR**:

- 标题: `Feature 003: 项目结构优化 - 文档重组与配置标准化`
- 描述: 引用`specs/003-/spec.md`中的成功标准
- 附上测试结果截图

3. **Code Review**: 请求团队成员审核

4. **合并到main**: PR通过后合并

---

## 14. 参考资料

- [Feature 003 规格说明](spec.md)
- [实施计划](plan.md)
- [技术研究](research.md)
- [数据模型](data-model.md)
- [API配置契约](contracts/api-config.contract.md)
- [Wujie生命周期契约](contracts/wujie-lifecycle.contract.md)
- [路由同步契约](contracts/route-events.contract.md)
- [状态同步契约](contracts/state-events.contract.md)

---

**祝实施顺利!** 🚀

如有问题,请参考`troubleshooting/`目录或联系项目负责人。
