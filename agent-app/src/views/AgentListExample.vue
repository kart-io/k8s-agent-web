<template>
  <PageWrapper title="Agent 管理" description="管理和监控 Kubernetes Agent">
    <template #extra>
      <a-space>
        <a-button v-if="hasPermission('agent:create')" type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新建 Agent
        </a-button>
        <a-button @click="handleRefresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </a-space>
    </template>

    <!-- 搜索表单 -->
    <a-card class="search-card">
      <BasicForm
        ref="searchFormRef"
        :schemas="searchSchemas"
        :model="searchModel"
        :show-action-buttons="false"
        layout="inline"
      >
        <template #actions>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleResetSearch">重置</a-button>
          </a-space>
        </template>
      </BasicForm>
    </a-card>

    <!-- Agent 列表表格 -->
    <BasicTable
      ref="tableRef"
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      :action-column="{ edit: true, delete: true, width: 180 }"
      @change="handleTableChange"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <!-- 状态列 -->
      <template #status="{ record }">
        <StatusTag :status="record.status" :text="statusText[record.status]" show-icon />
      </template>

      <!-- 集群列 -->
      <template #cluster="{ record }">
        <a-tag color="blue">{{ record.cluster }}</a-tag>
      </template>

      <!-- 时间列 -->
      <template #lastHeartbeat="{ record }">
        <TimeFormat :value="record.lastHeartbeat" mode="relative" />
      </template>

      <!-- CPU 使用率 -->
      <template #cpuUsage="{ record }">
        <a-progress
          :percent="record.cpuUsage"
          :status="record.cpuUsage > 80 ? 'exception' : 'normal'"
          size="small"
        />
      </template>

      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a-button
            v-if="hasPermission('agent:view')"
            type="link"
            size="small"
            @click="handleView(record)"
          >
            查看
          </a-button>
          <a-button
            v-if="hasPermission('agent:edit')"
            type="link"
            size="small"
            @click="handleEdit(record)"
          >
            编辑
          </a-button>
          <a-popconfirm
            v-if="hasPermission('agent:delete')"
            title="确定要删除该 Agent 吗？"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" danger size="small">删除</a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </BasicTable>

    <!-- 编辑模态框 -->
    <BasicModal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="modalLoading"
      width="600px"
      @ok="handleModalOk"
    >
      <BasicForm
        ref="formRef"
        :schemas="formSchemas"
        :model="formModel"
        :show-action-buttons="false"
      />
    </BasicModal>

    <!-- Agent 详情抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      title="Agent 详情"
      width="720"
      @close="drawerVisible = false"
    >
      <Description
        :data="currentAgent"
        :schema="detailSchemas"
        bordered
      >
        <template #status="{ data }">
          <StatusTag :status="data.status" :text="statusText[data.status]" show-icon />
        </template>

        <template #cpuUsage="{ data }">
          <a-progress :percent="data.cpuUsage" />
        </template>

        <template #memoryUsage="{ data }">
          <a-progress :percent="data.memoryUsage" />
        </template>
      </Description>
    </a-drawer>
  </PageWrapper>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'

// 组件
import {
  PageWrapper,
  BasicTable,
  BasicForm,
  BasicModal,
  Description,
  StatusTag,
  TimeFormat
} from '@k8s-agent/shared/components'

// Composables 和 Hooks
import { useTable } from '@k8s-agent/shared/composables'
import { usePermission } from '@k8s-agent/shared/hooks'

// API
import { getAgents, createAgent, updateAgent, deleteAgent } from '@/api/agent'

// 权限
const { hasPermission } = usePermission()

// 搜索表单
const searchFormRef = ref(null)
const searchModel = reactive({
  name: '',
  cluster: '',
  status: undefined
})

const searchSchemas = [
  {
    field: 'name',
    label: 'Agent 名称',
    component: 'Input',
    placeholder: '请输入 Agent 名称',
    colSpan: 8
  },
  {
    field: 'cluster',
    label: '集群',
    component: 'Select',
    placeholder: '请选择集群',
    options: [
      { label: '全部', value: '' },
      { label: 'prod-cluster', value: 'prod-cluster' },
      { label: 'dev-cluster', value: 'dev-cluster' }
    ],
    colSpan: 8
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    placeholder: '请选择状态',
    options: [
      { label: '全部', value: undefined },
      { label: '在线', value: 'online' },
      { label: '离线', value: 'offline' },
      { label: '异常', value: 'error' }
    ],
    colSpan: 8
  }
]

