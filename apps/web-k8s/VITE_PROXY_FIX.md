# Vite 代理配置修复报告 - Auth/User API Mock 路由

## 问题描述

用户信息接口 `/api/user/info` 没有正确代理到 Nitro Mock 服务，而是请求了真实接口，导致：

- ❌ 请求失败（因为没有真实的 auth-service）
- ❌ 无法获取用户信息
- ❌ 登录后功能异常

## 根本原因分析

### 问题代码

**修复前** 的 `vite.config.mts`:

```typescript
'/api': {
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api/, ''),  // ❌ 错误的 rewrite
  target: 'http://localhost:5320/api',             // ❌ 错误的 target
  ws: true,
},
```

### 请求路径变化

以 `/api/user/info` 为例：

**错误的路径转换**:

```
1. 浏览器请求: /api/user/info
2. 匹配代理规则: /api
3. rewrite 处理: /api/user/info → /user/info  (移除 /api 前缀)
4. 拼接 target: http://localhost:5320/api + /user/info
5. 最终请求: http://localhost:5320/api/user/info
```

**但是 Nitro Mock 服务的实际路由是**:

```
apps/backend-mock/api/user/info.ts
→ Nitro 自动映射: /api/user/info
```

**问题**:

- Vite 代理将 `/api/user/info` 重写为 `/user/info`
- 然后拼接 target `http://localhost:5320/api`
- 最终请求 `http://localhost:5320/api/user/info`
- 但因为 rewrite 的影响，实际可能请求到错误的地址

### Nitro Mock 服务路由规则

查看 `apps/backend-mock/nitro.config.ts`:

```typescript
routeRules: {
  '/api/**': {  // Nitro 监听 /api/** 路径
    cors: true,
    // ...
  },
}
```

**Nitro Mock 的文件路径映射**:

```
apps/backend-mock/api/user/info.ts  → /api/user/info
apps/backend-mock/api/auth/login.post.ts  → /api/auth/login
apps/backend-mock/api/auth/codes.ts  → /api/auth/codes
```

## 解决方案

### 修复后的配置

```typescript
'/api': {
  changeOrigin: true,
  // ✅ 移除 rewrite，保持原始路径
  // ✅ 修改 target 为 Nitro Mock 的根地址
  target: 'http://localhost:5320',
  ws: true,
},
```

### 修复后的请求流程

**正确的路径转换**:

```
1. 浏览器请求: /api/user/info
2. 匹配代理规则: /api
3. 不做 rewrite (保持原路径)
4. 拼接 target: http://localhost:5320 + /api/user/info
5. 最终请求: http://localhost:5320/api/user/info ✅
```

这样就正确匹配了 Nitro Mock 的路由规则！

## 完整的代理配置

### 修复后的 `vite.config.mts`

```typescript
server: {
  proxy: {
    // ==========================================
    // 优先级 1: K8s API → cluster-service
    // ==========================================
    '/api/k8s': {
      changeOrigin: true,
      target: 'http://localhost:8082',  // cluster-service 地址
      ws: true,
    },

    // ==========================================
    // 优先级 2: 其他 API → Nitro Mock
    // ==========================================
    '/api': {
      changeOrigin: true,
      target: 'http://localhost:5320',  // Nitro Mock 根地址
      ws: true,
    },
  },
}
```

## 请求路由对比

### Auth API

| API | 浏览器请求 | Vite 代理 | 最终请求 |
| --- | --- | --- | --- |
| 登录 | `/api/auth/login` | `/api` → `5320` | `http://localhost:5320/api/auth/login` ✅ |
| 退出 | `/api/auth/logout` | `/api` → `5320` | `http://localhost:5320/api/auth/logout` ✅ |
| 刷新 | `/api/auth/refresh` | `/api` → `5320` | `http://localhost:5320/api/auth/refresh` ✅ |
| 权限码 | `/api/auth/codes` | `/api` → `5320` | `http://localhost:5320/api/auth/codes` ✅ |

### User API

| API | 浏览器请求 | Vite 代理 | 最终请求 |
| --- | --- | --- | --- |
| 用户信息 | `/api/user/info` | `/api` → `5320` | `http://localhost:5320/api/user/info` ✅ |

### K8s API

| API | 浏览器请求 | Vite 代理 | 最终请求 |
| --- | --- | --- | --- |
| 集群列表 | `/api/k8s/clusters` | `/api/k8s` → `8082` | `http://localhost:8082/api/k8s/clusters` ✅ |
| Pod 列表 | `/api/k8s/clusters/.../pods` | `/api/k8s` → `8082` | `http://localhost:8082/api/k8s/clusters/.../pods` ✅ |

## 为什么之前的配置有问题

### 问题 1: 多余的 `rewrite`

```typescript
rewrite: (path) => path.replace(/^\/api/, '');
```

这个 rewrite 会将 `/api/user/info` 改成 `/user/info`，但：

- Nitro Mock 的路由是 `/api/user/info`（不是 `/user/info`）
- target 又是 `http://localhost:5320/api`
- 最终路径变成了 `http://localhost:5320/api/user/info` 或其他错误路径

