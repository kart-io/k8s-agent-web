# 存储管理 - 设计文档

## 概述

本设计文档详细说明了 K8s 存储管理功能的技术实现方案，包括 PersistentVolume (PV)、PersistentVolumeClaim (PVC)、StorageClass 的数据模型、组件架构、API 设计和 UI 实现。

## 架构

### 目录结构

```text
src/
├── api/k8s/
│   ├── types.ts                    # 添加存储相关类型定义
│   └── mock.ts                     # 添加存储资源 Mock 数据
├── config/
│   └── k8s-resources.ts            # 添加存储资源配置工厂函数
├── views/k8s/storage/
│   ├── persistent-volumes/
│   │   ├── index.vue               # PV 列表页
│   │   └── DetailDrawer.vue        # PV 详情抽屉
│   ├── persistent-volume-claims/
│   │   ├── index.vue               # PVC 列表页
│   │   └── DetailDrawer.vue        # PVC 详情抽屉
│   ├── storage-classes/
│   │   ├── index.vue               # StorageClass 列表页
│   │   └── DetailDrawer.vue        # StorageClass 详情抽屉
│   └── overview/
│       ├── index.vue               # 存储概览页
│       └── components/
│           ├── CapacityStats.vue   # 容量统计组件
│           ├── StorageChart.vue    # 存储图表组件
│           └── BindingGraph.vue    # 绑定关系图组件
└── router/routes/modules/
    └── k8s.ts                      # 添加存储路由配置
```

### 组件架构

```text
存储管理页面
├── 存储概览页 (StorageOverview)
│   ├── 容量统计卡片 (CapacityStats)
│   ├── 按存储类分布图 (StorageChart)
│   └── 按命名空间使用图 (StorageChart)
│
├── PV 管理页 (PersistentVolumes)
│   ├── ResourceList (复用)
│   │   ├── ResourceFilter (复用)
│   │   └── VxeGrid (复用)
│   └── DetailDrawer
│       ├── 基本信息标签页
│       ├── 规格配置标签页
│       ├── 绑定关系标签页
│       └── YAML 配置标签页
│
├── PVC 管理页 (PersistentVolumeClaims)
│   ├── ResourceList (复用)
│   └── DetailDrawer
│       ├── 基本信息标签页
│       ├── 规格配置标签页
│       ├── 使用情况标签页 (显示使用的 Pod)
│       ├── 绑定的 PV 标签页
│       └── YAML 配置标签页
│
└── StorageClass 管理页 (StorageClasses)
    ├── ResourceList (复用)
    └── DetailDrawer
        ├── 基本信息标签页
        ├── 参数配置标签页
        ├── 使用统计标签页
        └── YAML 配置标签页
```

## 数据模型

### TypeScript 接口定义

