<template>
  <PageWrapper title="用户管理">
    <template #extra>
      <a-button v-if="hasPermission('user:create')" type="primary" @click="handleAdd">
        <template #icon><UserAddOutlined /></template>
        新建用户
      </a-button>
    </template>

    <!-- 表格 -->
    <BasicTable
      ref="tableRef"
      title="用户列表"
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      :action-column="{ edit: true, delete: true }"
      @refresh="reload"
      @change="handleTableChange"
      @edit="handleEdit"
      @delete="handleDeleteConfirm"
    >
      <!-- 状态列 -->
      <template #status="{ record }">
        <StatusTag
          :status="record.status"
          :text="record.status === 'active' ? '启用' : '禁用'"
          show-icon
        />
      </template>

      <!-- 角色列 -->
      <template #roles="{ record }">
        <a-space>
          <a-tag v-for="role in record.roles" :key="role" color="blue">
            {{ role }}
          </a-tag>
        </a-space>
      </template>

      <!-- 创建时间列 -->
      <template #createdAt="{ record }">
        <TimeFormat :value="record.createdAt" mode="datetime" />
      </template>
    </BasicTable>

    <!-- 新建/编辑用户模态框 -->
    <BasicModal
      v-model:open="visible"
      :title="isEdit ? '编辑用户' : '新建用户'"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
    >
      <BasicForm
        ref="formRef"
        :schemas="formSchemas"
        :model="formModel"
        :show-action-buttons="false"
      />
    </BasicModal>
  </PageWrapper>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { UserAddOutlined } from '@ant-design/icons-vue'

import {
  PageWrapper,
  BasicTable,
  BasicForm,
  BasicModal,
  StatusTag,
  TimeFormat
} from '@k8s-agent/shared/components'

import { useTable, useModal, useForm } from '@k8s-agent/shared/composables'
import { usePermission } from '@k8s-agent/shared/hooks'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/system'

// 权限
const { hasPermission } = usePermission()

// 表格
const tableRef = ref(null)
const {
  dataSource,
  loading,
  pagination,
  reload,
  handleTableChange,
  deleteAndReload
} = useTable({
  api: getUsers,
  immediate: true
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '用户名', dataIndex: 'username', width: 150 },
  { title: '邮箱', dataIndex: 'email', width: 200 },
  { title: '状态', dataIndex: 'status', width: 100, slots: { customRender: 'status' } },
  { title: '角色', dataIndex: 'roles', width: 200, slots: { customRender: 'roles' } },
  { title: '创建时间', dataIndex: 'createdAt', width: 180, slots: { customRender: 'createdAt' } }
]

// 模态框
const isEdit = ref(false)
const formRef = ref(null)
const formModel = reactive({
  id: null,
  username: '',
  email: '',
  password: '',
  status: 'active',
  roles: []
})

const {
  visible,
  confirmLoading,
  open,
  handleOk: modalHandleOk
} = useModal({
  onOk: async (data) => {
    try {
      await formRef.value?.validate()

      if (isEdit.value) {
        await updateUser(data.id, data)
        message.success('更新成功')
      } else {
        await createUser(data)
        message.success('创建成功')
      }

      reload()
    } catch (error) {
      throw error // 让模态框保持打开状态
    }
  }
})

const formSchemas = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    required: true,
    placeholder: '请输入用户名'
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    required: true,
    placeholder: '请输入邮箱',
    rules: [
      { type: 'email', message: '请输入正确的邮箱格式' }
    ]
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    required: true,
    placeholder: '请输入密码',
    hidden: false // 编辑时可以隐藏
  },
  {
    field: 'status',
    label: '状态',
    component: 'RadioGroup',
    required: true,
    options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]
  },
  {
    field: 'roles',
    label: '角色',
    component: 'CheckboxGroup',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' },
      { label: '访客', value: 'guest' }
    ]
  }
]

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formModel, {
    id: null,
    username: '',
    email: '',
    password: '',
    status: 'active',
    roles: []
  })
  // 显示密码字段
  const passwordSchema = formSchemas.find(s => s.field === 'password')
  if (passwordSchema) {
    passwordSchema.hidden = false
  }
  open(formModel)
}

const handleEdit = (record) => {
  isEdit.value = true
  Object.assign(formModel, record)
  // 隐藏密码字段
  const passwordSchema = formSchemas.find(s => s.field === 'password')
  if (passwordSchema) {
    passwordSchema.hidden = true
  }
  open(formModel)
}

const handleOk = async () => {
  await modalHandleOk()
}

const handleDeleteConfirm = async (record) => {
  await deleteAndReload(async () => {
    await deleteUser(record.id)
    message.success('删除成功')
  })
}
</script>
