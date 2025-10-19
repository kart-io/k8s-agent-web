# Auth 与用户信息 Mock 配置说明

## 配置概述

项目已正确配置为：

- ✅ **Auth API** (登录、退出、刷新token、权限码) → 使用 **Nitro Mock** 服务
- ✅ **User API** (用户信息) → 使用 **Nitro Mock** 服务
- ✅ **K8s API** (集群、Pod、Deployment等) → 使用 **真实后端** (cluster-service)

这样可以在开发 K8s 功能时，无需启动认证服务，只需要 cluster-service 后端即可。

## 当前配置

### 1. 环境变量配置 (`.env.development`)

```bash
# 端口号
VITE_PORT=5668

# 接口基础路径
VITE_GLOB_API_URL=/api

# 是否开启 Nitro Mock 服务（Auth 和 User API 使用）
VITE_NITRO_MOCK=true

# 是否开启 K8s API Mock 模式（K8s API 使用）
VITE_USE_K8S_MOCK=false  # false = 使用真实后端
```

**关键点**:

- `VITE_NITRO_MOCK=true` - 启用 Nitro Mock 服务（用于 Auth/User）
- `VITE_USE_K8S_MOCK=false` - K8s API 使用真实后端

### 2. Vite 代理配置 (`vite.config.mts`)

```typescript
server: {
  proxy: {
    // ==========================================
    // K8s API 代理到真实后端 (cluster-service)
    // ==========================================
    '/api/k8s': {
      changeOrigin: true,
      target: 'http://localhost:8082',  // cluster-service 地址
      ws: true,
    },

    // ==========================================
    // 其他 API 代理到 Nitro Mock 服务
    // ==========================================
    '/api': {
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      target: 'http://localhost:5320/api',  // Nitro Mock 服务
      ws: true,
    },
  },
}
```

**代理规则顺序很重要**:

1. **先匹配** `/api/k8s` → 转发到 cluster-service (真实后端)
2. **再匹配** `/api` → 转发到 Nitro Mock 服务 (mock 数据)

## 请求路由示例

### Auth 相关请求 (使用 Mock)

| 前端请求 | Vite 代理匹配 | 转发到 | 最终请求 |
| --- | --- | --- | --- |
| `POST /api/auth/login` | `/api` (第二条规则) | Nitro Mock | `POST http://localhost:5320/api/auth/login` |
| `POST /api/auth/logout` | `/api` (第二条规则) | Nitro Mock | `POST http://localhost:5320/api/auth/logout` |
| `POST /api/auth/refresh` | `/api` (第二条规则) | Nitro Mock | `POST http://localhost:5320/api/auth/refresh` |
| `GET /api/auth/codes` | `/api` (第二条规则) | Nitro Mock | `GET http://localhost:5320/api/auth/codes` |

### User 相关请求 (使用 Mock)

| 前端请求 | Vite 代理匹配 | 转发到 | 最终请求 |
| --- | --- | --- | --- |
| `GET /api/user/info` | `/api` (第二条规则) | Nitro Mock | `GET http://localhost:5320/api/user/info` |

### K8s 相关请求 (使用真实后端)

| 前端请求 | Vite 代理匹配 | 转发到 | 最终请求 |
| --- | --- | --- | --- |
| `GET /api/k8s/clusters` | `/api/k8s` (第一条规则) | cluster-service | `GET http://localhost:8082/api/k8s/clusters` |
| `GET /api/k8s/clusters/:id/namespaces/:ns/pods` | `/api/k8s` (第一条规则) | cluster-service | `GET http://localhost:8082/api/k8s/clusters/:id/namespaces/:ns/pods` |

## API 文件位置

### Auth API (`src/api/core/auth.ts`)

```typescript
// 登录 - 使用 Mock
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
  // → /api/auth/login → Nitro Mock
}

// 刷新 Token - 使用 Mock
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
  // → /api/auth/refresh → Nitro Mock
}

// 退出登录 - 使用 Mock
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
  // → /api/auth/logout → Nitro Mock
}

// 获取权限码 - 使用 Mock
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
  // → /api/auth/codes → Nitro Mock
}
```