```typescript
// ==================== PersistentVolume ====================

export interface PersistentVolumeSpec {
  capacity: {
    storage: string; // 例如: "10Gi"
  };
  storageClassName?: string;
  accessModes: ('ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany' | 'ReadWriteOncePod')[];
  persistentVolumeReclaimPolicy?: 'Retain' | 'Recycle' | 'Delete';
  volumeMode?: 'Filesystem' | 'Block';
  mountOptions?: string[];
  nodeAffinity?: {
    required?: {
      nodeSelectorTerms: Array<{
        matchExpressions?: Array<{
          key: string;
          operator: string;
          values?: string[];
        }>;
      }>;
    };
  };
  // 存储后端类型（只会有一个）
  hostPath?: {
    path: string;
    type?: string;
  };
  nfs?: {
    server: string;
    path: string;
    readOnly?: boolean;
  };
  csi?: {
    driver: string;
    volumeHandle: string;
    readOnly?: boolean;
    fsType?: string;
    volumeAttributes?: Record<string, string>;
  };
  local?: {
    path: string;
    fsType?: string;
  };
  // 其他存储后端类型可根据需要添加
}

export interface PersistentVolumeStatus {
  phase: 'Available' | 'Bound' | 'Released' | 'Failed';
  message?: string;
  reason?: string;
  lastPhaseTransitionTime?: string;
}

export interface PersistentVolume {
  apiVersion: string;
  kind: 'PersistentVolume';
  metadata: K8sMetadata;
  spec: PersistentVolumeSpec;
  status?: PersistentVolumeStatus;
}

export interface PersistentVolumeListParams {
  clusterId: string;
  storageClassName?: string;
  phase?: string;
  page?: number;
  pageSize?: number;
}

export interface PersistentVolumeListResult {
  apiVersion: string;
  kind: 'PersistentVolumeList';
  metadata: K8sListMetadata;
  items: PersistentVolume[];
  total: number;
}

// ==================== PersistentVolumeClaim ====================

export interface PersistentVolumeClaimSpec {
  accessModes: ('ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany' | 'ReadWriteOncePod')[];
  storageClassName?: string;
  volumeMode?: 'Filesystem' | 'Block';
  volumeName?: string; // 绑定的 PV 名称
  resources: {
    requests: {
      storage: string; // 例如: "5Gi"
    };
    limits?: {
      storage: string;
    };
  };
  selector?: {
    matchLabels?: Record<string, string>;
    matchExpressions?: Array<{
      key: string;
      operator: string;
      values?: string[];
    }>;
  };
  dataSource?: {
    kind: string;
    name: string;
    apiGroup?: string;
  };
}

export interface PersistentVolumeClaimStatus {
  phase: 'Pending' | 'Bound' | 'Lost';
  accessModes?: string[];
  capacity?: {
    storage: string;
  };
  conditions?: Array<{
    type: string;
    status: string;
    lastProbeTime?: string;
    lastTransitionTime?: string;
    reason?: string;
    message?: string;
  }>;
  allocatedResources?: {
    storage: string;
  };
  resizeStatus?: string;
}

export interface PersistentVolumeClaim {
  apiVersion: string;
  kind: 'PersistentVolumeClaim';
  metadata: K8sMetadata;
  spec: PersistentVolumeClaimSpec;
  status?: PersistentVolumeClaimStatus;
}

export interface PersistentVolumeClaimListParams {
  clusterId: string;
  namespace?: string;
  storageClassName?: string;
  phase?: string;
  page?: number;
  pageSize?: number;
}

export interface PersistentVolumeClaimListResult {
  apiVersion: string;
  kind: 'PersistentVolumeClaimList';
  metadata: K8sListMetadata;
  items: PersistentVolumeClaim[];
  total: number;
}

// ==================== StorageClass ====================

export interface StorageClass {
  apiVersion: string;
  kind: 'StorageClass';
  metadata: K8sMetadata;
  provisioner: string;
  parameters?: Record<string, string>;
  reclaimPolicy?: 'Delete' | 'Retain';
  volumeBindingMode?: 'Immediate' | 'WaitForFirstConsumer';
  allowVolumeExpansion?: boolean;
  mountOptions?: string[];
  allowedTopologies?: Array<{
    matchLabelExpressions?: Array<{
      key: string;
      values: string[];
    }>;
  }>;
}

export interface StorageClassListParams {
  clusterId: string;
  provisioner?: string;
  page?: number;
  pageSize?: number;
}

export interface StorageClassListResult {
  apiVersion: string;
  kind: 'StorageClassList';
  metadata: K8sListMetadata;
  items: StorageClass[];
  total: number;
}

// ==================== 存储统计 ====================

export interface StorageStats {
  totalCapacity: string; // 总容量，例如: "100Gi"
  usedCapacity: string;  // 已使用容量
  availableCapacity: string; // 可用容量
  usagePercentage: number; // 使用率百分比
  pvCount: number; // PV 总数
  pvcCount: number; // PVC 总数
  boundPVCount: number; // 已绑定 PV 数量
  availablePVCount: number; // 可用 PV 数量
}

export interface StorageStatsByClass {
  storageClassName: string;
  pvCount: number;
  pvcCount: number;
  totalCapacity: string;
  usedCapacity: string;
}

export interface StorageStatsByNamespace {
  namespace: string;
  pvcCount: number;
  totalCapacity: string;
  usedCapacity: string;
}

// ==================== PV/PVC 关系 ====================

export interface PVPVCBinding {
  pvName: string;
  pvcName: string;
  pvcNamespace: string;
  capacity: string;
  storageClass: string;
  accessModes: string[];
  boundAt?: string;
  podsUsingPVC?: Array<{
    name: string;
    namespace: string;
  }>;
}
```

## 组件设计

### 1. PersistentVolume 列表页

**文件:** `src/views/k8s/storage/persistent-volumes/index.vue`

