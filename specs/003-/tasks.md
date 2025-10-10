# Implementation Tasks: 项目结构优化 - 文档重组与配置标准化

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Branch**: `003-` | **Created**: 2025-10-10

## Overview

本feature包含4个用户故事，按优先级组织实施：
- **P1**: User Story 1 (文档重组) + User Story 2 (API配置统一)
- **P2**: User Story 3 (依赖版本统一)
- **P3**: User Story 4 (样式变量系统)

每个用户故事独立可测试，可并行开发。

---

## Phase 1: Setup & Infrastructure

### T001: 创建feature分支并配置Git备份 [Foundational]

**Purpose**: 建立安全的开发环境,为文档重组创建回滚点

**Steps**:
```bash
# 1. 创建备份分支
git checkout main
git checkout -b backup-docs-before-003
git push origin backup-docs-before-003

# 2. 创建feature分支
git checkout main
git checkout -b feature/003-project-optimization
```

**Acceptance**:
- ✅ 备份分支 `backup-docs-before-003` 已创建并推送到远程
- ✅ Feature分支 `feature/003-project-optimization` 已创建

---

### T002: 创建shared库配置基础设施 [Foundational]

**Purpose**: 为API配置、Wujie生命周期、样式变量提供存放位置

**Files to create**:
```bash
mkdir -p shared/src/config
mkdir -p shared/src/utils
mkdir -p shared/src/assets/styles
touch shared/src/config/.gitkeep
touch shared/src/utils/.gitkeep
touch shared/src/assets/styles/.gitkeep
```

**Acceptance**:
- ✅ `shared/src/config/` 目录已创建
- ✅ `shared/src/utils/` 目录已创建
- ✅ `shared/src/assets/styles/` 目录已创建

---

### T003: 配置pnpm依赖提升策略 [Foundational]

**Purpose**: 优化node_modules大小,为依赖版本统一做准备

**File**: `.npmrc` (根目录)

**Content**:
```ini
# 提升Vue生态依赖
public-hoist-pattern[]=*vue*
public-hoist-pattern[]=*pinia*
public-hoist-pattern[]=*@vue/*

# 提升Ant Design Vue
public-hoist-pattern[]=*ant-design-vue*
public-hoist-pattern[]=*@ant-design/*

# 提升Wujie
public-hoist-pattern[]=wujie*

# 提升工具库
public-hoist-pattern[]=axios
public-hoist-pattern[]=dayjs

# 提升VXE Table
public-hoist-pattern[]=vxe-table*
public-hoist-pattern[]=xe-utils

# 其他配置
strict-peer-dependencies=false
shared-workspace-lockfile=true
symlink=true
engine-strict=false
```

**Acceptance**:
- ✅ `.npmrc` 文件已创建
- ✅ 配置包含9类依赖提升规则

**Next**: T004 (重新安装依赖验证提升效果)

---

## Phase 2: User Story 1 - 快速定位所需文档 (P1)

**Story Goal**: 开发者能在3次点击内找到相关文档,文档数量从108个减少至30个以内

**Independent Test**: 随机选择历史问题(如"微应用加载超时"),测试开发者能否在3分钟内通过 `docs/` 目录定位到解决方案

---

### T004: 创建docs目录结构 [Story: US1]

**Purpose**: 为文档重组创建目标目录结构

**Steps**:
```bash
mkdir -p docs/architecture
mkdir -p docs/features
mkdir -p docs/troubleshooting/archived
mkdir -p docs/components
```

**Acceptance**:
- ✅ 4个分类目录已创建
- ✅ `archived/` 子目录已创建

---

### T005: 迁移架构设计类文档 (8个) [Story: US1] [P]

**Purpose**: 整理Wujie迁移和架构设计相关文档

**Source → Target mapping**:
```bash
# 根目录 → docs/architecture/
WUJIE_MIGRATION_COMPLETE.md → docs/architecture/wujie-migration-complete.md
MIGRATION_TO_WUJIE.md → docs/architecture/migration-to-wujie.md
ROOT_CAUSE_ANALYSIS.md → docs/architecture/root-cause-analysis.md
SHARED_COMPONENTS_MIGRATION.md → docs/architecture/shared-components-migration.md
PROXY_ISSUE_FIX.md → docs/troubleshooting/archived/proxy-issue-fix.md
DYNAMIC_MENU_GUIDE.md → docs/architecture/dynamic-menu-guide.md
SUBMENU_GUIDE.md → docs/architecture/submenu-guide.md

# main-app/ → docs/architecture/
main-app/DYNAMIC_ROUTES.md → docs/architecture/dynamic-routes.md
```

**Steps**:
```bash
git mv WUJIE_MIGRATION_COMPLETE.md docs/architecture/wujie-migration-complete.md
git mv MIGRATION_TO_WUJIE.md docs/architecture/migration-to-wujie.md
git mv ROOT_CAUSE_ANALYSIS.md docs/architecture/root-cause-analysis.md
git mv SHARED_COMPONENTS_MIGRATION.md docs/architecture/shared-components-migration.md
git mv PROXY_ISSUE_FIX.md docs/troubleshooting/archived/proxy-issue-fix.md
git mv DYNAMIC_MENU_GUIDE.md docs/architecture/dynamic-menu-guide.md
git mv SUBMENU_GUIDE.md docs/architecture/submenu-guide.md
git mv main-app/DYNAMIC_ROUTES.md docs/architecture/dynamic-routes.md
```

**Acceptance**:
- ✅ 8个文档已迁移到正确位置
- ✅ Git历史保留(使用git mv)

---

### T006: 迁移功能使用类文档 (12个) [Story: US1] [P]

**Purpose**: 整理开发指南和功能文档

**Source → Target mapping**:
```bash
QUICK_START.md → docs/features/quick-start.md
START_GUIDE.md → docs/features/start-guide.md
MAKEFILE_GUIDE.md → docs/features/makefile-guide.md
COMPONENTS_GUIDE.md → docs/components/components-guide.md
MOCK_GUIDE.md → docs/features/mock-guide.md
SUB_APPS_MOCK_GUIDE.md → docs/features/sub-apps-mock-guide.md
# ... (根据实际文件列表继续)
```

**Steps**:
```bash
git mv QUICK_START.md docs/features/quick-start.md
git mv START_GUIDE.md docs/features/start-guide.md
git mv MAKEFILE_GUIDE.md docs/features/makefile-guide.md
git mv COMPONENTS_GUIDE.md docs/components/components-guide.md
git mv MOCK_GUIDE.md docs/features/mock-guide.md
git mv SUB_APPS_MOCK_GUIDE.md docs/features/sub-apps-mock-guide.md
```

**Acceptance**:
- ✅ 功能文档已迁移到 `docs/features/`
- ✅ 组件文档已迁移到 `docs/components/`

---

### T007: 迁移故障排查类文档 (3个) [Story: US1] [P]

**Purpose**: 整理故障排查和调试文档

**Source → Target mapping**:
```bash
TROUBLESHOOTING.md → docs/troubleshooting/troubleshooting.md
COMMON_ISSUES.md → docs/troubleshooting/common-issues.md
DEBUG_GUIDE.md → docs/troubleshooting/debug-guide.md
```

**Steps**:
```bash
git mv TROUBLESHOOTING.md docs/troubleshooting/troubleshooting.md
git mv COMMON_ISSUES.md docs/troubleshooting/common-issues.md
git mv DEBUG_GUIDE.md docs/troubleshooting/debug-guide.md
```

