# Feature Specification: 项目结构优化 - 文档重组与配置标准化

**Feature Branch**: `003-`
**Created**: 2025-10-10
**Status**: Draft
**Input**: 基于项目结构分析报告，优化文档组织、统一配置管理、标准化依赖版本，提升项目可维护性

## Clarifications

### Session 2025-10-10

- Q: 是否需要标准化各微应用的Wujie生命周期钩子配置，以统一资源加载、错误处理和性能优化行为？ → A: 是 - 在shared库提供标准生命周期钩子配置模板，所有微应用统一使用
- Q: 6个微应用中，哪些应该在主应用启动时预加载以优化用户体验？ → A: 预加载所有6个微应用（最佳用户体验，但增加初始加载时间）
- Q: 微应用是否应该使用Wujie的Shadow DOM样式隔离？ → A: 使用Shadow DOM - 完全隔离，但需要处理Ant Design Vue组件挂载问题
- Q: 是否需要在生命周期钩子中集成通信性能监控和频率限制？ → A: 监控EventBus事件频率，超过阈值（如100次/秒）时发出警告
- Q: 文档重组应如何执行以降低风险？ → A: 一次性迁移 - 单个PR完成所有文档重组（最快但风险高）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 快速定位所需文档 (Priority: P1)

开发者在遇到问题时，能够在3次点击内找到相关文档，不再迷失在108个分散的Markdown文件中。所有文档按功能分类组织在 `docs/` 目录下，历史修复文档归档到 `docs/troubleshooting/archived/`。

**Why this priority**: 当前文档过度膨胀（108个MD文件分散在根目录、子应用、shared等多处），导致新成员入职困难、问题排查效率低下。这是影响开发效率的首要问题。

**Independent Test**: 随机选择一个历史问题（如"微应用加载超时"），测试开发者能否在3分钟内通过文档目录定位到解决方案。预期目录结构为 `docs/troubleshooting/archived/bootstrap-timeout.md`。

**Acceptance Scenarios**:

1. **Given** 开发者需要了解Wujie架构，**When** 访问 `docs/architecture/wujie-migration.md`，**Then** 能看到整合后的迁移指南（原12个WUJIE_*.md文件内容）
2. **Given** 开发者需要使用VXE Table组件，**When** 访问 `docs/components/vxe-table.md`，**Then** 能看到完整的使用指南（原7个VXE_TABLE_*.md合并）
3. **Given** 开发者遇到代理错误，**When** 在 `docs/troubleshooting/archived/` 搜索"proxy"，**Then** 能找到历史问题及解决方案

---

### User Story 2 - 统一API调用行为 (Priority: P1)

所有微应用使用统一的API配置（baseURL、timeout、错误处理），避免因配置不一致导致的难以排查的bug。

**Why this priority**: 当前7个应用的 `request.js` 配置存在差异（main-app使用 `/api/v1` 和30s超时，其他应用使用 `/api` 和10s超时），已导致跨应用调用时出现路径错误和超时不一致问题。

**Independent Test**: 在所有微应用中调用同一个API端点，验证请求路径、超时时间、错误处理行为完全一致。可通过网络抓包工具验证请求headers和配置。

**Acceptance Scenarios**:

1. **Given** 任意微应用需要调用API，**When** 使用 `createRequest()` 创建请求实例，**Then** 默认使用 `/api/v1` 作为baseURL和15秒超时
2. **Given** API返回401错误，**When** 任意微应用收到响应，**Then** 自动清除token并跳转登录页
3. **Given** 特殊微应用需要自定义超时，**When** 调用 `createRequest({ timeout: 60000 })`，**Then** 可覆盖默认配置但保持其他行为一致

---

### User Story 3 - 统一构建环境 (Priority: P2)

所有应用使用相同版本的Vite和核心依赖，避免构建行为差异和版本冲突。

**Why this priority**: 当前主应用使用Vite 5.0.4，其他6个微应用使用Vite 4.4.9，导致构建输出格式、HMR行为、插件兼容性存在差异，增加了问题排查难度。

**Independent Test**: 在所有应用运行 `pnpm build`，验证构建输出格式一致、无版本冲突警告。检查 `package.json` 确认所有应用Vite版本为 `^5.0.4`。

