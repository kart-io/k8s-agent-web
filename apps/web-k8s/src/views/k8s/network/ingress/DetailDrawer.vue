<script lang="ts" setup>
/**
 * Ingress 详情抽屉组件
 * 显示 Ingress 的完整信息，包括规则、TLS、后端服务配置
 */
import type { Ingress } from '#/api/k8s/types';

import { computed, h, ref } from 'vue';

import {
  Button,
  Descriptions,
  Drawer,
  message,
  Table,
  Tabs,
  Tag,
} from 'ant-design-vue';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
} from '@ant-design/icons-vue';

interface DetailDrawerProps {
  visible: boolean;
  ingress: null | Ingress;
}

const props = withDefaults(defineProps<DetailDrawerProps>(), {
  visible: false,
  ingress: null,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

// 当前激活的标签页
const activeTab = ref('basic');

/**
 * 规则列配置
 */
const ruleColumns = [
  {
    title: '主机',
    dataIndex: 'host',
    key: 'host',
    customRender: ({ text }: any) => text || '*',
  },
  {
    title: '路径数量',
    key: 'pathCount',
    customRender: ({ record }: any) => record.http?.paths.length || 0,
  },
];

/**
 * 路径列配置
 */
const pathColumns = [
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
    customRender: ({ text }: any) => text || '/',
  },
  {
    title: '路径类型',
    dataIndex: 'pathType',
    key: 'pathType',
  },
  {
    title: '后端服务',
    key: 'service',
    customRender: ({ record }: any) => {
      const service = record.backend?.service;
      if (!service) return '-';
      return `${service.name}:${service.port?.number || service.port?.name || '-'}`;
    },
  },
];

/**
 * TLS 配置列
 */
const tlsColumns = [
  {
    title: '域名',
    dataIndex: 'hosts',
    key: 'hosts',
    customRender: ({ text }: any) => (text || []).join(', '),
  },
  {
    title: 'Secret 名称',
    dataIndex: 'secretName',
    key: 'secretName',
    customRender: ({ text }: any) => text || '-',
  },
];

/**
 * 展开的规则行 keys
 */
const expandedRuleKeys = ref<string[]>([]);

/**
 * 标签数据
 */
const labels = computed(() => {
  if (!props.ingress?.metadata.labels) return [];
  return Object.entries(props.ingress.metadata.labels).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 注解数据
 */
const annotations = computed(() => {
  if (!props.ingress?.metadata.annotations) return [];
  return Object.entries(props.ingress.metadata.annotations).map(
    ([key, value]) => ({
      key,
      value,
    }),
  );
});

/**
 * LoadBalancer IP/Hostname
 */
const loadBalancerInfo = computed(() => {
  const lb = props.ingress?.status?.loadBalancer?.ingress?.[0];
  if (!lb) return '-';
  return lb.ip || lb.hostname || '-';
});

/**
 * TLS 状态
 */
const tlsStatus = computed(() => {
  const hasTLS = props.ingress?.spec.tls && props.ingress.spec.tls.length > 0;
  return {
    enabled: hasTLS,
    count: props.ingress?.spec.tls?.length || 0,
  };
});

/**
 * 格式化时间
 */
function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 生成 YAML 格式的 Ingress 配置
 */
const ingressYaml = computed(() => {
  if (!props.ingress) return '';

  const yamlObj = {
    apiVersion: props.ingress.apiVersion,
    kind: props.ingress.kind,
    metadata: props.ingress.metadata,
    spec: props.ingress.spec,
    status: props.ingress.status,
  };

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
    await navigator.clipboard.writeText(ingressYaml.value);
    message.success('YAML 已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

/**
 * 下载 YAML 文件
 */
function downloadYaml() {
  if (!props.ingress) return;

  const blob = new Blob([ingressYaml.value], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.ingress.metadata.name}.yaml`;
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
  expandedRuleKeys.value = [];
}
</script>

<template>
  <Drawer
    :open="visible"
    :title="`Ingress 详情 - ${ingress?.metadata.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="ingress" class="detail-drawer-content">
      <Tabs v-model:active-key="activeTab" type="card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="名称">
              {{ ingress.metadata.name }}
            </Descriptions.Item>
            <Descriptions.Item label="命名空间">
              {{ ingress.metadata.namespace }}
            </Descriptions.Item>
            <Descriptions.Item label="Ingress Class">
              <Tag color="blue">
                {{ ingress.spec.ingressClassName || 'default' }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="TLS 状态">
              <Tag v-if="tlsStatus.enabled" color="success">
                <template #icon>
                  <CheckCircleOutlined />
                </template>
                已配置 ({{ tlsStatus.count }})
              </Tag>
              <Tag v-else color="default">
                <template #icon>
                  <CloseCircleOutlined />
                </template>
                未配置
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="LoadBalancer">
              {{ loadBalancerInfo }}
            </Descriptions.Item>
            <Descriptions.Item label="规则数量">
              {{ ingress.spec.rules?.length || 0 }}
            </Descriptions.Item>
            <Descriptions.Item label="UID">
              {{ ingress.metadata.uid }}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {{ formatDateTime(ingress.metadata.creationTimestamp) }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 路由规则标签页 -->
        <Tabs.TabPane key="rules" tab="路由规则">
          <Table
            :columns="ruleColumns"
            :data-source="ingress.spec.rules || []"
            :pagination="false"
            size="small"
            :row-key="(record: any, index: number) => record.host || `rule-${index}`"
            :expanded-row-keys="expandedRuleKeys"
            @expand="
              (expanded, record) => {
                const key = record.host || `rule-${ingress.spec.rules?.indexOf(record)}`;
                if (expanded) {
                  if (!expandedRuleKeys.includes(key)) {
                    expandedRuleKeys.push(key);
                  }
                } else {
                  const index = expandedRuleKeys.indexOf(key);
                  if (index > -1) {
                    expandedRuleKeys.splice(index, 1);
                  }
                }
              }
            "
          >
            <template #expandedRowRender="{ record }">
              <div class="expanded-content">
                <h4 class="expanded-title">路径配置</h4>
                <Table
                  :columns="pathColumns"
                  :data-source="record.http?.paths || []"
                  :pagination="false"
                  size="small"
                  :row-key="(path: any, index: number) => `path-${index}`"
                />
              </div>
            </template>
          </Table>
        </Tabs.TabPane>

        <!-- TLS 配置标签页 -->
        <Tabs.TabPane key="tls" :tab="`TLS 配置 ${tlsStatus.enabled ? `(${tlsStatus.count})` : ''}`">
          <div v-if="tlsStatus.enabled" class="tls-info">
            <div class="tls-header">
              <Tag color="success" class="tls-tag">
                <template #icon>
                  <LockOutlined />
                </template>
                TLS 已启用
              </Tag>
            </div>
            <Table
              :columns="tlsColumns"
              :data-source="ingress.spec.tls || []"
              :pagination="false"
              size="small"
              :row-key="(record: any, index: number) => record.secretName || `tls-${index}`"
            />
          </div>
          <div v-else class="empty-text">未配置 TLS</div>
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
              <pre>{{ ingressYaml }}</pre>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div v-else class="empty-text">未选择 Ingress</div>
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

/* 展开行内容样式 */
.expanded-content {
  padding: 16px;
  background-color: var(--vben-background-color);
}

.expanded-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

/* TLS 信息样式 */
.tls-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tls-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tls-tag {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
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
