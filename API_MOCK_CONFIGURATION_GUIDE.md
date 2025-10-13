# API 与 Mock 配置指南

## 目录

- [概述](#概述)
- [环境配置](#环境配置)
- [API 请求配置](#api-请求配置)
- [Mock 服务配置](#mock-服务配置)
- [多环境管理](#多环境管理)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 概述

本项目使用 **Vite + Nitro Mock** 方案实现前后端分离开发:

- **开发环境:** 使用本地 Nitro Mock 服务
- **测试环境:** 连接测试服务器 API
- **生产环境:** 连接生产服务器 API

### 技术栈

- **请求库:** Axios (封装在 `@vben/request`)
- **Mock 工具:** Nitro (apps/backend-mock)
- **环境管理:** Vite 环境变量
- **状态管理:** Pinia

---

## 环境配置

### 1. 环境文件说明

项目使用多个 `.env` 文件管理不同环境:

```
apps/web-antd/
├── .env                    # 所有环境的公共配置
├── .env.development        # 开发环境配置
├── .env.test              # 测试环境配置 (需创建)
├── .env.production        # 生产环境配置
└── .env.analyze           # 打包分析配置
```

### 2. 环境文件配置

#### `.env` - 公共配置

```bash
# 应用标题
VITE_APP_TITLE=Vben Admin Antd

# 应用命名空间,用于缓存、store等功能的前缀
VITE_APP_NAMESPACE=vben-web-antd

# Store 加密密钥
VITE_APP_STORE_SECURE_KEY=your-secure-key-here
```

#### `.env.development` - 开发环境

```bash
# 端口号
VITE_PORT=5666

# 基础路径
VITE_BASE=/

# 接口地址 (使用相对路径,会被代理到 Mock 服务)
VITE_GLOB_API_URL=/api

# 是否开启 Nitro Mock 服务 ✨
VITE_NITRO_MOCK=true

# 是否打开 devtools
VITE_DEVTOOLS=true

# 是否注入全局loading
VITE_INJECT_APP_LOADING=true
```

#### `.env.test` - 测试环境 (新建)

```bash
# 基础路径
VITE_BASE=/

# 测试服务器 API 地址 ✨
VITE_GLOB_API_URL=https://test-api.your-domain.com/api

# 关闭 Mock 服务
VITE_NITRO_MOCK=false

# 是否注入全局loading
VITE_INJECT_APP_LOADING=true

# 打包配置
VITE_COMPRESS=gzip
VITE_PWA=false
VITE_ROUTER_HISTORY=hash
```

#### `.env.production` - 生产环境

```bash
# 基础路径
VITE_BASE=/

# 生产服务器 API 地址 ✨
VITE_GLOB_API_URL=https://api.your-domain.com/api

# 关闭 Mock 服务
VITE_NITRO_MOCK=false

# 打包优化
VITE_COMPRESS=brotli
VITE_PWA=true
VITE_ROUTER_HISTORY=history

# 是否注入全局loading
VITE_INJECT_APP_LOADING=true

# 是否生成 dist.zip
VITE_ARCHIVER=true
```

### 3. 环境变量说明

| 变量 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `VITE_APP_TITLE` | String | 应用标题 | `Vben Admin` |
| `VITE_APP_NAMESPACE` | String | 应用命名空间 | `vben-web-antd` |
| `VITE_PORT` | Number | 开发服务器端口 | `5666` |
| `VITE_BASE` | String | 应用基础路径 | `/` 或 `/admin/` |
| `VITE_GLOB_API_URL` | String | **API 基础地址** | `/api` (开发) 或 `https://api.example.com/api` (生产) |
| `VITE_NITRO_MOCK` | Boolean | **是否启用 Mock** | `true` (开发) / `false` (生产) |
| `VITE_DEVTOOLS` | Boolean | 是否开启 Vue Devtools | `true` / `false` |
| `VITE_COMPRESS` | String | 打包压缩方式 | `none` / `gzip` / `brotli` |
| `VITE_PWA` | Boolean | 是否启用 PWA | `true` / `false` |
| `VITE_ROUTER_HISTORY` | String | 路由模式 | `hash` / `history` |

---

## API 请求配置

### 1. 请求客户端初始化

项目在 `apps/web-antd/src/api/request.ts` 中创建请求客户端:

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

### 2. 环境自动适配

`useAppConfig` 会根据环境变量自动选择正确的 API 地址:

```typescript
// packages/@vben/hooks/src/use-app-config.ts
export function useAppConfig(env: ImportMetaEnv, isProd: boolean) {
  return {
    apiURL: env.VITE_GLOB_API_URL,
    // 其他配置...
  };
}
```

### 3. 请求拦截器配置

#### 请求拦截 - 添加 Token

```typescript
// apps/web-antd/src/api/request.ts
client.addRequestInterceptor({
  fulfilled: async (config) => {
    const accessStore = useAccessStore();

    // 自动添加 Authorization 头
    config.headers.Authorization = `Bearer ${accessStore.accessToken}`;

    // 添加语言头
    config.headers['Accept-Language'] = preferences.app.locale;

    return config;
  },
});
```

#### 响应拦截 - 统一处理

```typescript
// 1. 数据格式处理
client.addResponseInterceptor(
  defaultResponseInterceptor({
    codeField: 'code',      // 响应码字段名
    dataField: 'data',      // 数据字段名
    successCode: 0,         // 成功状态码
  }),
);

// 2. Token 过期处理
client.addResponseInterceptor(
  authenticateResponseInterceptor({
    client,
    doReAuthenticate,       // 重新认证逻辑
    doRefreshToken,         // 刷新 Token 逻辑
    enableRefreshToken: true,
    formatToken,
  }),
);

// 3. 错误消息处理
client.addResponseInterceptor(
  errorMessageResponseInterceptor((msg: string, error) => {
    message.error(msg);
  }),
);
```

### 4. API 模块化组织

推荐按业务模块组织 API:

```
apps/web-antd/src/api/
├── request.ts           # 请求客户端配置
├── core/                # 核心 API
│   ├── index.ts
│   ├── auth.ts         # 认证相关
│   └── user.ts         # 用户相关
├── modules/            # 业务模块 API
│   ├── dashboard.ts
│   ├── system.ts
│   └── ...
└── types/              # API 类型定义
    ├── auth.ts
    └── user.ts
```

#### 示例: 用户 API

```typescript
// apps/web-antd/src/api/core/user.ts
import type { UserInfo, UserListParams } from '../types/user';
import { requestClient } from '../request';

/**
 * 获取用户信息
 */
export async function getUserInfo() {
  return requestClient.get<UserInfo>('/user/info');
}

/**
 * 获取用户列表
 */
export async function getUserList(params: UserListParams) {
  return requestClient.get<UserInfo[]>('/user/list', { params });
}

/**
 * 更新用户信息
 */
export async function updateUser(id: string, data: Partial<UserInfo>) {
  return requestClient.put(`/user/${id}`, data);
}

/**
 * 删除用户
 */
export async function deleteUser(id: string) {
  return requestClient.delete(`/user/${id}`);
}
```

---

## Mock 服务配置

### 1. Mock 服务结构

```
apps/backend-mock/
├── api/                # Mock API 定义
│   ├── auth/          # 认证模块
│   │   ├── index.ts
│   │   ├── login.ts
│   │   └── register.ts
│   ├── user/          # 用户模块
│   └── ...
├── middleware/        # 中间件
│   └── auth.ts       # 认证中间件
├── routes/           # 路由定义
├── utils/            # 工具函数
│   ├── data-generator.ts  # 数据生成器
│   └── response.ts        # 响应封装
├── nitro.config.ts   # Nitro 配置
└── package.json
```

### 2. 创建 Mock API

#### 基础 Mock API

```typescript
// apps/backend-mock/api/user/info.get.ts
import type { UserInfo } from '~/types';

/**
 * 获取用户信息
 * GET /api/user/info
 */
export default defineEventHandler(async (event) => {
  // 获取请求头中的 token
  const token = getHeader(event, 'Authorization');

  if (!token) {
    setResponseStatus(event, 401);
    return {
      code: 401,
      message: '未授权',
    };
  }

  // 模拟用户数据
  const mockUser: UserInfo = {
    id: '1',
    username: 'admin',
    realName: '管理员',
    email: 'admin@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    roles: ['admin'],
    permissions: ['*:*:*'],
  };

  return {
    code: 0,
    data: mockUser,
    message: 'success',
  };
});
```

#### 带参数的 Mock API

```typescript
// apps/backend-mock/api/user/list.get.ts
/**
 * 获取用户列表
 * GET /api/user/list?page=1&pageSize=10&keyword=xxx
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const keyword = query.keyword as string || '';

  // 生成模拟数据
  const total = 100;
  const list = Array.from({ length: pageSize }, (_, i) => ({
    id: String((page - 1) * pageSize + i + 1),
    username: `user${(page - 1) * pageSize + i + 1}`,
    realName: `用户${(page - 1) * pageSize + i + 1}`,
    email: `user${(page - 1) * pageSize + i + 1}@example.com`,
    status: Math.random() > 0.5 ? 1 : 0,
    createTime: new Date().toISOString(),
  }));

  // 关键词过滤
  const filteredList = keyword
    ? list.filter(item =>
        item.username.includes(keyword) ||
        item.realName.includes(keyword)
      )
    : list;

  return {
    code: 0,
    data: {
      list: filteredList,
      total,
      page,
      pageSize,
    },
    message: 'success',
  };
});
```

#### POST 请求 Mock

```typescript
// apps/backend-mock/api/user/create.post.ts
/**
 * 创建用户
 * POST /api/user/create
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // 验证参数
  if (!body.username || !body.password) {
    setResponseStatus(event, 400);
    return {
      code: 400,
      message: '用户名和密码不能为空',
    };
  }

  // 模拟创建成功
  return {
    code: 0,
    data: {
      id: String(Date.now()),
      ...body,
      createTime: new Date().toISOString(),
    },
    message: '创建成功',
  };
});
```

### 3. Mock 数据生成器

创建可复用的数据生成器:

```typescript
// apps/backend-mock/utils/data-generator.ts
import { faker } from '@faker-js/faker/locale/zh_CN';

/**
 * 生成用户数据
 */
export function generateUser(id?: string) {
  return {
    id: id || faker.string.uuid(),
    username: faker.internet.userName(),
    realName: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    phone: faker.phone.number(),
    status: faker.datatype.boolean() ? 1 : 0,
    createTime: faker.date.past().toISOString(),
  };
}

/**
 * 生成用户列表
 */
export function generateUserList(count: number = 10) {
  return Array.from({ length: count }, (_, i) =>
    generateUser(String(i + 1))
  );
}

/**
 * 生成分页数据
 */
export function generatePaginationData<T>(
  list: T[],
  page: number,
  pageSize: number,
) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    list: list.slice(start, end),
    total: list.length,
    page,
    pageSize,
    totalPages: Math.ceil(list.length / pageSize),
  };
}
```

### 4. 响应格式封装

```typescript
// apps/backend-mock/utils/response.ts
/**
 * 成功响应
 */
export function successResponse<T>(data: T, message = 'success') {
  return {
    code: 0,
    data,
    message,
    timestamp: Date.now(),
  };
}

/**
 * 错误响应
 */
export function errorResponse(code: number, message: string) {
  return {
    code,
    message,
    timestamp: Date.now(),
  };
}

/**
 * 分页响应
 */
export function paginationResponse<T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return successResponse({
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
```

### 5. Nitro 配置

```typescript
// apps/backend-mock/nitro.config.ts
import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  srcDir: '.',

  // API 路由前缀
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    },
  },

  // 开发服务器配置
  devServer: {
    port: 5320,
  },

  // 构建配置
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        moduleResolution: 'bundler',
      },
    },
  },
});
```

---

## 多环境管理

### 1. 环境切换

#### 开发环境 (使用 Mock)

```bash
# 启动开发服务器 (自动启动 Mock 服务)
pnpm dev

# 或指定应用
pnpm dev:antd
```

#### 测试环境

```bash
# 使用测试环境配置构建
pnpm build --mode test

# 或创建 npm script
# package.json
{
  "scripts": {
    "build:test": "vite build --mode test"
  }
}
```

#### 生产环境

```bash
# 使用生产环境配置构建
pnpm build

# 或
pnpm build:antd
```

### 2. 环境判断

在代码中判断当前环境:

```typescript
// 判断是否为开发环境
const isDev = import.meta.env.DEV;

// 判断是否为生产环境
const isProd = import.meta.env.PROD;

// 判断是否启用 Mock
const isMockEnabled = import.meta.env.VITE_NITRO_MOCK === 'true';

// 获取当前模式
const mode = import.meta.env.MODE; // 'development' | 'production' | 'test'

// 根据环境执行不同逻辑
if (isDev && isMockEnabled) {
  console.log('开发环境 - 使用 Mock 数据');
} else if (isProd) {
  console.log('生产环境 - 使用真实 API');
}
```

### 3. 动态环境配置

创建环境配置工厂:

```typescript
// apps/web-antd/src/config/env.ts
interface EnvConfig {
  apiURL: string;
  mockEnabled: boolean;
  isDev: boolean;
  isProd: boolean;
  mode: string;
}

/**
 * 获取环境配置
 */
export function getEnvConfig(): EnvConfig {
  const env = import.meta.env;

  return {
    apiURL: env.VITE_GLOB_API_URL,
    mockEnabled: env.VITE_NITRO_MOCK === 'true',
    isDev: env.DEV,
    isProd: env.PROD,
    mode: env.MODE,
  };
}

/**
 * 是否为开发环境
 */
export function isDevelopment() {
  return import.meta.env.DEV;
}

/**
 * 是否为生产环境
 */
export function isProduction() {
  return import.meta.env.PROD;
}

/**
 * 是否启用 Mock
 */
export function isMockEnabled() {
  return import.meta.env.VITE_NITRO_MOCK === 'true';
}
```

### 4. API 代理配置 (可选)

如果需要在开发环境代理到真实 API:

```typescript
// apps/web-antd/vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://test-api.your-domain.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

---

## 最佳实践

### 1. 环境变量命名规范

- ✅ 使用 `VITE_` 前缀 (Vite 要求)
- ✅ 使用大写 + 下划线
- ✅ 语义化命名

```bash
# 好的命名
VITE_API_URL=xxx
VITE_APP_NAME=xxx
VITE_ENABLE_MOCK=true

# 不好的命名
api_url=xxx         # 缺少 VITE_ 前缀
VITE_apiUrl=xxx     # 混合大小写
VITE_X=xxx          # 不语义化
```

### 2. 敏感信息处理

不要在环境文件中存储敏感信息:

```bash
# ❌ 错误 - 不要提交真实密钥
VITE_APP_STORE_SECURE_KEY=my-real-secret-key-123456

# ✅ 正确 - 使用占位符
VITE_APP_STORE_SECURE_KEY=please-replace-me-with-your-own-key
```

在部署时通过 CI/CD 注入真实值:

```yaml
# .github/workflows/deploy.yml
- name: Build
  env:
    VITE_APP_STORE_SECURE_KEY: ${{ secrets.STORE_SECURE_KEY }}
  run: pnpm build
```

### 3. API 错误处理

统一的错误处理:

```typescript
// apps/web-antd/src/api/request.ts
client.addResponseInterceptor(
  errorMessageResponseInterceptor((msg: string, error) => {
    const responseData = error?.response?.data ?? {};
    const statusCode = error?.response?.status;

    // 根据状态码定制错误提示
    switch (statusCode) {
      case 401:
        message.error('未授权,请重新登录');
        // 跳转到登录页
        break;
      case 403:
        message.error('没有权限访问该资源');
        break;
      case 404:
        message.error('请求的资源不存在');
        break;
      case 500:
        message.error('服务器错误,请稍后重试');
        break;
      default:
        message.error(responseData?.message || msg || '请求失败');
    }
  }),
);
```

### 4. TypeScript 类型定义

为 API 响应定义类型:

```typescript
// apps/web-antd/src/api/types/common.ts
/**
 * 通用响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  timestamp?: number;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### 5. Mock 数据真实性

Mock 数据应尽量接近真实场景:

```typescript
// ✅ 好的 Mock - 真实的业务逻辑
export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);

  // 模拟登录验证
  if (username === 'admin' && password === 'admin123') {
    return successResponse({
      token: 'mock-token-' + Date.now(),
      userInfo: { username, roles: ['admin'] },
    });
  }

  setResponseStatus(event, 401);
  return errorResponse(401, '用户名或密码错误');
});

// ❌ 不好的 Mock - 总是返回成功
export default defineEventHandler(async () => {
  return { code: 0, data: {} };
});
```

### 6. 环境文件版本控制

`.gitignore` 配置:

```bash
# 提交模板文件
.env
.env.development
.env.production

# 忽略本地配置 (包含真实密钥)
.env.local
.env.*.local
```

---

## 常见问题

### Q1: Mock 服务无法启动?

**A:** 检查以下几点:

1. 确认 `.env.development` 中 `VITE_NITRO_MOCK=true`
2. 检查 Mock 服务端口是否被占用
3. 查看 `apps/backend-mock/nitro.config.ts` 配置

```bash
# 查看端口占用
lsof -i :5320

# 单独启动 Mock 服务调试
cd apps/backend-mock
pnpm dev
```

### Q2: 生产环境误用了 Mock 数据?

**A:** 确保生产构建时设置正确:

```bash
# 检查生产环境配置
cat apps/web-antd/.env.production

# 确认 VITE_NITRO_MOCK=false
# 确认 VITE_GLOB_API_URL 是真实 API 地址
```

### Q3: 跨域问题?

**A:** 三种解决方案:

1. **开发环境** - Mock 服务已配置 CORS
2. **测试/生产** - 后端配置 CORS 或使用 Nginx 代理
3. **开发代理** - Vite 代理配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
      },
    },
  },
});
```

### Q4: 环境变量不生效?

**A:** 检查:

1. 变量名必须以 `VITE_` 开头
2. 修改环境文件后需要重启开发服务器
3. 构建时使用正确的 `--mode`

```bash
# 重启开发服务器
pnpm dev

# 构建时指定模式
pnpm build --mode production
```

### Q5: 如何动态切换 API 地址?

**A:** 方案一 - 运行时配置

```typescript
// 在应用初始化时动态设置
const apiURL = window.location.hostname.includes('test')
  ? 'https://test-api.example.com'
  : 'https://api.example.com';

requestClient.instance.defaults.baseURL = apiURL;
```

**方案二** - 使用环境变量 + 条件判断

```typescript
const { hostname } = window.location;

const apiURL = hostname.includes('localhost')
  ? import.meta.env.VITE_GLOB_API_URL
  : hostname.includes('test')
  ? 'https://test-api.example.com'
  : 'https://api.example.com';
```

### Q6: Mock 数据如何持久化?

**A:** 使用内存数据库或文件存储:

```typescript
// apps/backend-mock/utils/storage.ts
const storage = new Map<string, any>();

export function saveData(key: string, data: any) {
  storage.set(key, data);
}

export function getData(key: string) {
  return storage.get(key);
}

// 在 Mock API 中使用
export default defineEventHandler(async (event) => {
  const users = getData('users') || [];
  // ...
});
```

---

## 附录

### A. 完整的项目结构

```
apps/
├── web-antd/
│   ├── .env                      # 公共配置
│   ├── .env.development          # 开发环境
│   ├── .env.test                 # 测试环境
│   ├── .env.production           # 生产环境
│   ├── src/
│   │   ├── api/                  # API 层
│   │   │   ├── request.ts        # 请求客户端
│   │   │   ├── core/             # 核心 API
│   │   │   ├── modules/          # 业务模块 API
│   │   │   └── types/            # 类型定义
│   │   └── config/
│   │       └── env.ts            # 环境配置
│   └── vite.config.ts
└── backend-mock/
    ├── api/                      # Mock API
    │   ├── auth/
    │   ├── user/
    │   └── ...
    ├── utils/
    │   ├── data-generator.ts     # 数据生成器
    │   ├── response.ts           # 响应封装
    │   └── storage.ts            # 数据存储
    └── nitro.config.ts
```

### B. 环境变量清单

| 变量 | 开发 | 测试 | 生产 | 说明 |
|------|------|------|------|------|
| VITE_GLOB_API_URL | `/api` | `https://test.api.com` | `https://api.com` | API 地址 |
| VITE_NITRO_MOCK | `true` | `false` | `false` | 是否启用 Mock |
| VITE_PORT | `5666` | - | - | 开发端口 |
| VITE_DEVTOOLS | `true` | `false` | `false` | 开发工具 |
| VITE_COMPRESS | `none` | `gzip` | `brotli` | 压缩方式 |

### C. 相关文档链接

- [Vite 环境变量](https://cn.vitejs.dev/guide/env-and-mode.html)
- [Nitro 文档](https://nitro.unjs.io/)
- [Axios 文档](https://axios-http.com/)
- [Vben Admin 文档](https://doc.vben.pro/)

---

**文档版本:** 1.0
**最后更新:** 2025-10-13
**维护者:** Claude Code
