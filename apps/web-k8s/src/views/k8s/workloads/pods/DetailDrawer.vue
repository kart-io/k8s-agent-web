<script lang="ts" setup>
/**
 * Pod 详情抽屉组件
 * 显示 Pod 的完整信息
 */
import type { Pod } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import {
  Button,
  Descriptions,
  Drawer,
  message,
  Table,
  Tabs,
  Tag,
} from 'ant-design-vue';

interface DetailDrawerProps {
  visible: boolean;
  pod: null | Pod;
}

const props = withDefaults(defineProps<DetailDrawerProps>(), {
  visible: false,
  pod: null,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

// 当前激活的标签页
const activeTab = ref('basic');

/**
 * 状态颜色映射
 */
const statusColorMap: Record<string, string> = {
  Running: 'success',
  Pending: 'warning',
  Failed: 'error',
  Succeeded: 'success',
  Unknown: 'default',
};

/**
 * 容器列数据
 */
const containerColumns = [
  {
    title: '容器名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '镜像',
    dataIndex: 'image',
    key: 'image',
  },
  {
    title: '端口',
    key: 'ports',
    customRender: ({ record }: any) => {
      return record.ports?.map((p: any) => p.containerPort).join(', ') || '-';
    },
  },
];

/**
 * 容器状态列数据
 */
const containerStatusColumns = [
  {
    title: '容器名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '状态',
    key: 'state',
    customRender: ({ record }: any) => {
      if (record.state.running) return '运行中';
      if (record.state.waiting)
        return `等待中 (${record.state.waiting.reason})`;
      if (record.state.terminated)
        return `已终止 (${record.state.terminated.reason})`;
      return '未知';
    },
  },
  {
    title: '就绪',
    dataIndex: 'ready',
    key: 'ready',
    customRender: ({ text }: any) => (text ? '是' : '否'),
  },
  {
    title: '重启次数',
    dataIndex: 'restartCount',
    key: 'restartCount',
  },
];

/**
 * 标签数据
 */
const labels = computed(() => {
  if (!props.pod?.metadata.labels) return [];
  return Object.entries(props.pod.metadata.labels).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 注解数据
 */
const annotations = computed(() => {
  if (!props.pod?.metadata.annotations) return [];
  return Object.entries(props.pod.metadata.annotations).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 格式化时间
 */
function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 生成 YAML 格式的 Pod 配置
 */
const podYaml = computed(() => {
  if (!props.pod) return '';

  // 构建完整的 Pod YAML 对象
  const yamlObj = {
    apiVersion: props.pod.apiVersion,
    kind: props.pod.kind,
    metadata: props.pod.metadata,
    spec: props.pod.spec,
    status: props.pod.status,
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
      // 如果字符串包含特殊字符，用引号包裹
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
    await navigator.clipboard.writeText(podYaml.value);
    message.success('YAML 已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

/**
 * 下载 YAML 文件
 */
function downloadYaml() {
  if (!props.pod) return;

  const blob = new Blob([podYaml.value], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.pod.metadata.name}.yaml`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('YAML 文件已下载');
}

/**
 * 关闭抽屉
 */
function handleClose() {
  emit('update:visible', false);
  // 重置标签页到第一个
  activeTab.value = 'basic';
}
</script>

<template>
  <Drawer
    :open="visible"
    :title="`Pod 详情 - ${pod?.metadata.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="pod" class="detail-drawer-content">
      <Tabs v-model:active-key="activeTab" type="card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="名称">
              {{ pod.metadata.name }}
            </Descriptions.Item>
            <Descriptions.Item label="命名空间">
              {{ pod.metadata.namespace }}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag :color="statusColorMap[pod.status.phase]">
                {{ pod.status.phase }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="UID">
              {{ pod.metadata.uid }}
            </Descriptions.Item>
            <Descriptions.Item label="Pod IP">
              {{ pod.status.podIP || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="主机 IP">
              {{ pod.status.hostIP || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="节点名称">
              {{ pod.spec.nodeName || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="服务账号">
              {{ pod.spec.serviceAccountName || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" :span="2">
              {{ formatDateTime(pod.metadata.creationTimestamp) }}
            </Descriptions.Item>
            <Descriptions.Item label="启动时间" :span="2">
              {{ formatDateTime(pod.status.startTime) }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 容器规格标签页 -->
        <Tabs.TabPane key="containers" tab="容器规格">
          <Table
            :columns="containerColumns"
            :data-source="pod.spec.containers"
            :pagination="false"
            size="small"
            :row-key="(record: any) => record.name"
          />
        </Tabs.TabPane>

        <!-- 容器状态标签页 -->
        <Tabs.TabPane key="container-status" tab="容器状态">
          <Table
            :columns="containerStatusColumns"
            :data-source="pod.status.containerStatuses"
            :pagination="false"
            size="small"
            :row-key="(record: any) => record.name"
          />
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

        <!-- 条件标签页 -->
        <Tabs.TabPane key="conditions" tab="条件">
          <Table
            :columns="[
              { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
              { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
              {
                title: '最后转换时间',
                dataIndex: 'lastTransitionTime',
                key: 'lastTransitionTime',
                width: 180,
                customRender: ({ text }: any) => formatDateTime(text),
              },
              { title: '原因', dataIndex: 'reason', key: 'reason', width: 150 },
              { title: '消息', dataIndex: 'message', key: 'message' },
            ]"
            :data-source="pod.status.conditions"
            :pagination="false"
            size="small"
            :row-key="(record: any) => record.type"
          />
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
              <pre>{{ podYaml }}</pre>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div v-else class="empty-text">未选择 Pod</div>
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

/* 深色主题 YAML 内容边框 - 使用白色提高可见度 */
html[data-theme='dark'] .yaml-content {
  border-color: #fff !important;
}

/* 浅色主题 YAML 内容边框 - 使用中灰色 */
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
