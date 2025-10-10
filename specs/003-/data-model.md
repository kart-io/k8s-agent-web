# Phase 1: Data Models & Entities

**Feature**: 项目结构优化 - 文档重组与配置标准化
**Created**: 2025-10-10
**Status**: ✅ Models Defined

## Purpose

本文档定义Feature 003中涉及的配置实体、数据结构和状态模型。这些模型将用于指导实现统一的API配置、Wujie生命周期配置、样式变量系统等。

---

## 1. API配置模型

### 1.1 API配置实体 (ApiConfig)

**文件位置**: `shared/src/config/api.config.js`

```javascript
/**
 * API配置实体
 * @typedef {Object} ApiConfig
 */
export const ApiConfig = {
  /** 基础URL配置 */
  baseURL: {
    /** 开发环境API地址 */
    development: 'http://localhost:8080/api',

    /** 测试环境API地址 */
    test: 'https://test-api.k8s-agent.com',

    /** 生产环境API地址 */
    production: 'https://api.k8s-agent.com'
  },

  /** 请求超时时间(毫秒) */
  timeout: 10000,

  /** 请求重试配置 */
  retry: {
    /** 最大重试次数 */
    maxRetries: 3,

    /** 重试延迟(毫秒) */
    retryDelay: 1000,

    /** 需要重试的HTTP状态码 */
    retryableStatus: [408, 429, 500, 502, 503, 504]
  },

  /** 请求头配置 */
  headers: {
    /** 通用请求头 */
    common: {
      'Content-Type': 'application/json;charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },

    /** 需要认证的请求头(运行时注入token) */
    authenticated: {
      'Authorization': null // 运行时设置: `Bearer ${token}`
    }
  },

  /** 错误处理配置 */
  errorHandling: {
    /** 是否显示全局错误提示 */
    showGlobalMessage: true,

    /** 需要忽略的错误码(不显示提示) */
    ignoredErrorCodes: [401, 403],

    /** 自定义错误消息映射 */
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
```

### 1.2 环境变量模型 (EnvironmentConfig)

**文件位置**: `.env`, `.env.development`, `.env.production`

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000
VITE_ENABLE_MOCK=true
VITE_ENABLE_DEVTOOLS=true

# .env.production
VITE_API_BASE_URL=https://api.k8s-agent.com
VITE_API_TIMEOUT=15000
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEVTOOLS=false
```

**访问方式**:

```javascript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')
```

---

## 2. Wujie配置模型

### 2.1 微应用配置实体 (MicroAppConfig)

**文件位置**: `main-app/src/config/micro-apps.config.js`

```javascript
/**
 * 微应用配置实体
 * @typedef {Object} MicroAppConfig
 */
export const MicroAppConfig = {
  /** 应用唯一标识(与name字段保持一致) */
  name: 'dashboard-app',

  /** 开发服务器端口 */
  port: 3001,

  /** 路由基础路径 */
  basePath: '/dashboard',

  /** 应用入口URL(支持多环境) */
  entry: {
    development: '//localhost:3001',
    test: '//test-server:3001',
    production: '/micro-apps/dashboard/'
  },

  /** 应用元数据 */
  metadata: {
    /** 应用版本 */
    version: '1.0.0',

    /** 负责团队 */
    owner: 'team-platform',

    /** 应用描述 */
    description: 'Dashboard micro-application',

    /** 上次更新时间 */
    lastUpdated: '2025-10-10'
  },

  /** Wujie特定配置 */
  wujie: {
    /** 是否执行应用内script */
    exec: true,

    /** 是否保活模式(缓存应用状态) */
    alive: true,

    /** 是否同步路由 */
    sync: true,

    /** 预加载优先级 */
    preloadPriority: 'immediate' // 'immediate' | 'idle' | 'onDemand'
  }
}
```

### 2.2 生命周期钩子配置 (LifecycleHooksConfig)

**文件位置**: `shared/src/config/wujie-lifecycle.js`

```javascript
/**
 * 生命周期钩子配置选项
 * @typedef {Object} LifecycleHooksOptions
 */
