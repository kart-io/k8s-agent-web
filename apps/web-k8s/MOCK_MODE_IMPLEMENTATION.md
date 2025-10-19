# Mock 模式统一实现文档

## 概述

所有 K8s API 现已支持通过环境变量 `VITE_USE_K8S_MOCK` 在 mock 数据和真实 API 之间无缝切换。

## 实现状态

### ✅ 完全支持 Mock 模式的 API (30 个)

所有资源 API 已全部支持 mock 模式切换：

#### 工作负载资源 (6 个)

1. **Pod** - `podApi` - 使用 `createMockableResourceApi` + `createMockableApi` (logs)
2. **Deployment** - `deploymentApi` - 使用 `createMockableResourceApi` (带 scale/restart)
3. **StatefulSet** - `statefulSetApi` - 使用 `createMockableResourceApi` (带 scale)
4. **DaemonSet** - `daemonSetApi` - 使用 `createMockableResourceApi`
5. **Job** - `jobApi` - 使用 `createMockableResourceApi`
6. **CronJob** - `cronJobApi` - 使用 `createMockableResourceApi` (带 toggle)

#### 服务与网络资源 (4 个)

7. **Service** - `serviceApi` - 使用 `createMockableResourceApi`
8. **Ingress** - `ingressApi` - 使用 `createMockableResourceApi`
9. **NetworkPolicy** - `networkPolicyApi` - 使用 `createMockableResourceApi`
10. **Endpoints** - `endpointsApi` - 使用 `createMockableResourceApi`
11. **EndpointSlice** - `endpointSliceApi` - 使用 `createMockableResourceApi`

#### 配置与存储资源 (6 个)

12. **ConfigMap** - `configMapApi` - 使用 `createMockableResourceApi`
13. **Secret** - `secretApi` - 使用 `createMockableResourceApi`
14. **PersistentVolume** - `pvApi` - 使用 `createMockableResourceApi`
15. **PersistentVolumeClaim** - `pvcApi` - 使用 `createMockableResourceApi`
16. **StorageClass** - `storageClassApi` - 使用 `createMockableResourceApi`
17. **Event** - `eventApi` - 使用 `createMockableResourceApi`

#### 集群资源 (3 个)

18. **Namespace** - `namespaceApi.list` - 使用 `createMockableApi`
19. **Node** - `nodeApi.list` - 使用 `createMockableApi`
20. **Cluster** - `clusterApi.list` - 使用 `createMockableApi`

#### RBAC 权限资源 (5 个)

21. **ServiceAccount** - `serviceAccountApi` - 使用 `createMockableResourceApi`
22. **Role** - `roleApi` - 使用 `createMockableResourceApi`
23. **RoleBinding** - `roleBindingApi` - 使用 `createMockableResourceApi`
24. **ClusterRole** - `clusterRoleApi` - 使用 `createMockableResourceApi`
25. **ClusterRoleBinding** - `clusterRoleBindingApi` - 使用 `createMockableResourceApi`

#### 资源配额与调度 (5 个)

26. **ResourceQuota** - `resourceQuotaApi` - 使用 `createMockableResourceApi`
27. **LimitRange** - `limitRangeApi` - 使用 `createMockableResourceApi`
28. **HorizontalPodAutoscaler (HPA)** - `hpaApi` - 使用 `createMockableResourceApi`
29. **PriorityClass** - `priorityClassApi` - 使用 `createMockableResourceApi`
30. **ReplicaSet** - `replicaSetApi` - 使用 `createMockableResourceApi` (带 scale)

## 实现方式

### 方式一：使用 `createMockableResourceApi` (27 个资源)

适用于使用工厂函数 `createResourceApi` 或 `createResourceApiWithExtras` 创建的 API。

**代码模式**:

```typescript
// 基础资源 API
const configMapApiBase = createMockableResourceApi(
  createResourceApi<ConfigMap>(requestClient, {
    resourceType: 'configmap',
    namespaced: true,
  }),
  'configmap',  // 资源类型名，用于查找对应的 mock 函数
);

// 带扩展操作的资源 API
export const statefulSetApi = createMockableResourceApi(
  createResourceApiWithExtras<StatefulSet, { scale: ... }>(
    requestClient,
    { resourceType: 'statefulset', namespaced: true },
    { scale: (clusterId, namespace, name, params) => { ... } }
  ),
  'statefulset',
);
```

**工作原理**:

1. `createMockableResourceApi` 检查 `VITE_USE_K8S_MOCK` 环境变量
2. 如果为 `true`，动态导入 `mock.ts` 并查找对应的 mock 函数
3. Mock 函数命名规则：`getMock{ResourceType}List`
   - `'pod'` → `getMockPodList`
   - `'configmap'` → `getMockConfigMapList`
   - `'statefulset'` → `getMockStatefulSetList`