**Acceptance**:
- ✅ 3个文档已迁移到 `docs/troubleshooting/`

---

### T008: 合并VXE Table相关文档 [Story: US1]

**Purpose**: 将shared目录下7个VXE_TABLE文档合并为单一文档

**Source files** (在 `shared/` 目录):
- VXE_TABLE_GUIDE.md
- VXE_TABLE_API.md
- VXE_TABLE_EXAMPLES.md
- ... (其他VXE_TABLE_*.md)

**Target**: `docs/components/vxe-table.md`

**Steps**:
1. 创建 `docs/components/vxe-table.md`
2. 合并所有VXE_TABLE_*.md内容,按章节组织:
   - 概述 (从VXE_TABLE_GUIDE.md)
   - API参考 (从VXE_TABLE_API.md)
   - 使用示例 (从VXE_TABLE_EXAMPLES.md)
   - 常见问题
3. 删除原始文件:
   ```bash
   git rm shared/VXE_TABLE_*.md
   ```

**Acceptance**:
- ✅ `docs/components/vxe-table.md` 已创建
- ✅ 包含所有VXE Table相关内容
- ✅ 原始分散文件已删除

---

### T009: 创建docs/README.md索引文件 [Story: US1]

**Purpose**: 提供文档导航入口,整合QUICK_START/QUICKSTART/START_GUIDE内容

**File**: `docs/README.md`

**Content structure**:
```markdown
# K8s Agent Web - 文档中心

## 快速开始
(整合QUICK_START.md + START_GUIDE.md内容)

## 架构设计
- [Wujie迁移完整文档](architecture/wujie-migration-complete.md)
- [Wujie迁移步骤](architecture/migration-to-wujie.md)
- ... (列出所有architecture文档)

## 功能使用
- [快速开始](features/quick-start.md)
- [Makefile指南](features/makefile-guide.md)
- ... (列出所有features文档)

## 故障排查
- [故障排查指南](troubleshooting/troubleshooting.md)
- [常见问题](troubleshooting/common-issues.md)
- ...

## 组件文档
- [VXE Table使用指南](components/vxe-table.md)
- [组件总览](components/components-guide.md)
```

**Acceptance**:
- ✅ `docs/README.md` 已创建
- ✅ 包含所有4个分类的文档链接
- ✅ 快速开始部分整合了原QUICK_START内容

---

### T010: 更新CLAUDE.md文档路径引用 [Story: US1]

**Purpose**: 修复CLAUDE.md中所有旧文档路径引用

**File**: `CLAUDE.md`

**Changes**:
- 替换所有根目录文档引用 → `docs/` 路径
- 示例:
  ```markdown
  # Before
  See WUJIE_MIGRATION_COMPLETE.md for details

  # After
  See [Wujie迁移文档](docs/architecture/wujie-migration-complete.md) for details
  ```

**Steps**:
1. 搜索CLAUDE.md中所有 `.md` 文件引用
2. 更新为新路径
3. 使用相对路径引用

**Acceptance**:
- ✅ CLAUDE.md中所有文档链接已更新
- ✅ 链接指向正确的docs/路径
- ✅ 无失效链接

---

### T011: 提交文档重组变更 [Story: US1]

**Purpose**: 一次性提交所有文档迁移变更

**Steps**:
```bash
git add docs/
git add .npmrc
git rm <删除的文件列表>
git commit -m "docs: 重组文档结构 (Feature 003 - User Story 1)

- 创建docs/目录,分为architecture/features/troubleshooting/components
- 迁移108个MD文件至30个分类文档
- 合并VXE Table相关文档
- 更新CLAUDE.md文档路径引用

Relates-to: #003
"
```

**Acceptance**:
- ✅ 单个commit包含所有文档迁移
- ✅ Commit message清晰描述变更
- ✅ 无中间状态commit

---

### 📊 User Story 1 Checkpoint

**验收标准**:
- ✅ SC-001: 文档数量从108个减少至30个以内
- ✅ SC-002: 新成员查找文档时间从10分钟降至3分钟

**独立测试**:
```bash
# 1. 验证文档数量
find docs/ -name "*.md" | wc -l  # 应 ≤ 30

# 2. 验证根目录清理
find . -maxdepth 1 -name "*.md" | wc -l  # 应 ≤ 5 (README/CLAUDE/LICENSE等)

# 3. 验证分类正确
ls docs/architecture/ | wc -l  # 应有架构文档
ls docs/troubleshooting/archived/ | grep -i "fix"  # 应有历史修复文档

# 4. 验证链接有效性
grep -r "\.md" CLAUDE.md | grep -v "docs/"  # 应无输出(所有链接已更新)
```

**Parallel execution**:
- T005, T006, T007 可并行执行(操作不同文件)
- T008 可独立执行
- T009, T010 依赖文档迁移完成

---

## Phase 3: User Story 2 - 统一API调用行为 (P1)

**Story Goal**: 所有微应用使用统一的API配置,避免配置不一致导致的bug

**Independent Test**: 在所有微应用中调用同一个API端点,验证请求路径、超时时间、错误处理行为完全一致

---

### T012: 创建API配置常量 [Story: US2]

**Purpose**: 定义统一的API配置(FR-006)

**File**: `shared/src/config/api.config.js`

**Content** (参考 `contracts/api-config.contract.md`):
```javascript
/**
 * API统一配置
 */
export const ApiConfig = {
  baseURL: {
    development: 'http://localhost:8080/api',
    test: 'https://test-api.k8s-agent.com',
    production: 'https://api.k8s-agent.com'
  },

  timeout: 10000, // 10秒

  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatus: [408, 429, 500, 502, 503, 504]
  },

  headers: {
    common: {
      'Content-Type': 'application/json;charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    authenticated: {
      'Authorization': null // 运行时注入
    }
  },

  errorHandling: {
    showGlobalMessage: true,
    ignoredErrorCodes: [401, 403],
    customMessages: {
      401: '登录已过期,请重新登录',
      403: '无权访问此资源',
      404: '请求的资源不存在',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用'
    }
  }
}

/**
 * 获取当前环境的baseURL
 */
export function getBaseURL(env = import.meta.env.MODE) {
  return ApiConfig.baseURL[env] || ApiConfig.baseURL.development
}
```

**Acceptance**:
- ✅ `ApiConfig` 对象包含baseURL/timeout/retry/headers/errorHandling
- ✅ `getBaseURL()` 函数支持环境变量

---

### T013: 实现createAxiosInstance工厂函数 [Story: US2]

**Purpose**: 创建统一的axios实例工厂(FR-007, FR-010)

**File**: `shared/src/config/api.config.js` (继续)

**Content**:
```javascript
import axios from 'axios'
import { message } from 'ant-design-vue'

/**
 * 创建预配置的Axios实例
 */
export function createAxiosInstance(options = {}) {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: ApiConfig.timeout,
    headers: ApiConfig.headers.common,
    ...options
  })

  // 请求拦截器: 注入token
  instance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => Promise.reject(error)
  )

  // 响应拦截器: 错误处理 + 重试
  instance.interceptors.response.use(
    response => response,
    async error => {
      const config = error.config
      if (!config || !config.retry) {
        config.retry = { count: 0 }
      }

      // 自动重试
      if (
        ApiConfig.retry.retryableStatus.includes(error.response?.status) &&
        config.retry.count < ApiConfig.retry.maxRetries
      ) {
        config.retry.count++
        await new Promise(resolve => setTimeout(resolve, ApiConfig.retry.retryDelay))
        return instance(config)
      }

      // 401处理: 自动登出
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }

      // 全局错误提示
      if (
        ApiConfig.errorHandling.showGlobalMessage &&
        !ApiConfig.errorHandling.ignoredErrorCodes.includes(error.response?.status)
      ) {
        const msg = ApiConfig.errorHandling.customMessages[error.response?.status] || '请求失败'
        message.error(msg)
      }

      return Promise.reject(error)
    }
  )

  return instance
}
```

