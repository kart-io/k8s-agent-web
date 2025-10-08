# Cluster App (集群管理子应用)

K8s Agent 管理平台的集群管理子应用，负责 Kubernetes 集群的管理和资源查看。

## 功能

- 集群列表查看和管理
- 集群添加、编辑、删除
- 集群详情查看
- Pod 列表查看
- Service 列表查看
- Deployment 列表查看
- Namespace 管理

## 技术栈

- Vue 3 + Composition API
- Vite 4
- vite-plugin-qiankun
- Ant Design Vue 4
- Axios
- Day.js
- js-yaml

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (端口 3003)
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 路由

- `/clusters/list` - 集群列表
- `/clusters/:id` - 集群详情

## 独立运行

本应用支持独立运行（非微前端模式），可以直接访问 http://localhost:3003 进行开发调试。

## 作为子应用

在主应用中，本应用会被注册为 `cluster-app`，通过路由 `/clusters` 激活。
