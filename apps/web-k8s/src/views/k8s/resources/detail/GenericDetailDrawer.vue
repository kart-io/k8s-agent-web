<script lang="ts" setup>
/**
 * 通用资源详情抽屉
 * 使用 Tab 展示不同维度的资源信息
 */
import { computed } from 'vue';

import { Descriptions, Drawer, TabPane, Tabs, Tag } from 'ant-design-vue';

import EventsTab from './EventsTab.vue';
import RelatedResourcesTab from './RelatedResourcesTab.vue';
import YAMLViewer from './YAMLViewer.vue';

interface Props {
  visible: boolean;
  resource: any;
  resourceType: string;
  resourceLabel: string;
  clusterId?: string;
  showEvents?: boolean;
  showRelatedResources?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  clusterId: 'default',
  showEvents: true,
  showRelatedResources: true,
});
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

// 格式化时间
function formatDateTime(timestamp: string) {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString('zh-CN');
}

// 获取标签数组
const labels = computed(() => {
  const labelsObj = props.resource?.metadata?.labels || {};
  return Object.entries(labelsObj).map(([key, value]) => ({
    key,
    value: value as string,
  }));
});

// 获取注解数组
const annotations = computed(() => {
  const annotationsObj = props.resource?.metadata?.annotations || {};
  return Object.entries(annotationsObj).map(([key, value]) => ({
    key,
    value: value as string,
  }));
});
</script>

<template>
  <Drawer
    :open="visible"
    :title="`${resourceLabel} 详情: ${resource?.metadata?.name}`"
    width="900"
    @close="emit('update:visible', false)"
  >
    <Tabs v-if="resource" default-active-key="overview">
      <!-- 概览 Tab -->
      <TabPane key="overview" tab="概览">
        <Descriptions bordered :column="2" size="small">
          <Descriptions.Item label="名称" :span="2">
            {{ resource.metadata?.name || '-' }}
          </Descriptions.Item>

          <Descriptions.Item
            v-if="resource.metadata?.namespace"
            label="命名空间"
            :span="2"
          >
            {{ resource.metadata.namespace }}
          </Descriptions.Item>

          <Descriptions.Item label="UID" :span="2">
            <code class="text-xs">{{ resource.metadata?.uid || '-' }}</code>
          </Descriptions.Item>

          <Descriptions.Item label="创建时间">
            {{ formatDateTime(resource.metadata?.creationTimestamp) }}
          </Descriptions.Item>

          <Descriptions.Item
            v-if="resource.metadata?.deletionTimestamp"
            label="删除时间"
          >
            {{ formatDateTime(resource.metadata.deletionTimestamp) }}
          </Descriptions.Item>

          <Descriptions.Item
            v-if="resource.spec?.replicas !== undefined"
            label="副本数"
          >
            {{ resource.spec.replicas }}
          </Descriptions.Item>

          <Descriptions.Item
            v-if="resource.status?.readyReplicas !== undefined"
            label="就绪副本"
          >
            {{ resource.status.readyReplicas ?? 0 }}
          </Descriptions.Item>

          <Descriptions.Item
            v-if="resource.status?.phase"
            label="状态"
            :span="2"
          >
            <Tag
              :color="
                resource.status.phase === 'Running' ||
                resource.status.phase === 'Active'
                  ? 'success'
                  : resource.status.phase === 'Pending'
                    ? 'warning'
                    : 'error'
              "
            >
              {{ resource.status.phase }}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <!-- 自定义概览内容插槽 -->
        <div v-if="$slots['overview-extra']" class="mt-4">
          <slot name="overview-extra" :resource="resource"></slot>
        </div>
      </TabPane>

      <!-- 元数据 Tab -->
      <TabPane key="metadata" tab="元数据">
        <div class="metadata-section">
          <h4>标签 (Labels)</h4>
          <div v-if="labels.length > 0" class="labels-container">
            <Tag v-for="item in labels" :key="item.key" color="blue">
              {{ item.key }}: {{ item.value }}
            </Tag>
          </div>
          <div v-else class="empty-state">无标签</div>

          <h4 class="mt-4">注解 (Annotations)</h4>
          <div v-if="annotations.length > 0" class="annotations-container">
            <Descriptions bordered :column="1" size="small">
              <Descriptions.Item
                v-for="item in annotations"
                :key="item.key"
                :label="item.key"
              >
                <code class="text-xs">{{ item.value }}</code>
              </Descriptions.Item>
            </Descriptions>
          </div>
          <div v-else class="empty-state">无注解</div>
        </div>
      </TabPane>

      <!-- YAML Tab -->
      <TabPane key="yaml" tab="YAML">
        <YAMLViewer :resource="resource" />
      </TabPane>

      <!-- 事件 Tab -->
      <TabPane v-if="showEvents" key="events" tab="事件">
        <EventsTab :resource="resource" :cluster-id="clusterId" />
      </TabPane>

      <!-- 关联资源 Tab -->
      <TabPane v-if="showRelatedResources" key="related" tab="关联资源">
        <RelatedResourcesTab
          :resource="resource"
          :resource-type="resourceType"
          :cluster-id="clusterId"
        />
      </TabPane>

      <!-- 自定义 Tab 插槽 -->
      <template v-if="$slots.tabs">
        <slot name="tabs" :resource="resource"></slot>
      </template>
    </Tabs>
  </Drawer>
</template>

<style scoped>
.metadata-section {
  padding: 16px 0;
}

.metadata-section h4 {
  margin-bottom: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.labels-container,
.annotations-container {
  margin-bottom: 16px;
}

.labels-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

code {
  padding: 2px 6px;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}
</style>
