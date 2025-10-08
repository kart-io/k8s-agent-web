# 组件使用示例

## 1. Basic 基础组件

### BasicButton 按钮

```vue
<template>
  <a-space>
    <BasicButton type="primary">主要按钮</BasicButton>
    <BasicButton>默认按钮</BasicButton>
    <BasicButton type="dashed">虚线按钮</BasicButton>
    <BasicButton type="link">链接按钮</BasicButton>
    <BasicButton danger>危险按钮</BasicButton>
    <BasicButton :loading="loading" @click="handleClick">加载中</BasicButton>
    <BasicButton icon="PlusOutlined">带图标</BasicButton>
  </a-space>
</template>

<script setup>
import { ref } from 'vue'
import { BasicButton } from '@k8s-agent/shared/components'

const loading = ref(false)
const handleClick = () => {
  loading.value = true
  setTimeout(() => loading.value = false, 2000)
}
</script>
```

### BasicCard 卡片

```vue
<template>
  <BasicCard title="用户信息" :bordered="true">
    <template #extra>
      <a href="#">更多</a>
    </template>
    <p>卡片内容</p>
    <p>卡片内容</p>
  </BasicCard>
</template>

<script setup>
import { BasicCard } from '@k8s-agent/shared/components'
</script>
```

### Icon 图标

```vue
<template>
  <a-space>
    <Icon icon="UserOutlined" :size="24" color="#1890ff" />
    <Icon icon="SettingOutlined" :size="32" />
    <Icon icon="DeleteOutlined" color="red" />
  </a-space>
</template>

<script setup>
import { Icon } from '@k8s-agent/shared/components'
</script>
```

### Loading 加载

```vue
<template>
  <Loading :loading="loading" tip="加载中...">
    <div>内容区域</div>
  </Loading>

  <!-- 全屏加载 -->
  <Loading :loading="fullLoading" fullscreen />
</template>

<script setup>
import { ref } from 'vue'
import { Loading } from '@k8s-agent/shared/components'

const loading = ref(true)
const fullLoading = ref(false)
</script>
```

### CountTo 数字动画

```vue
<template>
  <CountTo
    :start-val="0"
    :end-val="2024"
    :duration="3000"
    prefix="¥"
    suffix=" 元"
    separator=","
  />
</template>

<script setup>
import { CountTo } from '@k8s-agent/shared/components'
</script>
```

### CountDown 倒计时

```vue
<template>
  <CountDown
    :value="60000"
    format="mm:ss"
    @finish="handleFinish"
  />
</template>

<script setup>
import { CountDown } from '@k8s-agent/shared/components'

const handleFinish = () => {
  console.log('倒计时结束')
}
</script>
```

### StrengthMeter 密码强度

```vue
<template>
  <StrengthMeter
    v-model="password"
    placeholder="请输入密码"
    :show-strength="true"
    @strength-change="handleStrengthChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { StrengthMeter } from '@k8s-agent/shared/components'

const password = ref('')
const handleStrengthChange = (strength) => {
  console.log('密码强度:', strength)
}
</script>
```

### QrCode 二维码

```vue
<template>
  <QrCode
    value="https://github.com/kart/k8s-agent"
    :size="200"
    :show-download="true"
    download-file-name="k8s-agent-qrcode"
  />
</template>

<script setup>
import { QrCode } from '@k8s-agent/shared/components'
</script>
```

### JsonPreview JSON预览

```vue
<template>
  <JsonPreview
    :data="jsonData"
    :show-toolbar="true"
    :show-download="true"
    file-name="data.json"
  />
</template>

<script setup>
import { ref } from 'vue'
import { JsonPreview } from '@k8s-agent/shared/components'

const jsonData = ref({
  name: 'K8s Agent',
  version: '1.0.0',
  features: ['监控', '管理', '部署']
})
</script>
```

### CodeEditor 代码编辑器

```vue
<template>
  <CodeEditor
    v-model="code"
    language="javascript"
    theme="monokai"
    height="400px"
    :readonly="false"
  />
</template>

<script setup>
import { ref } from 'vue'
import { CodeEditor } from '@k8s-agent/shared/components'

const code = ref('console.log("Hello World")')
</script>
```

## 2. Form 表单组件

### BasicForm 动态表单

