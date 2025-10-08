# VXE Table 集成说明

## ⚠️ 重要提示

VXE Table 是一个**可选的高级表格组件**，需要额外安装和配置。如果你只需要基础表格功能，请使用 `BasicTable` 组件。

## 📦 安装步骤

### 1. 安装依赖

在需要使用 VXE Table 的应用中安装依赖：

```bash
cd web/your-app
pnpm add vxe-table vxe-table-plugin-antd xe-utils
```

### 2. 全局配置

在应用的 `main.js` 中初始化 VXE Table：

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

// 导入 VXE Table 配置
import { initVxeTable } from '@k8s-agent/shared/config/vxeTable'

const app = createApp(App)

// 初始化 VXE Table（必须在 app.mount 之前）
initVxeTable({
  size: 'medium',
  zIndex: 999,
  table: {
    border: false,
    stripe: false,
    highlightHoverRow: true
  }
})

app.mount('#app')
```

### 3. 创建完整的 VxeBasicTable 组件

由于 shared 包使用 peerDependencies，你需要在应用中创建完整的 VxeBasicTable：

```vue
<!-- src/components/VxeBasicTable.vue -->
<template>
  <div class="vxe-basic-table">
    <vxe-grid
      ref="gridRef"
      v-bind="gridOptions"
      @checkbox-change="$emit('checkbox-change', $event)"
      @page-change="handlePageChange"
    >
      <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps || {}" />
      </template>
    </vxe-grid>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useVxeTable } from '@k8s-agent/shared/hooks'

const props = defineProps({
  gridOptions: {
    type: Object,
    default: () => ({})
  },
  api: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['register', 'checkbox-change', 'page-change'])

const [gridRef, gridApi] = useVxeTable({
  gridOptions: props.gridOptions,
  api: props.api
})

defineExpose(gridApi)
emit('register', gridApi)
</script>
```

### 4. 使用组件

```vue
<template>
  <VxeBasicTable
    :grid-options="gridOptions"
    :api="fetchData"
  />
</template>

<script setup>
import VxeBasicTable from '@/components/VxeBasicTable.vue'

const gridOptions = {
  columns: [
    { field: 'id', title: 'ID' },
    { field: 'name', title: '姓名' }
  ]
}

const fetchData = async ({ page, pageSize }) => {
  // API 调用
}
</script>
```

## 🎯 为什么这样设计？

### 问题：直接在 shared 中使用 vxe-table

```javascript
// ❌ 不推荐：shared 组件直接导入 vxe-table
import { VxeGrid } from 'vxe-table'
```

**缺点：**
- 所有应用都必须安装 vxe-table，即使不使用
- 增加打包体积
- Vite 开发模式下可能出现模块解析错误

### 解决方案：分层架构

```
┌─────────────────────────────────────┐
│  Application (main-app, agent-app)  │
│  - 安装 vxe-table                   │
│  - 创建 VxeBasicTable 组件          │
│  - 使用 useVxeTable hook            │
└─────────────────────────────────────┘
                 ↓ 导入
┌─────────────────────────────────────┐
│  Shared Package                     │
│  - 提供 useVxeTable hook            │
│  - 提供配置函数                     │
│  - vxe-table 作为 peerDependency    │
└─────────────────────────────────────┘
```

**优点：**
- ✅ 按需安装，不使用就不安装
- ✅ 减小 shared 包体积
- ✅ 避免依赖冲突
- ✅ 更灵活的版本管理

## 📚 完整示例

查看以下文件获取完整的使用示例：
- `examples/VxeTableExample.vue` - 完整示例代码
- `VXE_TABLE_GUIDE.md` - 详细使用指南
- `VXE_TABLE_QUICK_REFERENCE.md` - 快速参考

## 🔄 迁移指南

如果你已经在使用 BasicTable，迁移到 VXE Table 很简单：

### BasicTable
```vue
<BasicTable
  :columns="columns"
  :data-source="data"
  :loading="loading"
/>
```

### VXE Table
```vue
<VxeBasicTable
  :grid-options="{ columns }"
  :data-source="data"
  :api="fetchData"
/>
```

## ❓ 常见问题

### Q: 为什么 shared 中的 VxeBasicTable 是占位符？
A: 因为 vxe-table 作为 peerDependency，只有在应用中安装后才能使用。这是为了避免强制所有应用都安装这个依赖。

### Q: 我需要在每个应用中都创建 VxeBasicTable 吗？
A: 如果多个应用都需要使用，可以创建一个新的共享包（如 `@k8s-agent/vxe-table`）来复用组件。

### Q: 可以直接使用 vxe-table 吗？
A: 可以，但推荐使用 `useVxeTable` hook，它提供了更方便的 API 和状态管理。

### Q: BasicTable 和 VxeBasicTable 有什么区别？
A:
- **BasicTable**: 基于 Ant Design Vue Table，轻量级，适合大多数场景
- **VxeBasicTable**: 基于 vxe-table，功能更强大，适合复杂表格（如可编辑、树形、大数据量）

## 💡 推荐使用场景

**使用 BasicTable (推荐)：**
- ✅ 普通数据展示
- ✅ 简单的 CRUD 操作
- ✅ 标准的表格功能

**使用 VXE Table：**
- ✅ 可编辑表格
- ✅ 树形表格
- ✅ 大数据量虚拟滚动
- ✅ 复杂的单元格渲染
- ✅ 需要导出、打印等高级功能

---

更多信息请参考：
- [VXE Table 官方文档](https://vxetable.cn/)
- [vue-vben-admin VXE Table 示例](https://doc.vben.pro/components/common-ui/vben-vxe-table.html)
