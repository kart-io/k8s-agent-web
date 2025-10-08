# Web 项目快速启动指南

本指南帮助你快速启动 K8s Agent 管理平台的微前端项目。

## 前置要求

- Node.js >= 16
- pnpm >= 8 (推荐使用 pnpm)

如果没有安装 pnpm，运行：
```bash
npm install -g pnpm
```

## 快速启动

### 1. 安装所有依赖

在 `web/` 目录下运行：

```bash
pnpm run install:all
```

这会为主应用和所有子应用安装依赖。

### 2. 启动所有应用

```bash
pnpm dev
```

这会同时启动：
- 主应用 (main-app) - http://localhost:3000
- Dashboard 子应用 - http://localhost:3001
- Agent 子应用 - http://localhost:3002
- Cluster 子应用 - http://localhost:3003
- Monitor 子应用 - http://localhost:3004
- System 子应用 - http://localhost:3005

### 3. 访问应用

在浏览器中打开：http://localhost:3000

默认账号：
- 用户名: admin
- 密码: admin123

## 单独启动某个应用

如果只想启动某个应用进行开发：

```bash
# 只启动主应用
pnpm dev:main

# 只启动 dashboard 子应用
pnpm dev:dashboard

# 只启动 agent 子应用
pnpm dev:agent

# 只启动 cluster 子应用
pnpm dev:cluster

# 只启动 monitor 子应用
pnpm dev:monitor

# 只启动 system 子应用
pnpm dev:system
```

## 构建生产版本

```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm build:main
pnpm build:dashboard
pnpm build:agent
pnpm build:cluster
pnpm build:monitor
pnpm build:system
```

## 项目结构

```
web/
├── main-app/          # 主应用（基座）- 端口 3000
├── dashboard-app/     # 仪表盘子应用 - 端口 3001
├── agent-app/         # Agent 管理子应用 - 端口 3002
├── cluster-app/       # 集群管理子应用 - 端口 3003
├── monitor-app/       # 监控管理子应用 - 端口 3004
├── system-app/        # 系统管理子应用 - 端口 3005
├── package.json       # 根 package.json
└── QUICK_START.md     # 本文件
```

## 路由规则

- `/` - 首页（重定向到 /dashboard）
- `/login` - 登录页
- `/dashboard` - 仪表盘（dashboard-app）
- `/agents` - Agent 管理（agent-app）
  - `/agents/list` - Agent 列表
  - `/agents/events` - 事件列表
  - `/agents/commands` - 命令管理
- `/clusters` - 集群管理（cluster-app）
  - `/clusters/list` - 集群列表
  - `/clusters/:id` - 集群详情
- `/monitor` - 监控管理（monitor-app）
  - `/monitor/metrics` - 监控指标
  - `/monitor/alerts` - 告警规则
- `/system` - 系统管理（system-app）
  - `/system/users` - 用户管理
  - `/system/roles` - 角色管理
  - `/system/permissions` - 权限管理

## 技术栈

- **微前端框架**: qiankun 2.x
- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite 4
- **UI 组件库**: Ant Design Vue 4
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 请求**: Axios
- **图表**: ECharts 5 + vue-echarts
- **包管理器**: pnpm

## 开发建议

1. **独立开发**: 每个子应用都可以独立运行和开发，无需启动主应用
2. **集成测试**: 完成功能后，启动主应用进行集成测试
3. **样式隔离**: qiankun 自动处理样式隔离，避免样式冲突
4. **状态共享**: 使用 qiankun 的 `initGlobalState` 进行全局状态共享

## 常见问题

### 1. 端口被占用

如果某个端口被占用，可以修改对应应用的 `vite.config.js` 中的 `server.port`。

### 2. 子应用无法加载

确保：
- 所有应用都已启动
- 主应用的 `src/micro/apps.js` 中的端口配置正确
- 浏览器控制台没有 CORS 错误

### 3. API 请求失败

确保：
- Gateway 服务（端口 8080）已启动
- 各个后端服务已启动
- `vite.config.js` 中的 proxy 配置正确

## 下一步

1. 阅读 [MICRO_FRONTEND_QIANKUN_GUIDE.md](../MICRO_FRONTEND_QIANKUN_GUIDE.md) 了解微前端架构
2. 查看各个子应用的 README.md 了解具体功能
3. 启动后端服务（参考 [QUICK_START_BACKEND.md](../QUICK_START_BACKEND.md)）
