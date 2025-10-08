# Composables、Utils 和 Hooks 使用指南

本项目基于 vue-vben-admin 架构，提供了完整的 Composables（组合式函数）、Utils（工具函数）和 Hooks（钩子函数）。

## 📦 目录结构

```
web/main-app/src/
├── composables/        # 组合式函数（业务逻辑复用）
│   ├── useTable.js
│   ├── useModal.js
│   ├── useForm.js
│   ├── useScrollLock.js
│   ├── useIsMobile.js
│   └── index.js
├── hooks/              # 钩子函数（通用逻辑）
│   ├── usePermission.js
│   ├── useLoading.js
│   ├── usePagination.js
│   ├── useDebounce.js
│   ├── useThrottle.js
│   └── index.js
└── utils/              # 工具函数（纯函数）
    ├── is.js           # 类型判断
    ├── tree.js         # 树形数据处理
    ├── format.js       # 格式化
    ├── storage.js      # 本地存储
    ├── download.js     # 下载
    ├── validate.js     # 验证
    └── index.js
```

---

## 🎯 Composables（组合式函数）

### 1. useTable - 表格管理

简化表格操作，包括加载、分页、搜索等。

```vue
<template>
  <BasicTable
    :data-source="dataSource"
    :loading="loading"
    :pagination="pagination"
    @change="handleTableChange"
  />
</template>

<script setup>
import { useTable } from '@/composables'
import { getUsers } from '@/api/system'

const {
  dataSource,
  loading,
  pagination,
  search,
  reload,
  reset,
  setSearch,
  handleTableChange
} = useTable({
  api: getUsers,
  immediate: true,
  searchParams: { status: 'active' }
})

// 手动刷新
const handleRefresh = () => {
  reload()
}

// 搜索
const handleSearch = (params) => {
  setSearch(params)
}
</script>
```

**API**:
- `dataSource` - 表格数据
- `loading` - 加载状态
- `pagination` - 分页信息
- `search` - 搜索参数
- `loadData(params)` - 加载数据
- `reload(params)` - 刷新（保持当前页）
- `reset(params)` - 重置（回到第一页）
- `setSearch(params)` - 设置搜索参数
- `resetSearch()` - 重置搜索参数
- `handleTableChange(pag, filters, sorter)` - 表格变化处理
- `deleteAndReload(deleteFn)` - 删除后刷新

---

### 2. useModal - 模态框管理

简化模态框的打开、关闭、提交等操作。

```vue
<template>
  <BasicModal
    v-model:open="visible"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
  >
    <BasicForm v-model="modalData" :schemas="formSchemas" />
  </BasicModal>
</template>

<script setup>
import { useModal } from '@/composables'
import { createUser } from '@/api/system'

const {
  visible,
  confirmLoading,
  modalData,
  open,
  close,
  handleOk
} = useModal({
  onOk: async (data) => {
    await createUser(data)
    // 提交成功后会自动关闭
  }
})

// 打开模态框
const handleAdd = () => {
  open({ name: '', email: '' })
}
</script>
```

**API**:
- `visible` - 可见性
- `confirmLoading` - 确认加载状态
- `modalData` - 模态框数据
- `open(data)` - 打开模态框
- `close()` - 关闭模态框
- `handleOk()` - 确定按钮处理
- `handleCancel()` - 取消按钮处理
- `setModalData(data)` - 设置数据
- `resetModalData()` - 重置数据

---

### 3. useForm - 表单管理

简化表单的验证、提交、重置等操作。

```vue
<template>
  <BasicForm
    ref="formRef"
    :model="formModel"
    :schemas="schemas"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { useForm } from '@/composables'
import { createUser } from '@/api/system'

const {
  formRef,
  formModel,
  submitLoading,
  validate,
  handleSubmit,
  setFieldsValue
} = useForm({
  schemas: [
    { field: 'username', label: '用户名', component: 'Input', required: true },
    { field: 'email', label: '邮箱', component: 'Input', required: true }
  ],
  initialValues: { username: '', email: '' },
  onSubmit: async (values) => {
    await createUser(values)
  }
})

// 设置表单值
const handleEdit = (record) => {
  setFieldsValue(record)
}
</script>
```

