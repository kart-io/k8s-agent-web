# K8s API 前后端接口迁移方案

**日期**: 2025-10-21
**状态**: 📋 待实施
**优先级**: 🔴 高

---

## 问题概述

cluster-service 后端 API 已经重新设计为**扁平化路由 + 查询参数**风格，但前端仍然使用**嵌套路径**风格，导致前后端接口不匹配。

### 后端 API 风格（新）

```
GET /api/k8s/pods?clusterId=xxx&namespace=yyy&name=zzz
GET /api/k8s/deployments?clusterId=xxx&namespace=yyy
POST /api/k8s/deployment/scale?clusterId=xxx&namespace=yyy&name=zzz
```

**特点**：
- ✅ 扁平化路由（所有资源都在 `/api/k8s/` 下）
- ✅ 使用查询参数传递 `clusterId`、`namespace`、`name`
- ✅ 统一的 RESTful 设计

### 前端 API 风格（旧）

```typescript
GET /k8s/clusters/{clusterId}/namespaces/{namespace}/pods
GET /k8s/clusters/{clusterId}/namespaces/{namespace}/deployments
POST /k8s/clusters/{clusterId}/namespaces/{namespace}/deployments/{name}/scale
```

**特点**：
- ❌ 嵌套路径设计
- ❌ 使用路径参数传递层级关系
- ❌ 与后端新接口完全不兼容

---

## 后端新 API 接口定义

### 集群管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/clusters` | - | 获取集群列表 |
| GET | `/api/k8s/clusters/options` | - | 获取集群选择器列表 |
| POST | `/api/k8s/clusters` | - | 创建集群 |
| GET | `/api/k8s/cluster` | `clusterId` | 获取集群详情 |
| PUT | `/api/k8s/cluster` | `clusterId` | 更新集群 |
| DELETE | `/api/k8s/cluster` | `clusterId` | 删除集群 |
| GET | `/api/k8s/cluster/health` | `clusterId` | 获取集群健康状态 |

### 命名空间管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/namespaces` | `clusterId` | 获取命名空间列表 |
| POST | `/api/k8s/namespaces` | `clusterId` | 创建命名空间 |
| GET | `/api/k8s/namespace` | `clusterId`, `namespace` | 获取命名空间详情 |
| DELETE | `/api/k8s/namespace` | `clusterId`, `namespace` | 删除命名空间 |

### Pod 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/pods` | `clusterId`, `namespace` | 获取 Pod 列表 |
| GET | `/api/k8s/pod` | `clusterId`, `namespace`, `name` | 获取 Pod 详情 |
| DELETE | `/api/k8s/pod` | `clusterId`, `namespace`, `name` | 删除 Pod |
| GET | `/api/k8s/pod/logs` | `clusterId`, `namespace`, `name`, `container` | 获取 Pod 日志 |

### Deployment 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/deployments` | `clusterId`, `namespace` | 获取列表 |
| GET | `/api/k8s/deployment` | `clusterId`, `namespace`, `name` | 获取详情 |
| PUT | `/api/k8s/deployment/scale` | `clusterId`, `namespace`, `name` | 扩缩容 |
| POST | `/api/k8s/deployment/restart` | `clusterId`, `namespace`, `name` | 重启 |

### Service 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/services` | `clusterId`, `namespace` | 获取列表 |
| POST | `/api/k8s/services` | `clusterId`, `namespace` | 创建 |
| GET | `/api/k8s/service` | `clusterId`, `namespace`, `name` | 获取详情 |
| PUT | `/api/k8s/service` | `clusterId`, `namespace`, `name` | 更新 |
| DELETE | `/api/k8s/service` | `clusterId`, `namespace`, `name` | 删除 |

### Node 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/nodes` | `clusterId` | 获取列表 |
| GET | `/api/k8s/node` | `clusterId`, `name` | 获取详情 |
| POST | `/api/k8s/node/cordon` | `clusterId`, `name` | 标记为不可调度 |
| POST | `/api/k8s/node/uncordon` | `clusterId`, `name` | 标记为可调度 |
| POST | `/api/k8s/node/drain` | `clusterId`, `name` | 驱逐 Pod |

