<script lang="ts" setup>
/**
 * 容器日志抽屉组件
 * 用于显示 Pod 或 Job 容器的日志信息
 */
import type { Job, Pod } from '#/api/k8s/types';

import { computed, ref, watch } from 'vue';

import {
  Button,
  Drawer,
  Empty,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Spin,
  Switch,
} from 'ant-design-vue';

import { getPodLogs } from '#/api/k8s/index';

interface LogDrawerProps {
  visible?: boolean;
  pod?: Job | null | Pod;
  clusterId?: string;
}

const props = withDefaults(defineProps<LogDrawerProps>(), {
  visible: false,
  pod: null,
  clusterId: '',
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

// 日志内容
const logs = ref<string>('');
const loading = ref(false);

// 日志选项
const selectedContainer = ref<string>('');
const showTimestamps = ref(false);
const tailLines = ref<number>(100);
const autoRefresh = ref(false);
const filterKeyword = ref<string>('');

// 可选容器列表
const containers = computed(() => {
  if (!props.pod) return [];

  // 支持 Pod 和 Job 两种结构
  // Pod: spec.containers
  // Job: spec.template.spec.containers
  const containerList =
    props.pod.spec?.containers ||
    props.pod.spec?.template?.spec?.containers ||
    [];

  return containerList.map((c) => ({
    label: c.name,
    value: c.name,
  }));
});

/**
 * 格式化日志，添加语法高亮和过滤
 */
const formattedLogs = computed(() => {
  if (!logs.value) return '';

  const lines = logs.value.split('\n');

  // 应用过滤
  let filteredLines = lines;
  if (filterKeyword.value && filterKeyword.value.trim()) {
    const keyword = filterKeyword.value.trim().toLowerCase();
    filteredLines = lines.filter((line) =>
      line.toLowerCase().includes(keyword),
    );
  }

  // 如果过滤后没有结果，显示提示
  if (filteredLines.length === 0 && filterKeyword.value) {
    return `<span style="color: var(--vben-text-color-secondary);">未找到包含 "${filterKeyword.value}" 的日志</span>`;
  }

  return filteredLines
    .map((line) => {
      // 高亮不同级别的日志
      if (line.includes('[ERROR]')) {
        return `<span class="log-error">${escapeHtml(line)}</span>`;
      } else if (line.includes('[WARN]')) {
        return `<span class="log-warn">${escapeHtml(line)}</span>`;
      } else if (line.includes('[INFO]')) {
        return `<span class="log-info">${escapeHtml(line)}</span>`;
      } else if (line.includes('[DEBUG]')) {
        return `<span class="log-debug">${escapeHtml(line)}</span>`;
      }
      return escapeHtml(line);
    })
    .join('\n');
});

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replaceAll(/[&<>"']/g, (m) => map[m]);
}

// 当打开抽屉或 Pod 变化时，初始化容器选择
watch(
  () => [props.visible, props.pod],
  () => {
    if (props.visible && props.pod && containers.value.length > 0) {
      selectedContainer.value = containers.value[0].value;
      fetchLogs();
    }
  },
  { immediate: true },
);

// 当容器选择或日志选项变化时，重新获取日志
watch([selectedContainer, showTimestamps, tailLines], () => {
  if (props.visible && selectedContainer.value) {
    fetchLogs();
  }
});

/**
 * 获取日志
 */
async function fetchLogs() {
  if (!props.pod || !selectedContainer.value) return;

  loading.value = true;
  try {
    const result = await getPodLogs({
      clusterId: props.clusterId,
      namespace: props.pod.metadata.namespace || 'default',
      name: props.pod.metadata.name,
      container: selectedContainer.value,
      timestamps: showTimestamps.value,
      tailLines: tailLines.value,
    });

    logs.value = result || '暂无日志';
  } catch (error: any) {
    message.error(`获取日志失败: ${error.message || '未知错误'}`);
    logs.value = '获取日志失败';
  } finally {
    loading.value = false;
  }
}

/**
 * 刷新日志
 */
function handleRefresh() {
  fetchLogs();
}

/**
 * 下载日志
 */
function handleDownload() {
  if (!props.pod || !logs.value) return;

  const blob = new Blob([logs.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.pod.metadata.name}-${selectedContainer.value}-${Date.now()}.log`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('日志已下载');
}

/**
 * 清空日志显示
 */
function handleClear() {
  logs.value = '';
}

/**
 * 关闭抽屉
 */
function handleClose() {
  emit('update:visible', false);
  // 重置状态
  autoRefresh.value = false;
}
</script>

<template>
  <Drawer
    :open="visible"
    :title="`容器日志 - ${pod?.metadata.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="pod" class="log-drawer-content">
      <!-- 日志选项 -->
      <div class="log-options">
        <Space :size="16" wrap class="log-options-left">
          <div class="option-item">
            <span class="option-label">容器:</span>
            <Select
              v-model:value="selectedContainer"
              :options="containers"
              style="width: 180px"
              placeholder="选择容器"
            />
          </div>

          <div class="option-item">
            <span class="option-label">尾部行数:</span>
            <InputNumber
              v-model:value="tailLines"
              :min="10"
              :max="10000"
              :step="100"
              style="width: 120px"
            />
          </div>

          <div class="option-item">
            <Switch v-model:checked="showTimestamps" size="small" />
            <span class="option-label">显示时间戳</span>
          </div>

          <div class="option-item">
            <Switch v-model:checked="autoRefresh" size="small" disabled />
            <span class="option-label">自动刷新</span>
          </div>
        </Space>

        <Space :size="8" class="log-options-right">
          <Button size="small" @click="handleRefresh">刷新</Button>
          <Button size="small" @click="handleDownload">下载</Button>
          <Button size="small" @click="handleClear">清空</Button>
        </Space>
      </div>

      <!-- 过滤选项 -->
      <div class="log-filter">
        <span class="option-label">过滤:</span>
        <Input
          v-model:value="filterKeyword"
          style="width: 100%; max-width: 400px"
          placeholder="输入关键词过滤日志（支持正则表达式）"
          allow-clear
        />
      </div>

      <!-- 日志内容 -->
      <div class="log-content-wrapper">
        <div class="log-content-border">
          <Spin :spinning="loading" tip="加载日志中...">
            <div v-if="logs" class="log-content">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <pre v-html="formattedLogs"></pre>
            </div>
            <Empty v-else description="暂无日志" />
          </Spin>
        </div>
      </div>
    </div>

    <Empty v-else description="未选择资源" />
  </Drawer>
</template>

<style scoped>
.log-drawer-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.log-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.log-options-left {
  flex: 1;
  min-width: 0;
}

.log-options-right {
  flex-shrink: 0;
  margin-left: 16px;
}

.option-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-label {
  font-size: 14px;
  color: var(--vben-text-color-secondary);
  white-space: nowrap;
}

.log-filter {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 12px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.log-content-wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
  background-color: var(--log-bg-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  transition: all 0.3s ease;
}

.log-content-border {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid var(--log-border-color);
  border-color: #fff !important;
  border-radius: 4px;
}

html[data-theme='light'] .log-content-border,
html:not([data-theme]) .log-content-border {
  border-color: #808080 !important;
}

.log-content-border :deep(.ant-spin-container) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.log-content-border :deep(.ant-spin-nested-loading) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.log-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
  background-color: var(--log-content-bg-color);
}

.log-content pre {
  margin: 0;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--log-text-color);
  word-wrap: break-word;
  white-space: pre-wrap;
  transition: color 0.3s ease;
}

/* 滚动条样式 - 响应主题 */
.log-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.log-content::-webkit-scrollbar-track {
  background-color: var(--log-scrollbar-track-color);
}

.log-content::-webkit-scrollbar-thumb {
  background-color: var(--log-scrollbar-thumb-color);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.log-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--log-scrollbar-thumb-hover-color);
}

/* 深色主题变量 */
html[data-theme='dark'] {
  --log-bg-color: #1a1a1a;
  --log-content-bg-color: #0d0d0d;
  --log-text-color: #d4d4d4;
  --log-border-color: #fff;
  --log-scrollbar-track-color: #2d2d2d;
  --log-scrollbar-thumb-color: #555;
  --log-scrollbar-thumb-hover-color: #666;
}

/* 浅色主题变量 */
html[data-theme='light'],
html:not([data-theme]) {
  --log-bg-color: #f5f5f5;
  --log-content-bg-color: #fff;
  --log-text-color: #333;
  --log-border-color: #808080;
  --log-scrollbar-track-color: #e8e8e8;
  --log-scrollbar-thumb-color: #bbb;
  --log-scrollbar-thumb-hover-color: #999;
}

/* 日志级别高亮样式 */
.log-content :deep(.log-error) {
  font-weight: 500;
  color: #ff4d4f;
}

.log-content :deep(.log-warn) {
  font-weight: 500;
  color: #faad14;
}

.log-content :deep(.log-info) {
  color: #1890ff;
}

.log-content :deep(.log-debug) {
  font-style: italic;
  color: #8c8c8c;
}

/* 浅色主题下的日志级别颜色调整 */
html[data-theme='light'] .log-content :deep(.log-error),
html:not([data-theme]) .log-content :deep(.log-error) {
  color: #cf1322;
}

html[data-theme='light'] .log-content :deep(.log-warn),
html:not([data-theme]) .log-content :deep(.log-warn) {
  color: #d46b08;
}

html[data-theme='light'] .log-content :deep(.log-info),
html:not([data-theme]) .log-content :deep(.log-info) {
  color: #096dd9;
}

html[data-theme='light'] .log-content :deep(.log-debug),
html:not([data-theme]) .log-content :deep(.log-debug) {
  color: #595959;
}
</style>
