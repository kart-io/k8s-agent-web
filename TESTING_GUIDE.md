# 微前端架构优化 - 测试验证指南

## 📋 实施概况

已完成 **User Story 1** 和 **User Story 2** (MVP 核心功能)的实现:

### ✅ User Story 1: 统一配置管理中心
**目标**: 单一配置源,环境感知URL解析

**实现内容**:
- 集中式配置文件 `/main-app/src/config/micro-apps.config.js`
- 所有6个微应用的配置集中管理
- 环境感知 URL 解析 (development/production)
- 启动时 JSON Schema 验证
- Feature flag: `VITE_FEATURE_UNIFIED_CONFIG`

### ✅ User Story 2: 标准化路由同步协议
**目标**: 移除setTimeout hack,使用debounced事件协议

**实现内容**:
- RouteSync 类 `/shared/src/core/route-sync.js`
- 50ms 防抖机制
- 错误处理 (route:error 事件)
- 移除了 setTimeout 和 lastSyncedPath hack
- Feature flag: `VITE_FEATURE_STANDARD_ROUTE_SYNC`
- 所有6个微应用已集成

---

## 🚀 启动服务

### 方式一: 使用 Makefile (推荐)

```bash
# 停止所有已运行的服务
make kill

# 启动所有服务 (前台)
make dev

# 或者启动到后台
make dev-bg

# 查看日志
make logs

# 查看状态
make status
```

### 方式二: 使用 pnpm

```bash
# 启动所有服务
pnpm dev
```

### 方式三: 使用 dev.sh (处理代理问题)

```bash
./dev.sh
```

**服务端口**:
- Main App: http://localhost:3000
- Dashboard: http://localhost:3001
- Agent: http://localhost:3002
- Cluster: http://localhost:3003
- Monitor: http://localhost:3004
- System: http://localhost:3005
- Image Build: http://localhost:3006

---

## 🧪 测试计划

### Phase 1: 功能开关测试

#### 测试 1.1: 禁用所有新功能 (Legacy 模式)

**配置** (`main-app/.env.development`):
```bash
VITE_FEATURE_UNIFIED_CONFIG=false
VITE_FEATURE_STANDARD_ROUTE_SYNC=false
```

**预期结果**:
- 系统使用旧的硬编码 URL
- 使用旧的 setTimeout 路由同步
- 应用正常运行 (向后兼容)

**验证步骤**:
1. 启动服务: `make dev`
2. 打开浏览器: http://localhost:3000
3. 登录 (admin/admin123)
4. 浏览器控制台应显示:
   - `[CONFIG] Unified config feature disabled`
   - `[MicroAppContainer] Standard route sync feature disabled, using legacy sync`
5. 导航到各个微应用,应正常加载
6. 控制台应显示 setTimeout 延迟日志

---

#### 测试 1.2: 只启用统一配置 (User Story 1)

**配置**:
```bash
VITE_FEATURE_UNIFIED_CONFIG=true
VITE_FEATURE_STANDARD_ROUTE_SYNC=false
```

**预期结果**:
- 使用配置驱动的 URL 解析
- 启动时验证配置
- 仍使用旧的路由同步

**验证步骤**:
1. 修改 `.env.development` 配置
2. 重启服务: `make restart`
3. 浏览器控制台应显示:
   - `[CONFIG] Validating micro-apps configuration...`
   - `[CONFIG] ✅ Configuration validated successfully`
   - `[APP] 🚀 Application starting with validated configuration`
4. 导航到 `/dashboard`, 控制台显示:
   - `[MicroAppContainer] Loading micro app: dashboard-app from URL: //localhost:3001`
5. 测试配置修改:
   - 停止服务
   - 修改 `micro-apps.config.js` 中 dashboard-app 的端口为 3099
   - 重启服务
   - 控制台应显示尝试加载 `//localhost:3099`
   - 恢复端口为 3001

---

#### 测试 1.3: 启用所有新功能 (完整 MVP)

**配置**:
```bash
VITE_FEATURE_UNIFIED_CONFIG=true
VITE_FEATURE_STANDARD_ROUTE_SYNC=true
```

**预期结果**:
- 配置驱动 + 标准化路由同步
- 无 setTimeout
- 防抖机制生效

**验证步骤**:
1. 修改配置并重启
2. 控制台应显示:
   - `[CONFIG] ✅ Configuration validated successfully`
   - `[System App] ✅ RouteSync listener set up` (对所有6个微应用)
3. 测试路由同步 (见 Phase 2)

---

### Phase 2: User Story 1 - 配置管理验证

#### 测试 2.1: 配置验证 - 成功场景

**步骤**:
1. 确保 `VITE_FEATURE_UNIFIED_CONFIG=true`
2. 启动服务
3. 检查启动日志

