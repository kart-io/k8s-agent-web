<template>
  <div class="cluster-list">
    <VxeBasicTable
      title="集群列表"
      :api="loadClusters"
      :grid-options="gridOptions"
      @register="registerTable"
    >
      <template #title-right>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <template #icon><PlusOutlined /></template>
            添加集群
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #status="{ row }">
        <a-badge v-if="row"
          :status="row.status === 'connected' ? 'success' : 'error'"
          :text="row.status === 'connected' ? '已连接' : '未连接'"
        />
      </template>

      <template #createdAt="{ row }">
        {{ row ? formatTime(row.createdAt) : '-' }}
      </template>

      <template #action="{ row }">
        <a-space v-if="row">
          <a-button type="link" size="small" @click="handleView(row)">
            查看
          </a-button>
          <a-button type="link" size="small" @click="handleEdit(row)">
            编辑
          </a-button>
          <a-popconfirm
            title="确定要删除这个集群吗？"
            @confirm="handleDelete(row)"
          >
            <a-button type="link" size="small" danger>
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </VxeBasicTable>

    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="800px"
      @ok="handleSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="clusterForm" :label-col="{ span: 6 }">
        <a-form-item label="集群名称" required>
          <a-input v-model:value="clusterForm.name" placeholder="输入集群名称" />
        </a-form-item>
        <a-form-item label="API Server" required>
          <a-input
            v-model:value="clusterForm.apiServer"
            placeholder="https://api.k8s.example.com:6443"
          />
        </a-form-item>
        <a-form-item label="KubeConfig" required>
          <a-textarea
            v-model:value="clusterForm.kubeconfig"
            placeholder="粘贴 kubeconfig 内容"
            :rows="10"
          />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea
            v-model:value="clusterForm.description"
            placeholder="集群描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getClusters, createCluster, updateCluster, deleteCluster } from '@/api/cluster'
import { VxeBasicTable } from '@k8s-agent/shared/components'
import dayjs from 'dayjs'

const router = useRouter()
const submitting = ref(false)
const modalVisible = ref(false)
const modalTitle = ref('添加集群')
const editingId = ref(null)
let tableApi = null

const clusterForm = reactive({
  name: '',
  apiServer: '',
  kubeconfig: '',
  description: ''
})

const gridOptions = {
  columns: [
    {
      field: 'id',
      title: '集群 ID',
      width: 100
    },
    {
      field: 'name',
      title: '集群名称'
    },
    {
      field: 'apiServer',
      title: 'API Server',
      showOverflow: 'tooltip'
    },
    {
      field: 'status',
      title: '状态',
      slots: { default: 'status' }
    },
    {
      field: 'description',
      title: '描述',
      showOverflow: 'tooltip'
    },
    {
      field: 'createdAt',
      title: '创建时间',
      slots: { default: 'createdAt' }
    },
    {
      field: 'action',
      title: '操作',
      width: 200,
      slots: { default: 'action' }
    }
  ]
}

const registerTable = (api) => {
  tableApi = api
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const loadClusters = async (params) => {
  try {
    const res = await getClusters(params)
    console.log('[ClusterList] API response:', res)
    return {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
  } catch (error) {
    console.error('[ClusterList] Load error:', error)
    message.error('加载集群列表失败')
    throw error
  }
}

const handleRefresh = () => {
  tableApi?.refresh()
}

const showAddModal = () => {
  modalTitle.value = '添加集群'
  editingId.value = null
  clusterForm.name = ''
  clusterForm.apiServer = ''
  clusterForm.kubeconfig = ''
  clusterForm.description = ''
  modalVisible.value = true
}

const handleView = (record) => {
  router.push(`/clusters/${record.id}`)
}

const handleEdit = (record) => {
  modalTitle.value = '编辑集群'
  editingId.value = record.id
  clusterForm.name = record.name
  clusterForm.apiServer = record.apiServer
  clusterForm.kubeconfig = record.kubeconfig || ''
  clusterForm.description = record.description || ''
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!clusterForm.name || !clusterForm.apiServer || !clusterForm.kubeconfig) {
    message.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateCluster(editingId.value, clusterForm)
      message.success('更新成功')
    } else {
      await createCluster(clusterForm)
      message.success('添加成功')
    }
    modalVisible.value = false
    tableApi?.refresh()
  } catch (error) {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (record) => {
  try {
    await deleteCluster(record.id)
    message.success('删除成功')
    tableApi?.refresh()
  } catch (error) {
    message.error('删除失败')
  }
}
</script>

<style scoped lang="scss">
.cluster-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
