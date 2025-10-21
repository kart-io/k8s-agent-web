<script lang="ts" setup>
/**
 * Kubernetes ResourceQuota 列表页面
 * 展示命名空间级别的资源配额限制和使用情况
 */
import type { ResourceQuota, ResourceQuotaListParams } from '#/api/k8s/types';

import { computed, onMounted, ref } from 'vue';

import { DashboardOutlined, PieChartOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Descriptions,
  message,
  Pagination,
  Progress,
  Select,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { resourceQuotaApi } from '#/api/k8s';
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

// ResourceQuotas 数据
const resourceQuotas = ref<ResourceQuota[]>([]);
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
    title: '资源类型数',
    key: 'resourceCount',
    width: 120,
  },
  {
    title: '平均使用率',
    key: 'avgUsage',
    width: 200,
  },
  {
    title: '作用域',
    key: 'scopes',
    width: 150,
  },
  {
    title: '创建时间',
    dataIndex: ['metadata', 'creationTimestamp'],
    key: 'creationTimestamp',
    width: 200,
  },
];

/**
 * 加载 ResourceQuotas 列表
 */
async function loadResourceQuotas() {
  loading.value = true;
  try {
    const params: ResourceQuotaListParams = {
      clusterId: selectedClusterId.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filters.value,
    };

    const result = await resourceQuotaApi.list(params);
    resourceQuotas.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    message.error(`加载 ResourceQuotas 失败: ${error.message}`);
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
 * 解析资源值为数字（去除单位）
 */
function parseResourceValue(value: string): number {
  if (!value) return 0;

  // 处理存储单位: Gi, Mi, Ki
  if (value.endsWith('Gi')) {
    return Number.parseInt(value) * 1024 * 1024 * 1024;
  }
  if (value.endsWith('Mi')) {
    return Number.parseInt(value) * 1024 * 1024;
  }
  if (value.endsWith('Ki')) {
    return Number.parseInt(value) * 1024;
  }

  // 处理 CPU 单位: m (millicores)
  if (value.endsWith('m')) {
    return Number.parseInt(value) / 1000;
  }

  // 纯数字
  return Number.parseInt(value) || 0;
}

/**
 * 计算资源使用率
 */
function calculateUsagePercent(used: string, hard: string): number {
  const usedValue = parseResourceValue(used);
  const hardValue = parseResourceValue(hard);

  if (hardValue === 0) return 0;
  return Math.round((usedValue / hardValue) * 100);
}

/**
 * 计算平均使用率
 */
function calculateAverageUsage(quota: ResourceQuota): number {
  if (!quota.status?.used || !quota.status?.hard) return 0;

  const resources = Object.keys(quota.status.hard);
  if (resources.length === 0) return 0;

  const usages = resources.map((key) => {
    const used = quota.status!.used![key] || '0';
    const hard = quota.status!.hard![key] || '0';
    return calculateUsagePercent(used, hard);
  });

  const sum = usages.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / usages.length);
}

/**
 * 获取使用率的颜色
 */
function getUsageColor(percent: number): string {
  if (percent >= 90) return 'red';
  if (percent >= 75) return 'orange';
  if (percent >= 50) return 'blue';
  return 'green';
}

/**
 * 获取使用率的状态
 */
function getUsageStatus(percent: number): 'exception' | 'normal' | 'success' {
  if (percent >= 90) return 'exception';
  if (percent >= 75) return 'normal';
  return 'success';
}

/**
 * 格式化资源值显示
 */
function formatResourceValue(value: string): string {
  return value || '-';
}

/**
 * 处理筛选变化
 */
function handleFilterChange() {
  currentPage.value = 1;
  loadResourceQuotas();
}

/**
 * 处理集群选择变化
 */
function handleClusterChange(clusterId: string) {
  setSelectedCluster(clusterId);
  currentPage.value = 1;
  loadResourceQuotas();
}

/**
 * 处理分页变化
 */
function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  loadResourceQuotas();
}

/**
 * 重置筛选
 */
function resetFilters() {
  filters.value = {
    namespace: undefined,
  };
  currentPage.value = 1;
  loadResourceQuotas();
}

// 组件挂载时初始化集群选项并加载数据
onMounted(async () => {
  await initClusterOptions();
  loadResourceQuotas();
});
</script>

