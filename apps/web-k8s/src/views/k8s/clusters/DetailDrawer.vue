<script lang="ts" setup>
/**
 * Cluster 详情抽屉组件
 * 显示 Cluster 的完整信息
 */
import type { Cluster } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import {
  Button,
  Card,
  Descriptions,
  Drawer,
  message,
  Statistic,
  Tabs,
  Tag,
} from 'ant-design-vue';

interface DetailDrawerProps {
  visible: boolean;
  cluster: Cluster | null;
}

const props = withDefaults(defineProps<DetailDrawerProps>(), {
  visible: false,
  cluster: null,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

// 当前激活的标签页
const activeTab = ref('basic');

/**
 * 状态颜色映射
 */
const statusColorMap: Record<string, string> = {
  healthy: 'success',
  unhealthy: 'error',
  unknown: 'default',
};

/**
 * 状态文本映射
 */
const statusTextMap: Record<string, string> = {
  healthy: '健康',
  unhealthy: '异常',
  unknown: '未知',
};

/**
 * 格式化时间
 */
function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 生成 YAML 格式的 Cluster 配置
 */
const clusterYaml = computed(() => {
  if (!props.cluster) return '';

  // 构建完整的 Cluster YAML 对象
  const yamlObj = {
    id: props.cluster.id,
    name: props.cluster.name,
    description: props.cluster.description,
    apiServer: props.cluster.apiServer,
    version: props.cluster.version,
    status: props.cluster.status,
    nodeCount: props.cluster.nodeCount,
    podCount: props.cluster.podCount,
    namespaceCount: props.cluster.namespaceCount,
    createdAt: props.cluster.createdAt,
    updatedAt: props.cluster.updatedAt,
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
    await navigator.clipboard.writeText(clusterYaml.value);
    message.success('YAML 已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

/**
 * 下载 YAML 文件
 */
function downloadYaml() {
  if (!props.cluster) return;

  const blob = new Blob([clusterYaml.value], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.cluster.name}.yaml`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('YAML 文件已下载');
}

/**
 * 复制 API Server 地址
 */
async function copyApiServer() {
  if (!props.cluster?.apiServer) return;

  try {
    await navigator.clipboard.writeText(props.cluster.apiServer);
    message.success('API Server 地址已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

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
    :title="`Cluster 详情 - ${cluster?.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="cluster" class="detail-drawer-content">
      <Tabs v-model:active-key="activeTab" type="card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="集群名称">
              {{ cluster.name }}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag :color="statusColorMap[cluster.status]">
                {{ statusTextMap[cluster.status] || cluster.status }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="集群 ID" :span="2">
              {{ cluster.id }}
            </Descriptions.Item>
            <Descriptions.Item label="描述" :span="2">
              {{ cluster.description || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="K8s 版本">
              {{ cluster.version }}
            </Descriptions.Item>
            <Descriptions.Item label="API Server">
              <div class="api-server-container">
                <code class="api-server-url">{{ cluster.apiServer }}</code>
                <Button size="small" type="link" @click="copyApiServer">
                  复制
                </Button>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" :span="2">
              {{ formatDateTime(cluster.createdAt) }}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" :span="2">
              {{ formatDateTime(cluster.updatedAt) }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 资源统计标签页 -->
        <Tabs.TabPane key="statistics" tab="资源统计">
          <div class="statistics-grid">
            <Card>
              <Statistic
                title="节点数量"
                :value="cluster.nodeCount"
                :value-style="{ color: '#1890ff' }"
              >
                <template #suffix>
                  <span class="text-sm">个</span>
                </template>
              </Statistic>
            </Card>

            <Card>
              <Statistic
                title="Pod 数量"
                :value="cluster.podCount"
                :value-style="{ color: '#52c41a' }"
              >
                <template #suffix>
                  <span class="text-sm">个</span>
                </template>
              </Statistic>
            </Card>

            <Card>
              <Statistic
                title="命名空间数量"
                :value="cluster.namespaceCount"
                :value-style="{ color: '#faad14' }"
              >
                <template #suffix>
                  <span class="text-sm">个</span>
                </template>
              </Statistic>
            </Card>
          </div>

          <div class="mt-6">
            <div class="mb-4 text-base font-semibold">集群概览</div>
            <Descriptions :column="1" bordered size="small">
              <Descriptions.Item label="集群健康状态">
                <Tag :color="statusColorMap[cluster.status]">
                  {{ statusTextMap[cluster.status] || cluster.status }}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="总节点数">
                {{ cluster.nodeCount }} 个节点
              </Descriptions.Item>
              <Descriptions.Item label="运行中的 Pod">
                {{ cluster.podCount }} 个 Pod
              </Descriptions.Item>
              <Descriptions.Item label="命名空间">
                {{ cluster.namespaceCount }} 个命名空间
              </Descriptions.Item>
              <Descriptions.Item label="Kubernetes 版本">
                {{ cluster.version }}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Tabs.TabPane>

        <!-- 连接信息标签页 -->
        <Tabs.TabPane key="connection" tab="连接信息">
          <div class="connection-info">
            <Card title="API Server 连接信息" size="small">
              <Descriptions :column="1" size="small">
                <Descriptions.Item label="API Server 地址">
                  <div class="api-server-container">
                    <code class="api-server-url">{{ cluster.apiServer }}</code>
                    <Button size="small" type="link" @click="copyApiServer">
                      复制
                    </Button>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="集群 ID">
                  {{ cluster.id }}
                </Descriptions.Item>
              </Descriptions>

              <div class="mt-4">
                <div class="mb-2 text-sm font-medium">连接示例</div>
                <div class="connection-example">
                  <pre><code>kubectl config set-cluster {{ cluster.name }} \
  --server={{ cluster.apiServer }} \
  --certificate-authority=/path/to/ca.crt

kubectl config set-context {{ cluster.name }} \
  --cluster={{ cluster.name }} \
  --user=admin

kubectl config use-context {{ cluster.name }}</code></pre>
                </div>
              </div>
            </Card>
          </div>
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
              <pre>{{ clusterYaml }}</pre>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div v-else class="empty-text">未选择 Cluster</div>
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

.api-server-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.api-server-url {
  flex: 1;
  padding: 4px 8px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  color: var(--vben-text-color);
  background-color: rgb(0 0 0 / 4%);
  border-radius: 4px;
}

html[data-theme='dark'] .api-server-url {
  background-color: rgb(255 255 255 / 8%);
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.connection-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.connection-example {
  padding: 12px;
  overflow-x: auto;
  background-color: var(--vben-background-color-deep);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.connection-example pre {
  margin: 0;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vben-text-color);
}

.connection-example code {
  color: var(--vben-text-color);
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

:deep(.ant-card) {
  background-color: var(--vben-background-color);
  border-color: var(--vben-border-color);
}

:deep(.ant-card-head) {
  border-color: var(--vben-border-color);
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  color: var(--vben-text-color-secondary);
}

:deep(.ant-statistic-content) {
  font-size: 28px;
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