**Acceptance**:
- ✅ 函数返回配置好的axios实例
- ✅ 自动注入token
- ✅ 401自动跳转登录
- ✅ 支持自动重试
- ✅ 全局错误提示

---

### T014: 更新shared库package.json导出配置 [Story: US2]

**Purpose**: 暴露API配置给其他应用

**File**: `shared/package.json`

**Changes**:
```json
{
  "exports": {
    "./config/api.config.js": "./src/config/api.config.js",
    // ... 其他exports
  }
}
```

**Acceptance**:
- ✅ API配置可通过 `@k8s-agent/shared/config/api.config.js` 导入

---

### T015: 迁移main-app的API配置 [Story: US2]

**Purpose**: 统一主应用的API调用(FR-008)

**File to modify**: `main-app/src/utils/request.js` (或 `main-app/src/api/request.js`)

**Before**:
```javascript
// ❌ 旧代码
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

**After**:
```javascript
// ✅ 新代码
import { createAxiosInstance } from '@k8s-agent/shared/config/api.config.js'

const api = createAxiosInstance()

export default api
```

**Acceptance**:
- ✅ 删除自定义axios实例创建代码
- ✅ 使用 `createAxiosInstance()`
- ✅ 保持对外导出接口不变

---

### T016: 迁移dashboard-app的API配置 [Story: US2] [P]

**Purpose**: 统一dashboard-app的API调用(FR-008)

**File**: `dashboard-app/src/utils/request.js`

**Steps**: 同T015

**Acceptance**: 同T015

---

### T017: 迁移agent-app的API配置 [Story: US2] [P]

**Purpose**: 统一agent-app的API调用(FR-008)

**File**: `agent-app/src/utils/request.js`

**Steps**: 同T015

**Acceptance**: 同T015

---

### T018: 迁移cluster-app的API配置 [Story: US2] [P]

**Purpose**: 统一cluster-app的API调用(FR-008)

**File**: `cluster-app/src/utils/request.js`

**Steps**: 同T015

**Acceptance**: 同T015

---

### T019: 迁移monitor-app的API配置 [Story: US2] [P]

**Purpose**: 统一monitor-app的API调用(FR-008)

**File**: `monitor-app/src/utils/request.js`

**Steps**: 同T015

**Acceptance**: 同T015

---

### T020: 迁移system-app的API配置 [Story: US2] [P]

**Purpose**: 统一system-app的API调用(FR-008)

**File**: `system-app/src/utils/request.js`

**Steps**: 同T015

**Acceptance**: 同T015

---

### T021: 迁移image-build-app的API配置 [Story: US2] [P]

**Purpose**: 统一image-build-app的API调用(FR-008)

**File**: `image-build-app/src/utils/request.js`

**Steps**: 同T015

**Acceptance**: 同T015

---

### T022: 添加API配置单元测试 [Story: US2]

**Purpose**: 验证API配置和createAxiosInstance行为

**File**: `shared/src/config/api.config.test.js`

**Content**:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { getBaseURL, createAxiosInstance, ApiConfig } from './api.config.js'

describe('ApiConfig', () => {
  it('should return correct baseURL for each environment', () => {
    expect(getBaseURL('development')).toBe('http://localhost:8080/api')
    expect(getBaseURL('production')).toBe('https://api.k8s-agent.com')
  })

  it('should create axios instance with default config', () => {
    const api = createAxiosInstance()
    expect(api.defaults.timeout).toBe(ApiConfig.timeout)
    expect(api.defaults.baseURL).toBe(getBaseURL())
  })

  it('should allow custom config override', () => {
    const api = createAxiosInstance({ timeout: 5000 })
    expect(api.defaults.timeout).toBe(5000)
  })

  it('should inject Authorization header when token exists', async () => {
    localStorage.setItem('token', 'test-token')
    const api = createAxiosInstance()

    const mockAdapter = vi.fn()
    api.interceptors.request.use(mockAdapter)

    await api.get('/test')
    expect(mockAdapter).toHaveBeenCalled()
    expect(mockAdapter.mock.calls[0][0].headers.Authorization).toBe('Bearer test-token')
  })
})
```

**Acceptance**:
- ✅ 测试覆盖 `getBaseURL()` 函数
- ✅ 测试覆盖 `createAxiosInstance()` 函数
- ✅ 测试token注入逻辑
- ✅ 所有测试通过

---

### T023: 提交API配置统一变更 [Story: US2]

**Purpose**: 提交所有API配置相关代码

**Steps**:
```bash
git add shared/src/config/api.config.js
git add shared/src/config/api.config.test.js
git add shared/package.json
git add main-app/src/utils/request.js
git add dashboard-app/src/utils/request.js
git add agent-app/src/utils/request.js
git add cluster-app/src/utils/request.js
git add monitor-app/src/utils/request.js
git add system-app/src/utils/request.js
git add image-build-app/src/utils/request.js

git commit -m "feat: 统一API配置 (Feature 003 - User Story 2)

- 创建shared/src/config/api.config.js统一配置
- 实现createAxiosInstance工厂函数
- 统一7个应用的axios实例创建
- 添加自动重试、错误处理、token注入逻辑
- 添加单元测试验证

Relates-to: #003
"
```

**Acceptance**:
- ✅ 所有API配置变更已提交
- ✅ Commit message清晰

---

### 📊 User Story 2 Checkpoint

**验收标准**:
- ✅ SC-003: 所有7个应用的API请求配置一致性达到100%

**独立测试**:
```bash
# 1. 验证所有应用使用createAxiosInstance
grep -r "createAxiosInstance" */src/utils/request.js | wc -l  # 应 = 7

# 2. 验证无自定义axios.create
grep -r "axios.create" */src/ | wc -l  # 应 = 0

# 3. 运行单元测试
cd shared && pnpm test api.config.test.js

# 4. 验证API调用(启动应用)
pnpm dev
# 在浏览器Network中检查请求headers、timeout一致
```

**Parallel execution**:
- T015-T021 可并行执行(7个应用的迁移独立)
- T022 可在T012-T014完成后独立执行

---

## Phase 4: User Story 3 - 统一构建环境 (P2)

**Story Goal**: 所有应用使用相同版本的Vite和核心依赖,避免构建行为差异

**Independent Test**: 在所有应用运行 `pnpm build`,验证构建输出格式一致、无版本冲突警告

---

### T024: 重新安装依赖验证提升效果 [Story: US3]

**Purpose**: 验证T003的依赖提升配置生效

**Steps**:
```bash
# 删除所有node_modules
rm -rf node_modules pnpm-lock.yaml
find . -name "node_modules" -type d -exec rm -rf {} +

# 重新安装
pnpm install

# 验证提升效果
ls -la node_modules | grep -E "vue|ant-design|pinia"
pnpm why vue
pnpm why ant-design-vue
```

**Acceptance**:
- ✅ 根node_modules包含vue/ant-design-vue/pinia
- ✅ `pnpm why vue` 显示统一版本
- ✅ node_modules大小减少约37.5%

---