```vue
<template>
  <BasicForm
    ref="formRef"
    :schemas="formSchemas"
    v-model="formData"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref } from 'vue'
import { BasicForm } from '@k8s-agent/shared/components'

const formRef = ref()
const formData = ref({})

const formSchemas = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    required: true,
    placeholder: '请输入用户名'
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    required: true
  },
  {
    field: 'role',
    label: '角色',
    component: 'Select',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '用户', value: 'user' }
    ]
  },
  {
    field: 'birthday',
    label: '生日',
    component: 'DatePicker'
  }
]

const handleSubmit = (values) => {
  console.log('表单数据:', values)
}
</script>
```

## 3. Table 表格组件

### BasicTable 数据表格

```vue
<template>
  <BasicTable
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :pagination="pagination"
    :show-toolbar="true"
    :action-column="{ edit: true, delete: true }"
    @refresh="handleRefresh"
    @edit="handleEdit"
    @delete="handleDelete"
  >
    <template #toolbar-left>
      <a-button type="primary">新增</a-button>
    </template>
  </BasicTable>
</template>

<script setup>
import { ref } from 'vue'
import { BasicTable } from '@k8s-agent/shared/components'

const loading = ref(false)
const dataSource = ref([
  { id: 1, name: 'Agent-1', status: 'online' },
  { id: 2, name: 'Agent-2', status: 'offline' }
])

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'status', key: 'status' }
]

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 2
})

const handleRefresh = () => {
  loading.value = true
  // 重新加载数据...
}

const handleEdit = (record) => {
  console.log('编辑:', record)
}

const handleDelete = (record) => {
  console.log('删除:', record)
}
</script>
```

## 4. Modal 模态框

### BasicModal 模态框

```vue
<template>
  <BasicModal
    v-model:open="visible"
    title="编辑用户"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form>
      <a-form-item label="用户名">
        <a-input v-model:value="formData.username" />
      </a-form-item>
      <a-form-item label="邮箱">
        <a-input v-model:value="formData.email" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup>
import { ref } from 'vue'
import { BasicModal } from '@k8s-agent/shared/components'

const visible = ref(false)
const loading = ref(false)
const formData = ref({
  username: '',
  email: ''
})

const handleOk = () => {
  loading.value = true
  // 提交数据...
  setTimeout(() => {
    loading.value = false
    visible.value = false
  }, 1000)
}

const handleCancel = () => {
  visible.value = false
}
</script>
```

## 5. Upload 上传组件

### BasicUpload 文件上传

```vue
<template>
  <BasicUpload
    v-model="fileList"
    action="/api/upload"
    :max-count="5"
    :max-size="10"
    accept=".jpg,.png"
    list-type="picture-card"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { BasicUpload } from '@k8s-agent/shared/components'

const fileList = ref([])

const handleChange = (files) => {
  console.log('文件列表:', files)
}
</script>
```

## 6. Tree 树形组件

### BasicTree 树形控件

```vue
<template>
  <BasicTree
    v-model:selected-keys="selectedKeys"
    v-model:checked-keys="checkedKeys"
    :tree-data="treeData"
    :checkable="true"
    :show-line="true"
    @select="handleSelect"
    @check="handleCheck"
  />
</template>

<script setup>
import { ref } from 'vue'
import { BasicTree } from '@k8s-agent/shared/components'

const selectedKeys = ref([])
const checkedKeys = ref([])

const treeData = [
  {
    title: '父节点',
    key: '0',
    children: [
      { title: '子节点1', key: '0-0' },
      { title: '子节点2', key: '0-1' }
    ]
  }
]

const handleSelect = (keys) => {
  console.log('选中:', keys)
}

const handleCheck = (keys) => {
  console.log('勾选:', keys)
}
</script>
```

## 7. Drawer 抽屉组件

### BasicDrawer 抽屉

```vue
<template>
  <BasicDrawer
    v-model:open="visible"
    title="用户详情"
    :width="500"
    placement="right"
    :show-footer="true"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-descriptions :column="1" bordered>
      <a-descriptions-item label="用户名">Admin</a-descriptions-item>
      <a-descriptions-item label="邮箱">admin@example.com</a-descriptions-item>
      <a-descriptions-item label="角色">管理员</a-descriptions-item>
    </a-descriptions>
  </BasicDrawer>
</template>

<script setup>
import { ref } from 'vue'
import { BasicDrawer } from '@k8s-agent/shared/components'

const visible = ref(false)

const handleOk = () => {
  visible.value = false
}

const handleCancel = () => {
  visible.value = false
}
</script>
```

## 8. Result 结果页

### BasicResult 结果页

