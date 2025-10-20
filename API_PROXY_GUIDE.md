# k8s-agent-web API 代理配置说明

## 概述

k8s-agent-web 前端通过 Vite 的代理功能将 API 请求转发到不同的后端服务。本文档说明了 API 代理的配置和路由规则。

## 代理配置

### 配置文件位置

```
k8s-agent-web/apps/web-k8s/vite.config.mts
```

### 代理规则（按优先级）

```typescript
server: {
  proxy: {
    // 1. K8s API - 最高优先级
    '/api/k8s': {
      target: 'http://localhost:8082',  // cluster-service
      changeOrigin: true,
      ws: true,
    },

    // 2. 认证授权 API - 第二优先级
    '/api/v1': {
      target: 'http://localhost:8090',  // auth-service
      changeOrigin: true,
      ws: true,
    },

    // 3. 其他 API - 兜底代理
    '/api': {
      target: 'http://localhost:5320',  // backend-mock
      changeOrigin: true,
      ws: true,
    },
  },
}
```

## 路由映射

### 1. 认证授权 API → auth-service (8090)

所有 `/api/v1/auth/*` 和 `/api/v1/{users|roles|permissions}/*` 请求都会被代理到 auth-service。

#### 认证接口

```
前端请求                          → 后端地址
─────────────────────────────────────────────────────────────
/api/v1/auth/login               → http://localhost:8090/api/v1/auth/login
/api/v1/auth/logout              → http://localhost:8090/api/v1/auth/logout
/api/v1/auth/me                  → http://localhost:8090/api/v1/auth/me
/api/v1/auth/codes               → http://localhost:8090/api/v1/auth/codes
/api/v1/auth/refresh             → http://localhost:8090/api/v1/auth/refresh
```

#### 用户管理接口

```
前端请求                          → 后端地址
─────────────────────────────────────────────────────────────
/api/v1/users                    → http://localhost:8090/api/v1/users
/api/v1/users/:id                → http://localhost:8090/api/v1/users/:id
/api/v1/users/:id/roles          → http://localhost:8090/api/v1/users/:id/roles
```

#### 角色管理接口

```
前端请求                          → 后端地址
─────────────────────────────────────────────────────────────
/api/v1/roles                    → http://localhost:8090/api/v1/roles
/api/v1/roles/:id                → http://localhost:8090/api/v1/roles/:id
/api/v1/roles/:id/permissions    → http://localhost:8090/api/v1/roles/:id/permissions
```

#### 权限管理接口

```
前端请求                          → 后端地址
─────────────────────────────────────────────────────────────
/api/v1/permissions              → http://localhost:8090/api/v1/permissions
/api/v1/permissions/tree         → http://localhost:8090/api/v1/permissions/tree
/api/v1/permissions/:id          → http://localhost:8090/api/v1/permissions/:id
```

### 2. K8s API → cluster-service (8082)

所有 `/api/k8s/*` 请求都会被代理到 cluster-service。

```
前端请求                          → 后端地址
─────────────────────────────────────────────────────────────
/api/k8s/clusters                → http://localhost:8082/api/k8s/clusters
/api/k8s/pods                    → http://localhost:8082/api/k8s/pods
/api/k8s/deployments             → http://localhost:8082/api/k8s/deployments
```

### 3. Mock API → backend-mock (5320)

其他所有 `/api/*` 请求（不匹配上述规则的）都会被代理到 backend-mock。

```
前端请求                          → 后端地址
─────────────────────────────────────────────────────────────
/api/menu/all                    → http://localhost:5320/api/menu/all
/api/user/info                   → http://localhost:5320/api/user/info
```

## API 调用示例

### 认证 API

```typescript
import { loginApi, logoutApi, getUserInfoApi } from '#/api/core';

// 登录
const result = await loginApi({
  username: 'admin',
  password: 'admin123',
});
// 请求: POST /api/v1/auth/login
// 代理到: http://localhost:8090/api/v1/auth/login

// 获取当前用户信息
const userInfo = await getUserInfoApi();
// 请求: GET /api/v1/auth/me
// 代理到: http://localhost:8090/api/v1/auth/me

// 登出
await logoutApi();
// 请求: POST /api/v1/auth/logout
// 代理到: http://localhost:8090/api/v1/auth/logout
```

### 用户管理 API

```typescript
import { getUserListApi, createUserApi } from '#/api/system/user';

// 获取用户列表
const users = await getUserListApi({
  page: 1,
  page_size: 20,
});
// 请求: GET /api/v1/users?page=1&page_size=20
// 代理到: http://localhost:8090/api/v1/users?page=1&page_size=20

// 创建用户
const newUser = await createUserApi({
  username: 'testuser',
  password: 'password123',
  email: 'test@example.com',
});
// 请求: POST /api/v1/users
// 代理到: http://localhost:8090/api/v1/users
```