**Acceptance Scenarios**:

1. **Given** 开发者运行 `pnpm install`，**When** 在任意应用查看Vite版本，**Then** 所有应用Vite版本统一为5.0.4
2. **Given** 开发者修改shared库代码，**When** 在任意微应用中使用HMR，**Then** 热更新行为一致（无需刷新页面）
3. **Given** 执行根目录 `pnpm build`，**When** 构建完成，**Then** 所有应用构建日志格式一致、无依赖冲突警告

---

### User Story 4 - 样式变量复用 (Priority: P3)

开发者在编写组件样式时，使用统一的设计变量（颜色、间距、圆角等），确保UI一致性。

**Why this priority**: 当前各微应用样式文件内容空缺，缺少统一的主题变量，导致开发者hardcode颜色值，难以实现主题切换（如暗色模式）。

**Independent Test**: 在任意微应用新建组件，导入 `@k8s-agent/shared/styles/variables.scss`，使用 `$primary-color` 等变量，验证样式生效且与Ant Design Vue主题色一致。

**Acceptance Scenarios**:

1. **Given** 开发者新建Vue组件，**When** 导入 `@import '@k8s-agent/shared/styles/variables'`，**Then** 可使用 `$primary-color`、`$spacing-unit` 等预定义变量
2. **Given** 需要实现卡片阴影效果，**When** 使用 `@include card-shadow` mixin，**Then** 样式与其他组件保持一致
3. **Given** 产品要求调整主题色，**When** 修改 `variables.scss` 中的 `$primary-color`，**Then** 所有应用颜色统一更新

---

### Edge Cases

- 文档重组时如何处理外部链接？（解决方案：使用相对路径链接，保持 `specs/` 目录结构不变）
- 如果某个微应用需要特殊的API超时配置怎么办？（解决方案：`createRequest()` 支持参数覆盖）
- Vite版本升级是否会破坏现有构建产物？（解决方案：在升级前备份dist目录，验证构建输出一致）
- 样式变量更新后是否需要重新构建所有应用？（解决方案：开发模式HMR自动更新，生产环境需重新构建）
- 微应用加载失败时如何处理？（解决方案：标准生命周期钩子中实现降级UI，显示错误信息和重试按钮）
- 某个微应用需要特殊的生命周期逻辑怎么办？（解决方案：标准钩子模板支持通过参数传入自定义扩展函数）
- Ant Design Vue弹出组件在Shadow DOM中显示异常怎么办？（解决方案：配置getPopupContainer指向Shadow DOM容器，在shared库提供统一适配函数）
- 第三方组件库不支持Shadow DOM如何处理？（解决方案：在生命周期钩子中动态修改组件挂载容器，或使用CSS变量穿透Shadow DOM边界）

## Requirements *(mandatory)*

### Functional Requirements

#### 文档重组

- **FR-001**: 系统必须将根目录的44个MD文档重组到 `docs/` 分类目录，包括 `architecture/`、`features/`、`troubleshooting/`、`components/` 子目录
- **FR-002**: 系统必须整合重复文档（如QUICK_START.md、QUICKSTART.md、START_GUIDE.md合并为docs/README.md）
- **FR-003**: 系统必须将历史修复文档（*FIX*.md）归档到 `docs/troubleshooting/archived/`
- **FR-004**: 系统必须将shared目录下7个VXE_TABLE相关文档合并为单一文档 `docs/components/vxe-table.md`
- **FR-005**: 系统必须保留 `CLAUDE.md`（项目总览）和 `specs/` 目录（需求文档）在原位置
- **FR-033**: 文档重组必须在单个Git提交中完成（一次性迁移所有文档，避免中间状态）
- **FR-034**: 文档迁移前必须在Git中创建备份分支（命名为 `backup-docs-before-003`），确保可回滚
- **FR-035**: 文档迁移完成后，必须更新CLAUDE.md中所有文档路径引用（从旧路径更新为docs/目录路径）

#### API配置统一