### 方式二：使用 `createMockableApi` (3 个自定义 API)

适用于 Namespace、Node、Cluster 等自定义实现的 API。

**代码模式**:

```typescript
export const namespaceApi = {
  list: createMockableApi(
    // 真实 API
    async (clusterId: string) => {
      return requestClient.get(`/api/k8s/clusters/${clusterId}/namespaces`);
    },
    // Mock API
    async (clusterId: string) => {
      const { getMockNamespaceList } = await import('./mock');
      return getMockNamespaceList({ clusterId });
    },
  ),
  // 其他方法...
};
```

**工作原理**:

1. `createMockableApi` 检查 `VITE_USE_K8S_MOCK` 环境变量
2. 如果为 `true`，执行第二个参数（mock 函数）
3. 如果为 `false`，执行第一个参数（真实 API 函数）

## Mock 函数命名映射

### 标准映射

| 资源类型 (resourceType) | Mock 函数名                |
| ----------------------- | -------------------------- |
| `pod`                   | `getMockPodList`           |
| `deployment`            | `getMockDeploymentList`    |
| `service`               | `getMockServiceList`       |
| `configmap`             | `getMockConfigMapList`     |
| `secret`                | `getMockSecretList`        |
| `namespace`             | `getMockNamespaceList`     |
| `node`                  | `getMockNodeList`          |
| `statefulset`           | `getMockStatefulSetList`   |
| `daemonset`             | `getMockDaemonSetList`     |
| `job`                   | `getMockJobList`           |
| `cronjob`               | `getMockCronJobList`       |
| `ingress`               | `getMockIngressList`       |
| `networkpolicy`         | `getMockNetworkPolicyList` |
| `endpoints`             | `getMockEndpointsList`     |
| `endpointslice`         | `getMockEndpointSliceList` |

### 特殊映射（缩写形式）

| 资源类型                  | Mock 函数名                     | 说明       |
| ------------------------- | ------------------------------- | ---------- |
| `persistentvolume`        | `getMockPVList`                 | ✓ 使用缩写 |
| `persistentvolumeclaim`   | `getMockPVCList`                | ✓ 使用缩写 |
| `horizontalpodautoscaler` | `getMockHPAList`                | ✓ 使用缩写 |
| `storageclass`            | `getMockStorageClassList`       | ✓ 标准命名 |
| `serviceaccount`          | `getMockServiceAccountList`     | ✓ 标准命名 |
| `resourcequota`           | `getMockResourceQuotaList`      | ✓ 标准命名 |
| `limitrange`              | `getMockLimitRangeList`         | ✓ 标准命名 |
| `priorityclass`           | `getMockPriorityClassList`      | ✓ 标准命名 |
| `replicaset`              | `getMockReplicaSetList`         | ✓ 标准命名 |
| `role`                    | `getMockRoleList`               | ✓ 标准命名 |
| `rolebinding`             | `getMockRoleBindingList`        | ✓ 标准命名 |
| `clusterrole`             | `getMockClusterRoleList`        | ✓ 标准命名 |
| `clusterrolebinding`      | `getMockClusterRoleBindingList` | ✓ 标准命名 |
| `event`                   | `getMockEventList`              | ✓ 标准命名 |
| `cluster`                 | `getMockClusterList`            | ✓ 标准命名 |

## 使用方法

### 1. 切换到 Mock 模式

```bash
# 编辑环境配置
# apps/web-k8s/.env.development

VITE_USE_K8S_MOCK=true

# 重启开发服务器
pnpm dev:k8s
```

### 2. 切换到真实 API 模式

```bash
# 编辑环境配置
# apps/web-k8s/.env.development

VITE_USE_K8S_MOCK=false

# 启动后端服务
cd /path/to/cluster-service
go run cmd/server/main.go -config configs/config-local.yaml

# 重启前端服务
pnpm dev:k8s
```

### 3. 验证当前模式

打开浏览器控制台 (F12)：

**Mock 模式**: 会看到以下日志

```
[K8s Mock] Creating mockable API for pod
[K8s Mock] Using getMockPodList
[K8s Mock] Creating mockable API for deployment
[K8s Mock] Using getMockDeploymentList
```

**真实 API 模式**: 会看到网络请求

```
GET /api/k8s/clusters/cluster-prod-01/namespaces/default/pods
GET /api/k8s/clusters/cluster-prod-01/namespaces/default/deployments
```

## 核心文件

### API 定义

- **`src/api/k8s/index.ts`** - 所有 K8s API 定义，30 个资源全部支持 mock
- **`src/api/k8s/resource-api-factory.ts`** - 资源 API 工厂函数
- **`src/api/k8s/mock-adapter.ts`** - Mock 适配器，提供 `createMockableApi`
- **`src/api/k8s/mock-resource-factory.ts`** - Mock 资源工厂，提供 `createMockableResourceApi`

