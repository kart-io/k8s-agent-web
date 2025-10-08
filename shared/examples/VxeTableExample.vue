<!--
  VXE Table 使用示例
  展示各种表格功能
-->
<template>
  <div class="vxe-table-example">
    <a-card title="VXE Table 示例" :bordered="false">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 基础表格 -->
        <a-tab-pane key="basic" tab="基础表格">
          <VxeBasicTable
            title="用户列表"
            :grid-options="basicGridOptions"
            :data-source="basicData"
          >
            <template #toolbar>
              <a-space>
                <a-button type="primary" @click="handleAdd">新增</a-button>
                <a-button @click="handleBatchDelete">批量删除</a-button>
              </a-space>
            </template>
          </VxeBasicTable>
        </a-tab-pane>

        <!-- API 数据加载 -->
        <a-tab-pane key="api" tab="API加载">
          <VxeBasicTable
            ref="apiTableRef"
            title="API 数据表格"
            :grid-options="apiGridOptions"
            :api="fetchUserList"
            :params="apiParams"
            @register="onApiTableRegister"
            @load-success="handleLoadSuccess"
          >
            <template #title-right>
              <a-space>
                <a-input-search
                  v-model:value="searchKeyword"
                  placeholder="搜索用户"
                  style="width: 200px"
                  @search="handleSearch"
                />
                <a-button @click="handleRefresh">刷新</a-button>
              </a-space>
            </template>
          </VxeBasicTable>
        </a-tab-pane>

        <!-- 可编辑表格 -->
        <a-tab-pane key="editable" tab="可编辑表格">
          <VxeBasicTable
            title="可编辑表格"
            :grid-options="editableGridOptions"
            :data-source="editableData"
          >
            <template #toolbar>
              <a-space>
                <a-button type="primary" @click="handleInsertRow">插入行</a-button>
                <a-button @click="handleSaveEdit">保存</a-button>
                <a-button @click="handleCancelEdit">取消</a-button>
              </a-space>
            </template>
          </VxeBasicTable>
        </a-tab-pane>

        <!-- 树形表格 -->
        <a-tab-pane key="tree" tab="树形表格">
          <VxeBasicTable
            ref="treeTableRef"
            title="部门组织架构"
            :grid-options="treeGridOptions"
            :data-source="treeData"
            @register="onTreeTableRegister"
          >
            <template #toolbar>
              <a-space>
                <a-button @click="handleExpandAll">展开全部</a-button>
                <a-button @click="handleCollapseAll">折叠全部</a-button>
              </a-space>
            </template>
          </VxeBasicTable>
        </a-tab-pane>

        <!-- 固定列 -->
        <a-tab-pane key="fixed" tab="固定列">
          <VxeBasicTable
            title="固定列表格"
            :grid-options="fixedGridOptions"
            :data-source="fixedData"
          />
        </a-tab-pane>

        <!-- 合并单元格 -->
        <a-tab-pane key="merge" tab="合并单元格">
          <VxeBasicTable
            title="合并单元格"
            :grid-options="mergeGridOptions"
            :data-source="mergeData"
          />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { VxeBasicTable } from '@k8s-agent/shared/components'

const activeTab = ref('basic')
const searchKeyword = ref('')
const apiParams = reactive({
  keyword: ''
})

// ===== 基础表格 =====
const basicData = ref([
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com', status: '在职' },
  { id: 2, name: '李四', age: 32, email: 'lisi@example.com', status: '在职' },
  { id: 3, name: '王五', age: 25, email: 'wangwu@example.com', status: '离职' },
  { id: 4, name: '赵六', age: 30, email: 'zhaoliu@example.com', status: '在职' },
  { id: 5, name: '钱七', age: 27, email: 'qianqi@example.com', status: '在职' }
])

const basicGridOptions = {
  border: true,
  stripe: true,
  highlightHoverRow: true,
  columns: [
    { type: 'checkbox', width: 60, fixed: 'left' },
    { type: 'seq', width: 60, title: '序号' },
    { field: 'name', title: '姓名', width: 120 },
    { field: 'age', title: '年龄', width: 100, sortable: true },
    { field: 'email', title: '邮箱', minWidth: 200 },
    {
      field: 'status',
      title: '状态',
      width: 100,
      cellRender: {
        name: 'ATag',
        props: (params) => {
          return {
            color: params.row.status === '在职' ? 'success' : 'default'
          }
        }
      }
    },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      slots: { default: 'action' },
      cellRender: {
        name: 'ASpace',
        children: [
          {
            name: 'AButton',
            props: { type: 'link', size: 'small' },
            content: '编辑'
          },
          {
            name: 'AButton',
            props: { type: 'link', danger: true, size: 'small' },
            content: '删除'
          }
        ]
      }
    }
  ]
}

// ===== API 数据加载 =====
const apiTableRef = ref(null)
let apiTableApi = null

const apiGridOptions = {
  border: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '姓名', width: 120 },
    { field: 'age', title: '年龄', width: 100, sortable: true },
    { field: 'email', title: '邮箱', minWidth: 200 },
    { field: 'address', title: '地址', minWidth: 200 }
  ]
}

// 模拟 API 请求
const fetchUserList = async (params) => {
  await new Promise(resolve => setTimeout(resolve, 500))

  const mockData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `用户${i + 1}`,
    age: 20 + Math.floor(Math.random() * 30),
    email: `user${i + 1}@example.com`,
    address: `地址${i + 1}`
  }))

  // 过滤
  let filteredData = mockData
  if (params.keyword) {
    filteredData = mockData.filter(item =>
      item.name.includes(params.keyword) ||
      item.email.includes(params.keyword)
    )
  }

  // 分页
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const list = filteredData.slice(start, end)

  return {
    data: {
      list,
      total: filteredData.length
    }
  }
}