### T025: 批量升级Vite到5.0.4 [Story: US3]

**Purpose**: 统一所有应用的Vite版本(FR-011)

**Steps**:
```bash
# 升级所有workspace包的Vite
pnpm up -r vite@^5.0.4

# 升级相关插件
pnpm up -r @vitejs/plugin-vue@^5.0.0
```

**Acceptance**:
- ✅ 所有应用 `package.json` 中 `vite` 版本为 `^5.0.4`
- ✅ `@vitejs/plugin-vue` 版本为 `^5.0.0`

---

### T026: 检查并替换废弃API [Story: US3]

**Purpose**: 确保Vite 5兼容性

**Steps**:
```bash
# 搜索废弃的API
grep -r "import.meta.globEager" .

# 如果找到,替换为:
# import.meta.glob('*', { eager: true })
```

**Acceptance**:
- ✅ 项目中无 `import.meta.globEager` 使用
- ✅ 使用新API `import.meta.glob(..., { eager: true })`

---

### T027: 验证所有应用构建 [Story: US3]

**Purpose**: 确保Vite 5升级不破坏构建

**Steps**:
```bash
# 测试所有应用的构建
pnpm build

# 检查构建产物
ls -lh main-app/dist/assets/*.js
ls -lh agent-app/dist/assets/*.js
# ... 检查其他应用
```

**Acceptance**:
- ✅ `pnpm build` 无错误
- ✅ 所有应用构建成功
- ✅ 构建产物格式一致

---

### T028: 统一Ant Design Vue版本 [Story: US3]

**Purpose**: 统一UI库版本(FR-012)

**Steps**:
```bash
pnpm up -r ant-design-vue@^4.0.7
pnpm up -r @ant-design/icons-vue@^7.0.1
```

**Acceptance**:
- ✅ 所有应用使用 `ant-design-vue@^4.0.7`
- ✅ 所有应用使用 `@ant-design/icons-vue@^7.0.1`

---

### T029: 锁定根package.json关键依赖 [Story: US3]

**Purpose**: 避免版本漂移(FR-013)

**File**: `package.json` (根目录)

**Changes**:
```json
{
  "devDependencies": {
    "vite": "5.0.4",  // ✅ 移除 ^ 符号
    "vitest": "1.0.4",
    "@playwright/test": "1.40.1",
    // ... 其他关键依赖使用精确版本
  }
}
```

**Acceptance**:
- ✅ 关键依赖无 `^` 或 `~` 前缀
- ✅ 使用精确版本号

---

### T030: 提交依赖版本统一变更 [Story: US3]

**Purpose**: 提交所有依赖升级

**Steps**:
```bash
git add package.json pnpm-lock.yaml
git add */package.json

git commit -m "chore: 统一依赖版本 (Feature 003 - User Story 3)

- 升级所有应用Vite至5.0.4
- 升级Ant Design Vue至4.0.7
- 替换废弃API (import.meta.globEager)
- 锁定关键依赖精确版本
- 配置pnpm依赖提升,减少node_modules大小37.5%

Relates-to: #003
"
```

**Acceptance**:
- ✅ 所有依赖变更已提交

---

### 📊 User Story 3 Checkpoint

**验收标准**:
- ✅ SC-004: `pnpm install` 总时间减少20%
- ✅ SC-005: 所有应用构建时无版本冲突警告

**独立测试**:
```bash
# 1. 验证Vite版本统一
grep -r '"vite":' */package.json | grep -v "5.0.4"  # 应无输出

# 2. 验证Ant Design版本统一
grep -r '"ant-design-vue":' */package.json | grep -v "4.0.7"  # 应无输出

# 3. 验证构建无警告
pnpm build 2>&1 | grep -i "warning"  # 应无版本冲突警告

# 4. 验证依赖大小
du -sh node_modules  # 应比优化前减少~200-300MB
```

**Parallel execution**:
- T025, T026, T028 可并行执行(操作不同文件)
- T027 依赖T025-T026完成
- T029 可独立执行

---

## Phase 5: User Story 4 - 样式变量复用 (P3)

**Story Goal**: 开发者使用统一的设计变量,确保UI一致性

**Independent Test**: 在任意微应用新建组件,导入 `@k8s-agent/shared/assets/styles/variables.scss`,使用 `$primary-color` 等变量,验证样式生效

---

### T031: 创建Sass变量文件 [Story: US4]

**Purpose**: 定义统一的设计变量(FR-015, FR-016)

**File**: `shared/src/assets/styles/variables.scss`

**Content** (参考 `research.md` Topic 6):
```scss
/**
 * ===== 颜色系统 =====
 */

// Sass变量(编译时)
$color-primary: #1890ff;
$color-success: #52c41a;
$color-warning: #faad14;
$color-error: #f5222d;
$color-info: #1890ff;

$color-text-primary: rgba(0, 0, 0, 0.85);
$color-text-secondary: rgba(0, 0, 0, 0.65);
$color-text-disabled: rgba(0, 0, 0, 0.25);

$color-border: #d9d9d9;
$color-divider: #f0f0f0;
$color-background: #fafafa;

// CSS变量(运行时,穿透Shadow DOM)
:root {
  --color-primary: #{$color-primary};
  --color-success: #{$color-success};
  --color-warning: #{$color-warning};
  --color-error: #{$color-error};
  --color-info: #{$color-info};

  --color-text-primary: #{$color-text-primary};
  --color-text-secondary: #{$color-text-secondary};
  --color-text-disabled: #{$color-text-disabled};

  --color-border: #{$color-border};
  --color-divider: #{$color-divider};
  --color-background: #{$color-background};
}

/**
 * ===== 间距系统 =====
 */

$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

:root {
  --spacing-xs: #{$spacing-xs};
  --spacing-sm: #{$spacing-sm};
  --spacing-md: #{$spacing-md};
  --spacing-lg: #{$spacing-lg};
  --spacing-xl: #{$spacing-xl};
}

/**
 * ===== 排版系统 =====
 */

$font-size-sm: 12px;
$font-size-base: 14px;
$font-size-lg: 16px;
$font-size-xl: 20px;

$line-height-base: 1.5715;
$line-height-heading: 1.35;

:root {
  --font-size-sm: #{$font-size-sm};
  --font-size-base: #{$font-size-base};
  --font-size-lg: #{$font-size-lg};
  --font-size-xl: #{$font-size-xl};

  --line-height-base: #{$line-height-base};
  --line-height-heading: #{$line-height-heading};
}

/**
 * ===== 圆角/阴影 =====
 */

$border-radius-sm: 2px;
$border-radius-base: 4px;
$border-radius-lg: 8px;

$box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15);
$box-shadow-card: 0 1px 2px rgba(0, 0, 0, 0.03),
                  0 1px 6px -1px rgba(0, 0, 0, 0.02),
                  0 2px 4px rgba(0, 0, 0, 0.02);

:root {
  --border-radius-sm: #{$border-radius-sm};
  --border-radius-base: #{$border-radius-base};
  --border-radius-lg: #{$border-radius-lg};

  --box-shadow-base: #{$box-shadow-base};
  --box-shadow-card: #{$box-shadow-card};
}

/**
 * ===== Z-index系统 =====
 */

$z-index-dropdown: 1050;
$z-index-modal: 1060;
$z-index-tooltip: 1070;
$z-index-notification: 1080;

:root {
  --z-index-dropdown: #{$z-index-dropdown};
  --z-index-modal: #{$z-index-modal};
  --z-index-tooltip: #{$z-index-tooltip};
  --z-index-notification: #{$z-index-notification};
}
```

