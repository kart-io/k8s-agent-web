<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Node } from '#/api/k8s/types';

import { h, ref } from 'vue';

import { Button, Descriptions, Drawer, Input, message, Modal, Progress, Select, Space, Table, Tag, Tooltip } from 'ant-design-vue';
import {
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue';
import { useDebounceFn } from '@vueuse/core';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { getMockNodeList, getMockPodList } from '#/api/k8s/mock';

defineOptions({
  name: 'NodesManagement',
});

const selectedClusterId = ref('cluster-prod-01');
const searchKeyword = ref('');
const detailDrawerVisible = ref(false);
const selectedNode = ref<Node | null>(null);
const nodePods = ref<any[]>([]);

const clusterOptions = [
  { label: 'Production Cluster', value: 'cluster-prod-01' },
  { label: 'Staging Cluster', value: 'cluster-staging-01' },
  { label: 'Development Cluster', value: 'cluster-dev-01' },
];

let abortController: AbortController | null = null;

async function fetchNodeData(params: { page: { currentPage: number; pageSize: number } }) {
  if (abortController) {
    abortController.abort();
  }

  abortController = new AbortController();

  try {
    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, 500);
      abortController!.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Request aborted'));
      });
    });

    const result = getMockNodeList({
      clusterId: selectedClusterId.value,
      page: params.page.currentPage,
      pageSize: params.page.pageSize,
    });

    let items = result.items;
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      items = items.filter((node) =>
        node.metadata.name.toLowerCase().includes(keyword)
      );
    }

    return {
      items,
      total: searchKeyword.value ? items.length : result.total,
    };
  } catch (error: any) {
    if (error.message === 'Request aborted') {
      return { items: [], total: 0 };
    }
    throw error;
  }
}

function getNodeStatus(node: Node): string {
  const readyCondition = node.status?.conditions?.find(c => c.type === 'Ready');
  if (readyCondition?.status === 'True') {
    return 'Ready';
  }
  return 'NotReady';
}

function getNodeRole(node: Node): string {
  const labels = node.metadata.labels || {};
  if (labels['kubernetes.io/role'] === 'master' || labels['node-role.kubernetes.io/master'] !== undefined) {
    return 'Master';
  }
  if (labels['kubernetes.io/role'] === 'worker' || labels['node-role.kubernetes.io/worker'] !== undefined) {
    return 'Worker';
  }
  return 'Unknown';
}

function getNodeAge(creationTimestamp?: string): string {
  if (!creationTimestamp) return '-';
  const created = new Date(creationTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '1天';
  if (diffDays < 30) return `${diffDays}天`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}个月`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}年`;
}

function getResourceUsage(capacity?: string, allocatable?: string): number {
  if (!capacity || !allocatable) return 0;
  const cap = parseFloat(capacity.replace(/[^0-9.]/g, ''));
  const alloc = parseFloat(allocatable.replace(/[^0-9.]/g, ''));
  if (isNaN(cap) || cap === 0) return 0;
  return Math.round(((cap - alloc) / cap) * 100);
}

function getResourcePercent(node: Node, type: 'cpu' | 'memory'): number {
  if (!node.status?.capacity || !node.status?.allocatable) return 0;
  return getResourceUsage(node.status.capacity[type], node.status.allocatable[type]);
}

