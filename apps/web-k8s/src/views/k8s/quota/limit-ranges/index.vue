<script lang="ts" setup>
/**
 * Kubernetes LimitRange 列表页面
 * 展示命名空间级别的资源限制范围（默认值、最大值、最小值）
 */
import type { LimitRange, LimitRangeListParams } from '#/api/k8s/types';

import { computed, onMounted, ref } from 'vue';

import { ControlOutlined, SettingOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Descriptions,
  message,
  Pagination,
  Select,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { limitRangeApi } from '#/api/k8s';
import { useClusterOptions } from '#/stores/clusterStore';

// 使用全局集群状态
const {
  selectedClusterId,
  clusterOptions,
  setSelectedCluster,
  init: initClusterOptions,
} = useClusterOptions();

// 加载状态
const loading = ref(false);

// LimitRanges 数据
const limitRanges = ref<LimitRange[]>([]);
const total = ref(0);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选参数
const filters = ref<{
  namespace?: string;
}>({
  namespace: undefined,
});

// 命名空间选项（简化示例，实际应从API获取）
const namespaceOptions = computed(() => [
  { label: '全部命名空间', value: undefined },
  { label: 'default', value: 'default' },
  { label: 'production', value: 'production' },
  { label: 'staging', value: 'staging' },
  { label: 'development', value: 'development' },
  { label: 'kube-system', value: 'kube-system' },
]);

// 表格列定义
const columns = [
  {
    title: '名称',
    dataIndex: ['metadata', 'name'],
    key: 'name',
    width: 250,
    ellipsis: true,
  },
  {
    title: '命名空间',
    dataIndex: ['metadata', 'namespace'],
    key: 'namespace',
    width: 150,
  },
  {
    title: '限制项数量',
    key: 'limitsCount',
    width: 120,
  },
  {
    title: '限制类型',
    key: 'limitTypes',
    width: 300,
  },
  {
    title: '创建时间',
    dataIndex: ['metadata', 'creationTimestamp'],
    key: 'creationTimestamp',
    width: 200,
  },
];

/**
 * 加载 LimitRanges 列表
 */
async function loadLimitRanges() {
  loading.value = true;
  try {
    const params: LimitRangeListParams = {
      clusterId: selectedClusterId.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filters.value,
    };

    const result = await limitRangeApi.list(params);
    limitRanges.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    message.error(`加载 LimitRanges 失败: ${error.message}`);
  } finally {
    loading.value = false;
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
  return `${seconds}秒前`;
}

/**
 * 格式化完整时间
 */
function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 获取限制类型的颜色
 */
function getLimitTypeColor(type: string): string {
  switch (type) {
    case 'Container': {
      return 'blue';
    }
    case 'PersistentVolumeClaim': {
      return 'purple';
    }
    case 'Pod': {
      return 'green';
    }
    default: {
      return 'default';
    }
  }
}

/**
 * 获取所有限制类型
 */
function getLimitTypes(limitRange: LimitRange): string[] {
  const types = new Set<string>();
  limitRange.spec.limits.forEach((item) => {
    types.add(item.type);
  });
  return [...types];
}

/**
 * 格式化资源值
 */
function formatResourceValue(value: string | undefined): string {
  return value || '-';
}

/**
 * 获取限制字段标签
 */
function getLimitFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    max: '最大值 (Max)',
    min: '最小值 (Min)',
    default: '默认限制 (Default)',
    defaultRequest: '默认请求 (Default Request)',
    maxLimitRequestRatio: '最大限制/请求比率 (Max Limit/Request Ratio)',
  };
  return labels[field] || field;
}

/**
 * 获取限制字段的标签颜色
 */
function getLimitFieldColor(field: string): string {
  const colors: Record<string, string> = {
    max: 'red',
    min: 'green',
    default: 'blue',
    defaultRequest: 'cyan',
    maxLimitRequestRatio: 'orange',
  };
  return colors[field] || 'default';
}

/**
 * 处理筛选变化
 */
function handleFilterChange() {
  currentPage.value = 1;
  loadLimitRanges();
}

/**
 * 处理集群选择变化
 */
function handleClusterChange(clusterId: string) {
  setSelectedCluster(clusterId);
  currentPage.value = 1;
  loadLimitRanges();
}

/**
 * 处理分页变化
 */
function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  loadLimitRanges();
}

/**
 * 重置筛选
 */
