# URL 路径变更说明

## 新旧路径对照表

优化后，URL 路径已经重新组织以体现 K8s 资源的层级关系。

### 旧路径 → 新路径

| 资源类型 | 旧路径 | 新路径 |
|---------|--------|--------|
| Pods | `/pods` | `/k8s/workloads/pods` |
| Deployments | `/deployments` | `/k8s/workloads/deployments` |
| StatefulSets | - | `/k8s/workloads/statefulsets` |
| DaemonSets | - | `/k8s/workloads/daemonsets` |
| Jobs | - | `/k8s/workloads/jobs` |
| CronJobs | `/cronjobs` | `/k8s/workloads/cronjobs` |
| Services | `/services` | `/k8s/network/services` |
| ConfigMaps | `/configmaps` | `/k8s/config/configmaps` |
| Secrets | - | `/k8s/config/secrets` |
| Clusters | `/clusters` | `/k8s/cluster/clusters` |
| Nodes | `/nodes` | `/k8s/cluster/nodes` |
| Namespaces | - | `/k8s/cluster/namespaces` |

## 访问方式

### 方式 1: 直接访问新路径

直接在浏览器中访问新的 URL，例如：

```
http://localhost:5173/k8s/workloads/pods
http://localhost:5173/k8s/network/services
http://localhost:5173/k8s/config/configmaps
```

### 方式 2: 通过导航菜单

访问根路径 `/k8s`，会自动重定向到 `/k8s/workloads/pods`，然后可以通过左侧菜单导航到其他页面。

## 路由层级结构

```
/k8s
├── 工作负载 (/workloads)
│   ├── Pods
│   ├── Deployments
│   ├── StatefulSets
│   ├── DaemonSets
│   ├── Jobs
│   └── CronJobs
├── 网络 (/network)
│   └── Services
├── 配置 (/config)
│   ├── ConfigMaps
│   └── Secrets
└── 集群 (/cluster)
    ├── Clusters
    ├── Nodes
    └── Namespaces
```

## 如果仍然出现 404

1. **清除浏览器缓存**
   - Chrome: Ctrl/Cmd + Shift + R
   - 或者打开开发者工具 (F12) → Network → 勾选 "Disable cache"

2. **重启开发服务器**
   ```bash
   cd apps/web-k8s
   npm run dev
   ```

3. **确认访问正确的端口**
   - 检查控制台输出的端口号
   - 通常是 `http://localhost:5173` 或 `http://localhost:5174`

4. **检查路由配置**
   - 文件位置: `src/router/routes/modules/k8s.ts`
   - 确认路由已正确配置

## 临时兼容方案

如果你希望保留旧的 URL 路径，可以在路由配置中添加重定向：

```typescript
// 在 k8s.ts 路由配置中添加
{
  path: '/pods',
  redirect: '/k8s/workloads/pods',
},
{
  path: '/deployments',
  redirect: '/k8s/workloads/deployments',
},
// ... 其他重定向
```
