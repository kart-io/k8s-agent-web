<script lang="ts" setup>
/**
 * Kubernetes Events 列表页面
 * 以时间线形式展示集群事件，支持筛选和分页
 * Updated: 2025-10-19
 */
import type { EventListParams, K8sEvent } from '#/api/k8s/types';

import { onMounted, ref, watch } from 'vue';

import {
  ClockCircleOutlined,
  RobotOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Drawer,
  Input,
  message,
  Pagination,
  Select,
  Spin,
} from 'ant-design-vue';

import { eventApi } from '#/api/k8s';
import { useClusterOptions } from '#/composables/useClusterOptions';
import { useNamespaceOptions } from '#/stores/namespaceStore';

// 使用集群选择器 composable
const { clusterOptions, selectedClusterId } = useClusterOptions();

// 使用命名空间选择器 composable
const { namespaceOptions } = useNamespaceOptions();

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
  reason?: string;
  type?: '' | 'Error' | 'Normal' | 'Warning';
}>({
  namespace: undefined,
  type: '',
  involvedObjectKind: undefined,
  involvedObjectName: undefined,
  reason: undefined,
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
  { label: 'ReplicaSet', value: 'ReplicaSet' },
  { label: 'StatefulSet', value: 'StatefulSet' },
  { label: 'DaemonSet', value: 'DaemonSet' },
  { label: 'Job', value: 'Job' },
  { label: 'CronJob', value: 'CronJob' },
];

// 事件类型选项
const eventTypeOptions = [
  { label: '全部类型', value: '' },
  { label: 'Normal', value: 'Normal' },
  { label: 'Warning', value: 'Warning' },
  { label: 'Error', value: 'Error' },
];

// 事件原因选项 (常见的 K8s 事件 Reason)
const eventReasonOptions = [
  { label: '全部原因', value: undefined },
  // Pod 相关事件
  { label: 'Scheduled - 调度成功', value: 'Scheduled' },
  { label: 'Pulling - 拉取镜像', value: 'Pulling' },
  { label: 'Pulled - 镜像拉取完成', value: 'Pulled' },
  { label: 'Created - 容器创建', value: 'Created' },
  { label: 'Started - 容器启动', value: 'Started' },
  { label: 'Killing - 容器终止中', value: 'Killing' },
  { label: 'BackOff - 重启退避', value: 'BackOff' },
  // 错误相关事件
  { label: 'Failed - 失败', value: 'Failed' },
  { label: 'FailedScheduling - 调度失败', value: 'FailedScheduling' },
  { label: 'FailedCreate - 创建失败', value: 'FailedCreate' },
  { label: 'FailedMount - 挂载失败', value: 'FailedMount' },
  { label: 'FailedAttachVolume - 卷附加失败', value: 'FailedAttachVolume' },
  { label: 'FailedBinding - 绑定失败', value: 'FailedBinding' },
  // 镜像相关事件
  { label: 'ErrImagePull - 镜像拉取错误', value: 'ErrImagePull' },
  { label: 'ImagePullBackOff - 镜像拉取退避', value: 'ImagePullBackOff' },
  { label: 'ErrImageNeverPull - 不拉取镜像', value: 'ErrImageNeverPull' },
  // 容器相关事件
  { label: 'Unhealthy - 健康检查失败', value: 'Unhealthy' },
  { label: 'ProbeWarning - 探针警告', value: 'ProbeWarning' },
  { label: 'Rescheduled - 重新调度', value: 'Rescheduled' },
  // 节点相关事件
  { label: 'NodeNotReady - 节点未就绪', value: 'NodeNotReady' },
  { label: 'NodeReady - 节点就绪', value: 'NodeReady' },
  { label: 'Starting - 启动中', value: 'Starting' },
  { label: 'KubeletSetup - Kubelet 设置', value: 'KubeletSetup' },
  // 资源相关事件
  { label: 'SuccessfulCreate - 创建成功', value: 'SuccessfulCreate' },
  { label: 'SuccessfulDelete - 删除成功', value: 'SuccessfulDelete' },
  { label: 'ScalingReplicaSet - 扩缩容', value: 'ScalingReplicaSet' },
  { label: 'Killing - 终止', value: 'Killing' },
];

// AI 分析相关状态
const aiAnalysisVisible = ref(false);
const aiAnalysisLoading = ref(false);
const aiAnalysisResult = ref('');
const analyzingEvent = ref<K8sEvent | null>(null);

/**
 * 加载 Events 列表
 */
async function loadEvents() {
  // 如果没有选中集群，不加载数据
  if (!selectedClusterId.value) {
    events.value = [];
    total.value = 0;
    return;
  }

  loading.value = true;
  try {
    const params: EventListParams = {
      clusterId: selectedClusterId.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filters.value,
    };

    const result = await eventApi.list(params);
    events.value = result.items || [];
    total.value = result.total || 0;
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
    reason: undefined,
  };
  currentPage.value = 1;
  loadEvents();
}

/**
 * 判断事件是否可以进行 AI 分析
 */
function canAnalyze(event: K8sEvent): boolean {
  return event.type === 'Warning' || event.type === 'Error';
}

/**
 * 分析事件
 */
async function analyzeEvent(event: K8sEvent) {
  analyzingEvent.value = event;
  aiAnalysisVisible.value = true;
  aiAnalysisLoading.value = true;
  aiAnalysisResult.value = '';

  try {
    // 构建分析请求数据
    const eventData = {
      type: event.type,
      reason: event.reason,
      message: event.message,
      involvedObject: {
        kind: event.involvedObject.kind,
        namespace: event.involvedObject.namespace,
        name: event.involvedObject.name,
      },
      source: {
        component: event.source.component,
      },
      lastTimestamp: event.lastTimestamp || event.firstTimestamp,
      count: event.count,
    };

    // 调用 AI 分析接口
    const response = await eventApi.analyzeEvent(
      selectedClusterId.value,
      eventData,
    );
    // 响应格式：{ code: 0, message: "success", data: { analysis, rootCause, ... } }
    aiAnalysisResult.value = response.data?.analysis || response.analysis;
  } catch (error: any) {
    message.error(`AI 分析失败: ${error.message}`);
    aiAnalysisVisible.value = false;
  } finally {
    aiAnalysisLoading.value = false;
  }
}

/**
 * 关闭 AI 分析抽屉
 */
function closeAiAnalysis() {
  aiAnalysisVisible.value = false;
  aiAnalysisResult.value = '';
  analyzingEvent.value = null;
}

// 监听集群切换，重新加载数据
watch(selectedClusterId, () => {
  currentPage.value = 1;
  loadEvents();
});

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
          <span class="filter-label">集群:</span>
          <Select
            v-model:value="selectedClusterId"
            :options="clusterOptions"
            placeholder="选择集群"
            class="filter-select"
          />
        </div>

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
          <span class="filter-label">事件原因:</span>
          <Select
            v-model:value="filters.reason"
            :options="eventReasonOptions"
            placeholder="全部原因"
            class="filter-select"
            show-search
            :filter-option="
              (input, option) => {
                return option.label.toLowerCase().includes(input.toLowerCase());
              }
            "
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
          <span>集群事件 ({{ total }}) - 已更新</span>
        </div>
      </template>

      <div v-if="events.length > 0" class="events-list">
        <div
          v-for="event in events"
          :key="event.metadata.uid"
          class="event-item"
        >
          <div class="event-header">
            <div class="event-meta">
              <span
                class="event-type"
                :class="[`type-${event.type.toLowerCase()}`]"
              >
                [{{ event.type.toUpperCase() }}]
              </span>
              <span class="event-reason">{{ event.reason }}</span>
              <span class="event-separator">·</span>
              <span class="event-object">
                <template v-if="event.involvedObject.namespace">
                  <span class="object-namespace">
                    {{ event.involvedObject.namespace }}
                  </span>
                  <span class="separator">/</span>
                </template>
                <span class="object-kind">
                  {{ event.involvedObject.kind }}
                </span>
                <span class="separator">/</span>
                <span class="object-name">
                  {{ event.involvedObject.name }}
                </span>
              </span>
            </div>
            <div class="event-time">
              <span :title="formatDateTime(event.lastTimestamp)">
                {{
                  formatRelativeTime(
                    event.lastTimestamp || event.firstTimestamp,
                  )
                }}
              </span>
              <span v-if="event.count && event.count > 1" class="event-count">
                ×{{ event.count }}
              </span>
              <Button
                v-if="canAnalyze(event)"
                type="link"
                size="small"
                class="ai-analyze-btn"
                @click="analyzeEvent(event)"
              >
                <RobotOutlined />
                AI 分析
              </Button>
            </div>
          </div>
          <div class="event-message">
            {{ event.message }}
          </div>
          <div class="event-source">
            {{ event.source.component
            }}<template v-if="event.source.host">
              @ {{ event.source.host }}
            </template>
          </div>
        </div>
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

    <!-- AI 分析抽屉 -->
    <Drawer
      v-model:open="aiAnalysisVisible"
      title="AI 事件分析"
      width="70%"
      @close="closeAiAnalysis"
    >
      <div v-if="analyzingEvent" class="ai-analysis-container">
        <!-- 事件信息 -->
        <div class="event-info">
          <h3>事件信息</h3>
          <div class="info-item">
            <span class="info-label">类型:</span>
            <span
              class="info-value"
              :class="[`type-${analyzingEvent.type.toLowerCase()}`]"
            >
              {{ analyzingEvent.type }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">原因:</span>
            <span class="info-value">{{ analyzingEvent.reason }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">资源:</span>
            <span class="info-value">
              {{ analyzingEvent.involvedObject.kind }}/{{
                analyzingEvent.involvedObject.name
              }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">命名空间:</span>
            <span class="info-value">
              {{ analyzingEvent.involvedObject.namespace || '-' }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">消息:</span>
            <span class="info-value">{{ analyzingEvent.message }}</span>
          </div>
        </div>

        <!-- AI 分析结果 -->
        <div class="ai-analysis-result">
          <div class="analysis-header">
            <RobotOutlined class="ai-icon" />
            <span class="header-title">AI 智能分析</span>
          </div>
          <Spin
            v-if="aiAnalysisLoading"
            class="loading-spinner"
            tip="AI 正在分析事件..."
          />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-else class="analysis-content" v-html="aiAnalysisResult"></div>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<style>
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
  padding: 16px 20px;
  margin-bottom: 12px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-left: 4px solid #1890ff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  transition: all 0.2s ease;
}

.event-item:hover {
  background-color: rgb(24 144 255 / 5%);
  border-left-color: #40a9ff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  transform: translateX(2px);
}

html[data-theme='dark'] .event-item {
  background-color: rgb(255 255 255 / 4%);
  border-color: rgb(255 255 255 / 10%);
  box-shadow: 0 1px 3px rgb(0 0 0 / 30%);
}

html[data-theme='dark'] .event-item:hover {
  background-color: rgb(24 144 255 / 10%);
  box-shadow: 0 2px 8px rgb(0 0 0 / 40%);
}

/* Header: Icon + Type + Reason + Separator + Object path + Time */
.event-header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  margin-bottom: 8px;
}

.event-meta {
  display: grid;
  grid-auto-columns: max-content;
  grid-auto-flow: column;
  gap: 8px;
  align-items: center;
  min-width: 0;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 20px;
}

.event-type {
  font-weight: 700;
  line-height: 20px;
  white-space: nowrap;
}

.event-type.type-normal {
  color: #52c41a;
}

.event-type.type-warning {
  color: #ff4d4f;
}

.event-type.type-error {
  color: #ff4d4f;
}

.event-reason {
  font-weight: 600;
  line-height: 20px;
  color: var(--vben-text-color);
  white-space: nowrap;
}

.event-separator {
  font-weight: 300;
  line-height: 20px;
  color: var(--vben-text-color-tertiary);
  white-space: nowrap;
}

.event-object {
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  line-height: 20px;
  color: var(--vben-text-color-secondary);
  white-space: nowrap;
}

.object-namespace {
  font-weight: 500;
  color: #13c2c2;
}

.object-kind {
  font-weight: 500;
  color: #1890ff;
}

.object-name {
  font-weight: 400;
  color: var(--vben-text-color);
}

.separator {
  margin: 0 3px;
  font-weight: 300;
  color: var(--vben-text-color-tertiary);
}

.event-time {
  display: flex;
  flex-shrink: 0;
  gap: 5px;
  align-items: center;
  font-size: 12px;
  color: var(--vben-text-color-secondary);
  white-space: nowrap;
}

.event-count {
  font-size: 11px;
  font-weight: 500;
  color: var(--vben-text-color-tertiary);
}

.ai-analyze-btn {
  padding: 0 8px;
  font-size: 12px;
  color: var(--vben-primary-color);
}

.ai-analyze-btn:hover {
  color: var(--vben-primary-color-hover);
}

/* Message */
.event-message {
  padding-left: 2px;
  margin-bottom: 4px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vben-text-color);
  overflow-wrap: break-word;
}

/* Source */
.event-source {
  padding-left: 2px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 11px;
  color: var(--vben-text-color-tertiary);
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
:deep(.ant-timeline-item) {
  padding-bottom: 24px;
  margin-bottom: 4px;
}

:deep(.ant-timeline-item-tail) {
  display: none;
}

:deep(.ant-timeline-item-head) {
  width: 10px;
  height: 10px;
  background-color: var(--vben-border-color);
  border: 2px solid var(--vben-border-color);
}

:deep(.ant-timeline-item-content) {
  margin-top: 0;
  margin-left: 20px;
}

/* AI 分析抽屉样式 */
.ai-analysis-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.event-info {
  padding: 16px;
  background-color: var(--vben-background-color-light);
  border-radius: 4px;
}

.event-info h3 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.info-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  flex-shrink: 0;
  min-width: 70px;
  font-weight: 500;
  color: var(--vben-text-color-secondary);
}

.info-value {
  flex: 1;
  color: var(--vben-text-color);
  overflow-wrap: break-word;
}

.info-value.type-normal {
  font-weight: 600;
  color: #52c41a;
}

.info-value.type-warning {
  font-weight: 600;
  color: #ff4d4f;
}

.info-value.type-error {
  font-weight: 600;
  color: #ff4d4f;
}

.ai-analysis-result {
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 8%);
}

.analysis-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgb(102 126 234 / 20%);
}

