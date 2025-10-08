<template>
  <div class="role-list">
    <VxeBasicTable
      ref="tableRef"
      title="角色管理"
      :grid-options="gridOptions"
      :api="loadRolesApi"
      @register="onTableRegister"
    >
      <template #title-right>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <template #icon><PlusOutlined /></template>
            添加角色
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #permissions="{ row }">
        <a-space wrap>
          <a-tag v-for="perm in (row.permissions || [])" :key="perm">{{ perm }}</a-tag>
        </a-space>
      </template>

      <template #action="{ row }">
        <a-space>
          <a-button type="link" size="small" @click="handleEdit(row)">编辑</a-button>
          <a-popconfirm
            title="确定要删除这个角色吗?"
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
      <a-form :model="roleForm" :label-col="{ span: 6 }">
        <a-form-item label="角色名称" required>
          <a-input v-model:value="roleForm.name" placeholder="输入角色名称" />
        </a-form-item>
        <a-form-item label="角色代码" required>
          <a-input
            v-model:value="roleForm.code"
            placeholder="输入角色代码"
            :disabled="!!editingId"
          />
        </a-form-item>
        <a-form-item label="权限">
          <a-select
            v-model:value="roleForm.permissions"
            mode="multiple"
            placeholder="选择权限"
          >
            <a-select-option value="agent:read">查看 Agent</a-select-option>
            <a-select-option value="agent:write">管理 Agent</a-select-option>
            <a-select-option value="cluster:read">查看集群</a-select-option>
            <a-select-option value="cluster:write">管理集群</a-select-option>
            <a-select-option value="monitor:read">查看监控</a-select-option>
            <a-select-option value="monitor:write">管理监控</a-select-option>
            <a-select-option value="system:read">查看系统</a-select-option>
            <a-select-option value="system:write">管理系统</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea
            v-model:value="roleForm.description"
            placeholder="角色描述"
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
import { getRoles, createRole, updateRole, deleteRole } from '@/api/system'
import { VxeBasicTable } from '@k8s-agent/shared/components'

const tableRef = ref(null)
let tableApi = null

const submitting = ref(false)
const modalVisible = ref(false)
const modalTitle = ref('添加角色')
const editingId = ref(null)

const roleForm = reactive({
  name: '',
  code: '',
  permissions: [],
  description: ''
})

// VxeTable Grid 配置
const gridOptions = {
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    { field: 'name', title: '角色名称', minWidth: 120 },
    { field: 'code', title: '角色代码', minWidth: 120 },
    {
      field: 'permissions',
      title: '权限',
      minWidth: 200,
      slots: { default: 'permissions' }
    },
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
const loadRolesApi = async (params) => {
  console.log('[RoleList] loadRolesApi 调用, params:', params)
  try {
    const res = await getRoles({
      page: params.page,
      pageSize: params.pageSize
    })
    console.log('[RoleList] getRoles 返回:', res)
    const result = {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
    console.log('[RoleList] 返回给 VxeTable:', result)
    return result
  } catch (error) {
    console.error('[RoleList] 加载失败:', error)
    message.error('加载角色列表失败')
    return { data: { list: [], total: 0 } }
  }
}

const onTableRegister = (api) => {
  console.log('[RoleList] Table registered, API:', api)
  tableApi = api
}

const handleRefresh = () => {
  tableApi?.reload()
}

const showAddModal = () => {
  modalTitle.value = '添加角色'
  editingId.value = null
  roleForm.name = ''
  roleForm.code = ''
  roleForm.permissions = []
  roleForm.description = ''
  modalVisible.value = true
}

const handleEdit = (record) => {
  modalTitle.value = '编辑角色'
  editingId.value = record.id
  roleForm.name = record.name
  roleForm.code = record.code
  roleForm.permissions = record.permissions || []
  roleForm.description = record.description || ''
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!roleForm.name || !roleForm.code) {
    message.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateRole(editingId.value, roleForm)
      message.success('更新成功')
    } else {
      await createRole(roleForm)
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
    await deleteRole(record.id)
    message.success('删除成功')
    tableApi?.reload()
  } catch (error) {
    message.error('删除失败')
  }
}

// 组件挂载后确保数据加载
// 修复在 Wujie 微前端环境中直接导航到页面时数据不加载的问题
onMounted(() => {
  console.log('[RoleList] Component mounted')
  // 延迟一小段时间，确保 VxeBasicTable 已经完成注册和首次加载
  nextTick(() => {
    setTimeout(() => {
      console.log('[RoleList] Checking if need to reload data, tableApi exists:', !!tableApi)
      // 如果表格 API 已注册但数据为空，则手动加载数据
      // 这是针对首次进入页面时 VxeBasicTable 的 immediate 加载可能失败的补救措施
      if (tableApi && tableRef.value) {
        const gridRef = tableRef.value.gridRef
        console.log('[RoleList] Current table data length:', gridRef?.tableData?.length || 0)
        // 如果表格数据为空，手动触发加载
        if (!gridRef?.tableData || gridRef.tableData.length === 0) {
          console.log('[RoleList] Table data is empty, manually triggering reload')
          tableApi.reload()
        } else {
          console.log('[RoleList] Table data already loaded, no need to reload')
        }
      }
    }, 300)
  })
})
</script>

<style scoped lang="scss">
.role-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
