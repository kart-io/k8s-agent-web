# 环境配置说明 (Environment Configuration Guide)

## 概述 (Overview)

本项目使用 Vite 的环境变量系统来区分不同的运行环境（开发、测试、生产）。每个环境都有独立的配置文件。

## 环境文件结构 (Environment Files Structure)

```text
apps/web-antd/
├── .env                  # 所有环境共享的基础配置
├── .env.development      # 开发环境配置
├── .env.test            # 测试环境配置
├── .env.production      # 生产环境配置
└── .env.analyze         # 构建分析环境配置
```

## 各环境配置详情 (Environment Configuration Details)

### 1. 基础配置 (.env)

所有环境共享的基础配置：

```bash
# 应用标题
VITE_APP_TITLE=Vben Admin Antd

# 应用命名空间，用于缓存、store等功能的前缀，确保隔离
VITE_APP_NAMESPACE=vben-web-antd

# 对store进行加密的密钥
VITE_APP_STORE_SECURE_KEY=please-replace-me-with-your-own-key
```

### 2. 开发环境 (.env.development)

**特点**：
- 启用 Nitro Mock 服务
- 使用本地 API 路径
- 开启开发者工具（可选）

```bash
# 端口号
VITE_PORT=5666

VITE_BASE=/

# 接口地址 - 开发环境使用相对路径，由 mock 服务处理
VITE_GLOB_API_URL=/api

# 开启 Mock 服务
VITE_NITRO_MOCK=true

# 开发者工具
VITE_DEVTOOLS=false

# 注入全局loading
VITE_INJECT_APP_LOADING=true
```

**启动命令**：

```bash
# 在项目根目录
pnpm dev:antd

# 或在 apps/web-antd 目录
pnpm dev
```

### 3. 测试环境 (.env.test)

**特点**：
- 启用 Nitro Mock 服务（用于单元测试和集成测试）
- 使用独立端口避免与开发环境冲突
- 配置可根据实际测试服务器调整

```bash
# 端口号 - 使用不同端口避免冲突
VITE_PORT=5667

VITE_BASE=/

# 接口地址 - 测试环境
# 选项1: 使用 mock 服务（单元测试）
VITE_GLOB_API_URL=/api

# 选项2: 使用实际测试服务器
# VITE_GLOB_API_URL=https://test-api.your-domain.com/api

# 测试环境默认开启 mock
VITE_NITRO_MOCK=true

VITE_DEVTOOLS=false
VITE_INJECT_APP_LOADING=true
```

**启动命令**：

```bash
# 在 apps/web-antd 目录
pnpm vite --mode test

# 或添加到 package.json scripts:
# "dev:test": "pnpm vite --mode test"
```

**运行测试**：

```bash
# 单元测试（自动使用 test 环境变量）
pnpm test:unit

# E2E测试
pnpm test:e2e
```

### 4. 生产环境 (.env.production)

**特点**：
- 关闭 Mock 服务
- 使用真实 API 地址
- 启用构建优化选项

```bash
VITE_BASE=/

# 接口地址 - 生产环境 API
VITE_GLOB_API_URL=https://mock-napi.vben.pro/api

# 关闭 Mock（默认关闭，可不配置）
# VITE_NITRO_MOCK=false

# 压缩配置
VITE_COMPRESS=none

# PWA配置
VITE_PWA=false

# 路由模式
VITE_ROUTER_HISTORY=hash

VITE_INJECT_APP_LOADING=true

# 打包后生成 dist.zip
VITE_ARCHIVER=true
```

**构建命令**：

```bash
# 在项目根目录
pnpm build:antd

# 或在 apps/web-antd 目录
pnpm build
```

## 环境变量加载优先级 (Environment Variable Priority)

Vite 按照以下优先级加载环境变量：

1. 模式特定文件（如 `.env.production`）
2. 通用环境文件（`.env`）
3. 已存在的环境变量

**注意**：只有以 `VITE_` 开头的变量会被暴露到客户端代码。

## API 请求配置 (API Request Configuration)

### 代码中如何使用环境变量

在 `apps/web-antd/src/api/request.ts` 中：

```typescript
import { useAppConfig } from '@vben/hooks';
import { RequestClient } from '@vben/request';

// 从环境变量获取 API URL
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

// 创建请求客户端
export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});
```

### 在组件中访问环境变量

```typescript
// 访问 VITE_ 前缀的环境变量
const apiUrl = import.meta.env.VITE_GLOB_API_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
const mode = import.meta.env.MODE; // 'development' | 'test' | 'production'
```

## Mock 服务配置 (Mock Service Configuration)

