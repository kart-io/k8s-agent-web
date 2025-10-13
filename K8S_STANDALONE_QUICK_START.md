# K8s 独立服务快速启动指南

## 快速决策：三种方案对比

### 方案 A: 当前集成方式（已实现）
**优点**: 简单、共享资源、统一部署
**缺点**: 耦合度高、不易独立扩展
**适用**: 小型团队、快速开发、资源有限

### 方案 B: 子应用模式（推荐）
**优点**: 独立开发、共享基础设施、易于维护
**缺点**: 需要配置独立路由和构建
**适用**: 中型团队、需要独立迭代、保持统一体验

### 方案 C: 完全独立服务
**优点**: 完全解耦、技术栈自由、独立部署
**缺点**: 需要完整的后端API、部署复杂度高
**适用**: 大型团队、跨团队协作、高安全要求

## 方案 B: 创建独立子应用（快速实现）

基于当前 monorepo 结构，只需几步即可创建独立的 K8s 管理应用。

### 步骤 1: 复制现有应用作为模板

```bash
# 复制 web-antd 作为 web-k8s 的基础
cd /home/hellotalk/code/web/k8s-agent-web/apps
cp -r web-antd web-k8s

# 清理不需要的文件
cd web-k8s
rm -rf dist node_modules
```

### 步骤 2: 修改 package.json

```json
{
  "name": "@vben/web-k8s",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite --port 5667 --mode development",
    "build": "vite build --mode production",
    "preview": "vite preview --port 5667"
  }
}
```

### 步骤 3: 创建环境变量

```bash
# .env.development
VITE_PORT=5667
VITE_BASE=/
VITE_APP_TITLE=K8s Management Platform
VITE_APP_NAMESPACE=vben-web-k8s
VITE_GLOB_API_URL=/api
VITE_NITRO_MOCK=true
```

### 步骤 4: 简化应用内容

只保留 K8s 相关的代码：

```
web-k8s/src/
├── api/
│   └── k8s/           # 只保留 K8s API
├── views/
│   └── k8s/           # 只保留 K8s 页面
├── router/
│   └── routes/
│       └── k8s.ts     # 只保留 K8s 路由
├── locales/
│   └── k8s 相关文本
└── main.ts            # 应用入口
```

### 步骤 5: 修改路由配置

```typescript
// web-k8s/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import k8sRoutes from './routes/k8s';

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE),
  routes: [
    {
      path: '/',
      redirect: '/k8s/clusters',
    },
    ...k8sRoutes[0].children.map(route => ({
      ...route,
      path: route.path.replace('/k8s', ''),
    })),
  ],
});

export default router;
```

### 步骤 6: 添加到 turbo 配置

```json
// turbo.json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 步骤 7: 添加到根 package.json

```json
{
  "scripts": {
    "dev:k8s": "pnpm -F @vben/web-k8s run dev",
    "build:k8s": "pnpm -F @vben/web-k8s run build"
  }
}
```

### 步骤 8: 启动应用

```bash
# 启动独立 K8s 应用
pnpm dev:k8s

# 或添加到 Makefile
make dev-k8s
```

## 更简单的方案：Nginx 代理

如果不想创建独立应用，可以通过 Nginx 配置让 K8s 模块看起来是独立的：

```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;

    # 主应用
    location / {
        proxy_pass http://localhost:5666;
    }

    # K8s 管理（代理到主应用的 K8s 路由）
    location /k8s {
        proxy_pass http://localhost:5666/k8s;
    }
}

