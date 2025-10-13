# Kubernetes 管理独立服务架构指南

## 架构概述

K8s 管理功能可以作为一个完全独立的微服务运行，与主应用分离部署。这种架构有以下优势：

### 优势

1. **独立部署和扩展**: K8s 管理服务可以独立部署、更新和扩展
2. **技术栈隔离**: 可以使用不同的技术栈或版本
3. **安全隔离**: K8s 集群管理权限与主应用隔离
4. **性能优化**: 资源密集型操作不影响主应用
5. **团队协作**: 不同团队可以独立开发和维护
6. **灵活部署**: 可以部署在靠近 K8s 集群的位置，减少延迟

## 架构方案

### 方案一：完全独立的前后端应用

```
┌─────────────────────────────────────────────────────────┐
│                    主应用 (web-antd)                     │
│                                                          │
│  Dashboard, User Management, Other Features...          │
└──────────────────────────┬──────────────────────────────┘
                           │
                           │ iframe 嵌入 或 路由跳转
                           ↓
┌─────────────────────────────────────────────────────────┐
│              独立 K8s 管理应用 (web-k8s)                 │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │            前端应用 (Vue 3 + Vite)               │   │
│  │  - 集群管理  - Pod 管理  - Deployment 管理      │   │
│  │  - Service   - ConfigMap  - CronJob            │   │
│  └────────────────────┬────────────────────────────┘   │
│                       │ HTTP/WebSocket                  │
│                       ↓                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │          后端 API (Node.js/Go/Python)            │   │
│  │  - RESTful API    - WebSocket (日志/终端)       │   │
│  │  - 认证授权       - K8s Client                   │   │
│  └────────────────────┬────────────────────────────┘   │
└───────────────────────┼──────────────────────────────────┘
                        │
                        ↓
              ┌──────────────────┐
              │  Kubernetes API   │
              │     Servers       │
              └──────────────────┘
```

### 方案二：共享前端，独立后端 API

```
┌─────────────────────────────────────────────────────────┐
│              统一前端应用 (web-antd)                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │  K8s Pages   │  │  Other Pages │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │          │
└─────────┼─────────────────┼──────────────────┼──────────┘
          │                 │                  │
          ↓                 ↓                  ↓
    ┌──────────┐     ┌──────────────┐   ┌──────────┐
    │  主 API   │     │  K8s API 服务 │   │  其他 API │
    └──────────┘     └──────┬───────┘   └──────────┘
                            │
                            ↓
                   ┌──────────────────┐
                   │  Kubernetes API   │
                   │     Servers       │
                   └──────────────────┘
```

### 方案三：微前端架构 (推荐)

```
┌─────────────────────────────────────────────────────────┐
│           主应用/基座 (qiankun/微前端框架)               │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  子应用A   │  │ K8s 子应用  │  │  子应用C   │       │
│  │ (web-antd) │  │ (web-k8s)  │  │ (web-xxx)  │       │
│  └────────────┘  └──────┬─────┘  └────────────┘       │
└─────────────────────────┼──────────────────────────────┘
                          │
                          ↓
                 ┌──────────────────┐
                 │  K8s API Gateway  │
                 └─────────┬─────────┘
                          │
                          ↓
                 ┌──────────────────┐
                 │  Kubernetes API   │
                 │     Servers       │
                 └──────────────────┘
```

## 实现方案

### 推荐方案：独立应用 + API Gateway

在当前 monorepo 中创建独立的 K8s 管理应用。

## 目录结构

```
apps/
├── web-antd/           # 主应用
├── web-k8s/            # 独立 K8s 管理应用 (新建)
│   ├── src/
│   │   ├── api/        # K8s API 接口
│   │   ├── views/      # K8s 页面
│   │   ├── router/     # 路由配置
│   │   ├── store/      # 状态管理
│   │   ├── locales/    # 国际化
│   │   └── main.ts     # 应用入口
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── backend-k8s/        # K8s 后端 API (新建)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
└── backend-mock/       # Mock 服务 (现有)
    └── api/k8s/
```

## 应用配置

### 1. 创建独立 K8s 应用

```json
// apps/web-k8s/package.json
{
  "name": "@vben/web-k8s",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5667",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "ant-design-vue": "^4.1.0",
    "@vben/request": "workspace:*",
    "@vben/utils": "workspace:*"
  }
}
```

### 2. 环境变量配置

```bash
# apps/web-k8s/.env.development
VITE_PORT=5667
VITE_BASE=/k8s
VITE_APP_TITLE=K8s Management Platform

# K8s API 地址
VITE_K8S_API_URL=/k8s-api

# 是否使用 Mock
VITE_NITRO_MOCK=true

# 主应用地址（用于返回主应用）
VITE_MAIN_APP_URL=http://localhost:5666
```