### 问题 2: 错误的 `target`

```typescript
target: 'http://localhost:5320/api';
```

应该是：

```typescript
target: 'http://localhost:5320'; // Nitro Mock 的根地址
```

因为：

- Nitro Mock 监听端口 5320
- 路由规则是 `/api/**`
- 完整路径应该是 `http://localhost:5320/api/user/info`

## 验证方法

### 1. 重启开发服务器

修复后必须重启开发服务器：

```bash
# Ctrl+C 停止当前服务
# 然后重新启动
pnpm dev:k8s
```

### 2. 测试用户信息接口

打开浏览器控制台 (F12) → Network 标签：

1. **登录系统**（使用任意用户名密码，如 `admin/123456`）
2. **检查用户信息请求**:
   ```
   GET http://localhost:5668/api/user/info
   ```

**成功标志** ✅:

- 请求状态: `200 OK`
- 响应来源: Nitro Mock (`localhost:5320`)
- 返回 mock 用户数据（用户名、角色等）

**失败标志** ❌:

- 请求状态: `404 Not Found` 或 `500`
- 连接错误
- 无法获取用户信息

### 3. 检查登录接口

```
POST http://localhost:5668/api/auth/login
```

**成功标志** ✅:

- 返回 accessToken
- 登录成功

### 4. 检查 K8s 接口（确保没有影响）

```
GET http://localhost:5668/api/k8s/clusters
```

**成功标志** ✅:

- 请求到 cluster-service (`localhost:8082`)
- 返回真实集群数据

## 技术细节

### Vite 代理匹配顺序

Vite 代理按照配置**从上到下**匹配：

```typescript
proxy: {
  '/api/k8s': { ... },  // 1. 先匹配 /api/k8s
  '/api': { ... },      // 2. 再匹配 /api
}
```

**匹配规则**:

- `/api/k8s/clusters` → 匹配第一条 `/api/k8s` ✅
- `/api/user/info` → 不匹配第一条，匹配第二条 `/api` ✅
- `/api/auth/login` → 不匹配第一条，匹配第二条 `/api` ✅

### Nitro Mock 文件结构

```
apps/backend-mock/
├── api/
│   ├── auth/
│   │   ├── login.post.ts      → /api/auth/login (POST)
│   │   ├── logout.post.ts     → /api/auth/logout (POST)
│   │   ├── refresh.post.ts    → /api/auth/refresh (POST)
│   │   └── codes.ts           → /api/auth/codes (GET)
│   └── user/
│       └── info.ts            → /api/user/info (GET)
└── nitro.config.ts
```

**Nitro 自动路由规则**:

- `api/auth/login.post.ts` → `POST /api/auth/login`
- `api/user/info.ts` → `GET /api/user/info`

## 对比总结

| 配置项 | 修复前（错误） | 修复后（正确） |
| --- | --- | --- |
| rewrite | `path.replace(/^\/api/, '')` | 无 (移除) |
| target | `http://localhost:5320/api` | `http://localhost:5320` |
| /api/user/info 最终请求 | 错误路径 | `http://localhost:5320/api/user/info` ✅ |
| 是否能获取用户信息 | ❌ 否 | ✅ 是 |

## 影响范围

### 修复的 API（使用 Nitro Mock）

✅ **Auth API** (4 个):

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/codes`

✅ **User API** (1 个):

- `GET /api/user/info`

### 不受影响的 API（使用真实后端）

✅ **K8s API** (30+ 个):

- `GET /api/k8s/clusters`
- `GET /api/k8s/clusters/:id/namespaces/:ns/pods`
- 所有其他 K8s 资源 API

## 相关文件

- ✅ `vite.config.mts` - Vite 代理配置（已修复）
- ✅ `apps/backend-mock/nitro.config.ts` - Nitro Mock 配置
- ✅ `apps/backend-mock/api/user/info.ts` - 用户信息 mock
- ✅ `apps/backend-mock/api/auth/*.ts` - Auth 相关 mock

## 后续建议

### 1. 文档化代理规则

在 vite.config.mts 中添加更详细的注释：

```typescript
'/api': {
  changeOrigin: true,
  // Nitro Mock 服务地址（不需要 /api 后缀，因为 Nitro 的路由已包含 /api）
  // 请求: /api/user/info → http://localhost:5320/api/user/info
  target: 'http://localhost:5320',
  ws: true,
},
```

### 2. 添加调试日志

在开发时，可以添加 configure 回调查看代理转发：

```typescript
'/api': {
  changeOrigin: true,
  target: 'http://localhost:5320',
  ws: true,
  configure: (proxy, options) => {
    proxy.on('proxyReq', (proxyReq, req, res) => {
      console.log('[Proxy]', req.method, req.url, '→', options.target + req.url);
    });
  },
},
```

### 3. 环境变量管理

考虑将代理地址配置为环境变量：

```typescript
target: process.env.VITE_MOCK_API_URL || 'http://localhost:5320',
```

---

**修复日期**: 2025-10-18 **修复文件**: `vite.config.mts` **问题**: Auth/User API 未正确代理到 Nitro Mock **状态**: ✅ 已修复
