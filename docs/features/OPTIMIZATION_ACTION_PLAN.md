# 项目结构优化行动计划

**文档版本**: v1.0
**创建日期**: 2025-10-11
**优先级划分**: P0（紧急）、P1（高优先级）、P2（中优先级）、P3（低优先级）

基于 `PROJECT_STRUCTURE_ANALYSIS.md` 的分析结果，本文档提供可执行的优化方案和实施步骤。

---

## 优先级矩阵

| 问题 | 影响范围 | 技术复杂度 | 优先级 | 预计工时 |
|------|---------|-----------|--------|---------|
| 样式重复导入 | 所有微应用 | 低 | **P1** | 4h |
| 全局样式冗余 | 所有微应用 | 中 | **P1** | 6h |
| 开发依赖分散 | 构建性能 | 低 | **P2** | 2h |
| 依赖版本漂移 | 潜在 Bug | 中 | **P2** | 4h |
| 文档缺失 | 可维护性 | 低 | **P3** | 16h |
| 性能优化 | 用户体验 | 高 | **P3** | 24h |

---

## P1：样式系统重构（10小时）

### 任务 1.1：统一全局样式导入（4小时）

**问题描述**：

6 个微应用重复导入相同的第三方库样式（Ant Design + VXE Table），导致：

- 打包体积增加 ~1.2MB
- 样式加载顺序不可控
- 可能出现样式优先级冲突

**解决方案**：主应用统一导入全局样式

#### 实施步骤

**Step 1**：修改主应用入口文件（1小时）

```javascript
// main-app/src/main.js

import { createApp } from 'vue'
import Antd from 'ant-design-vue'

// ✅ 统一导入全局第三方库样式
import 'ant-design-vue/dist/reset.css'
import 'vxe-table/lib/style.css'
import 'vxe-table-plugin-antd/dist/style.css'

// ✅ 导入共享库全局样式
import '@k8s-agent/shared/assets/styles'

// 保留主应用特定样式
import './assets/styles/main.scss'

const app = createApp(App)
// ... 其余代码不变
```

**Step 2**：清理微应用中的重复导入（2小时）

批量修改以下文件，删除重复的样式导入：

```bash
# 需修改的文件列表
- dashboard-app/src/main.js
- agent-app/src/main.js
- cluster-app/src/main.js
- monitor-app/src/main.js
- system-app/src/main.js
- image-build-app/src/main.js
```

修改前：

```javascript
// ❌ 删除这些导入
import 'ant-design-vue/dist/reset.css'
import 'vxe-table/lib/style.css'
import 'vxe-table-plugin-antd/dist/style.css'
```

修改后：

```javascript
// ✅ 仅保留应用特定样式
import '@/assets/styles/main.scss'

// 如果使用了 VxeBasicTable 组件，需保留其样式
import '@k8s-agent/shared/dist/components/vxe-table/VxeBasicTable.css'
```

**Step 3**：测试验证（1小时）

```bash
# 1. 启动所有应用
make dev

# 2. 逐个检查页面样式
# - Dashboard: http://localhost:3000/dashboard
# - Agent: http://localhost:3000/agents
# - Cluster: http://localhost:3000/clusters
# - Monitor: http://localhost:3000/monitor
# - System: http://localhost:3000/system
# - Image Build: http://localhost:3000/image-build

# 3. 检查构建产物体积
make build
du -sh */dist/assets/*.css

# 预期结果：总体 CSS 体积减少 ~1MB
```

#### 验收标准

- [ ] 所有微应用页面样式渲染正常
- [ ] 浏览器 Network 面板中无重复 CSS 加载
- [ ] 构建产物中 CSS 体积减少 > 1MB
- [ ] 所有表格、按钮、表单样式正常

---

### 任务 1.2：提取共享全局样式（6小时）

**问题描述**：

每个微应用的 `main.scss` 包含 30+ 行相同的全局样式（盒模型重置、滚动条样式、字体定义等）

**解决方案**：提取到共享库的 `global.scss`

#### 实施步骤

**Step 1**：增强共享库全局样式（2小时）

```scss
// shared/src/assets/styles/global.scss

/**
 * Global Styles for K8s Agent Web
 * Automatically imported in all micro-apps via main-app
 */

// ==================== CSS Reset ====================

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: $font-family-base;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}

// ==================== Scrollbar Styles ====================

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

// ==================== Micro-App Container ====================

// 微前端应用容器样式
#micro-app-container {
  height: 100%;

  > div {
    height: 100%;
  }
}

// Wujie iframe 容器
.wujie-iframe-container {
  width: 100%;
  height: 100%;
}

// ==================== Common Layout Helpers ====================

.clearfix::after {
  content: '';
  display: table;
  clear: both;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

// ==================== Loading States ====================

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

// ==================== Accessibility ====================

// 为键盘导航用户显示 focus 状态
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid $primary-color;
  outline-offset: 2px;
}

// 为屏幕阅读器隐藏元素但保留布局
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

**Step 2**：清理微应用样式文件（2小时）

批量修改以下文件，删除冗余的全局样式：

```scss
// 示例：system-app/src/assets/styles/main.scss