### User API (`src/api/core/user.ts`)

```typescript
// 获取用户信息 - 使用 Mock
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
  // → /api/user/info → Nitro Mock
}
```

### K8s API (`src/api/k8s/index.ts`)

```typescript
// 集群列表 - 使用真实后端
export const clusterApi = {
  list: async (params) => {
    return requestClient.get('/k8s/clusters', { params });
    // → /api/k8s/clusters → cluster-service
  },
};

// Pod 列表 - 使用真实后端
export const podApi = createMockableResourceApi(
  createResourceApi<Pod>(requestClient, {
    resourceType: 'pod',
    namespaced: true,
  }),
  'pod',
);
// → /api/k8s/clusters/:id/namespaces/:ns/pods → cluster-service
```

## Nitro Mock 服务

### 启动方式

Nitro Mock 服务是项目自带的 mock 服务，启动前端开发服务器时会自动启动。

```bash
# 启动前端开发服务器（会自动启动 Nitro Mock）
pnpm dev:k8s
```

### 端口

- **前端**: `http://localhost:5668`
- **Nitro Mock**: `http://localhost:5320`

### Mock 数据位置

Mock 数据定义在 `apps/backend-mock/` 目录：

```
apps/backend-mock/
├── api/
│   ├── auth/           # Auth 相关 mock
│   ├── user/           # User 相关 mock
│   └── ...
└── nitro.config.ts
```

## 请求流程图

### Auth/User 请求流程

```
┌──────────────┐
│   Browser    │
│ POST /api/   │
│ auth/login   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Vite Dev   │
│   Server     │  匹配 /api 规则
│  :5668       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Nitro Mock   │
│   Service    │  返回 mock 数据
│  :5320       │
└──────────────┘
```

### K8s 请求流程

```
┌──────────────┐
│   Browser    │
│ GET /api/k8s/│
│   clusters   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Vite Dev   │
│   Server     │  匹配 /api/k8s 规则
│  :5668       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  cluster-    │
│   service    │  返回真实数据
│  :8082       │
└──────────────┘
```

## 开发场景

### 场景 1: 开发 K8s 功能（当前配置）

**启动服务**:

```bash
# 1. 启动 cluster-service 后端
cd /path/to/cluster-service
go run cmd/server/main.go -config configs/config-local.yaml

# 2. 启动前端（会自动启动 Nitro Mock）
cd /path/to/k8s-agent-web/apps/web-k8s
pnpm dev:k8s
```

**配置**:

```bash
VITE_NITRO_MOCK=true        # Auth/User 使用 Mock
VITE_USE_K8S_MOCK=false     # K8s 使用真实后端
```

**结果**:

- ✅ 登录功能正常（使用 Mock 数据）
- ✅ K8s 功能连接真实后端

### 场景 2: 纯 Mock 开发（不需要后端）

**启动服务**:

```bash
# 只需启动前端
pnpm dev:k8s
```

**配置**:

```bash
VITE_NITRO_MOCK=true        # Auth/User 使用 Mock
VITE_USE_K8S_MOCK=true      # K8s 也使用 Mock
```

**结果**:

- ✅ 所有功能都使用 Mock 数据
- ✅ 无需启动任何后端服务

### 场景 3: 完整真实后端（生产模式）

**启动服务**:

```bash
# 1. 启动 auth-service
cd /path/to/auth-service
go run cmd/server/main.go

# 2. 启动 cluster-service
cd /path/to/cluster-service
go run cmd/server/main.go

# 3. 启动前端（生产构建）
pnpm build:k8s
```

**配置**:

```bash
VITE_NITRO_MOCK=false       # 不使用 Nitro Mock
VITE_USE_K8S_MOCK=false     # K8s 使用真实后端
```

**结果**:

- ✅ Auth/User 连接真实 auth-service
- ✅ K8s 连接真实 cluster-service

## 验证方法

### 1. 检查 Auth 请求使用 Mock

打开浏览器控制台 (F12) → Network 标签：