**Acceptance**:
- ✅ 定义了15+设计变量(颜色/间距/排版/圆角/z-index)
- ✅ 使用Sass变量+CSS变量双轨制

---

### T032: 创建Sass mixins文件 [Story: US4]

**Purpose**: 提供可复用的样式mixin(FR-017)

**File**: `shared/src/assets/styles/mixins.scss`

**Content**:
```scss
@import './variables.scss';

/**
 * Flexbox布局
 */
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/**
 * 文本溢出省略
 */
@mixin text-ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/**
 * 响应式断点
 */
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (max-width: 768px) { @content; }
  } @else if $breakpoint == 'md' {
    @media (max-width: 992px) { @content; }
  } @else if $breakpoint == 'lg' {
    @media (max-width: 1200px) { @content; }
  } @else if $breakpoint == 'xl' {
    @media (min-width: 1201px) { @content; }
  }
}

/**
 * 卡片样式
 */
@mixin card {
  background: #fff;
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-card);
  padding: var(--spacing-md);
}

/**
 * 滚动条样式
 */
@mixin custom-scrollbar {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--border-radius-base);

    &:hover {
      background: var(--color-text-disabled);
    }
  }

  &::-webkit-scrollbar-track {
    background: var(--color-background);
  }
}
```

**Acceptance**:
- ✅ 提供了5+常用mixins(flex/ellipsis/responsive/card/scrollbar)
- ✅ Mixins使用CSS变量(支持Shadow DOM)

---

### T033: 创建全局样式入口 [Story: US4]

**Purpose**: 提供统一的样式导入入口

**File**: `shared/src/assets/styles/global.scss`

**Content**:
```scss
@import './variables.scss';
@import './mixins.scss';

/**
 * 全局样式重置
 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-text-primary);
  background: var(--color-background);
}
```

**Acceptance**:
- ✅ 导入variables.scss和mixins.scss
- ✅ 提供基础样式重置

---

### T034: 更新shared库package.json导出样式 [Story: US4]

**Purpose**: 暴露样式文件给其他应用(FR-018)

**File**: `shared/package.json`

**Changes**:
```json
{
  "exports": {
    "./assets/styles/variables.scss": "./src/assets/styles/variables.scss",
    "./assets/styles/mixins.scss": "./src/assets/styles/mixins.scss",
    "./assets/styles/global.scss": "./src/assets/styles/global.scss",
    // ... 其他exports
  }
}
```

**Acceptance**:
- ✅ 样式文件可通过 `@k8s-agent/shared/assets/styles/*` 导入

---

### T035: 配置Vite自动导入样式变量 [Story: US4]

**Purpose**: 所有微应用自动导入样式变量,无需手动import

**Files to modify**: 所有微应用的 `vite.config.js`

**Changes** (以system-app为例):
```javascript
// system-app/vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import '@k8s-agent/shared/assets/styles/variables.scss';
          @import '@k8s-agent/shared/assets/styles/mixins.scss';
        `
      }
    }
  }
})
```

**Apply to**:
- main-app/vite.config.js
- dashboard-app/vite.config.js
- agent-app/vite.config.js
- cluster-app/vite.config.js
- monitor-app/vite.config.js
- system-app/vite.config.js
- image-build-app/vite.config.js

**Acceptance**:
- ✅ 所有7个应用vite.config.js已配置additionalData
- ✅ 组件中可直接使用 `$primary-color` 等变量

---

### T036: 提交样式变量系统 [Story: US4]

**Purpose**: 提交所有样式相关代码

**Steps**:
```bash
git add shared/src/assets/styles/
git add shared/package.json
git add */vite.config.js

git commit -m "feat: 创建统一样式变量系统 (Feature 003 - User Story 4)

- 创建variables.scss定义15+设计变量
- 创建mixins.scss提供5+可复用mixin
- 配置Vite自动导入样式变量
- 使用Sass变量+CSS变量双轨制(支持Shadow DOM)

Relates-to: #003
"
```

**Acceptance**:
- ✅ 所有样式变更已提交

---

### 📊 User Story 4 Checkpoint

**验收标准**:
- ✅ SC-006: 样式变量使用率达到50%以上
- ✅ SC-007: 新组件开发时,5分钟内找到并应用样式规范

**独立测试**:
```bash
# 1. 验证样式文件已创建
ls -la shared/src/assets/styles/
# 应有 variables.scss, mixins.scss, global.scss

# 2. 验证Vite配置
grep -r "additionalData" */vite.config.js | wc -l  # 应 = 7

# 3. 测试样式变量生效
# 在任意微应用新建测试组件:
cat > system-app/src/views/TestStyleVars.vue <<EOF
<template>
  <div class="test-card">
    <p class="test-text">测试样式变量</p>
  </div>
</template>

<style lang="scss" scoped>
.test-card {
  @include card; // ✅ 使用mixin
  margin-bottom: \$spacing-md; // ✅ 使用Sass变量

  .test-text {
    color: var(--color-primary); // ✅ 使用CSS变量
    @include text-ellipsis(2);
  }
}
</style>
EOF

# 4. 启动应用验证样式
pnpm dev
# 访问 /test-style-vars,确认样式正常
```

**Parallel execution**:
- T031, T032, T033 可并行编写(不同文件)
- T034 独立执行
- T035 可并行修改7个vite.config.js

---

## Phase 6: Wujie生命周期标准化 (Cross-Cutting)

**Purpose**: 标准化Wujie生命周期钩子,支持预加载和EventBus监控(FR-019至FR-032)

---

### T037: 创建Wujie生命周期钩子模板 [Cross-Cutting]

**Purpose**: 提供标准生命周期钩子(FR-019, FR-020, FR-021, FR-023)

**File**: `shared/src/config/wujie-lifecycle.js`

**Content** (参考 `contracts/wujie-lifecycle.contract.md`):
```javascript
/**
 * 标准Wujie生命周期钩子模板
 * @param {string} appName - 微应用名称
 * @param {Object} options - 可选配置
 * @returns {Object} 生命周期钩子对象
 */
export function createLifecycleHooks(appName, options = {}) {
  const {
    onLoadSuccess,
    onLoadError,
    onMountSuccess,
    onMountError,
    onUnmountSuccess
  } = options

  return {
    beforeLoad: async (appWindow) => {
      console.log(`[Wujie] ${appName} beforeLoad`)
      try {
        // 等待DOM Ready
        if (appWindow.document.readyState === 'loading') {
          await new Promise(resolve => {
            appWindow.addEventListener('DOMContentLoaded', resolve, { once: true })
          })
        }

        await onLoadSuccess?.(appWindow)
        console.log(`[Wujie] ${appName} beforeLoad completed`)
      } catch (error) {
        console.error(`[Wujie] ${appName} beforeLoad error:`, error)
        reportError({ appName, phase: 'beforeLoad', error: error.message, stack: error.stack })
        onLoadError?.(error)
      }
    },

    afterMount: async (appWindow) => {
      console.log(`[Wujie] ${appName} afterMount`)
      try {
        const app = appWindow.document.querySelector('#app')
        if (!app) {
          throw new Error('Root element #app not found')
        }

        await onMountSuccess?.(appWindow)
        appWindow.__WUJIE_MOUNT_SUCCESS__ = true

        console.log(`[Wujie] ${appName} afterMount completed`)
      } catch (error) {
        console.error(`[Wujie] ${appName} afterMount error:`, error)
        reportError({ appName, phase: 'afterMount', error: error.message, stack: error.stack })
        onMountError?.(error)
        showErrorBoundary(appName, error)
      }
    },

    beforeUnmount: (appWindow) => {
      console.log(`[Wujie] ${appName} beforeUnmount`)
      try {
        appWindow.__WUJIE_CLEANUP__?.forEach(fn => fn())
        onUnmountSuccess?.(appWindow)
        delete appWindow.__WUJIE_MOUNT_SUCCESS__

        console.log(`[Wujie] ${appName} beforeUnmount completed`)
      } catch (error) {
        console.error(`[Wujie] ${appName} beforeUnmount error:`, error)
      }
    }
  }
}

