# 公共组件使用指南

本项目基于 vue-vben-admin UI Kit 理念，实现了一套常用的公共组件库，所有组件基于 Ant Design Vue 封装。

## 📦 组件列表

### 1. BasicTable - 表格组件

高级表格组件，封装了常用的表格功能。

#### 特性
- ✅ 支持工具栏（标题、刷新、列设置）
- ✅ 支持分页
- ✅ 支持加载状态
- ✅ 支持操作列（编辑、删除）
- ✅ 支持 API 自动加载
- ✅ 支持搜索参数变化自动刷新

#### 基础用法

```vue
<template>
  <BasicTable
    title="用户列表"
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :pagination="pagination"
    @refresh="handleRefresh"
  />
</template>

<script setup>
import { ref } from 'vue'
import { BasicTable } from '@/components'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'status', key: 'status' }
]

const dataSource = ref([])
const loading = ref(false)
const pagination = ref({ current: 1, pageSize: 10, total: 0 })

const handleRefresh = () => {
  // 刷新数据
}
</script>
```

#### 使用 API 自动加载

```vue
<template>
  <BasicTable
    ref="tableRef"
    title="用户列表"
    :columns="columns"
    :api="getUserList"
    :search-params="searchParams"
    :action-column="{ edit: true, delete: true }"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<script setup>
import { ref } from 'vue'
import { BasicTable } from '@/components'
import { getUsers } from '@/api/system'

const tableRef = ref(null)
const searchParams = ref({ name: '' })

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '邮箱', dataIndex: 'email', key: 'email' }
]

const handleEdit = (record) => {
  console.log('编辑', record)
}

const handleDelete = (record) => {
  console.log('删除', record)
}

// 手动刷新
const reload = () => {
  tableRef.value?.reload()
}
</script>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| dataSource | 数据源 | Array | [] |
| columns | 列配置 | Array | [] |
| showToolbar | 是否显示工具栏 | Boolean | true |
| title | 表格标题 | String | '' |
| showRefresh | 是否显示刷新按钮 | Boolean | true |
| showColumnSetting | 是否显示列设置 | Boolean | false |
| loading | 是否加载中 | Boolean | false |
| pagination | 分页配置 | Object\|Boolean | {} |
| rowKey | 行的 key | String\|Function | 'id' |
| actionColumn | 操作列配置 | Object | null |
| api | 请求数据的方法 | Function | null |
| immediate | 立即加载 | Boolean | true |
| searchParams | 请求参数 | Object | {} |

#### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| refresh | 刷新 | - |
| edit | 编辑 | record |
| delete | 删除 | record |
| change | 表格变化 | { pagination, filters, sorter } |

#### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| reload | 重新加载数据 | params? |

---

### 2. BasicForm - 表单组件

动态表单组件，支持多种表单控件。

#### 特性
- ✅ 支持动态配置表单项
- ✅ 支持 10+ 种表单控件
- ✅ 支持自定义插槽
- ✅ 支持表单验证
- ✅ 支持响应式布局

#### 基础用法

```vue
<template>
  <BasicForm
    :schemas="formSchemas"
    :model="formModel"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref } from 'vue'
import { BasicForm } from '@/components'

const formModel = ref({
  username: '',
  password: '',
  email: '',
  status: 'active'
})

const formSchemas = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    required: true,
    colSpan: 12
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    required: true,
    colSpan: 12
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    required: true,
    rules: [
      { type: 'email', message: '请输入正确的邮箱格式' }
    ],
    colSpan: 12
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ],
    colSpan: 12
  }
]