1. **访问登录页面**
2. **输入任意用户名密码登录**
3. **检查网络请求**:
   ```
   POST http://localhost:5668/api/auth/login
   → 实际请求: http://localhost:5320/api/auth/login (Nitro Mock)
   ```

**成功标志**:

- ✅ 请求返回 200
- ✅ 不需要真实的 auth-service
- ✅ 可以使用任意用户名密码登录

### 2. 检查 User 请求使用 Mock

登录成功后：

1. **检查用户信息请求**:
   ```
   GET http://localhost:5668/api/user/info
   → 实际请求: http://localhost:5320/api/user/info (Nitro Mock)
   ```

**成功标志**:

- ✅ 返回 mock 用户数据
- ✅ 用户名、角色等信息正常显示

### 3. 检查 K8s 请求使用真实后端

访问集群管理页面：

1. **检查集群列表请求**:
   ```
   GET http://localhost:5668/api/k8s/clusters
   → 实际请求: http://localhost:8082/api/k8s/clusters (cluster-service)
   ```

**成功标志**:

- ✅ 返回真实的集群数据
- ✅ 需要 cluster-service 正在运行
- ✅ 数据来自真实的 K8s 集群

## 常见问题

### Q1: 登录后跳转到空白页面？

**原因**: Nitro Mock 服务未启动

**解决方案**:

```bash
# 确保 VITE_NITRO_MOCK=true
# 重启开发服务器
pnpm dev:k8s
```

### Q2: K8s 页面显示 404 或连接失败？

**原因**: cluster-service 未启动

**解决方案**:

```bash
# 启动 cluster-service
cd /path/to/cluster-service
go run cmd/server/main.go -config configs/config-local.yaml
```

### Q3: 想要 Auth 也使用真实后端？

**解决方案**:

1. 修改 `vite.config.mts`:

```typescript
'/api': {
  changeOrigin: true,
  target: 'http://localhost:8080',  // auth-service 地址
  ws: true,
},
```

2. 启动 auth-service:

```bash
cd /path/to/auth-service
go run cmd/server/main.go
```

3. 设置环境变量:

```bash
VITE_NITRO_MOCK=false
```

### Q4: Mock 数据如何修改？

**位置**: `apps/backend-mock/api/`

**示例** - 修改登录返回的 token:

```typescript
// apps/backend-mock/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  return {
    accessToken: 'my-custom-token-123', // 修改这里
  };
});
```

## 配置总结

| 功能模块 | API 路径 | 代理规则 | 目标服务 | 端口 | Mock/真实 |
| --- | --- | --- | --- | --- | --- |
| 登录 | `/api/auth/login` | `/api` | Nitro Mock | 5320 | Mock ✅ |
| 用户信息 | `/api/user/info` | `/api` | Nitro Mock | 5320 | Mock ✅ |
| 权限码 | `/api/auth/codes` | `/api` | Nitro Mock | 5320 | Mock ✅ |
| K8s 集群 | `/api/k8s/clusters` | `/api/k8s` | cluster-service | 8082 | 真实 ✅ |
| K8s Pod | `/api/k8s/clusters/.../pods` | `/api/k8s` | cluster-service | 8082 | 真实 ✅ |

## 优点

### 1. 开发效率高

- ✅ 无需启动 auth-service
- ✅ 登录功能始终可用
- ✅ 专注于 K8s 功能开发

### 2. 配置灵活

- ✅ 可以随时切换 Mock/真实后端
- ✅ 不同模块独立配置

### 3. 测试方便

- ✅ Mock 数据可控
- ✅ 无需真实用户数据库

## 相关文件

- ✅ `.env.development` - 环境变量配置
- ✅ `vite.config.mts` - Vite 代理配置
- ✅ `src/api/core/auth.ts` - Auth API 定义
- ✅ `src/api/core/user.ts` - User API 定义
- ✅ `apps/backend-mock/` - Nitro Mock 服务

---

**配置日期**: 2025-10-18 **配置目标**: Auth/User 使用 Mock，K8s 使用真实后端 **状态**: ✅ 已正确配置
