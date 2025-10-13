# K8s Management Platform - 独立应用

这是一个完全独立的 Kubernetes 管理平台前端应用。

## 特性

- ✅ 完全独立的 Vue 3 应用
- ✅ 使用 Ant Design Vue 组件库
- ✅ 支持多集群管理
- ✅ 完整的 K8s 资源管理功能
- ✅ 独立端口运行（5667）
- ✅ 可独立部署

## 快速开始

### 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 开发模式

```bash
# 方式 1: 使用 Makefile
make dev-k8s

# 方式 2: 使用 pnpm
pnpm dev:k8s

# 方式 3: 在当前目录
cd apps/web-k8s
pnpm dev
```

访问 http://localhost:5667

### 生产构建

```bash
# 方式 1: 使用 Makefile
make build-k8s

# 方式 2: 使用 pnpm
pnpm build:k8s

# 方式 3: 在当前目录
cd apps/web-k8s
pnpm build
```

构建产物在 `dist/` 目录。

## 目录结构

```
web-k8s/
├── src/
│   ├── api/              # API 接口
│   │   ├── k8s/         # K8s API
│   │   └── request.ts   # 请求配置
│   ├── views/           # 页面组件
│   │   └── k8s/         # K8s 管理页面
│   ├── router/          # 路由配置
│   ├── App.vue          # 根组件
│   └── main.ts          # 应用入口
├── public/              # 静态资源
├── index.html           # HTML 模板
├── vite.config.ts       # Vite 配置
├── package.json         # 依赖配置
└── README.md           # 本文档
```

## 环境配置

### 开发环境 (.env.development)

```bash
VITE_PORT=5667
VITE_BASE=/
VITE_GLOB_API_URL=/api
VITE_NITRO_MOCK=true
VITE_MAIN_APP_URL=http://localhost:5666
```

### 生产环境 (.env.production)

```bash
VITE_BASE=/k8s
VITE_GLOB_API_URL=https://api.your-domain.com/k8s-api
VITE_NITRO_MOCK=false
VITE_MAIN_APP_URL=https://app.your-domain.com
```

## 功能模块

### 已实现

- ✅ 集群管理（列表、详情、增删改）
- ✅ API 接口（完整的 K8s API）
- ✅ Mock 服务（开发测试）

### 待完善

- 🚧 Pod 管理页面
- 🚧 Deployment 管理页面
- 🚧 Service 管理页面
- 🚧 ConfigMap 管理页面
- 🚧 CronJob 管理页面
- 🚧 其他资源管理页面

## API 接口

所有 K8s API 接口定义在 `src/api/k8s/` 目录：

```typescript
import {
  getClusterList,
  getClusterDetail,
  createCluster,
  updateCluster,
  deleteCluster,
} from '@/api/k8s';

// 使用示例
const clusters = await getClusterList({ page: 1, pageSize: 10 });
const cluster = await getClusterDetail('cluster-id');
```

## 部署

### Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 构建镜像
docker build -t k8s-management-web .

# 运行容器
docker run -d -p 8080:80 k8s-management-web
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name k8s.your-domain.com;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://backend-api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 静态文件部署

```bash
# 构建
pnpm build

# 部署到静态服务器
scp -r dist/* user@server:/var/www/k8s-management/

# 或使用 nginx 直接指向 dist 目录
```

## 开发指南

### 添加新页面

1. 在 `src/views/k8s/` 创建 Vue 组件
2. 在 `src/router/index.ts` 添加路由
3. 实现页面逻辑

### 调用 API

```typescript
// 导入 API 函数
import { getPodList } from '@/api/k8s';

// 使用
const pods = await getPodList({
  clusterId: 'cluster-1',
  namespace: 'default',
  page: 1,
  pageSize: 10,
});
```

### 错误处理

API 请求已配置统一错误处理，自动显示错误消息：

```typescript
try {
  await createCluster(data);
  message.success('创建成功');
} catch (error) {
  // 错误已自动处理和显示
}
```

## 与主应用集成

### 方式 1: iframe 嵌入

在主应用中：

```vue
<iframe
  src="http://localhost:5667"
  width="100%"
  height="100%"
  frameborder="0"
/>
```

### 方式 2: 独立访问

直接访问 K8s 应用的 URL

### 方式 3: Nginx 路由

```nginx
location /k8s {
    proxy_pass http://localhost:5667;
}
```

## 常见问题

### 1. 依赖安装失败？

```bash
# 清理并重新安装
pnpm clean
pnpm install
```

### 2. 开发服务器启动失败？

检查端口 5667 是否被占用：

```bash
lsof -i :5667
```

### 3. Mock API 不工作？

确认 `VITE_NITRO_MOCK=true` 并且 backend-mock 服务已启动。

### 4. 构建失败？

```bash
# 检查类型错误
pnpm typecheck

# 清理缓存
rm -rf node_modules/.vite
```

## 相关链接

- [K8s Feature Guide](../../K8S_FEATURE_GUIDE.md) - 完整功能指南
- [Standalone Service Guide](../../K8S_STANDALONE_SERVICE_GUIDE.md) - 独立服务架构
- [Quick Start Guide](../../K8S_STANDALONE_QUICK_START.md) - 快速开始指南

## 许可证

MIT