- **FR-006**: 系统必须在 `shared/src/config/api.config.js` 定义统一的API配置常量（baseURL、timeout、headers）
- **FR-007**: 系统必须在 `shared/src/utils/request.js` 提供 `createRequest()` 工厂函数，基于统一配置创建axios实例
- **FR-008**: 所有微应用的 `src/api/request.js` 必须替换为导入 `createRequest()` 的统一实现
- **FR-009**: 统一配置必须支持环境变量覆盖（通过 `VITE_API_BASE_URL`）
- **FR-010**: 统一配置必须包含标准拦截器逻辑（401自动跳转登录、错误提示）

#### Wujie生命周期钩子标准化

- **FR-019**: 系统必须在 `shared/src/config/wujie-lifecycle.js` 提供标准生命周期钩子配置模板，包括beforeLoad、afterMount、beforeUnmount等钩子
- **FR-020**: 标准生命周期钩子必须实现统一错误处理（beforeLoad失败时显示降级UI、记录错误日志）
- **FR-021**: 标准生命周期钩子必须实现统一加载指示器（beforeLoad触发loading、afterMount隐藏loading）
- **FR-022**: 主应用的微应用配置必须使用标准生命周期钩子模板（通过导入 `shared/src/config/wujie-lifecycle.js`）
- **FR-023**: 标准生命周期钩子必须支持自定义扩展（允许微应用通过参数传入额外逻辑）
- **FR-024**: 系统必须在主应用启动时预加载所有6个微应用（dashboard、agent、cluster、monitor、system、image-build），使用Wujie的preloadApp API
- **FR-025**: 预加载配置必须在主应用登录成功后执行（避免未授权状态下加载微应用资源）
- **FR-026**: 预加载过程必须在后台静默执行，不阻塞主应用UI渲染（使用requestIdleCallback或类似机制）
- **FR-030**: 系统必须在afterMount钩子中初始化EventBus通信监控器，记录每个事件类型的触发频率（事件类型、时间戳、源应用）
- **FR-031**: 通信监控器必须每秒统计事件频率，当任意事件类型超过100次/秒阈值时，在控制台输出警告（包含事件名、频率、源应用信息）
- **FR-032**: 通信监控器必须支持开发/生产环境区分（开发环境启用详细日志，生产环境仅记录超阈值事件）

#### 依赖版本统一

- **FR-011**: 所有应用的 `package.json` 必须使用Vite `^5.0.4`
- **FR-012**: 所有应用的 `ant-design-vue` 必须使用 `^4.0.7`
- **FR-013**: 根目录 `package.json` 必须使用精确版本号锁定关键依赖（避免 `^` 符号）
- **FR-014**: 系统必须配置 `.npmrc` 提升echarts和vxe-table等公共依赖到根node_modules

#### 样式标准化

- **FR-015**: 系统必须在 `shared/src/styles/` 创建样式基础设施，包括 `_variables.scss`（设计变量）、`_mixins.scss`（可复用mixin）、`global.scss`（全局样式入口）
- **FR-016**: `_variables.scss` 必须定义至少15个设计变量（主题色、辅助色、间距、圆角、阴影）
- **FR-017**: `_mixins.scss` 必须提供至少5个常用mixin（flex布局、卡片阴影、文本省略、响应式断点、过渡动画）
- **FR-018**: 所有微应用必须能通过 `@import '@k8s-agent/shared/styles/variables'` 导入变量
- **FR-027**: 所有微应用必须启用Wujie的Shadow DOM样式隔离（通过配置 `degrade: false` 禁用降级模式）
- **FR-028**: 系统必须为Ant Design Vue组件提供Shadow DOM适配方案，确保Modal、Drawer、Tooltip等弹出组件正确挂载到Shadow DOM容器
- **FR-029**: 统一样式变量必须同时注入到主应用和Shadow DOM环境，保证微应用内外样式一致

### Key Entities

