<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Node, NodeListItem } from '#/api/k8s/types';

import { ref, watch } from 'vue';

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
  getNodeDetail,
  getNodeList,
  uncordonNode,
} from '#/api/k8s';
import { useClusterOptions } from '#/stores/clusterStore';

import DetailDrawer from './DetailDrawer.vue';
import EditLabelsModal from './EditLabelsModal.vue';
import EditTaintsModal from './EditTaintsModal.vue';

defineOptions({
  name: 'NodesManagement',
});

const { clusterOptions, selectedClusterId } = useClusterOptions();
const searchKeyword = ref('');
const detailDrawerVisible = ref(false);
const selectedNode = ref<Node | null>(null);

// 编辑标签和污点的对话框状态
const editLabelsModalVisible = ref(false);
const editTaintsModalVisible = ref(false);
const editingNode = ref<NodeListItem | null>(null);

let abortController: AbortController | null = null;

async function fetchNodeData(params: {
  page: { currentPage: number; pageSize: number };
}) {
  // Don't fetch if no cluster is selected
  if (!selectedClusterId.value) {
    return { items: [], total: 0 };
  }

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

function getNodeStatus(node: NodeListItem): string {
  return node.status;
}

function getNodeRole(node: NodeListItem): string {
  if (node.roles && node.roles.length > 0) {
    // 将角色首字母大写
    return node.roles
      .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
      .join(', ');
  }
  return 'Worker';
}

function getNodeAge(createdAt?: string): string {
  if (!createdAt) return '-';
  const created = new Date(createdAt);
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

/**
 * 计算资源使用百分比
 * 如果后端提供了 cpuUsagePercent/memoryUsagePercent，直接使用
 * 否则计算系统预留百分比作为近似值
 */
function getResourcePercent(
  node: NodeListItem,
  type: 'cpu' | 'memory',
): number {
  // 优先使用后端计算的使用率
  if (type === 'cpu' && node.cpuUsagePercent !== undefined) {
    return Math.round(node.cpuUsagePercent);
  }
  if (type === 'memory' && node.memoryUsagePercent !== undefined) {
    return Math.round(node.memoryUsagePercent);
  }

  // 降级方案：计算系统预留百分比（capacity - allocatable）
  if (!node.capacity || !node.allocatable) return 0;

  const capacity = node.capacity[type];
  const allocatable = node.allocatable[type];

  if (!capacity || !allocatable) return 0;

  const cap = Number.parseFloat(capacity.replaceAll(/[^0-9.]/g, ''));
  const alloc = Number.parseFloat(allocatable.replaceAll(/[^0-9.]/g, ''));

  if (isNaN(cap) || cap === 0) return 0;

  // 返回系统预留百分比
  return Math.round(((cap - alloc) / cap) * 100);
}

const gridOptions: VxeGridProps<NodeListItem> = {
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
      field: 'name',
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
      field: 'roles',
      title: '角色',
      width: 120,
      slots: {
        default: 'role-slot',
      },
    },
    {
      field: 'capacity.cpu',
      title: 'CPU 使用率',
      width: 150,
      slots: {
        default: 'cpu-slot',
      },
    },
    {
      field: 'capacity.memory',
      title: '内存使用率',
      width: 150,
      slots: {
        default: 'memory-slot',
      },
    },
    {
      field: 'osImage',
      title: '操作系统',
      minWidth: 200,
    },
    {
      field: 'createdAt',
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
async function handleView(row: NodeListItem) {
  try {
    // 调用 API 获取节点详情
    const nodeDetail = await getNodeDetail(selectedClusterId.value, row.name);

    // 将扁平化的 NodeListItem 转换为标准的 Node 对象
    const standardNode: Node = {
      apiVersion: 'v1',
      kind: 'Node',
      metadata: {
        name: nodeDetail.name,
        creationTimestamp: nodeDetail.createdAt,
        labels: nodeDetail.labels || {},
        annotations: nodeDetail.annotations || {},
        uid: '',
      },
      spec: {
        taints: nodeDetail.taints || [],
        unschedulable:
          nodeDetail.taints?.some((t) => t.effect === 'NoSchedule') || false,
      },
      status: {
        capacity: nodeDetail.capacity || {},
        allocatable: nodeDetail.allocatable || {},
        conditions: nodeDetail.conditions || [],
        addresses: [
          { type: 'InternalIP', address: nodeDetail.internalIP || '' },
          { type: 'ExternalIP', address: nodeDetail.externalIP || '' },
          { type: 'Hostname', address: nodeDetail.name },
        ].filter((addr) => addr.address),
        nodeInfo: {
          architecture: '',
          bootID: '',
          containerRuntimeVersion: nodeDetail.containerRuntime || '',
          kernelVersion: nodeDetail.kernelVersion || '',
          kubeletVersion: nodeDetail.version || '',
          kubeProxyVersion: nodeDetail.version || '',
          machineID: '',
          operatingSystem: 'linux',
          osImage: nodeDetail.osImage || '',
          systemUUID: '',
        },
      },
    };

    selectedNode.value = standardNode;
    detailDrawerVisible.value = true;
  } catch (error) {
    message.error('获取节点详情失败');
    console.error(error);
  }
}

/**
 * 检查节点是否被封锁 (Unschedulable)
 */
function isNodeCordoned(node: NodeListItem): boolean {
  // 后端应该在 taints 中包含 unschedulable 标记
  // 或者直接提供 unschedulable 字段
  return node.taints?.some((t) => t.effect === 'NoSchedule') || false;
}

/**
 * 封锁节点 (Cordon) - 标记为不可调度
 */
async function handleCordon(row: NodeListItem) {
  Modal.confirm({
    title: '确认封锁节点',
    content: `确定要封锁节点 "${row.name}" 吗？封锁后新的 Pod 将不会调度到此节点，但现有 Pod 会继续运行。`,
    async onOk() {
      try {
        await cordonNode(selectedClusterId.value, row.name);
        message.success(`节点 "${row.name}" 已封锁`);
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
async function handleUncordon(row: NodeListItem) {
  Modal.confirm({
    title: '确认解除封锁',
    content: `确定要解除节点 "${row.name}" 的封锁吗？解除后 Pod 可以正常调度到此节点。`,
    async onOk() {
      try {
        await uncordonNode(selectedClusterId.value, row.name);
        message.success(`节点 "${row.name}" 已解除封锁`);
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
async function handleDrain(row: NodeListItem) {
  Modal.confirm({
    title: '确认驱逐节点',
    content: `确定要驱逐节点 "${row.name}" 上的所有 Pod 吗？Pod 将被安全地迁移到其他节点。此操作可能需要一些时间。`,
    okText: '确认驱逐',
    okType: 'danger',
    async onOk() {
      const hide = message.loading({
        content: `正在驱逐节点 "${row.name}" 上的 Pod...`,
        duration: 0,
      });

      try {
        await drainNode(selectedClusterId.value, row.name, {
          ignoreDaemonsets: true,
          deleteLocalData: true,
        });
        hide();
        message.success(`节点 "${row.name}" 上的 Pod 已全部驱逐`);
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
function handleEditLabels(row: NodeListItem) {
  editingNode.value = row;
  editLabelsModalVisible.value = true;
}

/**
 * 编辑节点污点
 */
function handleEditTaints(row: NodeListItem) {
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

// 当 cluster ID 加载完成后，触发数据刷新
watch(selectedClusterId, (newId) => {
  if (newId) {
    gridApi.reload();
  }
});
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
          {{ getNodeAge(row.createdAt) }}
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
                  <Menu.Item v-else key="uncordon" @click="handleUncordon(row)">
                    <UnlockOutlined />
                    解除封锁
                  </Menu.Item>

                  <Menu.Divider />

                  <!-- 驱逐 -->
                  <Menu.Item key="drain" danger @click="handleDrain(row)">
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
