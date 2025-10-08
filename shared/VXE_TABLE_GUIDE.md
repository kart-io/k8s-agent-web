# VXE Table 使用指南

## 📦 概述

VXE Table 是一个基于 [vxe-table](https://vxetable.cn/) 的企业级表格组件，提供了强大的数据展示和编辑功能。本项目参考 vue-vben-admin 实现，提供了完整的表格解决方案。

### 特性

- ✅ **功能丰富** - 支持排序、筛选、分页、树形、编辑等
- ✅ **高性能** - 虚拟滚动，支持大数据量
- ✅ **易扩展** - 丰富的插槽和配置项
- ✅ **类型安全** - 完整的 TypeScript 类型支持
- ✅ **响应式** - 自动适配容器大小
- ✅ **主题定制** - 支持 Ant Design 主题

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm add vxe-table vxe-table-plugin-antd xe-utils
```

### 2. 全局配置

在应用入口文件中初始化 VXE Table：

```javascript
// main.js
import { initVxeTable } from '@k8s-agent/shared/config/vxeTable'

// 初始化 VXE Table
initVxeTable({
  size: 'medium',
  zIndex: 999,
  table: {
    border: false,
    stripe: false
  }
})
```

### 3. 基础使用

```vue
<template>
  <VxeBasicTable
    title="用户列表"
    :grid-options="gridOptions"
    :data-source="dataSource"
  />
</template>

<script setup>
import { ref } from 'vue'
import { VxeBasicTable } from '@k8s-agent/shared/components'

const dataSource = ref([
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 32, email: 'lisi@example.com' }
])

const gridOptions = {
  border: true,
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '姓名', width: 120 },
    { field: 'age', title: '年龄', width: 100 },
    { field: 'email', title: '邮箱', minWidth: 200 }
  ]
}
</script>
```

## 📝 核心功能

### 1. API 数据加载

使用 API 自动加载数据，支持分页、排序、筛选：

```vue
<template>
  <VxeBasicTable
    title="用户列表"
    :grid-options="gridOptions"
    :api="fetchUserList"
    :params="params"
    @load-success="handleLoadSuccess"
  />
</template>

<script setup>
import { ref } from 'vue'
import { VxeBasicTable } from '@k8s-agent/shared/components'

const params = ref({
  keyword: '',
  status: ''
})

const gridOptions = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '姓名', width: 120 },
    { field: 'age', title: '年龄', width: 100, sortable: true },
    { field: 'email', title: '邮箱', minWidth: 200 }
  ]
}

// API 方法
const fetchUserList = async ({ page, pageSize, sort, filters }) => {
  const response = await api.getUserList({
    page,
    pageSize,
    sort,
    filters,
    ...params.value
  })

  return {
    data: {
      list: response.data.list,
      total: response.data.total
    }
  }
}

const handleLoadSuccess = ({ list, total }) => {
  console.log('数据加载成功', { list, total })
}
</script>
```

### 2. 可编辑表格

支持单元格编辑、行编辑等多种编辑模式：

```vue
<template>
  <VxeBasicTable
    title="编辑表格"
    :grid-options="editableGridOptions"
    :data-source="dataSource"
  >
    <template #toolbar>
      <a-space>
        <a-button type="primary" @click="handleInsertRow">插入行</a-button>
        <a-button @click="handleSave">保存</a-button>
      </a-space>
    </template>
  </VxeBasicTable>
</template>

<script setup>
import { ref } from 'vue'
import { VxeBasicTable } from '@k8s-agent/shared/components'

const dataSource = ref([
  { id: 1, name: '产品1', price: 100, qty: 10 }
])

const editableGridOptions = {
  border: true,
  editConfig: {
    trigger: 'click', // 触发方式: click | dblclick
    mode: 'cell',     // 编辑模式: cell | row
    showStatus: true  // 显示编辑状态
  },
  columns: [
    { field: 'id', title: 'ID', width: 80 },
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
    }
  ]
}

const handleInsertRow = () => {
  dataSource.value.push({
    id: Date.now(),
    name: '',
    price: 0,
    qty: 0
  })
}

const handleSave = () => {
  console.log('保存数据:', dataSource.value)
}
</script>
```

### 3. 树形表格

支持树形结构数据展示：

```vue
<template>
  <VxeBasicTable
    ref="tableRef"
    title="部门组织架构"
    :grid-options="treeGridOptions"
    :data-source="treeData"
    @register="onTableRegister"
  >
    <template #toolbar>
      <a-space>
        <a-button @click="handleExpandAll">展开全部</a-button>
        <a-button @click="handleCollapseAll">折叠全部</a-button>
      </a-space>
    </template>
  </VxeBasicTable>
</template>

<script setup>
import { ref } from 'vue'
import { VxeBasicTable } from '@k8s-agent/shared/components'

let tableApi = null

