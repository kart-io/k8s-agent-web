# 部署指南

## 概述

本文档详细说明如何将 Vben Admin 项目部署到不同的环境和平台。

## 环境要求

### 生产环境

- **Node.js**: 18.x 或更高版本
- **pnpm**: 8.x 或更高版本
- **内存**: 至少 2GB RAM
- **磁盘空间**: 至少 1GB 可用空间
- **网络**: 稳定的互联网连接

### 推荐配置

- **Node.js**: 20.x LTS
- **pnpm**: 最新稳定版
- **内存**: 4GB+ RAM
- **磁盘**: SSD 存储
- **CPU**: 2核心或更多

## 构建配置

### 环境变量

创建 `.env.production` 文件：

```bash
# 应用标题
VITE_APP_TITLE=Vben Admin

# API 基础URL
VITE_API_BASE_URL=https://api.your-domain.com

# 是否启用Mock
VITE_ENABLE_MOCK=false

# 是否启用分析
VITE_ENABLE_ANALYZE=false

# CDN URL
VITE_CDN_URL=https://cdn.your-domain.com

# 上传URL
VITE_UPLOAD_URL=https://api.your-domain.com/upload

# 应用版本
VITE_APP_VERSION=${npm_package_version}

# 构建时间
VITE_BUILD_TIME=${BUILD_TIME}
```

### 构建脚本

```json
{
  "scripts": {
    "build:prod": "cross-env NODE_ENV=production pnpm build",
    "build:antd": "pnpm --filter @vben/web-antd build",
    "build:ele": "pnpm --filter @vben/web-ele build",
    "build:naive": "pnpm --filter @vben/web-naive build",
    "build:all": "pnpm build",
    "preview": "vite preview --port 4173"
  }
}
```

## 部署方式

### 方式一：传统服务器部署

#### 1. 准备服务器

```bash
# 安装 Node.js (使用 nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 安装 pnpm
npm install -g pnpm

# 安装 Nginx
sudo apt update
sudo apt install nginx
```

#### 2. 构建项目

```bash
# 克隆代码
git clone https://github.com/vbenjs/vue-vben-admin.git
cd vue-vben-admin

# 安装依赖
pnpm install

# 构建生产版本
pnpm build:prod
```

#### 3. 配置 Nginx

创建 `/etc/nginx/sites-available/vben-admin`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 根目录
    root /var/www/vben-admin/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # 缓存配置
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由配置
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # API 代理
    location /api {
        proxy_pass https://api.your-backend.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

#### 4. 启用站点

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/vben-admin /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 方式二：Docker 部署

#### 1. 创建 Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps ./apps
COPY internal ./internal

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建
RUN pnpm build:prod

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建 nginx.conf

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### 3. 构建和运行

```bash
# 构建镜像
docker build -t vben-admin:latest .

# 运行容器
docker run -d \
  --name vben-admin \
  -p 80:80 \
  vben-admin:latest

# 查看日志
docker logs -f vben-admin

# 停止容器
docker stop vben-admin

# 删除容器
docker rm vben-admin
```

#### 4. Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    image: vben-admin:latest
    container_name: vben-admin
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - nginx_logs:/var/log/nginx
    environment:
      - NODE_ENV=production
    networks:
      - vben-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s

volumes:
  nginx_logs:

networks:
  vben-network:
    driver: bridge
```

使用 Docker Compose:

```bash
# 启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 方式三：Vercel 部署

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 配置 vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "apps/web-antd/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_VERSION": "20"
  }
}
```

#### 3. 部署

```bash
# 登录
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 方式四：Netlify 部署

#### 1. 配置 netlify.toml

```toml
[build]
  base = "."
  command = "pnpm build:antd"
  publish = "apps/web-antd/dist"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "https://api.your-backend.com/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### 2. 部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化
netlify init

# 部署到预览
netlify deploy

# 部署到生产
netlify deploy --prod
```

### 方式五：Kubernetes 部署

#### 1. 创建 Kubernetes 配置

`k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vben-admin
  labels:
    app: vben-admin
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vben-admin
  template:
    metadata:
      labels:
        app: vben-admin
    spec:
      containers:
      - name: vben-admin
        image: your-registry/vben-admin:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: vben-admin-service
spec:
  selector:
    app: vben-admin
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: vben-admin-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: vben-admin-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: vben-admin-service
            port:
              number: 80
```

#### 2. 部署到 Kubernetes

```bash
# 应用配置
kubectl apply -f k8s-deployment.yaml

# 查看部署状态
kubectl get deployments
kubectl get pods
kubectl get services

# 查看日志
kubectl logs -f deployment/vben-admin

# 扩缩容
kubectl scale deployment vben-admin --replicas=5

# 更新镜像
kubectl set image deployment/vben-admin vben-admin=your-registry/vben-admin:v2.0.0

# 回滚
kubectl rollout undo deployment/vben-admin
```

## 性能优化

### 1. 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 启用 Rollup 优化
    rollupOptions: {
      output: {
        // 代码分割
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['ant-design-vue', 'element-plus'],
        },
      },
    },
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },
});
```

### 2. CDN 加速

```html
<!-- index.html -->
<head>
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
</head>
```

### 3. 图片优化

```bash
# 安装优化工具
pnpm add -D vite-plugin-imagemin

# 配置
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          { name: 'removeViewBox' },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
    }),
  ],
});
```

## 监控和日志

### 1. 应用性能监控

```typescript
// 集成 Sentry
import * as Sentry from '@sentry/vue';

Sentry.init({
  app,
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
    }),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 2. 日志收集

```typescript
// 配置日志服务
import { createLogger } from '@/utils/logger';

const logger = createLogger({
  level: import.meta.env.PROD ? 'warn' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export { logger };
```

## 故障排查

### 常见问题

#### 1. 白屏问题

```bash
# 检查控制台错误
# 检查网络请求
# 检查路由配置
# 检查静态资源路径
```

#### 2. 路由 404

```nginx
# Nginx 配置 SPA 路由
location / {
    try_files $uri $uri/ /index.html;
}
```

#### 3. API 跨域

```nginx
# Nginx 配置 CORS
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
```

## 安全最佳实践

1. **启用 HTTPS**: 使用 Let's Encrypt 免费证书
2. **设置安全头**: CSP, X-Frame-Options, X-Content-Type-Options
3. **定期更新依赖**: `pnpm update`
4. **环境变量管理**: 使用 dotenv 管理敏感信息
5. **访问控制**: 配置防火墙和访问限制
6. **定期备份**: 备份数据和配置文件

## 回滚策略

```bash
# Docker 回滚
docker tag vben-admin:current vben-admin:backup
docker pull vben-admin:previous
docker stop vben-admin && docker rm vben-admin
docker run -d --name vben-admin vben-admin:previous

# Kubernetes 回滚
kubectl rollout undo deployment/vben-admin
kubectl rollout history deployment/vben-admin

# 传统部署回滚
cd /var/www
mv vben-admin vben-admin-current
mv vben-admin-backup vben-admin
sudo systemctl reload nginx
```

## 相关资源

- [Nginx 文档](https://nginx.org/en/docs/)
- [Docker 文档](https://docs.docker.com/)
- [Kubernetes 文档](https://kubernetes.io/docs/)
- [Vercel 文档](https://vercel.com/docs)
- [Netlify 文档](https://docs.netlify.com/)