server {
    listen 80;
    server_name k8s.your-domain.com;

    # 独立域名访问 K8s 管理
    location / {
        proxy_pass http://localhost:5666/k8s;
        # 重写路径
        rewrite ^/(.*)$ /k8s/$1 break;
    }
}
```

这样可以通过不同的域名访问：
- `your-domain.com` - 主应用
- `k8s.your-domain.com` - K8s 管理（实际是主应用的子路由）

## 最简单的方案：当前架构（已实现）

保持当前的集成方式，通过配置实现"逻辑独立"：

### 1. 独立的菜单入口

```typescript
// 在主应用中添加独立入口
const menuItems = [
  {
    name: '主应用',
    children: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: '用户管理', path: '/users' },
    ],
  },
  {
    name: 'K8s 管理',
    icon: 'server',
    children: [
      { name: '集群管理', path: '/k8s/clusters' },
      { name: 'Pod 管理', path: '/k8s/pods' },
      // ...
    ],
  },
];
```

### 2. 独立的权限控制

```typescript
// 在路由中添加权限标识
{
  path: '/k8s',
  meta: {
    requiresAuth: true,
    requiredPermissions: ['k8s:view'],
    module: 'k8s', // 标识为 K8s 模块
  },
}
```

### 3. 独立的 Mock API

已完成！所有 K8s 的 Mock API 都在 `apps/backend-mock/api/k8s/` 目录下。

### 4. 独立的状态管理

```typescript
// src/store/k8s.ts
import { defineStore } from 'pinia';

export const useK8sStore = defineStore('k8s', {
  state: () => ({
    currentCluster: null,
    clusters: [],
  }),
  actions: {
    async fetchClusters() {
      // K8s 专用的状态管理
    },
  },
});
```

## 推荐实施路径

### 阶段 1: 当前方式（0 工作量）✅
- **状态**: 已完成
- **特点**: K8s 功能已集成到主应用
- **优点**: 可以立即使用
- **下一步**: 根据需求决定是否需要独立

### 阶段 2: 逻辑独立（1天工作量）
```bash
# 任务清单
- [ ] 添加独立的 K8s Store
- [ ] 配置独立的权限系统
- [ ] 添加 K8s 专用的布局组件
- [ ] 配置独立的错误处理
```

### 阶段 3: 物理独立（3-5天工作量）
```bash
# 任务清单
- [ ] 创建 web-k8s 应用
- [ ] 迁移 K8s 代码到新应用
- [ ] 配置独立的构建流程
- [ ] 测试独立运行
```

### 阶段 4: 后端 API（1-2周工作量）
```bash
# 任务清单
- [ ] 创建 backend-k8s 服务
- [ ] 实现 K8s Client 封装
- [ ] 实现所有 REST API
- [ ] 实现 WebSocket（日志、终端）
- [ ] 部署和测试
```

## 快速命令

```bash
# 当前方式 - 立即可用
pnpm dev:antd                    # 启动主应用（包含 K8s）
open http://localhost:5666/k8s   # 访问 K8s 管理

# 添加到 Makefile
echo "dev-k8s:" >> Makefile
echo "\t@pnpm dev:antd" >> Makefile
echo "\t@echo 'K8s Management: http://localhost:5666/k8s'" >> Makefile

# 使用
make dev-k8s
```

## 我的建议

基于你的项目情况，我建议：

### 短期（当前）
✅ **保持当前集成方式**
- 已经实现了完整的 K8s 功能
- Mock API 已就绪
- 可以立即开始使用和测试

### 中期（1-2个月后）
🎯 **根据实际需求评估是否需要独立**
- 如果团队规模增大 → 考虑独立子应用
- 如果性能出现瓶颈 → 考虑独立服务
- 如果安全要求提高 → 考虑完全独立

### 长期（半年后）
🚀 **逐步演进为微服务架构**
- 独立的前端应用
- 独立的后端 API
- 完善的认证授权
- 监控和日志系统

## 总结

**现在的状态**: K8s 功能已经完整实现并集成到主应用中，可以立即使用。

**是否需要独立**: 取决于以下因素：
- 团队规模和分工
- 性能和安全要求
- 部署和运维能力
- 开发和维护成本

**建议**: 先使用当前集成方式，待业务稳定后根据实际需求再决定是否独立。

需要我帮你实现哪个方案吗？
