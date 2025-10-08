<template>
  <div class="permission-list">
    <VxeBasicTable
      ref="tableRef"
      title="权限管理"
      :grid-options="gridOptions"
      :api="loadPermissionsApi"
      @register="onTableRegister"
    >
      <template #title-right>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <template #icon><PlusOutlined /></template>
            添加权限
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #resource="{ row }">
        <a-tag color="blue">{{ row.resource }}</a-tag>
      </template>

      <template #action="{ row }">
        <a-space>
          <a-button type="link" size="small" @click="handleEdit(row)">编辑</a-button>
          <a-popconfirm
            title="确定要删除这个权限吗?"
            @confirm="handleDelete(row)"
          >
            <a-button type="link" size="small" danger>删除</a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </VxeBasicTable>

    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="permissionForm" :label-col="{ span: 6 }">
        <a-form-item label="权限名称" required>
          <a-input
            v-model:value="permissionForm.name"
            placeholder="输入权限名称"
          />
        </a-form-item>
        <a-form-item label="权限代码" required>
          <a-input
            v-model:value="permissionForm.code"
            placeholder="如: agent:read"
            :disabled="!!editingId"
          />
        </a-form-item>
        <a-form-item label="资源类型" required>
          <a-select v-model:value="permissionForm.resource" placeholder="选择资源类型">
            <a-select-option value="agent">Agent</a-select-option>
            <a-select-option value="cluster">集群</a-select-option>
            <a-select-option value="monitor">监控</a-select-option>
            <a-select-option value="system">系统</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="操作类型" required>
          <a-select v-model:value="permissionForm.actionType" placeholder="选择操作类型">
            <a-select-option value="read">查看</a-select-option>
            <a-select-option value="write">编辑</a-select-option>
            <a-select-option value="delete">删除</a-select-option>
            <a-select-option value="execute">执行</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea
            v-model:value="permissionForm.description"
            placeholder="权限描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission
} from '@/api/system'
import { VxeBasicTable } from '@k8s-agent/shared/components'

const tableRef = ref(null)
let tableApi = null

const submitting = ref(false)
const modalVisible = ref(false)
const modalTitle = ref('添加权限')
const editingId = ref(null)

const permissionForm = reactive({
  name: '',
  code: '',
  resource: '',
  actionType: '',
  description: ''
})

// VxeTable Grid 配置
const gridOptions = {
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    { field: 'name', title: '权限名称', minWidth: 120 },
    { field: 'code', title: '权限代码', minWidth: 150 },
    {
      field: 'resource',
      title: '资源类型',
      width: 120,
      slots: { default: 'resource' }
    },
    { field: 'actionType', title: '操作类型', width: 120 },
    { field: 'description', title: '描述', minWidth: 150, showOverflow: 'title' },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      slots: { default: 'action' }
    }
  ]
}

// API 数据加载函数
const loadPermissionsApi = async (params) => {
  console.log('[PermissionList] loadPermissionsApi 调用, params:', params)
  try {
    const res = await getPermissions({
      page: params.page,
      pageSize: params.pageSize
    })
    console.log('[PermissionList] getPermissions 返回:', res)
    const result = {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
    console.log('[PermissionList] 返回给 VxeTable:', result)
    return result
  } catch (error) {
    console.error('[PermissionList] 加载失败:', error)
    message.error('加载权限列表失败')
    return { data: { list: [], total: 0 } }
  }
}

const onTableRegister = (api) => {
  tableApi = api
}

const handleRefresh = () => {
  tableApi?.reload()
}

const showAddModal = () => {
  modalTitle.value = '添加权限'
  editingId.value = null
  permissionForm.name = ''
  permissionForm.code = ''
  permissionForm.resource = ''
  permissionForm.actionType = ''
  permissionForm.description = ''
  modalVisible.value = true
}

const handleEdit = (record) => {
  modalTitle.value = '编辑权限'
  editingId.value = record.id
  permissionForm.name = record.name
  permissionForm.code = record.code
  permissionForm.resource = record.resource
  permissionForm.actionType = record.actionType
  permissionForm.description = record.description || ''
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!permissionForm.name || !permissionForm.code || !permissionForm.resource) {
    message.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updatePermission(editingId.value, permissionForm)
      message.success('更新成功')
    } else {
      await createPermission(permissionForm)
      message.success('创建成功')
    }
    modalVisible.value = false
    tableApi?.reload()
  } catch (error) {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (record) => {
  try {
    await deletePermission(record.id)
    message.success('删除成功')
    tableApi?.reload()
  } catch (error) {
    message.error('删除失败')
  }
}

// 组件挂载后确保数据加载
onMounted(() => {
  console.log('[PermissionList] Component mounted')
  nextTick(() => {
    setTimeout(() => {
      console.log('[PermissionList] Checking if need to reload data, tableApi exists:', !!tableApi)
      if (tableApi && tableRef.value) {
        const gridRef = tableRef.value.gridRef
        console.log('[PermissionList] Current table data length:', gridRef?.tableData?.length || 0)
        if (!gridRef?.tableData || gridRef.tableData.length === 0) {
          console.log('[PermissionList] Table data is empty, manually triggering reload')
          tableApi.reload()
        } else {
          console.log('[PermissionList] Table data already loaded, no need to reload')
        }
      }
    }, 300)
  })
})
</script>

<style scoped lang="scss">
.permission-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