### Mock 服务文件位置

```text
apps/backend-mock/
├── api/                 # Mock API 路由
│   ├── auth/           # 认证相关
│   ├── user/           # 用户相关
│   └── ...
└── nitro.config.ts     # Nitro 配置
```

### 创建 Mock API 示例

```typescript
// apps/backend-mock/api/user/info.get.ts
export default defineEventHandler(async (event) => {
  // 获取请求头
  const token = getHeader(event, 'Authorization');

  if (!token) {
    setResponseStatus(event, 401);
    return {
      code: 401,
      message: '未授权',
    };
  }

  // 返回 mock 数据
  return {
    code: 0,
    data: {
      id: '1',
      username: 'admin',
      realName: '管理员',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
      roles: ['admin'],
    },
    message: 'success',
  };
});
```

### Mock 服务启动

Mock 服务会在以下情况自动启动：
- `VITE_NITRO_MOCK=true` 时
- 执行 `pnpm dev` 时自动启动

## 切换环境 (Switching Environments)

### 方法1: 使用预定义脚本

```bash
# 开发环境
pnpm dev:antd

# 测试环境（需要添加脚本）
pnpm dev:test

# 生产构建
pnpm build:antd
```

### 方法2: 使用 --mode 参数

```bash
# 使用测试环境配置运行
pnpm vite --mode test

# 使用生产环境配置构建
pnpm vite build --mode production
```

### 方法3: 临时覆盖环境变量

```bash
# Linux/Mac
VITE_GLOB_API_URL=https://custom-api.com/api pnpm dev

# Windows (PowerShell)
$env:VITE_GLOB_API_URL="https://custom-api.com/api"; pnpm dev
```

## 最佳实践 (Best Practices)

### 1. 敏感信息处理

```bash
# .env.local (不提交到 git)
VITE_APP_STORE_SECURE_KEY=your-actual-secure-key-here
```

### 2. TypeScript 类型支持

在 `src/vite-env.d.ts` 中定义类型：

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_GLOB_API_URL: string;
  readonly VITE_NITRO_MOCK: string;
  // 添加其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 3. 多环境 API 管理

```typescript
// 根据环境返回不同的配置
export const getApiConfig = () => {
  const mode = import.meta.env.MODE;

  const configs = {
    development: {
      apiUrl: '/api',
      timeout: 10000,
      mock: true,
    },
    test: {
      apiUrl: '/api',
      timeout: 5000,
      mock: true,
    },
    production: {
      apiUrl: 'https://api.your-domain.com/api',
      timeout: 30000,
      mock: false,
    },
  };

  return configs[mode as keyof typeof configs] || configs.development;
};
```

### 4. 条件编译

```typescript
// 仅在开发环境执行
if (import.meta.env.DEV) {
  console.log('API URL:', import.meta.env.VITE_GLOB_API_URL);
}

// 仅在生产环境执行
if (import.meta.env.PROD) {
  // 性能监控初始化
  initPerformanceMonitoring();
}
```

## 常见问题 (Troubleshooting)

### 1. 环境变量未生效

**原因**：环境变量没有 `VITE_` 前缀

**解决**：确保所有暴露到客户端的变量都以 `VITE_` 开头

```bash
# ❌ 错误
API_URL=https://api.com

# ✓ 正确
VITE_API_URL=https://api.com
```

### 2. Mock 服务未启动

**检查清单**：
1. 确认 `VITE_NITRO_MOCK=true`
2. 检查 `apps/backend-mock` 目录是否存在
3. 查看控制台是否有 mock 服务启动日志

### 3. 不同环境配置混淆

**解决**：使用明确的 `--mode` 参数

```bash
# 明确指定模式
vite --mode test        # 使用 .env.test
vite build --mode production  # 使用 .env.production
```

### 4. API 请求跨域问题

**开发环境**：配置 Vite 代理

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

## 验证配置 (Verification)

### 验证环境变量加载

在应用入口添加日志：

```typescript
// src/main.ts
console.log('Environment:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_GLOB_API_URL);
console.log('Mock Enabled:', import.meta.env.VITE_NITRO_MOCK);
```

### 验证 API 请求

```typescript
// 测试 API 请求
import { requestClient } from '@/api/request';

requestClient.get('/user/info').then((data) => {
  console.log('API Response:', data);
});
```

## 相关文档 (Related Documentation)

- [Vite 环境变量官方文档](https://vitejs.dev/guide/env-and-mode.html)
- [API Mock 配置指南](./API_MOCK_CONFIGURATION_GUIDE.md)
- [测试修复分析](./MAKE_TEST_FIX_ANALYSIS.md)
