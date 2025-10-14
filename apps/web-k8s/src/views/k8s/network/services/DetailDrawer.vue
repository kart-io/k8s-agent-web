<script lang="ts" setup>
/**
 * Service 详情抽屉组件
 * 显示 Service 的完整信息
 */
import type { Service } from '#/api/k8s/types';

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
  service: null | Service;
}

const props = withDefaults(defineProps<DetailDrawerProps>(), {
  visible: false,
  service: null,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

// 当前激活的标签页
const activeTab = ref('basic');

/**
 * Service 类型颜色映射
 */
const serviceTypeColorMap: Record<string, string> = {
  ClusterIP: 'blue',
  NodePort: 'green',
  LoadBalancer: 'purple',
  ExternalName: 'orange',
};

/**
 * 端口配置列数据
 */
const portColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    customRender: ({ text }: any) => text || '-',
  },
  {
    title: '协议',
    dataIndex: 'protocol',
    key: 'protocol',
    customRender: ({ text }: any) => text || 'TCP',
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port',
  },
  {
    title: '目标端口',
    dataIndex: 'targetPort',
    key: 'targetPort',
  },
  {
    title: 'NodePort',
    dataIndex: 'nodePort',
    key: 'nodePort',
    customRender: ({ text }: any) => text || '-',
  },
];

/**
 * 选择器数据
 */
const selectors = computed(() => {
  if (!props.service?.spec.selector) return [];
  return Object.entries(props.service.spec.selector).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 标签数据
 */
const labels = computed(() => {
  if (!props.service?.metadata.labels) return [];
  return Object.entries(props.service.metadata.labels).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 注解数据
 */
const annotations = computed(() => {
  if (!props.service?.metadata.annotations) return [];
  return Object.entries(props.service.metadata.annotations).map(
    ([key, value]) => ({
      key,
      value,
    }),
  );
});

/**
 * 格式化时间
 */
function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 格式化 External IPs
 */
const formattedExternalIPs = computed(() => {
  if (
    !props.service?.spec.externalIPs ||
    props.service.spec.externalIPs.length === 0
  ) {
    return '-';
  }
  return props.service.spec.externalIPs.join(', ');
});

/**
 * 格式化 Cluster IPs
 */
const formattedClusterIPs = computed(() => {
  if (
    props.service?.spec.clusterIPs &&
    props.service.spec.clusterIPs.length > 0
  ) {
    return props.service.spec.clusterIPs.join(', ');
  }
  return props.service?.spec.clusterIP || '-';
});

/**
 * 生成 YAML 格式的 Service 配置
 */
const serviceYaml = computed(() => {
  if (!props.service) return '';

  // 构建完整的 Service YAML 对象
  const yamlObj = {
    apiVersion: props.service.apiVersion,
    kind: props.service.kind,
    metadata: props.service.metadata,
    spec: props.service.spec,
    status: props.service.status,
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
    await navigator.clipboard.writeText(serviceYaml.value);
    message.success('YAML 已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

/**
 * 下载 YAML 文件
 */
function downloadYaml() {
  if (!props.service) return;

  const blob = new Blob([serviceYaml.value], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.service.metadata.name}.yaml`;
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
    :title="`Service 详情 - ${service?.metadata.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="service" class="detail-drawer-content">
      <Tabs v-model:active-key="activeTab" type="card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="名称">
              {{ service.metadata.name }}
            </Descriptions.Item>
            <Descriptions.Item label="命名空间">
              {{ service.metadata.namespace }}
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag :color="serviceTypeColorMap[service.spec.type]">
                {{ service.spec.type }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cluster IP">
              {{ formattedClusterIPs }}
            </Descriptions.Item>
            <Descriptions.Item label="External IPs" :span="2">
              {{ formattedExternalIPs }}
            </Descriptions.Item>
            <Descriptions.Item label="Session Affinity">
              {{ service.spec.sessionAffinity || 'None' }}
            </Descriptions.Item>
            <Descriptions.Item label="UID">
              {{ service.metadata.uid }}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" :span="2">
              {{ formatDateTime(service.metadata.creationTimestamp) }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 端口配置标签页 -->
        <Tabs.TabPane key="ports" tab="端口配置">
          <Table
            :columns="portColumns"
            :data-source="service.spec.ports"
            :pagination="false"
            size="small"
            :row-key="(record: any) => record.name || record.port"
          />
        </Tabs.TabPane>

        <!-- 选择器标签页 -->
        <Tabs.TabPane key="selectors" tab="选择器">
          <div v-if="selectors.length > 0" class="label-list">
            <Tag
              v-for="selector in selectors"
              :key="selector.key"
              class="label-tag"
            >
              <strong>{{ selector.key }}:</strong> {{ selector.value }}
            </Tag>
          </div>
          <div v-else class="empty-text">无选择器</div>
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
              <pre>{{ serviceYaml }}</pre>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div v-else class="empty-text">未选择 Service</div>
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