const handleSubmit = (values) => {
  console.log('提交的数据:', values)
}
</script>
```

#### Schema 配置

```javascript
{
  field: 'username',        // 字段名
  label: '用户名',          // 标签
  component: 'Input',       // 组件类型
  placeholder: '请输入',    // 占位符
  required: true,           // 是否必填
  rules: [],               // 自定义验证规则
  colSpan: 12,             // 列跨度 (24栅格)
  hidden: false,           // 是否隐藏
  slot: 'customSlot',      // 自定义插槽名
  options: [],             // 选项（Select/Radio/Checkbox）
  componentProps: {}       // 传递给组件的 props
}
```

#### 支持的组件类型

- `Input` - 输入框
- `InputPassword` - 密码输入框
- `Textarea` - 文本域
- `InputNumber` - 数字输入框
- `Select` - 选择框
- `CheckboxGroup` - 多选框组
- `RadioGroup` - 单选框组
- `Switch` - 开关
- `DatePicker` - 日期选择器
- `TimePicker` - 时间选择器
- `RangePicker` - 日期范围选择器

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| schemas | 表单配置 | Array | [] |
| model | 表单数据 | Object | {} |
| rules | 验证规则 | Object | {} |
| labelCol | 标签布局 | Object | { span: 6 } |
| wrapperCol | 控件布局 | Object | { span: 18 } |
| gutter | 栅格间距 | Number | 16 |
| defaultColSpan | 默认列跨度 | Number | 24 |
| showActionButtons | 显示操作按钮 | Boolean | true |
| submitText | 提交按钮文本 | String | '提交' |
| resetText | 重置按钮文本 | String | '重置' |
| submitLoading | 提交加载状态 | Boolean | false |

#### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| validate | 验证表单 | - |
| validateFields | 验证指定字段 | fields |
| clearValidate | 清除验证 | fields? |
| resetFields | 重置字段 | fields? |
| setFieldsValue | 设置字段值 | values |
| getFieldsValue | 获取字段值 | - |

---

### 3. BasicModal - 模态框组件

模态框组件，简化常用配置。

#### 基础用法

```vue
<template>
  <BasicModal
    v-model:open="visible"
    title="用户详情"
    :confirm-loading="loading"
    @ok="handleOk"
  >
    <p>模态框内容...</p>
  </BasicModal>

  <a-button @click="visible = true">打开模态框</a-button>
</template>

<script setup>
import { ref } from 'vue'
import { BasicModal } from '@/components'

const visible = ref(false)
const loading = ref(false)

const handleOk = async () => {
  loading.value = true
  try {
    // 执行操作
    await someAsyncOperation()
    visible.value = false
  } finally {
    loading.value = false
  }
}
</script>
```

#### 使用 ref 控制

```vue
<template>
  <BasicModal ref="modalRef" title="编辑用户">
    <BasicForm ref="formRef" :schemas="formSchemas" />
  </BasicModal>
</template>

<script setup>
import { ref } from 'vue'
import { BasicModal, BasicForm } from '@/components'

const modalRef = ref(null)
const formRef = ref(null)

const openModal = () => {
  modalRef.value?.open()
}

const closeModal = () => {
  modalRef.value?.close()
}
</script>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| open | 是否显示 | Boolean | false |
| title | 标题 | String | '' |
| width | 宽度 | String\|Number | 520 |
| showFooter | 是否显示底部 | Boolean | true |
| maskClosable | 点击蒙层关闭 | Boolean | false |
| destroyOnClose | 关闭时销毁 | Boolean | true |
| confirmLoading | 确定按钮 loading | Boolean | false |
| okText | 确定按钮文字 | String | '确定' |
| cancelText | 取消按钮文字 | String | '取消' |

#### Methods

| 方法名 | 说明 |
|--------|------|
| open | 打开模态框 |
| close | 关闭模态框 |

---

### 4. PageWrapper - 页面容器组件

页面容器组件，提供统一的页面布局。

#### 基础用法

```vue
<template>
  <PageWrapper
    title="用户管理"
    description="管理系统用户信息"
  >
    <template #extra>
      <a-button type="primary">新建用户</a-button>
    </template>

    <!-- 页面内容 -->
    <BasicTable :columns="columns" :data-source="dataSource" />
  </PageWrapper>
</template>

<script setup>
import { PageWrapper, BasicTable } from '@/components'
</script>
```

#### 带面包屑