function resetFilters() {
  filters.value = {
    namespace: undefined,
  };
  currentPage.value = 1;
  loadLimitRanges();
}

// 组件挂载时初始化集群选项并加载数据
onMounted(async () => {
  await initClusterOptions();
  loadLimitRanges();
});
</script>

<template>
  <div class="limit-ranges-container">
    <!-- 筛选区域 -->
    <Card class="filter-card" :bordered="false">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">集群:</label>
          <Select
            v-model:value="selectedClusterId"
            :options="clusterOptions"
            placeholder="选择集群"
            style="width: 200px"
          />
        </div>

        <div class="filter-item">
          <label class="filter-label">命名空间:</label>
          <Select
            v-model:value="filters.namespace"
            :options="namespaceOptions"
            placeholder="选择命名空间"
            style="width: 200px"
          />
        </div>

        <Button type="primary" @click="handleFilterChange"> 搜索 </Button>
        <Button @click="resetFilters"> 重置 </Button>
      </div>
    </Card>

    <!-- LimitRanges 列表 -->
    <Card class="table-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <ControlOutlined class="title-icon" />
          <span>LimitRanges ({{ total }})</span>
        </div>
      </template>

      <Table
        :columns="columns"
        :data-source="limitRanges"
        :loading="loading"
        :pagination="false"
        :row-key="(record) => record?.metadata?.uid || record?.metadata?.name || Math.random().toString()"
        :scroll="{ x: 'max-content' }"
        :expandable="{
          expandedRowRender: (record) => record,
        }"
      >
        <!-- 名称列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="name-cell">
              <SettingOutlined class="name-icon" />
              <Tooltip :title="record.metadata.name">
                <span class="name-text">{{ record.metadata.name }}</span>
              </Tooltip>
            </div>
          </template>

          <!-- 限制项数量列 -->
          <template v-else-if="column.key === 'limitsCount'">
            <Tag color="blue"> {{ record.spec.limits.length }} 个限制 </Tag>
          </template>

          <!-- 限制类型列 -->
          <template v-else-if="column.key === 'limitTypes'">
            <div class="limit-types-cell">
              <Tag
                v-for="type in getLimitTypes(record)"
                :key="type"
                :color="getLimitTypeColor(type)"
              >
                {{ type }}
              </Tag>
            </div>
          </template>

          <!-- 创建时间列 -->
          <template v-else-if="column.key === 'creationTimestamp'">
            <Tooltip
              :title="formatDateTime(record.metadata.creationTimestamp!)"
            >
              <span class="time-text">
                {{ formatRelativeTime(record.metadata.creationTimestamp!) }}
              </span>
            </Tooltip>
          </template>
        </template>

        <!-- 展开行内容 -->
        <template #expandedRowRender="{ record }">
          <div class="expanded-content">
            <Descriptions
              title="LimitRange 详情"
              :column="2"
              bordered
              size="small"
            >
              <Descriptions.Item label="名称" :span="2">
                {{ record.metadata.name }}
              </Descriptions.Item>
              <Descriptions.Item label="命名空间">
                {{ record.metadata.namespace }}
              </Descriptions.Item>
              <Descriptions.Item label="UID">
                <code>{{ record.metadata.uid }}</code>
              </Descriptions.Item>
            </Descriptions>

            <div class="limits-section">
              <h4 class="limits-title">
                限制项详情 ({{ record.spec.limits.length }})
              </h4>
              <div class="limits-grid">
                <Card
                  v-for="(limit, index) in record.spec.limits"
                  :key="`limit-${index}`"
                  class="limit-card"
                  size="small"
                >
                  <template #title>
                    <div class="limit-card-header">
                      <SettingOutlined class="limit-icon" />
                      <Tag :color="getLimitTypeColor(limit.type)">
                        {{ limit.type }}
                      </Tag>
                    </div>
                  </template>

                  <div class="limit-details">
                    <!-- Max -->
                    <div v-if="limit.max" class="limit-field">
                      <div class="field-header">
                        <Tag :color="getLimitFieldColor('max')" size="small">
                          {{ getLimitFieldLabel('max') }}
                        </Tag>
                      </div>
                      <div class="field-resources">
                        <div
                          v-for="(value, resource) in limit.max"
                          :key="`max-${resource}`"
                          class="resource-item"
                        >
                          <span class="resource-label">{{ resource }}:</span>
                          <code class="resource-value">{{
                            formatResourceValue(value)
                          }}</code>
                        </div>
                      </div>
                    </div>

                    <!-- Min -->
                    <div v-if="limit.min" class="limit-field">
                      <div class="field-header">
                        <Tag :color="getLimitFieldColor('min')" size="small">
                          {{ getLimitFieldLabel('min') }}
                        </Tag>
                      </div>
                      <div class="field-resources">
                        <div
                          v-for="(value, resource) in limit.min"
                          :key="`min-${resource}`"
                          class="resource-item"
                        >
                          <span class="resource-label">{{ resource }}:</span>
                          <code class="resource-value">{{
                            formatResourceValue(value)
                          }}</code>
                        </div>
                      </div>
                    </div>

                    <!-- Default -->
                    <div v-if="limit.default" class="limit-field">
                      <div class="field-header">
                        <Tag
                          :color="getLimitFieldColor('default')"
                          size="small"
                        >
                          {{ getLimitFieldLabel('default') }}
                        </Tag>
                      </div>
                      <div class="field-resources">
                        <div
                          v-for="(value, resource) in limit.default"
                          :key="`default-${resource}`"
                          class="resource-item"
                        >
                          <span class="resource-label">{{ resource }}:</span>
                          <code class="resource-value">{{
                            formatResourceValue(value)
                          }}</code>
                        </div>
                      </div>
                    </div>

                    <!-- Default Request -->
                    <div v-if="limit.defaultRequest" class="limit-field">
                      <div class="field-header">
                        <Tag
                          :color="getLimitFieldColor('defaultRequest')"
                          size="small"
                        >
                          {{ getLimitFieldLabel('defaultRequest') }}
                        </Tag>
                      </div>
                      <div class="field-resources">
                        <div
                          v-for="(value, resource) in limit.defaultRequest"
                          :key="`defaultRequest-${resource}`"
                          class="resource-item"
                        >
                          <span class="resource-label">{{ resource }}:</span>
                          <code class="resource-value">{{
                            formatResourceValue(value)
                          }}</code>
                        </div>
                      </div>
                    </div>

                    <!-- Max Limit/Request Ratio -->
                    <div v-if="limit.maxLimitRequestRatio" class="limit-field">
                      <div class="field-header">
                        <Tag
                          :color="getLimitFieldColor('maxLimitRequestRatio')"
                          size="small"
                        >
                          {{ getLimitFieldLabel('maxLimitRequestRatio') }}
                        </Tag>
                      </div>
                      <div class="field-resources">
                        <div
                          v-for="(
                            value, resource
                          ) in limit.maxLimitRequestRatio"
                          :key="`ratio-${resource}`"
                          class="resource-item"
                        >
                          <span class="resource-label">{{ resource }}:</span>
                          <code class="resource-value">{{
                            formatResourceValue(value)
                          }}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </template>
      </Table>

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
.limit-ranges-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.filter-card {
  background-color: var(--vben-background-color);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--vben-text-color);
  white-space: nowrap;
}

