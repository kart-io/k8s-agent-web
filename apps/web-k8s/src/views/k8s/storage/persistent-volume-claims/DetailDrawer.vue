<script lang="ts" setup>
/**
 * PersistentVolumeClaim 详情抽屉组件
 * 显示 PersistentVolumeClaim 的完整信息
 */
import type { PersistentVolumeClaim } from '#/api/k8s/types';

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
  pvc: PersistentVolumeClaim | null;
}

const props = withDefaults(defineProps<DetailDrawerProps>(), {
  visible: false,
  pvc: null,
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
 * 格式化访问模式
 */
function formatAccessMode(mode: string): string {
  const modeMap: Record<string, string> = {
    'ReadWriteOnce': 'RWO (ReadWriteOnce)',
    'ReadOnlyMany': 'ROX (ReadOnlyMany)',
    'ReadWriteMany': 'RWX (ReadWriteMany)',
    'ReadWriteOncePod': 'RWOP (ReadWriteOncePod)',
  };
  return modeMap[mode] || mode;
}

/**
 * 标签数据
 */
const labels = computed(() => {
  if (!props.pvc?.metadata.labels) return [];
  return Object.entries(props.pvc.metadata.labels).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 注解数据
 */
const annotations = computed(() => {
  if (!props.pvc?.metadata.annotations) return [];
  return Object.entries(props.pvc.metadata.annotations).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 条件表格列定义
 */
const conditionColumns = [
  { title: '类型', dataIndex: 'type', key: 'type', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  {
    title: '最后转换时间',
    dataIndex: 'lastTransitionTime',
    key: 'lastTransitionTime',
    width: 180,
    customRender: ({ text }: any) => formatDateTime(text),
  },
  { title: '原因', dataIndex: 'reason', key: 'reason', width: 150 },
  { title: '消息', dataIndex: 'message', key: 'message' },
];

/**
 * 生成 YAML 格式的 PVC 配置
 */
const pvcYaml = computed(() => {
  if (!props.pvc) return '';

  const yamlObj = {
    apiVersion: props.pvc.apiVersion,
    kind: props.pvc.kind,
    metadata: props.pvc.metadata,
    spec: props.pvc.spec,
    status: props.pvc.status,
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
    await navigator.clipboard.writeText(pvcYaml.value);
    message.success('YAML 已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

/**
 * 下载 YAML 文件
 */
function downloadYaml() {
  if (!props.pvc) return;

  const blob = new Blob([pvcYaml.value], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.pvc.metadata.name}.yaml`;
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
    :title="`PersistentVolumeClaim 详情 - ${pvc?.metadata.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="pvc" class="detail-drawer-content">
      <Tabs v-model:active-key="activeTab" type="card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="名称">
              {{ pvc.metadata.name }}
            </Descriptions.Item>
            <Descriptions.Item label="命名空间">
              {{ pvc.metadata.namespace }}
            </Descriptions.Item>
            <Descriptions.Item label="UID" :span="2">
              {{ pvc.metadata.uid }}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag
                :color="
                  pvc.status?.phase === 'Bound'
                    ? 'success'
                    : pvc.status?.phase === 'Pending'
                      ? 'warning'
                      : 'error'
                "
              >
                {{ pvc.status?.phase }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="绑定的 PV">
              {{ pvc.spec.volumeName || '未绑定' }}
            </Descriptions.Item>
            <Descriptions.Item label="请求容量">
              <Tag color="blue">
                {{ pvc.spec.resources.requests.storage }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="实际容量">
              <Tag v-if="pvc.status?.capacity?.storage" color="green">
                {{ pvc.status.capacity.storage }}
              </Tag>
              <span v-else class="text-gray-400">-</span>
            </Descriptions.Item>
            <Descriptions.Item label="存储类">
              {{ pvc.spec.storageClassName || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="访问模式">
              <div class="access-modes">
                <Tag
                  v-for="mode in pvc.spec.accessModes"
                  :key="mode"
                  color="blue"
                  size="small"
                >
                  {{ formatAccessMode(mode) }}
                </Tag>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="卷模式">
              {{ pvc.spec.volumeMode || 'Filesystem' }}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" :span="2">
              {{ formatDateTime(pvc.metadata.creationTimestamp) }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 规格配置标签页 -->
        <Tabs.TabPane key="spec" tab="规格配置">
          <div class="spec-section">
            <h4 class="section-title">资源请求</h4>
            <Descriptions :column="2" bordered size="small">
              <Descriptions.Item label="请求存储">
                {{ pvc.spec.resources.requests.storage }}
              </Descriptions.Item>
              <Descriptions.Item label="限制存储">
                {{ pvc.spec.resources.limits?.storage || '-' }}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div v-if="pvc.spec.selector" class="spec-section">
            <h4 class="section-title">选择器</h4>
            <pre class="json-content">{{ JSON.stringify(pvc.spec.selector, null, 2) }}</pre>
          </div>

          <div v-if="pvc.spec.dataSource" class="spec-section">
            <h4 class="section-title">数据源</h4>
            <Descriptions :column="2" bordered size="small">
              <Descriptions.Item label="类型">
                {{ pvc.spec.dataSource.kind }}
              </Descriptions.Item>
              <Descriptions.Item label="名称">
                {{ pvc.spec.dataSource.name }}
              </Descriptions.Item>
              <Descriptions.Item v-if="pvc.spec.dataSource.apiGroup" label="API 组" :span="2">
                {{ pvc.spec.dataSource.apiGroup }}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Tabs.TabPane>

        <!-- 使用情况标签页 -->
        <Tabs.TabPane key="usage" tab="使用情况">
          <a-alert
            message="Pod 使用情况"
            description="此 PVC 当前未被任何 Pod 使用（Mock 数据暂不支持此功能）"
            type="info"
            show-icon
          />
        </Tabs.TabPane>

        <!-- 绑定的 PV 标签页 -->
        <Tabs.TabPane key="bound-pv" tab="绑定的 PV">
          <div v-if="pvc.spec.volumeName" class="binding-section">
            <a-alert
              message="已绑定"
              :description="`此 PVC 已绑定到 PV: ${pvc.spec.volumeName}`"
              type="success"
              show-icon
            />

            <div class="pv-info">
              <Descriptions :column="2" bordered size="small">
                <Descriptions.Item label="PV 名称">
                  {{ pvc.spec.volumeName }}
                </Descriptions.Item>
                <Descriptions.Item label="实际容量">
                  {{ pvc.status?.capacity?.storage || '-' }}
                </Descriptions.Item>
                <Descriptions.Item v-if="pvc.status?.accessModes" label="访问模式" :span="2">
                  <div class="access-modes">
                    <Tag
                      v-for="mode in pvc.status.accessModes"
                      :key="mode"
                      color="blue"
                      size="small"
                    >
                      {{ formatAccessMode(mode) }}
                    </Tag>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
          <div v-else class="binding-section">
            <a-alert
              message="未绑定"
              description="此 PVC 尚未绑定到任何 PV"
              type="warning"
              show-icon
            />
          </div>
        </Tabs.TabPane>

        <!-- 条件标签页 -->
        <Tabs.TabPane key="conditions" tab="条件">
          <Table
            v-if="pvc.status?.conditions && pvc.status.conditions.length > 0"
            :columns="conditionColumns"
            :data-source="pvc.status.conditions"
            :pagination="false"
            size="small"
            :row-key="(record: any) => record.type"
          />
          <div v-else class="empty-text">无条件信息</div>
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
              <pre>{{ pvcYaml }}</pre>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div v-else class="empty-text">未选择 PersistentVolumeClaim</div>
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

.access-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.spec-section {
  margin-bottom: 24px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.json-content {
  padding: 12px;
  margin: 0;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--vben-text-color);
  background-color: var(--vben-background-color-deep);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.binding-section {
  padding: 16px 0;
}

.pv-info {
  margin-top: 16px;
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
</style>
