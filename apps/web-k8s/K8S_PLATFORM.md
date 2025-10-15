# Kubernetes 管理平台

基于 Vue 3 + TypeScript + Ant Design Vue 构建的现代化 Kubernetes 集群管理平台。

## 简介

这是一个功能完整的 Kubernetes 资源管理平台，提供了直观的用户界面来管理和监控 K8s 集群中的各类资源。平台采用了最新的前端技术栈，提供了优秀的用户体验和开发体验。

## 核心功能

### 1. Dashboard 总览

- **集群统计**：实时显示集群、节点、命名空间、Pod、Deployment、Service 总数
- **集群状态卡片**：展示每个集群的健康状态、版本信息、资源使用情况
- **资源健康监控**：可视化展示各类资源的健康状态统计
- **最近事件流**：实时展示集群中发生的事件，按类型（Normal/Warning/Error）分类

### 2. 工作负载管理

#### Pods

- 列表展示和详情查看
- 状态筛选（Running、Pending、Failed 等）
- 日志查看和下载
- 容器级别的资源监控

#### Deployments

- 副本数管理和扩缩容
- 滚动更新策略配置
- 部署历史和回滚
- 详细的部署状态展示

#### StatefulSets

- 有状态应用管理
- 就绪副本数监控
- 持久化卷绑定状态

#### DaemonSets

- 节点级别的守护进程管理
- 就绪节点数统计
- 更新策略配置

#### Jobs

- 批处理任务管理
- 任务执行状态追踪（运行中、已完成、已失败）
- 并行度和完成数配置

#### CronJobs

- 定时任务调度
- Cron 表达式配置
- 执行历史记录

### 3. 网络管理

#### Services

- 服务类型管理（ClusterIP、NodePort、LoadBalancer）
- 端口映射配置
- 选择器和标签管理
- Endpoints 查看

#### Ingress

- HTTP/HTTPS 路由规则配置
- 域名和路径映射
- TLS 证书管理
- 后端服务关联

### 4. 配置管理

#### ConfigMaps

- 配置数据的键值对管理
- 配置文件批量导入
- 版本历史追踪

#### Secrets

- 敏感数据加密存储
- 多种 Secret 类型支持
- 密钥数量统计

### 5. 存储管理

#### 存储概览

- 存储容量统计和趋势分析
- StorageClass 分布可视化
- 命名空间存储使用情况
- 最近的 PV/PVC 绑定记录

#### PersistentVolumes (PV)

- 持久化卷生命周期管理
- 容量和访问模式配置
- 回收策略设置
- 绑定状态追踪

#### PersistentVolumeClaims (PVC)

- 存储请求和分配
- 存储类指定
- 卷绑定状态

#### StorageClasses

- 存储类配置和管理
- 供应商参数设置
- 默认存储类标记

### 6. 权限与安全 (RBAC)

#### ServiceAccounts

- 服务账号管理
- Token 和 Secret 关联
- 权限绑定状态

#### Roles & RoleBindings

- 命名空间级别的角色定义
- API 资源权限配置（apiGroups、resources、verbs）
- 角色到主体的绑定管理

#### ClusterRoles & ClusterRoleBindings

- 集群级别的角色定义
- 跨命名空间权限管理
- 主体类型支持（User、Group、ServiceAccount）

### 7. 资源配额管理

#### ResourceQuotas

- 命名空间资源限额设置
- CPU、内存、存储配额管理
- 资源使用情况监控
- 配额使用进度可视化

#### LimitRanges

- 容器、Pod、PVC 的资源限制
- 默认值和最大/最小值配置
- 资源请求/限制比率控制

### 8. 集群管理

#### 集群信息

- 多集群管理
- 集群健康状态监控
- 版本信息展示

#### Nodes

- 节点列表和详情
- 节点状态监控（Ready、NotReady）
- Labels 和 Taints 管理
- 节点资源使用情况

#### Namespaces

- 命名空间隔离
- 资源配额关联
- 状态管理

#### Events

- 集群事件流
- 事件类型筛选
- 时间线展示

## 技术架构

### 前端技术栈

- **Vue 3**：采用 Composition API 和 `<script setup>` 语法
- **TypeScript**：提供完整的类型安全
- **Vite**：快速的开发构建工具
- **Ant Design Vue**：企业级 UI 组件库
- **Vue Router**：路由管理
- **Pinia**：状态管理（如需要）

