# API 代理配置说明

## 概述

web-k8s 前端应用现在配置了**混合 API 代理策略**:

- **K8s 资源管理接口**: 调用真实的 `cluster-service` 后端
- **登录和用户接口**: 继续使用 mock 数据

## 配置详情

### 代理规则 (vite.config.mts)

```typescript
server: {
  proxy: {
    // 1. K8s API 代理到真实后端 (必须在 /api 之前)
    '/api/k8s': {
      target: 'http://localhost:8082',
      changeOrigin: true,
      ws: true,
      // 不做路径重写,保持 /api/k8s 前缀
    },
    // 2. 其他 API (登录、用户等) 使用 mock
    '/api': {
      target: 'http://localhost:5320/api',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      ws: true,
    },
  },
}
```

### 请求路由示例

| 前端请求路径 | 代理到 | 实际后端 | 说明 |
| --- | --- | --- | --- |
| `/api/k8s/clusters` | `http://localhost:8082/k8s/clusters` | cluster-service | K8s 集群管理 |
| `/api/k8s/clusters/:id/namespaces/:ns/pods` | `http://localhost:8082/k8s/clusters/:id/namespaces/:ns/pods` | cluster-service | Pod 管理 |
| `/api/auth/login` | `http://localhost:5320/auth/login` | backend-mock | 登录接口 (mock) |
| `/api/user/info` | `http://localhost:5320/user/info` | backend-mock | 用户信息 (mock) |

## 后端服务

### cluster-service (真实 K8s 后端)

- **端口**: 8082
- **配置文件**: `k8s-agent/cluster-service/configs/config-local.yaml`
- **API 基础路径**: `/api/k8s`
- **支持的资源**:
  - 集群管理 (`/api/k8s/clusters`)
  - 命名空间 (`/api/k8s/clusters/:id/namespaces`)
  - Pod (`/api/k8s/clusters/:id/namespaces/:ns/pods`)
  - Deployment (`/api/k8s/clusters/:id/namespaces/:ns/deployments`)
  - Service (`/api/k8s/clusters/:id/namespaces/:ns/services`)
  - ConfigMap (`/api/k8s/clusters/:id/namespaces/:ns/configmaps`)
  - Secret (`/api/k8s/clusters/:id/namespaces/:ns/secrets`)
  - StatefulSet (`/api/k8s/clusters/:id/namespaces/:ns/statefulsets`)
  - DaemonSet (`/api/k8s/clusters/:id/namespaces/:ns/daemonsets`)
  - Node (`/api/k8s/clusters/:id/nodes`)

### backend-mock (Mock 服务)

- **端口**: 5320
- **API 基础路径**: `/api`
- **Mock 的接口**:
  - 认证: `/api/auth/*`
  - 用户: `/api/user/*`
  - 菜单: `/api/menu/*`

## 开发环境启动

### 1. 启动 cluster-service 后端

```bash
cd /Users/costalong/code/go/src/github.com/kart/k8s-agent/cluster-service
go run cmd/server/main.go -config configs/config-local.yaml
```

### 2. 启动前端开发服务器

```bash
cd /Users/costalong/code/go/src/github.com/kart/k8s-agent-web
pnpm dev:k8s
```

前端会在 `http://localhost:5667` 启动。

### 3. (可选) 启动 backend-mock

如果需要使用 mock 的登录和用户接口:

```bash
cd /Users/costalong/code/go/src/github.com/kart/k8s-agent-web
pnpm -F @vben/backend-mock run start
```

## API 调用示例

### 前端代码示例

```typescript
import { podApi, clusterApi } from '#/api/k8s';

// K8s API - 调用真实后端
const pods = await podApi.list({
  clusterId: 'cluster-1',
  namespace: 'default',
  page: 1,
  pageSize: 10,
});

const clusters = await clusterApi.list();

// 登录 API - 使用 mock
import { login } from '#/api/core/auth';
const result = await login({
  username: 'admin',
  password: 'admin123',
});
```

## 注意事项

1. **代理顺序很重要**:
   - `/api/k8s` 规则必须在 `/api` 规则**之前**
   - Vite 会按照定义顺序匹配代理规则

2. **启动顺序**:
   - 先启动 cluster-service (8082)
   - 再启动前端开发服务器 (5667)
   - 如需登录功能,启动 backend-mock (5320)

3. **CORS 配置**:
   - cluster-service 已配置 CORS 中间件 (`middleware.CORS()`)
   - 支持跨域请求

4. **WebSocket 支持**:
   - 两个代理规则都启用了 `ws: true`
   - 支持 WebSocket 连接(如 Pod logs streaming)

## 调试

### 验证代理配置是否生效

**重要**: 修改 `vite.config.mts` 后,必须**重启前端开发服务器**才能生效!

```bash
# 停止当前运行的 dev server (Ctrl+C)
# 然后重新启动
pnpm dev:k8s
```

### 检查请求是否代理成功

1. 打开浏览器开发者工具 (F12)
2. 切换到 Network 标签
3. 发起 K8s API 请求(如访问集群列表)
4. 查看请求详情:
   - **Request URL**: 应该是 `http://localhost:5668/api/k8s/clusters`
   - **远程地址**: 如果显示 `localhost:8082`,说明代理成功
   - **响应数据**: 检查是否来自真实后端(不是 mock 数据)

### 如何区分 Mock 数据和真实数据

**Mock 数据特征** (backend-mock):

- 集群数据通常有固定的 ID: `cluster-1`, `cluster-2`
- Pod 数据包含 mock 的命名规则

**真实数据特征** (cluster-service):

- 来自实际 Kubernetes 集群
- 如果没有添加集群,列表可能为空
- 返回格式符合 cluster-service 的 API 规范

### 常见问题

**问题**: K8s API 请求仍然返回 mock 数据

- **原因**: Vite dev server 没有重启,或者代理配置顺序不对
- **解决**:
  1. 停止 dev server (Ctrl+C)
  2. 确认 `vite.config.mts` 中 `/api/k8s` 在 `/api` 之前
  3. 重新启动: `pnpm dev:k8s`

**问题**: K8s API 请求失败 404

- **检查**: cluster-service 是否在 8082 端口运行
- **验证**: `curl http://localhost:8082/health`
- **测试 K8s API**: `curl http://localhost:8082/api/k8s/clusters`

**问题**: 登录失败

- **检查**: backend-mock 是否在 5320 端口运行
- **验证**: `curl http://localhost:5320/api/auth/codes`

**问题**: CORS 错误

- **检查**: cluster-service 的 CORS 中间件是否启用
- **确认**: 查看 `k8s-agent/cluster-service/internal/api/server.go:70`

## 环境变量

### web-k8s/.env.development

```bash
# 端口号
VITE_PORT=5667

# 接口地址 (前端会添加这个前缀)
VITE_GLOB_API_URL=/api

# 是否开启 Nitro Mock服务
VITE_NITRO_MOCK=true
```

## 相关文件

- 代理配置: `apps/web-k8s/vite.config.mts`
- API 定义: `apps/web-k8s/src/api/k8s/index.ts`
- 后端路由: `k8s-agent/cluster-service/internal/api/server.go`
- 后端 Handler: `k8s-agent/cluster-service/internal/handler/k8s_api.go`

---

**更新日期**: 2025-10-17 **配置人**: Claude Code
