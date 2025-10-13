# Kubernetes 管理功能开发指南

## 项目概述

本项目实现了一个完整的 Kubernetes 集群管理平台，支持多集群管理以及各类 K8s 资源的增删改查操作。

## 已完成功能

### 1. 类型系统 (apps/web-antd/src/api/k8s/types.ts)

完整的 TypeScript 类型定义，包括：

- **集群管理**: Cluster, ClusterMetrics, ClusterListParams
- **Pod 管理**: Pod, PodSpec, PodStatus, ContainerStatus
- **Deployment 管理**: Deployment, DeploymentSpec, DeploymentStatus
- **Service 管理**: Service, ServiceSpec, ServicePort
- **ConfigMap 管理**: ConfigMap
- **CronJob 管理**: CronJob, CronJobSpec
- **其他资源**: Namespace, Node, Secret, StatefulSet, DaemonSet, Job

### 2. API 接口层 (apps/web-antd/src/api/k8s/index.ts)

完整的 API 接口定义，包括：

#### 集群管理
- `getClusterList()` - 获取集群列表
- `getClusterDetail(id)` - 获取集群详情
- `createCluster(data)` - 创建集群
- `updateCluster(id, data)` - 更新集群
- `deleteCluster(id)` - 删除集群
- `getClusterMetrics(id)` - 获取集群监控指标

#### Pod 管理
- `getPodList(params)` - 获取 Pod 列表
- `getPodDetail(clusterId, namespace, name)` - 获取 Pod 详情
- `createPod(clusterId, namespace, data)` - 创建 Pod
- `updatePod(clusterId, namespace, name, data)` - 更新 Pod
- `deletePod(clusterId, namespace, name)` - 删除 Pod
- `getPodLogs(params)` - 获取 Pod 日志
- `execPod(params)` - 执行 Pod 命令

#### Deployment 管理
- `getDeploymentList(params)` - 获取 Deployment 列表
- `getDeploymentDetail(clusterId, namespace, name)` - 获取详情
- `createDeployment(clusterId, namespace, data)` - 创建 Deployment
- `updateDeployment(clusterId, namespace, name, data)` - 更新
- `deleteDeployment(clusterId, namespace, name)` - 删除
- `scaleDeployment(clusterId, namespace, name, params)` - 扩缩容
- `restartDeployment(clusterId, namespace, name)` - 重启

#### Service 管理
- `getServiceList(params)` - 获取 Service 列表
- `getServiceDetail(clusterId, namespace, name)` - 获取详情
- `createService(clusterId, namespace, data)` - 创建 Service
- `updateService(clusterId, namespace, name, data)` - 更新
- `deleteService(clusterId, namespace, name)` - 删除

#### ConfigMap 管理
- `getConfigMapList(params)` - 获取 ConfigMap 列表
- `getConfigMapDetail(clusterId, namespace, name)` - 获取详情
- `createConfigMap(clusterId, namespace, data)` - 创建 ConfigMap
- `updateConfigMap(clusterId, namespace, name, data)` - 更新
- `deleteConfigMap(clusterId, namespace, name)` - 删除

#### CronJob 管理
- `getCronJobList(params)` - 获取 CronJob 列表
- `getCronJobDetail(clusterId, namespace, name)` - 获取详情
- `createCronJob(clusterId, namespace, data)` - 创建 CronJob
- `updateCronJob(clusterId, namespace, name, data)` - 更新
- `deleteCronJob(clusterId, namespace, name)` - 删除
- `toggleCronJob(clusterId, namespace, name, suspend)` - 暂停/恢复

#### 其他资源管理
- **Namespace**: 列表、详情、创建、删除
- **Node**: 列表、详情
- **Secret**: 列表、详情、创建、更新、删除
- **StatefulSet**: 列表、详情、创建、删除、扩缩容
- **DaemonSet**: 列表、详情、创建、删除
- **Job**: 列表、详情、创建、删除

### 3. 路由配置 (apps/web-antd/src/router/routes/modules/k8s.ts)

路由层级结构：

```
/k8s
├── /clusters - 集群管理
│   └── /:id - 集群详情
├── /pods - Pod 管理
│   └── /:cluster/:namespace/:name - Pod 详情
├── /deployments - Deployment 管理
├── /services - Service 管理
├── /configmaps - ConfigMap 管理
├── /cronjobs - CronJob 管理
└── /resources - 其他资源
    ├── /namespaces - Namespace
    ├── /nodes - Node
    ├── /secrets - Secret
    ├── /statefulsets - StatefulSet
    ├── /daemonsets - DaemonSet
    └── /jobs - Job
```

### 4. 国际化配置

已添加中英文国际化支持：

- **zh-CN**: 中文文本 (apps/web-antd/src/locales/langs/zh-CN/page.json)
- **en-US**: 英文文本 (apps/web-antd/src/locales/langs/en-US/page.json)

