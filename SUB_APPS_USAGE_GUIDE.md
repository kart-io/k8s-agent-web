# 子应用组件使用指南

本文档说明如何在各个子应用（dashboard-app、agent-app、cluster-app、monitor-app、system-app）中使用新增的组件、composables、hooks 和 utils。

## 📦 已复制的内容

所有子应用现在都包含以下目录：

```
{app}/src/
├── components/      # 7个公共组件
├── composables/     # 5个组合式函数
├── hooks/           # 5个钩子函数
└── utils/           # 6个工具模块
```

## 🎯 使用方式

### 1. 统一的导入方式

所有子应用使用相同的导入路径：

```javascript
// 组件
import { BasicTable, BasicForm, BasicModal, PageWrapper } from '@/components'

// Composables
import { useTable, useModal, useForm } from '@/composables'

// Hooks
import { usePermission, useLoading } from '@/hooks'

// Utils
import { formatFileSize, isString, storage } from '@/utils'
```

---

## 📝 实际应用示例

### Agent App - Agent 列表页面

完整的 CRUD 示例，展示如何使用所有新组件。

**文件**: `agent-app/src/views/AgentListExample.vue`

**功能**:
- ✅ 使用 `PageWrapper` 页面容器
- ✅ 使用 `BasicTable` 展示 Agent 列表
- ✅ 使用 `BasicForm` 搜索表单
- ✅ 使用 `BasicModal` 编辑对话框
- ✅ 使用 `StatusTag` 显示状态
- ✅ 使用 `TimeFormat` 格式化时间
- ✅ 使用 `Description` 显示详情
- ✅ 使用 `useTable` 管理表格
- ✅ 使用 `usePermission` 权限控制

**关键代码片段**:

```vue
<template>
  <PageWrapper title="Agent 管理">
    <BasicTable
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      @edit="handleEdit"
    >
      <template #status="{ record }">
        <StatusTag :status="record.status" show-icon />
      </template>
    </BasicTable>
  </PageWrapper>
</template>

<script setup>
import { PageWrapper, BasicTable, StatusTag } from '@/components'
import { useTable } from '@/composables'
import { usePermission } from '@/hooks'

const { hasPermission } = usePermission()
const { dataSource, loading, reload } = useTable({
  api: getAgents,
  immediate: true
})
</script>
```

---

### System App - 用户管理页面

简化的 CRUD 示例，展示核心功能使用。

**文件**: `system-app/src/views/UserManagementExample.vue`

**功能**:
- ✅ 使用 `useTable` + `useModal` + `useForm` 组合
- ✅ 自动管理加载状态
- ✅ 权限控制
- ✅ 表单验证

**关键代码片段**:

```vue
<script setup>
import { useTable, useModal, useForm } from '@/composables'
import { usePermission } from '@/hooks'

// 表格管理
const { dataSource, loading, reload } = useTable({
  api: getUsers,
  immediate: true
})

// 模态框管理
const { visible, confirmLoading, open, handleOk } = useModal({
  onOk: async (data) => {
    await createUser(data)
    reload()
  }
})

// 权限控制
const { hasPermission } = usePermission()
</script>
```

---

## 🚀 各子应用推荐使用场景

### Dashboard App

```javascript
// 统计卡片
import { PageWrapper, StatusTag, TimeFormat } from '@/components'
import { formatNumber, formatPercent } from '@/utils'

// 使用格式化工具
const stats = {
  total: formatNumber(1234567),
  growth: formatPercent(500, 10000)
}
```

### Agent App

```javascript
// Agent 列表和管理
import { BasicTable, BasicModal, Description } from '@/components'
import { useTable, useModal } from '@/composables'
import { useIsMobile } from '@/composables'

// 响应式布局
const { isMobile } = useIsMobile()
```

### Cluster App

```javascript
// 集群资源管理
import { PageWrapper, BasicTable, StatusTag } from '@/components'
import { listToTree, findNode } from '@/utils'

// 树形数据处理（节点树）
const nodeTree = listToTree(nodes, {
  id: 'id',
  parentId: 'parentId'
})
```

### Monitor App

```javascript
// 监控数据展示
import { TimeFormat, StatusTag } from '@/components'
import { formatFileSize, formatPercent } from '@/utils'
import { useDebounce } from '@/hooks'

// 搜索防抖
const searchText = ref('')
const debouncedText = useDebounce(searchText, 500)
```

### System App

```javascript
// 系统管理（用户、角色、权限）
import { BasicTable, BasicForm, BasicModal } from '@/components'
import { useTable, useModal, useForm } from '@/composables'
import { usePermission } from '@/hooks'
import { validateEmail, validatePhone } from '@/utils'

// 完整的 CRUD 操作
const { hasPermission } = usePermission()
const { dataSource, loading, reload } = useTable({ api: getUsers })
const { visible, handleOk } = useModal({ onOk: saveUser })
```

---

## 💡 常用组合模式

### 模式 1: 标准列表页

```vue
<template>
  <PageWrapper title="列表页">
    <BasicTable
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    />
  </PageWrapper>
</template>

<script setup>
import { PageWrapper, BasicTable } from '@/components'
import { useTable } from '@/composables'
import { getList } from '@/api'

const { dataSource, loading, pagination, handleTableChange } = useTable({
  api: getList,
  immediate: true
})
</script>
```

---