// ❌ 删除与 global.scss 重复的代码
// * { margin: 0; padding: 0; box-sizing: border-box; }
// html, body { height: 100%; }
// ::-webkit-scrollbar { ... }

// ✅ 仅保留应用特定样式
.user-list {
  padding: $padding-lg;

  .search-form {
    margin-bottom: $margin-md;
  }
}

.role-list {
  padding: $padding-lg;
}

.permission-list {
  padding: $padding-lg;
}
```

**Step 3**：验证样式变量引用（1小时）

确保所有微应用能正确访问 `variables.scss` 中的变量：

```javascript
// 每个微应用的 vite.config.js 需配置 SCSS 变量自动导入

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@k8s-agent/shared/assets/styles/variables.scss";
          @import "@k8s-agent/shared/assets/styles/mixins.scss";
        `
      }
    }
  }
})
```

**Step 4**：测试与验证（1小时）

```bash
# 1. 清理缓存重新构建
make clean
make build

# 2. 检查样式生效
make dev

# 3. 验证所有页面样式正常
# - 全局字体是否生效
# - 滚动条样式是否正常
# - 盒模型是否正确
# - 响应式断点是否生效
```

#### 验收标准

- [ ] 所有微应用删除冗余全局样式后仍正常显示
- [ ] 样式变量在微应用中正确引用（如 `$primary-color`）
- [ ] 浏览器 DevTools 中检查样式来源为 `global.scss`
- [ ] 各微应用的 `main.scss` 文件减少至 < 50 行

---

## P2：依赖管理优化（6小时）

### 任务 2.1：提升开发依赖（2小时）

**问题描述**：

每个子应用独立定义 `@vitejs/plugin-vue`、`eslint` 等开发依赖，导致配置分散且版本可能不一致

**解决方案**：将开发依赖提升至根 `package.json`

#### 实施步骤

**Step 1**：修改根 package.json（30分钟）

```json
// package.json（根目录）
{
  "devDependencies": {
    // 构建工具
    "@vitejs/plugin-vue": "^4.5.0",
    "vite": "^5.0.4",

    // 代码检查
    "eslint": "^9.37.0",
    "eslint-plugin-vue": "^9.33.0",
    "@eslint/js": "^9.37.0",

    // 样式处理
    "sass": "^1.69.5",

    // 测试工具
    "@playwright/test": "^1.40.1",
    "vitest": "^1.0.4",
    "@vitest/ui": "^1.0.4",

    // 工具
    "concurrently": "^8.2.2"
  }
}
```

**Step 2**：删除子应用中的重复依赖（1小时）

批量修改以下文件的 `devDependencies` 字段：

```bash
# 需修改的文件列表
- main-app/package.json
- dashboard-app/package.json
- agent-app/package.json
- cluster-app/package.json
- monitor-app/package.json
- system-app/package.json
- image-build-app/package.json
- shared/package.json
```

修改示例：

```json
// system-app/package.json
{
  "devDependencies": {
    // ❌ 删除这些重复的依赖
    // "@vitejs/plugin-vue": "^4.5.0",
    // "vite": "^5.0.4",
    // "eslint": "^9.37.0",
    // "eslint-plugin-vue": "^9.33.0",
    // "sass": "^1.69.5"

    // ✅ 仅保留应用特定的开发依赖（如果有的话）
  }
}
```

**Step 3**：重新安装依赖（30分钟）

```bash
# 1. 清理所有 node_modules
pnpm clean

# 2. 重新安装
pnpm install

# 3. 验证依赖提升
pnpm list --depth 0
```

#### 验收标准

- [ ] 根 `package.json` 包含所有开发依赖
- [ ] 所有子应用的 `devDependencies` 为空或仅包含特定依赖
- [ ] 运行 `pnpm list --depth 0` 无版本冲突警告
- [ ] 构建和开发命令正常运行

---

### 任务 2.2：配置依赖版本检测（4小时）

**问题描述**：

虽然配置了 `pnpm.overrides`，但缺少自动化检测机制，难以及时发现版本漂移

**解决方案**：引入自动化依赖检测脚本和 CI 集成

#### 实施步骤

**Step 1**：创建依赖检测脚本（2小时）

