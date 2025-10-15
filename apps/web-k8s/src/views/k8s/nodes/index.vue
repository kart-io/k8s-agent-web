<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Node } from '#/api/k8s/types';

import { ref } from 'vue';

import {
  CloudUploadOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  TagOutlined,
  UnlockOutlined,
} from '@ant-design/icons-vue';
import { useDebounceFn } from '@vueuse/core';
import {
  Button,
  Dropdown,
  Input,
  Menu,
  message,
  Modal,
  Progress,
  Select,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cordonNode,
  drainNode,
  getNodeList,
  uncordonNode,
  updateNodeLabels,
  updateNodeTaints,
} from '#/api/k8s';

import DetailDrawer from './DetailDrawer.vue';
import EditLabelsModal from './EditLabelsModal.vue';
import EditTaintsModal from './EditTaintsModal.vue';

defineOptions({
  name: 'NodesManagement',
});

const selectedClusterId = ref('cluster-prod-01');
const searchKeyword = ref('');
const detailDrawerVisible = ref(false);
const selectedNode = ref<Node | null>(null);

// 编辑标签和污点的对话框状态
const editLabelsModalVisible = ref(false);
const editTaintsModalVisible = ref(false);
const editingNode = ref<Node | null>(null);

const clusterOptions = [
  { label: 'Production Cluster', value: 'cluster-prod-01' },
  { label: 'Staging Cluster', value: 'cluster-staging-01' },
  { label: 'Development Cluster', value: 'cluster-dev-01' },
];

let abortController: AbortController | null = null;

async function fetchNodeData(params: {
  page: { currentPage: number; pageSize: number };
}) {
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

    const result = await getNodeList(selectedClusterId.value);

    let items = result.items;
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      items = items.filter((node) =>
        node.metadata.name.toLowerCase().includes(keyword),
      );
    }

    // 手动分页
    const start = (params.page.currentPage - 1) * params.page.pageSize;
    const end = start + params.page.pageSize;

    return {
      items: items.slice(start, end),
      total: items.length,
    };
  } catch (error: any) {
    if (error.message === 'Request aborted') {
      return { items: [], total: 0 };
    }
    throw error;
  }
}

function getNodeStatus(node: Node): string {
  const readyCondition = node.status?.conditions?.find(
    (c) => c.type === 'Ready',
  );
  if (readyCondition?.status === 'True') {
    return 'Ready';
  }
  return 'NotReady';
}

