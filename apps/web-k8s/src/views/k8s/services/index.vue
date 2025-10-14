<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Service } from '#/api/k8s/types';

import { ref, watch } from 'vue';

import { Button, Input, message, Modal, Select, Space, Tag } from 'ant-design-vue';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import { useDebounceFn } from '@vueuse/core';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { getMockServiceList } from '#/api/k8s/mock';

defineOptions({
  name: 'ServicesManagement',
});

const selectedClusterId = ref('cluster-prod-01');
const selectedNamespace = ref<string>();
const searchKeyword = ref('');

const clusterOptions = [
  { label: 'Production Cluster', value: 'cluster-prod-01' },
  { label: 'Staging Cluster', value: 'cluster-staging-01' },
  { label: 'Development Cluster', value: 'cluster-dev-01' },
];

const namespaceOptions = [
  { label: '全部命名空间', value: undefined },
  { label: 'default', value: 'default' },
  { label: 'production', value: 'production' },
];

// AbortController 用于取消请求
let abortController: AbortController | null = null;

async function fetchServiceData(params: { page: { currentPage: number; pageSize: number } }) {
  // 取消之前的请求
  if (abortController) {
    abortController.abort();
  }

  // 创建新的 AbortController
  abortController = new AbortController();

  try {
    // 模拟 API 延迟
    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, 500);
      abortController!.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Request aborted'));
      });
    });

    const result = getMockServiceList({
      clusterId: selectedClusterId.value,
      namespace: selectedNamespace.value,
      page: params.page.currentPage,
      pageSize: params.page.pageSize,
    });

    return {
      items: result.items,
      total: result.total,
    };
  } catch (error: any) {
    // 如果是取消请求,返回空结果
    if (error.message === 'Request aborted') {
      return { items: [], total: 0 };
    }
    throw error;
  }
}

const gridOptions: VxeGridProps<Service> = {
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
      title: 'Service 名称',
      minWidth: 200,
    },
    {
      field: 'metadata.namespace',
      title: '命名空间',
      width: 150,
    },
    {
      field: 'spec.type',
      title: '类型',
      width: 150,
      slots: {
        default: 'type-slot',
      },
    },
    {
      field: 'spec.clusterIP',
      title: 'Cluster IP',
      width: 150,
    },
    {
      field: 'spec.ports',
      title: '端口',
      width: 150,
      slots: {
        default: 'ports-slot',
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
        return await fetchServiceData({
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

function handleView(row: Service) {
  Modal.info({
    title: 'Service 详情',
    width: 700,
    content: `
      名称: ${row.metadata.name}
      命名空间: ${row.metadata.namespace}
      类型: ${row.spec.type}
      Cluster IP: ${row.spec.clusterIP}
      端口: ${row.spec.ports.map((p) => `${p.port}:${p.targetPort}`).join(', ')}
      创建时间: ${row.metadata.creationTimestamp}
    `,
  });
}

function handleEdit(row: Service) {
  message.info(`编辑 Service "${row.metadata.name}" (功能开发中)`);
}

function handleDelete(row: Service) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 Service "${row.metadata.name}" 吗？此操作不可恢复。`,
    onOk() {
      message.success(`Service "${row.metadata.name}" 删除成功`);
      gridApi.reload();
    },
  });
}
</script>

<template>
  <div class="p-5">
    <div class="mb-5 text-2xl font-bold">Service 管理</div>

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
          placeholder="搜索 Service 名称"
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
        <template #type-slot="{ row }">
          <Tag :color="row.spec.type === 'ClusterIP' ? 'blue' : 'green'">
            {{ row.spec.type }}
          </Tag>
        </template>

        <template #ports-slot="{ row }">
          <span>{{ row.spec.ports.map((p) => `${p.port}:${p.targetPort}`).join(', ') }}</span>
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

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="() => gridApi.query()">
            刷新当前页
          </Button>
        </template>
      </Grid>
    </div>
  </div>
</template>

<style scoped>
:deep(.vxe-table) {
  font-size: 14px;
}
</style>
