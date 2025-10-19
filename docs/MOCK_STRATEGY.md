# Mock API 策略说明

## 架构重构 (2025-01)

### 统一 Mock 策略

**核心变更**: 移除前端内置 Mock 逻辑，所有 Mock 数据统一由 `backend-mock` 服务提供

**架构优势**:

- ✅ **统一数据源**: 所有 Mock 数据来自同一服务，避免数据不一致
- ✅ **完整 CRUD 支持**: backend-mock 支持完整的增删改查操作
- ✅ **简化前端代码**: 移除前端 Mock 逻辑，代码更简洁
- ✅ **灵活路由**: 通过环境变量独立控制 K8s 和核心 API 的路由

### API 分类与路由控制

项目的 API 分为两大类，每类都支持独立的 Mock/真实 API 切换:

#### 1. K8s 资源 API (`/api/k8s/`)

**控制变量**: `VITE_USE_K8S_MOCK`

**包含的资源**:

- 集群管理 (Cluster)
- 工作负载 (Pod, Deployment, StatefulSet, DaemonSet, Job, CronJob, ReplicaSet)
- 服务与网络 (Service, Ingress, Endpoints, EndpointSlice, NetworkPolicy)
- 配置与存储 (ConfigMap, Secret, PersistentVolume, PersistentVolumeClaim, StorageClass)
- 权限控制 (ServiceAccount, Role, RoleBinding, ClusterRole, ClusterRoleBinding)
- 资源配额 (ResourceQuota, LimitRange)
- 其他 (Namespace, Node, Event, HPA, PriorityClass)

**Mock 支持** (通过 backend-mock):

- ✅ `list` 操作: 完全支持
- ✅ `detail` 操作: 完全支持
- ✅ `create` 操作: 完全支持
- ✅ `update` 操作: 完全支持
- ✅ `delete` 操作: 完全支持

#### 2. 核心业务 API (`/api/core/`)

**控制变量**: `VITE_USE_CORE_MOCK` (新增)

**包含的功能**:

- 用户认证 (`/auth/login`, `/auth/logout`, `/auth/refresh`)
- 用户信息 (`/user/info`)
- 权限码 (`/auth/codes`)
- 菜单数据

**Mock 支持** (通过 backend-mock):

- ✅ 认证流程: 完全支持
- ✅ 用户信息: 完全支持
- ✅ 权限码: 完全支持

## 使用场景与配置

### 场景 1: 纯前端开发 (推荐)

**目标**: 完全不依赖后端服务,使用 Mock 数据进行前端开发

**配置方式**:

```bash
# 1. 启动 Mock 服务器 (端口 5320)
pnpm -F @vben/backend-mock run start

# 2. 配置 .env.development
VITE_GLOB_API_URL=/api
VITE_NITRO_MOCK=true
VITE_USE_K8S_MOCK=false
VITE_USE_CORE_MOCK=false
```

**工作原理**:

1. Vite 代理配置将 `/api` 请求转发到 `http://localhost:5320/api`
2. `VITE_USE_K8S_MOCK=false` → K8s API 路由到 backend-mock
3. `VITE_USE_CORE_MOCK=false` → 核心 API 路由到 backend-mock
4. backend-mock 提供所有 API 的完整 Mock 实现

**优点**:

- ✅ 认证 API 有完整 Mock 支持
- ✅ K8s API 的所有操作 (CRUD) 都有 Mock
- ✅ 不需要真实后端服务
- ✅ 支持状态管理 (创建、更新、删除的数据会保留在 Mock 服务中)

### 场景 2: 混合模式 (K8s Mock + 真实认证)

**目标**: K8s 资源使用 Mock，认证服务使用真实后端

**配置方式**:

```bash
# .env.development
VITE_GLOB_API_URL=http://your-backend:8080/api
VITE_NITRO_MOCK=true
VITE_USE_K8S_MOCK=false    # K8s 使用 backend-mock
VITE_USE_CORE_MOCK=false   # 核心 API 使用真实后端
```

**工作原理**:

1. 启动 backend-mock 服务
2. K8s API 请求被代理到 backend-mock
3. 核心 API 请求发送到配置的真实后端地址

**前提条件**:

- backend-mock 服务正常运行
- 真实后端服务正常运行并提供认证接口

**优点**:

- ✅ K8s 资源开发不依赖后端
- ✅ 可以测试真实的认证流程
- ✅ K8s 支持完整 CRUD 操作

### 场景 3: 完全真实环境

**目标**: 所有 API 都使用真实后端 (生产环境/集成测试)

**配置方式**:

```bash
# .env.development 或 .env.production
VITE_GLOB_API_URL=http://your-backend-server:8080/api
VITE_NITRO_MOCK=false
VITE_USE_K8S_MOCK=false
VITE_USE_CORE_MOCK=false
```

**前提条件**:

- 真实后端服务正常运行
- 后端实现了所有 API 接口

## Mock 实现细节

### 统一 Backend Mock 架构

**实现位置**: `apps/backend-mock/`

**框架**: Nitropack (提供完整的 HTTP 服务能力)

**适用范围**: 支持所有 API (认证 + K8s 资源 CRUD)

**优点**:

- ✅ 完整的 RESTful API Mock
- ✅ 支持状态管理 (可以模拟创建、更新、删除)
- ✅ 支持认证流程 Mock
- ✅ 统一的数据源，避免数据不一致

**启动方式**:

```bash
pnpm -F @vben/backend-mock run start
```

### 前端路由机制

**实现位置**: `apps/web-k8s/src/api/k8s/mock-adapter.ts`

**核心函数**:

