# Implementation Plan: 项目结构优化 - 文档重组与配置标准化

**Branch**: `003-` | **Date**: 2025-10-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-/spec.md`

## Summary

本feature旨在优化K8s Agent Web微前端项目的整体结构,解决当前文档分散(108个MD文件)、配置不一致(API/Vite版本差异)、样式缺乏统一变量等问题。主要实施:

1. **文档重组**(P1): 将108个MD文件整合至30个以内,按 `docs/{architecture,features,troubleshooting,components}` 分类组织
2. **API配置统一**(P1): 创建 `shared/src/config/api.config.js` 和 `shared/src/utils/request.js`,统一7个应用的axios配置
3. **Wujie生命周期标准化**(P1): 在 `shared/src/config/wujie-lifecycle.js` 提供标准钩子模板(错误处理、加载指示器、EventBus监控)
4. **依赖版本统一**(P2): 所有应用升级至Vite 5.0.4和Ant Design Vue 4.0.7
5. **样式标准化**(P3): 创建 `shared/src/styles/{_variables.scss,_mixins.scss,global.scss}`,定义15+设计变量和5+通用mixin

**技术策略**: 基于现有Wujie微前端架构(Feature 002已完成迁移),在shared库扩展配置管理能力,通过标准化模板和预构建机制提升一致性。预加载全部6个微应用以优化体验,使用Shadow DOM完全隔离样式并适配Ant Design Vue弹出组件。

## Technical Context

**Language/Version**: JavaScript (ES2020+), Vue 3.3.4+ (Composition API)
**Primary Dependencies**:
- Wujie 1.0.29 (微前端框架)
- Vite 5.0.4 (构建工具,所有应用统一)
- Ant Design Vue 4.0.7 (UI组件库,当前使用)
- Pinia 2.1.7 (状态管理)
- Vue Router 4.2.5 (路由)
- Axios 1.6.2 (HTTP客户端)
- Sass 1.69.5 (样式预处理器)

**Storage**:
- localStorage (token、userInfo持久化)
- Pinia stores (运行时状态)
- 无后端存储需求(本feature仅前端优化)

**Testing**:
- Vitest 1.0.4 (单元测试 - shared库核心逻辑)
- Playwright 1.40.1 (E2E测试 - 配置一致性验证)
- 手动测试 (文档可访问性、微应用加载性能)

**Target Platform**:
- 开发环境: macOS/Linux + Chrome 120+ / Firefox 120+
- 生产环境: 静态资源部署(Nginx / CDN)
- 构建目标: ES2020+ (Vite 5原生ESM)

**Project Type**: Web微前端 (1主应用 + 6微应用 + 1共享库)
**Monorepo管理**: pnpm workspace (8个包)

**Performance Goals**:
- 微应用首次访问TTI ≤ 500ms (通过预加载实现)
- 主应用启动内存增量 ≤ 100MB (预加载6个微应用后)
- EventBus通信频率 < 100次/秒 (监控警告阈值)
- 文档查找时间 ≤ 3分钟 (从10分钟降至3分钟)

**Constraints**:
- 非破坏性变更: 不影响现有功能运行
- 单PR完成文档迁移: 使用Git备份分支 `backup-docs-before-003`
- Shadow DOM强制隔离: 必须适配Ant Design Vue弹出组件(Modal/Drawer/Tooltip)
- 依赖版本精确锁定: 根目录package.json使用精确版本(无`^`)

**Scale/Scope**:
- 影响范围: 7个应用(1主+6微) + 1共享库
- 文档规模: 108个MD文件 → 30个以内
- 配置文件: 35个功能需求(FR-001至FR-035)
- 样式变量: 15+变量 + 5+mixins

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Micro-Frontend Isolation
**Status**: **COMPLIANT** - 本feature不引入新微应用,不修改现有微应用独立性

本feature优化配置管理(API、样式、生命周期钩子)均通过shared库提供可选导入,各微应用保持标准Vue 3结构,无需修改路由/入口文件。文档重组为组织性变更,不影响应用代码。

### ✅ Principle II: Wujie-First Architecture
**Status**: **COMPLIANT** - 基于Feature 002已完成的Wujie架构,扩展标准化能力

**变更点**:
- 新增 `shared/src/config/wujie-lifecycle.js` 提供标准生命周期钩子模板
- `main-app/src/micro/wujie-config.js` 导入标准钩子(beforeLoad/afterMount/beforeUnmount)
- 预加载配置: `main.js` 中调用 `preloadApp()` 加载全部6个微应用
- Shadow DOM启用: 配置 `degrade: false` 禁用降级模式

所有变更符合Wujie最佳实践,未引入其他微前端框架。

### ✅ Principle III: Standard Vue 3 Simplicity
**Status**: **COMPLIANT** - 微应用保持标准Vue 3结构,无自定义生命周期

**关键合规点**:
- 微应用不修改: 生命周期钩子配置在主应用的 `wujie-config.js` 中集中管理
- 无需export特殊函数: 微应用仍为标准 `createApp().mount('#app')`
- Vite标准构建: 无需特殊插件,统一使用Vite 5.0.4原生构建
- 路由保持标准: `createWebHistory('/')` 不变

**唯一变更**: 主应用集中配置生命周期钩子(符合Wujie设计),微应用代码零修改。

### ✅ Principle IV: Shared Component Library
**Status**: **COMPLIANT** - 扩展 `@k8s-agent/shared` 能力,无违反共享库原则

**新增shared库exports**:
```javascript
// 配置管理
export { API_CONFIG, createRequest } from '@k8s-agent/shared/config/api.config'
export { wujieLifecycleHooks } from '@k8s-agent/shared/config/wujie-lifecycle'

