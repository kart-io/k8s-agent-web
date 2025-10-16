# K8s Web 应用架构优化方案

## 目录

1. [当前架构分析](#当前架构分析)
2. [发现的问题](#发现的问题)
3. [优化建议](#优化建议)
4. [实施计划](#实施计划)
5. [预期收益](#预期收益)

---

## 当前架构分析

### 1. 整体架构概览

**目录结构统计**：
- 总计 70 个 Vue 组件文件
- 33 个资源管理页面（index.vue）
- 25 个按功能分类的目录
- 7 个共享组件 (`_shared/`)

**架构模式**：
- ✅ 采用配置驱动开发（`k8s-resources.ts` 配置工厂）
- ✅ 组件复用良好（`ResourceList.vue` 通用列表组件）
- ✅ Composables 封装逻辑（`useK8sResource`, `useResourceActions`）
- ✅ 类型安全（完整的 TypeScript 类型定义）

### 2. 当前设计优势

#### 2.1 配置工厂模式
```typescript
// config/k8s-resources.ts
export function createDeploymentConfig(): ResourceListConfig<Deployment> {
  return {
    resourceType: 'deployment',
    resourceLabel: 'Deployment',
    fetchData: async (params) => { ... },
    columns: [...],
    actions: [...],
    formConfig: {...},
    enableCreate: true,
  };
}
```

**优势**：
- 统一的资源配置接口
- 易于维护和扩展
- 减少重复代码

#### 2.2 通用组件设计
```
_shared/
├── ResourceList.vue         # 通用资源列表
├── ResourceEditorModal.vue  # 通用资源编辑器（表单+YAML）
├── ResourceFilter.vue       # 通用筛选器
├── StatusTag.vue           # 通用状态标签
├── YAMLEditorModal.vue     # YAML 编辑器
├── ScaleModal.vue          # 扩缩容模态框
└── DeleteConfirmModal.vue  # 删除确认框
```

**优势**：
- 高度复用，减少冗余
- 统一的 UI/UX 体验
- 易于统一修改和升级

#### 2.3 Composables 逻辑复用
- `useK8sResource`: 处理数据获取、筛选、搜索、分页
- `useResourceActions`: 处理资源操作（删除、编辑等）

---

## 发现的问题

### 🔴 问题 1：目录结构混乱和重复

**现象**：
```
views/k8s/
├── pods/index.vue              # 重复 ❌
├── deployments/index.vue       # 重复 ❌
├── services/index.vue          # 重复 ❌
├── configmaps/index.vue        # 重复 ❌
├── cronjobs/index.vue          # 重复 ❌
├── workloads/
│   ├── pods/index.vue          # 重复 ❌
│   ├── deployments/index.vue   # 重复 ❌
│   └── cronjobs/index.vue      # 重复 ❌
├── network/
│   └── services/index.vue      # 重复 ❌
└── config/
    └── configmaps/index.vue    # 重复 ❌
```

**影响**：
- 维护困难，修改需要多处同步
- 路由配置冗余
- 开发者困惑，不知道使用哪个
- 增加项目体积

### 🔴 问题 2：路由层级不清晰

**当前路由结构**：
```typescript
// router/routes/modules/k8s.ts
/k8s
  /dashboard
  /workloads
    /pods
    /deployments
    /statefulsets
    /daemonsets
    /jobs
    /cronjobs
    /replicasets
  /network
    /services
    /ingress
    /network-policies
    /endpoints
    /endpoint-slices
  /config
    /configmaps
    /secrets
  /storage
    /overview
    /persistent-volumes
    /persistent-volume-claims
    /storage-classes
  /rbac
    /service-accounts
    /roles
    /role-bindings
    /cluster-roles
    /cluster-role-bindings
  /quota
    /resource-quotas
    /limit-ranges
  /autoscaling
    /hpa
  /scheduling
    /priority-classes
  /cluster
    /clusters
    /nodes
    /namespaces
    /events
```

**问题**：
- 层级深度达到 3-4 层，导航繁琐
- 某些分类下只有 1-2 个资源（如 `autoscaling`、`scheduling`）
- 缺少快速访问常用资源的方式

### 🔴 问题 3：页面组件代码重复

**示例**：`workloads/deployments/index.vue` vs `resources/namespaces.vue`

相同的模式重复出现：
```typescript
// 每个页面都重复这些代码
const yamlEditorVisible = ref(false);
const editingResource = ref<T | null>(null);
const resourceListRef = ref();

function openYAMLEditor(resource: T) {
  editingResource.value = resource;
  yamlEditorVisible.value = true;
}

async function handleYAMLEditConfirm(updatedResource: any) {
  try {
    message.success(`${resourceLabel} 更新成功`);
    yamlEditorVisible.value = false;
    resourceListRef.value?.refresh();
  } catch (error: any) {
    message.error(`更新失败: ${error.message}`);
  }
}

const config = computed(() => {
  const baseConfig = createXXXConfig();
  // 覆盖 edit 操作...
  return baseConfig;
});
```

**影响**：
- 40-100 行重复代码 × 33 个页面 ≈ 1320-3300 行冗余代码
- 修改逻辑需要更新所有页面
- 容易出现不一致

### 🔴 问题 4：缺少资源间的关联导航

**现状**：
- 查看 Deployment 时，无法快速跳转到关联的 Pod、ReplicaSet
- 查看 Service 时，无法快速跳转到关联的 Endpoints、Pods
- 查看 PVC 时，无法快速跳转到关联的 PV
- 缺少资源拓扑图和依赖关系可视化

### 🔴 问题 5：Dashboard 功能单薄

**当前 Dashboard**：
- 仅展示基础统计数字（6 个卡片）
- 缺少趋势图表
- 缺少告警和异常资源快速入口
- 缺少集群健康度评分
- 缺少最近操作记录

### 🟡 问题 6：缺少全局搜索

**现状**：
- 每个资源页面独立搜索
- 无法跨资源类型搜索
- 无法通过标签、注解快速定位资源

### 🟡 问题 7：资源详情页面不统一

**现状**：
- Deployment 有独立的 `DetailDrawer.vue`
- DaemonSet、Job 有独立的 `DetailDrawer.vue`
- 其他资源使用简单的 `Modal.info`
- 详情页面功能差异大（有的有 YAML 查看，有的没有）

---

## 优化建议

### 🎯 优化 1：统一目录结构（高优先级）

#### 建议方案

**清理重复目录，采用单一标准结构**：

```
views/k8s/
├── dashboard/              # Dashboard 总览
│   └── index.vue
├── resources/              # 🆕 统一的资源管理入口
│   ├── index.vue          # 资源列表通用模板
│   ├── detail/            # 资源详情通用组件
│   │   ├── DetailDrawer.vue
│   │   ├── DetailTabs.vue
│   │   ├── YAMLTab.vue
│   │   ├── EventsTab.vue
│   │   └── RelatedResourcesTab.vue
│   └── components/        # 资源特定组件
│       ├── ScaleModal.vue
│       ├── NodeLabelEditor.vue
│       └── ...
├── workloads/             # 工作负载分类（仅保留需要特殊 UI 的）
│   ├── pods/
│   │   ├── index.vue
│   │   ├── PodDetailDrawer.vue
│   │   └── PodLogsViewer.vue
│   └── deployments/
│       └── index.vue
├── network/               # 网络分类
│   ├── services/
│   └── ingress/
├── storage/               # 存储分类
│   └── overview/
├── cluster/               # 集群管理
│   ├── overview/
│   ├── nodes/
│   └── events/
└── _shared/               # 保持共享组件
    ├── ResourceList.vue
    ├── ResourceEditorModal.vue
    └── ...
```

**删除重复目录**：
```bash
# 删除顶层重复目录
rm -rf views/k8s/pods
rm -rf views/k8s/deployments
rm -rf views/k8s/services
rm -rf views/k8s/configmaps
rm -rf views/k8s/cronjobs
```

#### 路由优化

**新路由结构**（减少层级，提升可访问性）：

```typescript
/k8s
  /dashboard                          # 总览
  /search                             # 🆕 全局搜索

  # 工作负载 - 扁平化
  /pods
  /deployments
  /statefulsets
  /daemonsets
  /jobs
  /cronjobs
  /replicasets

  # 网络 - 扁平化
  /services
  /ingress
  /endpoints
  /network-policies

  # 配置 - 扁平化
  /configmaps
  /secrets

  # 存储
  /storage-overview                   # 存储总览
  /persistent-volumes
  /persistent-volume-claims
  /storage-classes

  # 集群
  /clusters
  /nodes
  /namespaces
  /events

  # 其他
  /hpa
  /resource-quotas
  /limit-ranges
  /service-accounts
  /roles
  /priority-classes
```

**好处**：
- 层级从 4 层降至 2 层
- URL 更简短：`/k8s/deployments` 而非 `/k8s/workloads/deployments`
- 符合用户心智模型（直接访问资源，而非先选分类）

### 🎯 优化 2：创建通用资源页面模板（高优先级）

#### 方案：单一通用组件替代 33 个重复页面

**创建 `views/k8s/resources/GenericResourcePage.vue`**：

```vue
<script lang="ts" setup>
/**
 * 通用资源管理页面
 * 通过传入配置工厂函数，自动渲染任何 K8s 资源的完整管理页面
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';
import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';
import YAMLEditorModal from '#/views/k8s/_shared/YAMLEditorModal.vue';
import ScaleModal from '#/views/k8s/_shared/ScaleModal.vue';
import GenericDetailDrawer from './detail/GenericDetailDrawer.vue';

interface Props {
  /** 资源配置工厂函数 */
  configFactory: () => ResourceListConfig<any>;
  /** 是否支持扩缩容 */
  scalable?: boolean;
  /** 自定义详情组件 */
  detailComponent?: any;
}

const props = withDefaults(defineProps<Props>(), {
  scalable: false,
});

// 状态管理
const resourceListRef = ref();
const yamlEditorVisible = ref(false);
const detailDrawerVisible = ref(false);
const scaleModalVisible = ref(false);
const currentResource = ref<any>(null);

// 配置
const config = computed(() => {
  const baseConfig = props.configFactory();

  // 自动覆盖操作处理器
  if (baseConfig.actions) {
    baseConfig.actions = baseConfig.actions.map(action => {
      switch (action.action) {
        case 'view':
          return { ...action, handler: openDetail };
        case 'edit':
          return { ...action, handler: openYAMLEditor };
        case 'scale':
          return { ...action, handler: openScaleModal };
        default:
          return action;
      }
    });
  }

  return baseConfig;
});

// 操作处理
function openDetail(resource: any) {
  currentResource.value = resource;
  detailDrawerVisible.value = true;
}

function openYAMLEditor(resource: any) {
  currentResource.value = resource;
  yamlEditorVisible.value = true;
}

function openScaleModal(resource: any) {
  currentResource.value = resource;
  scaleModalVisible.value = true;
}

async function handleYAMLUpdate(updated: any) {
  try {
    // TODO: API 调用
    message.success(`${config.value.resourceLabel} 更新成功`);
    yamlEditorVisible.value = false;
    resourceListRef.value?.reload();
  } catch (error: any) {
    message.error(`更新失败: ${error.message}`);
  }
}

async function handleScale(replicas: number) {
  try {
    // TODO: API 调用
    message.success(`副本数已更新为 ${replicas}`);
    scaleModalVisible.value = false;
    resourceListRef.value?.reload();
  } catch (error: any) {
    message.error(`扩缩容失败: ${error.message}`);
  }
}
</script>

<template>
  <div>
    <ResourceList ref="resourceListRef" :config="config">
      <!-- 透传所有插槽 -->
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <component
      :is="detailComponent || GenericDetailDrawer"
      v-model:visible="detailDrawerVisible"
      :resource="currentResource"
      :resource-type="config.resourceType"
      :resource-label="config.resourceLabel"
    />

    <!-- YAML 编辑器 -->
    <YAMLEditorModal
      v-if="currentResource"
      v-model:visible="yamlEditorVisible"
      :resource="currentResource"
      :resource-type="config.resourceType"
      @confirm="handleYAMLUpdate"
    />

    <!-- 扩缩容模态框 -->
    <ScaleModal
      v-if="scalable && currentResource"
      v-model:visible="scaleModalVisible"
      :resource-name="currentResource.metadata.name"
      :resource-type="config.resourceType"
      :current-replicas="currentResource.spec?.replicas"
      @confirm="handleScale"
    />
  </div>
</template>
```

#### 使用示例

**简化后的 Deployment 页面**（从 267 行 → 20 行）：

```vue
<script lang="ts" setup>
import { createDeploymentConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';
import { Tag } from 'ant-design-vue';

defineOptions({ name: 'DeploymentsManagement' });
</script>

<template>
  <GenericResourcePage
    :config-factory="createDeploymentConfig"
    scalable
  >
    <!-- 自定义插槽：就绪副本状态 -->
    <template #ready-slot="{ row }">
      <Tag :color="row.status?.readyReplicas === row.spec.replicas ? 'success' : 'warning'">
        {{ row.status?.readyReplicas ?? 0 }}/{{ row.spec.replicas }}
      </Tag>
    </template>
  </GenericResourcePage>
</template>
```

**好处**：
- 代码量减少 90%+
- 统一的逻辑和体验
- 新增资源只需 10-20 行代码
- 修改一处，所有页面受益

### 🎯 优化 3：创建通用资源详情组件（中优先级）

#### 方案：标准化资源详情展示

**创建 `views/k8s/resources/detail/GenericDetailDrawer.vue`**：

```vue
<script lang="ts" setup>
/**
 * 通用资源详情抽屉
 * 使用 Tab 展示不同维度的资源信息
 */
import { Drawer, Tabs, TabPane, Descriptions, Tag } from 'ant-design-vue';
import YAMLTab from './YAMLTab.vue';
import EventsTab from './EventsTab.vue';
import RelatedResourcesTab from './RelatedResourcesTab.vue';
import MetadataTab from './MetadataTab.vue';

interface Props {
  visible: boolean;
  resource: any;
  resourceType: string;
  resourceLabel: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();
</script>

<template>
  <Drawer
    :open="visible"
    :title="`${resourceLabel} 详情: ${resource?.metadata?.name}`"
    width="800"
    @close="emit('update:visible', false)"
  >
    <Tabs>
      <TabPane key="overview" tab="概览">
        <Descriptions bordered :column="2">
          <Descriptions.Item label="名称">
            {{ resource?.metadata?.name }}
          </Descriptions.Item>
          <Descriptions.Item label="命名空间">
            {{ resource?.metadata?.namespace || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {{ resource?.metadata?.creationTimestamp }}
          </Descriptions.Item>
          <Descriptions.Item label="UID">
            {{ resource?.metadata?.uid }}
          </Descriptions.Item>
        </Descriptions>

        <!-- 自定义概览内容插槽 -->
        <slot name="overview-extra" :resource="resource"></slot>
      </TabPane>

      <TabPane key="metadata" tab="元数据">
        <MetadataTab :resource="resource" />
      </TabPane>

      <TabPane key="yaml" tab="YAML">
        <YAMLTab :resource="resource" />
      </TabPane>

      <TabPane key="events" tab="事件">
        <EventsTab
          :resource-name="resource?.metadata?.name"
          :namespace="resource?.metadata?.namespace"
        />
      </TabPane>

      <TabPane key="related" tab="关联资源">
        <RelatedResourcesTab
          :resource="resource"
          :resource-type="resourceType"
        />
      </TabPane>
    </Tabs>
  </Drawer>
</template>
```

**RelatedResourcesTab.vue** - 显示资源依赖关系：

```vue
<script lang="ts" setup>
/**
 * 关联资源 Tab
 * 根据资源类型智能展示相关资源
 */
import { computed } from 'vue';
import { List, Button } from 'ant-design-vue';
import { useRouter } from 'vue-router';

interface Props {
  resource: any;
  resourceType: string;
}

const props = defineProps<Props>();
const router = useRouter();

// 根据资源类型计算关联资源
const relatedResources = computed(() => {
  const relations: Array<{
    type: string;
    label: string;
    count: number;
    route: string;
  }> = [];

  switch (props.resourceType) {
    case 'deployment':
      relations.push(
        { type: 'replicaset', label: 'ReplicaSets', count: 0, route: '/k8s/replicasets' },
        { type: 'pod', label: 'Pods', count: props.resource.status?.replicas || 0, route: '/k8s/pods' },
        { type: 'hpa', label: 'HPA', count: 0, route: '/k8s/hpa' }
      );
      break;
    case 'service':
      relations.push(
        { type: 'endpoints', label: 'Endpoints', count: 1, route: '/k8s/endpoints' },
        { type: 'pod', label: 'Pods', count: 0, route: '/k8s/pods' },
        { type: 'ingress', label: 'Ingress', count: 0, route: '/k8s/ingress' }
      );
      break;
    case 'persistentvolumeclaim':
      relations.push(
        { type: 'persistentvolume', label: 'PersistentVolume', count: 1, route: '/k8s/persistent-volumes' },
        { type: 'pod', label: 'Pods (使用此 PVC)', count: 0, route: '/k8s/pods' }
      );
      break;
    // ... 其他资源类型
  }

  return relations;
});

function navigateTo(route: string, filters: any) {
  router.push({
    path: route,
    query: {
      namespace: props.resource.metadata.namespace,
      ...filters
    }
  });
}
</script>

<template>
  <List :data-source="relatedResources">
    <template #renderItem="{ item }">
      <List.Item>
        <List.Item.Meta :title="item.label">
          <template #description>
            关联资源数量: {{ item.count }}
          </template>
        </List.Item.Meta>
        <Button type="link" @click="navigateTo(item.route, { related: resource.metadata.name })">
          查看详情 →
        </Button>
      </List.Item>
    </template>
  </List>
</template>
```

### 🎯 优化 4：增强 Dashboard（中优先级）

#### 改进方案

**新增功能模块**：

```
dashboard/
├── index.vue
└── components/
    ├── ClusterHealthScore.vue        # 🆕 集群健康度评分
    ├── ResourceTrendChart.vue        # 🆕 资源趋势图表
    ├── AlertsPanel.vue               # 🆕 告警面板
    ├── AnomalousResources.vue        # 🆕 异常资源快速入口
    ├── RecentOperations.vue          # 🆕 最近操作记录
    ├── QuickActions.vue              # 🆕 快速操作面板
    ├── ClusterStatusCards.vue        # 已有
    ├── RecentEvents.vue              # 已有
    └── ResourceHealthStatus.vue      # 已有
```

**ClusterHealthScore.vue** 示例：

```vue
<script lang="ts" setup>
import { computed } from 'vue';
import { Card, Progress, Descriptions } from 'ant-design-vue';

interface HealthMetrics {
  nodeHealth: number;      // 节点健康度 0-100
  podHealth: number;       // Pod 健康度 0-100
  storageHealth: number;   // 存储健康度 0-100
  networkHealth: number;   // 网络健康度 0-100
}

const props = defineProps<{
  metrics: HealthMetrics;
}>();

// 计算总体健康度
const overallHealth = computed(() => {
  const { nodeHealth, podHealth, storageHealth, networkHealth } = props.metrics;
  return Math.round((nodeHealth + podHealth + storageHealth + networkHealth) / 4);
});

// 健康度颜色
const healthColor = computed(() => {
  const score = overallHealth.value;
  if (score >= 90) return 'success';
  if (score >= 70) return 'normal';
  if (score >= 50) return 'warning';
  return 'exception';
});
</script>

<template>
  <Card title="集群健康度">
    <div class="health-score">
      <Progress
        type="dashboard"
        :percent="overallHealth"
        :status="healthColor"
        :width="200"
      >
        <template #format="{ percent }">
          <div class="score-text">
            <div class="score-value">{{ percent }}</div>
            <div class="score-label">健康度</div>
          </div>
        </template>
      </Progress>
    </div>

    <Descriptions bordered :column="1" class="mt-4">
      <Descriptions.Item label="节点健康度">
        <Progress :percent="metrics.nodeHealth" size="small" />
      </Descriptions.Item>
      <Descriptions.Item label="Pod 健康度">
        <Progress :percent="metrics.podHealth" size="small" />
      </Descriptions.Item>
      <Descriptions.Item label="存储健康度">
        <Progress :percent="metrics.storageHealth" size="small" />
      </Descriptions.Item>
      <Descriptions.Item label="网络健康度">
        <Progress :percent="metrics.networkHealth" size="small" />
      </Descriptions.Item>
    </Descriptions>
  </Card>
</template>

<style scoped>
.health-score {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.score-text {
  text-align: center;
}

.score-value {
  font-size: 48px;
  font-weight: bold;
}

.score-label {
  font-size: 14px;
  color: #666;
}
</style>
```

### 🎯 优化 5：添加全局搜索（中优先级）

#### 方案：创建统一的搜索入口

**创建 `views/k8s/search/index.vue`**：

```vue
<script lang="ts" setup>
/**
 * 全局资源搜索页面
 * 支持跨资源类型搜索、标签搜索、全文搜索
 */
import { ref, computed } from 'vue';
import { Input, Select, Table, Tag, Button, Space } from 'ant-design-vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchKeyword = ref('');
const searchType = ref<'name' | 'label' | 'annotation' | 'all'>('all');
const resourceTypes = ref<string[]>([]);

// 资源类型选项
const resourceTypeOptions = [
  { label: 'Pod', value: 'pod' },
  { label: 'Deployment', value: 'deployment' },
  { label: 'Service', value: 'service' },
  { label: 'ConfigMap', value: 'configmap' },
  // ... 更多资源类型
];

// 搜索结果
const searchResults = ref<any[]>([]);
const loading = ref(false);

// 执行搜索
async function performSearch() {
  loading.value = true;
  try {
    // TODO: 调用搜索 API
    // const results = await searchK8sResources({
    //   keyword: searchKeyword.value,
    //   searchType: searchType.value,
    //   resourceTypes: resourceTypes.value,
    // });
    // searchResults.value = results;
  } finally {
    loading.value = false;
  }
}

// 跳转到资源详情
function navigateToResource(record: any) {
  const routeMap: Record<string, string> = {
    pod: '/k8s/pods',
    deployment: '/k8s/deployments',
    service: '/k8s/services',
    // ... 更多映射
  };

  const route = routeMap[record.type];
  if (route) {
    router.push({
      path: route,
      query: {
        namespace: record.namespace,
        name: record.name
      }
    });
  }
}

// 表格列
const columns = [
  { title: '资源类型', dataIndex: 'type', width: 120 },
  { title: '名称', dataIndex: 'name', width: 200 },
  { title: '命名空间', dataIndex: 'namespace', width: 150 },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 100 },
];
</script>

<template>
  <div class="search-page">
    <div class="search-header">
      <h2>全局资源搜索</h2>
      <Space direction="vertical" style="width: 100%">
        <Input
          v-model:value="searchKeyword"
          size="large"
          placeholder="搜索资源名称、标签、注解..."
          @pressEnter="performSearch"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </Input>

        <Space>
          <Select
            v-model:value="searchType"
            style="width: 150px"
            placeholder="搜索类型"
          >
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="name">名称</Select.Option>
            <Select.Option value="label">标签</Select.Option>
            <Select.Option value="annotation">注解</Select.Option>
          </Select>

          <Select
            v-model:value="resourceTypes"
            mode="multiple"
            style="width: 400px"
            placeholder="选择资源类型（留空表示全部）"
            :options="resourceTypeOptions"
          />

          <Button type="primary" :loading="loading" @click="performSearch">
            <SearchOutlined /> 搜索
          </Button>
        </Space>
      </Space>
    </div>

    <div class="search-results">
      <Table
        :columns="columns"
        :data-source="searchResults"
        :loading="loading"
        row-key="uid"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Button type="link" @click="navigateToResource(record)">
              查看详情
            </Button>
          </template>
        </template>
      </Table>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  padding: 24px;
}

.search-header {
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.search-results {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}
</style>
```

### 🎯 优化 6：改进配置管理（低优先级）

#### 方案：分离配置和业务逻辑

**当前问题**：
- `k8s-resources.ts` 文件过大（3263 行）
- 所有资源配置混在一个文件
- 难以维护和测试

**建议结构**：

```
config/
├── index.ts                    # 导出所有配置
├── resources/                  # 🆕 按资源分类
│   ├── workloads/
│   │   ├── pod.config.ts
│   │   ├── deployment.config.ts
│   │   ├── statefulset.config.ts
│   │   ├── daemonset.config.ts
│   │   ├── job.config.ts
│   │   └── cronjob.config.ts
│   ├── network/
│   │   ├── service.config.ts
│   │   ├── ingress.config.ts
│   │   └── networkpolicy.config.ts
│   ├── config/
│   │   ├── configmap.config.ts
│   │   └── secret.config.ts
│   ├── storage/
│   │   ├── pv.config.ts
│   │   ├── pvc.config.ts
│   │   └── storageclass.config.ts
│   └── cluster/
│       ├── namespace.config.ts
│       ├── node.config.ts
│       └── event.config.ts
├── forms/                      # 🆕 表单配置复用
│   ├── common-fields.ts        # 通用字段（name, namespace, labels）
│   ├── container-fields.ts     # 容器配置字段
│   └── validation-rules.ts     # 验证规则
└── k8s-resources.ts            # 保留，导入并导出所有配置（向后兼容）
```

**示例**：`config/resources/workloads/deployment.config.ts`

```typescript
import type { ResourceListConfig } from '#/types/k8s-resource-base';
import type { Deployment } from '#/api/k8s/types';
import { getMockDeploymentList } from '#/api/k8s/mock';
import {
  createBasicInfoGroup,
  createLabelsGroup,
  createAnnotationsGroup
} from '../../forms/common-fields';
import { createContainerGroup } from '../../forms/container-fields';

export function createDeploymentConfig(): ResourceListConfig<Deployment> {
  return {
    resourceType: 'deployment',
    resourceLabel: 'Deployment',

    fetchData: async (params) => {
      const result = getMockDeploymentList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },

    columns: [
      { field: 'metadata.name', title: 'Deployment 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      { field: 'spec.replicas', title: '副本数', width: 100 },
      {
        field: 'status.readyReplicas',
        title: '就绪副本',
        width: 120,
        slots: { default: 'ready-slot' },
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],

    actions: [
      {
        action: 'view',
        label: '详情',
        handler: () => {}, // 将由 GenericResourcePage 覆盖
      },
      {
        action: 'scale',
        label: '扩缩容',
        handler: () => {},
      },
      {
        action: 'restart',
        label: '重启',
        handler: () => {},
      },
      {
        action: 'edit',
        label: '编辑',
        handler: () => {},
      },
      {
        action: 'delete',
        label: '删除',
        danger: true,
        handler: () => {},
      },
    ],

    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 Deployment 名称',
    },

    formConfig: {
      groups: [
        createBasicInfoGroup('Deployment'),
        {
          title: 'Pod 选择器',
          fields: [
            {
              field: 'spec.selector.matchLabels',
              label: 'Pod 标签',
              type: 'labels',
              help: '用于选择要管理的 Pod',
            },
          ],
        },
        {
          title: '副本配置',
          fields: [
            {
              field: 'spec.replicas',
              label: '副本数',
              type: 'number',
              required: true,
              min: 0,
              defaultValue: 1,
              rules: [
                { required: true, message: '请输入副本数' },
                { type: 'number', min: 0, message: '最小值为 0' },
              ],
            },
          ],
        },
        createContainerGroup(),
        createLabelsGroup(),
        createAnnotationsGroup(),
      ],
      createInitialValues: {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {},
          },
          template: {
            metadata: {
              labels: {},
            },
            spec: {
              containers: [
                {
                  name: '',
                  image: '',
                  ports: [
                    {
                      containerPort: 80,
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },

    enableCreate: true,
  };
}
```

**forms/common-fields.ts** - 复用通用字段：

```typescript
import type { FormGroupConfig } from '#/types/k8s-resource-base';

export function createBasicInfoGroup(resourceType: string): FormGroupConfig {
  return {
    title: '基本信息',
    fields: [
      {
        field: 'metadata.name',
        label: '名称',
        type: 'input',
        required: true,
        disabled: (mode) => mode === 'edit',
        placeholder: `请输入 ${resourceType} 名称`,
        rules: [
          { required: true, message: `请输入 ${resourceType} 名称` },
          {
            pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
            message: '名称只能包含小写字母、数字和连字符',
          },
        ],
      },
      {
        field: 'metadata.namespace',
        label: '命名空间',
        type: 'input',
        required: true,
        disabled: (mode) => mode === 'edit',
        placeholder: '请输入命名空间',
        rules: [{ required: true, message: '请输入命名空间' }],
      },
    ],
  };
}

export function createLabelsGroup(): FormGroupConfig {
  return {
    title: '标签',
    fields: [
      {
        field: 'metadata.labels',
        label: '标签',
        type: 'labels',
        help: '用于组织和选择资源的键值对',
      },
    ],
    collapsible: true,
  };
}

export function createAnnotationsGroup(): FormGroupConfig {
  return {
    title: '注解',
    fields: [
      {
        field: 'metadata.annotations',
        label: '注解',
        type: 'labels',
        help: '用于附加任意元数据',
      },
    ],
    collapsible: true,
    defaultCollapsed: true,
  };
}
```

---

## 实施计划

### 阶段 1：目录和路由重构（Week 1-2）

**任务**：
1. ✅ 清理重复目录
2. ✅ 更新路由配置（扁平化）
3. ✅ 创建 `GenericResourcePage.vue`
4. ✅ 迁移 5 个简单资源页面（测试新模式）
5. ✅ 运行测试，确保功能正常

**预期结果**：
- 目录数量减少 50%
- 路由层级从 4 层降至 2 层
- 5 个资源页面代码量减少 90%

### 阶段 2：通用详情组件（Week 3）

**任务**：
1. ✅ 创建 `GenericDetailDrawer.vue`
2. ✅ 实现各个 Tab 组件（YAML、Events、Metadata、RelatedResources）
3. ✅ 在 `GenericResourcePage` 中集成
4. ✅ 迁移所有详情页面

**预期结果**：
- 删除 10+ 个重复的 DetailDrawer 组件
- 统一的详情展示体验
- 关联资源导航功能上线

### 阶段 3：Dashboard 增强（Week 4）

**任务**：
1. ✅ 实现 `ClusterHealthScore.vue`
2. ✅ 实现 `ResourceTrendChart.vue`
3. ✅ 实现 `AlertsPanel.vue`
4. ✅ 实现 `AnomalousResources.vue`
5. ✅ 集成到 Dashboard

**预期结果**：
- Dashboard 功能提升 5 倍
- 提供可操作的洞察

### 阶段 4：全局搜索（Week 5）

**任务**：
1. ✅ 实现搜索页面 UI
2. ✅ 实现搜索 API 接口
3. ✅ 添加全局搜索快捷键（Ctrl/Cmd + K）
4. ✅ 集成到导航栏

**预期结果**：
- 用户可以快速定位任何资源
- 提升操作效率

### 阶段 5：配置重构（Week 6）

**任务**：
1. ✅ 拆分 `k8s-resources.ts`
2. ✅ 创建通用字段配置
3. ✅ 更新所有资源配置
4. ✅ 确保向后兼容

**预期结果**：
- 配置文件可维护性提升
- 代码复用率提升

---

## 预期收益

### 代码质量提升

| 指标 | 优化前 | 优化后 | 改进 |
|-----|-------|-------|------|
| 视图文件数量 | 70 个 | ~35 个 | ↓ 50% |
| 重复代码行数 | ~3,300 行 | ~500 行 | ↓ 85% |
| 平均页面代码量 | 100-267 行 | 10-30 行 | ↓ 90% |
| 配置文件大小 | 3,263 行（单文件） | ~150 行/文件 × 20 | 模块化 |
| 目录层级深度 | 4 层 | 2 层 | ↓ 50% |

### 开发效率提升

- **新增资源页面**：从 100+ 行 → 10-20 行（提升 5-10 倍）
- **修改公共逻辑**：从修改 33 个文件 → 修改 1 个文件（提升 33 倍）
- **调试时间**：减少 60%（统一的代码路径）
- **新人上手时间**：减少 50%（更清晰的结构）

### 用户体验提升

- **导航效率**：URL 更短，访问更快
- **功能一致性**：所有资源页面功能统一
- **详情信息**：5 个 Tab，信息更全面
- **关联导航**：快速跳转相关资源
- **全局搜索**：快速定位任何资源
- **Dashboard 洞察**：一目了然的集群状态

### 可维护性提升

- ✅ 单一职责原则：每个组件功能明确
- ✅ 开闭原则：新增资源无需修改现有代码
- ✅ DRY 原则：消除重复代码
- ✅ 关注点分离：配置、逻辑、视图分离
- ✅ 可测试性：通用组件易于单元测试

---

## 风险和注意事项

### 🚨 潜在风险

1. **迁移成本**
   - 需要逐步迁移 33 个资源页面
   - 需要充分测试确保功能不丢失
   - **缓解措施**：分阶段迁移，每阶段充分测试

2. **向后兼容性**
   - 路由变化可能影响书签和外部链接
   - **缓解措施**：保留旧路由 3-6 个月，自动重定向到新路由

3. **学习曲线**
   - 团队需要适应新的开发模式
   - **缓解措施**：提供详细文档和示例，结对编程

### ✅ 最佳实践

1. **测试覆盖**
   - 为 `GenericResourcePage` 编写单元测试
   - 为每个新组件编写快照测试
   - E2E 测试覆盖核心流程

2. **文档更新**
   - 更新开发者文档
   - 创建迁移指南
   - 记录设计决策

3. **渐进式迁移**
   - 优先迁移简单资源（ConfigMap、Secret）
   - 保留复杂资源的现有实现（Pod with Logs Viewer）
   - 每次迁移后进行回归测试

---

## 总结

本优化方案通过以下核心策略，全面提升 K8s Web 应用的质量：

1. **统一目录结构** - 消除重复，清晰组织
2. **通用组件模式** - 减少 90% 重复代码
3. **扁平化路由** - 提升访问效率
4. **增强 Dashboard** - 提供更多洞察
5. **全局搜索** - 快速定位资源
6. **模块化配置** - 提升可维护性

**实施周期**：6 周

**团队规模**：2-3 名开发者

**预期收益**：
- 代码量减少 50%
- 开发效率提升 5-10 倍
- 用户体验显著提升
- 长期可维护性大幅改善

**建议优先级**：
1. 🔴 优先级 1（立即执行）：目录重构 + 通用页面模板
2. 🟡 优先级 2（下一阶段）：通用详情组件 + Dashboard 增强
3. 🟢 优先级 3（后续优化）：全局搜索 + 配置模块化

---

**文档版本**：v1.0
**创建日期**：2025-10-16
**作者**：Claude Code Assistant
**审核状态**：待审核