```javascript
// scripts/check-dependencies.js

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * 检查项目中的依赖版本一致性
 */

const CRITICAL_DEPS = [
  'vue',
  'vite',
  'ant-design-vue',
  'vue-router',
  'pinia',
  'axios'
]

function getPackageVersion(packageJson, depName) {
  const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'))
  return pkg.dependencies?.[depName] || pkg.devDependencies?.[depName] || null
}

function checkDependencyConsistency() {
  const workspaces = [
    'main-app',
    'dashboard-app',
    'agent-app',
    'cluster-app',
    'monitor-app',
    'system-app',
    'image-build-app',
    'shared'
  ]

  const rootOverrides = JSON.parse(readFileSync('package.json', 'utf-8'))
    .pnpm?.overrides || {}

  let hasIssues = false

  console.log('🔍 Checking dependency consistency...\n')

  for (const dep of CRITICAL_DEPS) {
    const expectedVersion = rootOverrides[dep]
    if (!expectedVersion) {
      console.warn(`⚠️  No override defined for ${dep}`)
      continue
    }

    console.log(`📦 ${dep} (expected: ${expectedVersion})`)

    const versions = new Map()

    for (const workspace of workspaces) {
      const packageJson = resolve(workspace, 'package.json')
      const version = getPackageVersion(packageJson, dep)

      if (version) {
        versions.set(workspace, version)

        if (version !== expectedVersion) {
          console.error(`  ❌ ${workspace}: ${version} (expected ${expectedVersion})`)
          hasIssues = true
        } else {
          console.log(`  ✅ ${workspace}: ${version}`)
        }
      }
    }

    console.log('')
  }

  if (hasIssues) {
    console.error('\n❌ Dependency version issues detected!')
    console.error('Run `pnpm dedupe` to fix common issues.')
    process.exit(1)
  } else {
    console.log('✅ All dependencies are consistent!')
  }
}

// 检查重复依赖
function checkDuplicateDeps() {
  console.log('\n🔍 Checking for duplicate dependencies...\n')

  try {
    const output = execSync('pnpm list --depth 0', { encoding: 'utf-8' })
    const lines = output.split('\n')

    const depCounts = new Map()

    for (const line of lines) {
      const match = line.match(/^(.+?) (\d+\.\d+\.\d+)/)
      if (match) {
        const [, name, version] = match
        const key = name.trim()
        if (!depCounts.has(key)) {
          depCounts.set(key, [])
        }
        depCounts.get(key).push(version)
      }
    }

    let hasDuplicates = false

    for (const [name, versions] of depCounts) {
      if (new Set(versions).size > 1) {
        console.error(`❌ ${name}: multiple versions found - ${[...new Set(versions)].join(', ')}`)
        hasDuplicates = true
      }
    }

    if (hasDuplicates) {
      console.error('\n❌ Duplicate dependencies detected!')
      console.error('Run `pnpm dedupe` to resolve.')
      process.exit(1)
    } else {
      console.log('✅ No duplicate dependencies found!')
    }
  } catch (error) {
    console.error('Error checking duplicates:', error.message)
    process.exit(1)
  }
}

// 主函数
function main() {
  checkDependencyConsistency()
  checkDuplicateDeps()
}

main()
```

**Step 2**：添加 npm scripts（30分钟）

```json
// package.json（根目录）
{
  "scripts": {
    // 依赖检查
    "check:deps": "node scripts/check-dependencies.js",
    "check:deps:ci": "node scripts/check-dependencies.js --ci",
    "fix:deps": "pnpm dedupe",

    // 在构建前检查
    "prebuild": "pnpm check:deps"
  }
}
```

**Step 3**：集成到 Git Hooks（1小时）

安装 husky 并配置 pre-commit hook：

```bash
# 安装 husky
pnpm add -D husky

# 初始化
npx husky init

# 创建 pre-commit hook
echo "pnpm check:deps" > .husky/pre-commit
chmod +x .husky/pre-commit
```