### StatefulSet 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/statefulsets` | `clusterId`, `namespace` | 获取列表 |
| GET | `/api/k8s/statefulset` | `clusterId`, `namespace`, `name` | 获取详情 |
| PUT | `/api/k8s/statefulset/scale` | `clusterId`, `namespace`, `name` | 扩缩容 |
| POST | `/api/k8s/statefulset/restart` | `clusterId`, `namespace`, `name` | 重启 |
| DELETE | `/api/k8s/statefulset` | `clusterId`, `namespace`, `name` | 删除 |

### DaemonSet 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/daemonsets` | `clusterId`, `namespace` | 获取列表 |
| GET | `/api/k8s/daemonset` | `clusterId`, `namespace`, `name` | 获取详情 |
| POST | `/api/k8s/daemonset/restart` | `clusterId`, `namespace`, `name` | 重启 |
| DELETE | `/api/k8s/daemonset` | `clusterId`, `namespace`, `name` | 删除 |

### ConfigMap 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/configmaps` | `clusterId`, `namespace` | 获取列表 |
| POST | `/api/k8s/configmaps` | `clusterId`, `namespace` | 创建 |
| GET | `/api/k8s/configmap` | `clusterId`, `namespace`, `name` | 获取详情 |
| PUT | `/api/k8s/configmap` | `clusterId`, `namespace`, `name` | 更新 |
| DELETE | `/api/k8s/configmap` | `clusterId`, `namespace`, `name` | 删除 |

### Secret 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/secrets` | `clusterId`, `namespace` | 获取列表 |
| POST | `/api/k8s/secrets` | `clusterId`, `namespace` | 创建 |
| GET | `/api/k8s/secret` | `clusterId`, `namespace`, `name`, `includeData=true` | 获取详情 |
| PUT | `/api/k8s/secret` | `clusterId`, `namespace`, `name` | 更新 |
| DELETE | `/api/k8s/secret` | `clusterId`, `namespace`, `name` | 删除 |

### PVC 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/pvcs` | `clusterId`, `namespace` | 获取列表 |
| GET | `/api/k8s/pvc` | `clusterId`, `namespace`, `name` | 获取详情 |
| DELETE | `/api/k8s/pvc` | `clusterId`, `namespace`, `name` | 删除 |

### PV 管理 API (cluster-scoped)

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/pvs` | `clusterId` | 获取列表 |
| GET | `/api/k8s/pv` | `clusterId`, `name` | 获取详情 |
| DELETE | `/api/k8s/pv` | `clusterId`, `name` | 删除 |

### HPA 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/hpas` | `clusterId`, `namespace` | 获取列表 |
| GET | `/api/k8s/hpa` | `clusterId`, `namespace`, `name` | 获取详情 |
| DELETE | `/api/k8s/hpa` | `clusterId`, `namespace`, `name` | 删除 |

### Event 管理 API

| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/events` | `clusterId`, `namespace`, `type` | 获取列表 |
| GET | `/api/k8s/event` | `clusterId`, `namespace`, `name` | 获取详情 |

### RBAC 管理 API

**RoleBinding** (namespace-scoped):
| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/rolebindings` | `clusterId`, `namespace` | 获取列表 |
| GET | `/api/k8s/rolebinding` | `clusterId`, `namespace`, `name` | 获取详情 |
| DELETE | `/api/k8s/rolebinding` | `clusterId`, `namespace`, `name` | 删除 |

**ClusterRole** (cluster-scoped):
| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/clusterroles` | `clusterId` | 获取列表 |
| GET | `/api/k8s/clusterrole` | `clusterId`, `name` | 获取详情 |
| DELETE | `/api/k8s/clusterrole` | `clusterId`, `name` | 删除 |

**PriorityClass** (cluster-scoped):
| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/priorityclasses` | `clusterId` | 获取列表 |
| GET | `/api/k8s/priorityclass` | `clusterId`, `name` | 获取详情 |
| DELETE | `/api/k8s/priorityclass` | `clusterId`, `name` | 删除 |

**Role** (namespace-scoped):
| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/roles` | `clusterId`, `namespace` | 获取列表 |
| GET | `/api/k8s/role` | `clusterId`, `namespace`, `name` | 获取详情 |
| DELETE | `/api/k8s/role` | `clusterId`, `namespace`, `name` | 删除 |

**StorageClass** (cluster-scoped):
| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/storageclasses` | `clusterId` | 获取列表 |
| GET | `/api/k8s/storageclass` | `clusterId`, `name` | 获取详情 |
| DELETE | `/api/k8s/storageclass` | `clusterId`, `name` | 删除 |

