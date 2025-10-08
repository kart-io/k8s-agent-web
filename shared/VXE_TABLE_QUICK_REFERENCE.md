# VXE Table 快速参考

## 基础用法

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
  { id: 1, name: '张三', age: 28 },
  { id: 2, name: '李四', age: 32 }
])

const gridOptions = {
  border: true,
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '姓名', width: 120 },
    { field: 'age', title: '年龄', width: 100 }
  ]
}
</script>
```

## API 加载

```vue
<VxeBasicTable
  :api="fetchUserList"
  :params="{ keyword: '' }"
  :grid-options="gridOptions"
/>

<script setup>
const fetchUserList = async ({ page, pageSize }) => {
  const res = await api.getUserList({ page, pageSize })
  return {
    data: {
      list: res.data.list,
      total: res.data.total
    }
  }
}
</script>
```

## 获取 API

```vue
<VxeBasicTable
  @register="onTableRegister"
/>

<script setup>
let tableApi = null

const onTableRegister = (api) => {
  tableApi = api
}

// 使用 API
const handleRefresh = () => {
  tableApi?.reload()
}

const handleGetSelect = () => {
  const rows = tableApi?.getSelectRows()
}
</script>
```

## 常用配置

### 复选框

```javascript
const gridOptions = {
  columns: [
    { type: 'checkbox', width: 60 },
    { field: 'name', title: '姓名' }
  ]
}
```

### 序号列

```javascript
{ type: 'seq', width: 60, title: '序号' }
```

### 排序

```javascript
{ field: 'age', title: '年龄', sortable: true }
```

### 固定列

```javascript
{ field: 'id', title: 'ID', width: 80, fixed: 'left' }
{ field: 'action', title: '操作', width: 150, fixed: 'right' }
```

### 可编辑

```javascript
const gridOptions = {
  editConfig: {
    trigger: 'click',
    mode: 'cell'
  },
  columns: [
    {
      field: 'name',
      title: '姓名',
      editRender: { name: 'AInput' }
    }
  ]
}
```

### 树形表格

```javascript
const gridOptions = {
  treeConfig: {
    transform: true,
    children: 'children'
  },
  columns: [
    { field: 'name', title: '名称', treeNode: true }
  ]
}
```

### 自定义渲染

```javascript
{
  field: 'status',
  title: '状态',
  cellRender: {
    name: 'ATag',
    props: (params) => ({
      color: params.row.status === '在职' ? 'success' : 'default'
    })
  }
}
```

## 常用 API 方法

| 方法 | 说明 |
|------|------|
| `reload()` | 重新加载数据 |
| `query()` | 查询数据（重置到第一页） |
| `getSelectRows()` | 获取选中的行 |
| `deleteSelectRows()` | 删除选中的行 |
| `insertRow(record)` | 插入新行 |
| `clearSelect()` | 清空选中 |
| `refresh()` | 刷新表格 |
| `exportData()` | 导出数据 |
| `expandAll()` | 展开所有（树形） |
| `collapseAll()` | 折叠所有（树形） |

## 插槽

| 插槽名 | 说明 |
|--------|------|
| `title` | 自定义标题 |
| `title-right` | 标题右侧内容 |
| `toolbar` | 自定义工具栏 |
| `pager` | 自定义分页器 |
| `empty` | 空数据提示 |

## 事件

| 事件名 | 说明 |
|--------|------|
| `register` | 注册表格 API |
| `checkbox-change` | 复选框变化 |
| `page-change` | 分页变化 |
| `sort-change` | 排序变化 |
| `load-success` | 加载成功 |

## 完整示例

查看 `examples/VxeTableExample.vue` 获取更多示例。