**API**:
- `formRef` - 表单引用
- `formModel` - 表单数据
- `submitLoading` - 提交加载状态
- `validate()` - 验证表单
- `validateFields(fields)` - 验证指定字段
- `resetFields(fields)` - 重置字段
- `setFieldsValue(values)` - 设置字段值
- `getFieldsValue()` - 获取字段值
- `handleSubmit()` - 提交表单
- `handleReset()` - 重置表单

---

### 4. useScrollLock - 滚动锁定

用于锁定和解锁页面滚动（常用于模态框、抽屉等）。

```vue
<script setup>
import { watch } from 'vue'
import { useScrollLock } from '@/composables'

const { isLocked, lock, unlock, toggle } = useScrollLock()

// 打开模态框时锁定滚动
watch(modalVisible, (visible) => {
  if (visible) {
    lock()
  } else {
    unlock()
  }
})
</script>
```

**API**:
- `isLocked` - 是否锁定
- `lock()` - 锁定滚动
- `unlock()` - 解锁滚动
- `toggle()` - 切换锁定状态

---

### 5. useIsMobile - 移动端检测

检测当前设备是否为移动设备。

```vue
<template>
  <div :class="{ 'mobile-view': isMobile }">
    <!-- 内容 -->
  </div>
</template>

<script setup>
import { useIsMobile } from '@/composables'

const { isMobile } = useIsMobile(768) // 断点：768px
</script>
```

**API**:
- `isMobile` - 是否为移动设备

---

## 🔧 Hooks（钩子函数）

### 1. usePermission - 权限管理

用于判断用户是否有某个权限或角色。

```vue
<template>
  <a-button v-if="hasPermission('user:create')" @click="handleAdd">
    新建用户
  </a-button>

  <a-button v-if="hasRole('admin')" @click="handleAdmin">
    管理员操作
  </a-button>
</template>

<script setup>
import { usePermission } from '@/hooks'

const { hasPermission, hasRole } = usePermission()

// 检查多个权限（任一满足）
const canEdit = hasPermission(['user:edit', 'user:manage'], 'some')

// 检查多个权限（全部满足）
const canDelete = hasPermission(['user:delete', 'user:manage'], 'every')
</script>
```

**API**:
- `permissions` - 用户权限列表
- `hasPermission(permission, mode)` - 检查权限
- `hasRole(role, mode)` - 检查角色

---

### 2. useLoading - 加载状态

用于管理异步操作的加载状态。

```vue
<script setup>
import { useLoading } from '@/hooks'
import { getUsers } from '@/api/system'

const { loading, withLoading, createLoadingFn } = useLoading()

// 方式1: 手动包装
const fetchUsers = async () => {
  const users = await withLoading(getUsers)
  console.log(users)
}

// 方式2: 创建带加载的函数
const fetchUsersWithLoading = createLoadingFn(getUsers)
</script>
```

**API**:
- `loading` - 加载状态
- `setLoading(value)` - 设置加载状态
- `startLoading()` - 开始加载
- `endLoading()` - 结束加载
- `withLoading(fn, ...args)` - 包装异步函数
- `createLoadingFn(fn)` - 创建带加载的函数

---

### 3. usePagination - 分页管理

用于管理分页状态。

```vue
<template>
  <a-pagination
    v-model:current="pagination.current"
    v-model:page-size="pagination.pageSize"
    :total="pagination.total"
    @change="handleChange"
  />
</template>

<script setup>
import { usePagination } from '@/hooks'

const {
  pagination,
  setTotal,
  handleChange,
  prev,
  next,
  getParams
} = usePagination({
  current: 1,
  pageSize: 20
})

// 设置总数
setTotal(100)

// 获取分页参数（用于API请求）
const params = getParams.value // { page: 1, pageSize: 20 }
</script>
```

**API**:
- `pagination` - 分页对象
- `setPage(page)` - 设置当前页
- `setPageSize(size)` - 设置每页条数
- `setTotal(total)` - 设置总数
- `reset()` - 重置分页
- `handleChange(page, pageSize)` - 处理变化
- `prev()` - 上一页
- `next()` - 下一页
- `first()` - 第一页
- `last()` - 最后一页
- `getParams` - 获取分页参数

---

### 4. useDebounce - 防抖

用于延迟执行函数，避免频繁触发。