export function reportError(report) {
  console.error(`[Wujie Error] ${report.appName} - ${report.phase}:`, report)
  // 集成Sentry等监控平台
}

export function showErrorBoundary(appName, error) {
  // 显示错误边界UI
  console.error(`[ErrorBoundary] ${appName}: ${error.message}`)
}
```

**Acceptance**:
- ✅ `createLifecycleHooks()` 返回beforeLoad/afterMount/beforeUnmount
- ✅ 包含错误处理逻辑
- ✅ 支持自定义扩展函数

---

### T038: 更新wujie-config.js使用标准钩子 [Cross-Cutting]

**Purpose**: 主应用使用标准生命周期钩子(FR-022)

**File**: `main-app/src/micro/wujie-config.js`

**Before**:
```javascript
export const wujieConfig = {
  apps: [
    {
      name: 'dashboard-app',
      url: '//localhost:3001',
      exec: true,
      alive: true,
      sync: true
    },
    // ... 其他5个应用
  ]
}
```

**After**:
```javascript
import { createLifecycleHooks } from '@k8s-agent/shared/config/wujie-lifecycle.js'
import { MICRO_APPS, getMicroAppUrl } from '@/config/micro-apps.config'

export const wujieConfig = {
  apps: Object.values(MICRO_APPS).map(app => ({
    name: app.name,
    url: getMicroAppUrl(app.name),
    exec: app.wujie.exec,
    alive: app.wujie.alive,
    sync: app.wujie.sync,

    // ✅ 使用标准生命周期钩子
    ...createLifecycleHooks(app.name, {
      onLoadSuccess: async (appWindow) => {
        // 可选: 应用特定逻辑
      },
      onLoadError: (error) => {
        message.error(`${app.name} 加载失败`)
      }
    })
  }))
}
```

**Acceptance**:
- ✅ 所有6个微应用使用 `createLifecycleHooks()`
- ✅ 删除硬编码的beforeLoad/afterMount代码

---

### T039: 实现微应用预加载 [Cross-Cutting]

**Purpose**: 预加载所有6个微应用(FR-024, FR-025, FR-026)

**File**: `main-app/src/micro/preload.js`

**Content** (参考 `research.md` Topic 2):
```javascript
import { preloadApp } from 'wujie'
import { MICRO_APPS, getMicroAppUrl } from '@/config/micro-apps.config'

const requestIdleCallback = window.requestIdleCallback || function(cb) {
  const start = Date.now()
  return setTimeout(() => {
    cb({ didTimeout: false, timeRemaining: () => Math.max(0, 50 - (Date.now() - start)) })
  }, 1)
}

const PRELOAD_PRIORITY = {
  immediate: ['dashboard-app', 'agent-app'],
  idle: ['cluster-app', 'system-app'],
  onDemand: ['monitor-app', 'image-build-app']
}

export function preloadImmediateApps() {
  console.log('[Preload] Starting immediate preload...')

  PRELOAD_PRIORITY.immediate.forEach(appName => {
    const config = MICRO_APPS[appName]
    if (!config) return

    const startTime = performance.now()
    preloadApp({
      name: config.name,
      url: getMicroAppUrl(appName)
    }).then(() => {
      const duration = performance.now() - startTime
      console.log(`[Preload] ${appName} preloaded (${duration.toFixed(0)}ms)`)
    }).catch(error => {
      console.error(`[Preload] ${appName} preload failed:`, error)
    })
  })
}

export function preloadIdleApps() {
  console.log('[Preload] Scheduling idle preload...')

  requestIdleCallback((deadline) => {
    PRELOAD_PRIORITY.idle.forEach(appName => {
      if (deadline.timeRemaining() > 0) {
        const config = MICRO_APPS[appName]
        if (!config) return

        preloadApp({
          name: config.name,
          url: getMicroAppUrl(appName)
        }).then(() => {
          console.log(`[Preload] ${appName} preloaded (idle)`)
        }).catch(error => {
          console.error(`[Preload] ${appName} preload failed:`, error)
        })
      }
    })
  }, { timeout: 3000 })
}

export function initPreloadStrategy() {
  preloadImmediateApps()
  preloadIdleApps()
}
```

**Acceptance**:
- ✅ 实现3层预加载策略(immediate/idle/onDemand)
- ✅ 使用requestIdleCallback避免阻塞
- ✅ 包含性能监控埋点

---

### T040: 集成预加载到登录流程 [Cross-Cutting]

**Purpose**: 登录成功后执行预加载(FR-025)

**File**: `main-app/src/store/user.js`

**Changes**:
```javascript
import { initPreloadStrategy } from '@/micro/preload'

export const userStore = defineStore('user', {
  actions: {
    async login(credentials) {
      const { token, userInfo } = await loginApi(credentials)
      this.token = token
      this.userInfo = userInfo

      // ✅ 登录成功后预加载微应用
      initPreloadStrategy()

      return { token, userInfo }
    }
  }
})
```

**Acceptance**:
- ✅ 登录成功后自动调用 `initPreloadStrategy()`

---

### T041: 实现EventBus监控器 [Cross-Cutting]

**Purpose**: 监控EventBus事件频率(FR-030, FR-031, FR-032)

**File**: `shared/src/utils/event-bus-monitor.js`

**Content** (参考 `research.md` Topic 4):
```javascript
export class EventBusMonitor {
  constructor(bus, options = {}) {
    this.bus = bus
    this.threshold = options.threshold || 100
    this.windowSize = options.windowSize || 1000
    this.enabled = options.enabled ?? true

    this.eventCounts = new Map()
    this.eventTypes = new Map()
    this.originalEmit = null

    if (this.enabled) {
      this.install()
    }
  }

  install() {
    if (!this.bus || !this.bus.$emit) {
      console.warn('[EventBusMonitor] Bus not found')
      return
    }

    this.originalEmit = this.bus.$emit.bind(this.bus)
    this.bus.$emit = (...args) => {
      const [eventName] = args
      this.recordEvent(eventName)
      return this.originalEmit(...args)
    }

    console.log('[EventBusMonitor] Installed successfully')
  }

  recordEvent(eventName) {
    const now = Date.now()

    this.eventTypes.set(eventName, (this.eventTypes.get(eventName) || 0) + 1)
    this.eventCounts.set(now, (this.eventCounts.get(now) || 0) + 1)

    const cutoff = now - this.windowSize
    for (const [timestamp] of this.eventCounts) {
      if (timestamp < cutoff) {
        this.eventCounts.delete(timestamp)
      }
    }

    const totalEvents = Array.from(this.eventCounts.values()).reduce((a, b) => a + b, 0)
    const eventsPerSecond = (totalEvents / this.windowSize) * 1000

    if (eventsPerSecond > this.threshold) {
      this.warn(eventsPerSecond, eventName)
    }
  }

