# 自动扩缩容管理 - 设计文档（精简版）

## 数据模型

```typescript
// HorizontalPodAutoscaler (HPA)
export interface MetricSpec {
  type: 'Resource' | 'Pods' | 'Object' | 'External' | 'ContainerResource';
  resource?: {
    name: string; // cpu, memory
    target: {
      type: 'Utilization' | 'AverageValue';
      averageUtilization?: number; // 百分比
      averageValue?: string; // 例如: "100m"
    };
  };
  pods?: {
    metric: {
      name: string;
      selector?: {
        matchLabels?: Record<string, string>;
      };
    };
    target: {
      type: 'AverageValue' | 'Value';
      averageValue?: string;
      value?: string;
    };
  };
  object?: {
    metric: {
      name: string;
      selector?: {
        matchLabels?: Record<string, string>;
      };
    };
    describedObject: {
      apiVersion: string;
      kind: string;
      name: string;
    };
    target: {
      type: 'Value' | 'AverageValue';
      value?: string;
      averageValue?: string;
    };
  };
  external?: {
    metric: {
      name: string;
      selector?: {
        matchLabels?: Record<string, string>;
      };
    };
    target: {
      type: 'Value' | 'AverageValue';
      value?: string;
      averageValue?: string;
    };
  };
}

export interface MetricStatus {
  type: string;
  resource?: {
    name: string;
    current: {
      averageUtilization?: number;
      averageValue?: string;
    };
  };
  pods?: {
    metric: { name: string };
    current: {
      averageValue: string;
    };
  };
  object?: {
    metric: { name: string };
    describedObject: {
      apiVersion: string;
      kind: string;
      name: string;
    };
    current: {
      value: string;
    };
  };
  external?: {
    metric: { name: string };
    current: {
      value?: string;
      averageValue?: string;
    };
  };
}

export interface HPASpec {
  scaleTargetRef: {
    apiVersion: string;
    kind: string; // Deployment, StatefulSet, ReplicaSet
    name: string;
  };
  minReplicas?: number;
  maxReplicas: number;
  metrics?: MetricSpec[];
  behavior?: {
    scaleDown?: {
      stabilizationWindowSeconds?: number;
      policies?: Array<{
        type: 'Pods' | 'Percent';
        value: number;
        periodSeconds: number;
      }>;
      selectPolicy?: 'Max' | 'Min' | 'Disabled';
    };
    scaleUp?: {
      stabilizationWindowSeconds?: number;
      policies?: Array<{
        type: 'Pods' | 'Percent';
        value: number;
        periodSeconds: number;
      }>;
      selectPolicy?: 'Max' | 'Min' | 'Disabled';
    };
  };
}

export interface HPACondition {
  type: 'AbleToScale' | 'ScalingActive' | 'ScalingLimited';
  status: 'True' | 'False' | 'Unknown';
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface HPAStatus {
  observedGeneration?: number;
  lastScaleTime?: string;
  currentReplicas: number;
  desiredReplicas: number;
  currentMetrics?: MetricStatus[];
  conditions?: HPACondition[];
}

export interface HorizontalPodAutoscaler {
  apiVersion: string;
  kind: 'HorizontalPodAutoscaler';
  metadata: K8sMetadata;
  spec: HPASpec;
  status?: HPAStatus;
}

// 辅助类型
export interface ScalingEvent {
  timestamp: string;
  type: 'ScaleUp' | 'ScaleDown';
  oldReplicas: number;
  newReplicas: number;
  reason: string;
  message?: string;
}
```

## 组件架构

```text
自动扩缩容管理
├── HPA 管理页
│   ├── ResourceList
│   └── DetailDrawer
│       ├── 基本信息
│       ├── 扩缩容策略
│       ├── 当前指标（带进度条）
│       ├── 条件信息
│       ├── 扩缩容历史（事件列表）
│       └── YAML 配置
└── HPA 概览页
    ├── 扩缩容统计卡片
    ├── 活跃 HPA 列表
    └── 最近扩缩容事件
```

## 关键组件

### 扩缩容指标表格组件

显示 MetricSpec 列表，包括：
- 指标类型
- 指标名称
- 目标类型
- 目标值
- 当前值（带进度条和颜色）

### 扩缩容历史组件

显示扩缩容事件，使用时间线形式：
```text
2024-01-15 10:30:00  ↑ 扩容  3 -> 5 副本
  原因: CPU 利用率 85% 超过目标 80%

2024-01-15 09:15:00  ↓ 缩容  5 -> 3 副本
  原因: CPU 利用率 60% 低于目标 80%
```

### HPA 状态卡片组件

显示关键指标：
- 当前副本数 / 期望副本数
- 最小副本数 / 最大副本数
- 上次扩缩容时间
- 扩缩容状态（稳定/扩缩容中/受限）

## 列配置示例

### HPA 列表

| 字段 | 标题 | 宽度 | 说明 |
|------|------|------|------|
| metadata.name | HPA 名称 | 200px | - |
| metadata.namespace | 命名空间 | 150px | - |
| spec.scaleTargetRef | 目标资源 | 200px | 例如: Deployment/my-app |
| status.currentReplicas | 当前副本 | 100px | - |
| status.desiredReplicas | 期望副本 | 100px | - |
| spec.minReplicas | 最小副本 | 100px | - |
| spec.maxReplicas | 最大副本 | 100px | - |
| spec.metrics | 目标指标 | 200px | 例如: CPU 80% |
| - | 状态 | 100px | 稳定/扩缩容中 |
| metadata.creationTimestamp | 创建时间 | 180px | - |

## Mock 数据要点

- 生成不同状态的 HPA（稳定、扩容中、缩容中、受限）
- 生成不同指标类型的 HPA（CPU、内存、自定义指标）
- 生成 currentMetrics 数据，确保与 spec.metrics 对应
- 生成扩缩容事件历史数据
- 模拟达到副本数上下限的场景

## 指标比较逻辑

```typescript
function compareMetric(current: MetricStatus, target: MetricSpec): {
  status: 'above' | 'below' | 'equal';
  percentage: number;
} {
  // 根据指标类型进行比较
  if (target.type === 'Resource') {
    const currentUtil = current.resource?.current.averageUtilization || 0;
    const targetUtil = target.resource?.target.averageUtilization || 0;
    return {
      status: currentUtil > targetUtil ? 'above' : currentUtil < targetUtil ? 'below' : 'equal',
      percentage: (currentUtil / targetUtil) * 100,
    };
  }
  // 其他指标类型的比较逻辑...
}
```

## 路由配置

```typescript
{
  path: 'autoscaling',
  name: 'K8sAutoscaling',
  meta: { title: '自动扩缩容', icon: 'lucide:scaling' },
  children: [
    {
      path: 'overview',
      component: () => import('#/views/k8s/autoscaling/overview/index.vue'),
      meta: { title: '扩缩容概览' },
    },
    {
      path: 'hpa',
      component: () => import('#/views/k8s/autoscaling/hpa/index.vue'),
      meta: { title: 'HorizontalPodAutoscaler' },
    },
  ],
}
```

## 测试策略

### 单元测试

- 指标比较函数测试
- 扩缩容状态判断函数测试
- 资源单位转换函数测试

### 组件测试

- 扩缩容指标表格渲染测试
- 扩缩容历史时间线显示测试
- HPA 状态卡片计算测试

### 集成测试

- HPA 到目标资源的跳转测试
- 指标数据刷新测试
