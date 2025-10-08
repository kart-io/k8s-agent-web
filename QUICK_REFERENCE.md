# K8s Agent Web - 快速参考

## 🚀 快速启动

```bash
# 方式 1: 使用 Makefile（推荐，自动处理代理问题）
make setup    # 首次安装
make dev      # 启动所有应用

# 方式 2: 使用 pnpm（需要手动处理代理）
pnpm run install:all
pnpm dev
```

访问: http://localhost:3000

## 📋 常用命令

| 命令 | 说明 |
|------|------|
| `make help` | 查看所有可用命令 |
| `make dev` | 启动所有应用（前台，自动处理代理） |
| `make dev-bg` | 后台启动所有应用 |
| `make stop` | 停止所有应用 |
| `make kill` | 强制杀死端口 3000-3006 的进程 |
| `make status` | 查看应用运行状态 |
| `make restart` | 重启所有应用 |
| `make build` | 构建所有应用 |
| `make clean` | 清理所有构建产物 |

## 🎯 单独启动应用

```bash
make dev-main         # 主应用 - 3000
make dev-dashboard    # 仪表盘 - 3001
make dev-agent        # Agent管理 - 3002
make dev-cluster      # 集群管理 - 3003
make dev-monitor      # 监控管理 - 3004
make dev-system       # 系统管理 - 3005
make dev-image-build  # 镜像构建 - 3006
```

## 🔧 故障排除

### 问题 1: 子应用加载失败（404/502 错误）

**原因**: HTTP 代理拦截 localhost 请求

**解决方案**:

```bash
# 方案 1: 使用 make dev（推荐，自动处理）
make kill
make dev

# 方案 2: 手动设置 no_proxy
export no_proxy=localhost,127.0.0.1,::1
export NO_PROXY=localhost,127.0.0.1,::1
pnpm dev

# 方案 3: 临时禁用代理
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY
pnpm dev
```

详细说明: [PROXY_ISSUE_FIX.md](PROXY_ISSUE_FIX.md)

### 问题 2: 端口被占用

```bash
make kill     # 强制清理端口
make dev      # 重新启动
```

### 问题 3: 某个应用无法启动

```bash
make status   # 查看状态
# 单独启动失败的应用查看错误
make dev-dashboard  # 例如
```

### 问题 4: Bootstrap 超时（single-spa #31）

**原因**: 子应用生命周期函数超时

**解决方案**:

```bash
# 所有应用已修复，如果仍有问题：
make kill
make dev
```

详细说明: [BOOTSTRAP_TIMEOUT_FIX.md](BOOTSTRAP_TIMEOUT_FIX.md)

### 问题 5: node_modules 问题

```bash
make clean    # 清理所有内容
make setup    # 重新安装
make dev      # 启动
```

## 🏗️ 项目结构

```
.
├── main-app/           # 主应用 (qiankun 宿主) - 3000
├── dashboard-app/      # 仪表盘 - 3001
├── agent-app/          # Agent 管理 - 3002
├── cluster-app/        # 集群管理 - 3003
├── monitor-app/        # 监控管理 - 3004
├── system-app/         # 系统管理 - 3005
├── image-build-app/    # 镜像构建 - 3006
├── shared/             # 共享组件库
├── Makefile            # 构建和管理命令
├── dev.sh              # 开发启动脚本（处理代理）
└── package.json        # 根配置
```

## 📦 技术栈

- **微前端**: qiankun 2.x
- **框架**: Vue 3 + Composition API
- **构建**: Vite 4
- **UI**: Ant Design Vue 4
- **状态**: Pinia
- **路由**: Vue Router 4
- **包管理**: pnpm

## 🔐 测试账号

| 用户名 | 密码 | 权限 |
|--------|------|------|
| admin | admin123 | 管理员（所有权限） |
| user | user123 | 普通用户（部分权限） |
| guest | guest123 | 访客（无菜单权限） |

## 📚 文档索引

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目概览 |
| [QUICK_START.md](QUICK_START.md) | 快速启动指南 |
| [START_GUIDE.md](START_GUIDE.md) | 详细启动说明 |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | 🔥 故障排查指南（重要）|
| [BROWSER_CACHE_ISSUE.md](BROWSER_CACHE_ISSUE.md) | 🔥 浏览器缓存问题（常见）|
| [MAKEFILE_GUIDE.md](MAKEFILE_GUIDE.md) | Makefile 使用指南 |
| [PROXY_ISSUE_FIX.md](PROXY_ISSUE_FIX.md) | 代理问题解决方案 ⚠️ |
| [BOOTSTRAP_TIMEOUT_FIX.md](BOOTSTRAP_TIMEOUT_FIX.md) | Bootstrap 超时解决方案 ⚠️ |
| [IMPORTANT_RESTART_REQUIRED.md](IMPORTANT_RESTART_REQUIRED.md) | 重启服务说明 |
| [CLAUDE.md](CLAUDE.md) | Claude Code 开发指南 |
| [COMPONENTS_GUIDE.md](COMPONENTS_GUIDE.md) | 组件使用指南 |
| [shared/README.md](shared/README.md) | 共享组件库说明 |

## ⚡ 开发工作流

### 前端独立开发（推荐）

```bash
# 1. 启动应用（使用 Mock 数据，无需后端）
make dev

# 2. 访问 http://localhost:3000
# 3. 使用 admin/admin123 登录
# 4. 开发功能
```

### 独立开发某个子应用

```bash
# 终端 1: 启动主应用
make dev-main

# 终端 2: 启动要开发的子应用
make dev-dashboard

# 访问 http://localhost:3000 进行集成测试
```

### 切换到真实后端

```bash
# 1. 修改 main-app/.env.development
# 将 VITE_USE_MOCK=true 改为 VITE_USE_MOCK=false

# 2. 确保后端服务运行（Gateway:8080, Auth:8090）

# 3. 重启应用
make restart
```

## 💡 最佳实践

1. ✅ 使用 `make dev` 启动（自动处理代理问题）
2. ✅ 开发时使用 Mock 模式（默认）
3. ✅ 使用 `make status` 检查应用状态
4. ✅ 遇到问题先看 `PROXY_ISSUE_FIX.md`
5. ✅ 使用共享组件库 `@k8s-agent/shared`

## 🆘 需要帮助？

```bash
make help                      # 查看所有命令
make status                    # 检查应用状态
cat TROUBLESHOOTING.md        # 🔥 完整故障排查指南
cat PROXY_ISSUE_FIX.md        # 代理问题解决方案
cat BOOTSTRAP_TIMEOUT_FIX.md  # Bootstrap 超时解决方案
cat MAKEFILE_GUIDE.md         # Makefile 详细说明
```

**遇到问题？优先查看**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