### 项目结构

```text
apps/web-k8s/
├── src/
│   ├── api/                    # API 接口定义
│   │   └── k8s/
│   │       ├── types.ts        # K8s 资源类型定义
│   │       └── mock.ts         # Mock 数据
│   ├── views/                  # 页面组件
│   │   └── k8s/
│   │       ├── dashboard/      # Dashboard 总览
│   │       ├── workloads/      # 工作负载
│   │       │   ├── pods/
│   │       │   ├── deployments/
│   │       │   ├── statefulsets/
│   │       │   ├── daemonsets/
│   │       │   ├── jobs/
│   │       │   └── cronjobs/
│   │       ├── network/        # 网络资源
│   │       │   ├── services/
│   │       │   └── ingress/
│   │       ├── config/         # 配置资源
│   │       │   ├── configmaps/
│   │       │   └── secrets/
│   │       ├── storage/        # 存储资源
│   │       │   ├── overview/
│   │       │   ├── persistent-volumes/
│   │       │   ├── persistent-volume-claims/
│   │       │   └── storage-classes/
│   │       ├── rbac/           # 权限管理
│   │       │   ├── service-accounts/
│   │       │   ├── roles/
│   │       │   ├── role-bindings/
│   │       │   ├── cluster-roles/
│   │       │   └── cluster-role-bindings/
│   │       ├── quota/          # 资源配额
│   │       │   ├── resource-quotas/
│   │       │   └── limit-ranges/
│   │       ├── cluster/        # 集群管理
│   │       │   ├── clusters/
│   │       │   ├── nodes/
│   │       │   ├── namespaces/
│   │       │   └── events/
│   │       └── _shared/        # 共享组件
│   ├── router/                 # 路由配置
│   │   └── routes/
│   │       └── modules/
│   │           └── k8s.ts      # K8s 路由模块
│   ├── config/                 # 配置文件
│   └── types/                  # 类型定义
└── public/                     # 静态资源
```

### 设计模式

#### 1. 配置驱动的资源列表

使用配置工厂模式创建资源列表，减少重复代码：

```typescript
// 配置定义
const config = computed<ResourceListConfig<Pod>>(() => createPodConfig());

// 通用列表组件
<ResourceList :config="config" />
```

#### 2. 组件化架构

每个资源页面包含：

- **主列表组件**：展示资源列表和基本操作
- **详情抽屉/模态框**：展示资源详细信息
- **操作组件**：编辑、删除等操作

#### 3. 响应式设计

所有页面都采用响应式布局，支持桌面和移动设备：

- 使用 Ant Design 的 Grid 系统（Row/Col）
- 断点配置：xs、sm、md、lg、xl
- 自适应表格滚动

#### 4. 状态管理

- 使用 Vue 3 的 `ref` 和 `reactive` 管理组件状态
- 通过 `computed` 创建派生状态
- Props 和 Emits 实现父子组件通信

## 开发指南

### 环境要求

- Node.js 18.x 或更高版本
- pnpm 8.x 或更高版本

### 安装依赖

```bash
cd /home/hellotalk/code/web/k8s-agent-web
pnpm install
```

### 启动开发服务器

```bash
# 启动 K8s 前端应用
pnpm --filter @vben/web-k8s run dev

# 启动 Mock 后端服务（可选）
pnpm --filter backend-mock run dev
```

开发服务器将在 `http://localhost:5670` 启动。

### 构建生产版本

```bash
pnpm --filter @vben/web-k8s run build
```

### 代码规范

#### TypeScript 类型定义

所有组件必须有完整的类型定义：

```typescript
// 定义 Props 类型
const props = defineProps<{
  clusterId: string;
  namespace?: string;
}>();

// 定义事件类型
const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'close'): void;
}>();
```

#### 组件命名

- 文件名：使用 PascalCase，如 `ClusterStatusCards.vue`
- 组件名：使用 `defineOptions` 设置，如 `defineOptions({ name: 'K8sPods' })`
- 路由名称：使用 K8s 前缀，如 `K8sDashboard`

#### 样式规范

使用 scoped 样式和 CSS 变量：

```vue
<style scoped>
.container {
  padding: 16px;
  background-color: var(--vben-background-color);
}

.title {
  color: var(--vben-text-color);
}

/* 支持暗色模式 */
html[data-theme='dark'] .container {
  background-color: var(--vben-background-color-dark);
}
</style>
```

