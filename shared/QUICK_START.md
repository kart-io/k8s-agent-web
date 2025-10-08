# @k8s-agent/shared 快速开始

## 🚀 5分钟上手

### 1. 导入组件

```javascript
// 导入组件
import { BasicTable, PageWrapper, BasicForm } from '@k8s-agent/shared/components'

// 导入组合式函数
import { useTable, useModal } from '@k8s-agent/shared/composables'

// 导入钩子
import { usePermission } from '@k8s-agent/shared/hooks'

// 导入工具函数
import { isEmail, formatDate } from '@k8s-agent/shared/utils'
```

### 2. 最小示例

#### 表格页面（最常用）

```vue
<template>
  <PageWrapper title="数据列表">
    <BasicTable
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    />
  </PageWrapper>
</template>

<script setup>
import { PageWrapper, BasicTable } from '@k8s-agent/shared/components'
import { useTable } from '@k8s-agent/shared/composables'
import { getData } from '@/api'

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' }
]

const {
  dataSource,
  loading,
  pagination,
  handleTableChange
} = useTable(getData, { immediate: true })
</script>
```

#### 表单弹窗

```vue
<template>
  <div>
    <a-button @click="open">添加</a-button>
    <BasicModal v-model:open="visible" title="添加数据">
      <BasicForm :schemas="schemas" :model="formData" />
    </BasicModal>
  </div>
</template>

<script setup>
import { BasicModal, BasicForm } from '@k8s-agent/shared/components'
import { useModal } from '@k8s-agent/shared/composables'

const { visible, open } = useModal()
const formData = ref({})
const schemas = [
  { field: 'name', label: '名称', component: 'Input', required: true }
]
</script>
```

## 📚 常用组件

| 组件 | 用途 | 示例 |
|------|------|------|
| BasicTable | 数据表格 | `<BasicTable :columns="columns" :data-source="data" />` |
| BasicForm | 动态表单 | `<BasicForm :schemas="schemas" :model="model" />` |
| PageWrapper | 页面容器 | `<PageWrapper title="标题">内容</PageWrapper>` |
| BasicModal | 模态框 | `<BasicModal v-model:open="visible">内容</BasicModal>` |
| StatusTag | 状态标签 | `<StatusTag status="success" text="成功" />` |

## 🛠️ 常用工具

### 类型检查
```javascript
import { isEmail, isPhone, isUrl } from '@k8s-agent/shared/utils'

isEmail('test@example.com')  // true
isPhone('13800138000')        // true
isUrl('https://example.com')  // true
```

### 格式化
```javascript
import { formatDate, formatMoney, formatFileSize } from '@k8s-agent/shared/utils'

formatDate(new Date(), 'YYYY-MM-DD')  // '2025-10-07'
formatMoney(12345.67)                  // '¥12,345.67'
formatFileSize(1024 * 1024)            // '1.00 MB'
```

### 权限检查
```javascript
import { usePermission } from '@k8s-agent/shared/hooks'

const { hasPermission } = usePermission()

if (hasPermission('user:create')) {
  // 有权限
}
```

## 💡 最佳实践

### ✅ 推荐

```javascript
// 使用子路径导入（更好的 tree-shaking）
import { BasicTable } from '@k8s-agent/shared/components'
import { useTable } from '@k8s-agent/shared/composables'

// 组合使用 useTable
const { dataSource, loading, pagination } = useTable(api, {
  immediate: true,
  pagination: { current: 1, pageSize: 10 }
})
```

### ❌ 避免

```javascript
// 避免全量导入
import * as Shared from '@k8s-agent/shared'

// 避免嵌套解构
import { components } from '@k8s-agent/shared'
const { BasicTable } = components
```

## 🔗 更多文档

- [完整 README](./README.md) - 详细说明
- [迁移指南](../SHARED_COMPONENTS_MIGRATION.md) - 迁移文档
- [组件 API](../COMPONENTS_GUIDE.md) - 完整 API 文档

## ❓ 常见问题

**Q: 如何添加新组件？**
A: 在 `shared/src/components/` 创建，然后在 `index.js` 导出

**Q: 修改组件会影响所有应用吗？**
A: 是的，所有使用该组件的应用都会同步更新

**Q: 支持 TypeScript 吗？**
A: 支持，所有函数都有 JSDoc 注释，提供类型提示