```bash
# apps/web-k8s/.env.production
VITE_BASE=/k8s
VITE_APP_TITLE=K8s Management Platform

# K8s API Gateway 地址
VITE_K8S_API_URL=https://k8s-api.your-domain.com

# 关闭 Mock
VITE_NITRO_MOCK=false

# 主应用地址
VITE_MAIN_APP_URL=https://app.your-domain.com
```

### 3. 路由配置

```typescript
// apps/web-k8s/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE),
  routes: [
    {
      path: '/',
      redirect: '/clusters',
    },
    {
      path: '/clusters',
      component: () => import('../views/clusters/index.vue'),
    },
    {
      path: '/clusters/:id',
      component: () => import('../views/clusters/detail.vue'),
    },
    {
      path: '/pods',
      component: () => import('../views/pods/index.vue'),
    },
    // ... 其他路由
  ],
});

export default router;
```

### 4. API 配置

```typescript
// apps/web-k8s/src/api/request.ts
import { RequestClient } from '@vben/request';

const apiURL = import.meta.env.VITE_K8S_API_URL;

export const requestClient = new RequestClient({
  baseURL: apiURL,
  timeout: 30000,
});

// 请求拦截器
requestClient.addRequestInterceptor({
  fulfilled: async (config) => {
    // 从 localStorage 或 cookie 获取 token
    const token = localStorage.getItem('k8s_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
});

// 响应拦截器
requestClient.addResponseInterceptor({
  fulfilled: (response) => response.data,
  rejected: (error) => {
    // 统一错误处理
    console.error('API Error:', error);
    return Promise.reject(error);
  },
});
```

## 后端 API 服务

### 使用 Node.js (Express/Fastify)

```typescript
// apps/backend-k8s/src/main.ts
import Fastify from 'fastify';
import { k8sRoutes } from './routes/k8s';

const fastify = Fastify({ logger: true });

// CORS 配置
fastify.register(import('@fastify/cors'), {
  origin: ['http://localhost:5667', 'https://k8s.your-domain.com'],
  credentials: true,
});

// 注册路由
fastify.register(k8sRoutes, { prefix: '/api' });

// 启动服务
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('K8s API Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

```typescript
// apps/backend-k8s/src/services/k8s-client.ts
import * as k8s from '@kubernetes/client-node';

export class K8sClient {
  private kc: k8s.KubeConfig;
  private k8sApi: k8s.CoreV1Api;
  private appsApi: k8s.AppsV1Api;
  private batchApi: k8s.BatchV1Api;

  constructor(kubeconfig?: string) {
    this.kc = new k8s.KubeConfig();

    if (kubeconfig) {
      this.kc.loadFromString(kubeconfig);
    } else {
      // 从默认位置加载
      this.kc.loadFromDefault();
    }

    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
    this.batchApi = this.kc.makeApiClient(k8s.BatchV1Api);
  }

  // 获取 Pods
  async listPods(namespace: string = 'default') {
    const response = await this.k8sApi.listNamespacedPod(namespace);
    return response.body;
  }

  // 获取 Deployments
  async listDeployments(namespace: string = 'default') {
    const response = await this.appsApi.listNamespacedDeployment(namespace);
    return response.body;
  }

  // 扩缩容 Deployment
  async scaleDeployment(
    namespace: string,
    name: string,
    replicas: number,
  ) {
    const patch = {
      spec: { replicas },
    };
    const response = await this.appsApi.patchNamespacedDeploymentScale(
      name,
      namespace,
      patch,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } },
    );
    return response.body;
  }

  // 获取 Pod 日志
  async getPodLogs(
    namespace: string,
    name: string,
    container?: string,
    tailLines?: number,
  ) {
    const response = await this.k8sApi.readNamespacedPodLog(
      name,
      namespace,
      container,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      tailLines,
    );
    return response.body;
  }

  // 创建 Pod
  async createPod(namespace: string, podManifest: any) {
    const response = await this.k8sApi.createNamespacedPod(namespace, podManifest);
    return response.body;
  }

  // 删除 Pod
  async deletePod(namespace: string, name: string) {
    const response = await this.k8sApi.deleteNamespacedPod(name, namespace);
    return response.body;
  }
}
```

## 部署方案

### 方案 1: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 主应用
  web-antd:
    build:
      context: ./apps/web-antd
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production

  # K8s 管理应用
  web-k8s:
    build:
      context: ./apps/web-k8s
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
      - VITE_K8S_API_URL=http://backend-k8s:3000

  # K8s API 后端
  backend-k8s:
    build:
      context: ./apps/backend-k8s
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ~/.kube/config:/root/.kube/config:ro
    networks:
      - k8s-network

networks:
  k8s-network:
    driver: bridge
```

### 方案 2: Kubernetes 部署