**Endpoints**:
| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/endpoints` | `clusterId`, `namespace` | 获取列表 |
| GET | `/api/k8s/endpoint` | `clusterId`, `namespace`, `name` | 获取详情 |
| DELETE | `/api/k8s/endpoint` | `clusterId`, `namespace`, `name` | 删除 |

**EndpointSlice**:
| 方法 | 路径 | 查询参数 | 说明 |
|------|------|----------|------|
| GET | `/api/k8s/endpointslices` | `clusterId`, `namespace` | 获取列表 |
| GET | `/api/k8s/endpointslice` | `clusterId`, `namespace`, `name` | 获取详情 |
| DELETE | `/api/k8s/endpointslice` | `clusterId`, `namespace`, `name` | 删除 |

---

## 迁移方案

### 方案 1: 创建新的 API 工厂函数（推荐）

**优点**：
- ✅ 不影响现有代码
- ✅ 可以逐步迁移
- ✅ 支持新旧 API 共存

**步骤**：

1. 创建新的资源 API 工厂 `apps/web-k8s/src/api/k8s/query-param-api-factory.ts`
2. 使用查询参数而不是路径参数
3. 更新所有资源 API 使用新工厂
4. 测试并验证

### 方案 2: 修改现有工厂函数（快速但有风险）

**优点**：
- ✅ 修改量小
- ✅ 统一API调用方式

**缺点**：
- ❌ 一次性修改，可能影响现有功能
- ❌ 难以回滚

---

## 实施步骤（推荐方案 1）

### 步骤 1: 创建新的 API 工厂函数

创建文件 `apps/web-k8s/src/api/k8s/query-param-api-factory.ts`：

```typescript
/**
 * K8s 资源 API 工厂 - 查询参数风格
 * 适配新的后端 API 设计（扁平化路由 + 查询参数）
 */

import type { requestClient } from '../request';

export interface QueryParamResourceConfig {
  /** 资源类型单数形式（用于单个资源端点，如 'pod', 'deployment'） */
  resourceType: string;
  /** 资源类型复数形式（用于列表端点，如 'pods', 'deployments'） */
  resourceTypePlural: string;
  /** 是否需要命名空间（默认为 true） */
  namespaced?: boolean;
}

export interface QueryParamResourceApi<T> {
  list: (params: {
    clusterId: string;
    namespace?: string;
    [key: string]: any;
  }) => Promise<any>;

  detail: (params: {
    clusterId: string;
    namespace?: string;
    name: string;
  }) => Promise<T>;

  create: (params: {
    clusterId: string;
    namespace?: string;
    data: T;
  }) => Promise<T>;

  update: (params: {
    clusterId: string;
    namespace?: string;
    name: string;
    data: T;
  }) => Promise<T>;

  delete: (params: {
    clusterId: string;
    namespace?: string;
    name: string;
  }) => Promise<void>;
}

/**
 * 创建基于查询参数的资源 API
 */
export function createQueryParamResourceApi<T>(
  client: typeof requestClient,
  config: QueryParamResourceConfig,
): QueryParamResourceApi<T> {
  const {
    resourceType,
    resourceTypePlural,
    namespaced = true,
  } = config;

  return {
    /**
     * 获取资源列表
     * GET /api/k8s/pods?clusterId=xxx&namespace=yyy
     */
    list: async (params) => {
      return client.get(`/k8s/${resourceTypePlural}`, { params });
    },

    /**
     * 获取资源详情
     * GET /api/k8s/pod?clusterId=xxx&namespace=yyy&name=zzz
     */
    detail: async (params) => {
      return client.get(`/k8s/${resourceType}`, { params });
    },

    /**
     * 创建资源
     * POST /api/k8s/pods?clusterId=xxx&namespace=yyy
     */
    create: async ({ data, ...params }) => {
      return client.post(`/k8s/${resourceTypePlural}`, data, { params });
    },

    /**
     * 更新资源
     * PUT /api/k8s/pod?clusterId=xxx&namespace=yyy&name=zzz
     */
    update: async ({ data, ...params }) => {
      return client.put(`/k8s/${resourceType}`, data, { params });
    },

    /**
     * 删除资源
     * DELETE /api/k8s/pod?clusterId=xxx&namespace=yyy&name=zzz
     */
    delete: async (params) => {
      return client.delete(`/k8s/${resourceType}`, { params });
    },
  };
}
```

### 步骤 2: 更新 Pod API

修改 `apps/web-k8s/src/api/k8s/index.ts`：

```typescript
import { createQueryParamResourceApi } from './query-param-api-factory';

