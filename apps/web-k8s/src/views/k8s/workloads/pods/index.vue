<script lang="ts" setup>
/**
 * Pod 管理页面
 * 使用通用 ResourceList 组件和配置系统
 * 代码从 290+ 行减少到 ~100 行
 */
import type { Pod } from '#/api/k8s/types';
import type { ResourceListConfig } from '#/types/k8s-resource-base';

import { computed, ref } from 'vue';

import { Modal } from 'ant-design-vue';

import { getMockPodList } from '#/api/k8s/mock';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

import DetailDrawer from './DetailDrawer.vue';
import LogDrawer from './LogDrawer.vue';

defineOptions({
  name: 'PodsManagement',
});

// 日志抽屉状态
const logDrawerVisible = ref(false);
const selectedPod = ref<null | Pod>(null);
const currentClusterId = ref('cluster-prod-01');

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedDetailPod = ref<null | Pod>(null);

/**
 * 打开日志抽屉
 */
function openLogDrawer(pod: Pod) {
  selectedPod.value = pod;
  logDrawerVisible.value = true;
}

/**
 * 打开详情抽屉
 */
function openDetailDrawer(pod: Pod) {
  selectedDetailPod.value = pod;
  detailDrawerVisible.value = true;
}

/**
 * Pod 列表配置
 */
const config = computed<ResourceListConfig<Pod>>(() => ({
  resourceType: 'pod',
  resourceLabel: 'Pod',

  // 数据获取函数
  fetchData: async (params) => {
    currentClusterId.value = params.clusterId || 'cluster-prod-01';
    const result = getMockPodList({
      clusterId: currentClusterId.value,
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
        openDetailDrawer(row);
      },
    },
    {
      action: 'logs',
      label: '日志',
      handler: (row: Pod) => {
        openLogDrawer(row);
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
            // message.success(`Pod "${row.metadata.name}" 删除成功`);
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
  <div>
    <ResourceList :config="config" />

    <!-- 日志抽屉 -->
    <LogDrawer
      v-model:visible="logDrawerVisible"
      :pod="selectedPod"
      :cluster-id="currentClusterId"
    />

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :pod="selectedDetailPod"
    />
  </div>
</template>
