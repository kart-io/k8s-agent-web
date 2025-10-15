# 资源配额管理 - 设计文档（精简版）

## 数据模型

```typescript
// ResourceQuota
export interface ResourceQuotaSpec {
  hard: Record<string, string>; // 例如: { 'requests.cpu': '10', 'requests.memory': '20Gi', 'pods': '50' }
  scopeSelector?: {
    matchExpressions?: Array<{
      scopeName: string;
      operator: string;
      values?: string[];
    }>;
  };
  scopes?: string[]; // Terminating, NotTerminating, BestEffort, NotBestEffort
}

export interface ResourceQuotaStatus {
  hard: Record<string, string>;
  used: Record<string, string>;
}

export interface ResourceQuota {
  apiVersion: string;
  kind: 'ResourceQuota';
  metadata: K8sMetadata;
  spec: ResourceQuotaSpec;
  status?: ResourceQuotaStatus;
}

// LimitRange
export interface LimitRangeItem {
  type: 'Container' | 'Pod' | 'PersistentVolumeClaim';
  max?: Record<string, string>; // 最大值
  min?: Record<string, string>; // 最小值
  default?: Record<string, string>; // 默认限制
  defaultRequest?: Record<string, string>; // 默认请求
  maxLimitRequestRatio?: Record<string, string>; // 最大限制/请求比率
}

export interface LimitRangeSpec {
  limits: LimitRangeItem[];
}

export interface LimitRange {
  apiVersion: string;
  kind: 'LimitRange';
  metadata: K8sMetadata;
  spec: LimitRangeSpec;
}

// 辅助类型
export interface ResourceQuotaUsage {
  resourceName: string;
  resourceType: 'cpu' | 'memory' | 'storage' | 'count';
  hard: string;
  used: string;
  usagePercentage: number;
  unit: string;
}
```

## 组件架构

```text
资源配额管理
├── ResourceQuota 管理页
│   ├── ResourceList
│   └── DetailDrawer
│       ├── 基本信息
│       ├── 配额规格表格
│       ├── 使用统计（带进度条）
│       ├── 使用率图表
│       └── YAML 配置
├── LimitRange 管理页
│   ├── ResourceList
│   └── DetailDrawer
│       ├── 基本信息
│       ├── Container 限制表格
│       ├── Pod 限制表格
│       ├── PVC 限制表格
│       └── YAML 配置
└── 配额概览页
    ├── 告警列表
    ├── 使用率统计卡片
    └── 按命名空间统计
```

## 关键组件

### 配额使用统计组件

显示资源使用情况，包括：
- 资源名称
- 硬限制
- 已使用量
- 使用率进度条（带颜色分级）

### 限制范围表格组件

显示 LimitRangeItem 列表，包括：
- 限制类型（Container/Pod/PVC）
- 资源类型（CPU/内存/存储）
- 最小值、最大值、默认值、默认请求

### 配额告警卡片组件

显示超过阈值的配额：
- 命名空间
- 资源类型
- 使用率
- 剩余配额
- 告警级别

## 列配置示例

### ResourceQuota 列表

| 字段 | 标题 | 宽度 | 说明 |
|------|------|------|------|
| metadata.name | 名称 | 200px | - |
| metadata.namespace | 命名空间 | 150px | - |
| spec.hard | 配额类型 | 200px | 显示配额的资源类型 |
| status.used | 使用率 | 250px | 显示主要资源的使用率进度条 |
| - | 告警 | 80px | 警告/错误图标 |
| metadata.creationTimestamp | 创建时间 | 180px | - |

### LimitRange 列表

| 字段 | 标题 | 宽度 | 说明 |
|------|------|------|------|
| metadata.name | 名称 | 200px | - |
| metadata.namespace | 命名空间 | 150px | - |
| spec.limits | 限制类型 | 200px | Container/Pod/PVC |
| spec.limits | 资源类型 | 200px | CPU/内存/存储 |
| metadata.creationTimestamp | 创建时间 | 180px | - |

## Mock 数据要点

- 生成不同使用率的 ResourceQuota（<80%, 80-90%, >90%）
- 生成不同类型的配额（CPU、内存、存储、Pod 数量）
- 为 LimitRange 生成不同类型的限制（Container、Pod、PVC）
- 确保 status.used 和 spec.hard 的数值合理
- 模拟超配场景用于测试告警功能

## 使用率计算

```typescript
function calculateUsagePercentage(used: string, hard: string): number {
  // 处理不同单位的资源（Gi, Mi, m 等）
  const usedValue = parseResourceValue(used);
  const hardValue = parseResourceValue(hard);
  return (usedValue / hardValue) * 100;
}

function getUsageColor(percentage: number): string {
  if (percentage < 80) return 'success';
  if (percentage < 90) return 'warning';
  return 'error';
}
```

## 路由配置

```typescript
{
  path: 'quota',
  name: 'K8sQuota',
  meta: { title: '资源配额', icon: 'lucide:gauge' },
  children: [
    {
      path: 'overview',
      component: () => import('#/views/k8s/quota/overview/index.vue'),
      meta: { title: '配额概览' },
    },
    {
      path: 'resource-quotas',
      component: () => import('#/views/k8s/quota/resource-quotas/index.vue'),
      meta: { title: 'ResourceQuota' },
    },
    {
      path: 'limit-ranges',
      component: () => import('#/views/k8s/quota/limit-ranges/index.vue'),
      meta: { title: 'LimitRange' },
    },
  ],
}
```
