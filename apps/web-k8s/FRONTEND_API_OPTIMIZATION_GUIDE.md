# 前端 API 调用优化指南

## 概述

本指南说明如何修改 `k8s-agent-web/apps/web-k8s` 的 API 调用，以配合后端的结构体参数优化。

## 当前前端 API 架构

### 当前文件结构

```
apps/web-k8s/src/api/k8s/
├── index.ts                      # API 导出入口（工厂模式）
├── types.ts                      # TypeScript 类型定义
├── resource-api-factory.ts       # 资源 API 工厂函数
├── mock-adapter.ts               # Mock/真实 API 适配器
├── mock-resource-factory.ts      # Mock 资源工厂
└── mock.ts                       # Mock 数据生成
```

### 当前 API 调用模式

前端已经使用了统一的工厂模式和类型定义，API 调用规范如下：

```typescript
// 1. Pod 日志（已有查询参数）
const logs = await podApi.logs({
  clusterId: 'cluster-1',
  namespace: 'default',
  name: 'pod-1',
  container: 'app',
  tailLines: 100,
  follow: false
});

// 2. Deployment 扩缩容（已有请求体参数）
await deploymentApi.scale(clusterId, namespace, name, {
  replicas: 3
});

// 3. 集群创建（已有请求体参数）
await clusterApi.create({
  name: 'cluster-1',
  description: '测试集群',
  endpoint: 'https://api.k8s.example.com',
  kubeconfig: kubeconfigContent,
  region: 'us-west',
  provider: 'aws',
  labels: { env: 'prod' }
});
```

## 优化内容

由于前端已经使用了规范的参数传递方式，大部分 API 调用无需修改。只需要确保以下几点：

### 1. 查询参数规范化

#### GetPodLogs

**当前调用方式**（已正确）：