// 样式系统
export '@k8s-agent/shared/styles/variables'  // SCSS变量
export '@k8s-agent/shared/styles/mixins'     // SCSS mixins
export '@k8s-agent/shared/styles/global'     // 全局样式入口

// 工具函数
export { createRequest } from '@k8s-agent/shared/utils'  // 统一axios实例创建
```

所有新功能通过shared库统一导出,避免代码重复。

### ✅ Principle V: Mock-Driven Development
**Status**: **COMPLIANT** - 不影响现有mock机制

本feature不涉及业务逻辑修改,现有mock系统(`VITE_USE_MOCK=true`)继续工作:
- 主应用mock: `login()`, `getUserMenus()`, `getUserInfo()` 保持不变
- 微应用mock: 各应用独立mock机制不受影响

### ✅ Principle VI: Component Single Responsibility
**Status**: **COMPLIANT** - 新增模块职责单一,现有功能独立扩展

**新增模块职责划分**:
- `api.config.js`: 仅负责API配置常量定义(baseURL/timeout/headers)
- `request.js`: 仅负责创建axios实例(基于api.config)
- `wujie-lifecycle.js`: 仅负责生命周期钩子模板(beforeLoad/afterMount/beforeUnmount)
- `_variables.scss`: 仅负责设计变量定义(颜色/间距/阴影)
- `_mixins.scss`: 仅负责可复用样式mixin(flex/shadow/ellipsis)

每个配置文件职责明确,修改API配置不影响生命周期钩子,修改样式变量不影响mixin逻辑。

### ✅ Architecture Standards: Dynamic Route System
**Status**: **COMPLIANT** - 不修改动态路由系统

本feature不涉及路由变更,现有双路由系统(静态路由+动态路由)保持不变。`MicroAppContainer` 组件使用不变(已在Feature 001修复)。

### ✅ Architecture Standards: Communication Patterns
**Status**: **ENHANCED** - 扩展通信模式,新增EventBus监控

**现有通信保持不变**:
- RouteSync类(Feature 002): 50ms防抖路由同步
- SharedStateManager(Feature 002): 跨应用状态共享
- Props传递: userInfo/token/permissions

**新增能力**:
- EventBus频率监控: afterMount钩子初始化监控器,记录事件频率
- 100次/秒阈值警告: 超阈值时控制台输出警告(事件名+源应用+频率)
- 开发/生产环境区分: dev环境详细日志,prod环境仅记录超阈值事件

符合Feature 002通信协议,向后兼容。

### ✅ Architecture Standards: Proxy Handling
**Status**: **COMPLIANT** - 不修改proxy处理机制

`dev.sh` 和 `Makefile` 的proxy自动禁用机制保持不变,文档重组会整合 `PROXY_ISSUE_FIX.md` 到 `docs/troubleshooting/archived/`。

### 📊 Constitution Check Summary
**Result**: **✅ ALL CHECKS PASSED**

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Micro-Frontend Isolation | ✅ Compliant | 无新微应用,现有应用独立性不变 |
| II. Wujie-First Architecture | ✅ Compliant | 扩展Wujie标准化能力 |
| III. Standard Vue 3 Simplicity | ✅ Compliant | 微应用保持标准结构 |
| IV. Shared Component Library | ✅ Compliant | 新功能通过shared库统一导出 |
| V. Mock-Driven Development | ✅ Compliant | 不影响现有mock系统 |
| VI. Component Single Responsibility | ✅ Compliant | 新模块职责单一明确 |
| Dynamic Route System | ✅ Compliant | 无路由修改 |
| Communication Patterns | ✅ Enhanced | 新增EventBus监控,向后兼容 |
| Proxy Handling | ✅ Compliant | 机制保持不变 |

**No complexity tracking needed** - All constitution principles satisfied.

## Project Structure

### Documentation (this feature)

```
specs/003-/
├── spec.md              # Feature specification (已完成)
├── plan.md              # This file (当前正在生成)
├── research.md          # Phase 0 output (下一步生成)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (配置契约)
│   ├── api-config.md
│   ├── wujie-lifecycle.md
│   └── style-system.md
├── checklists/
│   └── requirements.md  # 需求质量检查清单(已完成)
└── tasks.md             # Phase 2 output (/speckit.tasks - 未创建)
```

### Source Code (repository root)

**Structure Decision**: **Web微前端架构(Monorepo)** - 项目为1主应用+6微应用+1共享库的微前端架构,使用pnpm workspace管理

```
k8s-agent-web/
├── main-app/                        # 主应用(port 3000)
│   ├── src/
│   │   ├── config/
│   │   │   └── micro-apps.config.js  # 微应用配置(Feature 002)
│   │   ├── micro/
│   │   │   └── wujie-config.js       # Wujie配置 [本feature扩展]
│   │   ├── store/
│   │   │   ├── user.js               # 用户状态
│   │   │   └── shared-state.js       # 共享状态管理器(Feature 002)
│   │   ├── router/
│   │   │   ├── index.js              # 静态路由
│   │   │   └── dynamic.js            # 动态路由
│   │   ├── views/
│   │   │   ├── MicroAppContainer.vue # 微应用容器
│   │   │   └── ErrorBoundary.vue     # 错误边界(Feature 002)
│   │   └── main.js                   # 入口文件 [本feature修改:预加载逻辑]
│   └── package.json                  # [本feature修改:Vite版本统一]
│
├── shared/                          # 共享库 @k8s-agent/shared
│   ├── src/
│   │   ├── config/                  # [本feature新增]
│   │   │   ├── api.config.js        # API配置常量
│   │   │   ├── wujie-lifecycle.js   # Wujie生命周期钩子模板
│   │   │   └── vxeTable.js          # (已存在)
│   │   ├── utils/                   # [本feature扩展]
│   │   │   ├── request.js           # axios实例工厂(基于api.config)
│   │   │   └── (其他已存在)
│   │   ├── styles/                  # [本feature新增]
│   │   │   ├── _variables.scss      # 设计变量(15+变量)
│   │   │   ├── _mixins.scss         # 可复用mixin(5+)
│   │   │   └── global.scss          # 全局样式入口
│   │   ├── components/              # (已存在:VbenLayout,VxeBasicTable等)
│   │   ├── composables/             # (已存在:usePagination,useTable等)
│   │   └── core/
│   │       └── route-sync.js        # RouteSync类(Feature 002)
│   ├── dist/                        # 构建产物(ESM,已优化)
│   └── package.json                 # peerDependencies定义
│
├── dashboard-app/                   # 微应用1(port 3001)
├── agent-app/                       # 微应用2(port 3002)
├── cluster-app/                     # 微应用3(port 3003)
├── monitor-app/                     # 微应用4(port 3004)
├── system-app/                      # 微应用5(port 3005)
├── image-build-app/                 # 微应用6(port 3006)
│   # 所有微应用统一结构:
│   ├── src/
│   │   ├── api/
│   │   │   └── request.js           # [本feature修改:导入createRequest]
│   │   ├── views/                   # 页面组件
│   │   ├── router/                  # 标准Vue Router
│   │   └── main.js                  # 标准Vue 3入口
│   └── package.json                 # [本feature修改:Vite版本统一]
│
├── docs/                            # [本feature新增:重组后文档目录]
│   ├── architecture/                # 架构文档(Wujie迁移、微前端设计)
│   ├── features/                    # 功能文档(Feature 001/002/003汇总)
│   ├── troubleshooting/             # 故障排查
│   │   └── archived/                # 历史修复文档(*FIX*.md归档)
│   ├── components/                  # 组件文档(VXE Table等)
│   └── README.md                    # 快速入门(合并QUICK_START*)
│
├── specs/                           # 需求文档(保持原位置)
│   ├── 001-/
│   ├── 002-/
│   └── 003-/                        # 本feature
│
├── tests/                           # 测试
│   ├── e2e/                         # E2E测试(Playwright)
│   │   ├── config-consistency.spec.js  # [本feature新增]
│   │   └── shared-lib.spec.js          # (已存在)
│   └── build-benchmark.js           # 构建性能基准
│
├── .npmrc                           # [本feature修改:public-hoist-pattern]
├── package.json                     # [本feature修改:精确版本锁定]
├── pnpm-workspace.yaml              # workspace定义(不变)
├── Makefile                         # 开发命令(不变)
├── dev.sh                           # 启动脚本(不变)
├── CLAUDE.md                        # [本feature修改:更新文档路径引用]
└── README.md                        # (保持)
```

**变更范围汇总**:
- **新增文件**: 8个 (docs目录+shared配置+shared样式)
- **修改文件**: 14个 (7个应用package.json + 7个应用request.js + 根package.json + .npmrc + CLAUDE.md + wujie-config.js + main.js)
- **移动/删除文件**: 108个MD文件 → 30个MD文件(合并/归档)

## Complexity Tracking

**Not applicable** - Constitution Check全部通过,无需复杂度跟踪表。

本feature为标准化优化,所有变更符合现有架构原则,未引入新复杂度。

---

## Phase 0: Research & Technical Decisions

**Status**: ✅ 已完成 (文件: `research.md`)

**研究主题** (已详细展开):
1. ✅ Wujie生命周期钩子最佳实践(beforeLoad/afterMount错误处理)
   - 标准错误处理模板(`createLifecycleHooks`工厂函数)
   - 错误上报机制(`reportError` + Sentry集成)
   - ErrorBoundary组件集成
2. ✅ Wujie预加载API使用(preloadApp + requestIdleCallback)
   - 3层预加载策略(immediate/idle/onDemand)
   - Safari polyfill实现
   - 性能监控埋点
3. ✅ Wujie Shadow DOM与Ant Design Vue集成(getPopupContainer适配)
   - 全局ConfigProvider配置方案
   - usePopupContainer composable实现
   - 8种受影响组件列表
4. ✅ EventBus高频事件监控实现(100次/秒阈值检测)
   - EventBusMonitor类实现(拦截$emit)
   - 滑动窗口频率统计(1秒窗口)
   - 调试报告API(`getReport()`)
5. ✅ pnpm workspace依赖提升策略(public-hoist-pattern配置)
   - 9类依赖提升配置
   - 预期减少37.5% node_modules大小
   - 重复依赖检测命令
6. ✅ Sass变量系统设计(CSS变量穿透Shadow DOM)
   - Sass变量+CSS变量双轨制
   - 5大类15+变量(颜色/间距/排版/圆角/z-index)
   - 5个常用mixins(flex/ellipsis/card/scrollbar/responsive)
7. ✅ Vite 5构建产物兼容性(从Vite 4升级注意事项)
   - 废弃API迁移(`import.meta.globEager`)
   - 插件版本兼容性检查
   - 构建产物对比测试

## Phase 1: Design & Implementation Artifacts

**Status**: ✅ 已完成

**已生成文件**:
- ✅ `data-model.md`: 8类数据模型定义(API配置/Wujie配置/样式变量/状态管理/EventBus事件/文档结构/依赖版本/性能监控)
- ✅ `contracts/api-config.contract.md`: API配置契约(createAxiosInstance接口/错误处理规范/测试契约)
- ✅ `contracts/wujie-lifecycle.contract.md`: 生命周期钩子契约(createLifecycleHooks接口/错误上报/清理机制)
- ✅ `contracts/route-events.contract.md`: 路由同步事件协议(RouteSync类接口/防抖去重机制/错误处理)
- ✅ `contracts/state-events.contract.md`: 状态同步事件协议(SharedStateManager类/4个标准命名空间/持久化规范)
- ✅ `quickstart.md`: 开发者快速开始指南(11个实施步骤/验收checklist/常见问题)

## Next Steps

**Current Status**: ✅ Planning完成 (Phase 0 + Phase 1已生成)

**后续命令**: `/speckit.tasks` - 生成tasks.md任务分解

**实施顺序**:
1. ✅ Spec完成 (`/speckit.specify`)
2. ✅ Clarification完成 (`/speckit.clarify` - 5个关键决策)
3. ✅ **Plan完成** (`/speckit.plan` - Phase 0研究 + Phase 1设计)
4. ⏭️ Tasks生成 (`/speckit.tasks` - 下一步)
5. ⏭️ 实施 (`/speckit.implement` - 最终)

**已生成文档汇总**:
```
specs/003-/
├── spec.md                               ✅ 需求规格(35个FR, 10个SC)
├── plan.md                               ✅ 实施计划(本文档)
├── research.md                           ✅ Phase 0研究(7个技术主题)
├── data-model.md                         ✅ Phase 1数据模型(8类模型)
├── quickstart.md                         ✅ 快速开始指南(11个步骤)
├── contracts/
│   ├── api-config.contract.md           ✅ API配置契约
│   ├── wujie-lifecycle.contract.md      ✅ 生命周期契约
│   ├── route-events.contract.md         ✅ 路由同步契约
│   └── state-events.contract.md         ✅ 状态同步契约
└── checklists/
    └── requirements.md                   ✅ 需求验收清单(全部通过)
```

---

**Plan Version**: 1.0.0 | **Last Updated**: 2025-10-10 | **Status**: Complete