- **文档分类目录**: 包含 `architecture`（架构文档）、`features`（功能文档）、`troubleshooting`（故障排查）、`components`（组件文档）四个子目录
- **API配置对象**: 包含 `baseURL`（API基础路径）、`timeout`（超时时间）、`headers`（默认请求头）、`retryTimes`（重试次数）属性
- **样式变量集合**: 包含颜色变量（primary/success/warning/error）、尺寸变量（spacing/fontSize/borderRadius）、阴影变量（box-shadow预设）
- **Wujie生命周期钩子配置**: 包含beforeLoad（加载前）、afterMount（挂载后）、beforeUnmount（卸载前）、activated（激活）、deactivated（停用）等钩子函数及其统一实现逻辑

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 文档数量从108个减少至30个以内，根目录Markdown文件不超过5个（CLAUDE.md、README.md等核心文档）
- **SC-002**: 新成员在查找特定问题文档时，平均查找时间从10分钟降至3分钟以内（通过用户测试验证）
- **SC-003**: 所有7个应用的API请求配置一致性达到100%（baseURL、timeout、拦截器逻辑完全相同）
- **SC-004**: 依赖版本统一后，`pnpm install` 总时间减少20%（当前约180MB node_modules）
- **SC-005**: 所有应用构建时无版本冲突警告（`pnpm build` 输出零警告）
- **SC-006**: 样式变量使用率达到50%以上（在新开发组件中，50%以上颜色/间距使用变量而非hardcode）
- **SC-007**: 新增组件开发时，开发者能在5分钟内找到并应用样式规范（通过开发者反馈验证）
- **SC-008**: 用户首次访问任意微应用时，页面显示时间（Time to Interactive）≤ 500ms（得益于预加载机制，通过Performance API测量）
- **SC-009**: 主应用完成预加载所有微应用后，总内存占用增加 ≤ 100MB（通过Chrome DevTools Memory Profiler验证）
- **SC-010**: 正常使用场景下，EventBus通信频率不触发警告阈值（所有事件类型保持 < 100次/秒，通过开发环境监控日志验证）

## Out of Scope *(optional)*

- TypeScript迁移（作为独立feature在Q2执行）
- CI/CD流程搭建（作为独立feature在Q2执行）
- 测试覆盖率提升（作为独立feature分阶段执行）
- 组件文档自动生成（Storybook/VitePress集成）
- 性能优化（Bundle分析、代码分割）
- 国际化(i18n)支持

## Assumptions *(optional)*

- 所有开发者使用pnpm作为包管理器（已在package.json强制）
- 现有应用运行环境支持Vite 5.0.4（Node.js >= 16）
- 不影响现有功能正常运行（配置优化为非破坏性变更）
- 开发者熟悉Sass/SCSS语法
- API基础路径 `/api/v1` 已与后端团队确认
- 文档重组不影响CI/CD流程中的文档引用路径（假设CI使用相对路径）

## Dependencies *(optional)*

- 依赖pnpm workspace已正确配置（当前已满足）
- 依赖shared库构建流程正常（Vite Library Mode）
- 需要与后端团队确认API路径标准（/api vs /api/v1）
- 需要设计团队提供Ant Design Vue主题色规范
- 文档重组需要更新CLAUDE.md中的文件路径引用

## Risks & Mitigations *(optional)*

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| Vite 5升级导致构建失败 | 高 | 中 | 在feature分支先升级单个应用验证，保留回滚方案 |
| API配置统一破坏现有接口调用 | 高 | 低 | 使用环境变量区分，逐个应用灰度切换 |
| 文档链接失效 | 中 | 高 | 创建备份分支backup-docs-before-003，一次性迁移后更新CLAUDE.md所有引用 |
| 样式变量冲突 | 低 | 低 | 使用BEM命名规范，避免全局污染 |
| 依赖版本锁定导致安全漏洞 | 中 | 中 | 配置Dependabot自动检测，定期更新补丁版本 |
| Shadow DOM破坏Ant Design弹出组件 | 中 | 中 | 在shared库提供getPopupContainer统一适配函数，所有弹出组件使用该函数 |
| 预加载6个微应用导致内存溢出 | 低 | 低 | 在afterMount监控内存，超过100MB增量时发出警告，考虑降级为按需加载 |

## Future Enhancements *(optional)*

- **阶段2（Q2）**: 引入ESLint规则自动检测hardcode值，强制使用样式变量
- **阶段3（Q2）**: 实现暗色主题支持（基于统一的样式变量）
- **阶段4（Q3）**: 配置Bundle分析工具，优化echarts等大依赖加载
- **阶段5（Q3）**: 实现文档自动化（API文档从JSDoc生成，组件文档从Storybook生成）
- **长期**: 考虑将API配置管理升级为配置中心（支持运行时动态更新）
