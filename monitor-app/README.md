# Monitor App (监控管理子应用)

K8s Agent 管理平台的监控管理子应用，负责系统监控指标和告警规则的管理。

## 功能

- 系统指标概览（CPU、内存、磁盘、网络）
- 指标历史趋势图表
- 实时数据刷新
- 告警规则管理
- 告警级别配置
- 多种通知方式支持

## 技术栈

- Vue 3 + Composition API
- Vite 4
- vite-plugin-qiankun
- Ant Design Vue 4
- ECharts 5 + vue-echarts
- Axios
- Day.js

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (端口 3004)
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 路由

- `/monitor/metrics` - 监控指标
- `/monitor/alerts` - 告警规则

## 独立运行

本应用支持独立运行（非微前端模式），可以直接访问 http://localhost:3004 进行开发调试。

## 作为子应用

在主应用中，本应用会被注册为 `monitor-app`，通过路由 `/monitor` 激活。