```typescript
// src/api/k8s/index.ts:65-71
logs: async (params: PodLogsParams): Promise<string> => {
  const { clusterId, namespace, name, ...queryParams } = params;
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}/logs`,
    { params: queryParams }, // 查询参数传递正确
  );
}
```

**类型定义检查**（apps/web-k8s/src/api/k8s/types.ts）：

确保 `PodLogsParams` 包含所有必要字段：

```typescript
export interface PodLogsParams {
  clusterId: string;
  namespace: string;
  name: string;
  container?: string;       // 可选容器名
  tailLines?: number;       // 可选尾行数
  follow?: boolean;         // 可选是否跟踪
  timestamps?: boolean;     // 可选时间戳
  sinceSeconds?: number;    // 可选起始时间
}
```

### 2. 路径参数 + 请求体参数组合

#### Deployment Scale

**当前调用方式**（已正确）：

```typescript
// src/api/k8s/index.ts:190-200
scale: (
  clusterId: string,
  namespace: string,
  name: string,
  params: ScaleParams,
) => {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments/${name}/scale`,
    params, // 请求体参数
  );
}
```

**类型定义检查**：

```typescript
export interface ScaleParams {
  replicas: number;  // 必填副本数
}
```

### 3. Node Drain 参数优化

#### 需要修改的 API

**当前调用方式**（需要对齐后端字段名）：

```typescript
// src/api/k8s/index.ts:473-486
drain: async (
  clusterId: string,
  name: string,
  options?: {
    deleteLocalData?: boolean;      // ❌ 后端使用 force
    force?: boolean;                // ✅ 保留
    ignoreDaemonsets?: boolean;     // ❌ 后端使用 ignoreDaemonSets（大小写）
    timeout?: number;               // ❌ 后端使用 gracePeriod
  },
) => {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/nodes/${name}/drain`,
    options,
  );
}
```

**修改后**（对齐后端 `DrainNodeRequest`）：

```typescript
// src/api/k8s/index.ts
drain: async (
  clusterId: string,
  name: string,
  options?: {
    gracePeriod?: number;           // 优雅终止时间（秒）
    ignoreDaemonSets?: boolean;     // 是否忽略 DaemonSet（注意大小写）
    force?: boolean;                // 是否强制驱逐
  },
) => {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/nodes/${name}/drain`,
    options,
  );
}
```

### 4. Secret 查询参数

#### GetSecret

**当前实现可能缺少参数**：

```typescript
// 检查 src/api/k8s/types.ts 中是否有 includeData 参数定义
export interface GetSecretParams {
  clusterId: string;
  namespace: string;
  name: string;
  includeData?: boolean;  // ✅ 添加此参数支持
}
```

**对应的 API 调用**：

```typescript
// src/api/k8s/index.ts
detail: async (
  clusterId: string,
  namespace: string,
  name: string,
  includeData?: boolean
): Promise<Secret> => {
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/secrets/${name}`,
    { params: { includeData } }
  );
}
```

### 5. Event 类型过滤

#### ListEvents

**确保支持类型过滤参数**：

```typescript
// src/api/k8s/types.ts
export interface ListEventsParams {
  clusterId: string;
  namespace: string;
  type?: string;  // 事件类型过滤（Normal、Warning 等）
}
```

**对应的 API 调用**：

```typescript
// src/api/k8s/index.ts
list: async (params: ListEventsParams) => {
  const { clusterId, namespace, type } = params;
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/events`,
    { params: { type } }
  );
}
```

## 需要修改的类型定义

### 1. 更新 `types.ts`

```typescript
// apps/web-k8s/src/api/k8s/types.ts

// ===== 修改 Node Drain 参数 =====
export interface DrainNodeOptions {
  gracePeriod?: number;         // 优雅终止时间（秒）
  ignoreDaemonSets?: boolean;   // 是否忽略 DaemonSet
  force?: boolean;              // 是否强制驱逐
}

// ===== 添加 Secret 查询参数 =====
export interface GetSecretParams {
  includeData?: boolean;  // 是否包含敏感数据
}

// ===== 添加 Event 过滤参数 =====
export interface ListEventsParams {
  type?: string;  // 事件类型过滤
}

// ===== 确保 PodLogsParams 完整 =====
export interface PodLogsParams {
  clusterId: string;
  namespace: string;
  name: string;
  container?: string;
  tailLines?: number;
  follow?: boolean;
  timestamps?: boolean;
  sinceSeconds?: number;
}
```

### 2. 更新 `index.ts` 中的 Node API

```typescript
// apps/web-k8s/src/api/k8s/index.ts

export const nodeApi = {
  // ... 其他方法

  /**
   * 驱逐 Node (Drain)
   */
  drain: async (
    clusterId: string,
    name: string,
    options?: DrainNodeOptions,
  ): Promise<{ message: string; success: boolean }> => {
    return requestClient.post(
      `/k8s/clusters/${clusterId}/nodes/${name}/drain`,
      options,
    );
  },

  // ... 其他方法
};
```

### 3. 更新 Secret API

```typescript
// apps/web-k8s/src/api/k8s/index.ts

// 方式 1：使用工厂模式（推荐）
const secretApiBase = createMockableResourceApi(
  createResourceApi<Secret>(requestClient, {
    resourceType: 'secret',
    namespaced: true,
  }),
  'secret',
);

export const secretApi = {
  ...secretApiBase,

  // 重写 detail 方法以支持 includeData 参数
  detail: async (
    clusterId: string,
    namespace: string,
    name: string,
    params?: GetSecretParams,
  ): Promise<Secret> => {
    return requestClient.get(
      `/k8s/clusters/${clusterId}/namespaces/${namespace}/secrets/${name}`,
      { params }
    );
  },
};
```

### 4. 更新 Event API

```typescript
// apps/web-k8s/src/api/k8s/index.ts

const eventApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'event',
    namespaced: true,
  }),
  'event',
);

export const eventApi = {
  ...eventApiBase,

  // 重写 list 方法以支持类型过滤
  list: async (params: {
    clusterId: string;
    namespace: string;
    type?: string;
  }) => {
    const { clusterId, namespace, type } = params;
    return requestClient.get(
      `/k8s/clusters/${clusterId}/namespaces/${namespace}/events`,
      { params: { type } }
    );
  },

  // ... 其他方法
};
```

## 测试清单

### 前端 API 调用测试

完成修改后，测试以下 API 调用：

- [ ] **Pod Logs**: 测试带查询参数的日志获取
  ```typescript
  await podApi.logs({
    clusterId: 'test',
    namespace: 'default',
    name: 'test-pod',
    container: 'app',
    tailLines: 100,
    follow: false
  });
  ```

- [ ] **Deployment Scale**: 测试扩缩容
  ```typescript
  await deploymentApi.scale('cluster-1', 'default', 'app', {
    replicas: 5
  });
  ```

- [ ] **Node Drain**: 测试节点驱逐（使用新参数）
  ```typescript
  await nodeApi.drain('cluster-1', 'node-1', {
    gracePeriod: 60,
    ignoreDaemonSets: true,
    force: false
  });
  ```

- [ ] **Secret Get**: 测试获取 Secret（带 includeData 参数）
  ```typescript
  await secretApi.detail('cluster-1', 'default', 'my-secret', {
    includeData: true
  });
  ```

- [ ] **Event List**: 测试事件列表（带类型过滤）
  ```typescript
  await eventApi.list({
    clusterId: 'cluster-1',
    namespace: 'default',
    type: 'Warning'
  });
  ```

- [ ] **Cluster Create**: 测试集群创建
  ```typescript
  await clusterApi.create({
    name: 'new-cluster',
    description: '新集群',
    endpoint: 'https://api.k8s.example.com',
    kubeconfig: kubeconfigContent,
    region: 'us-east',
    provider: 'aws'
  });
  ```

## 修改步骤

### 步骤 1：更新类型定义

```bash
cd apps/web-k8s
# 编辑 src/api/k8s/types.ts
```

### 步骤 2：更新 API 调用

```bash
# 编辑 src/api/k8s/index.ts
# 主要修改：
# - nodeApi.drain 参数
# - secretApi.detail 参数
# - eventApi.list 参数
```

### 步骤 3：运行类型检查

```bash
pnpm check:type
```

### 步骤 4：本地测试

```bash
pnpm dev:k8s
# 访问 http://localhost:5667
# 测试修改过的 API 调用
```

### 步骤 5：运行单元测试

```bash
pnpm test:unit
```

## 注意事项

### 1. 字段命名规范

**前端（TypeScript）**：使用 camelCase
- `tailLines`
- `ignoreDaemonSets`
- `gracePeriod`

**后端（Go）**：
- JSON 标签使用 camelCase：`json:"tailLines"`
- 结构体字段使用 PascalCase：`TailLines`

### 2. 查询参数 vs 请求体参数

**查询参数**：
```typescript
requestClient.get('/api/path', {
  params: { key: 'value' }  // 会转换为 ?key=value
});
```

**请求体参数**：
```typescript
requestClient.post('/api/path', {
  key: 'value'  // 会作为 JSON 请求体发送
});
```

### 3. 可选参数处理

前端可选参数使用 `?`：
```typescript
tailLines?: number;
```

后端也应该是可选的（使用指针或默认值）：
```go
TailLines string `form:"tailLines"` // 不使用 binding:"required"
```

### 4. 类型安全

使用 TypeScript 的类型定义确保编译时发现参数错误：

```typescript
// ✅ 正确：TypeScript 会检查所有必填字段
await clusterApi.create({
  name: 'test',
  endpoint: 'https://api',
  kubeconfig: 'config'
});

// ❌ 错误：缺少 required 字段会在编译时报错
await clusterApi.create({
  name: 'test'
  // 缺少 endpoint 和 kubeconfig
});
```

## 前端修改总结

1. **大部分 API 无需修改**：前端已经使用了规范的参数传递方式
2. **需要修改的 API**：
   - `nodeApi.drain` - 调整参数字段名
   - `secretApi.detail` - 添加 `includeData` 参数支持
   - `eventApi.list` - 添加 `type` 过滤参数支持
3. **修改范围小**：只需更新 `types.ts` 和 `index.ts` 中的几个方法
4. **向后兼容**：新增的参数都是可选的，不会破坏现有调用

## 迁移示例

### Node Drain 迁移

**旧代码**（假设存在）：
```typescript
await nodeApi.drain('cluster-1', 'node-1', {
  deleteLocalData: true,
  timeout: 60
});
```

**新代码**：
```typescript
await nodeApi.drain('cluster-1', 'node-1', {
  gracePeriod: 60,
  ignoreDaemonSets: true,
  force: false
});
```

### Secret Detail 迁移

**旧代码**：
```typescript
const secret = await secretApi.detail('cluster-1', 'default', 'my-secret');
```

**新代码**（支持获取敏感数据）：
```typescript
const secret = await secretApi.detail('cluster-1', 'default', 'my-secret', {
  includeData: true
});
```

## 工具支持

### 1. 使用 TypeScript 的自动提示

在 VSCode 中，TypeScript 会自动提示所有可用参数和类型：

```typescript
podApi.logs({
  clusterId: 'test',
  namespace: 'default',
  name: 'pod',
  // 光标放这里会自动提示 container, tailLines, follow 等参数
});
```

### 2. ESLint 检查

运行 ESLint 确保没有类型错误：

```bash
pnpm lint
```

### 3. 类型检查

运行 TypeScript 类型检查：

```bash
pnpm check:type
```

## 总结

前端 API 调用架构已经非常规范，使用了工厂模式和统一的类型定义。此次优化只需要微调几个 API 方法的参数定义，确保与后端的结构体参数保持一致即可。

关键修改点：
1. Node Drain 参数字段名调整
2. Secret Detail 添加 includeData 参数
3. Event List 添加 type 过滤参数
4. 确保所有查询参数都通过 `params` 对象传递

完成这些修改后，前后端 API 调用将完全统一和规范化。
