<script lang="ts" setup>
/**
 * DaemonSet 详情抽屉组件
 * 显示 DaemonSet 的完整信息
 */
import type { DaemonSet } from '#/api/k8s/types';

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
import * as yaml from 'js-yaml';

interface DetailDrawerProps {
  visible?: boolean;
  daemonSet?: DaemonSet | null;
}

const props = withDefaults(defineProps<DetailDrawerProps>(), {
  visible: false,
  daemonSet: null,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

// 当前激活的标签页
const activeTab = ref('basic');

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
 * 标签数据
 */
const labels = computed(() => {
  if (!props.daemonSet?.metadata.labels) return [];
  return Object.entries(props.daemonSet.metadata.labels).map(
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
  if (!props.daemonSet?.metadata.annotations) return [];
  return Object.entries(props.daemonSet.metadata.annotations).map(
    ([key, value]) => ({
      key,
      value,
    }),
  );
});

/**
 * 选择器数据
 */
const selectors = computed(() => {
  if (!props.daemonSet?.spec.selector.matchLabels) return [];
  return Object.entries(props.daemonSet.spec.selector.matchLabels).map(
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
 * 生成 YAML 格式的 DaemonSet 配置
 */
const daemonSetYaml = computed(() => {
  if (!props.daemonSet) return '';

  const yamlObj = {
    apiVersion: props.daemonSet.apiVersion,
    kind: props.daemonSet.kind,
    metadata: props.daemonSet.metadata,
    spec: props.daemonSet.spec,
    status: props.daemonSet.status,
  };

  return yaml.dump(yamlObj, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  });
});

/**
 * 复制 YAML 到剪贴板
 */
async function copyYaml() {
  try {
    await navigator.clipboard.writeText(daemonSetYaml.value);
    message.success('YAML 已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

/**
 * 下载 YAML 文件
 */
function downloadYaml() {
  if (!props.daemonSet) return;

  const blob = new Blob([daemonSetYaml.value], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.daemonSet.metadata.name}.yaml`;
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
    :title="`DaemonSet 详情 - ${daemonSet?.metadata.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="daemonSet" class="detail-drawer-content">
      <Tabs v-model:active-key="activeTab" type="card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="名称">
              {{ daemonSet.metadata.name }}
            </Descriptions.Item>
            <Descriptions.Item label="命名空间">
              {{ daemonSet.metadata.namespace }}
            </Descriptions.Item>
            <Descriptions.Item label="期望节点数">
              <Tag color="blue">
                {{ daemonSet.status.desiredNumberScheduled }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="当前调度数">
              <Tag color="blue">
                {{ daemonSet.status.currentNumberScheduled }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="就绪节点数">
              <Tag
                :color="
                  daemonSet.status.numberReady ===
                  daemonSet.status.desiredNumberScheduled
                    ? 'success'
                    : 'warning'
                "
              >
                {{ daemonSet.status.numberReady }}/{{
                  daemonSet.status.desiredNumberScheduled
                }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="可用节点数">
              {{ daemonSet.status.numberAvailable ?? 0 }}
            </Descriptions.Item>
            <Descriptions.Item label="不可用节点数">
              {{ daemonSet.status.numberUnavailable ?? 0 }}
            </Descriptions.Item>
            <Descriptions.Item label="错配调度数">
              {{ daemonSet.status.numberMisscheduled ?? 0 }}
            </Descriptions.Item>
            <Descriptions.Item label="UID">
              {{ daemonSet.metadata.uid }}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" :span="2">
              {{ formatDateTime(daemonSet.metadata.creationTimestamp) }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 容器规格标签页 -->
        <Tabs.TabPane key="containers" tab="容器规格">
          <Table
            :columns="containerColumns"
            :data-source="daemonSet.spec.template.spec.containers"
            :pagination="false"
            size="small"
            :row-key="(record: any) => record.name"
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

        <!-- 条件标签页 -->
        <Tabs.TabPane key="conditions" tab="条件">
          <Table
            :columns="[
              { title: '类型', dataIndex: 'type', key: 'type', width: 150 },
              { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
              {
                title: '最后更新时间',
                dataIndex: 'lastUpdateTime',
                key: 'lastUpdateTime',
                width: 180,
                customRender: ({ text }: any) => formatDateTime(text),
              },
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
            :data-source="daemonSet.status?.conditions || []"
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
              <pre>{{ daemonSetYaml }}</pre>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div v-else class="empty-text">未选择 DaemonSet</div>
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