```typescript
/**
 * 获取 API 基础路径
 * @param apiType API 类型 ('k8s' | 'core')
 */
export function getApiBasePath(apiType: 'k8s' | 'core' = 'k8s'): string {
  const useMock = apiType === 'k8s' ? useK8sMock() : useCoreMock();

  if (useMock) {
    // Mock 模式：路由到 backend-mock (通过 Vite 代理)
    return '/api';
  }

  // 真实模式：使用配置的真实 API 地址
  return import.meta.env.VITE_GLOB_API_URL || '/api';
}
```

**简化原则**:

- 移除前端内置 Mock 逻辑
- `createMockableApi()` 现在只是简单的包装器
- 所有 Mock 切换由 backend-mock 和 Vite 代理处理

### 环境变量控制

**三个关键变量**:

1. **`VITE_NITRO_MOCK`** - 总开关
   - `true`: Vite 代理 `/api` 到 `http://localhost:5320`
   - `false`: 使用 `VITE_GLOB_API_URL` 配置的地址

2. **`VITE_USE_K8S_MOCK`** - K8s API 路由控制
   - `false`: 路由到 backend-mock 或真实 API (推荐)
   - `true`: 使用前端内置 Mock (已废弃)

3. **`VITE_USE_CORE_MOCK`** - 核心 API 路由控制
   - `false`: 路由到 backend-mock 或真实 API (推荐)
   - `true`: 使用前端内置 Mock (已废弃)
   - 未设置: 跟随 `VITE_NITRO_MOCK`

## 迁移指南

### 从前端内置 Mock 迁移到 Backend Mock

**步骤 1: 更新环境变量**

```bash
# 旧配置 (前端内置 Mock)
VITE_USE_K8S_MOCK=true

# 新配置 (backend-mock)
VITE_NITRO_MOCK=true
VITE_USE_K8S_MOCK=false
VITE_USE_CORE_MOCK=false
```

**步骤 2: 启动 backend-mock 服务**

```bash
pnpm -F @vben/backend-mock run start
```

**步骤 3: 重启开发服务器**

```bash
pnpm dev:k8s
```

### 废弃的代码

以下代码已废弃，但保留用于向后兼容:

1. **前端内置 Mock 数据生成器**
   - 位置: `apps/web-k8s/src/api/k8s/mock.ts`
   - 状态: 已废弃，不推荐使用

2. **`createMockableApi()` 的 Mock 切换逻辑**
   - 位置: `apps/web-k8s/src/api/k8s/mock-adapter.ts`
   - 状态: 简化为简单包装器

## 问题与解决方案

### ~~问题 1: 前端 Mock 的 CRUD 限制~~ (已解决)

**旧问题**: 前端内置 Mock 只支持 `list` 操作

**解决方案**: 统一使用 backend-mock，支持完整 CRUD

### ~~问题 2: 认证 API 不受 Mock 控制~~ (已解决)

**旧问题**: 认证 API 始终调用真实后端

**解决方案**:

- 新增 `VITE_USE_CORE_MOCK` 环境变量
- 支持独立控制核心 API 的路由

## 推荐的开发配置

### 标准开发流程

```bash
# 1. 启动 backend-mock (一次性,可以一直运行)
pnpm -F @vben/backend-mock run start

# 2. 启动前端开发服务器
pnpm dev:k8s

# 3. 配置 .env.development
VITE_GLOB_API_URL=/api
VITE_NITRO_MOCK=true           # 启用 backend-mock
VITE_USE_K8S_MOCK=false        # K8s API 使用 backend-mock
VITE_USE_CORE_MOCK=false       # 核心 API 使用 backend-mock
```

**这是最简单、功能最完整的开发配置**

## 总结

### 配置对比表

| 配置模式 | K8s Mock | 核心 API Mock | K8s CRUD | 认证功能 | 推荐场景 |
| --- | --- | --- | --- | --- | --- |
| **backend-mock (推荐)** | ✅ backend-mock | ✅ backend-mock | ✅ 完整支持 | ✅ 完整支持 | **日常开发** |
| 混合模式 | ✅ backend-mock | ✅ 真实后端 | ✅ 完整支持 | ✅ 真实认证 | 集成测试认证 |
| 完全真实 | ✅ 真实后端 | ✅ 真实后端 | ✅ 完整支持 | ✅ 真实认证 | 生产/集成测试 |
| ~~前端内置 Mock~~ | ~~⚠️ 前端 Mock~~ | ~~❌ 需真实后端~~ | ~~❌ 仅 list~~ | ~~❌ 不支持~~ | ~~已废弃~~ |

### 最佳实践

1. **日常开发**: 使用 backend-mock (场景 1)
   - 功能最完整，不依赖真实后端
   - 支持完整的 CRUD 操作
   - 支持认证流程

2. **集成测试**: 使用真实后端 (场景 3)
   - 验证前后端集成
   - 测试真实 API 响应

3. **特殊需求**: 混合模式 (场景 2)
   - K8s 使用 Mock，快速开发
   - 认证使用真实后端，测试真实登录流程

### 环境变量速查

```bash
# 场景 1: 纯前端开发 (推荐)
VITE_GLOB_API_URL=/api
VITE_NITRO_MOCK=true
VITE_USE_K8S_MOCK=false
VITE_USE_CORE_MOCK=false

# 场景 2: 混合模式
VITE_GLOB_API_URL=http://real-backend:8080/api
VITE_NITRO_MOCK=true
VITE_USE_K8S_MOCK=false    # K8s 走 backend-mock
VITE_USE_CORE_MOCK=false   # 核心 API 走真实后端

# 场景 3: 完全真实
VITE_GLOB_API_URL=http://real-backend:8080/api
VITE_NITRO_MOCK=false
VITE_USE_K8S_MOCK=false
VITE_USE_CORE_MOCK=false
```
