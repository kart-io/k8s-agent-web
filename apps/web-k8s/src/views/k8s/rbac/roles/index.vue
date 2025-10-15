<script lang="ts" setup>
/**
 * Kubernetes Role 列表页面
 * 展示角色及其权限规则
 */
import type { PolicyRule, Role, RoleListParams } from '#/api/k8s/types';

import { computed, onMounted, ref } from 'vue';

import { LockOutlined, SafetyOutlined } from '@ant-design/icons-vue';
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

import { getMockRoleList } from '#/api/k8s/mock';

// 当前选中的集群ID（暂时使用固定值）
const currentClusterId = ref('cluster-production-01');

// 加载状态
const loading = ref(false);

// Roles 数据
const roles = ref<Role[]>([]);
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
    title: '规则数量',
    key: 'rulesCount',
    width: 120,
  },
  {
    title: '权限摘要',
    key: 'permissionsSummary',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: ['metadata', 'creationTimestamp'],
    key: 'creationTimestamp',
    width: 200,
  },
];

// 规则展开表格列定义
const ruleColumns = [
  {
    title: 'API Groups',
    dataIndex: 'apiGroups',
    key: 'apiGroups',
    width: 200,
  },
  {
    title: 'Resources',
    dataIndex: 'resources',
    key: 'resources',
    width: 200,
  },
  {
    title: 'Verbs',
    dataIndex: 'verbs',
    key: 'verbs',
    width: 300,
  },
];

/**
 * 加载 Roles 列表
 */
async function loadRoles() {
  loading.value = true;
  try {
    const params: RoleListParams = {
      clusterId: currentClusterId.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filters.value,
    };

    const result = getMockRoleList(params);
    roles.value = result.items;
    total.value = result.total;
  } catch (error: any) {
    message.error(`加载 Roles 失败: ${error.message}`);
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
 * 生成权限摘要
 */
function getPermissionsSummary(rules: PolicyRule[]): string {
  const allResources = new Set<string>();
  const allVerbs = new Set<string>();

  rules.forEach((rule) => {
    rule.resources?.forEach((r) => allResources.add(r));
    rule.verbs?.forEach((v) => allVerbs.add(v));
  });

  const resourcesStr = [...allResources].slice(0, 3).join(', ');
  const verbsStr = [...allVerbs].slice(0, 3).join(', ');
  const moreResources =
    allResources.size > 3 ? ` +${allResources.size - 3}` : '';
  const moreVerbs = allVerbs.size > 3 ? ` +${allVerbs.size - 3}` : '';

  return `[${resourcesStr}${moreResources}] → [${verbsStr}${moreVerbs}]`;
}

/**
 * 获取动词的颜色
 */
function getVerbColor(verb: string): string {
  const dangerousVerbs = ['create', 'update', 'delete', 'patch'];
  const moderateVerbs = ['list', 'watch'];

  if (dangerousVerbs.includes(verb)) return 'red';
  if (moderateVerbs.includes(verb)) return 'blue';
  return 'green';
}

/**
 * 处理筛选变化
 */
function handleFilterChange() {
  currentPage.value = 1;
  loadRoles();
}

/**
 * 处理分页变化
 */
function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  loadRoles();
}

/**
 * 重置筛选
 */
function resetFilters() {
  filters.value = {
    namespace: undefined,
  };
  currentPage.value = 1;
  loadRoles();
}

// 组件挂载时加载数据
onMounted(() => {
  loadRoles();
});
</script>

<template>
  <div class="roles-container">
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

        <Button type="link" @click="resetFilters"> 重置筛选 </Button>
      </div>
    </Card>

    <!-- Roles 列表 -->
    <Card class="table-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <LockOutlined class="title-icon" />
          <span>Roles ({{ total }})</span>
        </div>
      </template>

      <Table
        :columns="columns"
        :data-source="roles"
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
              <SafetyOutlined class="name-icon" />
              <Tooltip :title="record.metadata.name">
                <span class="name-text">{{ record.metadata.name }}</span>
              </Tooltip>
            </div>
          </template>

          <!-- 规则数量列 -->
          <template v-else-if="column.key === 'rulesCount'">
            <Tag color="blue"> {{ record.rules.length }} 条规则 </Tag>
          </template>

          <!-- 权限摘要列 -->
          <template v-else-if="column.key === 'permissionsSummary'">
            <Tooltip :title="getPermissionsSummary(record.rules)">
              <span class="permissions-summary">
                {{ getPermissionsSummary(record.rules) }}
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
            <Descriptions title="角色详情" :column="1" bordered size="small">
              <Descriptions.Item label="角色名称">
                {{ record.metadata.name }}
              </Descriptions.Item>
              <Descriptions.Item label="命名空间">
                {{ record.metadata.namespace }}
              </Descriptions.Item>
              <Descriptions.Item label="UID">
                <code>{{ record.metadata.uid }}</code>
              </Descriptions.Item>
            </Descriptions>

            <div class="rules-section">
              <h4 class="rules-title">权限规则 ({{ record.rules.length }})</h4>
              <Table
                :columns="ruleColumns"
                :data-source="record.rules"
                :pagination="false"
                :row-key="(rule, index) => `rule-${index}`"
                size="small"
                bordered
              >
                <template #bodyCell="{ column, record: rule }">
                  <template v-if="column.key === 'apiGroups'">
                    <div class="tags-cell">
                      <Tag
                        v-for="group in rule.apiGroups"
                        :key="group"
                        color="purple"
                      >
                        {{ group || '(core)' }}
                      </Tag>
                    </div>
                  </template>
                  <template v-else-if="column.key === 'resources'">
                    <div class="tags-cell">
                      <Tag
                        v-for="resource in rule.resources"
                        :key="resource"
                        color="cyan"
                      >
                        {{ resource }}
                      </Tag>
                    </div>
                  </template>
                  <template v-else-if="column.key === 'verbs'">
                    <div class="tags-cell">
                      <Tag
                        v-for="verb in rule.verbs"
                        :key="verb"
                        :color="getVerbColor(verb)"
                      >
                        {{ verb }}
                      </Tag>
                    </div>
                  </template>
                </template>
              </Table>
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
.roles-container {
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

.permissions-summary {
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

.rules-section {
  margin-top: 16px;
}

.rules-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--vben-border-color);
}
</style>