```vue
<template>
  <PageWrapper
    title="用户详情"
    :show-breadcrumb="true"
    :breadcrumb-list="breadcrumbList"
  >
    <Description :data="userData" :schema="descSchema" />
  </PageWrapper>
</template>

<script setup>
import { PageWrapper, Description } from '@/components'

const breadcrumbList = [
  { title: '首页', path: '/' },
  { title: '用户管理', path: '/users' },
  { title: '用户详情' }
]
</script>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 页面标题 | String | '' |
| description | 页面描述 | String | '' |
| showHeader | 显示头部 | Boolean | true |
| showBreadcrumb | 显示面包屑 | Boolean | false |
| breadcrumbList | 面包屑列表 | Array | [] |
| loading | 加载状态 | Boolean | false |
| loadingTip | 加载提示 | String | '加载中...' |
| dense | 紧凑模式 | Boolean | false |
| contentClass | 内容区域类名 | String\|Array\|Object | '' |

#### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 页面内容 |
| title | 自定义标题 |
| extra | 右侧额外内容 |
| breadcrumb | 自定义面包屑 |
| footer | 页面底部 |

---

### 5. Description - 描述列表组件

描述列表组件，用于展示详情数据。

#### 基础用法

```vue
<template>
  <Description
    title="用户信息"
    :data="userData"
    :schema="descSchema"
    bordered
  />
</template>

<script setup>
import { Description } from '@/components'

const userData = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  status: 'active',
  createdAt: '2024-01-01 10:00:00'
}

const descSchema = [
  { label: 'ID', field: 'id', span: 8 },
  { label: '用户名', field: 'username', span: 8 },
  { label: '邮箱', field: 'email', span: 8 },
  { label: '状态', field: 'status', span: 8, slot: 'status' },
  { label: '创建时间', field: 'createdAt', span: 16 }
]
</script>

<template>
  <Description
    title="用户信息"
    :data="userData"
    :schema="descSchema"
  >
    <template #status="{ data }">
      <StatusTag :status="data.status" :text="data.status" />
    </template>
  </Description>
</template>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题 | String | '' |
| data | 数据源 | Object | {} |
| schema | 描述配置 | Array | [] |
| defaultSpan | 默认列跨度 | Number | 8 |
| gutter | 栅格间距 | Number\|Array | 16 |
| bordered | 显示边框 | Boolean | false |
| emptyText | 空值显示 | String | '-' |

---

### 6. StatusTag - 状态标签组件

状态标签组件，快速显示状态。

#### 基础用法

```vue
<template>
  <StatusTag status="success" text="成功" :show-icon="true" />
  <StatusTag status="running" text="运行中" :show-icon="true" />
  <StatusTag status="error" text="失败" :show-icon="true" />
  <StatusTag status="warning" text="警告" :show-icon="true" />
</template>

<script setup>
import { StatusTag } from '@/components'
</script>
```

#### 自定义颜色映射

```vue
<template>
  <StatusTag
    status="online"
    text="在线"
    :color-map="customColorMap"
    :show-icon="true"
  />
</template>

<script setup>
import { StatusTag } from '@/components'

const customColorMap = {
  online: 'success',
  offline: 'default',
  busy: 'warning'
}
</script>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| status | 状态值 | String | '' |
| text | 显示文本 | String | '' |
| colorMap | 颜色映射 | Object | {...} |
| iconMap | 图标映射 | Object | {...} |
| showIcon | 显示图标 | Boolean | false |
| color | 自定义颜色 | String | '' |

#### 内置状态

- `success` - 成功（绿色）
- `running` - 运行中（蓝色）
- `error` / `failed` - 失败（红色）
- `warning` - 警告（橙色）
- `pending` - 等待中（灰色）
- `stopped` / `inactive` - 已停止（灰色）
- `active` - 活跃（绿色）

---

### 7. TimeFormat - 时间格式化组件

时间格式化组件，支持多种时间格式。

#### 基础用法

```vue
<template>
  <!-- 完整日期时间 -->
  <TimeFormat :value="timestamp" mode="datetime" />

  <!-- 仅日期 -->
  <TimeFormat :value="timestamp" mode="date" />

  <!-- 仅时间 -->
  <TimeFormat :value="timestamp" mode="time" />

  <!-- 相对时间（多久之前） -->
  <TimeFormat :value="timestamp" mode="relative" />

  <!-- 自定义格式 -->
  <TimeFormat :value="timestamp" mode="custom" format="YYYY年MM月DD日" />