const treeData = ref([
  {
    id: 1,
    name: '总公司',
    manager: '张总',
    children: [
      {
        id: 11,
        name: '技术部',
        manager: '李经理',
        children: [
          { id: 111, name: '前端组', manager: '王组长' },
          { id: 112, name: '后端组', manager: '赵组长' }
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
    { field: 'manager', title: '负责人', width: 150 }
  ]
}

const onTableRegister = (api) => {
  tableApi = api
}

const handleExpandAll = () => {
  tableApi?.expandAll()
}

const handleCollapseAll = () => {
  tableApi?.collapseAll()
}
</script>
```

### 4. 固定列

支持左右固定列：

```vue
<template>
  <VxeBasicTable
    title="固定列表格"
    :grid-options="fixedGridOptions"
    :data-source="dataSource"
  />
</template>

<script setup>
const fixedGridOptions = {
  border: true,
  height: 400,
  columns: [
    { type: 'seq', width: 60, title: '序号', fixed: 'left' },
    { field: 'col1', title: '列1', width: 150, fixed: 'left' },
    { field: 'col2', title: '列2', width: 150 },
    { field: 'col3', title: '列3', width: 150 },
    { field: 'col4', title: '列4', width: 150 },
    { field: 'col5', title: '列5', width: 150, fixed: 'right' }
  ]
}
</script>
```

### 5. 复选框选择

```vue
<template>
  <VxeBasicTable
    ref="tableRef"
    title="用户列表"
    :grid-options="gridOptions"
    :data-source="dataSource"
    @register="onTableRegister"
    @checkbox-change="handleCheckboxChange"
    @checkbox-all="handleCheckboxAll"
  >
    <template #toolbar>
      <a-space>
        <a-button @click="handleGetSelect">获取选中</a-button>
        <a-button @click="handleDeleteSelect">删除选中</a-button>
      </a-space>
    </template>
  </VxeBasicTable>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'

let tableApi = null

const gridOptions = {
  columns: [
    { type: 'checkbox', width: 60, fixed: 'left' },
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '姓名', width: 120 }
  ]
}

const onTableRegister = (api) => {
  tableApi = api
}

const handleGetSelect = () => {
  const rows = tableApi?.getSelectRows()
  message.info(`选中了 ${rows.length} 行`)
}

const handleDeleteSelect = () => {
  tableApi?.deleteSelectRows()
}

const handleCheckboxChange = ({ records }) => {
  console.log('选中变化:', records)
}

const handleCheckboxAll = ({ records }) => {
  console.log('全选变化:', records)
}
</script>
```

### 6. 排序和筛选

```vue
<template>
  <VxeBasicTable
    title="排序筛选表格"
    :grid-options="gridOptions"
    :data-source="dataSource"
    @sort-change="handleSortChange"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
const gridOptions = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '姓名', width: 120, sortable: true },
    {
      field: 'age',
      title: '年龄',
      width: 100,
      sortable: true,
      filters: [
        { label: '18-25', value: '18-25' },
        { label: '26-35', value: '26-35' },
        { label: '36+', value: '36+' }
      ]
    },
    { field: 'email', title: '邮箱', minWidth: 200 }
  ]
}

const handleSortChange = ({ property, order }) => {
  console.log('排序变化:', { property, order })
}

const handleFilterChange = ({ property, values }) => {
  console.log('筛选变化:', { property, values })
}
</script>
```

### 7. 自定义渲染

```vue
<template>
  <VxeBasicTable
    title="自定义渲染"
    :grid-options="gridOptions"
    :data-source="dataSource"
  />
</template>

