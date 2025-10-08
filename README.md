# K8s Agent 微前端 Web 应用

基于 **Wujie** 的微前端架构，包含 1 个主应用和 6 个子应用。

## 📦 应用列表

| 应用 | 端口 | 路由 | 说明 |
|-----|------|------|------|
| main-app | 3000 | `/` | 主应用（基座） |
| dashboard-app | 3001 | `/dashboard` | 仪表盘 |
| agent-app | 3002 | `/agents` | Agent/事件/命令管理 |
| cluster-app | 3003 | `/clusters` | K8s集群管理 |
| monitor-app | 3004 | `/monitor` | 监控/告警管理 |
| system-app | 3005 | `/system` | 系统管理 |
| image-build-app | 3006 | `/image-build` | 镜像构建 |

## 🚀 快速开始

### 安装依赖

```bash
# 安装所有应用的依赖
npm run install:all
```

### 开发模式

```bash
# 启动所有应用
npm run dev

# 或单独启动
npm run dev:main      # 主应用
npm run dev:dashboard # 仪表盘
npm run dev:agent     # Agent管理
npm run dev:cluster   # 集群管理
npm run dev:monitor   # 监控管理
npm run dev:system    # 系统管理
```

### 访问应用

主应用: http://localhost:3000

### 生产构建

```bash
# 构建所有应用
npm run build

# 或单独构建
npm run build:main
npm run build:dashboard
# ...
```

## 📁 目录结构

```
web/
├── main-app/          # 主应用
│   ├── src/
│   ├── public/
│   └── package.json
├── dashboard-app/     # 仪表盘子应用
├── agent-app/         # Agent管理子应用
├── cluster-app/       # 集群管理子应用
├── monitor-app/       # 监控管理子应用
├── system-app/        # 系统管理子应用
├── package.json       # 根配置
└── README.md
```

## 🔧 技术栈

- Vue 3
- **Wujie** (微前端框架)
- Ant Design Vue 4
- Vite 4/5
- Pinia
- Vue Router 4

## ⚡ 快速命令

```bash
# 推荐：使用 Makefile
make dev              # 启动所有应用
make status           # 查看运行状态
make kill             # 停止所有应用
make restart          # 重启所有应用

# 或使用 dev.sh（自动处理代理问题）
./dev.sh
```

## 📖 重要文档

### 新手必读
- **[QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md)** - 5 分钟解决列表无数据问题
- **[CLAUDE.md](CLAUDE.md)** - 完整开发指南

### Wujie 迁移
- **[WUJIE_MIGRATION_COMPLETE.md](WUJIE_MIGRATION_COMPLETE.md)** - 迁移完成报告
- **[MIGRATION_TO_WUJIE.md](MIGRATION_TO_WUJIE.md)** - 详细迁移步骤

### 问题排查
- **[BROWSER_PROXY_FIX.md](BROWSER_PROXY_FIX.md)** - 浏览器代理问题解决
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - 常见问题排查
- **[ROOT_CAUSE_ANALYSIS.md](ROOT_CAUSE_ANALYSIS.md)** - qiankun 问题分析

### 其他文档
- **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** - 本次会话总结
- **[MAKEFILE_GUIDE.md](MAKEFILE_GUIDE.md)** - Makefile 使用指南

## ⚠️ 重要提示

如果访问 http://localhost:3000/clusters 时列表没有数据，请查看 **[QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md)**，5 分钟即可解决！

原因：浏览器代理拦截了 localhost 请求。
解决：配置 `no_proxy` 环境变量。
