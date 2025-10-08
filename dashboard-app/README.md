# Dashboard App (仪表盘子应用)

K8s Agent 管理平台的仪表盘子应用，展示系统概览和统计信息。

## 功能

- Agent 状态统计
- 事件类型统计
- 事件趋势图表
- 最近事件列表
- 实时数据展示

## 技术栈

- Vue 3 + Composition API
- Vite 4
- vite-plugin-qiankun
- Ant Design Vue 4
- ECharts 5 + vue-echarts

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (端口 3001)
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 独立运行

本应用支持独立运行（非微前端模式），可以直接访问 http://localhost:3001 进行开发调试。

## 作为子应用

在主应用中，本应用会被注册为 `dashboard-app`，通过路由 `/dashboard` 激活。