**功能:**

- 显示 PV 列表，支持筛选和搜索
- 显示 PV 状态（Available、Bound、Released、Failed）
- 支持查看详情、删除操作

**列配置:**

| 字段 | 标题 | 宽度 | 说明 |
|------|------|------|------|
| metadata.name | PV 名称 | 200px | 左对齐 |
| spec.capacity.storage | 容量 | 120px | 例如: 10Gi |
| spec.storageClassName | 存储类 | 150px | - |
| spec.accessModes | 访问模式 | 180px | 自定义插槽显示标签 |
| spec.persistentVolumeReclaimPolicy | 回收策略 | 120px | Retain/Delete/Recycle |
| status.phase | 状态 | 120px | 状态标签 |
| spec.claimRef | 绑定的 PVC | 250px | namespace/pvc-name 格式 |
| metadata.creationTimestamp | 创建时间 | 180px | 格式化显示 |

**筛选器:**

- 集群选择器
- 存储类选择器
- 状态选择器（Available, Bound, Released, Failed）
- 访问模式选择器
- 名称搜索

### 2. PersistentVolumeClaim 列表页

**文件:** `src/views/k8s/storage/persistent-volume-claims/index.vue`

**列配置:**

| 字段 | 标题 | 宽度 | 说明 |
|------|------|------|------|
| metadata.name | PVC 名称 | 200px | - |
| metadata.namespace | 命名空间 | 150px | - |
| status.phase | 状态 | 120px | Pending/Bound/Lost |
| spec.resources.requests.storage | 请求容量 | 120px | - |
| status.capacity.storage | 实际容量 | 120px | - |
| spec.storageClassName | 存储类 | 150px | - |
| spec.accessModes | 访问模式 | 180px | - |
| spec.volumeName | 绑定的 PV | 180px | - |
| metadata.creationTimestamp | 创建时间 | 180px | - |

**筛选器:**

- 集群选择器
- 命名空间选择器
- 存储类选择器
- 状态选择器（Pending, Bound, Lost）
- 名称搜索

### 3. StorageClass 列表页

**文件:** `src/views/k8s/storage/storage-classes/index.vue`

**列配置:**

| 字段 | 标题 | 宽度 | 说明 |
|------|------|------|------|
| metadata.name | 名称 | 200px | 显示"默认"标识 |
| provisioner | 提供者 | 250px | 例如: kubernetes.io/aws-ebs |
| reclaimPolicy | 回收策略 | 120px | Delete/Retain |
| volumeBindingMode | 绑定模式 | 180px | Immediate/WaitForFirstConsumer |
| allowVolumeExpansion | 允许扩容 | 120px | 是/否 |
| parameters | 参数数量 | 100px | 显示键数量 |
| metadata.creationTimestamp | 创建时间 | 180px | - |

**筛选器:**

- 集群选择器
- 提供者筛选器
- 回收策略筛选器
- 名称搜索

### 4. 详情抽屉组件

**PV 详情抽屉标签页:**

1. **基本信息:** 名称、UID、容量、存储类、访问模式、回收策略、卷模式、状态、创建时间
2. **规格配置:** 存储后端类型（hostPath/NFS/CSI 等）、节点亲和性、挂载选项
3. **绑定关系:** 绑定的 PVC 信息、使用该 PVC 的 Pod 列表
4. **YAML 配置:** 完整的 YAML 配置，支持复制和下载

**PVC 详情抽屉标签页:**

1. **基本信息:** 名称、命名空间、UID、状态、请求容量、实际容量、存储类、访问模式、创建时间
2. **规格配置:** 卷模式、选择器、数据源
3. **使用情况:** 使用该 PVC 的 Pod 列表（从 Pod 的 volumes 中查找）
4. **绑定的 PV:** 绑定的 PV 详细信息
5. **条件:** PVC 状态条件列表
6. **YAML 配置:** 完整的 YAML 配置

**StorageClass 详情抽屉标签页:**

1. **基本信息:** 名称、UID、提供者、回收策略、绑定模式、是否允许扩容、是否为默认、创建时间
2. **参数配置:** 参数键值对列表
3. **挂载选项:** 挂载选项列表
4. **拓扑限制:** 允许的拓扑配置
5. **使用统计:** 使用该存储类的 PV 数量、PVC 数量、总容量统计
6. **资源列表:** 使用该存储类的 PV 和 PVC 列表
7. **YAML 配置:** 完整的 YAML 配置

