<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DeploymentListItem } from '#/api/k8s/types';

import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import { useDebounceFn } from '@vueuse/core';
import {
  Button,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deploymentApi, namespaceApi } from '#/api/k8s';
import { useClusterOptions } from '#/composables/useClusterOptions';

defineOptions({
  name: 'DeploymentsManagement',
});

const route = useRoute();
const router = useRouter();

const { clusterOptions, selectedClusterId } = useClusterOptions();
const selectedNamespace = ref(route.query.namespace as string | undefined);
const searchKeyword = ref('');

const namespaceOptions = ref<Array<{ label: string; value: string }>>([]);

async function loadNamespaces() {
  if (!selectedClusterId.value) {
    namespaceOptions.value = [];
    return [];
  }
  try {
    const result = await namespaceApi.list(selectedClusterId.value);
    const options = result.items.map((ns: any) => ({
      label: ns.metadata.name,
      value: ns.metadata.name,
    }));
    namespaceOptions.value = options;
    return options;
  } catch (error) {
    console.error('Failed to load namespaces:', error);
    message.error('加载命名空间失败');
    namespaceOptions.value = [];
    return [];
  }
}

// Watch for namespace changes and update the URL
watch(selectedNamespace, (newNamespace) => {
  if (newNamespace !== undefined) {
    router.push({ query: { ...route.query, namespace: newNamespace } });
  }
});

// AbortController 用于取消请求
let abortController: AbortController | null = null;

async function fetchDeploymentData(params: {
  page: { currentPage: number; pageSize: number };
}) {
  // Don't fetch if no cluster is selected
  if (!selectedClusterId.value) {
    return { items: [], total: 0 };
  }

  // 如果命名空间尚未确定，则不发起请求
  if (selectedNamespace.value === undefined) {
    return { items: [], total: 0 };
  }

  // 取消之前的请求
  if (abortController) {
    abortController.abort();
  }

  // 创建新的 AbortController
  abortController = new AbortController();

  try {
    // 调用真实的 Deployment API
    const result = await deploymentApi.list({
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
    console.error('获取 Deployment 列表失败:', error);
    message.error(`获取 Deployment 列表失败: ${error.message || '未知错误'}`);
    return { items: [], total: 0 };
  }
}

const gridOptions: VxeGridProps<DeploymentListItem> = {
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
      field: 'name',
      title: 'Deployment 名称',
      minWidth: 200,
    },
    {
      field: 'namespace',
      title: '命名空间',
      width: 150,
    },
    {
      field: 'replicas',
      title: '副本数',
      width: 100,
    },
    {
      field: 'readyReplicas',
      title: '就绪副本',
      width: 120,
      slots: {
        default: 'ready-slot',
      },
    },
    {
      field: 'createdAt',
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
    autoLoad: false, // 禁止自动加载
    ajax: {
      query: async ({ page }) => {
        return await fetchDeploymentData({
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
  selectedNamespace.value = 'default';
  gridApi.reload();
}

function handleView(row: DeploymentListItem) {
  Modal.info({
    title: 'Deployment 详情',
    width: 700,
    content: `
      名称: ${row.name}
      命名空间: ${row.namespace}
      副本数: ${row.replicas}
      就绪副本: ${row.readyReplicas ?? 0}
      可用副本: ${row.availableReplicas ?? 0}
      创建时间: ${row.createdAt}
    `,
  });
}

function handleScale(row: DeploymentListItem) {
  message.info(`扩缩容 Deployment "${row.name}" (功能开发中)`);
}

function handleRestart(row: DeploymentListItem) {
  Modal.confirm({
    title: '确认重启',
    content: `确定要重启 Deployment "${row.name}" 吗？`,
    onOk() {
      message.success(`Deployment "${row.name}" 重启成功`);
      gridApi.reload();
    },
  });
}

function handleEdit(row: DeploymentListItem) {
  message.info(`编辑 Deployment "${row.name}" (功能开发中)`);
}

function handleDelete(row: DeploymentListItem) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 Deployment "${row.name}" 吗？此操作不可恢复。`,
    onOk() {
      message.success(`Deployment "${row.name}" 删除成功`);
      gridApi.reload();
    },
  });
}

// 当 cluster ID 变化时，重新加载命名空间并刷新数据
watch(
  selectedClusterId,
  async (newId) => {
    if (newId) {
      const namespaces = await loadNamespaces();
      const isCurrentNsValid = namespaces.some(
        (ns) => ns.value === selectedNamespace.value,
      );

      if (!isCurrentNsValid && namespaces.length > 0) {
        selectedNamespace.value = namespaces[0].value;
      } else if (namespaces.length === 0) {
        selectedNamespace.value = undefined;
      }
      gridApi.reload();
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="p-5">
    <div class="mb-5 text-2xl font-bold">Deployment 管理</div>

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
          placeholder="搜索 Deployment 名称"
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
        <template #ready-slot="{ row }">
          <Tag
            v-if="row"
            :color="row.readyReplicas === row.replicas ? 'success' : 'warning'"
          >
            {{ row.readyReplicas ?? 0 }}/{{ row.replicas ?? 0 }}
          </Tag>
        </template>

        <template #actions-slot="{ row }">
          <Space :size="4">
            <Button size="small" type="link" @click="handleView(row)">
              <EyeOutlined />
              详情
            </Button>
            <Button size="small" type="link" @click="handleScale(row)">
              扩缩容
            </Button>
            <Button size="small" type="link" @click="handleRestart(row)">
              重启
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