export const LifecycleHooksOptions = {
  /** beforeLoad成功回调 */
  onLoadSuccess: async (appWindow) => {
    // 自定义预加载逻辑
  },

  /** beforeLoad错误回调 */
  onLoadError: (error) => {
    // 自定义错误处理
  },

  /** afterMount成功回调 */
  onMountSuccess: (appWindow) => {
    // 自定义挂载后逻辑
  },

  /** afterMount错误回调 */
  onMountError: (error) => {
    // 自定义错误处理
  },

  /** beforeUnmount成功回调 */
  onUnmountSuccess: (appWindow) => {
    // 自定义卸载清理逻辑
  }
}
```

### 2.3 预加载配置模型 (PreloadConfig)

**文件位置**: `main-app/src/micro/preload.js`

```javascript
/**
 * 预加载优先级配置
 * @typedef {Object} PreloadPriority
 */
export const PreloadPriority = {
  /** P1: 立即预加载(用户登录后立即访问) */
  immediate: ['dashboard-app', 'agent-app'],

  /** P2: 空闲预加载(requestIdleCallback) */
  idle: ['cluster-app', 'system-app'],

  /** P3: 按需预加载(路由守卫触发) */
  onDemand: ['monitor-app', 'image-build-app']
}
```

---

## 3. 样式变量模型

### 3.1 颜色系统模型 (ColorTokens)

**文件位置**: `shared/src/assets/styles/variables.scss`

```scss
/**
 * 颜色令牌(Tokens)
 */
$color-tokens: (
  // 主题色
  'primary': #1890ff,
  'success': #52c41a,
  'warning': #faad14,
  'error': #f5222d,
  'info': #1890ff,

  // 文本色
  'text-primary': rgba(0, 0, 0, 0.85),
  'text-secondary': rgba(0, 0, 0, 0.65),
  'text-disabled': rgba(0, 0, 0, 0.25),

  // 边框/分割线
  'border': #d9d9d9,
  'divider': #f0f0f0,

  // 背景色
  'background': #fafafa,
  'background-light': #ffffff
);
```

**对应CSS变量**:

```css
:root {
  --color-primary: #1890ff;
  --color-success: #52c41a;
  /* ... 其他变量 */
}
```

### 3.2 间距系统模型 (SpacingScale)

```scss
/**
 * 间距比例(基于8px基准)
 */
$spacing-scale: (
  'xs': 4px,   // 0.5x
  'sm': 8px,   // 1x (基准)
  'md': 16px,  // 2x
  'lg': 24px,  // 3x
  'xl': 32px,  // 4x
  'xxl': 48px  // 6x
);
```

### 3.3 排版系统模型 (TypographyScale)

```scss
/**
 * 字体大小比例
 */
$font-size-scale: (
  'xs': 12px,
  'sm': 13px,
  'base': 14px, // 基准
  'lg': 16px,
  'xl': 20px,
  'xxl': 24px,
  'xxxl': 30px
);

/**
 * 行高比例
 */
$line-height-scale: (
  'tight': 1.2,
  'base': 1.5715,
  'relaxed': 1.8
);
```

---

## 4. 状态管理模型

### 4.1 用户状态模型 (UserState)

**文件位置**: `main-app/src/store/user.js`

```javascript
/**
 * 用户状态模型
 * @typedef {Object} UserState
 */
export const UserState = {
  /** 认证token */
  token: null, // string | null

  /** 用户信息 */
  userInfo: {
    /** 用户ID */
    id: null, // number | null

    /** 用户名 */
    username: '', // string

    /** 显示名称 */
    displayName: '', // string

    /** 邮箱 */
    email: '', // string

    /** 头像URL */
    avatar: '', // string

    /** 角色列表 */
    roles: [], // string[]

    /** 部门 */
    department: '' // string
  },

  /** 权限列表 */
  permissions: [], // string[]

  /** 动态菜单 */
  menus: [], // MenuItem[]

  /** 登录状态 */
  isAuthenticated: false // boolean
}
```

### 4.2 菜单项模型 (MenuItem)

```javascript
/**
 * 菜单项模型
 * @typedef {Object} MenuItem
 */