```yaml
# k8s/web-k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-k8s
  namespace: management
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-k8s
  template:
    metadata:
      labels:
        app: web-k8s
    spec:
      containers:
      - name: web-k8s
        image: your-registry/web-k8s:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_K8S_API_URL
          value: "http://backend-k8s-service:3000"
---
apiVersion: v1
kind: Service
metadata:
  name: web-k8s-service
  namespace: management
spec:
  selector:
    app: web-k8s
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-k8s
  namespace: management
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend-k8s
  template:
    metadata:
      labels:
        app: backend-k8s
    spec:
      serviceAccountName: k8s-manager
      containers:
      - name: backend-k8s
        image: your-registry/backend-k8s:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: backend-k8s-service
  namespace: management
spec:
  selector:
    app: backend-k8s
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
---
# RBAC 配置
apiVersion: v1
kind: ServiceAccount
metadata:
  name: k8s-manager
  namespace: management
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: k8s-manager-role
rules:
- apiGroups: ["", "apps", "batch"]
  resources: ["*"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: k8s-manager-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: k8s-manager-role
subjects:
- kind: ServiceAccount
  name: k8s-manager
  namespace: management
```

### 方案 3: Nginx 反向代理

```nginx
# nginx.conf
upstream main_app {
    server localhost:5666;
}

upstream k8s_app {
    server localhost:5667;
}

upstream k8s_api {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # 主应用
    location / {
        proxy_pass http://main_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # K8s 管理应用
    location /k8s {
        proxy_pass http://k8s_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # K8s API
    location /k8s-api {
        proxy_pass http://k8s_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 集成方式

### 1. iframe 嵌入

```vue
<!-- 在主应用中嵌入 K8s 应用 -->
<template>
  <div class="k8s-container">
    <iframe
      :src="k8sAppUrl"
      frameborder="0"
      style="width: 100%; height: 100vh;"
    />
  </div>
</template>

<script setup>
const k8sAppUrl = import.meta.env.VITE_K8S_APP_URL || 'http://localhost:5667';
</script>
```

### 2. 路由跳转

```typescript
// 在主应用中添加跳转按钮
function goToK8sManagement() {
  const k8sUrl = import.meta.env.VITE_K8S_APP_URL || 'http://localhost:5667';
  const token = localStorage.getItem('access_token');
  // 传递 token 给 K8s 应用
  window.open(`${k8sUrl}?token=${token}`, '_blank');
}
```

### 3. 单点登录 (SSO)

```typescript
// 共享认证服务
export class AuthService {
  // 验证 token
  static async verifyToken(token: string) {
    const response = await fetch('https://auth.your-domain.com/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }

  // 获取用户信息
  static async getUserInfo(token: string) {
    const response = await fetch('https://auth.your-domain.com/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }
}
```

## 安全考虑

### 1. 认证和授权

```typescript
// JWT 认证中间件
import jwt from 'jsonwebtoken';

export function authMiddleware(request, reply, done) {
  const token = request.headers.authorization?.split(' ')[1];

  if (!token) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
    done();
  } catch (error) {
    reply.code(401).send({ error: 'Invalid token' });
  }
}
```

### 2. RBAC 权限控制

```typescript
// 权限检查中间件
export function checkPermission(resource: string, action: string) {
  return async (request, reply) => {
    const user = request.user;
    const hasPermission = await checkUserPermission(
      user.id,
      resource,
      action,
    );

    if (!hasPermission) {
      reply.code(403).send({ error: 'Forbidden' });
      return;
    }
  };
}

// 使用示例
fastify.delete(
  '/api/pods/:namespace/:name',
  {
    preHandler: [
      authMiddleware,
      checkPermission('pods', 'delete'),
    ],
  },
  async (request, reply) => {
    // 删除 Pod 逻辑
  },
);
```

### 3. Kubeconfig 安全存储

```typescript
// 加密存储 kubeconfig
import crypto from 'crypto';

export class KubeconfigService {
  private encryptionKey = process.env.ENCRYPTION_KEY;

  // 加密
  encrypt(kubeconfig: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey),
      iv,
    );
    let encrypted = cipher.update(kubeconfig, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  // 解密
  decrypt(encryptedKubeconfig: string): string {
    const parts = encryptedKubeconfig.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey),
      iv,
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

## 监控和日志

```typescript
// 监控中间件
import prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

export function metricsMiddleware(request, reply, done) {
  const start = Date.now();

  reply.addHook('onSend', (request, reply, payload, done) => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(request.method, request.routeOptions.url, reply.statusCode)
      .observe(duration);
    done();
  });

  done();
}

// 暴露 metrics 端点
fastify.get('/metrics', async (request, reply) => {
  reply.header('Content-Type', prometheus.register.contentType);
  return prometheus.register.metrics();
});
```

## 总结

独立 K8s 服务的关键点：

1. **应用隔离**: 前端和后端完全独立部署
2. **API Gateway**: 统一入口，路由分发
3. **认证共享**: 使用 SSO 或 JWT 共享认证
4. **权限控制**: RBAC 精细化权限管理
5. **安全加固**: Kubeconfig 加密存储
6. **可观测性**: 完善的监控和日志系统
7. **高可用**: 多副本部署，负载均衡

是否需要我帮你创建完整的独立应用配置文件？
