# 微前端架构优化 - 快速启动指南

## 🚀 5分钟快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置 Feature Flags

编辑 `main-app/.env.development`:

```bash
# 选项A: 完整启用 (推荐测试新功能)
VITE_FEATURE_UNIFIED_CONFIG=true
VITE_FEATURE_STANDARD_ROUTE_SYNC=true

# 选项B: 只启用配置管理
VITE_FEATURE_UNIFIED_CONFIG=true
VITE_FEATURE_STANDARD_ROUTE_SYNC=false

# 选项C: 关闭所有新功能 (Legacy 模式)
VITE_FEATURE_UNIFIED_CONFIG=false
VITE_FEATURE_STANDARD_ROUTE_SYNC=false
```

### 3. 启动服务

```bash
# 方式1: 使用 Makefile (推荐)
make dev

# 方式2: 使用 pnpm
pnpm dev

# 方式3: 使用 dev.sh (自动处理代理)
./dev.sh
```

### 4. 访问应用

打开浏览器访问: **http://localhost:3000**

登录凭据:
- 用户名: `admin`
- 密码: `admin123`

### 5. 验证功能

#### 验证配置管理 (如果启用)

1. 打开浏览器控制台
2. 应该看到:
   ```
   [CONFIG] ✅ Configuration validated successfully
   [APP] 🚀 Application starting with validated configuration
   ```
3. 导航到任意微应用
4. 控制台显示:
   ```
   [MicroAppContainer] Loading micro app: xxx-app from URL: //localhost:300X
   ```

#### 验证路由同步 (如果启用)

1. 在浏览器地址栏直接输入: `http://localhost:3000/system/users`
2. 页面应该立即加载,无白屏
3. 控制台显示:
   ```
   [System App] ✅ RouteSync listener set up
   [RouteSync] Notified system-app: {path: '/users', ...}
   ```

---

## 📖 核心文档

- **详细测试指南**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **实施总结**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **任务列表**: [specs/002-/tasks.md](./specs/002-/tasks.md)

---

## 🎯 新增功能

### ✅ User Story 1: 统一配置管理中心

**作用**: 所有微应用 URL 从单一配置文件读取

**文件**: `main-app/src/config/micro-apps.config.js`

**使用**:
```javascript
import { getMicroAppUrl } from '@/config/micro-apps.config.js'

const url = getMicroAppUrl('dashboard-app')  // 自动根据环境返回 URL
```

**好处**:
- 修改端口只需改一处
- 支持多环境 (dev/test/prod)
- 启动时验证配置

---

### ✅ User Story 2: 标准化路由同步协议

**作用**: 移除 setTimeout,使用标准化防抖事件

**文件**: `shared/src/core/route-sync.js`

**使用**:
```javascript
// 主应用侧
const routeSync = new RouteSync('xxx-app', wujieBus)
routeSync.notifyMicroApp('/users', { page: 1 })  // 自动防抖 50ms

// 微应用侧
const routeSync = new RouteSync('xxx-app', window.$wujie.bus, router)
routeSync.setupListener()  // 自动监听并导航
```

**好处**:
- 无 setTimeout hack
- 深度路由立即加载
- 快速切换无串台
- 自动错误处理

---

## 🔧 常见问题

### Q: 端口被占用怎么办?

```bash
make kill    # 杀掉所有端口 3000-3006
make dev     # 重新启动
```

### Q: 修改配置不生效?

1. 完全重启服务 (Ctrl+C 停止,然后重新启动)
2. 清空浏览器缓存 (Ctrl+Shift+R 硬刷新)

### Q: HTTP 代理拦截 localhost?

使用 `./dev.sh` 启动,会自动禁用代理

### Q: 如何回滚到旧版本?

修改 `.env.development`:
```bash
VITE_FEATURE_UNIFIED_CONFIG=false
VITE_FEATURE_STANDARD_ROUTE_SYNC=false
```

重启服务即可。

---

## 📊 测试检查清单

- [ ] 启动所有服务成功
- [ ] 登录成功
- [ ] 所有6个微应用可以访问
- [ ] 深度路由直接导航无白屏 (如 `/system/users`)
- [ ] 快速切换路由无异常
- [ ] 浏览器控制台无错误

---

## 🎓 下一步

1. 阅读 [TESTING_GUIDE.md](./TESTING_GUIDE.md) 进行完整测试
2. 填写测试报告
3. 根据测试结果决定是否部署

---

**问题反馈**: 在项目 Issue 中提交

**快乐开发! 🚀**