function getNodeRole(node: Node): string {
  const labels = node.metadata.labels || {};
  if (
    labels['kubernetes.io/role'] === 'master' ||
    labels['node-role.kubernetes.io/master'] !== undefined
  ) {
    return 'Master';
  }
  if (
    labels['kubernetes.io/role'] === 'worker' ||
    labels['node-role.kubernetes.io/worker'] !== undefined
  ) {
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
  const cap = Number.parseFloat(capacity.replaceAll(/[^0-9.]/g, ''));
  const alloc = Number.parseFloat(allocatable.replaceAll(/[^0-9.]/g, ''));
  if (Number.isNaN(cap) || cap === 0) return 0;
  return Math.round(((cap - alloc) / cap) * 100);
}

function getResourcePercent(node: Node, type: 'cpu' | 'memory'): number {
  if (!node.status?.capacity || !node.status?.allocatable) return 0;
  return getResourceUsage(
    node.status.capacity[type],
    node.status.allocatable[type],
  );
}

const gridOptions: VxeGridProps<Node> = {
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

/**
 * 查看节点详情
 */
function handleView(row: Node) {
  selectedNode.value = row;
  detailDrawerVisible.value = true;
}

/**
 * 检查节点是否被封锁 (Unschedulable)
 */
function isNodeCordoned(node: Node): boolean {
  return node.spec?.unschedulable === true;
}

/**
 * 封锁节点 (Cordon) - 标记为不可调度
 */
async function handleCordon(row: Node) {
  Modal.confirm({
    title: '确认封锁节点',
    content: `确定要封锁节点 "${row.metadata.name}" 吗？封锁后新的 Pod 将不会调度到此节点，但现有 Pod 会继续运行。`,
    async onOk() {
      try {
        await cordonNode(selectedClusterId.value, row.metadata.name);
        message.success(`节点 "${row.metadata.name}" 已封锁`);
        gridApi.reload();
      } catch (error) {
        message.error('封锁节点失败');
        console.error(error);
      }
    },
  });
}

/**
 * 解除封锁 (Uncordon) - 恢复可调度状态
 */
async function handleUncordon(row: Node) {
  Modal.confirm({
    title: '确认解除封锁',
    content: `确定要解除节点 "${row.metadata.name}" 的封锁吗？解除后 Pod 可以正常调度到此节点。`,
    async onOk() {
      try {
        await uncordonNode(selectedClusterId.value, row.metadata.name);
        message.success(`节点 "${row.metadata.name}" 已解除封锁`);
        gridApi.reload();
      } catch (error) {
        message.error('解除封锁失败');
        console.error(error);
      }
    },
  });
}

/**
 * 驱逐节点 (Drain) - 安全地迁移所有 Pod
 */
async function handleDrain(row: Node) {
  Modal.confirm({
    title: '确认驱逐节点',
    content: `确定要驱逐节点 "${row.metadata.name}" 上的所有 Pod 吗？Pod 将被安全地迁移到其他节点。此操作可能需要一些时间。`,
    okText: '确认驱逐',
    okType: 'danger',
    async onOk() {
      const hide = message.loading({
        content: `正在驱逐节点 "${row.metadata.name}" 上的 Pod...`,
        duration: 0,
      });

      try {
        await drainNode(selectedClusterId.value, row.metadata.name, {
          ignoreDaemonsets: true,
          deleteLocalData: true,
        });
        hide();
        message.success(`节点 "${row.metadata.name}" 上的 Pod 已全部驱逐`);
        gridApi.reload();
      } catch (error) {
        hide();
        message.error('驱逐节点失败');
        console.error(error);
      }
    },
  });
}

/**
 * 编辑节点标签
 */
function handleEditLabels(row: Node) {
  editingNode.value = row;
  editLabelsModalVisible.value = true;
}

/**
 * 编辑节点污点
 */
function handleEditTaints(row: Node) {
  editingNode.value = row;
  editTaintsModalVisible.value = true;
}

/**
 * 标签编辑成功回调
 */
function handleLabelsSuccess() {
  gridApi.reload();
}

/**
 * 污点编辑成功回调
 */
function handleTaintsSuccess() {
  gridApi.reload();
}
</script>

<template>
  <div class="node-list-container">
    <div class="node-list-header">
      <div class="mb-1 text-2xl font-bold">Node 管理</div>

      <div class="search-filter">
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
    </div>

    <div class="node-list-table">
      <Grid>
        <template #status-slot="{ row }">
          <Tag v-if="getNodeStatus(row) === 'Ready'" color="success">Ready</Tag>
          <Tag v-else color="error">NotReady</Tag>
        </template>

        <template #role-slot="{ row }">
          <Tag v-if="getNodeRole(row) === 'Master'" color="blue">Master</Tag>
          <Tag v-else-if="getNodeRole(row) === 'Worker'" color="green">
            Worker
          </Tag>
          <Tag v-else color="default">Unknown</Tag>
        </template>

        <template #cpu-slot="{ row }">
          <div class="flex items-center gap-2">
            <Progress
              :percent="getResourcePercent(row, 'cpu')"
              :stroke-color="
                getResourcePercent(row, 'cpu') > 80
                  ? '#ff4d4f'
                  : getResourcePercent(row, 'cpu') > 60
                    ? '#faad14'
                    : '#52c41a'
              "
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
              :stroke-color="
                getResourcePercent(row, 'memory') > 80
                  ? '#ff4d4f'
                  : getResourcePercent(row, 'memory') > 60
                    ? '#faad14'
                    : '#52c41a'
              "
              :style="{ width: '80px' }"
              :show-info="false"
            />
            <span class="text-xs"
              >{{ getResourcePercent(row, 'memory') }}%</span
            >
          </div>
        </template>

        <template #age-slot="{ row }">
          {{ getNodeAge(row.metadata.creationTimestamp) }}
        </template>

        <template #actions-slot="{ row }">
          <Space :size="8">
            <!-- 详情按钮 - 最常用，独立显示 -->
            <Button size="small" type="link" @click="handleView(row)">
              <EyeOutlined />
              详情
            </Button>

            <!-- 更多操作下拉菜单 -->
            <Dropdown>
              <Button size="small" type="link">
                更多
                <DownOutlined />
              </Button>
              <template #overlay>
                <Menu>
                  <!-- 封锁/解除封锁 -->
                  <Menu.Item
                    v-if="!isNodeCordoned(row)"
                    key="cordon"
                    @click="handleCordon(row)"
                  >
                    <LockOutlined />
                    封锁节点
                  </Menu.Item>
                  <Menu.Item
                    v-else
                    key="uncordon"
                    @click="handleUncordon(row)"
                  >
                    <UnlockOutlined />
                    解除封锁
                  </Menu.Item>

                  <Menu.Divider />

                  <!-- 驱逐 -->
                  <Menu.Item
                    key="drain"
                    danger
                    @click="handleDrain(row)"
                  >
                    <CloudUploadOutlined />
                    驱逐 Pod
                  </Menu.Item>

                  <Menu.Divider />

                  <!-- 编辑标签 -->
                  <Menu.Item key="labels" @click="handleEditLabels(row)">
                    <TagOutlined />
                    编辑标签
                  </Menu.Item>

                  <!-- 编辑污点 -->
                  <Menu.Item key="taints" @click="handleEditTaints(row)">
                    <EditOutlined />
                    编辑污点
                  </Menu.Item>
                </Menu>
              </template>
            </Dropdown>
          </Space>
        </template>

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="() => gridApi.query()">
            刷新当前页
          </Button>
        </template>
      </Grid>
    </div>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :node="selectedNode"
      :cluster-id="selectedClusterId"
    />

    <!-- 编辑标签对话框 -->
    <EditLabelsModal
      v-model:visible="editLabelsModalVisible"
      :node="editingNode"
      :cluster-id="selectedClusterId"
      @success="handleLabelsSuccess"
    />

    <!-- 编辑污点对话框 -->
    <EditTaintsModal
      v-model:visible="editTaintsModalVisible"
      :node="editingNode"
      :cluster-id="selectedClusterId"
      @success="handleTaintsSuccess"
    />
  </div>
</template>

<style scoped>
.node-list-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  overflow: hidden;
}

.node-list-header {
  flex-shrink: 0;
}

.search-filter {
  padding: 16px;
  background-color: var(--vben-background-color);
  border-radius: 8px 8px 0 0;
}

.node-list-table {
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