**Step 4**：CI/CD 集成（30分钟）

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, feature/*]
  pull_request:
    branches: [main]

jobs:
  check-dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check dependency consistency
        run: pnpm check:deps:ci

      - name: Build all apps
        run: pnpm build
```

#### 验收标准

- [ ] 运行 `pnpm check:deps` 能检测出版本不一致
- [ ] 运行 `pnpm fix:deps` 能自动修复部分问题
- [ ] Git commit 时自动运行依赖检查
- [ ] CI 流程中依赖检查能正常运行并失败（如有问题）

---

## P3：文档补充（16小时）

### 任务 3.1：编写组件 API 文档（8小时）

**目标**：为共享库的核心组件编写完整的 API 文档

#### VxeBasicTable API 文档（3小时）

```markdown
<!-- docs/components/VxeBasicTable_API.md -->

# VxeBasicTable API 文档

## 概述

`VxeBasicTable` 是对 VXE Table 的封装，提供开箱即用的分页、加载状态、错误处理等功能。

## 基本用法

```vue
<template>
  <VxeBasicTable
    :api="loadUsers"
    :grid-options="gridOptions"
    @register="handleRegister"
  />
</template>

<script setup>
import { VxeBasicTable } from '@k8s-agent/shared/components'

const gridOptions = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '姓名', width: 120 },
    { field: 'email', title: '邮箱' }
  ]
}

async function loadUsers(params) {
  const res = await axios.get('/api/users', { params })
  return {
    data: res.data.list,
    total: res.data.total
  }
}

let tableApi
function handleRegister(api) {
  tableApi = api
}
</script>
```

## Props

### api

- **类型**: `(params: TableParams) => Promise<TableResult>`
- **必填**: 是
- **默认值**: 无
- **说明**: 数据加载函数，接收分页参数，返回数据和总数

**参数类型**:

```typescript
interface TableParams {
  page: number      // 当前页码（从 1 开始）
  pageSize: number  // 每页条数
  [key: string]: any // 其他查询参数
}

interface TableResult {
  data: any[]       // 数据列表
  total: number     // 总记录数
}
```

### gridOptions

- **类型**: `Object`
- **必填**: 是
- **默认值**: `{}`
- **说明**: VXE Table 的配置对象，支持所有 VXE Table 的 grid 选项

常用配置：

```javascript
{
  columns: [...],          // 列定义
  height: 'auto',          // 表格高度
  border: true,            // 显示边框
  stripe: true,            // 斑马纹
  resizable: true,         // 列宽可调整
  showOverflow: 'tooltip', // 内容超出显示 tooltip
  sortConfig: {            // 排序配置
    trigger: 'cell',
    remote: true
  },
  filterConfig: {          // 筛选配置
    remote: true
  }
}
```

### immediate

- **类型**: `Boolean`
- **必填**: 否
- **默认值**: `true`
- **说明**: 是否在组件挂载后立即加载数据

示例：

```vue
<!-- 手动触发加载 -->
<VxeBasicTable :api="loadData" :immediate="false" @register="api => tableApi = api" />

<button @click="tableApi.reload()">加载数据</button>
```

### pagination

- **类型**: `Object | false`
- **必填**: 否
- **默认值**: `{ pageSize: 10, pageSizes: [10, 20, 50, 100] }`
- **说明**: 分页配置，传入 `false` 禁用分页

示例：

```javascript
// 自定义分页配置
{
  pageSize: 20,
  pageSizes: [10, 20, 50],
  layout: 'total, sizes, prev, pager, next, jumper'
}

// 禁用分页
:pagination="false"
```

## Events

### register

- **参数**: `(api: TableApi) => void`
- **说明**: 注册表格 API 实例，用于外部调用表格方法

示例：

```vue
<VxeBasicTable @register="api => tableApi = api" />
```

### load-success

- **参数**: `(data: any[]) => void`
- **说明**: 数据加载成功后触发

### load-error

- **参数**: `(error: Error) => void`
- **说明**: 数据加载失败后触发

## 方法（通过 @register 获取）

### reload()

重新加载数据（清空查询条件，回到第一页）

```javascript
tableApi.reload()
```

### query(params)

使用新的查询参数加载数据（回到第一页）

```javascript
tableApi.query({ keyword: 'admin', status: 1 })
```

### refresh()

刷新当前页数据（保留查询条件和页码）

```javascript
tableApi.refresh()
```

### getQueryParams()

获取当前查询参数

```javascript
const params = tableApi.getQueryParams()
// { page: 1, pageSize: 10, keyword: 'admin' }
```

### setQueryParams(params)

设置查询参数但不加载数据

```javascript
tableApi.setQueryParams({ keyword: 'admin' })
```

## 插槽

### 工具栏插槽

```vue
<VxeBasicTable :api="loadData">
  <template #toolbar>
    <a-button type="primary" @click="handleAdd">新增</a-button>
  </template>
</VxeBasicTable>
```

### 列插槽

使用 VXE Table 的 `slots` 配置：

```javascript
gridOptions: {
  columns: [
    { field: 'name', title: '姓名', slots: { default: 'name' } },
    { field: 'action', title: '操作', slots: { default: 'action' } }
  ]
}
```

```vue
<VxeBasicTable :api="loadData" :grid-options="gridOptions">
  <template #name="{ row }">
    <a-tag color="blue">{{ row.name }}</a-tag>
  </template>

  <template #action="{ row }">
    <a-button size="small" @click="handleEdit(row)">编辑</a-button>
    <a-button size="small" danger @click="handleDelete(row)">删除</a-button>
  </template>
</VxeBasicTable>
```

## 完整示例

```vue
<template>
  <div class="user-list">
    <VxeBasicTable
      :api="loadUsers"
      :grid-options="gridOptions"
      @register="handleRegister"
      @load-success="handleLoadSuccess"
    >
      <!-- 工具栏 -->
      <template #toolbar>
        <a-space>
          <a-input v-model:value="keyword" placeholder="搜索用户" />
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
          <a-button type="primary" @click="handleAdd">新增用户</a-button>
        </a-space>
      </template>

      <!-- 自定义列 -->
      <template #avatar="{ row }">
        <a-avatar :src="row.avatar" />
      </template>

      <template #status="{ row }">
        <a-tag :color="row.status === 1 ? 'green' : 'red'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </a-tag>
      </template>

      <template #action="{ row }">
        <a-space>
          <a-button size="small" @click="handleEdit(row)">编辑</a-button>
          <a-popconfirm title="确定删除?" @confirm="handleDelete(row)">
            <a-button size="small" danger>删除</a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </VxeBasicTable>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VxeBasicTable } from '@k8s-agent/shared/components'
import { message } from 'ant-design-vue'

const keyword = ref('')
let tableApi

const gridOptions = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'avatar', title: '头像', width: 80, slots: { default: 'avatar' } },
    { field: 'name', title: '姓名', width: 120 },
    { field: 'email', title: '邮箱', width: 200 },
    { field: 'role', title: '角色', width: 100 },
    { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
    { field: 'createdAt', title: '创建时间', width: 180 },
    { field: 'action', title: '操作', width: 150, fixed: 'right', slots: { default: 'action' } }
  ],
  height: 'auto',
  border: true,
  stripe: true,
  resizable: true
}

async function loadUsers(params) {
  const res = await axios.get('/api/users', { params })
  return {
    data: res.data.list,
    total: res.data.total
  }
}

function handleRegister(api) {
  tableApi = api
}

function handleSearch() {
  tableApi.query({ keyword: keyword.value })
}

function handleReset() {
  keyword.value = ''
  tableApi.reload()
}

function handleLoadSuccess(data) {
  console.log('Loaded users:', data.length)
}

function handleAdd() {
  // 打开新增表单
}

function handleEdit(row) {
  // 打开编辑表单
}

async function handleDelete(row) {
  await axios.delete(`/api/users/${row.id}`)
  message.success('删除成功')
  tableApi.refresh()
}
</script>
```

## 常见问题

### Q1: 如何在表格外部触发刷新？

使用 `@register` 事件获取 API 实例：

```javascript
let tableApi
function handleRegister(api) {
  tableApi = api
}

// 调用
tableApi.reload()
```

### Q2: 如何实现服务端排序？

配置 `sortConfig.remote = true` 并在 `api` 函数中处理排序参数：

```javascript
async function loadData(params) {
  // params 包含 sortField 和 sortOrder
  const res = await axios.get('/api/data', {
    params: {
      ...params,
      orderBy: params.sortField,
      order: params.sortOrder
    }
  })
  return { data: res.data.list, total: res.data.total }
}
```

### Q3: 如何禁用分页？

设置 `:pagination="false"`

```vue
<VxeBasicTable :api="loadData" :pagination="false" />
```

### Q4: 如何自定义空状态？

使用 VXE Table 的 `emptyRender` 配置：

```javascript
gridOptions: {
  emptyRender: {
    name: 'AEmpty',
    props: { description: '暂无数据' }
  }
}
```

## 相关文档

- [VXE Table 完整指南](./VXE_TABLE.md)
- [VXE Table 官方文档](https://vxetable.cn/)
```

#### VbenLayout API 文档（2小时）

创建 `docs/components/VbenLayout_API.md`（内容略，结构类似）

#### RouteSync API 文档（2小时）

创建 `docs/architecture/RouteSync_API.md`（内容略，结构类似）

#### SharedStateManager API 文档（1小时）

创建 `docs/architecture/SharedStateManager_API.md`（内容略，结构类似）

---

### 任务 3.2：创建 CHANGELOG.md（4小时）

```markdown
<!-- CHANGELOG.md -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- 样式系统重构（统一全局样式导入）
- 依赖管理优化（提升开发依赖至根目录）
- 性能优化（共享库按需加载、图片优化）

## [1.0.0] - 2025-10-08

### Added

#### Feature 002: 微前端通信与状态管理优化
- **集中式配置系统** (`main-app/src/config/micro-apps.config.js`)
  - 单一数据源管理所有 6 个微应用配置
  - 环境感知 URL 解析（development/production/test）
  - JSON Schema 验证（`config/micro-apps.schema.json`）
  - 端口冲突和路径冲突自动检测

- **RouteSync 路由同步类** (`shared/src/core/route-sync.js`)
  - 50ms 防抖机制避免事件风暴
  - 标准化事件协议（source/target/path/meta）
  - 自动错误处理和重试逻辑
  - 替代旧的 setTimeout 方案

- **SharedStateManager 跨应用状态管理** (`main-app/src/store/shared-state.js`)
  - 响应式状态同步（基于 Vue reactive）
  - 命名空间隔离（user/notification/permission/system）
  - 可选 localStorage 持久化
  - 自动内存清理

- **ErrorBoundary 错误边界** (`main-app/src/views/ErrorBoundary.vue`)
  - 微应用加载失败不影响主应用
  - 5 秒超时检测
  - 用户友好的错误提示 + 重试按钮

#### Feature 001: 共享组件库
- VxeBasicTable 高级表格组件
- VbenLayout 主布局组件
- BasicForm/BasicModal/BasicDrawer 基础组件

### Fixed

- **动态路由空白页问题** (`main-app/src/router/dynamic.js`)
  - 修复 `dynamic.js` 使用空 div 导致子路由白屏
  - 使用真实 `MicroAppContainer` 组件替换占位符
  - 直接访问 `/system/users` 等路由现正常显示

- **VXE Table 树形图标不显示** (`system-app/src/styles/vxe-table-tree-icon.scss`)
  - 强制使用 anticon 字体家族
  - 修复 Wujie Shadow DOM 环境下图标丢失

- **HTTP Proxy 阻塞 localhost** (`dev.sh`)
  - dev.sh 脚本自动禁用 http_proxy 环境变量
  - 避免系统代理拦截 localhost 请求导致 404/502

### Changed

- **从 qiankun 迁移到 Wujie 微前端框架**
  - 移除 `vite-plugin-qiankun` 和复杂的生命周期代码
  - 微应用简化为标准 Vue 3 应用（无需特殊配置）
  - 加载时间从 ~3000ms 降至 < 500ms
  - 无 Bootstrap 超时问题

- **共享库构建优化** (`shared/vite.config.js`)
  - 从 UMD 改为 ESM 库模式
  - `preserveModules: true` 支持更好的 tree-shaking
  - 构建时间从 2000ms 降至 519ms

### Deprecated

- **旧的路由同步方案**（基于 setTimeout）
  - 已被 RouteSync 类替代
  - 保留降级兼容但不再推荐使用

---

## [0.9.0] - 2025-09-20

### Added
- 初始 qiankun 微前端架构
- 6 个微应用（Dashboard/Agent/Cluster/Monitor/System/ImageBuild）
- 共享组件库雏形

### Known Issues
- qiankun Bootstrap 超时频繁（4000ms）
- 构建产物体积过大（UMD 格式）
- 路由同步不稳定

---

## [0.1.0] - 2025-08-10

### Added
- 项目初始化
- 基础目录结构
- Vite + Vue 3 + Ant Design Vue 技术栈

---

## 版本规范

### 版本号格式
- **MAJOR.MINOR.PATCH**（如 1.2.3）
- **MAJOR**：不兼容的 API 变更
- **MINOR**：向后兼容的功能新增
- **PATCH**：向后兼容的问题修复

### 变更类型
- **Added**：新增功能
- **Changed**：既有功能的变更
- **Deprecated**：即将废弃的功能
- **Removed**：已移除的功能
- **Fixed**：问题修复
- **Security**：安全漏洞修复

### 发布流程
1. 更新 `CHANGELOG.md` 的 `[Unreleased]` 章节
2. 创建新版本号章节
3. 更新根 `package.json` 的 `version` 字段
4. 创建 Git Tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
5. 推送 Tag: `git push origin v1.0.0`
```

---

### 任务 3.3：编写 API 接口文档（4小时）

创建 `docs/api/` 目录，为每个微应用编写接口文档：

```markdown
<!-- docs/api/system-app-api.md -->

# System App API 文档

## 用户管理

### 获取用户列表

**接口**: `GET /api/system/users`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码（默认 1） |
| pageSize | number | 否 | 每页条数（默认 10） |
| keyword | string | 否 | 搜索关键字（姓名/邮箱） |
| status | number | 否 | 状态筛选（1=启用, 0=禁用） |
| roleId | number | 否 | 角色ID筛选 |

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "name": "管理员",
        "email": "admin@example.com",
        "avatar": "/avatar/admin.png",
        "status": 1,
        "roleId": 1,
        "roleName": "超级管理员",
        "createdAt": "2025-01-01 10:00:00",
        "updatedAt": "2025-01-15 15:30:00"
      }
    ],
    "total": 100
  }
}
```

### 创建用户

**接口**: `POST /api/system/users`

**请求体**:

```json
{
  "username": "user001",
  "name": "张三",
  "email": "user001@example.com",
  "password": "password123",
  "roleId": 2,
  "status": 1
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 101
  }
}
```

### 更新用户

**接口**: `PUT /api/system/users/:id`

（省略详细内容...）

### 删除用户

**接口**: `DELETE /api/system/users/:id`

（省略详细内容...）

---

## 角色管理

### 获取角色列表

**接口**: `GET /api/system/roles`

（省略详细内容...）

---

## 权限管理

（省略详细内容...）
```

同样创建其他微应用的 API 文档：

- `docs/api/dashboard-app-api.md`
- `docs/api/agent-app-api.md`
- `docs/api/cluster-app-api.md`
- `docs/api/monitor-app-api.md`
- `docs/api/image-build-app-api.md`

---

## P3：性能优化（24小时）

### 任务 4.1：共享库按需加载（8小时）

**目标**：细化共享库导出粒度，支持单个组件独立导入

#### 实施步骤

**Step 1**：重构 package.json exports（2小时）

```json
// shared/package.json
{
  "exports": {
    // 原有导出（保留向后兼容）
    ".": "./dist/index.js",
    "./components": "./dist/components.js",

    // 新增：单个组件导出
    "./components/VxeBasicTable": {
      "import": "./dist/components/vxe-table/VxeBasicTable.js",
      "style": "./dist/components/vxe-table/VxeBasicTable.css"
    },
    "./components/VbenLayout": {
      "import": "./dist/components/layout/VbenLayout.js",
      "style": "./dist/components/layout/VbenLayout.css"
    },
    "./components/BasicForm": {
      "import": "./dist/components/form/BasicForm.js",
      "style": "./dist/components/form/BasicForm.css"
    },
    "./components/BasicModal": {
      "import": "./dist/components/modal/BasicModal.js",
      "style": "./dist/components/modal/BasicModal.css"
    },
    "./components/BasicDrawer": {
      "import": "./dist/components/drawer/BasicDrawer.js",
      "style": "./dist/components/drawer/BasicDrawer.css"
    },

    // Composables 单独导出
    "./composables/useTable": "./dist/composables/useTable.js",
    "./composables/usePagination": "./dist/composables/usePagination.js",
    "./composables/useSharedState": "./dist/composables/useSharedState.js"
  }
}
```

**Step 2**：优化 Vite 构建配置（2小时）

```javascript
// shared/vite.config.js
export default defineConfig({
  build: {
    lib: {
      entry: {
        // 自动扫描所有组件作为入口
        ...generateComponentEntries(),

        // 核心入口
        index: './src/index.js',
        components: './src/components/index.js',
        composables: './src/composables/index.js'
      },
      formats: ['es']
    },

    rollupOptions: {
      output: {
        // 保留模块结构
        preserveModules: true,
        preserveModulesRoot: 'src',

        // 每个组件独立输出 CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'components/[name].css'
          }
          return 'assets/[name].[ext]'
        }
      }
    }
  }
})

// 自动生成组件入口
function generateComponentEntries() {
  const components = glob.sync('src/components/**/*.vue')
  const entries = {}

  for (const comp of components) {
    const name = comp.replace('src/components/', '').replace('.vue', '')
    entries[`components/${name}`] = comp
  }

  return entries
}
```

**Step 3**：更新使用方式（2小时）

```vue
<!-- ❌ 旧方式：导入整个 components 模块 -->
<script>
import { VxeBasicTable, BasicForm } from '@k8s-agent/shared/components'
</script>

