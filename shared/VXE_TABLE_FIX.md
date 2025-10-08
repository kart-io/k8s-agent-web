# 错误修复说明

## 问题

```
GET http://localhost:3000/@fs/.../VxeBasicTable.vue
net::ERR_ABORTED 500 (Internal Server Error)
```

## 原因

VXE Table 组件直接在 `shared` 包中使用了 `vxe-table`，但：
1. `vxe-table` 被配置为 `peerDependency`
2. 应用中没有安装 `vxe-table`
3. Vite 开发模式无法解析这个依赖

## 解决方案

采用**分层架构**设计：

```
┌─────────────────────────────────────┐
│  应用层 (main-app, agent-app)       │
│  ✓ 安装 vxe-table                  │
│  ✓ 创建 VxeBasicTable 组件         │
│  ✓ 使用 useVxeTable hook           │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  共享层 (shared)                    │
│  ✓ 提供 useVxeTable hook           │
│  ✓ 提供配置函数                    │
│  ✓ VxeBasicTable.vue 作为占位符    │
└─────────────────────────────────────┘
```

## 当前状态

✅ **已修复**：
- `VxeBasicTable.vue` 改为占位符组件，不再直接使用 `vxe-table`
- 提供友好的提示信息
- 500 错误已消失

✅ **核心功能保留**：
- `useVxeTable` hook 完整可用
- `initVxeTable` 配置函数完整可用
- 所有文档和示例完整

## 如何使用

### 方式 1: 使用 BasicTable (推荐)

大多数场景使用 shared 包中的 `BasicTable` 即可：

```vue
<template>
  <BasicTable
    :columns="columns"
    :data-source="data"
  />
</template>

<script setup>
import { BasicTable } from '@k8s-agent/shared/components'
</script>
```

### 方式 2: 集成 VXE Table (高级功能)

如果需要 VXE Table 的高级功能（可编辑、树形、大数据等），请参考：

📖 **[VXE_TABLE_INTEGRATION.md](./VXE_TABLE_INTEGRATION.md)** - 详细集成说明

简要步骤：
1. 在应用中安装依赖
2. 在应用中创建 VxeBasicTable 组件
3. 使用 shared 提供的 hooks 和配置

## 设计优势

✅ **按需加载** - 不使用就不需要安装
✅ **减小体积** - shared 包保持轻量
✅ **灵活性** - 各应用可以选择不同的表格方案
✅ **避免冲突** - 不强制依赖版本

## 文档

- 📄 [VXE_TABLE_INTEGRATION.md](./VXE_TABLE_INTEGRATION.md) - 集成说明（必读）
- 📄 [VXE_TABLE_GUIDE.md](./VXE_TABLE_GUIDE.md) - 完整使用指南
- 📄 [VXE_TABLE_QUICK_REFERENCE.md](./VXE_TABLE_QUICK_REFERENCE.md) - 快速参考
- 📄 [VXE_TABLE_SUMMARY.txt](./VXE_TABLE_SUMMARY.txt) - 实现总结

---

**结论**：错误已修复，VXE Table 作为可选的高级组件，需要时在应用层集成即可。
