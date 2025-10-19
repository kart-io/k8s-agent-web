# API 路径修复报告

## 问题描述

前端（web-k8s）调用后端（cluster-service）K8s API 时存在路径不匹配问题，导致 API 调用失败。

## 根本原因

### 前端 API 路径配置错误

**问题路径**: `/k8s/clusters/...` **正确路径**: `/api/k8s/clusters/...`

前端在调用 K8s API 时缺少 `/api` 前缀，导致 Vite 代理无法正确转发请求到后端服务。

### 详细分析

#### 1. 后端路由配置 (cluster-service)

**文件**: `cluster-service/internal/api/server.go` **基础路径**: `/api/k8s`

```go
// 142-255 行：K8s API 路由
k8sAPI := s.engine.Group("/api/k8s")
{
    clusters := k8sAPI.Group("/clusters")
    {
        clusters.GET("", s.k8sAPIHandler.ListClusters)
        clusters.POST("", s.k8sAPIHandler.CreateCluster)
        clusters.GET("/:clusterId", s.k8sAPIHandler.GetCluster)
        // ...

        // Pod 路由示例
        clusters.GET("/:clusterId/namespaces/:namespace/pods", ...)
    }
}
```

**实际端点示例**:

- 集群列表: `GET /api/k8s/clusters`
- Pod 列表: `GET /api/k8s/clusters/{clusterId}/namespaces/{namespace}/pods`
- Pod 日志: `GET /api/k8s/clusters/{clusterId}/namespaces/{namespace}/pods/{name}/logs`

#### 2. 前端代理配置 (web-k8s)

**文件**: `apps/web-k8s/vite.config.mts`

```typescript
server: {
  proxy: {
    '/api/k8s': {
      target: 'http://localhost:8082',
      changeOrigin: true,
      ws: true,
    },
  },
}
```

**说明**:

- 代理只匹配 `/api/k8s/*` 路径
- 将请求转发到 `http://localhost:8082/api/k8s/*`
- **不匹配** `/k8s/*` 路径（缺少 `/api` 前缀）

#### 3. 前端 API 调用错误

**问题代码** (修复前):

**文件**: `src/api/k8s/resource-api-factory.ts`

```typescript
function buildResourcePath(
  clusterId: string,
  namespace?: string,
  name?: string,
): string {
  let path = `/k8s/clusters/${clusterId}`; // ❌ 缺少 /api 前缀
  // ...
  return path;
}

list: async (params: ResourceListParams) => {
  const endpoint = listEndpoint || `/k8s/${resourceTypePlural}`; // ❌ 缺少 /api 前缀
  return client.get(endpoint, { params });
};
```

**文件**: `src/api/k8s/index.ts`

```typescript
// Pod 日志 API
return requestClient.get(
  `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}/logs`, // ❌ 缺少 /api 前缀
  { params: queryParams },
);

// Namespace 列表 API
list: async (clusterId: string) => {
  return requestClient.get(`/k8s/clusters/${clusterId}/namespaces`); // ❌ 缺少 /api 前缀
};

// Node 列表 API
list: async (clusterId: string) => {
  return requestClient.get(`/k8s/clusters/${clusterId}/nodes`); // ❌ 缺少 /api 前缀
};

// Cluster API
list: async (params?: ClusterListParams) => {
  return requestClient.get('/k8s/clusters', { params }); // ❌ 缺少 /api 前缀
};
```

### 请求流程对比

#### 错误流程（修复前）

```
前端调用
  ↓
GET /k8s/clusters/{clusterId}/namespaces  ← 缺少 /api 前缀
  ↓
Vite 代理检查 '/api/k8s' 规则  → 不匹配 ✗
  ↓
请求未转发，返回 404
```

#### 正确流程（修复后）

```
前端调用
  ↓
GET /api/k8s/clusters/{clusterId}/namespaces  ← 包含 /api 前缀
  ↓
Vite 代理检查 '/api/k8s' 规则  → 匹配 ✓
  ↓
转发到 http://localhost:8082/api/k8s/clusters/{clusterId}/namespaces
  ↓
后端 cluster-service 处理请求 ✓
```

## 修复方案

### 修改文件清单