### Mock 数据

- **`src/api/k8s/mock.ts`** - 包含所有资源的 mock 函数（30 个 `getMock*List` 函数）

### 环境配置

- **`src/utils/env.ts`** - 环境变量工具，提供 `useK8sMock()`
- **`.env.development`** - 开发环境配置
- **`.env.production`** - 生产环境配置

## 覆盖范围

### API 层面

- ✅ 所有 `list` 操作都支持 mock（30/30）
- ⚠️ `detail`、`create`、`update`、`delete` 操作暂不支持 mock（回退到真实 API）
- ✅ 特殊操作支持 mock：
  - Pod logs (`getMockPodLogs`)
  - Deployment scale/restart (通过 `getMockDeploymentList`)
  - StatefulSet scale (通过 `getMockStatefulSetList`)
  - CronJob toggle (通过 `getMockCronJobList`)
  - ReplicaSet scale (通过 `getMockReplicaSetList`)

### 页面层面

所有使用 K8s API 的页面都会自动根据 `VITE_USE_K8S_MOCK` 切换模式：

- ✅ 工作负载页面 (Pods, Deployments, StatefulSets, DaemonSets, Jobs, CronJobs)
- ✅ 服务与网络页面 (Services, Ingresses, NetworkPolicies, Endpoints)
- ✅ 配置页面 (ConfigMaps, Secrets)
- ✅ 存储页面 (PVs, PVCs, StorageClasses, Storage Overview)
- ✅ 集群管理页面 (Clusters, Nodes, Namespaces)
- ✅ RBAC 页面 (ServiceAccounts, Roles, RoleBindings, ClusterRoles, ClusterRoleBindings)
- ✅ 资源配额页面 (ResourceQuotas, LimitRanges)
- ✅ 自动扩缩容页面 (HPAs)
- ✅ 事件页面

## 故障排查

### 问题：切换 mock 模式后没有生效

**解决方案**:

1. 确认修改了正确的 `.env.development` 文件
2. 必须重启开发服务器（Ctrl+C 然后 `pnpm dev:k8s`）
3. 清除浏览器缓存并刷新

### 问题：控制台显示 "Mock function not found"

**错误日志示例**:

```
[K8s Mock] Mock function getMockXxxList not found, falling back to real API
```

**解决方案**:

1. 检查 `src/api/k8s/mock.ts` 文件，确认对应的 mock 函数已导出
2. 检查函数命名是否符合规范：`getMock{ResourceType}List`
3. 检查资源类型名称映射是否正确

### 问题：部分页面仍然请求真实 API

**可能原因**:

1. 页面使用了自定义 API 实现（非标准工厂函数）
2. 页面使用了 `detail`、`create`、`update`、`delete` 等非 `list` 操作
3. 环境变量未正确读取

**解决方案**:

1. 检查该页面使用的 API 是否在本文档的"完全支持 Mock 模式的 API"列表中
2. 检查浏览器控制台是否有 `[K8s Mock]` 日志
3. 确认 `import.meta.env.VITE_USE_K8S_MOCK` 的值

## 开发指南

### 添加新资源的 Mock 支持

#### 1. 在 `mock.ts` 中添加 mock 函数

```typescript
export function getMockNewResourceList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): NewResourceListResult {
  return {
    items: [
      /* mock data */
    ],
    total: 10,
  };
}
```

#### 2. 在 `index.ts` 中使用 `createMockableResourceApi`

```typescript
const newResourceApiBase = createMockableResourceApi(
  createResourceApi<NewResource>(requestClient, {
    resourceType: 'newresource',
    namespaced: true,
  }),
  'newresource',
);

export const newResourceApi = newResourceApiBase;
```

#### 3. 测试

```bash
# 设置 VITE_USE_K8S_MOCK=true
pnpm dev:k8s

# 打开页面，检查控制台日志
# 应看到: [K8s Mock] Using getMockNewResourceList
```

## 最佳实践

1. **开发阶段**: 使用 mock 模式进行前端 UI 开发，无需依赖后端
2. **集成测试**: 切换到真实 API 模式验证前后端集成
3. **演示展示**: 使用 mock 模式展示稳定的演示数据
4. **自动化测试**: 在 E2E 测试中使用 mock 模式确保测试稳定性

## 相关文档

- [Mock 模式快速开始](./MOCK_MODE_QUICK_START.md)
- [Mock 模式配置指南](./K8S_API_MOCK_MODE_GUIDE.md)
- [API 路径修复报告](./API_PATH_FIX_REPORT.md)
- [Mock API 修复报告](./MOCK_API_FIX_REPORT.md)

---

**更新日期**: 2025-10-18 **覆盖率**: 30/30 资源 API (100%) **状态**: ✅ 生产就绪