```vue
<template>
  <a-input v-model:value="searchText" placeholder="搜索..." />
  <p>防抖后的值: {{ debouncedText }}</p>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDebounce, debounce } from '@/hooks'

const searchText = ref('')

// 方式1: 使用 hook
const debouncedText = useDebounce(searchText, 500)

watch(debouncedText, (value) => {
  console.log('搜索:', value)
})

// 方式2: 使用函数
const handleSearch = debounce((value) => {
  console.log('搜索:', value)
}, 500)
</script>
```

---

### 5. useThrottle - 节流

用于限制函数执行频率。

```vue
<script setup>
import { ref } from 'vue'
import { useThrottle, throttle } from '@/hooks'

const scrollTop = ref(0)

// 方式1: 使用 hook
const throttledScrollTop = useThrottle(scrollTop, 200)

// 方式2: 使用函数
const handleScroll = throttle((e) => {
  console.log('滚动:', e.target.scrollTop)
}, 200)
</script>
```

---

## 🛠️ Utils（工具函数）

### 1. 类型判断 (is.js)

```javascript
import { isString, isNumber, isArray, isEmpty, isEmail } from '@/utils'

isString('hello')           // true
isNumber(123)               // true
isArray([1, 2, 3])          // true
isEmpty([])                 // true
isEmail('test@example.com') // true
isPhone('13800138000')      // true
```

**所有函数**:
- `is(val, type)` - 判断类型
- `isDef` / `isUnDef` / `isNull` / `isNullOrUnDef`
- `isObject` / `isArray` / `isString` / `isNumber` / `isBoolean`
- `isDate` / `isRegExp` / `isFunction` / `isPromise`
- `isElement` / `isWindow` / `isEmpty`
- `isUrl` / `isEmail` / `isPhone` / `isIdCard` / `isExternal`

---

### 2. 树形数据处理 (tree.js)

```javascript
import { listToTree, treeToList, findNode, findPath } from '@/utils'

// 列表转树
const tree = listToTree([
  { id: 1, parentId: null, name: '父节点' },
  { id: 2, parentId: 1, name: '子节点' }
])

// 树转列表
const list = treeToList(tree)

// 查找节点
const node = findNode(tree, (n) => n.id === 2)

// 查找路径
const path = findPath(tree, (n) => n.id === 2)
```

**所有函数**:
- `listToTree(list, options)` - 列表转树
- `treeToList(tree, options)` - 树转列表
- `findNode(tree, predicate, options)` - 查找节点
- `findPath(tree, predicate, options)` - 查找路径
- `filterTree(tree, predicate, options)` - 过滤树
- `traverseTree(tree, callback, options)` - 遍历树
- `getLeafNodes(tree, options)` - 获取叶子节点

---

### 3. 格式化 (format.js)

```javascript
import {
  formatFileSize,
  formatNumber,
  formatCurrency,
  formatPhone,
  hidePhone,
  hideEmail
} from '@/utils'

formatFileSize(1024)           // '1 KB'
formatNumber(1234567.89, 2)    // '1,234,567.89'
formatCurrency(100)            // '¥100.00'
formatPhone('13800138000')     // '138 0013 8000'
hidePhone('13800138000')       // '138****8000'
hideEmail('test@example.com')  // 't***@example.com'
```

**所有函数**:
- `formatFileSize` - 文件大小
- `formatNumber` - 数字（千分位）
- `formatCurrency` - 金额
- `formatPercent` - 百分比
- `formatPhone` / `hidePhone` - 手机号
- `hideEmail` / `hideIdCard` - 隐藏敏感信息
- `formatBankCard` - 银行卡号
- `capitalize` / `camelToSnake` / `snakeToCamel` - 字符串转换

---

### 4. 本地存储 (storage.js)

```javascript
import { storage, sessionStorage } from '@/utils'

// localStorage
storage.set('user', { name: 'admin' }, 7 * 24 * 60 * 60 * 1000) // 7天后过期
const user = storage.get('user')
storage.remove('user')
storage.clear()

// sessionStorage
sessionStorage.set('token', 'xxx')
const token = sessionStorage.get('token')
```

**API**:
- `set(key, value, expire)` - 设置存储
- `get(key, defaultValue)` - 获取存储
- `remove(key)` - 移除存储
- `clear()` - 清空存储
- `getKeys()` - 获取所有key
- `has(key)` - 检查是否存在