### 5. 存储概览页

**文件:** `src/views/k8s/storage/overview/index.vue`

**布局:**

```text
+------------------------------------------+
|  存储概览                                 |
+------------------------------------------+
|  [总容量卡片] [已用容量卡片] [可用容量卡片] [使用率卡片] |
+------------------------------------------+
|  PV 统计卡片  |  PVC 统计卡片             |
+------------------------------------------+
|  按存储类分布图                           |
+------------------------------------------+
|  按命名空间使用图                         |
+------------------------------------------+
|  最近绑定列表                             |
+------------------------------------------+
```

**统计卡片内容:**

- 总容量卡片: 显示集群总存储容量，PV 总数
- 已用容量卡片: 显示已使用容量，已绑定 PV 数
- 可用容量卡片: 显示可用容量，可用 PV 数
- 使用率卡片: 显示使用率百分比，带进度条和告警状态

**图表:**

- 按存储类分布图: 饼图显示各存储类的容量占比
- 按命名空间使用图: 柱状图显示各命名空间的存储使用情况

## API 设计

### Mock 数据生成

**文件:** `src/api/k8s/mock.ts`

```typescript
/**
 * 生成 Mock PV 数据
 */
export function getMockPVList(params: PersistentVolumeListParams): PersistentVolumeListResult {
  const storageClasses = ['standard', 'fast-ssd', 'slow-hdd'];
  const phases: Array<'Available' | 'Bound' | 'Released' | 'Failed'> = ['Available', 'Bound', 'Released', 'Failed'];
  const accessModes: Array<'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany'> = ['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany'];
  const provisioners = ['kubernetes.io/aws-ebs', 'kubernetes.io/gce-pd', 'nfs'];

  const items: PersistentVolume[] = Array.from({ length: 50 }, (_, i) => {
    const phase = phases[i % phases.length];
    const isBound = phase === 'Bound';

    return {
      apiVersion: 'v1',
      kind: 'PersistentVolume',
      metadata: {
        name: `pv-${i + 1}`,
        uid: `pv-uid-${i + 1}`,
        creationTimestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        labels: {
          type: provisioners[i % provisioners.length].split('/')[1],
        },
        ...(isBound && {
          annotations: {
            'pv.kubernetes.io/bound-by-controller': 'yes',
          },
        }),
      },
      spec: {
        capacity: {
          storage: `${(i % 5 + 1) * 10}Gi`,
        },
        storageClassName: storageClasses[i % storageClasses.length],
        accessModes: [accessModes[i % accessModes.length]],
        persistentVolumeReclaimPolicy: i % 2 === 0 ? 'Delete' : 'Retain',
        volumeMode: 'Filesystem',
        ...(i % 3 === 0 && {
          nfs: {
            server: '192.168.1.100',
            path: `/data/pv-${i + 1}`,
          },
        }),
        ...(i % 3 === 1 && {
          hostPath: {
            path: `/mnt/data/pv-${i + 1}`,
            type: 'DirectoryOrCreate',
          },
        }),
        ...(i % 3 === 2 && {
          csi: {
            driver: 'ebs.csi.aws.com',
            volumeHandle: `vol-${i + 1}`,
            fsType: 'ext4',
          },
        }),
        ...(isBound && {
          claimRef: {
            kind: 'PersistentVolumeClaim',
            namespace: `namespace-${(i % 3) + 1}`,
            name: `pvc-${i + 1}`,
            uid: `pvc-uid-${i + 1}`,
          },
        }),
      },
      status: {
        phase,
        ...(phase === 'Failed' && {
          message: 'Volume creation failed',
          reason: 'ProvisioningFailed',
        }),
      },
    };
  });

  // 应用筛选
  let filteredItems = items;
  if (params.storageClassName) {
    filteredItems = filteredItems.filter(item => item.spec.storageClassName === params.storageClassName);
  }
  if (params.phase) {
    filteredItems = filteredItems.filter(item => item.status?.phase === params.phase);
  }

  // 分页
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'PersistentVolumeList',
    metadata: {},
    items: filteredItems.slice(start, end),
    total: filteredItems.length,
  };
}

/**
 * 生成 Mock PVC 数据
 */
export function getMockPVCList(params: PersistentVolumeClaimListParams): PersistentVolumeClaimListResult {
  // 类似实现...
}

/**
 * 生成 Mock StorageClass 数据
 */
export function getMockStorageClassList(params: StorageClassListParams): StorageClassListResult {
  // 类似实现...
}

/**
 * 生成存储统计数据
 */
export function getMockStorageStats(clusterId: string): StorageStats {
  return {
    totalCapacity: '1000Gi',
    usedCapacity: '650Gi',
    availableCapacity: '350Gi',
    usagePercentage: 65,
    pvCount: 50,
    pvcCount: 35,
    boundPVCount: 35,
    availablePVCount: 15,
  };
}
```

