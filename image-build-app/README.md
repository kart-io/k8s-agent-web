# Image Build App

镜像构建管理微前端应用，用于管理和监控容器镜像的构建过程。

## 功能特性

- **镜像构建管理**: 创建、查看、更新、删除镜像构建任务
- **构建状态监控**: 实时查看构建状态（待构建、构建中、成功、失败）
- **构建日志查看**: 实时查看构建过程的详细日志
- **镜像列表**: 查看已构建的镜像列表，支持镜像删除
- **构建模板**: 预定义常用的 Dockerfile 模板，快速创建构建任务
- **重新构建**: 支持失败或过期构建的重新构建
- **搜索和筛选**: 根据名称、仓库、状态等条件筛选构建记录

## 技术栈

- **Vue 3**: 渐进式 JavaScript 框架
- **Ant Design Vue**: 企业级 UI 组件库
- **Vue Router**: 官方路由管理器
- **Axios**: HTTP 客户端
- **Day.js**: 轻量级日期时间处理库
- **@k8s-agent/shared**: 共享组件库

## 项目结构

```
image-build-app/
├── src/
│   ├── api/                    # API 接口
│   │   ├── request.js         # Axios 请求封装
│   │   └── image-build.js     # 镜像构建 API
│   ├── views/                  # 页面组件
│   │   ├── ImageBuildList.vue # 构建列表
│   │   ├── ImageBuildDetail.vue # 构建详情
│   │   ├── ImageList.vue      # 镜像列表
│   │   └── BuildTemplateList.vue # 构建模板列表
│   ├── mock/                   # Mock 数据
│   │   └── index.js           # Mock API 实现
│   ├── App.vue                # 根组件
│   └── main.js                # 入口文件
├── .env.development           # 开发环境配置
├── .gitignore                 # Git 忽略文件
├── package.json               # 项目依赖
└── README.md                  # 项目文档
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将运行在 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 配置说明

### 环境变量

在 `.env.development` 中配置开发环境变量：

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:8080/api

# 是否使用 Mock 数据
VITE_USE_MOCK=true

# Mock 延迟时间（毫秒）
VITE_MOCK_DELAY=300
```

### Mock 数据

默认启用 Mock 数据模式，方便开发和测试。Mock 数据包括：

- **25+ 镜像构建记录**: 包含不同状态和类型的构建任务
- **30+ 镜像记录**: 已构建的镜像列表
- **5 个构建模板**: 预定义的 Dockerfile 模板（Node.js, Python, Go, Nginx, Java）

要禁用 Mock 模式，修改 `.env.development`:

```env
VITE_USE_MOCK=false
```

## 数据模型

### ImageBuild (镜像构建)

```javascript
{
  id: 1,                                  // 构建 ID
  name: "build-001",                      // 构建名称
  repository: "docker.io/myapp",          // 镜像仓库
  tag: "v1.0.0",                         // 镜像标签
  status: "success",                      // 状态: pending, building, success, failed
  dockerfile: "FROM node:18-alpine...",   // Dockerfile 内容
  buildArgs: "NODE_ENV=production",       // 构建参数
  buildTime: 125,                         // 构建耗时（秒）
  createdAt: 1696684800000,              // 创建时间
  completedAt: 1696684925000,            // 完成时间
  description: "Build description"        // 描述
}
```

### Image (镜像)

```javascript
{
  id: 1,                                  // 镜像 ID
  repository: "docker.io/myapp",          // 镜像仓库
  tag: "v1.0.0",                         // 镜像标签
  digest: "sha256:abc123...",            // 镜像摘要
  size: 157286400,                        // 镜像大小（字节）
  buildId: 1,                             // 关联的构建 ID
  createdAt: 1696684925000               // 创建时间
}
```

### BuildTemplate (构建模板)

```javascript
{
  id: 1,                                  // 模板 ID
  name: "Node.js Alpine Template",        // 模板名称
  baseImage: "node:18-alpine",           // 基础镜像
  dockerfile: "FROM node:18-alpine...",   // Dockerfile 内容
  defaultBuildArgs: "NODE_ENV=production", // 默认构建参数
  description: "Node.js template",        // 描述
  createdAt: 1696684800000               // 创建时间
}
```

## API 接口

### 镜像构建相关

- `GET /api/image-builds` - 获取构建列表
- `GET /api/image-builds/:id` - 获取构建详情
- `POST /api/image-builds` - 创建新构建
- `PUT /api/image-builds/:id` - 更新构建
- `DELETE /api/image-builds/:id` - 删除构建
- `POST /api/image-builds/:id/rebuild` - 重新构建
- `GET /api/image-builds/:id/logs` - 获取构建日志

### 镜像相关

- `GET /api/images` - 获取镜像列表
- `DELETE /api/images/:id` - 删除镜像

### 构建模板相关

- `GET /api/build-templates` - 获取模板列表
- `POST /api/build-templates` - 创建模板
- `PUT /api/build-templates/:id` - 更新模板
- `DELETE /api/build-templates/:id` - 删除模板

## 页面路由

- `/image-builds` - 镜像构建列表
- `/image-builds/:id` - 镜像构建详情
- `/images` - 镜像列表
- `/build-templates` - 构建模板列表

## 开发指南

### 添加新的 API 接口

在 `src/api/image-build.js` 中添加新的 API 方法：

```javascript
export function getImageStats() {
  if (isMockEnabled()) {
    return mockApi.getImageStats()
  }

  return request({
    url: '/image-stats',
    method: 'get'
  })
}
```

### 添加 Mock 数据

在 `src/mock/index.js` 中添加对应的 Mock 实现：

```javascript
export const mockApi = {
  async getImageStats() {
    await delay(300)
    return {
      total: 100,
      success: 80,
      failed: 15,
      building: 5
    }
  }
}
```

### 使用共享组件

项目使用 `@k8s-agent/shared` 共享组件库，可以导入常用组件：

```vue
<template>
  <PageWrapper>
    <BasicTable :columns="columns" :data-source="data" />
  </PageWrapper>
</template>

<script setup>
import { PageWrapper, BasicTable } from '@k8s-agent/shared'
</script>
```

## 状态说明

### 构建状态

- **pending**: 待构建 - 构建任务已创建，等待开始
- **building**: 构建中 - 正在执行构建过程
- **success**: 成功 - 构建成功完成
- **failed**: 失败 - 构建过程中出现错误

## 最佳实践

1. **构建命名**: 使用有意义的构建名称，便于识别和管理
2. **镜像标签**: 使用语义化版本号（如 v1.0.0）或明确的环境标识（如 dev, staging, prod）
3. **Dockerfile 优化**: 利用多阶段构建减小镜像体积
4. **构建模板**: 为常用技术栈创建模板，提高构建效率
5. **日志监控**: 定期查看构建日志，及时发现和解决问题

## 故障排查

### 构建失败

1. 查看构建详情页面的日志输出
2. 检查 Dockerfile 语法是否正确
3. 确认基础镜像是否可访问
4. 检查构建参数是否正确

### Mock 数据不生效

1. 检查 `.env.development` 中 `VITE_USE_MOCK` 是否为 `true`
2. 重启开发服务器
3. 检查浏览器控制台是否有错误信息

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License