### 角色和权限 API

```typescript
import { getRoleListApi } from '#/api/system/role';
import { getPermissionTreeApi } from '#/api/system/permission';

// 获取角色列表
const roles = await getRoleListApi();
// 请求: GET /api/v1/roles
// 代理到: http://localhost:8090/api/v1/roles

// 获取权限树
const tree = await getPermissionTreeApi();
// 请求: GET /api/v1/permissions/tree
// 代理到: http://localhost:8090/api/v1/permissions/tree
```

## 服务启动顺序

为了正常使用所有功能，需要按以下顺序启动服务：

### 1. 启动 auth-service

```bash
cd k8s-agent/auth-service
make run-local
```

服务地址: http://localhost:8090

### 2. 启动 cluster-service (可选)

```bash
cd k8s-agent/cluster-service
make run
```

服务地址: http://localhost:8082

### 3. 启动 backend-mock (可选)

```bash
cd k8s-agent-web/apps/backend-mock
pnpm run start
```

服务地址: http://localhost:5320

### 4. 启动前端

```bash
cd k8s-agent-web
pnpm dev:k8s
```

应用地址: http://localhost:5667

## 环境变量配置

你也可以通过环境变量配置后端服务地址：

```bash
# .env.development
VITE_AUTH_SERVICE_URL=http://localhost:8090
VITE_CLUSTER_SERVICE_URL=http://localhost:8082
VITE_MOCK_SERVICE_URL=http://localhost:5320
```

然后在 vite.config.mts 中使用：

```typescript
const authServiceUrl = process.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8090';
const clusterServiceUrl = process.env.VITE_CLUSTER_SERVICE_URL || 'http://localhost:8082';

server: {
  proxy: {
    '/api/v1': {
      target: authServiceUrl,
      changeOrigin: true,
    },
    '/api/k8s': {
      target: clusterServiceUrl,
      changeOrigin: true,
    },
  },
}
```

## 代理优先级说明

Vite 代理配置是**从上到下**匹配的，匹配到第一个规则后就会应用该规则，不会继续往下匹配。

### 示例分析

```
请求 URL: /api/k8s/clusters
1. 检查 '/api/k8s' → ✅ 匹配
   → 代理到 http://localhost:8082/api/k8s/clusters

请求 URL: /api/v1/auth/login
1. 检查 '/api/k8s' → ❌ 不匹配
2. 检查 '/api/v1'  → ✅ 匹配
   → 代理到 http://localhost:8090/api/v1/auth/login

请求 URL: /api/menu/all
1. 检查 '/api/k8s' → ❌ 不匹配
2. 检查 '/api/v1'  → ❌ 不匹配
3. 检查 '/api'     → ✅ 匹配
   → 代理到 http://localhost:5320/api/menu/all
```

## 故障排查

### 问题 1: 401 Unauthorized

**原因**: auth-service 未启动或 JWT token 无效

**解决方案**:

```bash
# 检查 auth-service 是否运行
curl http://localhost:8090/health

# 重新登录获取新 token
```

### 问题 2: 404 Not Found

**原因**: API 路径不正确或后端服务未启动

**解决方案**:

```bash
# 检查前端 API 路径
# 应该是 /v1/auth/login 而不是 /auth/login

# 检查后端路由
curl http://localhost:8090/api/v1/auth/login
```

### 问题 3: CORS 错误

**原因**: 跨域配置问题

**解决方案**:

- 确保 Vite 代理配置正确
- 确保后端服务允许跨域（已在 auth-service 中配置）

### 问题 4: 代理不工作

**检查步骤**:

1. 检查 vite.config.mts 中的代理配置
2. 重启前端开发服务器
3. 检查浏览器开发者工具 Network 标签
4. 确认请求 URL 是否正确

```bash
# 检查代理是否工作
# 前端应该请求: http://localhost:5667/api/v1/auth/login
# 实际代理到: http://localhost:8090/api/v1/auth/login
```

## 生产环境部署

生产环境中，建议使用 Nginx 或其他反向代理配置路由：

```nginx
# Nginx 配置示例
location /api/v1/ {
    proxy_pass http://auth-service:8090;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /api/k8s/ {
    proxy_pass http://cluster-service:8082;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```

## 参考资料

- [Vite Server Options](https://vitejs.dev/config/server-options.html)
- [auth-service API 文档](../k8s-agent/auth-service/README.md)
- [集成文档](./AUTH_SERVICE_INTEGRATION.md)