```vue
<template>
  <BasicResult
    status="success"
    title="提交成功"
    sub-title="订单将在 5 分钟内处理"
  >
    <template #extra>
      <a-space>
        <a-button type="primary">返回首页</a-button>
        <a-button>查看订单</a-button>
      </a-space>
    </template>
  </BasicResult>
</template>

<script setup>
import { BasicResult } from '@k8s-agent/shared/components'
</script>
```

## 9. Layout 布局组件

### VbenLayout 主布局

```vue
<template>
  <VbenLayout
    :menu-data="menuList"
    title="K8s Agent"
    :user-name="userName"
    :show-tabs="true"
    @user-menu-click="handleUserMenuClick"
  >
    <router-view />
  </VbenLayout>
</template>

<script setup>
import { ref } from 'vue'
import { VbenLayout } from '@k8s-agent/shared/components'

const userName = ref('Admin')
const menuList = ref([
  {
    key: '/dashboard',
    label: '仪表盘',
    icon: 'DashboardOutlined'
  },
  {
    key: '/agents',
    label: 'Agent 管理',
    icon: 'ClusterOutlined'
  }
])

const handleUserMenuClick = (key) => {
  if (key === 'logout') {
    // 退出登录
  }
}
</script>
```

## 完整示例页面

```vue
<template>
  <div class="page-container">
    <BasicCard title="Agent 管理" :bordered="false">
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索 Agent"
            style="width: 200px"
            @search="handleSearch"
          />
          <BasicButton type="primary" icon="PlusOutlined" @click="handleAdd">
            新增 Agent
          </BasicButton>
        </a-space>
      </template>

      <BasicTable
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        @refresh="loadData"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <StatusTag :status="record.status" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleView(record)">查看</a>
              <a @click="handleEdit(record)">编辑</a>
              <a-popconfirm title="确定删除？" @confirm="handleDelete(record)">
                <a style="color: red">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </BasicTable>
    </BasicCard>

    <!-- 编辑弹窗 -->
    <BasicModal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="confirmLoading"
      @ok="handleSubmit"
    >
      <BasicForm
        ref="formRef"
        :schemas="formSchemas"
        v-model="formData"
      />
    </BasicModal>

    <!-- 详情抽屉 -->
    <BasicDrawer
      v-model:open="drawerVisible"
      title="Agent 详情"
      :width="600"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="ID">{{ currentAgent?.id }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{ currentAgent?.name }}</a-descriptions-item>
        <a-descriptions-item label="状态" :span="2">
          <StatusTag :status="currentAgent?.status" />
        </a-descriptions-item>
      </a-descriptions>
    </BasicDrawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  BasicCard,
  BasicButton,
  BasicTable,
  BasicModal,
  BasicForm,
  BasicDrawer,
  StatusTag
} from '@k8s-agent/shared/components'

// 状态
const loading = ref(false)
const searchText = ref('')
const dataSource = ref([])
const modalVisible = ref(false)
const drawerVisible = ref(false)
const confirmLoading = ref(false)
const formData = ref({})
const currentAgent = ref(null)

// 表格配置
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'action', width: 200 }
]

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表单配置
const formSchemas = [
  {
    field: 'name',
    label: 'Agent 名称',
    component: 'Input',
    required: true
  },
  {
    field: 'namespace',
    label: '命名空间',
    component: 'Input',
    required: true
  },
  {
    field: 'cluster',
    label: '集群',
    component: 'Select',
    options: [
      { label: '集群A', value: 'cluster-a' },
      { label: '集群B', value: 'cluster-b' }
    ]
  }
]

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 加载数据...
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  formData.value = {}
  modalVisible.value = true
}

const handleEdit = (record) => {
  formData.value = { ...record }
  modalVisible.value = true
}

const handleView = (record) => {
  currentAgent.value = record
  drawerVisible.value = true
}

const handleDelete = async (record) => {
  // 删除逻辑...
  await loadData()
}

const handleSubmit = async () => {
  confirmLoading.value = true
  try {
    // 提交逻辑...
    modalVisible.value = false
    await loadData()
  } finally {
    confirmLoading.value = false
  }
}

const handleSearch = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 16px;
}
</style>
```

## 组件组合使用最佳实践

1. **页面布局**: 使用 VbenLayout 作为主布局框架
2. **内容容器**: 使用 BasicCard 包裹页面内容
3. **数据展示**: 使用 BasicTable 展示列表数据
4. **表单交互**: 使用 BasicForm + BasicModal 处理表单
5. **详情展示**: 使用 BasicDrawer 展示详细信息
6. **状态反馈**: 使用 Loading、StatusTag、BasicEmpty 等组件