<!-- ✅ 新方式：按需导入单个组件 -->
<script>
import VxeBasicTable from '@k8s-agent/shared/components/VxeBasicTable'
import '@k8s-agent/shared/components/VxeBasicTable/style'  // 样式按需导入
</script>
```

**Step 4**：配置自动按需导入（2小时）

使用 `unplugin-vue-components` 实现自动按需导入：

```javascript
// 各微应用的 vite.config.js
import Components from 'unplugin-vue-components/vite'
import { SharedComponentsResolver } from './config/shared-components-resolver'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [SharedComponentsResolver()]
    })
  ]
})
```

```javascript
// config/shared-components-resolver.js
export function SharedComponentsResolver() {
  return {
    type: 'component',
    resolve: (name) => {
      // VxeBasicTable -> @k8s-agent/shared/components/VxeBasicTable
      if (name.startsWith('Vxe')) {
        return {
          name,
          from: `@k8s-agent/shared/components/${name}`,
          sideEffects: `@k8s-agent/shared/components/${name}/style`
        }
      }

      // BasicForm -> @k8s-agent/shared/components/BasicForm
      if (name.startsWith('Basic')) {
        return {
          name,
          from: `@k8s-agent/shared/components/${name}`,
          sideEffects: `@k8s-agent/shared/components/${name}/style`
        }
      }

      // VbenLayout -> @k8s-agent/shared/components/VbenLayout
      if (name === 'VbenLayout') {
        return {
          name,
          from: '@k8s-agent/shared/components/VbenLayout',
          sideEffects: '@k8s-agent/shared/components/VbenLayout/style'
        }
      }
    }
  }
}
```

#### 验收标准

- [ ] 导入单个组件时，构建产物仅包含该组件代码
- [ ] 首屏加载 JS 体积减少 > 50KB
- [ ] 所有组件支持自动按需导入

**预期收益**：首屏 JS 减少 50-100KB

---

### 任务 4.2：图片资源优化（8小时）

#### Step 1：配置 Vite 图片优化插件（2小时）

```bash
# 安装依赖
pnpm add -D vite-plugin-imagemin vite-svg-loader
```

```javascript
// 各微应用的 vite.config.js
import imagemin from 'vite-plugin-imagemin'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [
    // SVG 作为组件导入
    svgLoader(),

    // 图片压缩
    imagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
})
```

#### Step 2：SVG 组件化改造（3小时）

```vue
<!-- ❌ 旧方式：img 标签加载 SVG -->
<img src="@/assets/icons/user.svg" />

