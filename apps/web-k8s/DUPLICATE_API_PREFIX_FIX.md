# 重复 /api 前缀修复报告

## 问题描述

在切换到真实 K8s API 模式后（`VITE_USE_K8S_MOCK=false`），发现 ReplicaSet 页面的请求路径出现重复的 `/api` 前缀：

**错误的请求路径**:

```
http://localhost:5668/api/api/k8s/replicasets?clusterId=cluster-prod-01&page=1&pageSize=20
```

**正确的请求路径**:

```
http://localhost:5668/api/k8s/replicasets?clusterId=cluster-prod-01&page=1&pageSize=20
```

## 根本原因

项目中存在两处配置 `/api` 前缀：

### 1. 请求客户端的 baseURL

在 `src/api/request.ts` 中，`requestClient` 使用了 `baseURL`:

```typescript
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});
```

环境变量配置（`.env.development`）:

```bash
VITE_GLOB_API_URL=/api
```

因此，`requestClient` 的 `baseURL` 为 `/api`。

### 2. API 路径中的 /api 前缀

在 `src/api/k8s/resource-api-factory.ts` 和 `src/api/k8s/index.ts` 中，路径又包含了 `/api` 前缀：

```typescript
// resource-api-factory.ts (修复前)
function buildResourcePath(...) {
  let path = `/api/k8s/clusters/${clusterId}`;  // ❌ 重复的 /api
  // ...
}

list: async (params: ResourceListParams) => {
  const endpoint = listEndpoint || `/api/k8s/${resourceTypePlural}`;  // ❌ 重复的 /api
  return client.get(endpoint, { params });
}
```

### 3. 最终请求路径拼接

当调用 `replicaSetApi.list()` 时：

1. `endpoint` = `/api/k8s/replicasets` （从 resource-api-factory.ts）
2. `baseURL` = `/api` （从 requestClient）
3. **最终路径** = `baseURL` + `endpoint` = `/api` + `/api/k8s/replicasets` = `/api/api/k8s/replicasets` ❌

## 解决方案

### 修复策略

由于 `requestClient` 的 `baseURL` 已经包含 `/api`，所以 API 路径中不应该再包含 `/api` 前缀。

### 修复的文件

#### 1. `src/api/k8s/resource-api-factory.ts`

**修复内容**: 移除 `buildResourcePath` 和 `list` 函数中的 `/api` 前缀

```typescript
// 修复前
function buildResourcePath(clusterId, namespace?, name?) {
  let path = `/api/k8s/clusters/${clusterId}`; // ❌
  // ...
}

list: async (params: ResourceListParams) => {
  const endpoint = listEndpoint || `/api/k8s/${resourceTypePlural}`; // ❌
  return client.get(endpoint, { params });
};

// 修复后
function buildResourcePath(clusterId, namespace?, name?) {
  let path = `/k8s/clusters/${clusterId}`; // ✅
  // ...
}

list: async (params: ResourceListParams) => {
  const endpoint = listEndpoint || `/k8s/${resourceTypePlural}`; // ✅
  return client.get(endpoint, { params });
};
```

#### 2. `src/api/k8s/index.ts`

**修复内容**: 移除所有手动构建路径中的 `/api` 前缀（24 处修改）

使用 sed 批量替换：

```bash
sed -i '' 's|`/api/k8s/clusters/|`/k8s/clusters/|g' index.ts
```

**修复示例**:

```typescript
// Cluster API
// 修复前
list: createMockableApi(
  async (params?: ClusterListParams): Promise<ClusterListResult> => {
    return requestClient.get('/api/k8s/clusters', { params }); // ❌
  },
  // ...
);

// 修复后
list: createMockableApi(
  async (params?: ClusterListParams): Promise<ClusterListResult> => {
    return requestClient.get('/k8s/clusters', { params }); // ✅
  },
  // ...
);

// Namespace API
// 修复前
list: createMockableApi(
  async (clusterId: string) => {
    return requestClient.get(`/api/k8s/clusters/${clusterId}/namespaces`); // ❌
  },
  // ...
);

// 修复后
list: createMockableApi(
  async (clusterId: string) => {
    return requestClient.get(`/k8s/clusters/${clusterId}/namespaces`); // ✅
  },
  // ...
);

// Node API
// 修复前
cordon: async (clusterId: string, name: string): Promise<Node> => {
  return requestClient.post(
    `/api/k8s/clusters/${clusterId}/nodes/${name}/cordon`, // ❌
  );
};

// 修复后
cordon: async (clusterId: string, name: string): Promise<Node> => {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/nodes/${name}/cordon`, // ✅
  );
};

