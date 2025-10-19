<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Cluster, ClusterListParams } from '#/api/k8s/types';

import { ref, watch } from 'vue';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
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
import { clusterApi, getClusterDetail } from '#/api/k8s';
import { clusterStore } from '#/stores/clusterStore';

import AddClusterModal from './AddClusterModal.vue';
import DetailDrawer from './DetailDrawer.vue';
import EditClusterModal from './EditClusterModal.vue';

defineOptions({
  name: 'ClustersManagement',
});

// 搜索条件
const searchForm = ref<ClusterListParams>({
  keyword: '',
  status: undefined,
  page: 1,
  pageSize: 10,
});

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedCluster = ref<Cluster | null>(null);

// 添加集群对话框状态
const addClusterVisible = ref(false);

// 编辑集群对话框状态
const editClusterVisible = ref(false);
const clusterToEdit = ref<Cluster | null>(null);

// 状态选项
const statusOptions = [
  { label: '全部', value: undefined },
  { label: '健康', value: 'healthy' },
  { label: '异常', value: 'unhealthy' },
  { label: '未知', value: 'unknown' },
];

// AbortController 用于取消请求
let abortController: AbortController | null = null;

// 获取集群数据
async function fetchClusterData(params: {
  page: { currentPage: number; pageSize: number };
}) {
  // 取消之前的请求
  if (abortController) {
    abortController.abort();
  }

  // 创建新的 AbortController
  abortController = new AbortController();

  try {
    // 调用真实的 cluster-service API
    const result = await clusterApi.list({
      ...searchForm.value,
      page: params.page.currentPage,
      pageSize: params.page.pageSize,
    });

    return {
      items: result.items || [],
      total: result.total || 0,
    };
  } catch (error: any) {
    // 如果是取消请求，返回空结果
    if (error.message === 'Request aborted' || error.name === 'AbortError') {
      return { items: [], total: 0 };
    }
    // 其他错误抛出,让表格组件处理
    console.error('获取集群列表失败:', error);
    message.error(`获取集群列表失败: ${error.message || '未知错误'}`);
    return { items: [], total: 0 };
  }
}

// 定义表格配置
const gridOptions: VxeGridProps<Cluster> = {
  height: '100%',
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
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
      title: '集群名称',
      minWidth: 180,
      slots: {
        default: 'name-slot',
      },
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      slots: {
        default: 'status-slot',
      },
    },
    { field: 'version', title: 'K8s 版本', width: 120 },
    { field: 'nodeCount', title: '节点数', width: 100 },
    { field: 'podCount', title: 'Pod 数', width: 100 },
    { field: 'namespaceCount', title: '命名空间', width: 120 },
    {
      field: 'endpoint',
      title: 'API Server',
      minWidth: 250,
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
      width: 200,
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
        return await fetchClusterData({
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

// 搜索处理
function handleSearch() {
  gridApi.reload();
}

// 监听关键词变化,自动触发防抖搜索
watch(
  () => searchForm.value.keyword,
  () => {
    debouncedSearch();
  },
);

// 重置搜索
function handleReset() {
  searchForm.value = {
    keyword: '',
    status: undefined,
    page: 1,
    pageSize: 10,
  };
  gridApi.reload();
}

// 查看详情
async function handleView(row: Cluster) {
  try {
    // 调用详情接口获取最新数据
    const clusterDetail = await getClusterDetail(row.id);
    selectedCluster.value = clusterDetail;
    detailDrawerVisible.value = true;
  } catch (error: any) {
    message.error(error.message || '获取集群详情失败');
  }
}

// 编辑集群
function handleEdit(row: Cluster) {
  clusterToEdit.value = row;
  editClusterVisible.value = true;
}

// 删除集群
function handleDelete(row: Cluster) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除集群 "${row.name}" 吗？此操作不可恢复。`,
    onOk() {
      message.success(`集群 "${row.name}" 删除成功`);
      gridApi.reload();
      // 刷新全局集群选项列表
      clusterStore.refresh();
    },
  });
}

// 添加集群
function handleAdd() {
  addClusterVisible.value = true;
}

// 添加成功回调
function handleAddSuccess() {
  gridApi.reload();
  // 刷新全局集群选项列表
  clusterStore.refresh();
}

// 编辑成功回调
function handleEditSuccess() {
  gridApi.reload();
  // 刷新全局集群选项列表（以防集群名称被修改）
  clusterStore.refresh();
}
</script>

<template>
  <div class="cluster-list-container">
    <div class="cluster-list-header">
      <div class="mb-1 text-2xl font-bold">集群管理</div>

      <!-- 搜索区域 -->
      <div class="search-filter">
        <Space :size="12" wrap>
          <Input
            v-model:value="searchForm.keyword"
            :style="{ width: '240px' }"
            placeholder="搜索集群名称、ID 或描述"
            allow-clear
            @press-enter="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </Input>

          <Select
            v-model:value="searchForm.status"
            :options="statusOptions"
            :style="{ width: '120px' }"
            placeholder="状态"
          />

          <Button type="primary" @click="handleSearch">
            <SearchOutlined />
            搜索
          </Button>

          <Button @click="handleReset">
            <ReloadOutlined />
            重置
          </Button>

          <Button type="primary" @click="handleAdd">
            <PlusOutlined />
            添加集群
          </Button>
        </Space>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="cluster-list-table">
      <Grid>
        <!-- 集群名称自定义列 -->
        <template #name-slot="{ row }">
          <div>
            <div class="font-medium">{{ row.name }}</div>
            <div class="text-xs text-gray-500">{{ row.description }}</div>
          </div>
        </template>

        <!-- 状态自定义列 -->
        <template #status-slot="{ row }">
          <Tag v-if="row.status === 'healthy'" color="success">健康</Tag>
          <Tag v-else-if="row.status === 'unhealthy'" color="error">异常</Tag>
          <Tag v-else color="default">未知</Tag>
        </template>

        <!-- 操作自定义列 -->
        <template #actions-slot="{ row }">
          <Space :size="8">
            <Button size="small" type="link" @click="handleView(row)">
              <EyeOutlined />
              查看
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

        <!-- 工具栏自定义按钮 -->
        <template #toolbar-tools>
          <Button type="default" @click="() => gridApi.reload()">
            刷新并返回第一页
          </Button>
        </template>
      </Grid>
    </div>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :cluster="selectedCluster"
    />

    <!-- 添加集群对话框 -->
    <AddClusterModal
      v-model:visible="addClusterVisible"
      @success="handleAddSuccess"
    />

    <!-- 编辑集群对话框 -->
    <EditClusterModal
      v-model:visible="editClusterVisible"
      :cluster="clusterToEdit"
      @success="handleEditSuccess"
    />
  </div>
</template>

<style scoped>
.cluster-list-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  overflow: hidden;
}

.cluster-list-header {
  flex-shrink: 0;
}

.search-filter {
  padding: 16px;
  background-color: var(--vben-background-color);
  border-radius: 8px 8px 0 0;
}

.cluster-list-table {
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

:deep(.vxe-table .vxe-body--row) {
  height: 60px;
}
</style>