</template>

<script setup>
import { TimeFormat } from '@/components'

const timestamp = '2024-01-01 10:00:00'
</script>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 时间值 | String\|Number\|Date | null |
| mode | 格式化模式 | String | 'datetime' |
| format | 自定义格式 | String | 'YYYY-MM-DD HH:mm:ss' |
| emptyText | 空值显示 | String | '-' |

#### 格式化模式

- `datetime` - 完整日期时间（YYYY-MM-DD HH:mm:ss）
- `date` - 仅日期（YYYY-MM-DD）
- `time` - 仅时间（HH:mm:ss）
- `relative` / `fromNow` - 相对时间（3分钟前）
- `custom` - 自定义格式

---

## 🎯 组合使用示例

### 完整的 CRUD 页面

```vue
<template>
  <PageWrapper title="用户管理">
    <template #extra>
      <a-button type="primary" @click="handleAdd">新建用户</a-button>
    </template>

    <!-- 表格 -->
    <BasicTable
      ref="tableRef"
      :columns="columns"
      :api="getUsers"
      :action-column="{ edit: true, delete: true }"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <!-- 状态列 -->
      <template #status="{ record }">
        <StatusTag :status="record.status" :text="record.status" show-icon />
      </template>

      <!-- 时间列 -->
      <template #createdAt="{ record }">
        <TimeFormat :value="record.createdAt" mode="datetime" />
      </template>
    </BasicTable>

    <!-- 编辑模态框 -->
    <BasicModal
      ref="modalRef"
      :title="isEdit ? '编辑用户' : '新建用户'"
      :confirm-loading="submitLoading"
      @ok="handleSubmit"
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
import { ref } from 'vue'
import {
  PageWrapper,
  BasicTable,
  BasicModal,
  BasicForm,
  StatusTag,
  TimeFormat
} from '@/components'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/system'

const tableRef = ref(null)
const modalRef = ref(null)
const formRef = ref(null)
const isEdit = ref(false)
const submitLoading = ref(false)

const formModel = ref({})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '用户名', dataIndex: 'username' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '状态', dataIndex: 'status', slots: { customRender: 'status' } },
  { title: '创建时间', dataIndex: 'createdAt', slots: { customRender: 'createdAt' } }
]

const formSchemas = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    required: true
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    required: true,
    rules: [{ type: 'email', message: '请输入正确的邮箱' }]
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    required: true,
    options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]
  }
]

const handleAdd = () => {
  isEdit.value = false
  formModel.value = {}
  modalRef.value?.open()
}

const handleEdit = (record) => {
  isEdit.value = true
  formModel.value = { ...record }
  modalRef.value?.open()
}

const handleDelete = async (record) => {
  await deleteUser(record.id)
  tableRef.value?.reload()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateUser(formModel.value.id, formModel.value)
    } else {
      await createUser(formModel.value)
    }

    modalRef.value?.close()
    tableRef.value?.reload()
  } finally {
    submitLoading.value = false
  }
}
</script>
```

---

## 📚 注意事项

1. **dayjs 依赖**：TimeFormat 组件需要安装 dayjs
   ```bash
   cd main-app
   pnpm add dayjs
   ```

2. **组件导入**：可以按需导入或全局注册
   ```javascript
   // 按需导入
   import { BasicTable, BasicForm } from '@/components'

   // 全局注册（在 main.js 中）
   import Components from '@/components'
   app.use(Components)
   ```

3. **样式定制**：所有组件都使用 scoped 样式，可通过传入 class 或覆盖 CSS 变量进行定制

4. **类型支持**：建议配合 TypeScript 使用，可获得更好的类型提示

---

## 🎨 后续扩展

可根据项目需求继续扩展以下组件：

- SearchForm - 搜索表单
- Upload - 上传组件
- Tree - 树形组件
- Drawer - 抽屉组件
- Card - 卡片组件
- Charts - 图表组件

---

**创建时间**: 2025-10-07
**状态**: ✅ 完成
**组件数量**: 7 个核心组件