## 路由配置

**文件:** `src/router/routes/modules/k8s.ts`

```typescript
{
  path: 'storage',
  name: 'K8sStorage',
  meta: {
    title: '存储管理',
    icon: 'lucide:hard-drive',
  },
  children: [
    {
      path: 'overview',
      name: 'K8sStorageOverview',
      component: () => import('#/views/k8s/storage/overview/index.vue'),
      meta: {
        title: '存储概览',
        icon: 'lucide:layout-dashboard',
      },
    },
    {
      path: 'persistent-volumes',
      name: 'K8sPersistentVolumes',
      component: () => import('#/views/k8s/storage/persistent-volumes/index.vue'),
      meta: {
        title: 'PersistentVolume',
        icon: 'lucide:database',
      },
    },
    {
      path: 'persistent-volume-claims',
      name: 'K8sPersistentVolumeClaims',
      component: () => import('#/views/k8s/storage/persistent-volume-claims/index.vue'),
      meta: {
        title: 'PersistentVolumeClaim',
        icon: 'lucide:file-box',
      },
    },
    {
      path: 'storage-classes',
      name: 'K8sStorageClasses',
      component: () => import('#/views/k8s/storage/storage-classes/index.vue'),
      meta: {
        title: 'StorageClass',
        icon: 'lucide:layers',
      },
    },
  ],
}
```

## 错误处理

### 常见错误场景

1. **PVC 无法绑定:**
   - 原因: 没有满足条件的 PV
   - 处理: 在 PVC 详情中显示等待绑定的原因，提示用户检查容量、访问模式、存储类等条件

2. **PV 删除失败:**
   - 原因: PV 已绑定到 PVC
   - 处理: 显示错误消息，提示用户先删除 PVC

3. **PVC 删除警告:**
   - 原因: PVC 正在被 Pod 使用
   - 处理: 显示使用该 PVC 的 Pod 列表，警告删除后果

4. **存储容量不足:**
   - 原因: 可用 PV 容量不足
   - 处理: 在概览页显示警告，提示扩容或清理

## 测试策略

### 单元测试

- Mock 数据生成函数测试
- 容量计算函数测试
- 状态映射函数测试

### 组件测试

- 列表组件渲染测试
- 详情抽屉数据显示测试
- 筛选器功能测试
- 统计卡片计算测试

### 集成测试

- PV/PVC 绑定关系展示测试
- 多资源联动测试
- 路由导航测试

### UI 测试场景

1. 测试不同状态的 PV 显示不同颜色的标签
2. 测试 PVC 详情页显示使用的 Pod 列表
3. 测试存储类详情页显示使用统计
4. 测试概览页的容量统计计算正确性
5. 测试高使用率告警显示

## 性能优化

### 数据加载优化

- 使用分页减少单次加载数据量
- 使用虚拟滚动处理大量数据
- 懒加载详情页数据

### 计算优化

- 使用 computed 缓存容量计算结果
- 使用 memo 优化图表渲染
- 防抖搜索输入

### 渲染优化

- 使用 v-show 代替 v-if 处理频繁切换的标签页
- 使用 key 优化列表渲染
- 图表按需加载

## 可访问性

- 使用语义化 HTML 标签
- 为图表提供文本描述
- 键盘导航支持
- 屏幕阅读器友好

## 国际化

- 所有文本使用 i18n
- 容量单位支持多语言（Gi, GB 等）
- 日期时间本地化

## 安全考虑

- 不在 UI 中显示敏感的存储后端凭证
- 删除操作需要二次确认
- 记录关键操作日志（未来）
- 权限控制（未来）