  warn(eventsPerSecond, triggerEvent) {
    console.warn(
      `[EventBusMonitor] ⚠️ High event frequency: ${eventsPerSecond.toFixed(0)} events/sec (threshold: ${this.threshold})`
    )
    console.warn(`[EventBusMonitor] Triggered by: ${triggerEvent}`)
    console.warn('[EventBusMonitor] Top 5 events:', this.getTopEvents(5))
  }

  getTopEvents(n = 5) {
    return Array.from(this.eventTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, count]) => ({ name, count }))
  }

  getReport() {
    const now = Date.now()
    const cutoff = now - this.windowSize

    const recentEvents = Array.from(this.eventCounts.entries())
      .filter(([timestamp]) => timestamp >= cutoff)
      .reduce((sum, [, count]) => sum + count, 0)

    const eventsPerSecond = (recentEvents / this.windowSize) * 1000

    return {
      eventsPerSecond: Math.round(eventsPerSecond),
      threshold: this.threshold,
      totalEventTypes: this.eventTypes.size,
      topEvents: this.getTopEvents(10),
      isHealthy: eventsPerSecond <= this.threshold
    }
  }
}
```

**Acceptance**:
- ✅ `EventBusMonitor` 类可拦截 `$emit`
- ✅ 超过100次/秒时输出警告
- ✅ 提供 `getReport()` 调试接口

---

### T042: 启用EventBus监控 [Cross-Cutting]

**Purpose**: 在主应用启用监控(FR-032)

**File**: `main-app/src/main.js`

**Changes**:
```javascript
import WujieVue from 'wujie-vue3'
import { EventBusMonitor } from '@k8s-agent/shared/utils/event-bus-monitor.js'

app.use(WujieVue)

// ✅ 启用EventBus监控
const monitor = new EventBusMonitor(window.WujieVue.bus, {
  threshold: 100,
  enabled: import.meta.env.MODE !== 'production'
})

if (import.meta.env.MODE !== 'production') {
  window.__EVENT_BUS_MONITOR__ = monitor
}
```

**Acceptance**:
- ✅ 开发环境启用监控
- ✅ 全局暴露 `window.__EVENT_BUS_MONITOR__`

---

### T043: 配置Shadow DOM与Ant Design适配 [Cross-Cutting]

**Purpose**: 解决Shadow DOM中Ant Design弹出组件问题(FR-027, FR-028, FR-029)

**Step 1**: 创建 `shared/src/composables/usePopupContainer.js`

**Content**:
```javascript
export function usePopupContainer() {
  if (!window.__POWERED_BY_WUJIE__) {
    return undefined
  }

  return (triggerNode) => {
    let node = triggerNode
    while (node) {
      if (node.shadowRoot) return node
      if (node.host) return node.host
      node = node.parentNode
    }
    return triggerNode?.parentNode || document.body
  }
}
```

**Step 2**: 更新所有微应用的 `App.vue`

**Changes** (以system-app为例):
```vue
<!-- system-app/src/App.vue -->
<template>
  <a-config-provider :getPopupContainer="getPopupContainer">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { usePopupContainer } from '@k8s-agent/shared/composables'

const getPopupContainer = usePopupContainer()
</script>
```

**Apply to**: 所有6个微应用的App.vue

**Acceptance**:
- ✅ `usePopupContainer` composable已创建
- ✅ 所有微应用App.vue已配置 `<a-config-provider>`

---

### T044: 提交Wujie生命周期标准化变更 [Cross-Cutting]

**Purpose**: 提交所有Wujie相关代码

**Steps**:
```bash
git add shared/src/config/wujie-lifecycle.js
git add shared/src/utils/event-bus-monitor.js
git add shared/src/composables/usePopupContainer.js
git add main-app/src/micro/wujie-config.js
git add main-app/src/micro/preload.js
git add main-app/src/store/user.js
git add main-app/src/main.js
git add */src/App.vue

git commit -m "feat: 标准化Wujie生命周期与预加载 (Feature 003 - Cross-Cutting)

- 创建标准生命周期钩子模板(beforeLoad/afterMount/beforeUnmount)
- 实现3层预加载策略(immediate/idle/onDemand)
- 集成EventBus监控(100次/秒阈值警告)
- 配置Shadow DOM与Ant Design适配

Relates-to: #003
"
```

**Acceptance**:
- ✅ 所有Wujie变更已提交

---

### 📊 Wujie Lifecycle Checkpoint

**验收标准**:
- ✅ SC-008: 微应用TTI ≤ 500ms (得益于预加载)
- ✅ SC-009: 预加载后内存增加 ≤ 100MB
- ✅ SC-010: EventBus频率 < 100次/秒

**独立测试**:
```bash
# 1. 验证生命周期钩子
pnpm dev
# 查看Console,应有生命周期日志:
# [Wujie] dashboard-app beforeLoad
# [Wujie] dashboard-app afterMount

# 2. 验证预加载
# 登录后,Console应显示:
# [Preload] dashboard-app preloaded (450ms)
# [Preload] agent-app preloaded (520ms)

# 3. 验证EventBus监控
window.__EVENT_BUS_MONITOR__.getReport()
# 应返回: { eventsPerSecond: 85, isHealthy: true, ... }

# 4. 验证Shadow DOM适配
# 打开Select/DatePicker等组件,确认弹窗位置正确
```

---

## Phase 7: Final Integration & Polish

### T045: 运行完整测试套件 [Integration]

**Purpose**: 验证所有变更不破坏现有功能

**Steps**:
```bash
# 1. 单元测试
pnpm test

# 2. 构建测试
pnpm build

# 3. E2E测试(如果存在)
pnpm test:e2e
```

**Acceptance**:
- ✅ 所有单元测试通过
- ✅ 所有应用构建成功
- ✅ E2E测试通过(如果有)

---

### T046: 性能基准测试 [Integration]

**Purpose**: 验证性能目标达成

**Metrics**:
```bash
# 1. 依赖大小
du -sh node_modules
# 目标: 减少20% (从~800MB → ~640MB)

# 2. 构建时间
time pnpm build
# 记录基准

# 3. 微应用TTI
# 使用Chrome DevTools Performance测量
# 目标: ≤ 500ms

# 4. 内存占用
# 使用Chrome DevTools Memory Profiler
# 目标: 预加载后增加 ≤ 100MB

# 5. EventBus频率
window.__EVENT_BUS_MONITOR__.getReport()
# 目标: < 100次/秒
```

**Acceptance**:
- ✅ SC-004: pnpm install时间减少20%
- ✅ SC-008: 微应用TTI ≤ 500ms
- ✅ SC-009: 内存增加 ≤ 100MB
- ✅ SC-010: EventBus频率 < 100次/秒

---

### T047: 更新CHANGELOG.md [Documentation]

**Purpose**: 记录Feature 003变更

**File**: `CHANGELOG.md` (如果存在,否则创建)

**Content**:
```markdown
## [Unreleased]

### Feature 003 - 项目结构优化 - 文档重组与配置标准化

#### Added
- 创建docs/目录,分为architecture/features/troubleshooting/components分类
- 统一API配置(shared/src/config/api.config.js)
- 统一样式变量系统(shared/src/assets/styles/)
- 标准Wujie生命周期钩子模板
- 微应用预加载策略(3层:immediate/idle/onDemand)
- EventBus事件频率监控(100次/秒阈值)

#### Changed
- 文档数量从108个减少至30个
- 所有应用Vite版本统一至5.0.4
- 所有应用Ant Design Vue版本统一至4.0.7
- 配置pnpm依赖提升,node_modules大小减少37.5%

