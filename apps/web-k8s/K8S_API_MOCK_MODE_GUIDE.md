# K8s API Mock 模式配置指南

## 概述

项目支持通过环境变量在 **Mock 数据模式** 和 **真实 API 模式** 之间切换，无需修改代码。

## 配置方式

### 1. 环境变量配置

在 `.env.development` 或 `.env.production` 文件中设置：

```bash
# 是否开启 K8s API Mock 模式
# - true: 使用 mock 数据（适合开发和演示）
# - false: 使用真实 API（默认，适合生产环境）
VITE_USE_K8S_MOCK=false
```

### 2. 快速切换模式

#### 开发环境 - 使用 Mock 数据

编辑 `apps/web-k8s/.env.development`：

```bash
VITE_USE_K8S_MOCK=true
```

重启开发服务器：

```bash
pnpm dev:k8s
```

#### 开发环境 - 使用真实 API

编辑 `apps/web-k8s/.env.development`：

```bash
VITE_USE_K8S_MOCK=false
```

确保后端服务运行在 `localhost:8082`：

```bash
cd /path/to/cluster-service
go run cmd/server/main.go -config configs/config-local.yaml
```

重启前端服务：

```bash
pnpm dev:k8s
```

## 工作原理

### 1. 环境变量检测

系统通过 `src/utils/env.ts` 中的 `useK8sMock()` 函数检测环境变量：

```typescript
import { useK8sMock } from '#/utils/env';

if (useK8sMock()) {
  // 使用 mock 数据
} else {
  // 使用真实 API
}
```

### 2. API 自动切换

所有资源 API 都通过工厂函数包装，自动支持 mock 模式切换：

```typescript
// Pod API 自动支持 mock 切换
const podApiBase = createMockableResourceApi(
  createResourceApi<Pod>(requestClient, {
    resourceType: 'pod',
    namespaced: true,
  }),
  'pod',
);
```

### 3. 支持的资源

所有主要 K8s 资源都支持 mock 模式切换：

- ✅ Pod
- ✅ Deployment
- ✅ Service
- ✅ ConfigMap
- ✅ Secret
- ✅ Node
- ✅ Namespace
- ✅ StatefulSet
- ✅ DaemonSet
- ✅ Job
- ✅ CronJob
- ✅ Ingress
- ✅ PersistentVolume
- ✅ PersistentVolumeClaim
- ✅ StorageClass
- ✅ NetworkPolicy
- ✅ HPA
- ✅ RBAC 资源（Role, RoleBinding, ClusterRole, ClusterRoleBinding, ServiceAccount）
- ✅ 配额资源（ResourceQuota, LimitRange）
- ✅ 事件（Event）

## 使用场景

### Mock 模式适用场景

1. **前端开发** - 无需依赖后端服务即可开发
2. **演示展示** - 使用预设数据进行产品演示
3. **UI 测试** - 测试各种数据状态下的界面表现
4. **离线开发** - 无网络环境下进行开发

### 真实 API 模式适用场景

1. **生产环境** - 连接真实 K8s 集群
2. **集成测试** - 测试前后端集成
3. **功能验证** - 验证真实数据处理逻辑
4. **性能测试** - 测试真实环境下的性能

## 调试技巧

### 1. 查看当前模式

打开浏览器控制台，当使用 mock 模式时会看到以下日志：

```
[K8s Mock] Creating mockable API for pod
[K8s Mock] Using getMockPodList
```

### 2. 验证 Mock 函数

检查 `src/api/k8s/mock.ts` 文件，确保对应的 mock 函数存在：

```typescript
export function getMockPodList(params: { ... }): PodListResult {
  // Mock 数据实现
}
```

### 3. 网络请求验证

- **Mock 模式**: 不会发送网络请求到后端
- **真实 API 模式**: 会看到请求发送到 `localhost:8082/api/k8s/...`

## 故障排查

### 问题：切换模式后没有生效

**解决方案**：

1. 确认修改了正确的 `.env` 文件（`.env.development` 或 `.env.production`）
2. 重启开发服务器（`Ctrl+C` 然后重新运行 `pnpm dev:k8s`）
3. 清除浏览器缓存并刷新页面

### 问题：Mock 函数未找到

**错误日志**：

```
[K8s Mock] Mock function getMockXxxList not found, falling back to real API
```

**解决方案**：检查 `src/api/k8s/mock.ts` 文件，确保对应的 mock 函数已导出

### 问题：真实 API 连接失败

**错误**：`Network Error` 或 `503 Service Unavailable`

**解决方案**：

1. 确认后端服务正在运行
2. 检查后端端口是否为 `8082`
3. 查看 Vite 代理配置 (`vite.config.mts`)

## 最佳实践

1. **开发阶段**：
   - 初期使用 mock 模式快速开发 UI
   - 后期切换到真实 API 验证集成

2. **团队协作**：
   - 前端团队使用 mock 模式并行开发
   - 定期切换到真实 API 进行集成测试

3. **版本控制**：
   - 不要提交 `.env.development.local`（本地配置）
   - 保持 `.env.development` 中 `VITE_USE_K8S_MOCK=false`（团队默认使用真实 API）

4. **文档更新**：
   - 添加新资源时，同步更新 mock 函数
   - 保持 mock 数据与真实 API 响应格式一致

## 技术架构

### 文件结构

```
src/
├── api/
│   └── k8s/
│       ├── index.ts                    # API 定义（支持 mock 切换）
│       ├── mock.ts                     # Mock 数据函数
│       ├── mock-adapter.ts             # Mock 适配器
│       ├── mock-resource-factory.ts    # Mock 资源工厂
│       └── resource-api-factory.ts     # 真实 API 工厂
├── utils/
│   └── env.ts                          # 环境变量工具
└── ...
```

### 核心函数

1. **`useK8sMock()`** - 检测是否使用 mock 模式
2. **`createMockableResourceApi()`** - 创建支持 mock 切换的资源 API
3. **`createMockableApi()`** - 创建支持 mock 切换的单个 API 函数

## 相关文档

- [Mock API 修复报告](./MOCK_API_FIX_REPORT.md) - Mock 迁移历史
- [API 代理配置](./API_PROXY_CONFIGURATION.md) - Vite 代理配置
- [迁移指南](./MOCK_TO_REAL_API_MIGRATION.md) - Mock 到真实 API 迁移指南
