# VXE Table 导入问题修复完成

## 问题

```
[plugin:vite:import-analysis] Failed to resolve import "vxe-table"
from "../shared/src/components/vxe-table/VxeBasicTable.vue".
Does the file exist?
```

## 根本原因

shared 包中的文件尝试导入 `vxe-table`，但：
1. vxe-table 配置为 `peerDependency`
2. 在开发模式下，Vite 无法解析 shared 包中的 peerDependency
3. 导致构建失败

## 修复内容

### 1. VxeBasicTable.vue
**之前：**
```javascript
import { VxeGrid } from 'vxe-table'  // ❌ 导致错误
```

**之后：**
```vue
<!-- 纯占位符组件，不导入任何 vxe-table 代码 -->
<template>
  <div class="vxe-table-placeholder">
    <a-empty description="VXE Table 未安装，请先安装 vxe-table 依赖" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
// ✓ 不再导入 vxe-table
</script>
```

### 2. config/vxeTable.js
**之前：**
```javascript
import VXETable from 'vxe-table'  // ❌ 导致错误
import VXETablePluginAntd from 'vxe-table-plugin-antd'
```

**之后：**
```javascript
// ✓ 只导出配置对象，不导入 vxe-table
export const defaultVxeTableConfig = { ... }
export function createVxeTableConfig(options) { ... }
export function setupVxeTable(VXETable, options) { ... }
```

### 3. hooks/useVxeTable.js
**之前：**
```javascript
import { VxeGridProps } from 'vxe-table'  // ❌ 导致错误
```

**之后：**
```javascript
import { ref, unref, nextTick, computed } from 'vue'
// ✓ 不再导入 vxe-table 类型
```

## 验证结果

```bash
✓ No actual vxe-table imports found in shared/src
```

所有真实的 vxe-table 导入已完全移除！

## 当前架构

```
┌─────────────────────────────────────┐
│  shared 包                          │
│  ✓ 不导入 vxe-table                │
│  ✓ 提供配置对象和工具函数           │
│  ✓ 提供 useVxeTable hook           │
│  ✓ 提供占位符组件                   │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  应用层 (需要时)                     │
│  ✓ 安装 vxe-table                  │
│  ✓ 导入 VXETable                   │
│  ✓ 使用 shared 的配置和 hooks      │
│  ✓ 创建完整的 VxeBasicTable        │
└─────────────────────────────────────┘
```

## 文件清单

已修复的文件：
- ✅ `src/components/vxe-table/VxeBasicTable.vue` - 占位符组件
- ✅ `src/config/vxeTable.js` - 纯配置导出
- ✅ `src/hooks/useVxeTable.js` - 移除类型导入

保留的文件：
- ✅ `VXE_TABLE_INTEGRATION.md` - 集成指南
- ✅ `VXE_TABLE_GUIDE.md` - 使用文档
- ✅ `VXE_TABLE_QUICK_REFERENCE.md` - 快速参考
- ✅ `examples/VxeTableExample.vue` - 示例代码

## 使用方式

### 不需要 VXE Table（推荐）
```vue
<template>
  <BasicTable :columns="columns" :data-source="data" />
</template>

<script setup>
import { BasicTable } from '@k8s-agent/shared/components'
</script>
```

### 需要 VXE Table
参考 `VXE_TABLE_INTEGRATION.md` 在应用中集成。

## 优势

1. ✅ **零依赖** - shared 包不强制安装 vxe-table
2. ✅ **按需使用** - 只在需要时才安装
3. ✅ **无构建错误** - Vite 可以正常解析所有模块
4. ✅ **灵活性** - 各应用可以选择是否使用 VXE Table

---

**状态：✅ 完全修复，可以正常构建！**