// Pod API
// 修复前
logs: createMockableApi(
  async (params: PodLogsParams): Promise<string> => {
    const { clusterId, namespace, name, ...queryParams } = params;
    return requestClient.get(
      `/api/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}/logs`, // ❌
      { params: queryParams },
    );
  },
  // ...
);

// 修复后
logs: createMockableApi(
  async (params: PodLogsParams): Promise<string> => {
    const { clusterId, namespace, name, ...queryParams } = params;
    return requestClient.get(
      `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}/logs`, // ✅
      { params: queryParams },
    );
  },
  // ...
);
```

## 修复效果

### 修复前的请求路径

| API | 错误路径 |
| --- | --- |
| ReplicaSet List | `/api/api/k8s/replicasets` ❌ |
| Pod List | `/api/api/k8s/pods` ❌ |
| Deployment List | `/api/api/k8s/deployments` ❌ |
| Node List | `/api/api/k8s/clusters/{id}/nodes` ❌ |
| Namespace List | `/api/api/k8s/clusters/{id}/namespaces` ❌ |
| Pod Logs | `/api/api/k8s/clusters/{id}/namespaces/{ns}/pods/{name}/logs` ❌ |
| Deployment Scale | `/api/api/k8s/clusters/{id}/namespaces/{ns}/deployments/{name}/scale` ❌ |

### 修复后的请求路径

| API | 正确路径 |
| --- | --- |
| ReplicaSet List | `/api/k8s/replicasets` ✅ |
| Pod List | `/api/k8s/pods` ✅ |
| Deployment List | `/api/k8s/deployments` ✅ |
| Node List | `/api/k8s/clusters/{id}/nodes` ✅ |
| Namespace List | `/api/k8s/clusters/{id}/namespaces` ✅ |
| Pod Logs | `/api/k8s/clusters/{id}/namespaces/{ns}/pods/{name}/logs` ✅ |
| Deployment Scale | `/api/k8s/clusters/{id}/namespaces/{ns}/deployments/{name}/scale` ✅ |

## 影响范围

### 修复的 API 类型

本次修复影响所有使用 `requestClient` 的 K8s API（30+ 个资源类型）：

#### 工作负载资源

- Pod（包括 logs、exec 操作）
- Deployment（包括 scale、restart 操作）
- StatefulSet（包括 scale 操作）
- DaemonSet
- Job
- CronJob（包括 toggle 操作）
- ReplicaSet（包括 scale 操作）

#### 服务与网络

- Service
- Ingress
- NetworkPolicy
- Endpoints
- EndpointSlice

#### 配置与存储

- ConfigMap
- Secret
- PersistentVolume
- PersistentVolumeClaim
- StorageClass
- Event

#### 集群资源

- Namespace（包括 detail、create、delete 操作）
- Node（包括 cordon、uncordon、drain、updateLabels、updateTaints 操作）
- Cluster（包括 detail、create、update、delete、metrics 操作）

#### RBAC 权限

- ServiceAccount
- Role
- RoleBinding
- ClusterRole
- ClusterRoleBinding

#### 资源配额与调度

- ResourceQuota
- LimitRange
- HorizontalPodAutoscaler
- PriorityClass

### 受影响的页面

修复后，以下所有页面的 API 请求路径都会正确：

- `/k8s/workloads/pods` - Pod 列表
- `/k8s/workloads/deployments` - Deployment 列表
- `/k8s/workloads/statefulsets` - StatefulSet 列表
- `/k8s/workloads/daemonsets` - DaemonSet 列表
- `/k8s/workloads/jobs` - Job 列表
- `/k8s/workloads/cronjobs` - CronJob 列表
- `/k8s/workloads/replicasets` - ReplicaSet 列表
- `/k8s/services` - Service 列表
- `/k8s/network/ingresses` - Ingress 列表
- `/k8s/network/network-policies` - NetworkPolicy 列表
- `/k8s/config/configmaps` - ConfigMap 列表
- `/k8s/config/secrets` - Secret 列表
- `/k8s/storage/persistent-volumes` - PV 列表
- `/k8s/storage/persistent-volume-claims` - PVC 列表
- `/k8s/storage/storage-classes` - StorageClass 列表
- `/k8s/storage/overview` - 存储概览
- `/k8s/cluster` - 集群管理
- `/k8s/nodes` - 节点管理
- `/k8s/namespaces` - 命名空间管理
- `/k8s/rbac/*` - 所有 RBAC 页面
- `/k8s/quota/*` - 资源配额页面
- `/k8s/autoscaling/hpa` - HPA 页面
- `/k8s/events` - 事件页面

## 验证方法

### 1. 启动开发服务器

确保环境配置正确：

```bash
# .env.development
VITE_USE_K8S_MOCK=false  # 使用真实 API
VITE_GLOB_API_URL=/api   # 基础 API 路径
```

启动前端：

```bash
pnpm dev:k8s
```

启动后端（Go 服务）：

```bash
cd /path/to/cluster-service
go run cmd/server/main.go -config configs/config-local.yaml
```

### 2. 检查网络请求

打开浏览器控制台 (F12) → Network 标签，访问任意 K8s 资源页面：

**✅ 成功标志**:

- 请求路径为 `/api/k8s/...`（只有一个 `/api` 前缀）
- 后端正常响应（状态码 200 或符合业务逻辑的状态码）

**❌ 失败标志**:

- 请求路径为 `/api/api/k8s/...`（两个 `/api` 前缀）
- 后端返回 404 Not Found

### 3. 测试关键页面

逐个测试以下页面，确认请求路径正确：

```bash
# 1. ReplicaSet 页面（原问题页面）
http://localhost:5668/k8s/replicasets
# 期望请求: GET /api/k8s/replicasets?clusterId=...&page=1&pageSize=20

# 2. Pod 页面
http://localhost:5668/k8s/workloads/pods
# 期望请求: GET /api/k8s/pods?clusterId=...&namespace=...

# 3. Deployment 页面
http://localhost:5668/k8s/workloads/deployments
# 期望请求: GET /api/k8s/deployments?clusterId=...&namespace=...

# 4. Namespace 页面
http://localhost:5668/k8s/namespaces
# 期望请求: GET /api/k8s/clusters/cluster-prod-01/namespaces

# 5. Node 页面
http://localhost:5668/k8s/nodes
# 期望请求: GET /api/k8s/clusters/cluster-prod-01/nodes

# 6. Cluster 页面
http://localhost:5668/k8s/cluster
# 期望请求: GET /api/k8s/clusters
```

## 相关配置

### Vite 代理配置

确认 `vite.config.mts` 的代理配置正确（应该已经配置好）:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8082',
    changeOrigin: true,
    ws: true,
  },
}
```

### 请求流程

修复后的完整请求流程：

1. **前端调用**: `replicaSetApi.list({ clusterId, page: 1, pageSize: 20 })`
2. **工厂函数构建**: `endpoint = '/k8s/replicasets'`
3. **请求客户端**: `requestClient.get('/k8s/replicasets', { params })`
4. **拼接 baseURL**: `/api` + `/k8s/replicasets` = `/api/k8s/replicasets`
5. **浏览器请求**: `http://localhost:5668/api/k8s/replicasets?clusterId=...`
6. **Vite 代理**: `/api` → `http://localhost:8082`
7. **后端接收**: `http://localhost:8082/api/k8s/replicasets?clusterId=...`
8. **Go 路由匹配**: `GET /api/k8s/replicasets` ✅

## 统计信息

| 项目            | 数量         |
| --------------- | ------------ |
| 修改的文件      | 2            |
| 修改的代码行    | 26+          |
| 影响的资源类型  | 30+          |
| 影响的页面      | 20+          |
| 修复的 API 路径 | 所有 K8s API |

## 后续建议

### 1. 代码规范

建立明确的 API 路径规范：

- **baseURL**: 在 `requestClient` 配置中统一管理（`/api`）
- **API 路径**: 不应包含 `baseURL` 的前缀，只写相对路径（`/k8s/...`）
- **文档化**: 在代码注释中说明路径拼接规则

### 2. 自动化测试

添加 API 路径验证测试：

```typescript
describe('API Paths', () => {
  it('should not have duplicate /api prefix', () => {
    // 验证生成的路径不包含重复的 /api
    expect(buildResourcePath('cluster-1')).not.toMatch(/\/api\/api/);
  });

  it('should generate correct endpoint for ReplicaSet', () => {
    const endpoint = buildResourcePath('cluster-1', 'default', undefined);
    expect(endpoint).toBe(
      '/k8s/clusters/cluster-1/namespaces/default/replicasets',
    );
  });
});
```

### 3. CI/CD 检查

在 CI/CD 流程中添加检查：

```bash
# 检查代码中是否有潜在的重复 /api 前缀
grep -r "'/api/k8s/" src/api/k8s/*.ts | grep -v ".md" && exit 1 || exit 0
```

---

**修复日期**: 2025-10-18 **修复文件**:

- `src/api/k8s/resource-api-factory.ts`
- `src/api/k8s/index.ts`

**影响范围**: 所有 K8s API（30+ 资源类型，20+ 页面） **状态**: ✅ 已完成