html[data-theme='dark'] .analysis-header {
  background: linear-gradient(135deg, #4c5fd7 0%, #5a3b7f 100%);
}

.ai-icon {
  font-size: 20px;
  color: #fff;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
  background-color: var(--vben-background-color);
}

.analysis-content {
  padding: 24px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--vben-text-color);
  background-color: var(--vben-background-color);
}

/* 诊断结果区域 - 使用表格布局 */
.analysis-content .diagnosis-section {
  margin: 0 0 24px;
}

.analysis-content .diagnosis-section h3 {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%);
  border-left: 4px solid #ff4d4f;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(255 77 79 / 20%);
}

html[data-theme='dark'] .analysis-content .diagnosis-section h3 {
  background: linear-gradient(135deg, #d32029 0%, #d84a1b 100%);
  border-left-color: #d32029;
}

/* 诊断表格 */
.analysis-content .diagnosis-table {
  width: 100%;
  overflow: hidden;
  border-spacing: 0;
  border-collapse: separate;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
}

.analysis-content .diagnosis-table tbody tr {
  border-bottom: 1px solid var(--vben-border-color);
}

.analysis-content .diagnosis-table tbody tr:last-child {
  border-bottom: none;
}

.analysis-content .diagnosis-table .label-cell {
  width: 100px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  vertical-align: middle;
  color: var(--vben-text-color-secondary);
  white-space: nowrap;
  background-color: rgb(0 0 0 / 2%);
  border-right: 1px solid var(--vben-border-color);
}

html[data-theme='dark'] .analysis-content .diagnosis-table .label-cell {
  background-color: rgb(255 255 255 / 3%);
}

.analysis-content .diagnosis-table .value-cell {
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.7;
  vertical-align: middle;
  color: var(--vben-text-color);
}

/* 问题类型徽章 */
.analysis-content .type-badge {
  display: inline-block;
  padding: 6px 14px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #fa8c16 0%, #faad14 100%);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(250 140 22 / 30%);
}

/* 问题描述 */
.analysis-content .problem-desc {
  padding: 12px 16px;
  margin: 0;
  line-height: 1.8;
  word-wrap: break-word;
  white-space: pre-wrap;
  background: linear-gradient(
    135deg,
    rgb(255 77 79 / 5%) 0%,
    rgb(250 173 20 / 5%) 100%
  );
  border-left: 3px solid #ff7a45;
  border-radius: 6px;
}

/* 置信度徽章 */
.analysis-content .confidence-badge {
  display: inline-block;
  padding: 6px 14px;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #52c41a;
  background: linear-gradient(
    135deg,
    rgb(82 196 26 / 15%) 0%,
    rgb(19 194 194 / 15%) 100%
  );
  border: 2px solid #52c41a;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(82 196 26 / 25%);
}

/* 证据区域标题 */
.analysis-content .evidence-section {
  margin: 24px 0;
}

.analysis-content .evidence-section h3 {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #1890ff 0%, #13c2c2 100%);
  border-left: 4px solid #1890ff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(24 144 255 / 20%);
}

html[data-theme='dark'] .analysis-content .evidence-section h3 {
  background: linear-gradient(135deg, #096dd9 0%, #08979c 100%);
}

/* 证据表格 */
.analysis-content .evidence-table {
  width: 100%;
  overflow: hidden;
  border-spacing: 0;
  border-collapse: separate;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
}

.analysis-content .evidence-table tbody tr {
  border-bottom: 1px solid var(--vben-border-color);
  transition: background-color 0.2s ease;
}

.analysis-content .evidence-table tbody tr:last-child {
  border-bottom: none;
}

.analysis-content .evidence-table tbody tr:hover {
  background-color: rgb(24 144 255 / 5%);
}

html[data-theme='dark'] .analysis-content .evidence-table tbody tr:hover {
  background-color: rgb(24 144 255 / 8%);
}

.analysis-content .evidence-table .number-cell {
  width: 50px;
  padding: 4px 12px;
  font-size: 14px;
  font-weight: 600;
  vertical-align: middle;
  color: #1890ff;
  text-align: center;
  background-color: rgb(24 144 255 / 5%);
  border-right: 1px solid var(--vben-border-color);
}

html[data-theme='dark'] .analysis-content .evidence-table .number-cell {
  background-color: rgb(24 144 255 / 10%);
}

.analysis-content .evidence-table .evidence-cell {
  padding: 4px 12px;
  font-size: 14px;
  line-height: 1.4;
  vertical-align: middle;
  color: var(--vben-text-color);
}

/* 解决方案区域标题 */
.analysis-content .solutions-section {
  margin: 24px 0;
}

.analysis-content .solutions-section h3 {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-left: 4px solid #667eea;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(102 126 234 / 20%);
}

html[data-theme='dark'] .analysis-content .solutions-section h3 {
  background: linear-gradient(135deg, #4c5fd7 0%, #5a3b7f 100%);
}

/* 解决方案表格 */
.analysis-content .solutions-table {
  width: 100%;
  overflow: hidden;
  border-spacing: 0;
  border-collapse: separate;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
}

.analysis-content .solutions-table tbody tr {
  border-bottom: 1px solid var(--vben-border-color);
  transition: background-color 0.2s ease;
}

.analysis-content .solutions-table tbody tr:last-child {
  border-bottom: none;
}

.analysis-content .solutions-table tbody tr:hover {
  background-color: rgb(102 126 234 / 5%);
}

html[data-theme='dark'] .analysis-content .solutions-table tbody tr:hover {
  background-color: rgb(102 126 234 / 8%);
}

.analysis-content .solutions-table .number-cell {
  width: 50px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  vertical-align: middle;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-right: 1px solid var(--vben-border-color);
}

html[data-theme='dark'] .analysis-content .solutions-table .number-cell {
  background: linear-gradient(135deg, #4c5fd7 0%, #5a3b7f 100%);
}

.analysis-content .solutions-table .solution-cell {
  padding: 10px 14px;
  vertical-align: top;
}

/* 解决方案标题 */
.analysis-content .solution-title {
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #667eea;
}

html[data-theme='dark'] .analysis-content .solution-title {
  color: #8b9cee;
}

/* 解决方案描述 */
.analysis-content .solution-desc {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vben-text-color);
}

/* 命令区域 */
.analysis-content .solution-command {
  margin: 12px 0;
}

.analysis-content .command-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #52c41a;
}

.analysis-content .command-code {
  position: relative;
  padding: 14px 18px;
  margin: 0;
  overflow-x: auto;
  font-family:
    'SF Mono', Monaco, Inconsolata, 'Fira Code', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.8;
  color: #e6edf3;
  word-wrap: normal;
  white-space: pre;
  cursor: text;
  background: #0d1117;
  border: 1px solid #30363d;
  border-left: 4px solid #3fb950;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.analysis-content .command-code::before {
  font-weight: 600;
  color: #3fb950;
  content: '$ ';
}

html[data-theme='dark'] .analysis-content .command-code {
  color: #c9d1d9;
  background: #161b22;
  border-color: #30363d;
  border-left-color: #3fb950;
}

/* YAML 配置区域 */
.analysis-content .solution-yaml {
  margin: 12px 0;
}

.analysis-content .yaml-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1890ff;
}

.analysis-content .yaml-code {
  position: relative;
  padding: 14px 18px;
  margin: 0;
  overflow-x: auto;
  font-family:
    'SF Mono', Monaco, Inconsolata, 'Fira Code', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.8;
  color: #e6edf3;
  word-wrap: normal;
  white-space: pre;
  cursor: text;
  background: #0d1117;
  border: 1px solid #30363d;
  border-left: 4px solid #58a6ff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

html[data-theme='dark'] .analysis-content .yaml-code {
  color: #c9d1d9;
  background: #161b22;
  border-color: #30363d;
  border-left-color: #58a6ff;
}

/* 解决方案元信息容器 */
.analysis-content .solution-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

/* 元信息标签 */
.analysis-content .meta-tag {
  display: inline-block;
  padding: 4px 12px;
  margin: 0;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  border: none;
  border-radius: 12px;
}

/* 影响标签 */
.analysis-content .impact-tag {
  color: #1890ff;
  background-color: rgb(24 144 255 / 10%);
  border: none;
}

/* 风险级别标签 */
.analysis-content .risk-tag {
  font-weight: 600;
  border: none;
}

.analysis-content .risk-tag.risk-low {
  color: #52c41a;
  background-color: rgb(82 196 26 / 10%);
  border: none;
}

.analysis-content .risk-tag.risk-medium {
  color: #fa8c16;
  background-color: rgb(250 140 22 / 10%);
  border: none;
}

.analysis-content .risk-tag.risk-high {
  color: #ff4d4f;
  background-color: rgb(255 77 79 / 10%);
  border: none;
}

/* 标题样式 */
.analysis-content h2 {
  margin: 24px 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.analysis-content h3 {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  margin: 20px 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-left: 4px solid #667eea;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(102 126 234 / 20%);
}

html[data-theme='dark'] .analysis-content h3 {
  background: linear-gradient(135deg, #4c5fd7 0%, #5a3b7f 100%);
  border-left-color: #4c5fd7;
}

/* 段落样式 */
.analysis-content p {
  margin: 12px 0;
  line-height: 1.8;
}

/* 代码样式 */
.analysis-content code {
  padding: 3px 8px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #e83e8c;
  background-color: rgb(232 62 140 / 10%);
  border-radius: 4px;
}

html[data-theme='dark'] .analysis-content code {
  color: #ff6b9d;
  background-color: rgb(255 107 157 / 15%);
}
</style>