---

### 5. 下载 (download.js)

```javascript
import {
  downloadFile,
  downloadJSON,
  downloadCSV,
  downloadText
} from '@/utils'

// 下载JSON
downloadJSON({ name: 'test', value: 123 }, 'data.json')

// 下载CSV
downloadCSV([
  { name: '张三', age: 18 },
  { name: '李四', age: 20 }
], 'users.csv')

// 下载文本
downloadText('Hello World', 'hello.txt')
```

**所有函数**:
- `downloadFile(data, filename, mime)` - 下载文件
- `downloadByUrl(url, filename)` - 通过URL下载
- `downloadBase64(base64, filename, mime)` - 下载Base64
- `downloadJSON(data, filename)` - 下载JSON
- `downloadCSV(data, filename, headers)` - 下载CSV
- `downloadText(text, filename)` - 下载文本

---

### 6. 验证 (validate.js)

Ant Design Vue 表单验证规则。

```vue
<script setup>
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRange
} from '@/utils'

const formSchemas = [
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    rules: [{ validator: validateEmail }]
  },
  {
    field: 'phone',
    label: '手机号',
    component: 'Input',
    rules: [{ validator: validatePhone }]
  },
  {
    field: 'age',
    label: '年龄',
    component: 'InputNumber',
    rules: [{ validator: validateRange(18, 60) }]
  }
]
</script>
```

**所有函数**:
- `validateEmail` - 邮箱
- `validatePhone` - 手机号
- `validateIdCard` - 身份证号
- `validatePassword` - 密码强度
- `validateUrl` - URL
- `validateIP` - IP地址
- `validatePort` - 端口号
- `validateChinese` - 中文
- `validateEnglish` - 英文
- `validateNumber` / `validateInteger` / `validatePositiveInteger`
- `validateRange(min, max)` - 范围
- `validateLength(min, max)` - 长度

---

## 🎨 使用建议

### 1. 按需导入

```javascript
// 推荐：按需导入
import { useTable, useModal } from '@/composables'
import { formatFileSize, isString } from '@/utils'
import { usePermission, useLoading } from '@/hooks'

// 不推荐：导入整个模块
import composables from '@/composables'
import utils from '@/utils'
```

### 2. 组合使用

```vue
<template>
  <PageWrapper title="用户管理">
    <template #extra>
      <a-button
        v-if="hasPermission('user:create')"
        type="primary"
        @click="handleAdd"
      >
        新建用户
      </a-button>
    </template>

    <BasicTable
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #status="{ record }">
        <StatusTag :status="record.status" :text="record.status" />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
    >
      <BasicForm :model="modalData" :schemas="formSchemas" />
    </BasicModal>
  </PageWrapper>
</template>

<script setup>
import { PageWrapper, BasicTable, BasicModal, BasicForm, StatusTag } from '@/components'
import { useTable, useModal } from '@/composables'
import { usePermission } from '@/hooks'
import { formatFileSize } from '@/utils'
import { getUsers, createUser } from '@/api/system'

// 权限
const { hasPermission } = usePermission()

// 表格
const {
  dataSource,
  loading,
  pagination,
  handleTableChange,
  reload
} = useTable({
  api: getUsers,
  immediate: true
})

// 模态框
const {
  visible,
  confirmLoading,
  modalData,
  open,
  handleOk
} = useModal({
  onOk: async (data) => {
    await createUser(data)
    reload()
  }
})

const formSchemas = [
  { field: 'username', label: '用户名', component: 'Input', required: true },
  { field: 'email', label: '邮箱', component: 'Input', required: true }
]

const handleAdd = () => {
  open({ username: '', email: '' })
}
</script>
```

---

## 📚 扩展指南

### 添加新的 Composable

在 `composables/` 目录下创建新文件：

```javascript
// useExample.js
import { ref } from 'vue'

export function useExample(options = {}) {
  const state = ref(null)

  const doSomething = () => {
    // 实现逻辑
  }

  return {
    state,
    doSomething
  }
}
```

在 `composables/index.js` 中导出：

```javascript
export { useExample } from './useExample'
```

---

**创建时间**: 2025-10-07
**状态**: ✅ 完成
**模块数量**:
- 5 个 Composables
- 5 个 Hooks
- 6 个 Utils 模块
