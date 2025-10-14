<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { CronJob } from '#/api/k8s/types';

import { ref, watch } from 'vue';

import { Button, Input, message, Modal, Select, Space, Tag } from 'ant-design-vue';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import { useDebounceFn } from '@vueuse/core';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { getMockCronJobList } from '#/api/k8s/mock';

defineOptions({
  name: 'CronJobsManagement',
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

async function fetchCronJobData(params: { page: { currentPage: number; pageSize: number } }) {
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

    const result = getMockCronJobList({
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

const gridOptions: VxeGridProps<CronJob> = {
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
      title: 'CronJob 名称',
      minWidth: 200,
    },
    {
      field: 'metadata.namespace',
      title: '命名空间',
      width: 150,
    },
    {
      field: 'spec.schedule',
      title: '调度表达式',
      width: 150,
    },
    {
      field: 'spec.suspend',
      title: '状态',
      width: 120,
      slots: {
        default: 'status-slot',
      },
    },
    {
      field: 'status.lastScheduleTime',
      title: '上次调度时间',
      width: 180,
      formatter: 'formatDateTime',
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
      width: 220,
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
        return await fetchCronJobData({
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

function handleView(row: CronJob) {
  Modal.info({
    title: 'CronJob 详情',
    width: 700,
    content: `
      名称: ${row.metadata.name}
      命名空间: ${row.metadata.namespace}
      调度表达式: ${row.spec.schedule}
      状态: ${row.spec.suspend ? '已暂停' : '运行中'}
      上次调度时间: ${row.status?.lastScheduleTime ?? '未执行'}
      创建时间: ${row.metadata.creationTimestamp}
    `,
  });
}

function handleToggle(row: CronJob) {
  const action = row.spec.suspend ? '恢复' : '暂停';
  Modal.confirm({
    title: `确认${action}`,
    content: `确定要${action} CronJob "${row.metadata.name}" 吗？`,
    onOk() {
      message.success(`CronJob "${row.metadata.name}" ${action}成功`);
      gridApi.reload();
    },
  });
}

function handleEdit(row: CronJob) {
  message.info(`编辑 CronJob "${row.metadata.name}" (功能开发中)`);
}

function handleDelete(row: CronJob) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 CronJob "${row.metadata.name}" 吗？此操作不可恢复。`,
    onOk() {
      message.success(`CronJob "${row.metadata.name}" 删除成功`);
      gridApi.reload();
    },
  });
}
</script>

<template>
  <div class="p-5">
    <div class="mb-5 text-2xl font-bold">CronJob 管理</div>

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
          placeholder="搜索 CronJob 名称"
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
        <template #status-slot="{ row }">
          <Tag v-if="row.spec.suspend" color="warning">已暂停</Tag>
          <Tag v-else color="success">运行中</Tag>
        </template>

        <template #actions-slot="{ row }">
          <Space :size="4">
            <Button size="small" type="link" @click="handleView(row)">
              <EyeOutlined />
              详情
            </Button>
            <Button
              size="small"
              type="link"
              :danger="!row.spec.suspend"
              @click="handleToggle(row)"
            >
              <PauseOutlined v-if="!row.spec.suspend" />
              <PlayCircleOutlined v-else />
              {{ row.spec.suspend ? '恢复' : '暂停' }}
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
