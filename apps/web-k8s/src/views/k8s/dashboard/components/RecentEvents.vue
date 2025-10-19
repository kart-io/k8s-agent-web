<script lang="ts" setup>
/**
 * 最近事件组件
 * 展示集群中最近发生的事件
 */
import type { Event, EventListParams } from '#/api/k8s/types';

import { computed, onMounted, ref } from 'vue';

import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue';
import { Card, Empty, List, message, Tag, Tooltip } from 'ant-design-vue';

import { eventApi } from '#/api/k8s';

// Props
const props = defineProps<{
  clusterId: string;
}>();

// 加载状态
const loading = ref(false);

// 事件列表
const events = ref<Event[]>([]);

/**
 * 加载最近事件
 */
async function loadRecentEvents() {
  loading.value = true;
  try {
    const params: EventListParams = {
      clusterId: props.clusterId,
      pageSize: 10,
      page: 1,
    };

    // 调用真实 API
    const result = await eventApi.list(params);
    events.value = result.items || [];
  } catch (error: any) {
    console.error('加载最近事件失败:', error);
    message.error(`加载最近事件失败: ${error.message || '未知错误'}`);
    events.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 获取事件类型颜色
 */
function getEventTypeColor(type: string): string {
  switch (type) {
    case 'Error': {
      return 'error';
    }
    case 'Normal': {
      return 'success';
    }
    case 'Warning': {
      return 'warning';
    }
    default: {
      return 'default';
    }
  }
}

/**
 * 获取事件类型图标
 */
function getEventTypeIcon(type: string) {
  switch (type) {
    case 'Error': {
      return ExclamationCircleOutlined;
    }
    case 'Normal': {
      return InfoCircleOutlined;
    }
    case 'Warning': {
      return WarningOutlined;
    }
    default: {
      return ClockCircleOutlined;
    }
  }
}

/**
 * 格式化时间为相对时间
 */
function formatRelativeTime(dateString: string): string {
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
function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 获取事件对象显示名称
 */
function getObjectName(event: Event): string {
  const kind = event.involvedObject?.kind || '未知';
  const name = event.involvedObject?.name || '未知';
  return `${kind}/${name}`;
}

/**
 * 是否有事件数据
 */
const hasEvents = computed(() => events.value.length > 0);

// 组件挂载时加载数据
onMounted(() => {
  loadRecentEvents();
});
</script>

<template>
  <Card
    class="recent-events-card"
    title="最近事件"
    :bordered="false"
    :loading="loading"
  >
    <template #extra>
      <ClockCircleOutlined style="color: var(--vben-text-color-secondary)" />
    </template>

    <div v-if="hasEvents" class="events-content">
      <List :data-source="events" :split="true">
        <template #renderItem="{ item: event }">
          <List.Item class="event-item">
            <div class="event-content">
              <div class="event-header">
                <div class="event-type">
                  <component
                    :is="getEventTypeIcon(event.type)"
                    class="event-icon"
                  />
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
                <div class="event-object">
                  <span class="event-label">对象:</span>
                  <code class="event-value">{{ getObjectName(event) }}</code>
                </div>
                <div v-if="event.reason" class="event-reason">
                  <span class="event-label">原因:</span>
                  <Tag color="blue" size="small">{{ event.reason }}</Tag>
                </div>
              </div>

              <div v-if="event.message" class="event-message">
                {{ event.message }}
              </div>

              <div v-if="event.metadata.namespace" class="event-namespace">
                <span class="namespace-label">命名空间:</span>
                <code class="namespace-value">{{
                  event.metadata.namespace
                }}</code>
              </div>
            </div>
          </List.Item>
        </template>
      </List>
    </div>

    <Empty
      v-else
      description="暂无最近事件"
      :image="Empty.PRESENTED_IMAGE_SIMPLE"
    />
  </Card>
</template>

<style scoped>
.recent-events-card {
  height: 100%;
  background-color: var(--vben-background-color);
}

.events-content {
  max-height: 600px;
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
  align-items: center;
  justify-content: space-between;
}

.event-type {
  display: flex;
  gap: 8px;
  align-items: center;
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

.event-object,
.event-reason,
.event-namespace {
  display: flex;
  gap: 6px;
  align-items: center;
}

.event-label,
.namespace-label {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.event-value,
.namespace-value {
  padding: 2px 6px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  color: var(--vben-text-color);
  background-color: rgb(0 0 0 / 4%);
  border-radius: 3px;
}

html[data-theme='dark'] .event-value,
html[data-theme='dark'] .namespace-value {
  background-color: rgb(255 255 255 / 8%);
}

.event-message {
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vben-text-color);
  background-color: rgb(24 144 255 / 5%);
  border-left: 3px solid var(--vben-primary-color);
  border-radius: 4px;
}

.event-namespace {
  margin-top: 4px;
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
