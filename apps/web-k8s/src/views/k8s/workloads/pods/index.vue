<script lang="ts" setup>
/**
 * Pod 管理页面
 * 使用通用 ResourceList 组件和配置系统
 * 代码从 290+ 行减少到 ~100 行
 */
import type { Pod } from '#/api/k8s/types';
import type { ResourceListConfig } from '#/types/k8s-resource-base';

import { computed } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { getMockPodList } from '#/api/k8s/mock';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

defineOptions({
  name: 'PodsManagement',
});

/**
 * Pod 列表配置
 */
const config = computed<ResourceListConfig<Pod>>(() => ({
  resourceType: 'pod',
  resourceLabel: 'Pod',

  // 数据获取函数
  fetchData: async (params) => {
    const result = getMockPodList({
      clusterId: params.clusterId || 'cluster-prod-01',
      namespace: params.namespace,
      page: params.page,
      pageSize: params.pageSize,
    });
    return {
      items: result.items,
      total: result.total,
    };
  },

  // 列配置
  columns: [
    {
      field: 'metadata.name',
      title: 'Pod 名称',
      minWidth: 200,
    },
    {
      field: 'metadata.namespace',
      title: '命名空间',
      width: 150,
    },
    {
      field: 'status.phase',
      title: '状态',
      width: 120,
      slots: {
        default: 'status-slot',
      },
    },
    {
      field: 'status.podIP',
      title: 'Pod IP',
      width: 150,
    },
    {
      field: 'spec.nodeName',
      title: '节点',
      width: 150,
    },
    {
      field: 'metadata.creationTimestamp',
      title: '创建时间',
      width: 180,
      formatter: 'formatDateTime',
    },
  ],

  // 操作配置
  actions: [
    {
      action: 'view',
      label: '详情',
      handler: (row: Pod) => {
        Modal.info({
          title: 'Pod 详情',
          width: 700,
          content: `
            名称: ${row.metadata.name}
            命名空间: ${row.metadata.namespace}
            状态: ${row.status.phase}
            Pod IP: ${row.status.podIP}
            节点: ${row.spec.nodeName}
            容器数量: ${row.spec.containers.length}
            创建时间: ${row.metadata.creationTimestamp}
          `,
        });
      },
    },
    {
      action: 'logs',
      label: '日志',
      handler: (row: Pod) => {
        message.info(`查看 Pod "${row.metadata.name}" 日志 (功能开发中)`);
      },
    },
    {
      action: 'delete',
      label: '删除',
      danger: true,
      handler: (row: Pod) => {
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除 Pod "${row.metadata.name}" 吗？此操作不可恢复。`,
          onOk() {
            message.success(`Pod "${row.metadata.name}" 删除成功`);
          },
        });
      },
    },
  ],

  // 筛选器配置
  filters: {
    showClusterSelector: true,
    showNamespaceSelector: true,
    showSearch: true,
    searchPlaceholder: '搜索 Pod 名称',
  },

  // 状态标签配置
  statusConfig: {
    field: 'status.phase',
    statusMap: {
      Running: { color: 'success', label: 'Running' },
      Pending: { color: 'warning', label: 'Pending' },
      Failed: { color: 'error', label: 'Failed' },
      Succeeded: { color: 'success', label: 'Succeeded' },
      Unknown: { color: 'default', label: 'Unknown' },
    },
  },
}));
</script>

<template>
  <ResourceList :config="config" />
</template>
