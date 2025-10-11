<template>
  <div class="menu-list">
    <VxeBasicTable
      ref="tableRef"
      title="菜单管理"
      :grid-options="gridOptions"
      :api="loadMenusApi"
      :params="searchParams"
      :show-pager="false"
      @register="onTableRegister"
    >
      <template #title-right>
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索菜单名称或路径"
            style="width: 250px"
            @search="handleSearch"
          />
          <a-button type="primary" @click="showAddModal">
            <template #icon><PlusOutlined /></template>
            添加菜单
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #type="{ row }">
        <a-tag :color="getTypeColor(row.type)">
          {{ getTypeText(row.type) }}
        </a-tag>
      </template>

      <template #status="{ row }">
        <a-badge
          :status="row.status === 'enabled' ? 'success' : 'default'"
          :text="row.status === 'enabled' ? '启用' : '禁用'"
        />
      </template>

      <template #visible="{ row }">
        <a-tag :color="row.visible ? 'success' : 'default'">
          {{ row.visible ? '显示' : '隐藏' }}
        </a-tag>
      </template>

      <template #icon="{ row }">
        <component
          v-if="row.icon"
          :is="getIconComponent(row.icon)"
          style="font-size: 16px"
        />
        <span v-else>-</span>
      </template>

      <template #action="{ row }">
        <a-space>
          <a-button type="link" size="small" @click="handleEdit(row)">编辑</a-button>
          <a-button
            v-if="row.type === 'directory'"
            type="link"
            size="small"
            @click="handleAddChild(row)"
          >
            添加子菜单
          </a-button>
          <a-popconfirm
            title="确定要删除这个菜单吗?"
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
      width="700px"
    >
      <a-form :model="menuForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="上级菜单">
          <a-tree-select
            v-model:value="menuForm.parentId"
            :tree-data="parentMenuOptions"
            placeholder="选择上级菜单（留空为顶级菜单）"
            allow-clear
            :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
          />
        </a-form-item>

        <a-form-item label="菜单类型" required>
          <a-radio-group v-model:value="menuForm.type">
            <a-radio value="menu">菜单</a-radio>
            <a-radio value="directory">目录</a-radio>
            <a-radio value="button">按钮</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="菜单名称" required>
          <a-input v-model:value="menuForm.name" placeholder="输入菜单名称" />
        </a-form-item>

        <a-form-item label="路由路径" :required="menuForm.type !== 'button'">
          <a-input
            v-model:value="menuForm.path"
            placeholder="/system/menus"
            :disabled="menuForm.type === 'button'"
          />
        </a-form-item>

        <a-form-item label="菜单图标">
          <a-input
            v-model:value="menuForm.icon"
            placeholder="MenuOutlined"
            suffix="Outlined"
          >
            <template #prefix>
              <component
                v-if="menuForm.icon"
                :is="getIconComponent(menuForm.icon)"
              />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="组件类型" v-if="menuForm.type === 'menu'">
          <a-select v-model:value="menuForm.component" placeholder="选择组件类型">
            <a-select-option value="MicroAppPlaceholder">微应用容器</a-select-option>
            <a-select-option value="SubMenu">子菜单容器</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="微应用名称" v-if="menuForm.component === 'MicroAppPlaceholder'">
          <a-select v-model:value="menuForm.microApp" placeholder="选择微应用">
            <a-select-option value="dashboard-app">Dashboard</a-select-option>
            <a-select-option value="agent-app">Agent管理</a-select-option>
            <a-select-option value="cluster-app">集群管理</a-select-option>
            <a-select-option value="monitor-app">监控中心</a-select-option>
            <a-select-option value="system-app">系统管理</a-select-option>
            <a-select-option value="image-build-app">镜像构建</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="排序号">
          <a-input-number
            v-model:value="menuForm.orderNum"
            :min="0"
            :max="9999"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="菜单状态">
          <a-radio-group v-model:value="menuForm.status">
            <a-radio value="enabled">启用</a-radio>
            <a-radio value="disabled">禁用</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="是否可见">
          <a-switch v-model:checked="menuForm.visible" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { createMenu, deleteMenu, getMenus, updateMenu } from '@/api/system'
