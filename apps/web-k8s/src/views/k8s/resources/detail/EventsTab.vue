<script lang="ts" setup>
/**
 * 资源事件标签页组件
 * 显示与特定资源相关的 Kubernetes 事件
 */
import type { K8sEvent } from '#/api/k8s/types';

import { computed, onMounted, ref, watch } from 'vue';

import { Empty, List, message, Tag, Tooltip } from 'ant-design-vue';
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue';

import { getMockEventList } from '#/api/k8s/mock';

interface Props {
  resource: any;
  clusterId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  clusterId: 'default',
});

const loading = ref(false);
const events = ref<K8sEvent[]>([]);

/**
 * 加载资源相关事件
 */
async function loadEvents() {
  if (!props.resource?.metadata) {
    return;
  }

  loading.value = true;
  try {
    const result = getMockEventList({
      clusterId: props.clusterId,
      namespace: props.resource.metadata.namespace,
      involvedObjectKind: props.resource.kind,
      involvedObjectName: props.resource.metadata.name,
      pageSize: 50,
      page: 1,
    });
    events.value = result.items;
  } catch (error: any) {
    message.error(`加载事件失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
}

/**
 * 获取事件类型颜色
 */
function getEventTypeColor(type: string): string {
  switch (type) {
    case 'Normal':
      return 'success';
    case 'Warning':
      return 'warning';
    default:
      return 'default';
  }
}

/**
 * 获取事件类型图标
 */
function getEventTypeIcon(type: string) {
  switch (type) {
    case 'Normal':
      return InfoCircleOutlined;
    case 'Warning':
      return WarningOutlined;
    default:
      return ClockCircleOutlined;
  }
}

/**
 * 格式化时间为相对时间
 */
function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return `刚刚`;
}

/**
 * 格式化完整时间
 */
function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 是否有事件数据
 */
const hasEvents = computed(() => events.value.length > 0);

// 监听资源变化
watch(
  () => props.resource,
  () => {
    loadEvents();
  },
  { immediate: true },
);

// 组件挂载时加载数据
onMounted(() => {
  loadEvents();
});
</script>

<template>
  <div class="events-tab">
    <div v-if="hasEvents" class="events-content" v-loading="loading">
      <List :data-source="events" :split="true">
        <template #renderItem="{ item: event }">
          <List.Item class="event-item">
            <div class="event-content">
              <div class="event-header">
                <div class="event-type">
                  <component :is="getEventTypeIcon(event.type)" class="event-icon" />
                  <Tag :color="getEventTypeColor(event.type)">
                    {{ event.type }}
                  </Tag>
                </div>
                <Tooltip :title="formatDateTime(event.lastTimestamp)">
                  <span class="event-time">
                    {{ formatRelativeTime(event.lastTimestamp) }}
                  </span>
                </Tooltip>
              </div>

              <div class="event-details">
                <div v-if="event.reason" class="event-reason">
                  <span class="event-label">原因:</span>
                  <Tag color="blue" size="small">{{ event.reason }}</Tag>
                </div>
                <div v-if="event.count && event.count > 1" class="event-count">
                  <span class="event-label">次数:</span>
                  <Tag color="orange" size="small">{{ event.count }}</Tag>
                </div>
              </div>

              <div v-if="event.message" class="event-message">
                {{ event.message }}
              </div>

              <div v-if="event.source" class="event-source">
                <span class="source-label">来源:</span>
                <code class="source-value">
                  {{ event.source.component || '-' }}
                  <template v-if="event.source.host">({{ event.source.host }})</template>
                </code>
              </div>
            </div>
          </List.Item>
        </template>
      </List>
    </div>

    <Empty
      v-else-if="!loading"
      description="该资源暂无相关事件"
      :image="Empty.PRESENTED_IMAGE_SIMPLE"
    />

    <div v-if="loading && !hasEvents" class="loading-placeholder">
      <ClockCircleOutlined spin style="font-size: 24px; color: var(--vben-primary-color);" />
      <p>加载事件中...</p>
    </div>
  </div>
</template>

<style scoped>
.events-tab {
  padding: 16px;
  min-height: 300px;
}

.events-content {
  max-height: 500px;
  overflow-y: auto;
}

.event-item {
  padding: 12px 0;
  transition: background-color 0.3s ease;
}

.event-item:hover {
  background-color: rgb(0 0 0 / 2%);
}

html[data-theme='dark'] .event-item:hover {
  background-color: rgb(255 255 255 / 2%);
}

.event-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-icon {
  font-size: 16px;
}

.event-time {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.event-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.event-reason,
.event-count,
.event-source {
  display: flex;
  align-items: center;
  gap: 6px;
}

.event-label,
.source-label {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.source-value {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  color: var(--vben-text-color);
  padding: 2px 6px;
  border-radius: 3px;
  background-color: rgb(0 0 0 / 4%);
}

html[data-theme='dark'] .source-value {
  background-color: rgb(255 255 255 / 8%);
}

.event-message {
  font-size: 13px;
  line-height: 1.6;
  color: var(--vben-text-color);
  padding: 8px 12px;
  border-left: 3px solid var(--vben-primary-color);
  background-color: rgb(24 144 255 / 5%);
  border-radius: 4px;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
  color: var(--vben-text-color-secondary);
}

/* 滚动条样式 */
.events-content::-webkit-scrollbar {
  width: 6px;
}

.events-content::-webkit-scrollbar-track {
  background: var(--vben-background-color);
}

.events-content::-webkit-scrollbar-thumb {
  background: var(--vben-border-color);
  border-radius: 3px;
}

.events-content::-webkit-scrollbar-thumb:hover {
  background: var(--vben-text-color-secondary);
}
</style>
