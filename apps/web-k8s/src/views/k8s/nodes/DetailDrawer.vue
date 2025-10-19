<script lang="ts" setup>
/**
 * Node 详情抽屉组件
 * 显示 Node 的完整信息
 */
import type { Node } from '#/api/k8s/types';

import { computed, ref, watch } from 'vue';

import {
  Button,
  Descriptions,
  Drawer,
  message,
  Progress,
  Table,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { podApi } from '#/api/k8s';

interface DetailDrawerProps {
  visible: boolean;
  node: Node | null;
  clusterId?: string;
}

const props = withDefaults(defineProps<DetailDrawerProps>(), {
  visible: false,
  node: null,
  clusterId: 'cluster-prod-01',
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

// 当前激活的标签页
const activeTab = ref('basic');

// 节点上运行的 Pod 列表
const nodePods = ref<any[]>([]);

/**
 * 获取节点状态
 */
const nodeStatus = computed(() => {
  if (!props.node) return 'Unknown';
  const readyCondition = props.node.status?.conditions?.find(
    (c) => c.type === 'Ready',
  );
  return readyCondition?.status === 'True' ? 'Ready' : 'NotReady';
});

/**
 * 状态颜色映射
 */
const statusColorMap: Record<string, string> = {
  Ready: 'success',
  NotReady: 'error',
  Unknown: 'default',
};

/**
 * 获取节点角色
 */
const nodeRole = computed(() => {
  if (!props.node) return 'Unknown';
  const labels = props.node.metadata.labels || {};
  if (
    labels['kubernetes.io/role'] === 'master' ||
    labels['node-role.kubernetes.io/master'] !== undefined
  ) {
    return 'Master';
  }
  if (
    labels['kubernetes.io/role'] === 'worker' ||
    labels['node-role.kubernetes.io/worker'] !== undefined
  ) {
    return 'Worker';
  }
  return 'Unknown';
});

/**
 * 角色颜色映射
 */
const roleColorMap: Record<string, string> = {
  Master: 'blue',
  Worker: 'green',
  Unknown: 'default',
};

/**
 * Pod 列数据
 */
const podColumns = [
  {
    title: 'Pod 名称',
    dataIndex: ['metadata', 'name'],
    key: 'name',
    ellipsis: true,
  },
  {
    title: '命名空间',
    dataIndex: ['metadata', 'namespace'],
    key: 'namespace',
    width: 150,
  },
  {
    title: '状态',
    key: 'phase',
    width: 120,
    customRender: ({ record }: any) => {
      const phase = record.status?.phase;
      const colorMap: Record<string, string> = {
        Running: 'success',
        Pending: 'warning',
        Failed: 'error',
        Succeeded: 'success',
      };
      return { phase, color: colorMap[phase] || 'default' };
    },
  },
  {
    title: 'Pod IP',
    dataIndex: ['status', 'podIP'],
    key: 'podIP',
    width: 150,
  },
];

/**
 * 条件列数据
 */
const conditionColumns = [
  { title: '类型', dataIndex: 'type', key: 'type' },
  {
    title: '状态',
    key: 'status',
    width: 100,
  },
  { title: '原因', dataIndex: 'reason', key: 'reason' },
  {
    title: '消息',
    dataIndex: 'message',
    key: 'message',
    ellipsis: true,
  },
  {
    title: '最后更新时间',
    key: 'lastTransitionTime',
    width: 180,
  },
];

/**
 * 标签数据
 */
const labels = computed(() => {
  if (!props.node?.metadata.labels) return [];
  return Object.entries(props.node.metadata.labels).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 注解数据
 */
const annotations = computed(() => {
  if (!props.node?.metadata.annotations) return [];
  return Object.entries(props.node.metadata.annotations).map(
    ([key, value]) => ({
      key,
      value,
    }),
  );
});

/**
 * 污点（Taints）数据
 */
const taints = computed(() => {
  if (!props.node?.spec?.taints || props.node.spec.taints.length === 0)
    return [];
  return props.node.spec.taints;
});

/**
 * 污点效果颜色映射
 */
const taintEffectColorMap: Record<string, string> = {
  NoSchedule: 'orange',
  PreferNoSchedule: 'warning',
  NoExecute: 'error',
};

/**
 * 容忍度列数据
 */
const taintColumns = [
  {
    title: 'Key',
    dataIndex: 'key',
    key: 'key',
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
    customRender: ({ text }: any) => text || '-',
  },
  {
    title: 'Effect',
    dataIndex: 'effect',
    key: 'effect',
    width: 150,
  },
];

/**
 * 计算资源使用率
 */
function getResourceUsage(capacity?: string, allocatable?: string): number {
  if (!capacity || !allocatable) return 0;
  const cap = Number.parseFloat(capacity.replaceAll(/[^0-9.]/g, ''));
  const alloc = Number.parseFloat(allocatable.replaceAll(/[^0-9.]/g, ''));
  if (Number.isNaN(cap) || cap === 0) return 0;
  return Math.round(((cap - alloc) / cap) * 100);
}

/**
 * CPU 使用率
 */
const cpuUsage = computed(() => {
  if (!props.node?.status?.capacity || !props.node?.status?.allocatable)
    return 0;
  return getResourceUsage(
    props.node.status.capacity.cpu,
    props.node.status.allocatable.cpu,
  );
});

/**
 * 内存使用率
 */
const memoryUsage = computed(() => {
  if (!props.node?.status?.capacity || !props.node?.status?.allocatable)
    return 0;
  return getResourceUsage(
    props.node.status.capacity.memory,
    props.node.status.allocatable.memory,
  );
});

/**
 * 获取进度条颜色
 */
function getProgressColor(percent: number): string {
  if (percent > 80) return '#ff4d4f';
  if (percent > 60) return '#faad14';
  return '#52c41a';
}

/**
 * 格式化时间
 */
function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 获取运行时长
 */
function getNodeAge(creationTimestamp?: string): string {
  if (!creationTimestamp) return '-';
  const created = new Date(creationTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '1天';
  if (diffDays < 30) return `${diffDays}天`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}个月`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}年`;
}

/**
 * 生成 YAML 格式的 Node 配置
 */
const nodeYaml = computed(() => {
  if (!props.node) return '';

  // 构建完整的 Node YAML 对象
  const yamlObj = {
    apiVersion: props.node.apiVersion,
    kind: props.node.kind,
    metadata: props.node.metadata,
    spec: props.node.spec,
    status: props.node.status,
  };

  // 转换为 YAML 格式字符串
  return formatYaml(yamlObj);
});

/**
 * 简单的 YAML 格式化函数
 */
function formatYaml(obj: any, indent = 0): string {
  const indentStr = '  '.repeat(indent);
  let result = '';

  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
        return `"${obj.replaceAll('"', String.raw`\"`)}"`;
      }
      return obj;
    }
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    obj.forEach((item) => {
      result += `${indentStr}- ${formatYaml(item, indent + 1).trimStart()}\n`;
    });
    return result.trimEnd();
  }

  // 对象处理
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) return;

    if (value === null) {
      result += `${indentStr}${key}: null\n`;
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          result += `${indentStr}${key}: []\n`;
        } else {
          result += `${indentStr}${key}:\n`;
          value.forEach((item) => {
            result +=
              typeof item === 'object'
                ? `${indentStr}- \n${formatYaml(item, indent + 2)}`
                : `${indentStr}- ${formatYaml(item, indent + 1)}\n`;
          });
        }
      } else {
        result += `${indentStr}${key}:\n${formatYaml(value, indent + 1)}`;
      }
    } else {
      result += `${indentStr}${key}: ${formatYaml(value, indent)}\n`;
    }
  });

  return result;
}

/**
 * 复制 YAML 到剪贴板
 */
async function copyYaml() {
  try {
    await navigator.clipboard.writeText(nodeYaml.value);
    message.success('YAML 已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

/**
 * 下载 YAML 文件
 */
function downloadYaml() {
  if (!props.node) return;

  const blob = new Blob([nodeYaml.value], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.node.metadata.name}.yaml`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('YAML 文件已下载');
}

/**
 * 获取节点地址
 */
function getNodeAddress(type: string): string {
  if (!props.node?.status?.addresses) return '-';
  const address = props.node.status.addresses.find((a) => a.type === type);
  return address?.address || '-';
}

/**
 * 加载节点上的 Pod
 */
async function loadNodePods() {
  if (!props.node || !props.visible) {
    nodePods.value = [];
    return;
  }

  const result = await podApi.list({
    clusterId: props.clusterId,
    page: 1,
    pageSize: 100,
  });

  nodePods.value = result.items.filter(
    (pod) => pod.spec.nodeName === props.node!.metadata.name,
  );
}

/**
 * 监听抽屉打开状态
 */
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      loadNodePods();
    }
  },
  { immediate: true },
);

/**
 * 监听节点变化
 */
watch(
  () => props.node,
  () => {
    if (props.visible) {
      loadNodePods();
    }
  },
);

/**
 * 关闭抽屉
 */
function handleClose() {
  emit('update:visible', false);
  emit('close'); // 重置标签页到第一个
  activeTab.value = 'basic';
}
</script>

<template>
  <Drawer
    :open="visible"
    :title="`Node 详情 - ${node?.metadata.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="node" class="detail-drawer-content">
      <Tabs v-model:active-key="activeTab" type="card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="节点名称">
              {{ node.metadata.name }}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag :color="statusColorMap[nodeStatus]">
                {{ nodeStatus }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="角色">
              <Tag :color="roleColorMap[nodeRole]">
                {{ nodeRole }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="运行时长">
              {{ getNodeAge(node.metadata.creationTimestamp) }}
            </Descriptions.Item>
            <Descriptions.Item label="内部 IP">
              {{ getNodeAddress('InternalIP') }}
            </Descriptions.Item>
            <Descriptions.Item label="外部 IP">
              {{ getNodeAddress('ExternalIP') }}
            </Descriptions.Item>
            <Descriptions.Item label="主机名">
              {{ getNodeAddress('Hostname') }}
            </Descriptions.Item>
            <Descriptions.Item label="UID">
              {{ node.metadata.uid }}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" :span="2">
              {{ formatDateTime(node.metadata.creationTimestamp) }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 资源信息标签页 -->
        <Tabs.TabPane key="resources" tab="资源信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="CPU 容量">
              {{ node.status?.capacity?.cpu || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="CPU 可分配">
              {{ node.status?.allocatable?.cpu || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="内存容量">
              {{ node.status?.capacity?.memory || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="内存可分配">
              {{ node.status?.allocatable?.memory || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="Pod 容量">
              {{ node.status?.capacity?.pods || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="Pod 可分配">
              {{ node.status?.allocatable?.pods || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="临时存储容量">
              {{ node.status?.capacity?.['ephemeral-storage'] || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="临时存储可分配">
              {{ node.status?.allocatable?.['ephemeral-storage'] || '-' }}
            </Descriptions.Item>
          </Descriptions>

          <div class="mt-6">
            <div class="mb-4 text-base font-semibold">资源使用率</div>
            <div class="resource-usage-container">
              <div class="resource-usage-item">
                <div class="mb-2 text-sm font-medium">CPU 使用率</div>
                <Progress
                  :percent="cpuUsage"
                  :stroke-color="getProgressColor(cpuUsage)"
                />
              </div>

              <div class="resource-usage-item">
                <div class="mb-2 text-sm font-medium">内存使用率</div>
                <Progress
                  :percent="memoryUsage"
                  :stroke-color="getProgressColor(memoryUsage)"
                />
              </div>
            </div>
          </div>
        </Tabs.TabPane>

        <!-- 系统信息标签页 -->
        <Tabs.TabPane key="system" tab="系统信息">
          <Descriptions :column="1" bordered size="small">
            <Descriptions.Item label="操作系统">
              {{ node.status?.nodeInfo?.osImage || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="内核版本">
              {{ node.status?.nodeInfo?.kernelVersion || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="容器运行时">
              {{ node.status?.nodeInfo?.containerRuntimeVersion || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="Kubelet 版本">
              {{ node.status?.nodeInfo?.kubeletVersion || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="Kube-Proxy 版本">
              {{ node.status?.nodeInfo?.kubeProxyVersion || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="操作系统类型">
              {{ node.status?.nodeInfo?.operatingSystem || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="系统架构">
              {{ node.status?.nodeInfo?.architecture || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="机器 ID">
              {{ node.status?.nodeInfo?.machineID || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="系统 UUID">
              {{ node.status?.nodeInfo?.systemUUID || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="Boot ID">
              {{ node.status?.nodeInfo?.bootID || '-' }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 运行的 Pod 标签页 -->
        <Tabs.TabPane key="pods" :tab="`运行的 Pod (${nodePods.length})`">
          <Table
            :columns="podColumns"
            :data-source="nodePods"
            :pagination="{ pageSize: 10 }"
            size="small"
            :row-key="(record: any) => record.metadata.uid"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'phase'">
                <Tag :color="column.customRender({ record }).color">
                  {{ column.customRender({ record }).phase }}
                </Tag>
              </template>
            </template>
          </Table>
        </Tabs.TabPane>

        <!-- 健康状态标签页 -->
        <Tabs.TabPane key="conditions" tab="健康状态">
          <Table
            :columns="conditionColumns"
            :data-source="node.status?.conditions || []"
            :pagination="false"
            size="small"
            :row-key="(record: any) => record.type"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <Tag v-if="record.status === 'True'" color="success">
                  True
                </Tag>
                <Tag v-else-if="record.status === 'False'" color="error">
                  False
                </Tag>
                <Tag v-else color="default">{{ record.status }}</Tag>
              </template>
              <template v-else-if="column.key === 'lastTransitionTime'">
                {{ formatDateTime(record.lastTransitionTime) }}
              </template>
            </template>
          </Table>
        </Tabs.TabPane>

        <!-- 污点标签页（Node 特有功能） -->
        <Tabs.TabPane key="taints" :tab="`污点 (${taints.length})`">
          <div v-if="taints.length > 0">
            <Table
              :columns="taintColumns"
              :data-source="taints"
              :pagination="false"
              size="small"
              :row-key="(record: any) => record.key"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'effect'">
                  <Tag :color="taintEffectColorMap[record.effect] || 'default'">
                    {{ record.effect }}
                  </Tag>
                </template>
              </template>
            </Table>
            <div class="mt-4 rounded bg-gray-50 p-3 dark:bg-gray-800">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <strong>说明：</strong>污点（Taints）用于标记节点，防止 Pod
                被调度到该节点，除非 Pod 有相应的容忍度（Tolerations）。
              </p>
              <ul
                class="mt-2 list-inside list-disc text-sm text-gray-600 dark:text-gray-400"
              >
                <li><strong>NoSchedule:</strong> 不会将 Pod 调度到该节点</li>
                <li><strong>PreferNoSchedule:</strong> 尽量不调度到该节点</li>
                <li>
                  <strong>NoExecute:</strong> 不调度新 Pod，并驱逐现有 Pod
                </li>
              </ul>
            </div>
          </div>
          <div v-else class="empty-text">此节点没有设置污点</div>
        </Tabs.TabPane>

        <!-- 标签标签页 -->
        <Tabs.TabPane key="labels" tab="标签">
          <div v-if="labels.length > 0" class="label-list">
            <Tag v-for="label in labels" :key="label.key" class="label-tag">
              <strong>{{ label.key }}:</strong> {{ label.value }}
            </Tag>
          </div>
          <div v-else class="empty-text">无标签</div>
        </Tabs.TabPane>

        <!-- 注解标签页 -->
        <Tabs.TabPane key="annotations" tab="注解">
          <div v-if="annotations.length > 0" class="annotation-list">
            <div
              v-for="anno in annotations"
              :key="anno.key"
              class="annotation-item"
            >
              <strong>{{ anno.key }}:</strong>
              <div class="annotation-value">{{ anno.value }}</div>
            </div>
          </div>
          <div v-else class="empty-text">无注解</div>
        </Tabs.TabPane>

        <!-- YAML 配置标签页 -->
        <Tabs.TabPane key="yaml" tab="YAML 配置">
          <div class="yaml-actions">
            <Button type="primary" size="small" @click="copyYaml">
              复制 YAML
            </Button>
            <Button size="small" @click="downloadYaml"> 下载 YAML </Button>
          </div>
          <div class="yaml-wrapper">
            <div class="yaml-content">
              <pre>{{ nodeYaml }}</pre>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div v-else class="empty-text">未选择 Node</div>
  </Drawer>
</template>

<style scoped>
.detail-drawer-content {
  height: 100%;
  padding-bottom: 24px;
}

.detail-tabs {
  height: 100%;
}

.detail-tabs :deep(.ant-tabs-content) {
  height: calc(100vh - 180px);
  overflow-y: auto;
}

.detail-tabs :deep(.ant-tabs-tabpane) {
  padding: 16px 0;
}

.detail-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}

.resource-usage-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.resource-usage-item {
  width: 100%;
}

.label-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label-tag {
  padding: 6px 12px;
  margin: 0;
  font-size: 13px;
}

.annotation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.annotation-item {
  padding: 12px;
  font-size: 13px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.annotation-item strong {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--vben-text-color);
}

.annotation-value {
  padding: 8px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--vben-text-color-secondary);
  word-break: break-all;
  background-color: rgb(0 0 0 / 2%);
  border-radius: 2px;
}

html[data-theme='dark'] .annotation-value {
  background-color: rgb(255 255 255 / 5%);
}

.empty-text {
  padding: 32px;
  font-size: 14px;
  color: var(--vben-text-color-secondary);
  text-align: center;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
  background-color: var(--vben-background-color);
}

:deep(.ant-table) {
  font-size: 13px;
}

:deep(.ant-table-thead > tr > th) {
  font-weight: 600;
  background-color: var(--vben-background-color);
}

/* YAML 配置样式 */
.yaml-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.yaml-wrapper {
  padding: 12px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
}

.yaml-content {
  max-height: calc(100vh - 320px);
  padding: 16px;
  overflow: auto;
  background-color: var(--vben-background-color-deep);
  border: 2px solid #808080;
  border-radius: 4px;
}

/* 深色主题 YAML 内容边框 */
html[data-theme='dark'] .yaml-content {
  border-color: #fff !important;
}

/* 浅色主题 YAML 内容边框 */
html[data-theme='light'] .yaml-content,
html:not([data-theme]) .yaml-content {
  border-color: #808080 !important;
}

.yaml-content pre {
  margin: 0;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vben-text-color);
  word-wrap: normal;
  white-space: pre;
}

/* YAML 内容滚动条 */
.yaml-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.yaml-content::-webkit-scrollbar-track {
  background-color: var(--vben-background-color);
}

.yaml-content::-webkit-scrollbar-thumb {
  background-color: var(--vben-border-color);
  border-radius: 4px;
}

.yaml-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--vben-text-color-secondary);
}
</style>