export const MenuItem = {
  /** 菜单ID */
  id: '', // string

  /** 菜单标题 */
  title: '', // string

  /** 菜单图标(Ant Design图标名称) */
  icon: '', // string

  /** 路由路径 */
  path: '', // string

  /** 组件名称 */
  component: '', // 'MicroAppPlaceholder' | 'SubMenu' | null

  /** 关联的微应用名称 */
  microApp: '', // string | null

  /** 父菜单ID */
  parentId: null, // string | null

  /** 子菜单 */
  children: [], // MenuItem[]

  /** 排序权重 */
  sort: 0, // number

  /** 是否隐藏 */
  hidden: false, // boolean

  /** 权限标识 */
  permission: '' // string
}
```

---

## 5. EventBus事件模型

### 5.1 路由同步事件 (RouteSyncEvent)

**文件位置**: `shared/src/core/route-sync.js`

```javascript
/**
 * 路由同步事件载荷
 * @typedef {Object} RouteSyncEventPayload
 */
export const RouteSyncEventPayload = {
  /** 事件类型 */
  type: 'sync', // 'sync' | 'report' | 'error'

  /** 源应用名称 */
  sourceApp: 'main-app', // string

  /** 目标应用名称 */
  targetApp: 'system-app', // string

  /** 目标路径 */
  path: '/users', // string

  /** 完整路径(包含query/hash) */
  fullPath: '/users?page=1#list', // string

  /** 路由元信息 */
  meta: {
    title: '用户管理',
    // ... 其他meta字段
  },

  /** 事件时间戳 */
  timestamp: 1234567890123 // number
}
```

**事件名称规范**:

```javascript
// 主应用 → 微应用
const eventName = `${targetApp}-route-change` // 例: 'system-app-route-change'

// 微应用 → 主应用(上报)
const reportEventName = `route:report` // 固定名称
```

### 5.2 状态同步事件 (StateSyncEvent)

**文件位置**: `main-app/src/store/shared-state.js`

```javascript
/**
 * 状态同步事件载荷
 * @typedef {Object} StateSyncEventPayload
 */
export const StateSyncEventPayload = {
  /** 命名空间 */
  namespace: 'user', // 'user' | 'notification' | 'permission' | 'system'

  /** 状态键名 */
  key: 'info', // string

  /** 状态值 */
  value: { id: 123, avatar: '/avatar.png' }, // any

  /** 事件时间戳 */
  timestamp: 1234567890123 // number
}
```

**事件名称**:

```javascript
const eventName = 'state:update' // 固定名称
```

### 5.3 错误上报事件 (ErrorReportEvent)

**文件位置**: `main-app/src/utils/error-reporter.js`

```javascript
/**
 * 错误上报事件载荷
 * @typedef {Object} ErrorReportEventPayload
 */
export const ErrorReportEventPayload = {
  /** 应用名称 */
  appName: 'system-app', // string

  /** 错误类型 */
  errorType: 'runtime', // 'load' | 'runtime' | 'navigation'

  /** 错误消息 */
  message: 'Failed to fetch micro-app resource', // string

  /** 错误堆栈 */
  stack: 'Error: ...\n  at ...', // string

  /** 生命周期阶段 */
  phase: 'afterMount', // 'beforeLoad' | 'afterMount' | 'beforeUnmount' | null

  /** 事件时间戳 */
  timestamp: 1234567890123 // number
}
```

---

## 6. 文档重组模型

### 6.1 文档分类结构 (DocumentStructure)

**目标结构**: `docs/[category]/[filename].md`

```javascript
/**
 * 文档分类映射
 * @typedef {Object} DocumentCategories
 */
export const DocumentCategories = {
  /** 架构设计类(8个文档) */
  architecture: [
    'WUJIE_MIGRATION_COMPLETE.md',
    'MIGRATION_TO_WUJIE.md',
    'ROOT_CAUSE_ANALYSIS.md',
    'SHARED_COMPONENTS_MIGRATION.md',
    'PROXY_ISSUE_FIX.md',
    'DYNAMIC_MENU_GUIDE.md',
    'SUBMENU_GUIDE.md',
    'main-app/DYNAMIC_ROUTES.md'
  ],

  /** 功能使用类(12个文档) */
  features: [
    'QUICK_START.md',
    'START_GUIDE.md',
    'MAKEFILE_GUIDE.md',
    'COMPONENTS_GUIDE.md',
    'MOCK_GUIDE.md',
    'SUB_APPS_MOCK_GUIDE.md',
    // ... 其他功能文档
  ],

  /** 故障排查类(3个文档) */
  troubleshooting: [
    'TROUBLESHOOTING.md',
    'COMMON_ISSUES.md',
    'DEBUG_GUIDE.md'
  ],

  /** 组件文档类(剩余文档) */
  components: [
    // 微应用特定文档
  ]
}
```

### 6.2 文档元数据模型 (DocumentMetadata)

每个迁移的文档应在顶部添加元数据：

```markdown
---
title: 文档标题
category: architecture | features | troubleshooting | components
lastUpdated: 2025-10-10
originalPath: /ORIGINAL_PATH.md
migrationDate: 2025-10-10
---

