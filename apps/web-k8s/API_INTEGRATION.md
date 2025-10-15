# API 集成指南

本文档介绍如何将 Mock 数据替换为真实的 Kubernetes API 调用。

## 目录

- [概述](#概述)
- [前置要求](#前置要求)
- [API 客户端设置](#api-客户端设置)
- [认证配置](#认证配置)
- [API 接口实现](#api-接口实现)
- [错误处理](#错误处理)
- [测试](#测试)

## 概述

当前项目使用 Mock 数据进行开发，所有 API 调用都返回模拟数据。要连接真实的 Kubernetes 集群，需要：

1. 配置 API 客户端
2. 实现认证机制
3. 替换 Mock 函数为真实 API 调用
4. 处理错误和边界情况

## 前置要求

### Kubernetes 访问方式

有三种主要方式访问 Kubernetes API：

#### 1. 直接访问 API Server

```bash
# 获取 API Server 地址
kubectl cluster-info

# 输出示例：
# Kubernetes control plane is running at https://kubernetes.docker.internal:6443
```

#### 2. 通过 kubectl proxy

```bash
# 启动 proxy（默认端口 8001）
kubectl proxy --port=8001

# API 地址：http://localhost:8001
```

#### 3. 通过后端代理（推荐）

创建一个后端服务作为代理，处理认证和转发请求。

```text
浏览器 → 前端应用 → 后端代理 → Kubernetes API Server
```

## API 客户端设置

### 1. 安装依赖

```bash
pnpm add axios
```

### 2. 创建 API 客户端

创建 `src/api/k8s/client.ts`：

```typescript
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

// API 配置
const API_CONFIG = {
  // 开发环境：使用 kubectl proxy
  baseURL: import.meta.env.VITE_K8S_API_BASE_URL || 'http://localhost:8001',
  timeout: 30000,
};

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证 token
    const token = localStorage.getItem('k8s_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权 - 跳转到登录页
          console.error('Unauthorized - redirecting to login');
          break;
        case 403:
          // 禁止访问
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          // 资源不存在
          console.error('Resource not found');
          break;
        case 500:
          // 服务器错误
          console.error('Server error');
          break;
        default:
          console.error('API error:', error.response.data);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
```

### 3. 环境变量配置

创建 `.env.development`：

```bash
# Kubernetes API 基础 URL
VITE_K8S_API_BASE_URL=http://localhost:8001

# 是否使用 Mock 数据
VITE_USE_MOCK_DATA=false
```

创建 `.env.production`：

```bash
# 生产环境 API 地址
VITE_K8S_API_BASE_URL=/api/k8s

# 是否使用 Mock 数据
VITE_USE_MOCK_DATA=false
```

## 认证配置

### 方式 1：Bearer Token

```typescript
// 设置 token
export function setAuthToken(token: string): void {
  localStorage.setItem('k8s_token', token);
}

// 清除 token
export function clearAuthToken(): void {
  localStorage.removeItem('k8s_token');
}

// 获取 token
export function getAuthToken(): string | null {
  return localStorage.getItem('k8s_token');
}
```

### 方式 2：通过后端代理

如果使用后端代理，认证由后端处理：

```typescript
// 前端只需要设置用户会话
apiClient.defaults.withCredentials = true;
```

## API 接口实现

### 1. 创建 API 服务文件

创建 `src/api/k8s/services/pods.ts`：

```typescript
import apiClient from '../client';
import type { Pod, PodList, ListOptions } from '../types';

/**
 * 获取 Pod 列表
 */
export async function getPodList(options?: ListOptions): Promise<PodList> {
  const { namespace = 'default', labelSelector, fieldSelector } = options || {};

  const params: Record<string, string> = {};
  if (labelSelector) params.labelSelector = labelSelector;
  if (fieldSelector) params.fieldSelector = fieldSelector;

  const url = namespace === 'all'
    ? '/api/v1/pods'
    : `/api/v1/namespaces/${namespace}/pods`;

  return apiClient.get(url, { params });
}

/**
 * 获取单个 Pod
 */
export async function getPod(namespace: string, name: string): Promise<Pod> {
  return apiClient.get(`/api/v1/namespaces/${namespace}/pods/${name}`);
}

/**
 * 删除 Pod
 */
export async function deletePod(namespace: string, name: string): Promise<void> {
  return apiClient.delete(`/api/v1/namespaces/${namespace}/pods/${name}`);
}

/**
 * 获取 Pod 日志
 */
export async function getPodLogs(
  namespace: string,
  name: string,
  container?: string,
): Promise<string> {
  const params: Record<string, string> = {};
  if (container) params.container = container;

  return apiClient.get(
    `/api/v1/namespaces/${namespace}/pods/${name}/log`,
    { params },
  );
}
```

### 2. 更新 API 索引文件

修改 `src/api/k8s/index.ts`：

```typescript
// 检查是否使用 Mock 数据
const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// 根据环境变量选择使用 Mock 或真实 API
export const api = useMock
  ? await import('./mock')
  : await import('./services');

// 导出所有 API 函数
export const {
  getPodList,
  getPod,
  deletePod,
  getPodLogs,
  // ... 其他函数
} = api;
```

### 3. 实现其他资源的 API

按照相同的模式创建其他资源的 API 服务文件：

- `src/api/k8s/services/deployments.ts`
- `src/api/k8s/services/services.ts`
- `src/api/k8s/services/nodes.ts`
- 等等...

## Kubernetes API 路径参考

### Core API (v1)

```typescript
// Pods
GET    /api/v1/namespaces/{namespace}/pods
GET    /api/v1/namespaces/{namespace}/pods/{name}
DELETE /api/v1/namespaces/{namespace}/pods/{name}
GET    /api/v1/namespaces/{namespace}/pods/{name}/log

// Services
GET    /api/v1/namespaces/{namespace}/services
GET    /api/v1/namespaces/{namespace}/services/{name}

// ConfigMaps
GET    /api/v1/namespaces/{namespace}/configmaps
GET    /api/v1/namespaces/{namespace}/configmaps/{name}

// Secrets
GET    /api/v1/namespaces/{namespace}/secrets
GET    /api/v1/namespaces/{namespace}/secrets/{name}

// Nodes
GET    /api/v1/nodes
GET    /api/v1/nodes/{name}

// Namespaces
GET    /api/v1/namespaces
GET    /api/v1/namespaces/{name}

// Events
GET    /api/v1/namespaces/{namespace}/events
```

### Apps API (apps/v1)

```typescript
// Deployments
GET    /apis/apps/v1/namespaces/{namespace}/deployments
GET    /apis/apps/v1/namespaces/{namespace}/deployments/{name}

// StatefulSets
GET    /apis/apps/v1/namespaces/{namespace}/statefulsets
GET    /apis/apps/v1/namespaces/{namespace}/statefulsets/{name}

// DaemonSets
GET    /apis/apps/v1/namespaces/{namespace}/daemonsets
GET    /apis/apps/v1/namespaces/{namespace}/daemonsets/{name}
```

### Batch API (batch/v1)

```typescript
// Jobs
GET    /apis/batch/v1/namespaces/{namespace}/jobs
GET    /apis/batch/v1/namespaces/{namespace}/jobs/{name}

// CronJobs
GET    /apis/batch/v1/namespaces/{namespace}/cronjobs
GET    /apis/batch/v1/namespaces/{namespace}/cronjobs/{name}
```

### Networking API (networking.k8s.io/v1)

```typescript
// Ingress
GET    /apis/networking.k8s.io/v1/namespaces/{namespace}/ingresses
GET    /apis/networking.k8s.io/v1/namespaces/{namespace}/ingresses/{name}
```

### Storage API (storage.k8s.io/v1)

```typescript
// StorageClasses
GET    /apis/storage.k8s.io/v1/storageclasses
GET    /apis/storage.k8s.io/v1/storageclasses/{name}
```

### RBAC API (rbac.authorization.k8s.io/v1)

```typescript
// Roles
GET    /apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/roles
GET    /apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/roles/{name}

// ClusterRoles
GET    /apis/rbac.authorization.k8s.io/v1/clusterroles
GET    /apis/rbac.authorization.k8s.io/v1/clusterroles/{name}
```

## 错误处理

### 创建错误处理工具

创建 `src/utils/error-handler.ts`：

```typescript
import { message } from 'ant-design-vue';

export interface K8sError {
  code: number;
  message: string;
  reason?: string;
  details?: any;
}

export function handleApiError(error: any): void {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 401:
        message.error('认证失败，请重新登录');
        // 跳转到登录页
        break;
      case 403:
        message.error('权限不足，无法访问此资源');
        break;
      case 404:
        message.error('资源不存在');
        break;
      case 409:
        message.error('资源冲突');
        break;
      case 500:
        message.error('服务器错误');
        break;
      default:
        message.error(data?.message || '请求失败');
    }
  } else if (error.request) {
    message.error('网络错误，请检查连接');
  } else {
    message.error('请求配置错误');
  }
}
```

### 在组件中使用

```typescript
import { handleApiError } from '#/utils/error-handler';

async function loadPods() {
  loading.value = true;
  try {
    const result = await getPodList({ namespace: currentNamespace.value });
    pods.value = result.items;
  } catch (error) {
    handleApiError(error);
  } finally {
    loading.value = false;
  }
}
```

## 数据转换

### Kubernetes API 响应格式

Kubernetes API 返回的数据格式与 Mock 数据可能有差异：

```typescript
// Kubernetes API 响应
{
  "kind": "PodList",
  "apiVersion": "v1",
  "metadata": {
    "resourceVersion": "12345"
  },
  "items": [
    {
      "metadata": { ... },
      "spec": { ... },
      "status": { ... }
    }
  ]
}
```

### 创建数据转换函数

创建 `src/api/k8s/transformers.ts`：

```typescript
import type { Pod, PodList } from './types';

/**
 * 转换 Pod 列表响应
 */
export function transformPodList(response: any): PodList {
  return {
    items: response.items || [],
    total: response.items?.length || 0,
    page: 1,
    pageSize: response.items?.length || 0,
  };
}

/**
 * 转换 Pod 响应
 */
export function transformPod(response: any): Pod {
  return response;
}
```

## 测试

### 1. 测试连接

创建测试页面检查 API 连接：

```typescript
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Card, Alert } from 'ant-design-vue';
import apiClient from '#/api/k8s/client';

const connectionStatus = ref<'idle' | 'testing' | 'success' | 'error'>('idle');
const errorMessage = ref('');

async function testConnection() {
  connectionStatus.value = 'testing';
  errorMessage.value = '';

  try {
    await apiClient.get('/api/v1/namespaces/default');
    connectionStatus.value = 'success';
  } catch (error: any) {
    connectionStatus.value = 'error';
    errorMessage.value = error.message;
  }
}
</script>

<template>
  <Card title="API 连接测试">
    <Button @click="testConnection" :loading="connectionStatus === 'testing'">
      测试连接
    </Button>

    <Alert
      v-if="connectionStatus === 'success'"
      type="success"
      message="连接成功"
      style="margin-top: 16px;"
    />

    <Alert
      v-if="connectionStatus === 'error'"
      type="error"
      :message="errorMessage"
      style="margin-top: 16px;"
    />
  </Card>
</template>
```

### 2. 单元测试

使用 Vitest 测试 API 函数：

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getPodList } from '../services/pods';
import apiClient from '../client';

vi.mock('../client');

describe('Pods API', () => {
  it('should get pod list', async () => {
    const mockData = {
      items: [{ metadata: { name: 'test-pod' } }],
    };

    vi.mocked(apiClient.get).mockResolvedValue(mockData);

    const result = await getPodList({ namespace: 'default' });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/namespaces/default/pods',
      { params: {} }
    );
    expect(result).toEqual(mockData);
  });
});
```

## 渐进式迁移

建议采用渐进式方式迁移：

### 阶段 1：基础设施

1. ✅ 创建 API 客户端
2. ✅ 配置环境变量
3. ✅ 实现认证机制

### 阶段 2：核心资源

1. 实现 Pods API
2. 实现 Deployments API
3. 实现 Services API
4. 测试基本功能

### 阶段 3：扩展资源

1. 实现存储相关 API
2. 实现 RBAC 相关 API
3. 实现配额相关 API

### 阶段 4：优化和完善

1. 添加缓存机制
2. 实现实时更新（WebSocket）
3. 性能优化
4. 错误处理完善

## 后端代理示例（可选）

如果需要创建后端代理服务，可以使用 Node.js + Express：

```typescript
// backend-proxy/server.ts
import express from 'express';
import axios from 'axios';

const app = express();

// Kubernetes API 配置
const K8S_API_SERVER = process.env.K8S_API_SERVER || 'https://kubernetes.default.svc';
const K8S_TOKEN = process.env.K8S_TOKEN;

// 代理中间件
app.use('/api/k8s', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${K8S_API_SERVER}${req.url}`,
      headers: {
        Authorization: `Bearer ${K8S_TOKEN}`,
      },
      data: req.body,
    });

    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on port 3000');
});
```

## 安全建议

1. **不要在前端存储敏感信息**：Token 应该安全存储
2. **使用 HTTPS**：生产环境必须使用 HTTPS
3. **实现 RBAC**：确保用户只能访问有权限的资源
4. **验证输入**：所有用户输入都需要验证
5. **限流**：防止 API 滥用
6. **审计日志**：记录所有 API 操作

## 参考资源

- [Kubernetes API 文档](https://kubernetes.io/docs/reference/kubernetes-api/)
- [Kubernetes API 概念](https://kubernetes.io/docs/reference/using-api/api-concepts/)
- [kubectl proxy](https://kubernetes.io/docs/tasks/extend-kubernetes/http-proxy-access-api/)
- [认证文档](https://kubernetes.io/docs/reference/access-authn-authz/authentication/)

---

**更新日期**：2025-10-15
**状态**：待实施