1. **src/api/k8s/resource-api-factory.ts**
   - 修改 `buildResourcePath()` 函数，将 `/k8s/` 改为 `/api/k8s/`
   - 修改 `list()` 函数中的默认 endpoint，将 `/k8s/` 改为 `/api/k8s/`

2. **src/api/k8s/index.ts**
   - 修改所有 API 调用路径，将 `/k8s/` 改为 `/api/k8s/`
   - 涉及的 API：Pod、Deployment、Service、ConfigMap、Secret、Namespace、Node、Cluster、StatefulSet、DaemonSet、ReplicaSet 等

### 修改详情

#### 1. resource-api-factory.ts

**修复代码**:

```typescript
function buildResourcePath(
  clusterId: string,
  namespace?: string,
  name?: string,
): string {
  let path = `/api/k8s/clusters/${clusterId}`; // ✓ 添加 /api 前缀

  if (namespaced && namespace) {
    path += `/namespaces/${namespace}`;
  }

  path += `/${resourceTypePlural}`;

  if (name) {
    path += `/${name}`;
  }

  return path;
}

// 列表 API
list: async (params: ResourceListParams) => {
  const endpoint = listEndpoint || `/api/k8s/${resourceTypePlural}`; // ✓ 添加 /api 前缀
  return client.get(endpoint, { params });
};
```

#### 2. index.ts

使用 sed 批量替换所有路径：

```bash
cd apps/web-k8s/src/api/k8s
sed -i '' 's|`/k8s/|`/api/k8s/|g' index.ts
```

**手动修复特殊情况**:

```typescript
// Cluster API
export const clusterApi = {
  list: async (params?: ClusterListParams): Promise<ClusterListResult> => {
    return requestClient.get('/api/k8s/clusters', { params });  // ✓ 添加 /api 前缀
  },

  create: async (data: Partial<Cluster>): Promise<Cluster> => {
    return requestClient.post('/api/k8s/clusters', data);  // ✓ 添加 /api 前缀
  },

  // ... 其他方法
}

// Namespace API
export const namespaceApi = {
  list: async (clusterId: string) => {
    return requestClient.get(`/api/k8s/clusters/${clusterId}/namespaces`);  // ✓
  },
  // ...
}

// Node API
export const nodeApi = {
  list: async (clusterId: string) => {
    return requestClient.get(`/api/k8s/clusters/${clusterId}/nodes`);  // ✓
  },
  // ...
}

// Pod 日志 API
logs: createMockableApi(
  async (params: PodLogsParams): Promise<string> => {
    const { clusterId, namespace, name, ...queryParams } = params;
    return requestClient.get(
      `/api/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}/logs`,  // ✓
      { params: queryParams },
    );
  },
  // ...
),
```

### 修改统计

| 文件                    | 修改行数   | 修改类型 |
| ----------------------- | ---------- | -------- |
| resource-api-factory.ts | 2 行       | 路径前缀 |
| index.ts                | 23+ 行     | 路径前缀 |
| **总计**                | **25+ 行** | -        |

### 影响范围

修复覆盖所有 K8s 资源的 API 调用：

- ✅ Pod (list, detail, logs, exec)
- ✅ Deployment (list, detail, scale, restart)
- ✅ Service (list, detail, create, update, delete)
- ✅ ConfigMap (list, detail, create, update, delete)
- ✅ Secret (list, detail, create, update, delete)
- ✅ Namespace (list, detail, create, delete)
- ✅ Node (list, detail, cordon, uncordon, drain, updateLabels, updateTaints)
- ✅ Cluster (list, detail, create, update, delete, metrics)
- ✅ StatefulSet (list, detail, scale, restart, delete)
- ✅ DaemonSet (list, detail, restart, delete)
- ✅ Job (list, detail, create, delete)
- ✅ CronJob (list, detail, create, update, delete, toggle)
- ✅ ReplicaSet (list, detail, scale)
- ✅ Ingress (list, detail, create, update, delete)
- ✅ PersistentVolume (list, detail, create, update, delete)
- ✅ PersistentVolumeClaim (list, detail, create, update, delete)
- ✅ StorageClass (list, detail, create, update, delete)
- ✅ ServiceAccount (list, detail, create, update, delete)
- ✅ Role / RoleBinding (list, detail, create, update, delete)
- ✅ ClusterRole / ClusterRoleBinding (list, detail, create, update, delete)
- ✅ ResourceQuota / LimitRange (list, detail, create, update, delete)
- ✅ Event (list, detail)
- ✅ NetworkPolicy (list, detail, create, update, delete)
- ✅ HorizontalPodAutoscaler (list, detail, create, update, delete)
- ✅ PriorityClass (list, detail, create, update, delete)
- ✅ Endpoints / EndpointSlice (list, detail, create, update, delete)

