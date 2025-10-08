<template>
  <div class="node-list">
    <VxeBasicTable
      title="节点列表"
      :api="loadNodes"
      :params="{ clusterId: route.params.id }"
      :grid-options="gridOptions"
      @register="registerTable"
    >
      <template #title-right>
        <a-space>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #status="{ row }">
        <a-badge v-if="row"
          :status="getNodeStatusBadge(row.status)"
          :text="row.status"
        />
      </template>

      <template #ready="{ row }">
        <a-tag v-if="row" :color="row.ready ? 'success' : 'error'">
          {{ row.ready ? 'Ready' : 'NotReady' }}
        </a-tag>
      </template>

      <template #cpu="{ row }">
        <div v-if="row">
          <a-progress
            :percent="row.cpuUsagePercent"
            :status="row.cpuUsagePercent > 80 ? 'exception' : 'normal'"
            size="small"
          />
          <div style="font-size: 12px; color: #999; margin-top: 4px;">
            {{ row.cpuUsage }} / {{ row.cpuCapacity }}
          </div>
        </div>
      </template>

      <template #memory="{ row }">
        <div v-if="row">
          <a-progress
            :percent="row.memoryUsagePercent"
            :status="row.memoryUsagePercent > 80 ? 'exception' : 'normal'"
            size="small"
          />
          <div style="font-size: 12px; color: #999; margin-top: 4px;">
            {{ row.memoryUsage }} / {{ row.memoryCapacity }}
          </div>
        </div>
      </template>

      <template #action="{ row }">
        <a-space v-if="row">
          <a-button type="link" size="small" @click="handleViewDetail(row)">
            详情
          </a-button>
          <a-button type="link" size="small" @click="handleViewPods(row)">
            查看 Pods
          </a-button>
        </a-space>
      </template>
    </VxeBasicTable>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { getNodes } from '@/api/cluster'
import { VxeBasicTable } from '@k8s-agent/shared/components'

const route = useRoute()
const router = useRouter()
let tableApi = null

const gridOptions = {
  columns: [
    {
      field: 'name',
      title: '节点名称',
      width: 200
    },
    {
      field: 'status',
      title: '状态',
      width: 120,
      slots: { default: 'status' }
    },
    {
      field: 'ready',
      title: '就绪状态',
      width: 120,
      slots: { default: 'ready' }
    },
    {
      field: 'roles',
      title: '角色',
      width: 150
    },
    {
      field: 'version',
      title: 'Kubelet 版本',
      width: 150
    },
    {
      field: 'cpu',
      title: 'CPU 使用率',
      width: 180,
      slots: { default: 'cpu' }
    },
    {
      field: 'memory',
      title: '内存使用率',
      width: 180,
      slots: { default: 'memory' }
    },
    {
      field: 'podCount',
      title: 'Pod 数量',
      width: 100
    },
    {
      field: 'age',
      title: '运行时长',
      width: 120
    },
    {
      field: 'action',
      title: '操作',
      width: 180,
      fixed: 'right',
      slots: { default: 'action' }
    }
  ]
}

const registerTable = (api) => {
  tableApi = api
}

const getNodeStatusBadge = (status) => {
  const statusMap = {
    'Ready': 'success',
    'NotReady': 'error',
    'Unknown': 'warning'
  }
  return statusMap[status] || 'default'
}

const loadNodes = async (params) => {
  try {
    const res = await getNodes(params.clusterId, {
      page: params.page,
      pageSize: params.pageSize
    })
    return {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
  } catch (error) {
    console.error('[NodeList] Load error:', error)
    message.error('加载节点列表失败')
    throw error
  }
}

const handleRefresh = () => {
  tableApi?.refresh()
}

const handleViewDetail = (record) => {
  message.info(`查看节点详情: ${record.name}`)
}

const handleViewPods = (record) => {
  router.push({
    path: `/${route.params.id}/pods`,
    query: { nodeName: record.name }
  })
}
</script>

<style scoped lang="scss">
.node-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