<script setup>
const gridOptions = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '姓名', width: 120 },
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
      cellRender: {
        name: 'ASpace',
        children: [
          {
            name: 'AButton',
            props: { type: 'link', size: 'small' },
            content: '编辑',
            events: {
              click: (params) => {
                console.log('编辑', params.row)
              }
            }
          },
          {
            name: 'AButton',
            props: { type: 'link', danger: true, size: 'small' },
            content: '删除',
            events: {
              click: (params) => {
                console.log('删除', params.row)
              }
            }
          }
        ]
      }
    }
  ]
}
</script>
```

## 🎯 API 文档

### VxeBasicTable Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 表格标题 | string | - |
| gridOptions | 表格配置 | VxeGridProps | {} |
| gridEvents | 表格事件 | Object | {} |
| formOptions | 表单配置 | Object | {} |
| showToolbar | 显示工具栏 | boolean | true |
| showPager | 显示分页 | boolean | true |
| immediate | 立即加载 | boolean | true |
| tableClass | 表格类名 | string \| Array \| Object | - |
| tableStyle | 表格样式 | Object | {} |
| api | API 请求方法 | Function | null |
| params | 请求参数 | Object | {} |
| dataSource | 数据源 | Array | null |
| pagination | 分页配置 | Object \| boolean | {} |
| autoHeight | 自动高度 | boolean | true |
| maxHeight | 最大高度 | number \| string | null |

### VxeBasicTable Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| register | 注册表格 API | (api) => void |
| checkbox-change | 复选框变化 | (params) => void |
| checkbox-all | 全选变化 | (params) => void |
| page-change | 分页变化 | (params) => void |
| sort-change | 排序变化 | (params) => void |
| filter-change | 筛选变化 | (params) => void |
| toolbar-button-click | 工具栏按钮点击 | (params) => void |
| load-success | 加载成功 | ({ list, total }) => void |
| load-error | 加载失败 | (error) => void |

### VxeBasicTable Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| title | 自定义标题 | - |
| title-right | 标题右侧内容 | - |
| toolbar | 自定义工具栏 | - |
| pager | 自定义分页器 | - |
| empty | 空数据提示 | - |
| [column] | 列插槽 | { row, column, rowIndex } |

### useVxeTable Hook

```javascript
const [gridRef, gridApi, mergedGridOptions] = useVxeTable(options)
```

**返回值:**

| 名称 | 说明 | 类型 |
|------|------|------|
| gridRef | 表格引用 | Ref |
| gridApi | 表格 API | Object |
| mergedGridOptions | 合并后的配置 | ComputedRef |

**gridApi 方法:**

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| getGrid | 获取表格实例 | - | VxeGrid |
| setLoading | 设置加载状态 | (value: boolean) | void |
| setDataSource | 设置数据源 | (data: Array) | void |
| getDataSource | 获取数据源 | - | Array |
| reload | 重新加载 | (opt?: Object) | Promise |
| query | 查询数据 | - | Promise |
| clearData | 清空数据 | - | void |
| getSelectRows | 获取选中行 | - | Array |
| setSelectRows | 设置选中行 | (rows: Array) | void |
| clearSelect | 清空选中 | - | void |
| deleteSelectRows | 删除选中行 | - | Promise |
| insertRow | 插入行 | (record?: Object) | Promise<Row> |
| deleteRow | 删除行 | (row: Row) | Promise |
| updateRow | 更新行 | (row: Row, record: Object) | Promise |
| getTableData | 获取表格数据 | - | Array |
| refreshColumn | 刷新列 | - | Promise |
| refresh | 刷新表格 | - | Promise |
| exportData | 导出数据 | (options?: Object) | void |
| print | 打印表格 | (options?: Object) | void |
| expandAll | 展开所有 | - | void |
| collapseAll | 折叠所有 | - | void |
| setTreeExpand | 设置树展开 | (rows: Array, expanded: boolean) | void |
| toggleFullScreen | 全屏切换 | - | void |

## 💡 最佳实践

### 1. 使用 API 自动加载

```javascript
// 推荐：使用 api 属性自动加载数据
<VxeBasicTable :api="fetchData" :params="params" />

// 不推荐：手动管理数据加载
const data = ref([])
const loading = ref(false)
const loadData = async () => {
  loading.value = true
  data.value = await fetchData()
  loading.value = false
}
```

### 2. 使用 gridApi 操作表格

```javascript
// 推荐：通过 register 事件获取 API
let tableApi = null
const onTableRegister = (api) => {
  tableApi = api
}
const handleRefresh = () => {
  tableApi?.reload()
}

// 不推荐：直接操作 ref
const tableRef = ref(null)
const handleRefresh = () => {
  tableRef.value?.reload()
}
```

### 3. 合理使用插槽

```vue
<!-- 推荐：使用具名插槽 -->
<VxeBasicTable>
  <template #toolbar>
    <a-button>添加</a-button>
  </template>
</VxeBasicTable>

<!-- 不推荐：在 gridOptions 中配置复杂内容 -->
```

### 4. 性能优化

```javascript
// 大数据量时启用虚拟滚动
const gridOptions = {
  height: 600,
  scrollY: {
    enabled: true,
    gt: 50 // 数据超过 50 条启用
  }
}

// 固定列时设置合理的宽度
const columns = [
  { field: 'id', width: 80 },        // 不要使用 minWidth
  { field: 'name', width: 120 },
  { field: 'desc', minWidth: 200 }   // 最后一列可以使用 minWidth
]
```

## 🐛 常见问题

### Q: 表格高度不正确？
A: 检查父容器是否有明确的高度，或使用 `autoHeight` 属性。

### Q: 数据不更新？
A: 确保数据是响应式的，使用 `ref` 或 `reactive` 包装。

### Q: 分页不生效？
A: 确保设置了 `showPager` 属性，并正确返回 `total`。

### Q: 编辑后数据丢失？
A: 编辑后需要手动保存数据，或使用 `v-model` 双向绑定。

---

更多详情请参考：
- [VXE Table 官方文档](https://vxetable.cn/)
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