<!-- ✅ 新方式：SVG 作为组件导入 -->
<script setup>
import IconUser from '@/assets/icons/user.svg?component'
</script>

<template>
  <IconUser class="icon" />
</template>

<style scoped>
.icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}
</style>
```

#### Step 3：WebP 格式支持（3小时）

```javascript
// 生成 WebP 备选格式
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    assetsInlineLimit: 4096,  // 4KB 以下内联

    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 图片资源统一放到 images 目录
          const extType = assetInfo.name.split('.').at(1)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `images/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    }
  }
})
```

创建工具脚本自动生成 WebP：

```javascript
// scripts/generate-webp.js
import sharp from 'sharp'
import glob from 'fast-glob'

async function generateWebP() {
  const images = await glob('**/src/assets/**/*.{png,jpg,jpeg}', {
    ignore: ['**/node_modules/**']
  })

  for (const img of images) {
    const outputPath = img.replace(/\.(png|jpe?g)$/, '.webp')
    await sharp(img).webp({ quality: 80 }).toFile(outputPath)
    console.log(`✅ Generated ${outputPath}`)
  }
}

generateWebP()
```

#### 验收标准

- [ ] 所有 PNG/JPG 图片自动压缩 > 30%
- [ ] SVG 图标作为组件导入，减少 HTTP 请求
- [ ] 生成 WebP 备选格式，支持现代浏览器

