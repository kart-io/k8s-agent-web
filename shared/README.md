# @k8s-agent/shared

K8S Agent 微前端项目的共享组件库，包含所有子应用通用的组件、组合式函数、钩子和工具函数。

## 📦 包含内容

### Components（组件）
- `BasicTable` - 高级表格组件
- `BasicForm` - 动态表单组件
- `BasicModal` - 模态框组件
- `PageWrapper` - 页面容器组件
- `Description` - 详情展示组件
- `StatusTag` - 状态标签组件
- `TimeFormat` - 时间格式化组件

### Composables（组合式函数）
- `useTable` - 表格状态管理
- `useModal` - 模态框控制
- `useForm` - 表单验证和提交
- `useScrollLock` - 滚动锁定
- `useIsMobile` - 移动端检测

### Hooks（钩子函数）
- `usePermission` - 权限检查
- `useLoading` - 加载状态管理
- `usePagination` - 分页控制
- `useDebounce` - 防抖
- `useThrottle` - 节流

### Utils（工具函数）
- `is.js` - 类型检查（18+ 函数）
- `tree.js` - 树结构操作（7 函数）
- `format.js` - 格式化工具（15+ 函数）
- `storage.js` - 本地存储（支持过期时间）
- `download.js` - 文件下载
- `validate.js` - 表单验证规则（15+ 函数）

## 📥 安装

这是一个 workspace 内部包，使用 pnpm workspace 协议引用：

```bash
# 在子应用的 package.json 中添加
{
  "dependencies": {
    "@k8s-agent/shared": "workspace:*"
  }
}
```

然后运行：
```bash
pnpm install
```

## 🚀 使用方式

### 方式 1：按需导入（推荐）

```javascript
// 导入组件
import { BasicTable, BasicForm, PageWrapper } from '@k8s-agent/shared/components'

// 导入组合式函数
import { useTable, useModal } from '@k8s-agent/shared/composables'

// 导入钩子
import { usePermission, useLoading } from '@k8s-agent/shared/hooks'

// 导入工具函数
import { isEmail, formatDate } from '@k8s-agent/shared/utils'
```

### 方式 2：全量导入

```javascript
import {
  BasicTable,
  useTable,
  usePermission,
  isEmail
} from '@k8s-agent/shared'
```

## 📖 使用示例

### 1. 使用 BasicTable 和 useTable

```vue
<template>
  <PageWrapper title="用户列表">
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
import { BasicTable, PageWrapper } from '@k8s-agent/shared/components'
import { useTable } from '@k8s-agent/shared/composables'
import { getUsers } from '@/api/system'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '邮箱', dataIndex: 'email', key: 'email' }
]

const {
  dataSource,
  loading,
  pagination,
  loadData,
  handleTableChange
} = useTable(getUsers, {
  immediate: true,
  pagination: { current: 1, pageSize: 10 }
})
</script>
```

### 2. 使用 BasicForm 和 BasicModal

```vue
<template>
  <div>
    <a-button @click="open">添加用户</a-button>

    <BasicModal
      v-model:open="visible"
      title="添加用户"
      @ok="handleSubmit"
    >
      <BasicForm
        :schemas="formSchemas"
        :model="formData"
        @submit="handleSubmit"
      />
    </BasicModal>
  </div>
</template>

<script setup>
import { BasicForm, BasicModal } from '@k8s-agent/shared/components'
import { useModal } from '@k8s-agent/shared/composables'

const { visible, open, close } = useModal()

const formSchemas = [
  { field: 'username', label: '用户名', component: 'Input', required: true },
  { field: 'email', label: '邮箱', component: 'Input', required: true }
]

const formData = ref({})

const handleSubmit = () => {
  console.log('提交数据:', formData.value)
  close()
}
</script>
```

### 3. 使用工具函数

```javascript
import {
  isEmail,
  isPhone,
  formatDate,
  formatMoney
} from '@k8s-agent/shared/utils'

// 类型检查
if (isEmail('test@example.com')) {
  console.log('有效的邮箱')
}

// 格式化
const date = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
const money = formatMoney(123456.78) // ¥123,456.78
```

### 4. 使用权限钩子

```vue
<template>
  <div>
    <a-button v-if="hasPermission('user:create')">添加用户</a-button>
    <a-button v-if="hasPermission('user:edit')">编辑用户</a-button>
    <a-button v-if="hasPermission('user:delete')">删除用户</a-button>
  </div>
</template>

<script setup>
import { usePermission } from '@k8s-agent/shared/hooks'

const { hasPermission } = usePermission()
</script>
```

## 🔧 维护指南

### 添加新组件

1. 在 `src/components/` 目录下创建新组件
2. 在 `src/components/index.js` 中导出
3. 更新此 README 文档

### 添加新工具函数

1. 在 `src/utils/` 目录下添加或修改文件
2. 在 `src/utils/index.js` 中导出
3. 添加 JSDoc 注释说明用法

### 版本管理

- 遵循语义化版本规范（Semver）
- 重大变更需要更新主版本号
- 新功能更新次版本号
- Bug 修复更新修订号

## 📝 注意事项

1. **依赖管理**: 共享包使用 peerDependencies，确保子应用已安装 Vue 3 和 Ant Design Vue

2. **样式隔离**: 组件样式使用 scoped，避免样式污染

3. **按需导入**: 建议使用子路径导入（如 `@k8s-agent/shared/components`）以获得更好的 tree-shaking

4. **类型支持**: 所有函数都有 JSDoc 注释，支持 IDE 智能提示

5. **向后兼容**: 修改现有 API 时要考虑向后兼容性

## 🔗 相关文档

- [组件使用指南](../COMPONENTS_GUIDE.md)
- [组合式函数和工具指南](../COMPOSABLES_AND_UTILS_GUIDE.md)
- [子应用使用指南](../SUB_APPS_USAGE_GUIDE.md)

## 📄 License

MIT
