<script lang="ts" setup>
/**
 * CronJob 详情抽屉组件
 * 显示 CronJob 的完整信息
 */
import type { CronJob } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import {
  Button,
  Card,
  Descriptions,
  Drawer,
  message,
  Table,
  Tabs,
  Tag,
} from 'ant-design-vue';

interface DetailDrawerProps {
  visible: boolean;
  cronJob: CronJob | null;
}

const props = withDefaults(defineProps<DetailDrawerProps>(), {
  visible: false,
  cronJob: null,
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
const suspendColorMap: Record<string, string> = {
  true: 'warning',
  false: 'success',
};

/**
 * Job 模板容器列数据
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
 * 历史记录列数据
 */
const historyColumns = [
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '命名空间',
    dataIndex: 'namespace',
    key: 'namespace',
  },
  {
    title: 'UID',
    dataIndex: 'uid',
    key: 'uid',
  },
];

/**
 * 标签数据
 */
const labels = computed(() => {
  if (!props.cronJob?.metadata.labels) return [];
  return Object.entries(props.cronJob.metadata.labels).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 注解数据
 */
const annotations = computed(() => {
  if (!props.cronJob?.metadata.annotations) return [];
  return Object.entries(props.cronJob.metadata.annotations).map(
    ([key, value]) => ({
      key,
      value,
    }),
  );
});

/**
 * 活跃 Job 列表
 */
const activeJobs = computed(() => {
  if (!props.cronJob?.status?.active) return [];
  return props.cronJob.status.active.map((job) => ({
    type: 'Job',
    name: job.name,
    namespace: job.namespace,
    uid: job.uid,
  }));
});

/**
 * 格式化时间
 */
function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 生成 YAML 格式的 CronJob 配置
 */
const cronJobYaml = computed(() => {
  if (!props.cronJob) return '';

  // 构建完整的 CronJob YAML 对象
  const yamlObj = {
    apiVersion: props.cronJob.apiVersion,
    kind: props.cronJob.kind,
    metadata: props.cronJob.metadata,
    spec: props.cronJob.spec,
    status: props.cronJob.status,
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
      // 如果字符串包含特殊字符，用引号包裹
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
    await navigator.clipboard.writeText(cronJobYaml.value);
    message.success('YAML 已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

/**
 * 下载 YAML 文件
 */
function downloadYaml() {
  if (!props.cronJob) return;

  const blob = new Blob([cronJobYaml.value], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.cronJob.metadata.name}.yaml`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('YAML 文件已下载');
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
    :title="`CronJob 详情 - ${cronJob?.metadata.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="cronJob" class="detail-drawer-content">
      <Tabs v-model:active-key="activeTab" type="card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="名称">
              {{ cronJob.metadata.name }}
            </Descriptions.Item>
            <Descriptions.Item label="命名空间">
              {{ cronJob.metadata.namespace }}
            </Descriptions.Item>
            <Descriptions.Item label="调度规则 (Schedule)">
              <code>{{ cronJob.spec.schedule }}</code>
            </Descriptions.Item>
            <Descriptions.Item label="时区 (TimeZone)">
              {{ cronJob.spec.timeZone || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="暂停状态 (Suspend)">
              <Tag
                :color="suspendColorMap[String(cronJob.spec.suspend || false)]"
              >
                {{ cronJob.spec.suspend ? '已暂停' : '运行中' }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="并发策略">
              {{ cronJob.spec.concurrencyPolicy || 'Allow' }}
            </Descriptions.Item>
            <Descriptions.Item label="成功历史记录限制">
              {{ cronJob.spec.successfulJobsHistoryLimit ?? 3 }}
            </Descriptions.Item>
            <Descriptions.Item label="失败历史记录限制">
              {{ cronJob.spec.failedJobsHistoryLimit ?? 1 }}
            </Descriptions.Item>
            <Descriptions.Item label="启动截止时间(秒)">
              {{ cronJob.spec.startingDeadlineSeconds || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="UID">
              {{ cronJob.metadata.uid }}
            </Descriptions.Item>
            <Descriptions.Item label="最后调度时间" :span="2">
              {{ formatDateTime(cronJob.status?.lastScheduleTime) }}
            </Descriptions.Item>
            <Descriptions.Item label="最后成功时间" :span="2">
              {{ formatDateTime(cronJob.status?.lastSuccessfulTime) }}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" :span="2">
              {{ formatDateTime(cronJob.metadata.creationTimestamp) }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- Job 模板标签页 -->
        <Tabs.TabPane key="job-template" tab="Job模板">
          <Card title="模板元数据" size="small" style="margin-bottom: 16px">
            <Descriptions :column="2" size="small">
              <Descriptions.Item label="Backoff 限制">
                {{ cronJob.spec.jobTemplate.spec.backoffLimit ?? 6 }}
              </Descriptions.Item>
              <Descriptions.Item label="完成次数">
                {{ cronJob.spec.jobTemplate.spec.completions ?? 1 }}
              </Descriptions.Item>
              <Descriptions.Item label="并行度">
                {{ cronJob.spec.jobTemplate.spec.parallelism ?? 1 }}
              </Descriptions.Item>
              <Descriptions.Item label="重启策略">
                {{
                  cronJob.spec.jobTemplate.spec.template.spec.restartPolicy ||
                  'OnFailure'
                }}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="容器规格" size="small">
            <Table
              :columns="containerColumns"
              :data-source="
                cronJob.spec.jobTemplate.spec.template.spec.containers
              "
              :pagination="false"
              size="small"
              :row-key="(record: any) => record.name"
            />
          </Card>
        </Tabs.TabPane>

        <!-- 历史记录标签页 -->
        <Tabs.TabPane key="history" tab="历史记录">
          <div v-if="activeJobs.length > 0">
            <div style="margin-bottom: 12px">
              <Tag color="blue">活跃 Job 数: {{ activeJobs.length }}</Tag>
            </div>
            <Table
              :columns="historyColumns"
              :data-source="activeJobs"
              :pagination="false"
              size="small"
              :row-key="(record: any) => record.uid"
            />
          </div>
          <div v-else class="empty-text">当前没有活跃的 Job</div>
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
            <Button size="small" @click="downloadYaml"> 下载 YAML </Button>
          </div>
          <div class="yaml-wrapper">
            <div class="yaml-content">
              <pre>{{ cronJobYaml }}</pre>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div v-else class="empty-text">未选择 CronJob</div>
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

/* 深色主题 YAML 内容边框 - 使用白色提高可见度 */
html[data-theme='dark'] .yaml-content {
  border-color: #fff !important;
}

/* 浅色主题 YAML 内容边框 - 使用中灰色 */
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
