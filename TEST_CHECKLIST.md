# 微前端架构优化 - 快速测试执行清单

**执行时间**: 预计 30-45 分钟
**测试范围**: User Story 1-4 (MVP 核心功能)

---

## 🚀 第一步: 启动服务 (5分钟)

### 1.1 停止已有服务
```bash
make kill
```

### 1.2 启动所有服务
```bash
# 推荐方式 (自动处理代理问题)
./dev.sh

# 或使用 make
make dev
```

### 1.3 等待服务启动完成
观察终端输出,确认所有7个服务都启动成功:
- ✓ Main App (3000)
- ✓ Dashboard (3001)
- ✓ Agent (3002)
- ✓ Cluster (3003)
- ✓ Monitor (3004)
- ✓ System (3005)
- ✓ Image Build (3006)

---

## 🧪 第二步: 基础功能测试 (5分钟)

### 2.1 访问主应用
打开浏览器: http://localhost:3000

### 2.2 登录
- 用户名: `admin`
- 密码: `admin123`

### 2.3 快速检查
- [ ] 登录成功
- [ ] 仪表盘正常显示
- [ ] 左侧菜单可见
- [ ] 无明显错误提示

---

## 📊 第三步: User Story 1 - 配置管理测试 (5分钟)

### 3.1 检查启动日志
打开浏览器控制台 (F12),查看 Console:

**期望看到**:
```
[CONFIG] Validating micro-apps configuration...
[CONFIG] ✅ Configuration validated successfully
[APP] 🚀 Application starting with validated configuration
```

### 3.2 测试配置驱动的 URL 解析
导航到各个微应用,控制台应显示:
```
[MicroAppContainer] Loading micro app: dashboard-app from URL: //localhost:3001
[MicroAppContainer] Loading micro app: system-app from URL: //localhost:3005
```

**测试步骤**:
- [ ] 点击 "仪表盘" → 检查控制台 URL
- [ ] 点击 "系统管理" → 检查控制台 URL
- [ ] 点击 "Agent 管理" → 检查控制台 URL

**✅ 通过标准**: 每个微应用都显示正确的 localhost URL

---

## 🔄 第四步: User Story 2 - 路由同步测试 (10分钟)

### 4.1 深度路由直接导航测试

**测试 1: 直接访问深度路由**
1. 在浏览器地址栏输入: `http://localhost:3000/system/users`
2. 按 Enter
3. **期望**: 页面立即加载用户列表,无白屏

**控制台期望日志**:
```
[System App] ✅ RouteSync listener set up
[RouteSync] Notified system-app: {path: '/users', ...}
[RouteSync] system-app received route change: ...
```

**重复测试其他路由**:
- [ ] `/system/roles` - 角色管理
- [ ] `/system/permissions` - 权限管理
- [ ] `/agents` - Agent 列表
- [ ] `/clusters` - 集群列表

**✅ 通过标准**:
- 所有深度路由直接访问无白屏
- 加载时间 < 2秒
- 控制台显示 RouteSync 日志

### 4.2 快速切换测试

**测试步骤**:
1. 快速连续点击: 仪表盘 → Agent → 系统 → 集群
2. 在系统管理内快速切换: 用户 → 角色 → 权限

**观察**:
- [ ] 每次切换都显示正确内容
- [ ] 无内容混杂或串台
- [ ] 控制台无错误

**✅ 通过标准**: 内容正确,无串台,无错误

---

## 🔗 第五步: User Story 3 - 共享状态测试 (5分钟)

### 5.1 检查 SharedStateManager 初始化

**控制台期望日志**:
```
[SharedStateManager] Initialized with Wujie bus
[SharedStateManager] Setting up bus listeners
```

### 5.2 测试跨应用状态共享 (如果有实现的功能)

**注意**: 这个功能需要具体的使用场景才能测试。如果没有实际使用共享状态的功能,可以跳过详细测试。

**基础检查**:
- [ ] 应用启动时 SharedStateManager 初始化成功
- [ ] 无相关错误日志

**✅ 通过标准**: 初始化成功,无错误

---

## 🛡️ 第六步: User Story 4 - 错误边界测试 (10分钟)

### 6.1 测试加载超时

**测试步骤**:
1. 停止某个微应用 (例如 System App):
   ```bash
   # 在新终端中
   lsof -ti:3005 | xargs kill -9
   ```
2. 在浏览器访问: `http://localhost:3000/system`
3. 等待 5 秒

**期望结果**:
- [ ] 显示错误页面 (Ant Design Result 组件)
- [ ] 有 "重试" 按钮
- [ ] 有 "返回首页" 按钮
- [ ] 控制台显示超时错误日志

**控制台期望日志**:
```
[MicroAppContainer] Micro-app loading timeout: system-app
[ERROR REPORTER] ⚠️ CRITICAL ERROR: Micro-app loading timeout after 5000ms
```

### 6.2 测试错误恢复