# 文档标题

[正文内容...]
```

---

## 7. 依赖版本锁定模型

### 7.1 统一依赖版本表 (DependencyVersions)

**文件位置**: `package.json` (根目录 + 所有workspace包)

```javascript
/**
 * 统一依赖版本
 * @typedef {Object} DependencyVersions
 */
export const DependencyVersions = {
  /** 核心框架 */
  vue: '^3.3.4',
  vite: '^5.0.4', // 所有应用统一升级到5.0.4

  /** Vue生态 */
  'vue-router': '^4.2.5',
  pinia: '^2.1.7',

  /** UI库 */
  'ant-design-vue': '^4.0.7',
  '@ant-design/icons-vue': '^7.0.1',

  /** 微前端 */
  wujie: '^1.0.29',
  'wujie-vue3': '^1.0.29',

  /** 工具库 */
  axios: '^1.6.2',
  dayjs: '^1.11.9',

  /** 表格组件 */
  'vxe-table': '^4.6.0',
  'vxe-table-plugin-antd': '^4.0.0',
  'xe-utils': '^3.5.0',

  /** 构建工具 */
  '@vitejs/plugin-vue': '^5.0.0',
  sass: '^1.69.5',

  /** 测试工具 */
  vitest: '^1.0.4',
  '@playwright/test': '^1.40.1'
}
```

---

## 8. 性能监控模型

### 8.1 预加载性能指标 (PreloadMetrics)

```javascript
/**
 * 预加载性能指标
 * @typedef {Object} PreloadMetrics
 */
export const PreloadMetrics = {
  /** 应用名称 */
  appName: 'dashboard-app', // string

  /** 预加载优先级 */
  priority: 'immediate', // 'immediate' | 'idle' | 'onDemand'

  /** 预加载开始时间 */
  startTime: 1234567890123, // number (performance.now())

  /** 预加载结束时间 */
  endTime: 1234567890623, // number

  /** 预加载耗时(毫秒) */
  duration: 500, // number

  /** 是否成功 */
  success: true, // boolean

  /** 错误信息(如果失败) */
  error: null // string | null
}
```

### 8.2 EventBus频率监控指标 (EventBusMetrics)

```javascript
/**
 * EventBus频率监控指标
 * @typedef {Object} EventBusMetrics
 */
export const EventBusMetrics = {
  /** 每秒事件数 */
  eventsPerSecond: 85, // number

  /** 阈值 */
  threshold: 100, // number

  /** 总事件类型数 */
  totalEventTypes: 12, // number

  /** 最高频事件列表 */
  topEvents: [
    { name: 'route-sync', count: 45 },
    { name: 'state-update', count: 30 }
  ], // Array<{ name: string, count: number }>

  /** 健康状态 */
  isHealthy: true, // boolean

  /** 检测时间戳 */
  timestamp: 1234567890123 // number
}
```

---

## Summary

本文档定义了Feature 003涉及的8类数据模型：

1. **API配置模型** - 统一API配置结构(ApiConfig/EnvironmentConfig)
2. **Wujie配置模型** - 微应用配置、生命周期钩子、预加载配置
3. **样式变量模型** - 颜色/间距/排版系统Tokens
4. **状态管理模型** - 用户状态、菜单项结构
5. **EventBus事件模型** - 路由同步、状态同步、错误上报事件载荷
6. **文档重组模型** - 文档分类结构和元数据
7. **依赖版本锁定模型** - 统一依赖版本表
8. **性能监控模型** - 预加载和EventBus监控指标

这些模型为Phase 2实现提供了清晰的数据结构规范。

**下一步**: 生成`contracts/`目录下的API契约文档。