const gridOptions: VxeGridProps<Node> = {
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
      title: 'Node 名称',
      minWidth: 180,
    },
    {
      field: 'status',
      title: '状态',
      width: 120,
      slots: {
        default: 'status-slot',
      },
    },
    {
      field: 'role',
      title: '角色',
      width: 100,
      slots: {
        default: 'role-slot',
      },
    },
    {
      field: 'status.capacity.cpu',
      title: 'CPU 使用率',
      width: 150,
      slots: {
        default: 'cpu-slot',
      },
    },
    {
      field: 'status.capacity.memory',
      title: '内存使用率',
      width: 150,
      slots: {
        default: 'memory-slot',
      },
    },
    {
      field: 'status.nodeInfo.kubeletVersion',
      title: 'Kubelet 版本',
      width: 140,
    },
    {
      field: 'status.nodeInfo.osImage',
      title: '操作系统',
      minWidth: 200,
    },
    {
      field: 'metadata.creationTimestamp',
      title: '运行时长',
      width: 120,
      slots: {
        default: 'age-slot',
      },
    },
    {
      field: 'actions',
      title: '操作',
      width: 150,
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
        return await fetchNodeData({
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

const debouncedSearch = useDebounceFn(() => {
  gridApi.reload();
}, 300);

function handleSearch() {
  gridApi.reload();
}

function handleReset() {
  searchKeyword.value = '';
  gridApi.reload();
}

async function handleView(row: Node) {
  selectedNode.value = row;

  const result = getMockPodList({
    clusterId: selectedClusterId.value,
    page: 1,
    pageSize: 100,
  });

  nodePods.value = result.items.filter(pod => pod.spec.nodeName === row.metadata.name);

  detailDrawerVisible.value = true;
}

function handleCordon(row: Node) {
  Modal.confirm({
    title: '确认封锁',
    content: `确定要封锁节点 "${row.metadata.name}" 吗？封锁后将不会调度新的 Pod 到此节点。`,
    onOk() {
      message.success(`节点 "${row.metadata.name}" 封锁成功`);
      gridApi.reload();
    },
  });
}

function handleDrain(row: Node) {
  Modal.confirm({
    title: '确认驱逐',
    content: `确定要驱逐节点 "${row.metadata.name}" 上的所有 Pod 吗？此操作将影响运行中的工作负载。`,
    onOk() {
      message.success(`节点 "${row.metadata.name}" 驱逐成功`);
      gridApi.reload();
    },
  });
}

function handleDelete(row: Node) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除节点 "${row.metadata.name}" 吗？此操作不可恢复，将会影响集群的可用资源。`,
    onOk() {
      message.success(`节点 "${row.metadata.name}" 删除成功`);
      gridApi.reload();
    },
  });
}

const podColumns = [
  {
    title: 'Pod 名称',
    dataIndex: ['metadata', 'name'],
    key: 'name',
    ellipsis: true,
  },
  {
    title: '命名空间',
    dataIndex: ['metadata', 'namespace'],
    key: 'namespace',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: ['status', 'phase'],
    key: 'phase',
    width: 120,
  },
  {
    title: 'Pod IP',
    dataIndex: ['status', 'podIP'],
    key: 'podIP',
    width: 150,
  },
];
</script>

<template>
  <div class="p-5">
    <div class="mb-5 text-2xl font-bold">Node 管理</div>

    <div class="mb-4 rounded-lg p-4">
      <Space :size="12" wrap>
        <Select
          v-model:value="selectedClusterId"
          :options="clusterOptions"
          :style="{ width: '200px' }"
          placeholder="选择集群"
          @change="handleSearch"
        />

        <Input
          v-model:value="searchKeyword"
          :style="{ width: '240px' }"
          placeholder="搜索 Node 名称"
          allow-clear
          @input="debouncedSearch"
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
          <Tag v-if="getNodeStatus(row) === 'Ready'" color="success">Ready</Tag>
          <Tag v-else color="error">NotReady</Tag>
        </template>

        <template #role-slot="{ row }">
          <Tag v-if="getNodeRole(row) === 'Master'" color="blue">Master</Tag>
          <Tag v-else-if="getNodeRole(row) === 'Worker'" color="green">Worker</Tag>
          <Tag v-else color="default">Unknown</Tag>
        </template>

        <template #cpu-slot="{ row }">
          <div class="flex items-center gap-2">
            <Progress
              :percent="getResourcePercent(row, 'cpu')"
              :stroke-color="getResourcePercent(row, 'cpu') > 80 ? '#ff4d4f' : getResourcePercent(row, 'cpu') > 60 ? '#faad14' : '#52c41a'"
              :style="{ width: '80px' }"
              :show-info="false"
            />
            <span class="text-xs">{{ getResourcePercent(row, 'cpu') }}%</span>
          </div>
        </template>

        <template #memory-slot="{ row }">
          <div class="flex items-center gap-2">
            <Progress
              :percent="getResourcePercent(row, 'memory')"
              :stroke-color="getResourcePercent(row, 'memory') > 80 ? '#ff4d4f' : getResourcePercent(row, 'memory') > 60 ? '#faad14' : '#52c41a'"
              :style="{ width: '80px' }"
              :show-info="false"
            />
            <span class="text-xs">{{ getResourcePercent(row, 'memory') }}%</span>
          </div>
        </template>

        <template #age-slot="{ row }">
          {{ getNodeAge(row.metadata.creationTimestamp) }}
        </template>

        <template #actions-slot="{ row }">
          <Space :size="4">
            <Button size="small" type="link" @click="handleView(row)">
              <EyeOutlined />
              详情
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

    <Drawer
      v-model:open="detailDrawerVisible"
      :width="800"
      title="Node 详细信息"
    >
      <div v-if="selectedNode">
        <div class="mb-6">
          <div class="mb-4 text-lg font-semibold">基本信息</div>
          <Descriptions :column="2" bordered>
            <Descriptions.Item label="节点名称">
              {{ selectedNode.metadata.name }}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag v-if="getNodeStatus(selectedNode) === 'Ready'" color="success">Ready</Tag>
              <Tag v-else color="error">NotReady</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="角色">
              <Tag v-if="getNodeRole(selectedNode) === 'Master'" color="blue">Master</Tag>
              <Tag v-else-if="getNodeRole(selectedNode) === 'Worker'" color="green">Worker</Tag>
              <Tag v-else color="default">Unknown</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="运行时长">
              {{ getNodeAge(selectedNode.metadata.creationTimestamp) }}
            </Descriptions.Item>
            <Descriptions.Item label="内部 IP">
              {{ selectedNode.status?.addresses?.find(a => a.type === 'InternalIP')?.address || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="主机名">
              {{ selectedNode.status?.addresses?.find(a => a.type === 'Hostname')?.address || '-' }}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div class="mb-6">
          <div class="mb-4 text-lg font-semibold">资源信息</div>
          <Descriptions :column="2" bordered>
            <Descriptions.Item label="CPU 容量">
              {{ selectedNode.status?.capacity?.cpu || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="CPU 可分配">
              {{ selectedNode.status?.allocatable?.cpu || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="内存容量">
              {{ selectedNode.status?.capacity?.memory || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="内存可分配">
              {{ selectedNode.status?.allocatable?.memory || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="Pod 容量">
              {{ selectedNode.status?.capacity?.pods || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="Pod 可分配">
              {{ selectedNode.status?.allocatable?.pods || '-' }}
            </Descriptions.Item>
          </Descriptions>

          <div class="mt-4">
            <div class="mb-2 text-sm font-medium">CPU 使用率</div>
            <Progress
              :percent="getResourcePercent(selectedNode, 'cpu')"
              :stroke-color="getResourcePercent(selectedNode, 'cpu') > 80 ? '#ff4d4f' : getResourcePercent(selectedNode, 'cpu') > 60 ? '#faad14' : '#52c41a'"
            />
          </div>

          <div class="mt-4">
            <div class="mb-2 text-sm font-medium">内存使用率</div>
            <Progress
              :percent="getResourcePercent(selectedNode, 'memory')"
              :stroke-color="getResourcePercent(selectedNode, 'memory') > 80 ? '#ff4d4f' : getResourcePercent(selectedNode, 'memory') > 60 ? '#faad14' : '#52c41a'"
            />
          </div>
        </div>

        <div class="mb-6">
          <div class="mb-4 text-lg font-semibold">系统信息</div>
          <Descriptions :column="1" bordered>
            <Descriptions.Item label="操作系统">
              {{ selectedNode.status?.nodeInfo?.osImage || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="内核版本">
              {{ selectedNode.status?.nodeInfo?.kernelVersion || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="容器运行时">
              {{ selectedNode.status?.nodeInfo?.containerRuntimeVersion || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="Kubelet 版本">
              {{ selectedNode.status?.nodeInfo?.kubeletVersion || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="Kube-Proxy 版本">
              {{ selectedNode.status?.nodeInfo?.kubeProxyVersion || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="架构">
              {{ selectedNode.status?.nodeInfo?.architecture || '-' }}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div class="mb-6">
          <div class="mb-4 text-lg font-semibold">
            运行的 Pod ({{ nodePods.length }})
          </div>
          <Table
            :columns="podColumns"
            :data-source="nodePods"
            :pagination="{ pageSize: 10 }"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'phase'">
                <Tag v-if="record.status.phase === 'Running'" color="success">Running</Tag>
                <Tag v-else-if="record.status.phase === 'Pending'" color="warning">Pending</Tag>
                <Tag v-else-if="record.status.phase === 'Failed'" color="error">Failed</Tag>
                <Tag v-else color="default">{{ record.status.phase }}</Tag>
              </template>
            </template>
          </Table>
        </div>

        <div class="mb-6">
          <div class="mb-4 text-lg font-semibold">健康状态</div>
          <Table
            :columns="[
              { title: '类型', dataIndex: 'type', key: 'type' },
              { title: '状态', dataIndex: 'status', key: 'status' },
              { title: '原因', dataIndex: 'reason', key: 'reason' },
              { title: '消息', dataIndex: 'message', key: 'message', ellipsis: true },
            ]"
            :data-source="selectedNode.status?.conditions || []"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <Tag v-if="record.status === 'True'" color="success">True</Tag>
                <Tag v-else-if="record.status === 'False'" color="error">False</Tag>
                <Tag v-else color="default">{{ record.status }}</Tag>
              </template>
            </template>
          </Table>
        </div>

        <div class="flex justify-end gap-2">
          <Button @click="handleCordon(selectedNode)">封锁节点</Button>
          <Button @click="handleDrain(selectedNode)">驱逐 Pod</Button>
          <Button danger @click="handleDelete(selectedNode)">删除节点</Button>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
:deep(.vxe-table) {
  font-size: 14px;
}
</style>