**测试步骤**:
1. 重新启动 System App:
   ```bash
   cd system-app && pnpm dev
   ```
2. 点击错误页面的 "重试" 按钮

**期望结果**:
- [ ] 点击重试后,微应用成功加载
- [ ] 错误页面消失,显示正常内容

### 6.3 测试其他应用隔离

**测试步骤**:
1. System App 显示错误时
2. 访问其他微应用 (Dashboard, Agent)

**期望结果**:
- [ ] 其他微应用正常工作
- [ ] 错误隔离,不影响其他应用

**完成后重启 System App**:
```bash
cd system-app && pnpm dev
```

**✅ 通过标准**:
- 超时检测工作
- 错误 UI 正确显示
- 重试功能正常
- 错误隔离有效

---

## 📝 第七步: 记录测试结果 (5分钟)

### 7.1 填写测试报告

创建文件: `TEST_RESULTS.md`

```markdown
# 测试执行报告

**执行日期**: 2025-10-10
**执行人**: [您的名字]
**测试环境**: 开发环境 (localhost)

## 功能开关配置

当前配置 (`main-app/.env.development`):
- VITE_FEATURE_UNIFIED_CONFIG: true/false
- VITE_FEATURE_STANDARD_ROUTE_SYNC: true/false
- VITE_FEATURE_SHARED_STATE: true/false (如果存在)

## User Story 1: 统一配置管理

| 测试项 | 结果 | 备注 |
|--------|------|------|
| 配置验证启动日志 | ✅/❌ | |
| Dashboard URL 解析 | ✅/❌ | |
| System URL 解析 | ✅/❌ | |
| Agent URL 解析 | ✅/❌ | |

## User Story 2: 标准化路由同步

| 测试项 | 结果 | 加载时间 | 备注 |
|--------|------|----------|------|
| /system/users 直接导航 | ✅/❌ | ___ms | |
| /system/roles 直接导航 | ✅/❌ | ___ms | |
| /agents 直接导航 | ✅/❌ | ___ms | |
| 快速切换无串台 | ✅/❌ | | |
| RouteSync 日志正确 | ✅/❌ | | |

## User Story 3: 共享状态管理

| 测试项 | 结果 | 备注 |
|--------|------|------|
| SharedStateManager 初始化 | ✅/❌ | |
| 无相关错误 | ✅/❌ | |

## User Story 4: 错误边界和降级

| 测试项 | 结果 | 备注 |
|--------|------|------|
| 加载超时检测 (5秒) | ✅/❌ | |
| 错误 UI 显示 | ✅/❌ | |
| 重试按钮功能 | ✅/❌ | |
| 返回首页按钮 | ✅/❌ | |
| 错误隔离 | ✅/❌ | |
| 错误日志记录 | ✅/❌ | |

## 发现的问题

1. [如果有问题,在此列出]
2.
3.

## 性能指标

| 指标 | 目标 | 实际 | 达标 |
|------|------|------|------|
| 首屏加载 | < 3s | ___s | ✅/❌ |
| 深度路由加载 | < 2s | ___s | ✅/❌ |
| 路由切换 | < 500ms | ___ms | ✅/❌ |

## 总体评估

- **通过率**: ___%
- **关键问题**:
- **建议**:

## 下一步行动

- [ ] 修复发现的问题
- [ ] 性能优化
- [ ] 准备生产部署
- [ ] 继续实施 User Story 5
```

---

## ✅ 测试完成检查清单

完成以下所有项目即可认为测试通过:

- [ ] 所有服务启动成功
- [ ] 登录和基础导航正常
- [ ] 配置验证日志正确
- [ ] 所有深度路由直接访问无白屏
- [ ] 快速切换无串台
- [ ] SharedStateManager 初始化成功
- [ ] 错误超时检测工作
- [ ] 错误 UI 和重试功能正常
- [ ] 测试报告已填写
- [ ] 无阻塞性问题

---

## 🐛 常见问题快速修复

### 问题 1: 端口占用
```bash
make kill
make dev
```

### 问题 2: 配置未生效
```bash
# 完全重启
Ctrl+C
make dev
# 硬刷新浏览器
Ctrl+Shift+R
```

### 问题 3: 看不到日志
- 打开浏览器开发者工具 (F12)
- 切换到 Console 标签
- 启用 Preserve log (保留日志)

### 问题 4: 白屏
1. 检查控制台错误
2. 检查 Network 标签,确认资源加载
3. 确认所有服务都在运行: `make status`

---

## 📞 需要帮助?

如果测试过程中遇到问题:

1. 查看 `TESTING_GUIDE.md` 详细指南
2. 检查 `TROUBLESHOOTING.md` (如果存在)
3. 记录详细错误信息:
   - 浏览器控制台完整日志
   - 服务器终端输出
   - 复现步骤

---

**预计总时间**: 30-45 分钟
**建议**: 逐步进行,完成一个步骤再进入下一个

**祝测试顺利! 🚀**
