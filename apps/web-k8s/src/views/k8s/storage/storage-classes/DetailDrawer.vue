<script lang="ts" setup>
/**
 * StorageClass 详情抽屉组件
 * 显示 StorageClass 的完整信息
 */
import type { StorageClass } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import {
  Button,
  Descriptions,
  Drawer,
  message,
  Tabs,
  Tag,
} from 'ant-design-vue';

interface DetailDrawerProps {
  visible: boolean;
  storageClass: StorageClass | null;
}

const props = withDefaults(defineProps<DetailDrawerProps>(), {
  visible: false,
  storageClass: null,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

// 当前激活的标签页
const activeTab = ref('basic');

/**
 * 格式化时间
 */
function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 是否为默认存储类
 */
const isDefaultClass = computed(() => {
  if (!props.storageClass?.metadata.annotations) return false;
  return (
    props.storageClass.metadata.annotations[
      'storageclass.kubernetes.io/is-default-class'
    ] === 'true'
  );
});

/**
 * 参数列表
 */
const parameters = computed(() => {
  if (!props.storageClass?.parameters) return [];
  return Object.entries(props.storageClass.parameters).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 标签数据
 */
const labels = computed(() => {
  if (!props.storageClass?.metadata.labels) return [];
  return Object.entries(props.storageClass.metadata.labels).map(
    ([key, value]) => ({
      key,
      value,
    }),
  );
});

/**
 * 注解数据
 */
const annotations = computed(() => {
  if (!props.storageClass?.metadata.annotations) return [];
  return Object.entries(props.storageClass.metadata.annotations).map(
    ([key, value]) => ({
      key,
      value,
    }),
  );
});

/**
 * 生成 YAML 格式的 StorageClass 配置
 */
const storageClassYaml = computed(() => {
  if (!props.storageClass) return '';

  const yamlObj = {
    apiVersion: props.storageClass.apiVersion,
    kind: props.storageClass.kind,
    metadata: props.storageClass.metadata,
    provisioner: props.storageClass.provisioner,
    parameters: props.storageClass.parameters,
    reclaimPolicy: props.storageClass.reclaimPolicy,
    mountOptions: props.storageClass.mountOptions,
    volumeBindingMode: props.storageClass.volumeBindingMode,
    allowVolumeExpansion: props.storageClass.allowVolumeExpansion,
    allowedTopologies: props.storageClass.allowedTopologies,
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
    await navigator.clipboard.writeText(storageClassYaml.value);
    message.success('YAML 已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

/**
 * 下载 YAML 文件
 */
function downloadYaml() {
  if (!props.storageClass) return;

  const blob = new Blob([storageClassYaml.value], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.storageClass.metadata.name}.yaml`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('YAML 文件已下载');
}

/**
 * 关闭抽屉
 */
function handleClose() {
  emit('update:visible', false);
  activeTab.value = 'basic';
}
</script>

<template>
  <Drawer
    :open="visible"
    :title="`StorageClass 详情 - ${storageClass?.metadata.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="storageClass" class="detail-drawer-content">
      <Tabs v-model:active-key="activeTab" type="card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="名称">
              {{ storageClass.metadata.name }}
              <Tag v-if="isDefaultClass" color="gold" class="ml-2">
                默认
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="UID">
              {{ storageClass.metadata.uid }}
            </Descriptions.Item>
            <Descriptions.Item label="Provisioner" :span="2">
              <Tag color="blue">
                {{ storageClass.provisioner }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="回收策略">
              <Tag
                :color="storageClass.reclaimPolicy === 'Retain' ? 'warning' : 'default'"
              >
                {{ storageClass.reclaimPolicy || 'Delete' }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="绑定模式">
              <Tag
                :color="
                  storageClass.volumeBindingMode === 'Immediate' ? 'blue' : 'cyan'
                "
              >
                {{ storageClass.volumeBindingMode || 'Immediate' }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="允许扩容">
              <Tag :color="storageClass.allowVolumeExpansion ? 'success' : 'default'">
                {{ storageClass.allowVolumeExpansion ? '是' : '否' }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="参数数量">
              {{ parameters.length }}
            </Descriptions.Item>
            <Descriptions.Item label="挂载选项数量">
              {{ storageClass.mountOptions?.length || 0 }}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" :span="2">
              {{ formatDateTime(storageClass.metadata.creationTimestamp) }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 参数配置标签页 -->
        <Tabs.TabPane key="parameters" tab="参数配置">
          <div v-if="parameters.length > 0" class="parameters-section">
            <div
              v-for="param in parameters"
              :key="param.key"
              class="parameter-item"
            >
              <div class="parameter-key">{{ param.key }}</div>
              <div class="parameter-value">{{ param.value }}</div>
            </div>
          </div>
          <div v-else class="empty-text">无参数配置</div>
        </Tabs.TabPane>

        <!-- 挂载选项标签页 -->
        <Tabs.TabPane key="mount-options" tab="挂载选项">
          <div
            v-if="storageClass.mountOptions && storageClass.mountOptions.length > 0"
            class="mount-options"
          >
            <Tag
              v-for="option in storageClass.mountOptions"
              :key="option"
              color="blue"
              class="option-tag"
            >
              {{ option }}
            </Tag>
          </div>
          <div v-else class="empty-text">无挂载选项</div>
        </Tabs.TabPane>

        <!-- 拓扑限制标签页 -->
        <Tabs.TabPane key="topologies" tab="拓扑限制">
          <div v-if="storageClass.allowedTopologies" class="topologies-section">
            <pre class="json-content">{{
              JSON.stringify(storageClass.allowedTopologies, null, 2)
            }}</pre>
          </div>
          <div v-else class="empty-text">无拓扑限制</div>
        </Tabs.TabPane>

        <!-- 使用统计标签页 -->
        <Tabs.TabPane key="stats" tab="使用统计">
          <a-alert
            message="使用统计"
            description="使用该存储类的 PV 和 PVC 统计（Mock 数据暂不支持此功能）"
            type="info"
            show-icon
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

        <!-- YAML 配置标签页 -->
        <Tabs.TabPane key="yaml" tab="YAML 配置">
          <div class="yaml-actions">
            <Button type="primary" size="small" @click="copyYaml">
              复制 YAML
            </Button>
            <Button size="small" @click="downloadYaml">
              下载 YAML
            </Button>
          </div>
          <div class="yaml-wrapper">
            <div class="yaml-content">
              <pre>{{ storageClassYaml }}</pre>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div v-else class="empty-text">未选择 StorageClass</div>
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

.parameters-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

.parameter-item {
  padding: 16px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
}

.parameter-key {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.parameter-value {
  padding: 8px 12px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  color: var(--vben-text-color-secondary);
  background-color: var(--vben-background-color-deep);
  border-radius: 4px;
}

.mount-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.option-tag {
  padding: 8px 16px;
  font-size: 13px;
}

.topologies-section {
  padding: 16px;
}

.json-content {
  padding: 16px;
  margin: 0;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--vben-text-color);
  background-color: var(--vben-background-color-deep);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
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

html[data-theme='dark'] .yaml-content {
  border-color: #fff !important;
}

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

.ml-2 {
  margin-left: 8px;
}
</style>