.table-card {
  flex: 1;
  background-color: var(--vben-background-color);
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

.name-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.name-icon {
  color: var(--vben-primary-color);
}

.name-text {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  color: var(--vben-text-color);
}

.limit-types-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.time-text {
  font-size: 13px;
  color: var(--vben-text-color-secondary);
}

.expanded-content {
  padding: 16px;
  background-color: rgb(0 0 0 / 2%);
}

html[data-theme='dark'] .expanded-content {
  background-color: rgb(255 255 255 / 2%);
}

.limits-section {
  margin-top: 16px;
}

.limits-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.limits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

.limit-card {
  border: 1px solid var(--vben-border-color);
  transition: all 0.3s ease;
}

.limit-card:hover {
  border-color: var(--vben-primary-color);
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.limit-card-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.limit-icon {
  font-size: 14px;
  color: var(--vben-primary-color);
}

.limit-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.limit-field {
  padding: 8px;
  background-color: rgb(0 0 0 / 2%);
  border-radius: 4px;
}

html[data-theme='dark'] .limit-field {
  background-color: rgb(255 255 255 / 2%);
}

.field-header {
  margin-bottom: 8px;
}

.field-resources {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.resource-item {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background-color: var(--vben-background-color);
  border-radius: 3px;
}

.resource-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--vben-text-color-secondary);
}

.resource-value {
  padding: 2px 6px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  color: var(--vben-primary-color);
  background-color: rgb(24 144 255 / 10%);
  border-radius: 3px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--vben-border-color);
}
</style>