**预期日志**:
```
[CONFIG] Validating micro-apps configuration...
[CONFIG] ✅ Configuration validated successfully
[APP] 🚀 Application starting with validated configuration
```

---

#### 测试 2.2: 配置验证 - 错误检测

**步骤**:
1. 修改 `micro-apps.config.js`, 制造错误:
   ```javascript
   'dashboard-app': {
     name: 'dashboard-app',
     port: 9999,  // 超出有效范围 3000-3999
     // ...
   }
   ```
2. 重启服务

**预期日志**:
```
[CONFIG] ❌ Port conflicts detected:
  - dashboard-app.port: Value 9999 exceeds maximum 3999
[APP] ⚠️  Application starting with configuration errors (using fallback)
```

3. 应用应仍能启动 (fallback 机制)
4. 恢复正确配置

---

#### 测试 2.3: 环境感知 URL 解析

**步骤**:
1. 导航到每个微应用
2. 浏览器控制台检查 URL

**预期结果** (development 环境):
- Dashboard: `//localhost:3001`
- Agent: `//localhost:3002`
- Cluster: `//localhost:3003`
- Monitor: `//localhost:3004`
- System: `//localhost:3005`
- Image Build: `//localhost:3006`

---

### Phase 3: User Story 2 - 路由同步验证

#### 测试 3.1: 深度路由直接导航 (核心测试)

**目标**: 验证直接导航到深度路由不会出现白屏

**步骤**:
1. 确保 `VITE_FEATURE_STANDARD_ROUTE_SYNC=true`
2. 直接在浏览器地址栏输入: `http://localhost:3000/system/users`
3. 按 Enter

**预期结果**:
- 页面立即加载,无白屏
- 2秒内显示内容
- 控制台显示:
  ```
  [System App] ✅ RouteSync listener set up
  [RouteSync] system-app received route change: {path: '/users', ...}
  [System App] Pushing to new route: /users
  ```

**重复测试其他深度路由**:
- `/system/roles`
- `/system/permissions`
- `/agents/list`
- `/clusters/list`

---

#### 测试 3.2: 快速路由切换 (防止串台)

**目标**: 验证快速切换不会出现路由冲突

**步骤**:
1. 快速连续点击导航:
   - Dashboard → Agents → System → Clusters
2. 在 System 内快速切换:
   - Users → Roles → Permissions

**预期结果**:
- 每次切换都正确显示对应内容
- 无内容混杂
- 控制台显示 debounce 生效:
  ```
  [RouteSync] Notified system-app: {path: '/permissions', timestamp: ...}
  ```
- 不应出现多个路由事件同时触发

---

#### 测试 3.3: 防抖机制验证

**目标**: 验证 50ms 防抖正常工作

**步骤**:
1. 在浏览器控制台启用时间戳显示:
   ```javascript
   console.timestamps = true
   ```
2. 在System应用内快速切换路由多次
3. 观察 `[RouteSync] Notified` 日志的时间间隔

**预期结果**:
- 多次快速切换只触发一次路由同步
- 时间间隔 >= 50ms
- 最后一次路由更改被执行

---

#### 测试 3.4: 路由错误处理

**目标**: 验证导航失败时错误事件被触发

**步骤**:
1. 导航到不存在的路由: `/system/invalid-route-xyz`

**预期结果**:
- 不崩溃
- 可能显示 404 或回退到默认页面
- 控制台可能显示:
  ```
  [RouteSync] Emitted route error for system-app: ...
  ```

---

### Phase 4: 性能验证

#### 测试 4.1: 首次加载性能

**步骤**:
1. 清空浏览器缓存
2. 打开 DevTools > Performance
3. 开始录制
4. 导航到 `http://localhost:3000`
5. 登录并导航到 `/system/users`
6. 停止录制

**预期指标**:
- 首屏加载时间 < 3秒
- 微应用加载时间 < 2秒
- 无明显 setTimeout 延迟

---

#### 测试 4.2: 路由切换性能

**步骤**:
1. 在同一微应用内切换路由
2. 测量切换时间

**预期结果**:
- Keep-alive 模式下切换 < 500ms
- 无可见的加载延迟

---

### Phase 5: 浏览器兼容性

**测试浏览器**:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (如果可用)

**测试功能**:
- 配置加载
- 路由同步
- 深度路由导航

---

## 🐛 常见问题排查

### 问题 1: 端口被占用

**症状**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决**:
```bash
make kill
make dev
```

---

### 问题 2: HTTP 代理拦截

**症状**: `GET http://localhost:3001/ 404 (Not Found)`

**解决**:
```bash
./dev.sh  # 自动禁用代理
```

---

### 问题 3: 配置未生效

**症状**: 修改配置后未生效

**解决**:
1. 完全重启服务 (Ctrl+C 停止,然后 `make dev`)
2. 清空浏览器缓存 (Hard Refresh: Ctrl+Shift+R)

