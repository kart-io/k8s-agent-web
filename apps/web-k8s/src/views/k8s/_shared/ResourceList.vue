<script lang="ts" setup>
/**
 * 通用资源列表组件
 * 封装了资源列表的通用功能，包括筛选、分页、操作等
 */
import type { VxeGridProps } from '#/adapter/vxe-table';
import type {
  ResourceActionConfig,
  ResourceListConfig,
} from '#/types/k8s-resource-base';

import { computed } from 'vue';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue';
import { Button, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { useK8sResource } from '#/composables/useK8sResource';
import { useResourceActions } from '#/composables/useResourceActions';

import ResourceFilter from './ResourceFilter.vue';
import StatusTag from './StatusTag.vue';

interface Props {
  /** 资源列表配置 */
  config: ResourceListConfig<any>;
}

const props = defineProps<Props>();

// 使用资源管理 composable
const resourceState = useK8sResource({
  fetchData: props.config.fetchData,
  filters: props.config.filters,
});

// 构建 Grid 配置
const gridOptions = computed<VxeGridProps<any>>(() => {
  const baseOptions: VxeGridProps<any> = {
    height: '100%',
    checkboxConfig: {
      highlight: true,
    },
    scrollY: {
      enabled: true,
      mode: 'wheel',
    },
    columns: [
      { title: '序号', type: 'seq', width: 60 },
      { align: 'left', title: '选择', type: 'checkbox', width: 80 },
      ...props.config.columns,
    ] as any,
    exportConfig: {},
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          return await resourceState.fetchResourceData({
            page: { currentPage: page.currentPage, pageSize: page.pageSize },
          });
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: true,
      refresh: true,
      zoom: true,
    },
    ...props.config.gridOptions,
  };

  // 如果有操作列配置，添加操作列
  if (props.config.actions && props.config.actions.length > 0) {
    baseOptions.columns!.push({
      field: 'actions',
      title: '操作',
      width: calculateActionsWidth(props.config.actions),
      fixed: 'right',
      slots: {
        default: 'actions-slot',
      },
    } as any);
  }

  return baseOptions;
});

// 计算操作列宽度
function calculateActionsWidth(actions: ResourceActionConfig[]): number {
  return Math.max(150, actions.length * 60);
}

// 创建 Grid
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 使用资源操作 composable
useResourceActions({
  resourceType: props.config.resourceType,
  resourceLabel: props.config.resourceLabel,
  onReload: () => gridApi.reload(),
});

// 设置重新加载回调
resourceState.setReloadCallback(() => gridApi.reload());

// 获取状态列的插槽名称
const statusSlotName = computed(() => {
  if (!props.config.statusConfig) return null;

  const statusColumn = props.config.columns.find(
    (col) => col.field === props.config.statusConfig!.field,
  );

  return statusColumn?.slots?.default || null;
});

// 获取嵌套属性值
function getNestedValue(obj: any, path: string) {
  const parts = path.split('.');
  let current = obj;
  for (const prop of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[prop];
  }
  return current;
}

// 获取操作的图标
function getActionIcon(action: string) {
  const iconMap: Record<string, any> = {
    view: EyeOutlined,
    edit: EditOutlined,
    delete: DeleteOutlined,
  };
  return iconMap[action];
}

// 执行操作
function executeAction(action: ResourceActionConfig, row: any) {
  if (action.show && !action.show(row)) {
    return;
  }
  action.handler(row);
}

// 获取操作的标签文本
function getActionLabel(action: ResourceActionConfig, row: any): string {
  if (typeof action.label === 'function') {
    return action.label(row);
  }
  return action.label;
}
</script>

<template>
  <div class="resource-list-container">
    <!-- 标题 -->
    <div class="resource-list-header">
      <div class="mb-1 text-2xl font-bold">{{ config.resourceLabel }} 管理</div>

      <!-- 筛选器 -->
      <ResourceFilter
        v-model:cluster-id="resourceState.selectedClusterId.value"
        v-model:namespace="resourceState.selectedNamespace.value"
        v-model:keyword="resourceState.searchKeyword.value"
        :show-cluster-selector="resourceState.showClusterSelector"
        :show-namespace-selector="resourceState.showNamespaceSelector"
        :show-search="resourceState.showSearch"
        :search-placeholder="resourceState.searchPlaceholder"
        :cluster-options="resourceState.clusterOptions"
        :namespace-options="resourceState.namespaceOptions"
        @search="resourceState.handleSearch"
        @reset="resourceState.handleReset"
      >
        <template #custom-filters>
          <slot name="custom-filters"></slot>
        </template>
        <template #actions>
          <slot name="filter-actions"></slot>
        </template>
      </ResourceFilter>
    </div>

    <!-- 数据表格 -->
    <div class="resource-list-table">
      <Grid>
        <!-- 状态标签插槽 -->
        <template v-if="statusSlotName" #[statusSlotName]="{ row }">
          <StatusTag
            :status="getNestedValue(row, config.statusConfig!.field)"
            :status-map="config.statusConfig!.statusMap"
          />
        </template>

        <!-- 操作列插槽 -->
        <template v-if="config.actions" #actions-slot="{ row }">
          <Space :size="4">
            <Button
              v-for="action in config.actions"
              :key="action.action"
              size="small"
              type="link"
              :danger="action.danger"
              @click="executeAction(action, row)"
            >
              <component
                :is="getActionIcon(action.action)"
                v-if="action.icon !== false"
              />
              {{ getActionLabel(action, row) }}
            </Button>
          </Space>
        </template>

        <!-- 工具栏工具插槽 -->
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="() => gridApi.query()">
            刷新当前页
          </Button>
          <slot name="toolbar-tools" :grid-api="gridApi"></slot>
        </template>

        <!-- 自定义插槽透传 -->
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps"></slot>
        </template>
      </Grid>
    </div>
  </div>
</template>

<style scoped>
.resource-list-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  overflow: hidden;
}

.resource-list-header {
  flex-shrink: 0;
}

.resource-list-table {
  flex: 1;
  min-height: 0;
  padding: 16px;
  padding-top: 0;
  margin-top: 0;
  background-color: var(--vben-background-color);
  border-radius: 0 0 8px 8px;
}

:deep(.vxe-table) {
  margin-top: 0 !important;
  font-size: 14px;
}

:deep(.vxe-grid) {
  margin-top: 0 !important;
}
</style>
