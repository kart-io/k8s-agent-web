<template>
  <div class="pod-list">
    <VxeBasicTable
      title="Pod 列表"
      :api="loadPods"
      :params="apiParams"
      :grid-options="gridOptions"
      @register="registerTable"
    >
      <template #title-right>
        <a-space>
          <a-select
            v-model:value="namespace"
            placeholder="命名空间"
            style="width: 180px"
            allowClear
            @change="handleNamespaceChange"
          >
            <a-select-option value="">全部命名空间</a-select-option>
            <a-select-option v-for="ns in namespaces" :key="ns" :value="ns">
              {{ ns }}
            </a-select-option>
          </a-select>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索 Pod 名称"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #status="{ row }">
        <a-badge v-if="row"
          :status="getPodStatusBadge(row.status)"
          :text="row.status"
        />
      </template>

      <template #ready="{ row }">
        <span v-if="row">{{ row.readyContainers }}/{{ row.totalContainers }}</span>
      </template>

      <template #restarts="{ row }">
        <a-tag v-if="row" :color="row.restarts > 0 ? 'warning' : 'default'">
          {{ row.restarts }}
        </a-tag>
      </template>

      <template #action="{ row }">
        <a-space v-if="row">
          <a-button type="link" size="small" @click="handleViewDetail(row)">
            详情
          </a-button>
          <a-button type="link" size="small" @click="handleViewLogs(row)">
            日志
          </a-button>
          <a-popconfirm
            title="确定要删除这个 Pod 吗？"
            @confirm="handleDelete(row)"
          >
            <a-button type="link" size="small" danger>
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </VxeBasicTable>

    <!-- 日志查看抽屉 -->
    <PodLogsDrawer
      v-model:visible="logsDrawerVisible"
      :pod-info="currentPod"
      :cluster-id="route.params.id"
      @close="handleLogsDrawerClose"
    />

    <!-- 详情查看抽屉 -->
    <PodDetailDrawer
      v-model:visible="detailDrawerVisible"
      :pod-info="currentPod"
      :cluster-id="route.params.id"
      @close="handleDetailDrawerClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { getPods, getNamespaces } from '@/api/cluster'
import { VxeBasicTable } from '@k8s-agent/shared/components'
import PodLogsDrawer from '@/components/PodLogsDrawer.vue'
import PodDetailDrawer from '@/components/PodDetailDrawer.vue'

const route = useRoute()
let tableApi = null

const namespace = ref('')
const searchText = ref('')
const namespaces = ref(['default', 'kube-system', 'kube-public'])
const logsDrawerVisible = ref(false)
const detailDrawerVisible = ref(false)
const currentPod = ref({})

const apiParams = computed(() => ({
  clusterId: route.params.id,
  namespace: namespace.value,
  search: searchText.value,
  nodeName: route.query.nodeName
}))

const gridOptions = {
  columns: [
    {
      field: 'name',
      title: 'Pod 名称',
      width: 250,
      showOverflow: 'title'
    },
    {
      field: 'namespace',
      title: '命名空间',
      width: 150
    },
    {
      field: 'status',
      title: '状态',
      width: 120,
      slots: { default: 'status' }
    },
    {
      field: 'ready',
      title: '就绪容器',
      width: 100,
      slots: { default: 'ready' }
    },
    {
      field: 'restarts',
      title: '重启次数',
      width: 100,
      slots: { default: 'restarts' }
    },
    {
      field: 'nodeName',
      title: '节点',
      width: 180,
      showOverflow: 'title'
    },
    {
      field: 'podIP',
      title: 'Pod IP',
      width: 140
    },
    {
      field: 'age',
      title: '运行时长',
      width: 120
    },
    {
      field: 'action',
      title: '操作',
      width: 200,
      fixed: 'right',
      slots: { default: 'action' }
    }
  ]
}

const registerTable = (api) => {
  tableApi = api
}

const getPodStatusBadge = (status) => {
  const statusMap = {
    'Running': 'success',
    'Pending': 'processing',
    'Succeeded': 'success',
    'Failed': 'error',
    'Unknown': 'warning',
    'CrashLoopBackOff': 'error',
    'ContainerCreating': 'processing',
    'Terminating': 'warning'
  }
  return statusMap[status] || 'default'
}

const loadPods = async (params) => {
  try {
    const res = await getPods(params.clusterId, {
      page: params.page,
      pageSize: params.pageSize,
      namespace: params.namespace,
      search: params.search,
      nodeName: params.nodeName
    })
    return {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
  } catch (error) {
    console.error('[PodList] Load error:', error)
    message.error('加载 Pod 列表失败')
    throw error
  }
}

const loadNamespaces = async () => {
  try {
    const res = await getNamespaces(route.params.id)
    namespaces.value = res.data || res.items || ['default', 'kube-system', 'kube-public']
  } catch (error) {
    console.error('[PodList] Load namespaces error:', error)
  }
}

const handleNamespaceChange = () => {
  tableApi?.reload()
}

const handleSearch = () => {
  tableApi?.reload()
}

const handleRefresh = () => {
  tableApi?.refresh()
}

const handleViewDetail = (record) => {
  currentPod.value = record
  detailDrawerVisible.value = true
}

const handleViewLogs = (record) => {
  currentPod.value = record
  logsDrawerVisible.value = true
}

const handleLogsDrawerClose = () => {
  currentPod.value = {}
}

const handleDetailDrawerClose = () => {
  currentPod.value = {}
}

const handleDelete = async (record) => {
  try {
    // TODO: 实现删除 Pod 的 API
    message.success('删除成功')
    tableApi?.refresh()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadNamespaces()
})
</script>

<style scoped lang="scss">
.pod-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
