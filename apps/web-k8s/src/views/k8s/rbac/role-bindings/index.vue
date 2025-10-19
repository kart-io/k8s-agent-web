<script lang="ts" setup>
/**
 * Kubernetes RoleBinding 列表页面
 * 展示角色绑定关系：将 Subject (User/Group/ServiceAccount) 绑定到 Role
 */
import type {
  RoleBinding,
  RoleBindingListParams,
  Subject,
} from '#/api/k8s/types';

import { computed, onMounted, ref } from 'vue';

import {
  LinkOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
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

import { roleBindingApi } from '#/api/k8s';

// 当前选中的集群ID（暂时使用固定值）
const currentClusterId = ref('cluster-production-01');

// 加载状态
const loading = ref(false);

// RoleBindings 数据
const roleBindings = ref<RoleBinding[]>([]);
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
    title: 'Role',
    key: 'role',
    width: 200,
  },
  {
    title: 'Subjects',
    key: 'subjects',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: ['metadata', 'creationTimestamp'],
    key: 'creationTimestamp',
    width: 200,
  },
];

/**
 * 加载 RoleBindings 列表
 */
async function loadRoleBindings() {
  loading.value = true;
  try {
    const params: RoleBindingListParams = {
      clusterId: currentClusterId.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filters.value,
    };

    const result = await roleBindingApi.list(params);
    roleBindings.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    message.error(`加载 RoleBindings 失败: ${error.message}`);
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
 * 获取 Subject 类型的颜色
 */
function getSubjectTypeColor(kind: string): string {
  switch (kind) {
    case 'Group': {
      return 'purple';
    }
    case 'ServiceAccount': {
      return 'green';
    }
    case 'User': {
      return 'blue';
    }
    default: {
      return 'default';
    }
  }
}

/**
 * 获取 Subject 类型的图标
 */
function getSubjectTypeIcon(kind: string) {
  switch (kind) {
    case 'Group': {
      return TeamOutlined;
    }
    case 'ServiceAccount': {
      return UserOutlined;
    }
    case 'User': {
      return UserOutlined;
    }
    default: {
      return UserOutlined;
    }
  }
}

/**
 * 格式化 Subject 显示名称
 */
function formatSubjectName(subject: Subject): string {
  if (subject.kind === 'ServiceAccount' && subject.namespace) {
    return `${subject.namespace}/${subject.name}`;
  }
  return subject.name;
}

/**
 * 生成 Subjects 摘要
 */
function getSubjectsSummary(subjects?: Subject[]): string {
  if (!subjects || subjects.length === 0) return '-';

  const firstSubject = subjects[0];
  const displayName = formatSubjectName(firstSubject);
  const more = subjects.length > 1 ? ` +${subjects.length - 1}` : '';

  return `${firstSubject.kind}: ${displayName}${more}`;
}

/**
 * 处理筛选变化
 */
function handleFilterChange() {
  currentPage.value = 1;
  loadRoleBindings();
}

/**
 * 处理分页变化
 */
function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  loadRoleBindings();
}

/**
 * 重置筛选
 */
function resetFilters() {
  filters.value = {
    namespace: undefined,
  };
  currentPage.value = 1;
  loadRoleBindings();
}

// 组件挂载时加载数据
onMounted(() => {
  loadRoleBindings();
});
</script>

<template>
  <div class="role-bindings-container">
    <!-- 筛选区域 -->
    <Card class="filter-card" :bordered="false">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">命名空间:</label>
          <Select
            v-model:value="filters.namespace"
            :options="namespaceOptions"
            placeholder="选择命名空间"
            style="width: 200px"
            @change="handleFilterChange"
          />
        </div>

        <Button @click="resetFilters"> 重置筛选 </Button>
      </div>
    </Card>

    <!-- RoleBindings 列表 -->
    <Card class="table-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <LinkOutlined class="title-icon" />
          <span>RoleBindings ({{ total }})</span>
        </div>
      </template>

      <Table
        :columns="columns"
        :data-source="roleBindings"
        :loading="loading"
        :pagination="false"
        :row-key="(record) => record.metadata.uid || record.metadata.name"
        :scroll="{ x: 'max-content' }"
        :expandable="{
          expandedRowRender: (record) => record,
        }"
      >
        <!-- 名称列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="name-cell">
              <LinkOutlined class="name-icon" />
              <Tooltip :title="record.metadata.name">
                <span class="name-text">{{ record.metadata.name }}</span>
              </Tooltip>
            </div>
          </template>

          <!-- Role 列 -->
          <template v-else-if="column.key === 'role'">
            <Tag color="orange">
              {{ record.roleRef.kind }}: {{ record.roleRef.name }}
            </Tag>
          </template>

          <!-- Subjects 列 -->
          <template v-else-if="column.key === 'subjects'">
            <Tooltip :title="getSubjectsSummary(record.subjects)">
              <span class="subjects-summary">
                {{ getSubjectsSummary(record.subjects) }}
              </span>
            </Tooltip>
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
            <Descriptions title="绑定详情" :column="2" bordered size="small">
              <Descriptions.Item label="绑定名称" :span="2">
                {{ record.metadata.name }}
              </Descriptions.Item>
              <Descriptions.Item label="命名空间">
                {{ record.metadata.namespace }}
              </Descriptions.Item>
              <Descriptions.Item label="UID">
                <code>{{ record.metadata.uid }}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Role 类型">
                <Tag color="orange">{{ record.roleRef.kind }}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Role 名称">
                <code>{{ record.roleRef.name }}</code>
              </Descriptions.Item>
            </Descriptions>

            <div class="subjects-section">
              <h4 class="subjects-title">
                绑定主体 ({{ record.subjects?.length || 0 }})
              </h4>
              <div
                v-if="record.subjects && record.subjects.length > 0"
                class="subjects-list"
              >
                <Card
                  v-for="(subject, index) in record.subjects"
                  :key="`subject-${index}`"
                  class="subject-card"
                  size="small"
                >
                  <div class="subject-header">
                    <component
                      :is="getSubjectTypeIcon(subject.kind)"
                      class="subject-icon"
                    />
                    <Tag :color="getSubjectTypeColor(subject.kind)">
                      {{ subject.kind }}
                    </Tag>
                  </div>
                  <div class="subject-details">
                    <div class="subject-row">
                      <span class="subject-label">名称:</span>
                      <code class="subject-value">{{ subject.name }}</code>
                    </div>
                    <div v-if="subject.namespace" class="subject-row">
                      <span class="subject-label">命名空间:</span>
                      <code class="subject-value">{{ subject.namespace }}</code>
                    </div>
                    <div v-if="subject.apiGroup" class="subject-row">
                      <span class="subject-label">API Group:</span>
                      <code class="subject-value">{{ subject.apiGroup }}</code>
                    </div>
                  </div>
                </Card>
              </div>
              <div v-else class="no-subjects">暂无绑定主体</div>
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
.role-bindings-container {
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

.subjects-summary {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
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

.subjects-section {
  margin-top: 16px;
}

.subjects-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.subjects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.subject-card {
  border: 1px solid var(--vben-border-color);
  transition: all 0.3s ease;
}

.subject-card:hover {
  border-color: var(--vben-primary-color);
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.subject-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.subject-icon {
  font-size: 16px;
  color: var(--vben-primary-color);
}

.subject-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subject-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.subject-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--vben-text-color-secondary);
}

.subject-value {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  color: var(--vben-text-color);
}

.no-subjects {
  padding: 24px;
  font-size: 14px;
  color: var(--vben-text-color-secondary);
  text-align: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--vben-border-color);
}
</style>