**预期收益**：图片体积减少 40-60%

---

### 任务 4.3：Vite 构建配置优化（8小时）

#### 代码分割优化（3小时）

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // ✅ 手动代码分割
        manualChunks(id) {
          // Ant Design Vue 单独打包
          if (id.includes('ant-design-vue')) {
            return 'ant-design'
          }

          // VXE Table 单独打包
          if (id.includes('vxe-table')) {
            return 'vxe-table'
          }

          // Vue 生态系统
          if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
            return 'vue-vendor'
          }

          // Axios
          if (id.includes('axios')) {
            return 'axios'
          }

          // 第三方库
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },

    // ✅ 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // 移除 console
        drop_debugger: true,     // 移除 debugger
        pure_funcs: ['console.log']  // 移除特定函数调用
      }
    },

    // ✅ CSS 代码分割
    cssCodeSplit: true,

    // ✅ 资源内联阈值
    assetsInlineLimit: 4096,  // 4KB 以下转 base64

    // ✅ Chunk 大小警告阈值
    chunkSizeWarningLimit: 1000  // 1MB
  }
})
```

#### 依赖预构建优化（2小时）

```javascript
export default defineConfig({
  optimizeDeps: {
    // ✅ 强制预构建的依赖
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'dayjs',
      'ant-design-vue',
      '@ant-design/icons-vue',
      'vxe-table',
      'xe-utils'
    ],

    // ✅ 排除不需要预构建的依赖
    exclude: [
      '@k8s-agent/shared'  // 本地 workspace 包无需预构建
    ]
  }
})
```

#### 启用 Gzip/Brotli 压缩（3小时）

```bash
# 安装插件
pnpm add -D vite-plugin-compression
```

```javascript
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // Gzip 压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,  // 10KB 以上才压缩
      deleteOriginFile: false
    }),

    // Brotli 压缩（更高压缩率）
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    })
  ]
})
```

配置 Nginx 支持：

```nginx
# nginx.conf
http {
  # Gzip 配置
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
  gzip_vary on;

  # Brotli 配置（需安装 ngx_brotli 模块）
  brotli on;
  brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### 验收标准

- [ ] 首屏 JS 拆分为 5+ 个 chunk（ant-design/vxe-table/vue-vendor/vendor/app）
- [ ] 单个 chunk 大小 < 1MB
- [ ] 生产构建包含 `.gz` 和 `.br` 压缩文件
- [ ] Lighthouse 性能评分 > 90

**预期收益**：

- 首屏加载时间减少 30-50%
- 资源体积（Gzip 后）减少 40-60%

---

## 总结与时间规划

### 总工时估算

| 优先级 | 任务 | 工时 | 责任人 | 开始日期 |
|--------|------|------|--------|---------|
| **P1** | 样式统一导入 | 4h | 前端 A | 2025-10-14 |
| **P1** | 提取共享全局样式 | 6h | 前端 A | 2025-10-15 |
| **P2** | 提升开发依赖 | 2h | 前端 B | 2025-10-16 |
| **P2** | 依赖版本检测 | 4h | 前端 B | 2025-10-17 |
| **P3** | 组件 API 文档 | 8h | 前端 C | 2025-10-18 |
| **P3** | CHANGELOG 编写 | 4h | 项目经理 | 2025-10-19 |
| **P3** | API 接口文档 | 4h | 后端 + 前端 | 2025-10-20 |
| **P3** | 共享库按需加载 | 8h | 前端 A | 2025-10-23 |
| **P3** | 图片资源优化 | 8h | 前端 B | 2025-10-24 |
| **P3** | Vite 构建优化 | 8h | 前端 C | 2025-10-25 |
| **总计** | | **56h** | | |

### 里程碑节点

- **第 1 周（10.14 - 10.18）**：完成 P1 + P2 任务
  - ✅ 样式系统重构完成
  - ✅ 依赖管理优化完成

- **第 2 周（10.21 - 10.25）**：完成 P3 文档任务
  - ✅ 组件 API 文档齐全
  - ✅ CHANGELOG 创建
  - ✅ API 接口文档完善

- **第 3-4 周（10.28 - 11.08）**：完成 P3 性能优化
  - ✅ 共享库按需加载
  - ✅ 图片资源优化
  - ✅ Vite 构建配置优化

### 验收指标

| 指标 | 当前值 | 目标值 | 验收方式 |
|------|--------|--------|---------|
| CSS 冗余体积 | ~1.2MB | 0 | 构建产物分析 |
| 首屏 JS 体积 | ~800KB | <500KB | Lighthouse 报告 |
| 依赖版本一致性 | 60% | 100% | `pnpm check:deps` |
| 文档覆盖率 | 30% | 90% | 人工审查 |
| Lighthouse 性能分 | 75 | 90+ | Lighthouse CI |
| 首屏加载时间 | ~3s | <1.5s | WebPageTest |

---

**文档维护**：本计划每两周更新一次，根据实际执行情况调整优先级和工时。