### 模式 2: 带搜索的列表页

```vue
<template>
  <PageWrapper title="列表页">
    <!-- 搜索表单 -->
    <a-card>
      <BasicForm
        :schemas="searchSchemas"
        :model="searchModel"
        layout="inline"
      >
        <template #actions>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
        </template>
      </BasicForm>
    </a-card>

    <!-- 数据表格 -->
    <BasicTable :data-source="dataSource" :loading="loading" />
  </PageWrapper>
</template>

<script setup>
import { reactive } from 'vue'
import { PageWrapper, BasicTable, BasicForm } from '@/components'
import { useTable } from '@/composables'

const searchModel = reactive({ name: '', status: '' })

const { dataSource, loading, setSearch } = useTable({
  api: getList,
  searchParams: searchModel
})

const handleSearch = () => {
  setSearch(searchModel)
}
</script>
```

---

### 模式 3: 完整的 CRUD 页面

```vue
<template>
  <PageWrapper title="管理页">
    <template #extra>
      <a-button type="primary" @click="handleAdd">新建</a-button>
    </template>

    <BasicTable
      :data-source="dataSource"
      :loading="loading"
      :action-column="{ edit: true, delete: true }"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <BasicModal
      v-model:open="visible"
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
import { PageWrapper, BasicTable, BasicModal, BasicForm } from '@/components'
import { useTable, useModal } from '@/composables'
import { getList, createItem, updateItem, deleteItem } from '@/api'

// 表格
const { dataSource, loading, reload, deleteAndReload } = useTable({
  api: getList,
  immediate: true
})

// 模态框
const isEdit = ref(false)
const formRef = ref(null)
const formModel = reactive({ name: '', status: '' })

const { visible, confirmLoading, open, handleOk: modalOk } = useModal({
  onOk: async (data) => {
    await formRef.value?.validate()

    if (isEdit.value) {
      await updateItem(data.id, data)
    } else {
      await createItem(data)
    }

    message.success('操作成功')
    reload()
  }
})

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formModel, { name: '', status: '' })
  open(formModel)
}

const handleEdit = (record) => {
  isEdit.value = true
  Object.assign(formModel, record)
  open(formModel)
}

const handleOk = async () => {
  await modalOk()
}

const handleDelete = async (record) => {
  await deleteAndReload(async () => {
    await deleteItem(record.id)
    message.success('删除成功')
  })
}

const formSchemas = [
  { field: 'name', label: '名称', component: 'Input', required: true },
  { field: 'status', label: '状态', component: 'Select', required: true }
]
</script>
```

---

## 🔧 工具函数使用示例

### 格式化显示

```vue
<template>
  <div>
    <!-- 文件大小 -->
    <span>{{ formatFileSize(1024 * 1024) }}</span>  <!-- 1 MB -->

    <!-- 数字千分位 -->
    <span>{{ formatNumber(1234567.89, 2) }}</span>  <!-- 1,234,567.89 -->

    <!-- 隐藏手机号 -->
    <span>{{ hidePhone('13800138000') }}</span>     <!-- 138****8000 -->
  </div>
</template>

<script setup>
import { formatFileSize, formatNumber, hidePhone } from '@/utils'
</script>
```

### 本地存储

```javascript
import { storage } from '@/utils'

// 保存用户信息（7天后过期）
storage.set('userInfo', { name: 'admin' }, 7 * 24 * 60 * 60 * 1000)

// 获取用户信息
const userInfo = storage.get('userInfo', {})

// 删除
storage.remove('userInfo')
```

### 树形数据

```javascript
import { listToTree, findNode } from '@/utils'

// 列表转树
const menuTree = listToTree(menuList, {
  id: 'id',
  parentId: 'parentId',
  children: 'children'
})

// 查找节点
const node = findNode(menuTree, (n) => n.id === 'user-management')
```

### 下载文件

```javascript
import { downloadJSON, downloadCSV } from '@/utils'

// 下载 JSON
const exportJSON = () => {
  downloadJSON(dataSource.value, 'agents.json')
}

// 下载 CSV
const exportCSV = () => {
  downloadCSV(dataSource.value, 'agents.csv', ['ID', 'Name', 'Status'])
}
```

---

## ⚠️ 注意事项

### 1. API 兼容性

确保你的 API 返回格式符合 `useTable` 的要求：

```javascript
// 推荐格式
{
  data: [...],   // 数据数组
  total: 100     // 总数（用于分页）
}

// 或者直接返回数组
[...]
```

### 2. 权限配置

确保在 Pinia store 中正确设置权限：

```javascript
// store/user.js
export const useUserStore = defineStore('user', {
  state: () => ({
    permissions: ['user:view', 'user:create', 'user:edit', 'user:delete']
  })
})
```

### 3. TimeFormat 依赖

TimeFormat 组件依赖 dayjs，需要安装：

```bash
cd agent-app  # 或其他子应用
pnpm add dayjs
```

---

## 📚 更多文档

- [组件使用指南](./COMPONENTS_GUIDE.md)
- [Composables 和 Utils 指南](./COMPOSABLES_AND_UTILS_GUIDE.md)
- [API Mock 集成指南](./API_MOCK_INTEGRATION_COMPLETE.md)

---

**更新时间**: 2025-10-07
**状态**: ✅ 完成
**覆盖应用**: 6个（main-app + 5个子应用）
