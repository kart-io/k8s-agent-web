<template>
  <div class="user-list">
    <VxeBasicTable
      ref="tableRef"
      title="用户管理"
      :grid-options="gridOptions"
      :api="loadUsersApi"
      :params="searchParams"
      @register="onTableRegister"
    >
      <template #title-right>
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索用户"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-button type="primary" @click="showAddModal">
            <template #icon><PlusOutlined /></template>
            添加用户
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #roles="{ row }">
        <a-space>
          <a-tag v-for="role in (row.roles || [])" :key="role">{{ role }}</a-tag>
        </a-space>
      </template>

      <template #status="{ row }">
        <a-badge
          :status="row.status === 'active' ? 'success' : 'default'"
          :text="row.status === 'active' ? '正常' : '禁用'"
        />
      </template>

      <template #action="{ row }">
        <a-space>
          <a-button type="link" size="small" @click="handleEdit(row)">编辑</a-button>
          <a-button type="link" size="small" @click="handleResetPassword(row)">重置密码</a-button>
          <a-popconfirm
            title="确定要删除这个用户吗?"
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
      <a-form :model="userForm" :label-col="{ span: 6 }">
        <a-form-item label="用户名" required>
          <a-input
            v-model:value="userForm.username"
            placeholder="输入用户名"
            :disabled="!!editingId"
          />
        </a-form-item>
        <a-form-item label="密码" :required="!editingId">
          <a-input-password
            v-model:value="userForm.password"
            placeholder="输入密码"
          />
        </a-form-item>
        <a-form-item label="邮箱" required>
          <a-input v-model:value="userForm.email" placeholder="输入邮箱" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select
            v-model:value="userForm.roles"
            mode="multiple"
            placeholder="选择角色"
          >
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="operator">运维</a-select-option>
            <a-select-option value="viewer">查看者</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="userForm.status">
            <a-radio value="active">正常</a-radio>
            <a-radio value="disabled">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/system'
import { VxeBasicTable } from '@k8s-agent/shared/components'
import dayjs from 'dayjs'

const tableRef = ref(null)
let tableApi = null

const submitting = ref(false)
const searchText = ref('')
const modalVisible = ref(false)
const modalTitle = ref('添加用户')
const editingId = ref(null)

const searchParams = reactive({
  search: ''
})

const userForm = reactive({
  username: '',
  password: '',
  email: '',
  roles: [],
  status: 'active'
})

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

// VxeTable Grid 配置
const gridOptions = {
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    { field: 'username', title: '用户名', minWidth: 120 },
    { field: 'email', title: '邮箱', minWidth: 180 },
    {
      field: 'roles',
      title: '角色',
      width: 150,
      slots: { default: 'roles' }
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      slots: { default: 'status' }
    },
    {
      field: 'createdAt',
      title: '创建时间',
      width: 180,
      formatter: ({ cellValue }) => formatTime(cellValue)
    },
    {
      title: '操作',
      width: 250,
      fixed: 'right',
      slots: { default: 'action' }
    }
  ]
}

// API 数据加载函数
const loadUsersApi = async (params) => {
  console.log('[UserList] loadUsersApi 调用, params:', params)
  try {
    const res = await getUsers({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search
    })
    console.log('[UserList] getUsers 返回:', res)
    const result = {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
    console.log('[UserList] 返回给 VxeTable:', result)
    return result
  } catch (error) {
    console.error('[UserList] 加载失败:', error)
    message.error('加载用户列表失败: ' + error.message)
    return { data: { list: [], total: 0 } }
  }
}

const onTableRegister = (api) => {
  tableApi = api
}

const handleSearch = () => {
  searchParams.search = searchText.value
  tableApi?.query()
}

const handleRefresh = () => {
  tableApi?.reload()
}

const showAddModal = () => {
  modalTitle.value = '添加用户'
  editingId.value = null
  userForm.username = ''
  userForm.password = ''
  userForm.email = ''
  userForm.roles = []
  userForm.status = 'active'
  modalVisible.value = true
}

const handleEdit = (record) => {
  modalTitle.value = '编辑用户'
  editingId.value = record.id
  userForm.username = record.username
  userForm.password = ''
  userForm.email = record.email
  userForm.roles = record.roles || []
  userForm.status = record.status
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!userForm.username || !userForm.email) {
    message.warning('请填写必填项')
    return
  }

  if (!editingId.value && !userForm.password) {
    message.warning('请输入密码')
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateUser(editingId.value, userForm)
      message.success('更新成功')
    } else {
      await createUser(userForm)
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

const handleResetPassword = (record) => {
  message.info('重置密码功能开发中')
}

const handleDelete = async (record) => {
  try {
    await deleteUser(record.id)
    message.success('删除成功')
    tableApi?.reload()
  } catch (error) {
    message.error('删除失败')
  }
}

// 组件挂载后确保数据加载
onMounted(() => {
  console.log('[UserList] Component mounted')
  nextTick(() => {
    setTimeout(() => {
      console.log('[UserList] Checking if need to reload data, tableApi exists:', !!tableApi)
      if (tableApi && tableRef.value) {
        const gridRef = tableRef.value.gridRef
        console.log('[UserList] Current table data length:', gridRef?.tableData?.length || 0)
        if (!gridRef?.tableData || gridRef.tableData.length === 0) {
          console.log('[UserList] Table data is empty, manually triggering reload')
          tableApi.reload()
        } else {
          console.log('[UserList] Table data already loaded, no need to reload')
        }
      }
    }, 300)
  })
})
</script>

<style scoped lang="scss">
.user-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