<template>
  <div class="resource-quotas-container">
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

    <!-- ResourceQuotas 列表 -->
    <Card class="table-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <DashboardOutlined class="title-icon" />
          <span>ResourceQuotas ({{ total }})</span>
        </div>
      </template>

      <Table
        :columns="columns"
        :data-source="resourceQuotas"
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
              <PieChartOutlined class="name-icon" />
              <Tooltip :title="record.metadata.name">
                <span class="name-text">{{ record.metadata.name }}</span>
              </Tooltip>
            </div>
          </template>

          <!-- 资源类型数列 -->
          <template v-else-if="column.key === 'resourceCount'">
            <Tag color="blue">
              {{ Object.keys(record.status?.hard || {}).length }} 种资源
            </Tag>
          </template>

          <!-- 平均使用率列 -->
          <template v-else-if="column.key === 'avgUsage'">
            <div class="usage-cell">
              <Progress
                :percent="calculateAverageUsage(record)"
                :status="getUsageStatus(calculateAverageUsage(record))"
                :stroke-color="getUsageColor(calculateAverageUsage(record))"
                size="small"
              />
            </div>
          </template>

          <!-- 作用域列 -->
          <template v-else-if="column.key === 'scopes'">
            <div
              v-if="record.spec.scopes && record.spec.scopes.length > 0"
              class="scopes-cell"
            >
              <Tag
                v-for="scope in record.spec.scopes"
                :key="scope"
                color="purple"
              >
                {{ scope }}
              </Tag>
            </div>
            <span v-else class="empty-text">-</span>
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
            <Descriptions title="配额详情" :column="2" bordered size="small">
              <Descriptions.Item label="配额名称" :span="2">
                {{ record.metadata.name }}
              </Descriptions.Item>
              <Descriptions.Item label="命名空间">
                {{ record.metadata.namespace }}
              </Descriptions.Item>
              <Descriptions.Item label="UID">
                <code>{{ record.metadata.uid }}</code>
              </Descriptions.Item>
              <Descriptions.Item
                v-if="record.spec.scopes"
                label="作用域"
                :span="2"
              >
                <Tag
                  v-for="scope in record.spec.scopes"
                  :key="scope"
                  color="purple"
                >
                  {{ scope }}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div class="resources-section">
              <h4 class="resources-title">
                资源限制与使用情况 ({{
                  Object.keys(record.status?.hard || {}).length
                }})
              </h4>
              <div class="resources-grid">
                <Card
                  v-for="(hardValue, resource) in record.status?.hard"
                  :key="resource"
                  class="resource-card"
                  size="small"
                >
                  <div class="resource-header">
                    <span class="resource-name">{{ resource }}</span>
                    <Tag
                      :color="
                        getUsageColor(
                          calculateUsagePercent(
                            record.status!.used![resource] || '0',
                            hardValue,
                          ),
                        )
                      "
                    >
                      {{
                        calculateUsagePercent(
                          record.status!.used![resource] || '0',
                          hardValue,
                        )
                      }}%
                    </Tag>
                  </div>
                  <div class="resource-progress">
                    <Progress
                      :percent="
                        calculateUsagePercent(
                          record.status!.used![resource] || '0',
                          hardValue,
                        )
                      "
                      :status="
                        getUsageStatus(
                          calculateUsagePercent(
                            record.status!.used![resource] || '0',
                            hardValue,
                          ),
                        )
                      "
                      :stroke-color="
                        getUsageColor(
                          calculateUsagePercent(
                            record.status!.used![resource] || '0',
                            hardValue,
                          ),
                        )
                      "
                      size="small"
                    />
                  </div>
                  <div class="resource-values">
                    <div class="value-row">
                      <span class="value-label">已使用:</span>
                      <code class="value-text used">{{
                        formatResourceValue(record.status!.used![resource])
                      }}</code>
                    </div>
                    <div class="value-row">
                      <span class="value-label">硬限制:</span>
                      <code class="value-text hard">{{
                        formatResourceValue(hardValue)
                      }}</code>
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
.resource-quotas-container {
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

.usage-cell {
  width: 100%;
}

.scopes-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.empty-text {
  color: var(--vben-text-color-secondary);
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

.resources-section {
  margin-top: 16px;
}

.resources-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.resource-card {
  border: 1px solid var(--vben-border-color);
  transition: all 0.3s ease;
}

.resource-card:hover {
  border-color: var(--vben-primary-color);
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.resource-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.resource-name {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.resource-progress {
  margin-bottom: 12px;
}

.resource-values {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.value-row {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.value-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--vben-text-color-secondary);
}

.value-text {
  padding: 2px 6px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  border-radius: 3px;
}

.value-text.used {
  color: var(--vben-primary-color);
  background-color: rgb(24 144 255 / 10%);
}

.value-text.hard {
  color: var(--vben-text-color);
  background-color: rgb(0 0 0 / 5%);
}

html[data-theme='dark'] .value-text.hard {
  background-color: rgb(255 255 255 / 5%);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--vben-border-color);
}
</style>
