<script lang="ts" setup>
/**
 * Kubernetes Events 列表页面
 * 以时间线形式展示集群事件，支持筛选和分页
 */
import type { EventListParams, K8sEvent } from '#/api/k8s/types';

import { computed, onMounted, ref } from 'vue';

import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Input,
  message,
  Pagination,
  Select,
  Tag,
  Timeline,
} from 'ant-design-vue';

import { getMockEventList } from '#/api/k8s/mock';

// 当前选中的集群ID（暂时使用固定值）
const currentClusterId = ref('cluster-production-01');

// 加载状态
const loading = ref(false);

// Events 数据
const events = ref<K8sEvent[]>([]);
const total = ref(0);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(20);

// 筛选参数
const filters = ref<{
  involvedObjectKind?: string;
  involvedObjectName?: string;
  namespace?: string;
  type?: '' | 'Normal' | 'Warning';
}>({
  namespace: undefined,
  type: '',
  involvedObjectKind: undefined,
  involvedObjectName: undefined,
});

// 资源类型选项
const resourceKindOptions = [
  { label: '全部资源', value: undefined },
  { label: 'Pod', value: 'Pod' },
  { label: 'Deployment', value: 'Deployment' },
  { label: 'Service', value: 'Service' },
  { label: 'Node', value: 'Node' },
  { label: 'PersistentVolumeClaim', value: 'PersistentVolumeClaim' },
  { label: 'Ingress', value: 'Ingress' },
];

// 事件类型选项
const eventTypeOptions = [
  { label: '全部类型', value: '' },
  { label: 'Normal', value: 'Normal' },
  { label: 'Warning', value: 'Warning' },
];

// 命名空间选项（简化示例，实际应从API获取）
const namespaceOptions = computed(() => [
  { label: '全部命名空间', value: undefined },
  { label: 'default', value: 'default' },
  { label: 'production', value: 'production' },
  { label: 'staging', value: 'staging' },
  { label: 'development', value: 'development' },
  { label: 'kube-system', value: 'kube-system' },
]);

/**
 * 加载 Events 列表
 */