### 5. 前端页面

#### 集群管理页面 (apps/web-antd/src/views/k8s/clusters/index.vue)

**功能特性**:
- 集群列表展示（表格形式）
- 搜索和过滤功能
- 分页支持
- 添加/编辑集群（Modal 表单）
- 删除集群（带确认）
- 查看集群详情
- 状态标签显示（健康/异常/未知）

**技术实现**:
- 使用 Ant Design Vue 组件库
- 表单验证
- 响应式布局
- 错误处理和消息提示

#### 集群详情页面 (apps/web-antd/src/views/k8s/clusters/detail.vue)

**功能特性**:
- 集群基本信息展示（Descriptions）
- 资源统计（Statistic Cards）
- CPU/内存/磁盘使用率
- Pod/Node/Namespace 数量统计
- 动态颜色提示（使用率超过 80% 显示红色）

### 6. Mock API (apps/backend-mock/api/k8s/)

#### Mock 数据工具 (_utils.ts)

**核心功能**:
- 使用 @faker-js/faker 生成真实感数据
- 数据生成器函数：
  - `generateCluster()` - 生成集群数据
  - `generateClusterMetrics()` - 生成监控指标
  - `generatePod()` - 生成 Pod 数据
  - `generateDeployment()` - 生成 Deployment 数据
  - `generateService()` - 生成 Service 数据
  - `generateConfigMap()` - 生成 ConfigMap 数据
  - `generateCronJob()` - 生成 CronJob 数据
- 工具函数：
  - `paginate()` - 分页处理
  - `filterByKeyword()` - 关键字过滤
  - `initMockData()` - 初始化所有 Mock 数据

**数据规模**:
- 3 个集群
- 每个集群 5 个 Namespace
- 每个 Namespace 包含：
  - 5 个 Pods
  - 3 个 Deployments
  - 3 个 Services
  - 2 个 ConfigMaps
  - 1 个 CronJob
- 5 个 Nodes（共享）

#### 集群 Mock API

文件结构：
```
api/k8s/clusters/
├── index.get.ts - 获取集群列表
├── index.post.ts - 创建集群
├── [id].get.ts - 获取集群详情
├── [id].put.ts - 更新集群
├── [id].delete.ts - 删除集群
└── [id]/metrics.get.ts - 获取监控指标
```

#### Pod Mock API

```
api/k8s/pods/
└── index.get.ts - 获取 Pod 列表（支持 namespace 过滤）
```

## 技术栈

### 前端
- **框架**: Vue 3 + TypeScript
- **UI 组件库**: Ant Design Vue
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios (封装在 @vben/request)
- **国际化**: vue-i18n

### Mock 服务
- **框架**: Nitro
- **数据生成**: @faker-js/faker
- **类型系统**: TypeScript

## 目录结构

```
apps/web-antd/src/
├── api/k8s/
│   ├── index.ts           # API 接口定义
│   └── types.ts           # TypeScript 类型定义
├── views/k8s/
│   ├── clusters/
│   │   ├── index.vue      # 集群列表页
│   │   └── detail.vue     # 集群详情页
│   ├── pods/              # Pod 管理页（待实现）
│   ├── deployments/       # Deployment 管理页（待实现）
│   ├── services/          # Service 管理页（待实现）
│   ├── configmaps/        # ConfigMap 管理页（待实现）
│   ├── cronjobs/          # CronJob 管理页（待实现）
│   └── resources/         # 其他资源管理页（待实现）
├── router/routes/modules/
│   └── k8s.ts             # K8s 路由配置
└── locales/langs/
    ├── zh-CN/page.json    # 中文国际化
    └── en-US/page.json    # 英文国际化

apps/backend-mock/api/k8s/
├── _utils.ts              # Mock 数据工具
├── clusters/              # 集群 Mock API
│   ├── index.get.ts
│   ├── index.post.ts
│   ├── [id].get.ts
│   ├── [id].put.ts
│   ├── [id].delete.ts
│   └── [id]/metrics.get.ts
└── pods/                  # Pod Mock API
    └── index.get.ts
```

## 开发指南

### 1. 启动开发服务器

```bash
# 启动前端开发服务器（包含 Mock 服务）
pnpm dev:antd

# 或使用 Makefile
make dev-antd
```

### 2. 访问应用

打开浏览器访问 `http://localhost:5666`

导航到 "Kubernetes 管理" 菜单即可看到：
- 集群管理
- Pod 管理
- Deployment 管理
- Service 管理
- ConfigMap 管理
- CronJob 管理
- 其他资源

### 3. API 调用示例

```typescript
import { getClusterList, getClusterDetail } from '#/api/k8s';

// 获取集群列表
const { items, total } = await getClusterList({
  page: 1,
  pageSize: 10,
  keyword: 'cluster-1',
  status: 'healthy',
});

// 获取集群详情
const cluster = await getClusterDetail('cluster-id');
```