const onApiTableRegister = (api) => {
  apiTableApi = api
}

const handleLoadSuccess = ({ list, total }) => {
  console.log('加载成功:', { list, total })
}

const handleSearch = () => {
  apiParams.keyword = searchKeyword.value
  apiTableApi?.query()
}

const handleRefresh = () => {
  apiTableApi?.reload()
}

// ===== 可编辑表格 =====
const editableData = ref([
  { id: 1, name: '产品1', price: 100, qty: 10, total: 1000 },
  { id: 2, name: '产品2', price: 200, qty: 5, total: 1000 },
  { id: 3, name: '产品3', price: 150, qty: 8, total: 1200 }
])

const editableGridOptions = {
  border: true,
  editConfig: {
    trigger: 'click',
    mode: 'cell',
    showStatus: true
  },
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'name',
      title: '产品名称',
      width: 200,
      editRender: { name: 'AInput' }
    },
    {
      field: 'price',
      title: '单价',
      width: 120,
      editRender: { name: 'AInputNumber' }
    },
    {
      field: 'qty',
      title: '数量',
      width: 120,
      editRender: { name: 'AInputNumber' }
    },
    {
      field: 'total',
      title: '总价',
      width: 120
    }
  ]
}

// ===== 树形表格 =====
const treeTableRef = ref(null)
let treeTableApi = null

const treeData = ref([
  {
    id: 1,
    name: '总公司',
    type: '公司',
    manager: '张总',
    children: [
      {
        id: 11,
        name: '技术部',
        type: '部门',
        manager: '李经理',
        children: [
          { id: 111, name: '前端组', type: '小组', manager: '王组长' },
          { id: 112, name: '后端组', type: '小组', manager: '赵组长' }
        ]
      },
      {
        id: 12,
        name: '销售部',
        type: '部门',
        manager: '刘经理',
        children: [
          { id: 121, name: '华东区', type: '小组', manager: '陈组长' },
          { id: 122, name: '华南区', type: '小组', manager: '杨组长' }
        ]
      }
    ]
  }
])

const treeGridOptions = {
  border: true,
  treeConfig: {
    transform: true,
    rowField: 'id',
    parentField: 'parentId',
    children: 'children'
  },
  columns: [
    { field: 'name', title: '名称', treeNode: true, minWidth: 200 },
    { field: 'type', title: '类型', width: 120 },
    { field: 'manager', title: '负责人', width: 150 }
  ]
}

const onTreeTableRegister = (api) => {
  treeTableApi = api
}

const handleExpandAll = () => {
  treeTableApi?.expandAll()
}

const handleCollapseAll = () => {
  treeTableApi?.collapseAll()
}

// ===== 固定列表格 =====
const fixedData = ref(
  Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    col1: `列1-${i + 1}`,
    col2: `列2-${i + 1}`,
    col3: `列3-${i + 1}`,
    col4: `列4-${i + 1}`,
    col5: `列5-${i + 1}`,
    col6: `列6-${i + 1}`,
    col7: `列7-${i + 1}`,
    col8: `列8-${i + 1}`
  }))
)

const fixedGridOptions = {
  border: true,
  height: 400,
  columns: [
    { type: 'seq', width: 60, title: '序号', fixed: 'left' },
    { field: 'col1', title: '列1', width: 150, fixed: 'left' },
    { field: 'col2', title: '列2', width: 150 },
    { field: 'col3', title: '列3', width: 150 },
    { field: 'col4', title: '列4', width: 150 },
    { field: 'col5', title: '列5', width: 150 },
    { field: 'col6', title: '列6', width: 150 },
    { field: 'col7', title: '列7', width: 150 },
    { field: 'col8', title: '列8', width: 150, fixed: 'right' }
  ]
}

// ===== 合并单元格 =====
const mergeData = ref([
  { id: 1, name: '张三', subject: '语文', score: 90 },
  { id: 2, name: '张三', subject: '数学', score: 85 },
  { id: 3, name: '李四', subject: '语文', score: 88 },
  { id: 4, name: '李四', subject: '数学', score: 92 }
])

const mergeGridOptions = {
  border: true,
  spanMethod: ({ row, _rowIndex, column, visibleData }) => {
    const fields = ['name']
    const cellValue = row[column.field]
    if (cellValue && fields.includes(column.field)) {
      const prevRow = visibleData[_rowIndex - 1]
      let nextRow = visibleData[_rowIndex + 1]
      if (prevRow && prevRow[column.field] === cellValue) {
        return { rowspan: 0, colspan: 0 }
      } else {
        let countRowspan = 1
        while (nextRow && nextRow[column.field] === cellValue) {
          nextRow = visibleData[++countRowspan + _rowIndex]
        }
        if (countRowspan > 1) {
          return { rowspan: countRowspan, colspan: 1 }
        }
      }
    }
  },
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    { field: 'name', title: '姓名', width: 150 },
    { field: 'subject', title: '科目', width: 150 },
    { field: 'score', title: '成绩', width: 150 }
  ]
}

// 通用事件处理
const handleAdd = () => {
  message.info('添加功能')
}

const handleBatchDelete = () => {
  message.info('批量删除功能')
}

const handleInsertRow = () => {
  editableData.value.push({
    id: Date.now(),
    name: '',
    price: 0,
    qty: 0,
    total: 0
  })
  message.success('已插入新行')
}

const handleSaveEdit = () => {
  message.success('保存成功')
}

const handleCancelEdit = () => {
  message.info('已取消编辑')
}
</script>

<style scoped lang="scss">
.vxe-table-example {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}
</style>