/**
 * Pod API - 使用新的查询参数风格
 */
const podApiBase = createQueryParamResourceApi<Pod>(requestClient, {
  resourceType: 'pod',
  resourceTypePlural: 'pods',
  namespaced: true,
});

export const podApi = {
  ...podApiBase,

  /**
   * 获取 Pod 日志
   * GET /api/k8s/pod/logs?clusterId=xxx&namespace=yyy&name=zzz&container=aaa
   */
  logs: async (params: {
    clusterId: string;
    namespace: string;
    name: string;
    container?: string;
    timestamps?: boolean;
    tailLines?: number;
  }): Promise<string> => {
    return requestClient.get('/k8s/pod/logs', { params });
  },
};
```

### 步骤 3: 更新 Deployment API

```typescript
/**
 * Deployment API - 使用新的查询参数风格
 */
const deploymentApiBase = createQueryParamResourceApi<Deployment>(
  requestClient,
  {
    resourceType: 'deployment',
    resourceTypePlural: 'deployments',
    namespaced: true,
  },
);

export const deploymentApi = {
  ...deploymentApiBase,

  /**
   * 扩缩容 Deployment
   * PUT /api/k8s/deployment/scale?clusterId=xxx&namespace=yyy&name=zzz
   */
  scale: async (params: {
    clusterId: string;
    namespace: string;
    name: string;
    replicas: number;
  }) => {
    const { replicas, ...queryParams } = params;
    return requestClient.put('/k8s/deployment/scale', { replicas }, { params: queryParams });
  },

  /**
   * 重启 Deployment
   * POST /api/k8s/deployment/restart?clusterId=xxx&namespace=yyy&name=zzz
   */
  restart: async (params: {
    clusterId: string;
    namespace: string;
    name: string;
  }) => {
    return requestClient.post('/k8s/deployment/restart', {}, { params });
  },
};
```

### 步骤 4: 更新 Node API

```typescript
/**
 * Node API - 集群级别资源，无需 namespace
 */
export const nodeApi = {
  /**
   * 获取 Node 列表
   * GET /api/k8s/nodes?clusterId=xxx
   */
  list: async (params: { clusterId: string }) => {
    return requestClient.get('/k8s/nodes', { params });
  },

  /**
   * 获取 Node 详情
   * GET /api/k8s/node?clusterId=xxx&name=yyy
   */
  detail: async (params: { clusterId: string; name: string }) => {
    return requestClient.get('/k8s/node', { params });
  },

  /**
   * 封锁 Node
   * POST /api/k8s/node/cordon?clusterId=xxx&name=yyy
   */
  cordon: async (params: { clusterId: string; name: string }) => {
    return requestClient.post('/k8s/node/cordon', {}, { params });
  },

  /**
   * 解除封锁 Node
   * POST /api/k8s/node/uncordon?clusterId=xxx&name=yyy
   */
  uncordon: async (params: { clusterId: string; name: string }) => {
    return requestClient.post('/k8s/node/uncordon', {}, { params });
  },

  /**
   * 驱逐 Node
   * POST /api/k8s/node/drain?clusterId=xxx&name=yyy
   */
  drain: async (params: {
    clusterId: string;
    name: string;
    deleteLocalData?: boolean;
    force?: boolean;
    ignoreDaemonsets?: boolean;
    timeout?: number;
  }) => {
    const { clusterId, name, ...options } = params;
    return requestClient.post(
      '/k8s/node/drain',
      options,
      { params: { clusterId, name } },
    );
  },
};
```

### 步骤 5: 更新集群 API

```typescript
/**
 * 集群 API
 */