async function loadEvents() {
  loading.value = true;
  try {
    const params: EventListParams = {
      clusterId: currentClusterId.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filters.value,
    };

    const result = getMockEventList(params);
    events.value = result.items;
    total.value = result.total;
  } catch (error: any) {
    message.error(`加载 Events 失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
}

/**
 * 格式化时间为相对时间
 */
function formatRelativeTime(dateString?: string): string {
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
  return `${seconds}秒前`;
}

/**
 * 格式化完整时间
 */
function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 获取事件类型的颜色
 */
function getEventTypeColor(type: string): string {
  return type === 'Warning' ? 'red' : 'green';
}

/**
 * 获取事件类型的图标
 */
function getEventTypeIcon(type: string) {
  return type === 'Warning' ? ExclamationCircleOutlined : InfoCircleOutlined;
}

/**
 * 处理筛选变化
 */
function handleFilterChange() {
  currentPage.value = 1;
  loadEvents();
}

/**
 * 处理分页变化
 */
function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  loadEvents();
}

/**
 * 重置筛选
 */
function resetFilters() {
  filters.value = {
    namespace: undefined,
    type: '',
    involvedObjectKind: undefined,
    involvedObjectName: undefined,
  };
  currentPage.value = 1;
  loadEvents();
}

// 组件挂载时加载数据
onMounted(() => {
  loadEvents();
});
</script>

<template>
  <div class="events-container">
    <!-- 筛选区域 -->
    <Card class="filter-card" :bordered="false">
      <div class="filter-container">
        <div class="filter-item">
          <span class="filter-label">命名空间:</span>
          <Select
            v-model:value="filters.namespace"
            :options="namespaceOptions"
            placeholder="选择命名空间"
            class="filter-select"
          />
        </div>

        <div class="filter-item">
          <span class="filter-label">事件类型:</span>
          <Select
            v-model:value="filters.type"
            :options="eventTypeOptions"
            placeholder="全部类型"
            class="filter-select"
          />
        </div>

        <div class="filter-item">
          <span class="filter-label">资源类型:</span>
          <Select
            v-model:value="filters.involvedObjectKind"
            :options="resourceKindOptions"
            placeholder="选择资源类型"
            class="filter-select"
          />
        </div>

        <div class="filter-item">
          <span class="filter-label">资源名称:</span>
          <Input
            v-model:value="filters.involvedObjectName"
            placeholder="输入资源名称搜索"
            class="filter-input"
            allow-clear
            @press-enter="handleFilterChange"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </Input>
        </div>

        <div class="filter-actions">
          <Button type="primary" @click="handleFilterChange">
            <SearchOutlined />
            搜索
          </Button>
          <Button @click="resetFilters"> 重置筛选 </Button>
        </div>
      </div>
    </Card>

    <!-- 事件列表 -->
    <Card class="events-card" :bordered="false" :loading="loading">
      <template #title>
        <div class="card-title">
          <ClockCircleOutlined class="title-icon" />
          <span>集群事件 ({{ total }})</span>
        </div>
      </template>

      <div v-if="events.length > 0" class="events-list">
        <Timeline>
          <Timeline.Item
            v-for="event in events"
            :key="event.metadata.uid"
            :color="getEventTypeColor(event.type)"
          >
            <template #dot>
              <component
                :is="getEventTypeIcon(event.type)"
                :style="{
                  fontSize: '16px',
                  color: event.type === 'Warning' ? '#ff4d4f' : '#52c41a',
                }"
              />
            </template>

            <div class="event-item">
              <div class="event-header">
                <div class="event-meta">
                  <Tag
                    :color="getEventTypeColor(event.type)"
                    class="event-type-tag"
                  >
                    {{ event.type }}
                  </Tag>
                  <span
                    class="event-time"
                    :title="formatDateTime(event.lastTimestamp)"
                  >
                    {{
                      formatRelativeTime(
                        event.lastTimestamp || event.firstTimestamp,
                      )
                    }}
                  </span>
                  <span
                    v-if="event.count && event.count > 1"
                    class="event-count"
                  >
                    ({{ event.count }}次)
                  </span>
                </div>
                <div class="event-resource">
                  <Tag color="blue">{{ event.involvedObject.kind }}</Tag>
                  <span class="resource-name">
                    {{
                      event.involvedObject.namespace
                        ? `${event.involvedObject.namespace}/`
                        : ''
                    }}{{ event.involvedObject.name }}
                  </span>
                </div>
              </div>

              <div class="event-reason">
                <strong>{{ event.reason }}</strong>
              </div>

              <div class="event-message">
                {{ event.message }}
              </div>

              <div class="event-source">
                <span class="source-label">来源:</span>
                <span class="source-value">{{ event.source.component }}</span>
                <!-- eslint-disable vue/html-closing-bracket-newline -->
                <span v-if="event.source.host" class="source-host"
                  >@ {{ event.source.host }}</span
                >
                <!-- eslint-enable vue/html-closing-bracket-newline -->
              </div>
            </div>
          </Timeline.Item>
        </Timeline>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <ClockCircleOutlined />
        </div>
        <div class="empty-text">暂无事件</div>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-wrapper">
        <Pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :show-size-changer="true"
          :show-total="(total) => `共 ${total} 条`"
          :page-size-options="['10', '20', '50', '100']"
          @change="handlePageChange"
        />
      </div>
    </Card>
  </div>
</template>

<style scoped>
/* 响应式布局 */
@media (max-width: 1400px) {
  .filter-actions {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .filter-item {
    flex: 1 1 100%;
  }

  .filter-select,
  .filter-input {
    flex: 1;
    width: auto;
  }

  .filter-actions {
    flex: 1 1 100%;
    justify-content: flex-start;
  }
}

.events-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.filter-card {
  background-color: var(--vben-background-color);
}

.filter-card :deep(.ant-card-body) {
  padding: 16px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  align-items: center;
}

.filter-item {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.filter-label {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--vben-text-color);
  white-space: nowrap;
}

.filter-select,
.filter-input {
  width: 200px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.events-card {
  flex: 1;
  background-color: var(--vben-background-color);
}

.events-card :deep(.ant-card-body) {
  padding: 16px;
}

.events-card :deep(.ant-card-head) {
  min-height: 48px;
  padding: 0 16px;
}

.card-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.title-icon {
  font-size: 18px;
  color: var(--vben-primary-color);
}

.events-list {
  padding: 8px 0;
}

.event-item {
  padding: 10px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.event-item:hover {
  border-color: var(--vben-primary-color);
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.event-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.event-type-tag {
  font-weight: 600;
}

.event-time {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.event-count {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.event-resource {
  display: flex;
  gap: 8px;
  align-items: center;
}

.resource-name {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  color: var(--vben-text-color);
}

.event-reason {
  margin-bottom: 6px;
  font-size: 14px;
  color: var(--vben-text-color);
}

.event-message {
  padding: 6px 8px;
  margin-bottom: 6px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vben-text-color-secondary);
  background-color: rgb(0 0 0 / 2%);
  border-radius: 4px;
}

html[data-theme='dark'] .event-message {
  background-color: rgb(255 255 255 / 5%);
}

.event-source {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.source-label {
  font-weight: 500;
}

.source-value {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
}

.source-host {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: var(--vben-text-color-secondary);
}

.empty-icon {
  margin-bottom: 16px;
  font-size: 64px;
  opacity: 0.3;
}

.empty-text {
  font-size: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid var(--vben-border-color);
}

/* Timeline 样式调整 */
:deep(.ant-timeline-item-tail) {
  border-left: 2px solid var(--vben-border-color);
}

:deep(.ant-timeline-item-head) {
  background-color: transparent;
  border: none;
}

:deep(.ant-timeline-item-content) {
  margin-left: 20px;
}
</style>