## 验证方法

### 1. 检查前端路径

```bash
cd apps/web-k8s
# 确认所有 API 路径都包含 /api/k8s 前缀
grep -r '`/k8s/' src/api/k8s/ | grep -v '/api/k8s'
# 应该只返回注释中的示例代码（如果有）
```

### 2. 检查后端路由

```bash
cd cluster-service
# 查看后端路由配置
grep -A 5 'Group("/api/k8s")' internal/api/server.go
```

### 3. 测试接口连通性

#### 启动后端服务

```bash
cd cluster-service
go run cmd/server/main.go -config configs/config-local.yaml
```

后端应启动在 `http://localhost:8082`

#### 启动前端服务

```bash
cd apps/web-k8s
pnpm dev:k8s
```

前端应启动在 `http://localhost:5667`

#### 测试 API 调用

打开浏览器开发者工具 (F12)，访问 `http://localhost:5667`，检查：

1. **网络请求**：
   - 应看到请求发送到 `/api/k8s/*` 路径
   - 请求应正确转发到 `http://localhost:8082`
   - 响应状态应为 2xx（成功）

2. **控制台日志**：
   - 如果使用 mock 模式，应看到 `[K8s Mock]` 日志
   - 如果使用真实 API，应看到正常的 API 响应数据

3. **功能验证**：
   - 集群列表页面应正常加载
   - Pod 列表应正常显示
   - Pod 日志应正常获取
   - 各种资源操作应正常工作

## 相关配置

### Mock 模式切换

如果需要在 mock 模式和真实 API 之间切换，参考：

- [Mock 模式快速开始](./MOCK_MODE_QUICK_START.md)
- [Mock 模式配置指南](./K8S_API_MOCK_MODE_GUIDE.md)

**切换到真实 API 模式**:

```bash
# 编辑 .env.development
VITE_USE_K8S_MOCK=false

# 重启前端服务
pnpm dev:k8s
```

### Vite 代理配置

**文件**: `apps/web-k8s/vite.config.mts`

```typescript
server: {
  port: 5667,
  proxy: {
    '/api/k8s': {
      target: 'http://localhost:8082',  // cluster-service 后端地址
      changeOrigin: true,
      ws: true,  // 支持 WebSocket（如 Pod exec/logs streaming）
    },
    '/api': {
      target: 'http://localhost:5320/api',  // 其他 API（如 auth）
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      ws: true,
    },
  },
}
```

**说明**:

- `/api/k8s/*` 路径转发到 cluster-service (8082 端口)
- `/api/*` 路径转发到其他后端服务 (5320 端口)
- 代理按顺序匹配，更具体的规则应放在前面

## 总结

### 问题根源

前端 API 路径缺少 `/api` 前缀，导致 Vite 代理无法匹配并转发请求到后端 cluster-service。

### 修复结果

- ✅ 统一所有 K8s API 路径为 `/api/k8s/*` 格式
- ✅ 覆盖 25+ 个资源的所有 CRUD 操作
- ✅ 保持与后端路由配置一致
- ✅ 保持与 Vite 代理配置匹配
- ✅ 支持 mock 模式和真实 API 模式无缝切换

### 最佳实践

1. **路径规范**: 所有 K8s API 调用必须使用 `/api/k8s/` 前缀
2. **代理配置**: Vite 代理规则必须与 API 路径前缀保持一致
3. **后端路由**: 后端路由基础路径必须与前端调用路径一致
4. **文档同步**: 代码示例和注释中的路径应保持最新

## 相关文档

- [API 代理配置文档](./API_PROXY_CONFIGURATION.md)
- [Mock API 修复报告](./MOCK_API_FIX_REPORT.md)
- [Mock 模式配置指南](./K8S_API_MOCK_MODE_GUIDE.md)

---

**修复日期**: 2025-10-18 **影响范围**: 所有 K8s 资源 API 调用 **修复状态**: ✅ 已完成