export const clusterApi = {
  /**
   * 获取集群列表
   * GET /api/k8s/clusters
   */
  list: async (params?: ClusterListParams) => {
    return requestClient.get('/k8s/clusters', { params });
  },

  /**
   * 获取集群选择器列表
   * GET /api/k8s/clusters/options
   */
  options: async (): Promise<ClusterOption[]> => {
    return requestClient.get('/k8s/clusters/options');
  },

  /**
   * 获取集群详情
   * GET /api/k8s/cluster?clusterId=xxx
   */
  detail: async (clusterId: string): Promise<Cluster> => {
    return requestClient.get('/k8s/cluster', { params: { clusterId } });
  },

  /**
   * 创建集群
   * POST /api/k8s/clusters
   */
  create: async (data: Partial<Cluster>): Promise<Cluster> => {
    return requestClient.post('/k8s/clusters', data);
  },

  /**
   * 更新集群
   * PUT /api/k8s/cluster?clusterId=xxx
   */
  update: async (clusterId: string, data: Partial<Cluster>): Promise<Cluster> => {
    return requestClient.put('/k8s/cluster', data, { params: { clusterId } });
  },

  /**
   * 删除集群
   * DELETE /api/k8s/cluster?clusterId=xxx
   */
  delete: async (clusterId: string): Promise<void> => {
    return requestClient.delete('/k8s/cluster', { params: { clusterId } });
  },

  /**
   * 获取集群健康状态
   * GET /api/k8s/cluster/health?clusterId=xxx
   */
  health: async (clusterId: string) => {
    return requestClient.get('/k8s/cluster/health', { params: { clusterId } });
  },
};
```

---

## 迁移检查清单

### API 层迁移

- [ ] 创建 `query-param-api-factory.ts`
- [ ] 更新 Pod API
- [ ] 更新 Deployment API
- [ ] 更新 StatefulSet API
- [ ] 更新 DaemonSet API
- [ ] 更新 Service API
- [ ] 更新 ConfigMap API
- [ ] 更新 Secret API
- [ ] 更新 Node API
- [ ] 更新 Namespace API
- [ ] 更新 Cluster API
- [ ] 更新 PVC/PV API
- [ ] 更新 HPA API
- [ ] 更新 Event API
- [ ] 更新 RBAC API (Role, RoleBinding, ClusterRole, etc.)
- [ ] 更新 Endpoints/EndpointSlice API
- [ ] 更新 PriorityClass API
- [ ] 更新 StorageClass API

### 业务层适配

- [ ] 检查所有调用 K8s API 的组件
- [ ] 更新参数传递方式（从独立参数改为对象参数）
- [ ] 更新错误处理逻辑
- [ ] 更新加载状态处理

### 测试验证

- [ ] 测试集群列表和选择器
- [ ] 测试 Pod 列表、详情、删除、日志
- [ ] 测试 Deployment 扩缩容和重启
- [ ] 测试 Service 创建、更新、删除
- [ ] 测试 Node 操作（cordon, uncordon, drain）
- [ ] 测试所有 CRUD 操作
- [ ] 端到端测试

---

## 风险和注意事项

### 高风险项

1. **大量代码修改** - 涉及几乎所有 K8s 资源 API
2. **业务逻辑影响** - 可能影响所有使用 K8s API 的页面
3. **回归风险** - 需要全面的回归测试

### 缓解措施

1. **分阶段迁移** - 从一个资源开始，逐步推进
2. **功能开关** - 使用环境变量控制新旧 API 切换
3. **并行开发** - 新旧 API 共存，逐步替换
4. **充分测试** - 每个资源迁移后都要充分测试

---

## 时间估算

| 任务 | 预估时间 |
|------|---------|
| 创建新的 API 工厂 | 2 小时 |
| 迁移核心资源 API (Pod, Deployment, Service) | 4 小时 |
| 迁移其他资源 API | 6 小时 |
| 业务层适配 | 4 小时 |
| 测试验证 | 4 小时 |
| **总计** | **约 20 小时** |

---

## 总结

这是一个**大规模的 API 重构**，需要谨慎进行。建议采用**方案 1（创建新工厂函数）**，可以实现新旧 API 共存，降低风险。

**关键成功因素**：
1. ✅ 详细的测试计划
2. ✅ 分阶段实施
3. ✅ 充分的代码审查
4. ✅ 及时的问题反馈和修复

---

**创建时间**: 2025-10-21
**创建者**: Claude Code (AI Assistant)
**状态**: 📋 规划中，等待实施
