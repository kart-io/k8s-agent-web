# Kubernetes 管理平台 (Web K8s)

现代化的 Kubernetes 集群管理平台，基于 Vue 3 + TypeScript + Ant Design Vue 构建。

## 快速开始

### 启动开发服务器

```bash
# 从项目根目录
pnpm --filter @vben/web-k8s run dev

# 访问应用
# http://localhost:5670
```

### 构建生产版本

```bash
pnpm --filter @vben/web-k8s run build
```

## 核心功能

### Dashboard 总览

- 集群统计信息（集群、节点、命名空间、Pods、Deployments、Services）
- 集群状态卡片（健康状态、版本、资源使用）
- 资源健康监控（Pods、Nodes、Deployments、Services）
- 最近事件流（Normal、Warning、Error）

### 工作负载管理

- **Pods**：容器管理、日志查看、状态监控
- **Deployments**：部署管理、副本控制、滚动更新
- **StatefulSets**：有状态应用管理
- **DaemonSets**：节点级守护进程
- **Jobs**：批处理任务
- **CronJobs**：定时任务调度

### 网络管理

- **Services**：服务发现和负载均衡
- **Ingress**：HTTP/HTTPS 路由规则

### 配置管理

- **ConfigMaps**：配置数据管理
- **Secrets**：敏感信息存储

### 存储管理

- **存储概览**：容量统计、StorageClass 分布、命名空间使用情况
- **PersistentVolumes**：持久化卷管理
- **PersistentVolumeClaims**：存储请求
- **StorageClasses**：存储类配置

### 权限与安全 (RBAC)

- **ServiceAccounts**：服务账号管理
- **Roles & RoleBindings**：命名空间级别权限
- **ClusterRoles & ClusterRoleBindings**：集群级别权限

### 资源配额

- **ResourceQuotas**：命名空间资源限额
- **LimitRanges**：资源限制范围

### 集群管理

- **集群信息**：多集群管理
- **Nodes**：节点管理、Labels/Taints 编辑
- **Namespaces**：命名空间管理
- **Events**：事件流查看

## 技术栈

- **Vue 3**：Composition API + `<script setup>`
- **TypeScript**：类型安全
- **Vite**：快速构建
- **Ant Design Vue**：企业级 UI 组件
- **Vue Router**：路由管理

## 项目结构

```text
src/
├── api/              # API 接口和 Mock 数据
├── views/            # 页面组件
│   └── k8s/
│       ├── dashboard/      # Dashboard
│       ├── workloads/      # 工作负载
│       ├── network/        # 网络
│       ├── config/         # 配置
│       ├── storage/        # 存储
│       ├── rbac/           # 权限
│       ├── quota/          # 配额
│       ├── cluster/        # 集群
│       └── _shared/        # 共享组件
├── router/           # 路由配置
├── config/           # 配置文件
├── types/            # 类型定义
└── utils/            # 工具函数
```

## 特性

- ✅ 完整的 TypeScript 类型定义
- ✅ 响应式设计，支持移动端
- ✅ 暗色模式支持
- ✅ 统一的错误处理
- ✅ Mock 数据支持
- ✅ 代码分割和懒加载
- ✅ HMR 热更新

## 文档

- [K8S_PLATFORM.md](./K8S_PLATFORM.md) - 完整的平台介绍和开发指南
- [FEATURES.md](./FEATURES.md) - 详细的功能特性说明
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发者指南和最佳实践

## 开发规范

### 组件命名

- 文件名：PascalCase（`MyComponent.vue`）
- 组件名：使用 `defineOptions({ name: 'K8sMyComponent' })`

### 代码风格

- 使用 TypeScript 定义所有类型
- 使用 Composition API
- 遵循 ESLint 规则

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```bash
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建配置
```

## 许可证

MIT
