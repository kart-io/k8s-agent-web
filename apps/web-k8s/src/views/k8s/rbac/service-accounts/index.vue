<script lang="ts" setup>
/**
 * Kubernetes ServiceAccount 列表页面
 * 展示服务账号及其关联的 Secrets 和权限绑定
 */
import type { ServiceAccount, ServiceAccountListParams } from '#/api/k8s/types';

import { computed, onMounted, ref } from 'vue';

import {
  Card,
  message,
  Pagination,
  Select,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  KeyOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';

import { getMockServiceAccountList } from '#/api/k8s/mock';

// 当前选中的集群ID（暂时使用固定值）
const currentClusterId = ref('cluster-production-01');

// 加载状态
const loading = ref(false);

// ServiceAccounts 数据
const serviceAccounts = ref<ServiceAccount[]>([]);
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
    title: 'Secrets',
    key: 'secrets',
    width: 120,
  },
  {
    title: '自动挂载 Token',
    key: 'automount',
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
 * 加载 ServiceAccounts 列表
 */
async function loadServiceAccounts() {
  loading.value = true;
  try {
    const params: ServiceAccountListParams = {
      clusterId: currentClusterId.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filters.value,
    };

    const result = getMockServiceAccountList(params);
    serviceAccounts.value = result.items;
    total.value = result.total;
  } catch (error: any) {
    message.error(`加载 ServiceAccounts 失败: ${error.message}`);
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
 * 处理筛选变化
 */
function handleFilterChange() {
  currentPage.value = 1;
  loadServiceAccounts();
}

/**
 * 处理分页变化
 */
function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  loadServiceAccounts();
}

/**
 * 重置筛选
 */
function resetFilters() {
  filters.value = {
    namespace: undefined,
  };
  currentPage.value = 1;
  loadServiceAccounts();
}

// 组件挂载时加载数据
onMounted(() => {
  loadServiceAccounts();
});
</script>

<template>
  <div class="service-accounts-container">
    <!-- 筛选区域 -->
    <Card class="filter-card" :bordered="false">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">命名空间</label>
          <Select
            v-model:value="filters.namespace"
            :options="namespaceOptions"
            placeholder="选择命名空间"
            style="width: 200px"
            @change="handleFilterChange"
          />
        </div>

        <a-button type="link" @click="resetFilters">
          重置筛选
        </a-button>
      </div>
    </Card>

    <!-- ServiceAccounts 列表 -->
    <Card class="table-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <UserOutlined class="title-icon" />
          <span>ServiceAccounts ({{ total }})</span>
        </div>
      </template>

      <Table
        :columns="columns"
        :data-source="serviceAccounts"
        :loading="loading"
        :pagination="false"
        :row-key="(record) => record.metadata.uid || record.metadata.name"
        :scroll="{ x: 'max-content' }"
      >
        <!-- 名称列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="name-cell">
              <UserOutlined class="name-icon" />
              <Tooltip :title="record.metadata.name">
                <span class="name-text">{{ record.metadata.name }}</span>
              </Tooltip>
            </div>
          </template>

          <!-- Secrets 列 -->
          <template v-else-if="column.key === 'secrets'">
            <div class="secrets-cell">
              <template v-if="record.secrets && record.secrets.length > 0">
                <KeyOutlined class="secret-icon" />
                <Tooltip>
                  <template #title>
                    <div v-for="secret in record.secrets" :key="secret.name" class="secret-tooltip-item">
                      {{ secret.name }}
                    </div>
                  </template>
                  <span class="secret-count">{{ record.secrets.length }}</span>
                </Tooltip>
              </template>
              <span v-else class="no-secrets">-</span>
            </div>
          </template>

          <!-- 自动挂载 Token 列 -->
          <template v-else-if="column.key === 'automount'">
            <Tag v-if="record.automountServiceAccountToken === true" color="green">
              <CheckCircleOutlined />
              启用
            </Tag>
            <Tag v-else-if="record.automountServiceAccountToken === false" color="red">
              <CloseCircleOutlined />
              禁用
            </Tag>
            <Tag v-else color="default">
              默认
            </Tag>
          </template>

          <!-- 创建时间列 -->
          <template v-else-if="column.key === 'creationTimestamp'">
            <Tooltip :title="formatDateTime(record.metadata.creationTimestamp!)">
              <span class="time-text">
                {{ formatRelativeTime(record.metadata.creationTimestamp!) }}
              </span>
            </Tooltip>
          </template>
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
.service-accounts-container {
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
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--vben-text-color);
}

.table-card {
  flex: 1;
  background-color: var(--vben-background-color);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.title-icon {
  font-size: 18px;
  color: var(--vben-primary-color);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-icon {
  color: var(--vben-primary-color);
}

.name-text {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  color: var(--vben-text-color);
}

.secrets-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.secret-icon {
  color: var(--vben-warning-color);
}

.secret-count {
  font-weight: 600;
  color: var(--vben-text-color);
}

.no-secrets {
  color: var(--vben-text-color-secondary);
}

.secret-tooltip-item {
  padding: 4px 0;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
}

.time-text {
  font-size: 13px;
  color: var(--vben-text-color-secondary);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--vben-border-color);
}
</style>