// 表格
const tableRef = ref(null)
const {
  dataSource,
  loading,
  pagination,
  search,
  reload,
  handleTableChange,
  setSearch
} = useTable({
  api: getAgents,
  immediate: true,
  searchParams: searchModel
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80, fixed: 'left' },
  { title: 'Agent 名称', dataIndex: 'name', width: 150 },
  { title: '集群', dataIndex: 'cluster', width: 120, slots: { customRender: 'cluster' } },
  { title: '状态', dataIndex: 'status', width: 100, slots: { customRender: 'status' } },
  { title: 'IP 地址', dataIndex: 'ip', width: 140 },
  { title: 'CPU 使用率', dataIndex: 'cpuUsage', width: 120, slots: { customRender: 'cpuUsage' } },
  { title: '内存使用率', dataIndex: 'memoryUsage', width: 100 },
  { title: '版本', dataIndex: 'version', width: 100 },
  { title: '最后心跳', dataIndex: 'lastHeartbeat', width: 150, slots: { customRender: 'lastHeartbeat' } }
]

const statusText = {
  online: '在线',
  offline: '离线',
  error: '异常'
}

// 搜索
const handleSearch = () => {
  setSearch(searchModel)
}

const handleResetSearch = () => {
  searchFormRef.value?.resetFields()
  setSearch({})
}

const handleRefresh = () => {
  reload()
}

// 模态框
const modalVisible = ref(false)
const modalLoading = ref(false)
const modalTitle = ref('')
const isEdit = ref(false)
const formRef = ref(null)
const formModel = reactive({
  id: null,
  name: '',
  cluster: '',
  ip: '',
  version: ''
})

const formSchemas = [
  {
    field: 'name',
    label: 'Agent 名称',
    component: 'Input',
    required: true,
    placeholder: '请输入 Agent 名称'
  },
  {
    field: 'cluster',
    label: '集群',
    component: 'Select',
    required: true,
    placeholder: '请选择集群',
    options: [
      { label: 'prod-cluster', value: 'prod-cluster' },
      { label: 'dev-cluster', value: 'dev-cluster' }
    ]
  },
  {
    field: 'ip',
    label: 'IP 地址',
    component: 'Input',
    required: true,
    placeholder: '请输入 IP 地址'
  },
  {
    field: 'version',
    label: '版本',
    component: 'Input',
    placeholder: '请输入版本号'
  }
]

const handleAdd = () => {
  isEdit.value = false
  modalTitle.value = '新建 Agent'
  Object.assign(formModel, {
    id: null,
    name: '',
    cluster: '',
    ip: '',
    version: ''
  })
  modalVisible.value = true
}

const handleEdit = (record) => {
  isEdit.value = true
  modalTitle.value = '编辑 Agent'
  Object.assign(formModel, record)
  modalVisible.value = true
}

const handleModalOk = async () => {
  try {
    await formRef.value?.validate()

    modalLoading.value = true

    if (isEdit.value) {
      await updateAgent(formModel.id, formModel)
      message.success('更新成功')
    } else {
      await createAgent(formModel)
      message.success('创建成功')
    }

    modalVisible.value = false
    reload()
  } catch (error) {
    console.error('Submit failed:', error)
  } finally {
    modalLoading.value = false
  }
}

const handleDelete = async (record) => {
  try {
    await deleteAgent(record.id)
    message.success('删除成功')
    reload()
  } catch (error) {
    message.error('删除失败')
  }
}

// 详情抽屉
const drawerVisible = ref(false)
const currentAgent = ref({})

const detailSchemas = [
  { label: 'ID', field: 'id', span: 12 },
  { label: 'Agent 名称', field: 'name', span: 12 },
  { label: '集群', field: 'cluster', span: 12 },
  { label: '状态', field: 'status', span: 12, slot: 'status' },
  { label: 'IP 地址', field: 'ip', span: 12 },
  { label: '版本', field: 'version', span: 12 },
  { label: 'CPU 使用率', field: 'cpuUsage', span: 12, slot: 'cpuUsage' },
  { label: '内存使用率', field: 'memoryUsage', span: 12, slot: 'memoryUsage' },
  { label: '创建时间', field: 'createdAt', span: 12 },
  { label: '最后心跳', field: 'lastHeartbeat', span: 12 }
]

const handleView = (record) => {
  currentAgent.value = record
  drawerVisible.value = true
}
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}
</style>
