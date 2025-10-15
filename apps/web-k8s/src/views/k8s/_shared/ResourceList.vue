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
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue';
import { Button, Dropdown, Menu, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { useK8sResource } from '#/composables/useK8sResource';
import { useResourceActions } from '#/composables/useResourceActions';

import ResourceFilter from './ResourceFilter.vue';
import StatusTag from './StatusTag.vue';

interface Props {
  /** 资源列表配置 */
  config: ResourceListConfig<any>;
  /** 操作列显示模式：all=全部显示, dropdown=下拉菜单, auto=自动（超过3个使用下拉） */
  actionMode?: 'all' | 'auto' | 'dropdown';
  /** 使用下拉菜单时，独立显示的主要操作（默认为第一个操作） */
  primaryActions?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  actionMode: 'auto',
  primaryActions: () => [],
});

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
  // 基础宽度：边距 + 间距
  let totalWidth = 40;

  // 判断是否使用下拉模式
  const willUseDropdown =
    props.actionMode === 'dropdown' ||
    (props.actionMode === 'auto' && actions.length > 3);

  if (willUseDropdown) {
    // 下拉模式：计算主要操作 + "更多"按钮
    const primaryCount =
      props.primaryActions.length > 0 ? props.primaryActions.length : 1;
    const primaryActions = actions.slice(0, primaryCount);

    primaryActions.forEach((action) => {
      const iconWidth = action.icon === false ? 0 : 20;
      const labelText =
        typeof action.label === 'string' ? action.label : '操作';
      const textWidth = [...labelText].reduce((width, char) => {
        return width + (/[\u4E00-\u9FA5]/.test(char) ? 14 : 8);
      }, 0);
      const padding = 16;
      totalWidth += iconWidth + textWidth + padding + 8;
    });

    // 添加"更多"按钮的宽度（"更多" + 图标 = 约 70px）
    totalWidth += 70;

    return Math.max(150, Math.ceil(totalWidth));
  }

  // 全部显示模式：计算所有操作
  actions.forEach((action) => {
    const iconWidth = action.icon === false ? 0 : 20;
    const labelText = typeof action.label === 'string' ? action.label : '操作';
    const textWidth = [...labelText].reduce((width, char) => {
      return width + (/[\u4E00-\u9FA5]/.test(char) ? 14 : 8);
    }, 0);
    const padding = 16;
    totalWidth += iconWidth + textWidth + padding + 8; // 8px 间距
  });

  return Math.max(150, Math.ceil(totalWidth));
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

// 判断是否使用下拉菜单模式
const useDropdown = computed(() => {
  if (!props.config.actions || props.config.actions.length === 0) return false;

  if (props.actionMode === 'all') return false;
  if (props.actionMode === 'dropdown') return true;

  // auto 模式：超过3个操作使用下拉
  return props.config.actions.length > 3;
});

// 获取主要操作（独立显示的按钮）
function getPrimaryActions(_row: any): ResourceActionConfig[] {
  if (!props.config.actions) return [];
  if (!useDropdown.value) return props.config.actions;

  // 如果指定了 primaryActions，使用指定的
  if (props.primaryActions.length > 0) {
    return props.config.actions.filter((action) =>
      props.primaryActions.includes(action.action),
    );
  }

  // 默认第一个操作为主要操作
  return props.config.actions.slice(0, 1);
}

// 获取下拉菜单中的操作
function getDropdownActions(_row: any): ResourceActionConfig[] {
  if (!props.config.actions) return [];
  if (!useDropdown.value) return [];

  // 如果指定了 primaryActions，其余的放入下拉
  if (props.primaryActions.length > 0) {
    return props.config.actions.filter(
      (action) => !props.primaryActions.includes(action.action),
    );
  }

  // 默认除第一个外的操作放入下拉
  return props.config.actions.slice(1);
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
          <Space :size="8">
            <!-- 主要操作按钮 -->
            <Button
              v-for="action in getPrimaryActions(row)"
              :key="action.action"
              v-show="!action.show || action.show(row)"
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

            <!-- 下拉菜单（更多操作） -->
            <Dropdown v-if="useDropdown && getDropdownActions(row).length > 0">
              <Button size="small" type="link"> 更多<DownOutlined /> </Button>
              <template #overlay>
                <Menu>
                  <template
                    v-for="(action, index) in getDropdownActions(row)"
                    :key="action.action"
                  >
                    <Menu.Item
                      v-show="!action.show || action.show(row)"
                      :danger="action.danger"
                      @click="executeAction(action, row)"
                    >
                      <component
                        :is="getActionIcon(action.action)"
                        v-if="action.icon !== false"
                      />
                      {{ getActionLabel(action, row) }}
                    </Menu.Item>
                    <!-- 如果操作有 divider 属性，添加分隔线 -->
                    <Menu.Divider
                      v-if="
                        action.divider &&
                        index < getDropdownActions(row).length - 1
                      "
                    />
                  </template>
                </Menu>
              </template>
            </Dropdown>
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