### 添加新资源页面

#### 1. 定义类型

在 `src/api/k8s/types.ts` 中添加资源类型：

```typescript
export interface MyResource {
  apiVersion: string;
  kind: string;
  metadata: ObjectMeta;
  spec: MyResourceSpec;
  status?: MyResourceStatus;
}
```

#### 2. 添加 Mock 数据

在 `src/api/k8s/mock.ts` 中添加 Mock 函数：

```typescript
export function getMockMyResourceList(params: MyResourceListParams): PaginatedList<MyResource> {
  // 实现 Mock 逻辑
}
```

#### 3. 创建页面组件

在 `src/views/k8s/my-resources/` 目录下创建：

- `index.vue` - 列表页面
- `DetailDrawer.vue` - 详情抽屉（可选）

#### 4. 添加路由

在 `src/router/routes/modules/k8s.ts` 中添加路由配置：

```typescript
{
  name: 'K8sMyResources',
  path: 'my-resources',
  component: () => import('#/views/k8s/my-resources/index.vue'),
  meta: {
    icon: 'lucide:box',
    title: 'My Resources',
  },
}
```

## 常见问题

### 如何切换集群？

当前版本使用固定的集群 ID（`cluster-production-01`）。要支持多集群切换，需要：

1. 在顶部添加集群选择器组件
2. 使用 Pinia 或 Context 管理当前选中的集群
3. 所有 API 请求带上集群 ID 参数

### 如何对接真实的 K8s API？

1. 修改 `src/api/k8s/` 目录下的 API 函数
2. 将 Mock 数据替换为真实的 HTTP 请求
3. 配置 API 基础地址和认证方式
4. 处理错误和加载状态

### 如何添加权限控制？

1. 在路由配置中添加 `meta.permissions` 字段
2. 实现路由守卫检查用户权限
3. 在组件中使用 `v-if` 或 `v-permission` 指令控制按钮显示

### 如何优化大数据量表格性能？

1. 使用虚拟滚动（Virtual Scroll）
2. 实现服务端分页而非前端分页
3. 使用 `v-show` 替代 `v-if` 减少 DOM 操作
4. 使用 `keep-alive` 缓存组件状态

## 主题定制

### 修改主题色

在 `vite.config.ts` 或主题配置文件中修改：

```typescript
theme: {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
  },
}
```

### 支持暗色模式

所有组件都已支持暗色模式，使用 CSS 变量实现：

```css
/* 亮色模式 */
.my-component {
  background-color: var(--vben-background-color);
  color: var(--vben-text-color);
}

/* 暗色模式 */
html[data-theme='dark'] .my-component {
  background-color: var(--vben-background-color-dark);
  color: var(--vben-text-color-dark);
}
```

## 路线图

### 已完成功能

- ✅ Dashboard 总览页面
- ✅ 工作负载管理（Pods、Deployments、StatefulSets、DaemonSets、Jobs、CronJobs）
- ✅ 网络资源管理（Services、Ingress）
- ✅ 配置管理（ConfigMaps、Secrets）
- ✅ 存储管理（PV、PVC、StorageClasses、存储概览）
- ✅ RBAC 权限管理（ServiceAccounts、Roles、RoleBindings、ClusterRoles、ClusterRoleBindings）
- ✅ 资源配额管理（ResourceQuotas、LimitRanges）
- ✅ 集群管理（Clusters、Nodes、Namespaces、Events）

### 计划中功能

- ⏳ HPA（水平自动伸缩）管理
- ⏳ Network Policies 管理
- ⏳ 监控和告警集成（Prometheus、Grafana）
- ⏳ 日志聚合和查询（Elasticsearch、Loki）
- ⏳ Helm Charts 管理
- ⏳ YAML 编辑器和验证
- ⏳ WebShell / Terminal
- ⏳ 多集群管理
- ⏳ 用户认证和授权
- ⏳ 审计日志

## 参考资源

- [Kubernetes 官方文档](https://kubernetes.io/docs/)
- [Vue 3 文档](https://vuejs.org/)
- [Ant Design Vue 文档](https://antdv.com/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建或辅助工具的变动

示例：

```bash
git commit -m "feat(dashboard): 添加集群健康状态监控"
git commit -m "fix(pods): 修复日志查看器滚动问题"
```

## 许可证

MIT License