---

### 问题 4: 白屏

**症状**: 导航到微应用显示白屏

**排查**:
1. 检查浏览器控制台错误
2. 确认微应用服务正在运行 (`make status`)
3. 检查 Network 标签,确认微应用资源加载成功
4. 验证 CORS 设置

---

## 📊 成功标准

### User Story 1: 统一配置管理

- [x] 所有微应用 URL 从配置文件读取
- [x] 配置验证在启动时执行
- [x] 配置错误时有降级机制
- [ ] 修改配置文件中的端口,所有引用自动更新 (待测试)
- [x] Feature flag 可以启用/禁用功能

### User Story 2: 标准化路由同步

- [x] 移除了所有 setTimeout 调用
- [x] 实现了 50ms 防抖机制
- [ ] 深度路由直接导航无白屏 (待测试)
- [ ] 快速切换无串台 (待测试)
- [x] 路由错误有错误处理
- [x] Feature flag 可以启用/禁用功能

---

## 📝 测试报告模板

测试完成后,请填写以下报告:

### 功能开关测试

| 测试场景 | Feature Flags | 结果 | 备注 |
|---------|--------------|------|------|
| Legacy 模式 | 全部关闭 | ⬜ 通过 ⬜ 失败 | |
| 只启用配置 | CONFIG=true, SYNC=false | ⬜ 通过 ⬜ 失败 | |
| 完整 MVP | 全部开启 | ⬜ 通过 ⬜ 失败 | |

### User Story 1: 配置管理

| 测试项 | 结果 | 备注 |
|--------|------|------|
| 配置验证成功 | ⬜ 通过 ⬜ 失败 | |
| 配置错误检测 | ⬜ 通过 ⬜ 失败 | |
| 环境感知 URL | ⬜ 通过 ⬜ 失败 | |
| 配置修改生效 | ⬜ 通过 ⬜ 失败 | |

### User Story 2: 路由同步

| 测试项 | 结果 | 加载时间 | 备注 |
|--------|------|----------|------|
| /system/users 直接导航 | ⬜ 通过 ⬜ 失败 | ___ms | |
| /system/roles 直接导航 | ⬜ 通过 ⬜ 失败 | ___ms | |
| 快速切换无串台 | ⬜ 通过 ⬜ 失败 | | |
| 防抖机制 | ⬜ 通过 ⬜ 失败 | | |
| 错误处理 | ⬜ 通过 ⬜ 失败 | | |

### 性能指标

| 指标 | 目标 | 实际 | 达标 |
|------|------|------|------|
| 首屏加载 | < 3s | ___s | ⬜ 是 ⬜ 否 |
| 微应用加载 | < 2s | ___s | ⬜ 是 ⬜ 否 |
| 路由切换 | < 500ms | ___ms | ⬜ 是 ⬜ 否 |

---

## 🎯 下一步建议

**如果测试全部通过**:
1. 提交当前实现到 Git
2. 决定是否继续实现 User Story 3-5:
   - US3: 应用间共享状态管理 (P2)
   - US4: 错误边界和降级策略 (P2)
   - US5: 共享组件库构建优化 (P3)

**如果测试失败**:
1. 记录具体失败场景和错误信息
2. 逐一修复问题
3. 重新测试

---

## 📄 文件清单

### 新增文件 (20+)

**配置和类型**:
- `/config/micro-apps.schema.json`
- `/main-app/src/types/micro-app-config.d.ts`
- `/shared/src/types/events.d.ts`

**工具和核心类**:
- `/main-app/src/utils/error-reporter.js`
- `/shared/src/utils/config-loader.js`
- `/shared/src/core/route-sync.js`

**配置文件**:
- `/main-app/src/config/micro-apps.config.js`

**测试文件**:
- `/main-app/src/config/__tests__/micro-apps.config.test.js`
- `/shared/src/core/__tests__/route-sync.test.js`
- `/tests/e2e/config.spec.js`
- `/tests/e2e/route-sync.spec.js`

### 修改文件 (13)

**主应用**:
- `/main-app/src/main.js` - 添加配置验证
- `/main-app/src/micro/wujie-config.js` - 使用配置驱动
- `/main-app/src/views/MicroAppContainer.vue` - 使用 RouteSync
- `/main-app/.env.development` - 添加 feature flags
- `/main-app/package.json` - 添加 Vitest

**所有微应用 (6个)**:
- `/dashboard-app/src/main.js`
- `/agent-app/src/main.js`
- `/cluster-app/src/main.js`
- `/monitor-app/src/main.js`
- `/system-app/src/main.js`
- `/image-build-app/src/main.js`

**共享包**:
- `/shared/package.json` - 添加 exports 路径

**根目录**:
- `/package.json` - 添加 Playwright

---

**测试愉快! 🚀**
