# 启动指南

## ✅ 所有应用已成功启动

已验证所有 6 个微前端应用可以正常启动。

## 🚀 启动步骤

### 方式 1: 一键启动所有应用（推荐）

```bash
cd web/
pnpm dev
```

这会同时启动所有应用：
- Main App (主应用) - http://localhost:3000
- Dashboard App - http://localhost:3001
- Agent App - http://localhost:3002
- Cluster App - http://localhost:3003
- Monitor App - http://localhost:3004
- System App - http://localhost:3005

### 方式 2: 单独启动某个应用

```bash
# 只启动主应用
pnpm dev:main

# 只启动某个子应用
pnpm dev:dashboard
pnpm dev:agent
pnpm dev:cluster
pnpm dev:monitor
pnpm dev:system
```

## 📝 登录信息

### 开发模式（默认使用 Mock 数据）

访问 http://localhost:3000

测试账号（3个）：

| 用户名 | 密码 | 说明 |
|--------|------|------|
| admin | admin123 | 管理员（所有权限） |
| user | user123 | 普通用户（部分权限） |
| guest | guest123 | 访客（无菜单权限） |

**Mock 数据说明**：
- 默认启用 Mock 模式（不需要后端服务）
- 可以在 `main-app/.env.development` 中配置
- 详细说明见 [Mock 数据指南](MOCK_GUIDE.md)

### 真实接口模式

如需使用真实后端接口：
1. 修改 `main-app/.env.development`，设置 `VITE_USE_MOCK=false`
2. 确保后端服务已启动（Gateway Service 和 Auth Service）
3. 重启前端应用（Ctrl+C 后重新 `pnpm dev`）
4. 使用后端配置的真实账号登录

## ⚠️ 注意事项

### 1. 端口被占用问题

如果提示端口被占用，先清理端口：

```bash
# macOS/Linux
lsof -ti:3000,3001,3002,3003,3004,3005 | xargs kill -9

# Windows
# 使用任务管理器结束 node 进程
```

### 2. 后端服务要求

**仅在关闭 Mock 模式时需要**（`VITE_USE_MOCK=false`）：

- **Gateway Service** (端口 8080) - 必须启动
- **Auth Service** (端口 8090) - 必须启动
- 其他微服务 (可选)

**开发时使用 Mock 模式**（`VITE_USE_MOCK=true`，默认）：
- 不需要启动任何后端服务
- 所有数据在前端模拟
- 适合前端独立开发

### 3. 菜单接口

后端需要实现 `GET /auth/menus` 接口，返回格式：

```json
[
  {
    "key": "/dashboard",
    "label": "仪表盘",
    "icon": "DashboardOutlined"
  }
]
```

如果接口未实现或失败，前端会使用默认菜单。

## 🔧 故障排查

### 问题 1: concurrently command not found

```bash
# 解决方案：安装根目录依赖
cd web/
pnpm install
```

### 问题 2: node_modules missing

```bash
# 解决方案：运行安装脚本
./setup.sh
```

### 问题 3: 某个应用无法启动

```bash
# 进入对应目录手动安装
cd main-app/  # 或其他子应用
pnpm install
pnpm dev
```

### 问题 4: 主应用端口变成 3006

这是因为 3000-3005 端口被占用，Vite 自动选择了下一个可用端口。

**解决方案**：
1. 停止所有应用（Ctrl+C）
2. 清理端口（见上面命令）
3. 重新启动

### 问题 5: 子应用未被加载

检查：
1. 所有子应用是否都已启动
2. 浏览器控制台是否有 CORS 错误
3. qiankun 配置中的端口是否正确

## 📖 开发建议

### 前端独立开发（推荐）

**使用 Mock 模式进行前端开发**：

```bash
# 1. 确认 Mock 已启用
cat main-app/.env.development
# 确认 VITE_USE_MOCK=true

# 2. 启动应用
cd web/
pnpm dev

# 3. 开始开发
# - 不需要后端服务
# - 使用测试账号登录（admin/admin123）
# - 专注前端功能开发
```

### 独立开发子应用

每个子应用都可以独立开发：

```bash
cd dashboard-app/
pnpm dev
# 访问 http://localhost:3001
```

### 集成测试

开发完成后，启动主应用进行集成测试：

```bash
cd ../
pnpm dev
# 访问 http://localhost:3000
```

### 前后端联调

**开发完成后切换到真实接口**：

```bash
# 1. 修改环境变量
vim main-app/.env.development
# 将 VITE_USE_MOCK=true 改为 VITE_USE_MOCK=false

# 2. 重启应用
Ctrl+C
pnpm dev

# 3. 确保后端服务已启动
# - Gateway Service (端口 8080)
# - Auth Service (端口 8090)

# 4. 使用真实账号登录测试
```

## 📚 相关文档

- [Mock 数据指南](MOCK_GUIDE.md) - Mock 数据使用说明（推荐先看）
- [子应用 Mock 指南](SUB_APPS_MOCK_GUIDE.md) - 子应用 Mock 配置详解
- [子菜单功能指南](SUBMENU_GUIDE.md) - 子菜单配置和使用
- [快速启动](QUICK_START.md) - 完整的快速启动指南
- [动态菜单](DYNAMIC_MENU_GUIDE.md) - 菜单配置说明
- [严重问题修复](main-app/CRITICAL_FIXES.md) - 已修复的问题
- [项目总结](../WEB_PROJECT_SUMMARY.md) - 完整项目说明

## ✅ 验证成功

已在以下环境验证通过：
- Node.js: v24.4.1
- pnpm: v10.7.0
- 操作系统: macOS

所有 6 个应用均可正常启动和运行。
