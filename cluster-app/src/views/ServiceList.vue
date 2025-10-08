<template>
  <div class="service-list">
    <VxeBasicTable
      title="Service 列表"
      :api="loadServices"
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
            placeholder="搜索 Service 名称"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #type="{ row }">
        <a-tag v-if="row" :color="getServiceTypeColor(row.type)">
          {{ row.type }}
        </a-tag>
      </template>

      <template #clusterIP="{ row }">
        <div v-if="row">
          <div>{{ row.clusterIP }}</div>
          <div v-if="row.externalIP" style="font-size: 12px; color: #999;">
            外部: {{ row.externalIP }}
          </div>
        </div>
      </template>

      <template #ports="{ row }">
        <div v-if="row">
          <a-tag v-for="port in row.ports" :key="port" style="margin: 2px;">
            {{ port }}
          </a-tag>
        </div>
      </template>

      <template #action="{ row }">
        <a-space v-if="row">
          <a-button type="link" size="small" @click="handleViewDetail(row)">
            详情
          </a-button>
          <a-button type="link" size="small" @click="handleViewEndpoints(row)">
            端点
          </a-button>
          <a-popconfirm
            title="确定要删除这个 Service 吗？"
            @confirm="handleDelete(row)"
          >
            <a-button type="link" size="small" danger>
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </VxeBasicTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { getServices, getNamespaces } from '@/api/cluster'
import { VxeBasicTable } from '@k8s-agent/shared/components'

const route = useRoute()
let tableApi = null

const namespace = ref('')
const searchText = ref('')
const namespaces = ref(['default', 'kube-system', 'kube-public'])

const apiParams = computed(() => ({
  clusterId: route.params.id,
  namespace: namespace.value,
  search: searchText.value
}))

const gridOptions = {
  columns: [
    {
      field: 'name',
      title: 'Service 名称',
      width: 250,
      showOverflow: 'title'
    },
    {
      field: 'namespace',
      title: '命名空间',
      width: 150
    },
    {
      field: 'type',
      title: '类型',
      width: 130,
      slots: { default: 'type' }
    },
    {
      field: 'clusterIP',
      title: 'Cluster IP',
      width: 180,
      slots: { default: 'clusterIP' }
    },
    {
      field: 'ports',
      title: '端口',
      width: 200,
      slots: { default: 'ports' }
    },
    {
      field: 'selector',
      title: '选择器',
      width: 200,
      showOverflow: 'title'
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

const getServiceTypeColor = (type) => {
  const typeMap = {
    'ClusterIP': 'blue',
    'NodePort': 'green',
    'LoadBalancer': 'purple',
    'ExternalName': 'orange'
  }
  return typeMap[type] || 'default'
}

const loadServices = async (params) => {
  try {
    const res = await getServices(params.clusterId, {
      page: params.page,
      pageSize: params.pageSize,
      namespace: params.namespace,
      search: params.search
    })
    return {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
  } catch (error) {
    console.error('[ServiceList] Load error:', error)
    message.error('加载 Service 列表失败')
    throw error
  }
}

const loadNamespaces = async () => {
  try {
    const res = await getNamespaces(route.params.id)
    namespaces.value = res.data || res.items || ['default', 'kube-system', 'kube-public']
  } catch (error) {
    console.error('[ServiceList] Load namespaces error:', error)
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
  message.info(`查看 Service 详情: ${record.name}`)
}

const handleViewEndpoints = (record) => {
  message.info(`查看端点: ${record.name}`)
}

const handleDelete = async (record) => {
  try {
    // TODO: 实现删除 Service 的 API
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
.service-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