import {
  CloudServerOutlined,
  ClusterOutlined,
  ContainerOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LockOutlined,
  MenuOutlined,
  MonitorOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import { VxeBasicTable } from '@k8s-agent/shared/components'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { computed, reactive, ref } from 'vue'

const tableRef = ref(null)
let tableApi = null

const submitting = ref(false)
const searchText = ref('')
const modalVisible = ref(false)
const modalTitle = ref('添加菜单')
const editingId = ref(null)

const searchParams = reactive({
  search: ''
})

const menuForm = reactive({
  parentId: null,
  name: '',
  path: '',
  component: 'MicroAppPlaceholder',
  icon: '',
  type: 'menu',
  orderNum: 999,
  status: 'enabled',
  visible: true,
  microApp: null
})

// 图标映射
const iconComponents = {
  DashboardOutlined,
  CloudServerOutlined,
  ClusterOutlined,
  MonitorOutlined,
  SettingOutlined,
  ContainerOutlined,
  MenuOutlined,
  UserOutlined,
  SafetyOutlined,
  LockOutlined,
  FileTextOutlined
}

const getIconComponent = (iconName) => {
  return iconComponents[iconName] || MenuOutlined
}

const getTypeColor = (type) => {
  const colorMap = {
    menu: 'blue',
    directory: 'green',
    button: 'orange'
  }
  return colorMap[type] || 'default'
}

const getTypeText = (type) => {
  const textMap = {
    menu: '菜单',
    directory: '目录',
    button: '按钮'
  }
  return textMap[type] || type
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

// 构建父菜单选项（树形结构）
const parentMenuOptions = computed(() => {
  // 使用 getTableData 方法获取当前表格数据
  const menus = tableApi?.getTableData?.() || []

  if (!Array.isArray(menus) || menus.length === 0) {
    return []
  }

  const rootMenus = menus.filter(m => !m.parentId && m.type !== 'button')

  const buildTree = (parentId) => {
    return menus
      .filter(m => m.parentId === parentId && m.type !== 'button')
      .map(m => ({
        id: m.id,
        name: m.name,
        children: buildTree(m.id)
      }))
  }

  return rootMenus.map(m => ({
    id: m.id,
    name: m.name,
    children: buildTree(m.id)
  }))
})

// VxeTable Grid 配置
const gridOptions = {
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    { field: 'name', title: '菜单名称', minWidth: 150, treeNode: true },
    { field: 'path', title: '路由路径', minWidth: 200 },
    {
      field: 'type',
      title: '类型',
      width: 100,
      slots: { default: 'type' }
    },
    {
      field: 'icon',
      title: '图标',
      width: 80,
      align: 'center',
      slots: { default: 'icon' }
    },
    { field: 'component', title: '组件', width: 150 },
    { field: 'microApp', title: '微应用', width: 120 },
    { field: 'orderNum', title: '排序', width: 80 },
    {
      field: 'status',
      title: '状态',
      width: 100,
      slots: { default: 'status' }
    },
    {
      field: 'visible',
      title: '可见',
      width: 80,
      slots: { default: 'visible' }
    },
    {
      title: '操作',
      width: 250,
      fixed: 'right',
      slots: { default: 'action' }
    }
  ],
  treeConfig: {
    transform: true,
    rowField: 'id',
    parentField: 'parentId',
    expandAll: false,  // 改为 false，允许用户手动展开/收起
    accordion: false,  // 允许多个节点同时展开
    trigger: 'default',  // 点击树节点图标触发展开/收起
    lazy: false,  // 非懒加载模式
    reserve: true  // 保留展开状态
  }
}

// API 数据加载函数
const loadMenusApi = async (params) => {
  console.log('[MenuList] loadMenusApi 调用, params:', params)
  try {
    const res = await getMenus({
      search: params.search
    })
    console.log('[MenuList] getMenus 返回:', res)
    const result = {
      data: {
        list: res.data || [],
        total: res.total || 0
      }
    }
    console.log('[MenuList] 返回给 VxeTable:', result)
    return result
  } catch (error) {
    console.error('[MenuList] 加载失败:', error)
    message.error('加载菜单列表失败: ' + error.message)
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

const resetForm = () => {
  menuForm.parentId = null
  menuForm.name = ''
  menuForm.path = ''
  menuForm.component = 'MicroAppPlaceholder'
  menuForm.icon = ''
  menuForm.type = 'menu'
  menuForm.orderNum = 999
  menuForm.status = 'enabled'
  menuForm.visible = true
  menuForm.microApp = null
}

const showAddModal = () => {
  modalTitle.value = '添加菜单'
  editingId.value = null
  resetForm()
  modalVisible.value = true
}

const handleAddChild = (record) => {
  modalTitle.value = '添加子菜单'
  editingId.value = null
  resetForm()
  menuForm.parentId = record.id
  modalVisible.value = true
}

const handleEdit = (record) => {
  modalTitle.value = '编辑菜单'
  editingId.value = record.id
  menuForm.parentId = record.parentId
  menuForm.name = record.name
  menuForm.path = record.path
  menuForm.component = record.component
  menuForm.icon = record.icon || ''
  menuForm.type = record.type
  menuForm.orderNum = record.orderNum
  menuForm.status = record.status
  menuForm.visible = record.visible
  menuForm.microApp = record.microApp
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!menuForm.name) {
    message.warning('请输入菜单名称')
    return
  }

  if (menuForm.type !== 'button' && !menuForm.path) {
    message.warning('请输入路由路径')
    return
  }

  submitting.value = true
  try {
    const data = { ...menuForm }

    if (editingId.value) {
      await updateMenu(editingId.value, data)
      message.success('更新成功')
    } else {
      await createMenu(data)
      message.success('创建成功')
    }
    modalVisible.value = false
    tableApi?.reload()
  } catch (error) {
    message.error('操作失败: ' + error.message)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (record) => {
  try {
    await deleteMenu(record.id)
    message.success('删除成功')
    tableApi?.reload()
  } catch (error) {
    message.error('删除失败: ' + error.message)
  }
}
</script>

<style scoped lang="scss">
.menu-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
