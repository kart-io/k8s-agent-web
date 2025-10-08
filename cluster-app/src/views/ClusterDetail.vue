<template>
  <div class="cluster-detail">
    <a-page-header
      title="集群详情"
      @back="handleBack"
    >
      <template #extra>
        <a-button @click="handleRefresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </template>

      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="集群 ID">
          {{ cluster?.id }}
        </a-descriptions-item>
        <a-descriptions-item label="集群名称">
          {{ cluster?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="API Server">
          {{ cluster?.apiServer }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-badge
            :status="cluster?.status === 'connected' ? 'success' : 'error'"
            :text="cluster?.status === 'connected' ? '已连接' : '未连接'"
          />
        </a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">
          {{ cluster?.description || '-' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-page-header>

    <a-tabs v-model:activeKey="activeTab" style="margin-top: 24px">
      <a-tab-pane key="pods" tab="Pods">
        <a-table
          :columns="podColumns"
          :data-source="pods"
          :loading="podsLoading"
          :pagination="podsPagination"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getPodStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="services" tab="Services">
        <a-table
          :columns="serviceColumns"
          :data-source="services"
          :loading="servicesLoading"
          :pagination="servicesPagination"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag>{{ record.type }}</a-tag>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="deployments" tab="Deployments">
        <a-table
          :columns="deploymentColumns"
          :data-source="deployments"
          :loading="deploymentsLoading"
          :pagination="deploymentsPagination"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'replicas'">
              {{ record.readyReplicas }} / {{ record.replicas }}
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import {
  getClusterDetail,
  getPods,
  getServices,
  getDeployments
} from '@/api/cluster'

const router = useRouter()
const route = useRoute()

const cluster = ref(null)
const activeTab = ref('pods')

const pods = ref([])
const podsLoading = ref(false)
const podsPagination = ref({ current: 1, pageSize: 10, total: 0 })

const services = ref([])
const servicesLoading = ref(false)
const servicesPagination = ref({ current: 1, pageSize: 10, total: 0 })

const deployments = ref([])
const deploymentsLoading = ref(false)
const deploymentsPagination = ref({ current: 1, pageSize: 10, total: 0 })

const podColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Namespace', dataIndex: 'namespace', key: 'namespace' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Node', dataIndex: 'node', key: 'node' },
  { title: 'IP', dataIndex: 'podIP', key: 'podIP' }
]

const serviceColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Namespace', dataIndex: 'namespace', key: 'namespace' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Cluster IP', dataIndex: 'clusterIP', key: 'clusterIP' },
  { title: 'Ports', dataIndex: 'ports', key: 'ports' }
]

const deploymentColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Namespace', dataIndex: 'namespace', key: 'namespace' },
  { title: 'Replicas', key: 'replicas' },
  { title: 'Available', dataIndex: 'availableReplicas', key: 'availableReplicas' }
]

const getPodStatusColor = (status) => {
  const colors = {
    Running: 'success',
    Pending: 'warning',
    Failed: 'error',
    Succeeded: 'success',
    Unknown: 'default'
  }
  return colors[status] || 'default'
}

const loadClusterDetail = async () => {
  try {
    const res = await getClusterDetail(route.params.id)
    cluster.value = res
  } catch (error) {
    message.error('加载集群详情失败')
  }
}

const loadPods = async () => {
  podsLoading.value = true
  try {
    const res = await getPods(route.params.id, {
      page: podsPagination.value.current,
      pageSize: podsPagination.value.pageSize
    })
    pods.value = res.data || res.items || []
    podsPagination.value.total = res.total || 0
  } catch (error) {
    message.error('加载 Pod 列表失败')
  } finally {
    podsLoading.value = false
  }
}

const loadServices = async () => {
  servicesLoading.value = true
  try {
    const res = await getServices(route.params.id, {
      page: servicesPagination.value.current,
      pageSize: servicesPagination.value.pageSize
    })
    services.value = res.data || res.items || []
    servicesPagination.value.total = res.total || 0
  } catch (error) {
    message.error('加载 Service 列表失败')
  } finally {
    servicesLoading.value = false
  }
}

const loadDeployments = async () => {
  deploymentsLoading.value = true
  try {
    const res = await getDeployments(route.params.id, {
      page: deploymentsPagination.value.current,
      pageSize: deploymentsPagination.value.pageSize
    })
    deployments.value = res.data || res.items || []
    deploymentsPagination.value.total = res.total || 0
  } catch (error) {
    message.error('加载 Deployment 列表失败')
  } finally {
    deploymentsLoading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleRefresh = () => {
  loadClusterDetail()
  if (activeTab.value === 'pods') loadPods()
  else if (activeTab.value === 'services') loadServices()
  else if (activeTab.value === 'deployments') loadDeployments()
}

watch(activeTab, (tab) => {
  if (tab === 'pods' && pods.value.length === 0) loadPods()
  else if (tab === 'services' && services.value.length === 0) loadServices()
  else if (tab === 'deployments' && deployments.value.length === 0) loadDeployments()
})

onMounted(() => {
  loadClusterDetail()
  loadPods()
})
</script>

<style scoped lang="scss">
.cluster-detail {
  // 样式
}
</style>
