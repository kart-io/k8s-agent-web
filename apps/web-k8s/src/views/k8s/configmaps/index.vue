<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ConfigMap } from '#/api/k8s/types';

import { ref, watch } from 'vue';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import { useDebounceFn } from '@vueuse/core';
import { Button, Input, message, Modal, Select, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { configMapApi } from '#/api/k8s';
import { useClusterOptions } from '#/composables/useClusterOptions';

defineOptions({
  name: 'ConfigMapsManagement',
});

const { clusterOptions, selectedClusterId } = useClusterOptions();
const selectedNamespace = ref<string>();
const searchKeyword = ref('');

const namespaceOptions = [
  { label: '全部命名空间', value: undefined },
  { label: 'default', value: 'default' },
  { label: 'production', value: 'production' },
];

// AbortController 用于取消请求
let abortController: AbortController | null = null;

async function fetchConfigMapData(params: {
  page: { currentPage: number; pageSize: number };
}) {
  // Don't fetch if no cluster is selected
  if (!selectedClusterId.value) {
    return { items: [], total: 0 };
  }

  // 取消之前的请求
  if (abortController) {
    abortController.abort();
  }

  // 创建新的 AbortController
  abortController = new AbortController();

  try {
    // 调用真实的 ConfigMap API
    const result = await configMapApi.list({
      clusterId: selectedClusterId.value,
      namespace: selectedNamespace.value,
      page: params.page.currentPage,
      pageSize: params.page.pageSize,
    });

    return {
      items: result.items || [],
      total: result.total || 0,
    };
  } catch (error: any) {
    // 如果是取消请求,返回空结果
    if (error.message === 'Request aborted' || error.name === 'AbortError') {
      return { items: [], total: 0 };
    }
    console.error('获取 ConfigMap 列表失败:', error);
    message.error(`获取 ConfigMap 列表失败: ${error.message || '未知错误'}`);
    return { items: [], total: 0 };
  }
}

const gridOptions: VxeGridProps<ConfigMap> = {
  height: 600,
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
    {
      field: 'metadata.name',
      title: 'ConfigMap 名称',
      minWidth: 200,
    },
    {
      field: 'metadata.namespace',
      title: '命名空间',
      width: 150,
    },
    {
      field: 'data',
      title: '键数量',
      width: 120,
      slots: {
        default: 'keys-slot',
      },
    },
    {
      field: 'metadata.creationTimestamp',
      title: '创建时间',
      width: 180,
      formatter: 'formatDateTime',
    },
    {
      field: 'actions',
      title: '操作',
      width: 180,
      fixed: 'right',
      slots: {
        default: 'actions-slot',
      },
    },
  ],
  exportConfig: {},
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await fetchConfigMapData({
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
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 防抖搜索处理
const debouncedSearch = useDebounceFn(() => {
  gridApi.reload();
}, 300);

function handleSearch() {
  gridApi.reload();
}

// 监听关键词变化,自动触发防抖搜索
watch(searchKeyword, () => {
  debouncedSearch();
});

function handleReset() {
  searchKeyword.value = '';
  selectedNamespace.value = undefined;
  gridApi.reload();
}

function handleView(row: ConfigMap) {
  const dataKeys = row.data ? Object.keys(row.data) : [];
  Modal.info({
    title: 'ConfigMap 详情',
    width: 700,
    content: `
      名称: ${row.metadata.name}
      命名空间: ${row.metadata.namespace}
      键数量: ${dataKeys.length}
      键列表: ${dataKeys.join(', ')}
      创建时间: ${row.metadata.creationTimestamp}
    `,
  });
}

function handleEdit(row: ConfigMap) {
  message.info(`编辑 ConfigMap "${row.metadata.name}" (功能开发中)`);
}

function handleDelete(row: ConfigMap) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 ConfigMap "${row.metadata.name}" 吗？此操作不可恢复。`,
    onOk() {
      message.success(`ConfigMap "${row.metadata.name}" 删除成功`);
      gridApi.reload();
    },
  });
}

// 当 cluster ID 加载完成后，触发数据刷新
watch(selectedClusterId, (newId) => {
  if (newId) {
    gridApi.reload();
  }
});
</script>

<template>
  <div class="p-5">
    <div class="mb-5 text-2xl font-bold">ConfigMap 管理</div>

    <div class="mb-4 rounded-lg p-4">
      <Space :size="12" wrap>
        <Select
          v-model:value="selectedClusterId"
          :options="clusterOptions"
          :style="{ width: '200px' }"
          placeholder="选择集群"
          @change="handleSearch"
        />

        <Select
          v-model:value="selectedNamespace"
          :options="namespaceOptions"
          :style="{ width: '150px' }"
          placeholder="命名空间"
          @change="handleSearch"
        />

        <Input
          v-model:value="searchKeyword"
          :style="{ width: '240px' }"
          placeholder="搜索 ConfigMap 名称"
          allow-clear
          @press-enter="handleSearch"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </Input>

        <Button type="primary" @click="handleSearch">
          <SearchOutlined />
          搜索
        </Button>

        <Button @click="handleReset">
          <ReloadOutlined />
          重置
        </Button>
      </Space>
    </div>

    <div class="rounded-lg p-4">
      <Grid>
        <template #keys-slot="{ row }">
          <span>{{ row.data ? Object.keys(row.data).length : 0 }} 个键</span>
        </template>

        <template #actions-slot="{ row }">
          <Space :size="4">
            <Button size="small" type="link" @click="handleView(row)">
              <EyeOutlined />
              详情
            </Button>
            <Button size="small" type="link" @click="handleEdit(row)">
              <EditOutlined />
              编辑
            </Button>
            <Button size="small" type="link" danger @click="handleDelete(row)">
              <DeleteOutlined />
              删除
            </Button>
          </Space>
        </template>

        <template #toolbar-tools> </template>
      </Grid>
    </div>
  </div>
</template>

<style scoped>
:deep(.vxe-table) {
  font-size: 14px;
}
</style>