#### Fixed
- 修复API配置不一致问题
- 修复Shadow DOM中Ant Design弹出组件显示异常

#### Performance
- 微应用首次访问TTI从~1000ms降至<500ms(得益于预加载)
- pnpm install时间减少20%
- 文档查找时间从10分钟降至3分钟
```

**Acceptance**:
- ✅ CHANGELOG.md已更新

---

### T048: 创建PR并请求Code Review [Submission]

**Purpose**: 提交Feature 003完整PR

**Steps**:
```bash
# 1. 推送feature分支
git push origin feature/003-project-optimization

# 2. 创建PR
gh pr create \
  --title "Feature 003: 项目结构优化 - 文档重组与配置标准化" \
  --body "$(cat <<EOF
## Summary

本PR实现Feature 003的所有4个用户故事:
- ✅ **P1 - User Story 1**: 文档重组(108个→30个)
- ✅ **P1 - User Story 2**: 统一API配置(7个应用)
- ✅ **P2 - User Story 3**: 统一依赖版本(Vite 5.0.4)
- ✅ **P3 - User Story 4**: 样式变量系统(15+变量, 5+mixins)
- ✅ **Cross-Cutting**: Wujie生命周期标准化+预加载+EventBus监控

## Changes

### Documentation (User Story 1)
- 创建docs/目录结构(architecture/features/troubleshooting/components)
- 迁移108个MD文件至30个分类文档
- 合并VXE Table相关文档
- 更新CLAUDE.md文档路径引用

### API Configuration (User Story 2)
- 创建shared/src/config/api.config.js统一配置
- 实现createAxiosInstance工厂函数(自动重试、错误处理、token注入)
- 统一7个应用的axios实例创建

### Dependency Versions (User Story 3)
- 升级所有应用Vite至5.0.4
- 升级Ant Design Vue至4.0.7
- 配置pnpm依赖提升(.npmrc)
- 锁定关键依赖精确版本

### Style System (User Story 4)
- 创建variables.scss(15+设计变量)
- 创建mixins.scss(5+可复用mixin)
- 配置Vite自动导入样式变量
- 使用Sass变量+CSS变量双轨制(支持Shadow DOM)

### Wujie Lifecycle (Cross-Cutting)
- 创建标准生命周期钩子模板(beforeLoad/afterMount/beforeUnmount)
- 实现3层预加载策略(immediate/idle/onDemand)
- 集成EventBus监控(100次/秒阈值警告)
- 配置Shadow DOM与Ant Design适配

## Test Results

- ✅ SC-001: 文档数量从108个减少至30个 ✓
- ✅ SC-002: 文档查找时间从10分钟降至3分钟 ✓
- ✅ SC-003: API配置一致性100% ✓
- ✅ SC-004: pnpm install时间减少20% ✓
- ✅ SC-005: 构建零版本冲突警告 ✓
- ✅ SC-006: 样式变量使用率>50% ✓
- ✅ SC-007: 样式规范查找时间≤5分钟 ✓
- ✅ SC-008: 微应用TTI≤500ms ✓
- ✅ SC-009: 内存增加≤100MB ✓
- ✅ SC-010: EventBus频率<100次/秒 ✓

## Checklist

- [x] 所有单元测试通过
- [x] 所有应用构建成功
- [x] E2E测试通过
- [x] CHANGELOG.md已更新
- [x] CLAUDE.md已更新
- [x] 文档链接已验证
- [x] 性能基准测试通过

## Related Issues

Closes #003

EOF
)" \
  --base main
```

**Acceptance**:
- ✅ PR已创建
- ✅ PR描述完整
- ✅ 请求Code Review

---

## Dependencies & Execution Order

### Dependency Graph

```
T001 (Git备份)
  ↓
T002 (创建目录) ──────────────┐
  ↓                           │
T003 (配置.npmrc)             │
  ↓                           │
[Phase 2: User Story 1]       │
T004 → T005/T006/T007 → T008 → T009 → T010 → T011
(并行)                                           ↓
                                              T012
[Phase 3: User Story 2]                         ↓
T012 → T013 → T014 → T015/T016/T017/T018/T019/T020/T021 → T022 → T023
       (并行)                                            ↓
                                                      T024
[Phase 4: User Story 3]                                 ↓
T024 → T025/T026/T028 → T027 → T029 → T030
       (并行)                           ↓
                                     T031
[Phase 5: User Story 4]                ↓
T031/T032/T033 → T034 → T035 → T036
(并行)                           ↓
                              T037
[Phase 6: Cross-Cutting]         ↓
T037 → T038 → T039 → T040 → T041 → T042 → T043 → T044
                                                    ↓
[Phase 7: Integration]                              ↓
T045 → T046 → T047 → T048
```

### Parallel Execution Opportunities

**Phase 2 (User Story 1)**:
- T005, T006, T007 可并行执行(操作不同文件)

**Phase 3 (User Story 2)**:
- T015-T021 (7个应用API迁移) 可并行执行

**Phase 4 (User Story 3)**:
- T025, T026, T028 可并行执行

**Phase 5 (User Story 4)**:
- T031, T032, T033 可并行编写
- T035 (7个vite.config.js修改) 可并行执行

**Total parallelizable tasks**: 18个

---

## Task Summary

### Totals
- **Total Tasks**: 48
- **Foundational Tasks**: 3 (T001-T003)
- **User Story 1 Tasks**: 8 (T004-T011)
- **User Story 2 Tasks**: 12 (T012-T023)
- **User Story 3 Tasks**: 7 (T024-T030)
- **User Story 4 Tasks**: 6 (T031-T036)
- **Cross-Cutting Tasks**: 8 (T037-T044)
- **Integration Tasks**: 4 (T045-T048)

### MVP Scope (最小可行产品)

**推荐MVP**: User Story 1 + User Story 2 (P1优先级)

**理由**:
- User Story 1 (文档重组) 解决最紧迫的开发效率问题
- User Story 2 (API配置统一) 解决最严重的配置不一致bug
- 这两个story独立可测试,合并后即可发布

**后续迭代**:
- **Sprint 2**: User Story 3 (依赖版本统一) - P2优先级
- **Sprint 3**: User Story 4 (样式变量系统) + Cross-Cutting - P3优先级

---

## Implementation Strategy

### 推荐执行顺序

1. **Week 1**: Phase 1 (Setup) + Phase 2 (User Story 1 - 文档重组)
   - 完成文档重组,快速提升开发效率
   - 提交单独PR,快速合并

2. **Week 2**: Phase 3 (User Story 2 - API配置统一)
   - 统一API配置,解决配置不一致问题
   - 包含单元测试验证
   - 提交单独PR

3. **Week 3**: Phase 4 (User Story 3 - 依赖版本统一)
   - 升级Vite和依赖
   - 验证构建兼容性
   - 提交单独PR

4. **Week 4**: Phase 5 (User Story 4 - 样式变量) + Phase 6 (Cross-Cutting)
   - 创建样式系统
   - 标准化Wujie生命周期
   - 提交单独PR

5. **Week 5**: Phase 7 (Integration) + PR Review
   - 集成测试
   - 性能验证
   - Code Review

### Risk Mitigation

每个User Story独立可测试,可单独发布:
- 如果某个story出现问题,不影响其他story
- 可根据实际情况调整优先级
- 支持增量交付,快速获得反馈

---

**Tasks Generation Complete** | **Next**: `/speckit.implement` to start execution
