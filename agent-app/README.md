# Agent App (Agent 管理子应用)

K8s Agent 管理平台的 Agent 管理子应用，负责 Agent、事件和命令的管理。

## 功能

- Agent 列表查看和管理
- Agent 详情查看
- 事件列表查看
- 事件详情查看
- 命令发送和管理
- 命令状态跟踪

## 技术栈

- Vue 3 + Composition API
- Vite 4
- vite-plugin-qiankun
- Ant Design Vue 4
- Axios
- Day.js

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (端口 3002)
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 路由

- `/agents/list` - Agent 列表
- `/agents/events` - 事件列表
- `/agents/commands` - 命令管理

## 独立运行

本应用支持独立运行（非微前端模式），可以直接访问 http://localhost:3002 进行开发调试。

## 作为子应用

在主应用中，本应用会被注册为 `agent-app`，通过路由 `/agents` 激活。