### 4. 添加新页面

#### 步骤 1: 创建 Vue 组件

```vue
<!-- apps/web-antd/src/views/k8s/pods/index.vue -->
<script lang="ts" setup>
import { getPodList } from '#/api/k8s';

// 实现逻辑
</script>

<template>
  <!-- UI 模板 -->
</template>
```

#### 步骤 2: 路由已配置

路由已经在 `k8s.ts` 中配置好，只需创建对应的 Vue 文件即可。

#### 步骤 3: 创建 Mock API（如果需要）

```typescript
// apps/backend-mock/api/k8s/pods/[cluster]/[namespace]/[name].get.ts
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  // 返回 Pod 详情
});
```

### 5. 数据流程

```
用户操作
  ↓
Vue 组件
  ↓
API 接口 (api/k8s/index.ts)
  ↓
RequestClient (@vben/request)
  ↓
Mock API (backend-mock/api/k8s/)
  ↓
返回数据
```

## 扩展功能建议

### 待实现的页面

1. **Pod 管理页面**
   - Pod 列表（支持多集群、多 namespace）
   - Pod 详情页
   - 日志查看
   - 终端执行（WebSocket）
   - 实时状态更新

2. **Deployment 管理页面**
   - Deployment 列表
   - 创建/更新 Deployment（YAML 编辑器）
   - 扩缩容操作
   - 滚动更新策略
   - 版本历史和回滚

3. **Service 管理页面**
   - Service 列表
   - Service 类型（ClusterIP, NodePort, LoadBalancer）
   - Endpoint 查看
   - 创建/更新 Service

4. **ConfigMap 管理页面**
   - ConfigMap 列表
   - 键值对编辑
   - YAML 格式编辑
   - 版本管理

5. **CronJob 管理页面**
   - CronJob 列表
   - Cron 表达式编辑
   - 立即执行
   - 暂停/恢复
   - 执行历史

6. **其他资源页面**
   - Namespace 管理
   - Node 监控
   - Secret 管理（敏感数据处理）
   - StatefulSet 管理
   - DaemonSet 管理
   - Job 管理

### 高级功能

1. **实时监控**
   - 使用 WebSocket 实现资源实时更新
   - CPU/内存使用率图表（ECharts）
   - Pod 状态实时刷新

2. **日志聚合**
   - 多 Pod 日志聚合查看
   - 日志搜索和过滤
   - 日志下载

3. **YAML 编辑器**
   - Monaco Editor 集成
   - 语法高亮
   - 自动补全
   - 格式验证

4. **批量操作**
   - 批量删除
   - 批量重启
   - 批量标签编辑

5. **权限控制**
   - RBAC 集成
   - 操作审计
   - 资源配额管理

6. **告警和通知**
   - 资源状态告警
   - Webhook 通知
   - 邮件通知

## 测试指南

### 单元测试

```bash
# 运行单元测试
pnpm test:unit

# 或使用 Makefile
make test-unit
```

### E2E 测试

```bash
# 运行 E2E 测试
pnpm test:e2e

# 或使用 Makefile
make test-e2e
```

## 部署指南

### 生产环境部署

1. **配置生产环境变量**

编辑 `.env.production`:

```bash
# 接口地址 - 替换为真实的 K8s API Gateway
VITE_GLOB_API_URL=https://api.your-k8s-platform.com/api

# 关闭 Mock
VITE_NITRO_MOCK=false
```

2. **构建生产版本**

```bash
pnpm build:antd

# 或使用 Makefile
make build-antd
```

3. **部署到服务器**

```bash
# 使用 Docker
make docker-build
make docker-run

# 或直接部署 dist 目录
cp -r apps/web-antd/dist/* /var/www/html/
```

### 后端 API 集成

如果有真实的 K8s API 后端，需要：

1. 实现相同的 API 接口规范
2. 配置 CORS 跨域
3. 实现认证和授权
4. 处理 K8s API Server 通信

## 常见问题

### 1. Mock 数据不显示？

**解决方案**:
- 确保 `VITE_NITRO_MOCK=true` 在 `.env.development`
- 检查浏览器控制台是否有错误
- 重启开发服务器

### 2. API 请求失败？

**解决方案**:
- 检查 API 路径是否正确
- 查看 Network 面板中的请求详情
- 确认 Mock API 文件命名正确（如 `index.get.ts`）

### 3. 路由无法访问？

**解决方案**:
- 确认路由配置在 `modules/k8s.ts` 中
- 检查 Vue 组件文件路径是否正确
- 清除浏览器缓存

### 4. 类型错误？

**解决方案**:
- 运行 `pnpm check:type` 检查类型错误
- 确保导入的类型路径正确
- 检查 TypeScript 版本兼容性

## 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系开发团队。
