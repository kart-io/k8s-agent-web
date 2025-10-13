# 快速开始

## 介绍

Vben Admin 是一个基于 Vue 3、Vite、TypeScript 等最新技术栈的现代化中后台管理系统模板。本指南将帮助你快速上手开发。

## 环境准备

### 必需工具

在开始之前，请确保你的开发环境中安装了以下工具：

1. **Node.js**
   - 版本要求: 18.x 或更高
   - 推荐版本: 20.x LTS
   - 下载地址: [https://nodejs.org](https://nodejs.org)

   ```bash
   # 检查版本
   node -v
   # 应该显示 v20.x.x
   ```

2. **pnpm**
   - 版本要求: 8.x 或更高
   - 推荐版本: 最新稳定版

   ```bash
   # 安装 pnpm
   npm install -g pnpm

   # 检查版本
   pnpm -v
   # 应该显示 8.x.x 或更高
   ```

3. **Git**
   - 版本管理必备工具
   - 下载地址: [https://git-scm.com](https://git-scm.com)

   ```bash
   # 检查版本
   git --version
   ```

### 推荐工具

1. **IDE**: Visual Studio Code
   - 下载地址: [https://code.visualstudio.com](https://code.visualstudio.com)

2. **VS Code 扩展**:
   - **Vue - Official** (Vue.volar) - Vue 3 语言支持
   - **TypeScript Vue Plugin** - Vue TypeScript 支持
   - **ESLint** - 代码质量检查
   - **Prettier** - 代码格式化
   - **Tailwind CSS IntelliSense** - Tailwind CSS 智能提示

3. **浏览器扩展**:
   - **Vue Devtools** - Vue 调试工具

## 获取代码

### 方式一：克隆仓库

```bash
# 使用 HTTPS
git clone https://github.com/vbenjs/vue-vben-admin.git

# 或使用 SSH
git clone git@github.com:vbenjs/vue-vben-admin.git

# 进入项目目录
cd vue-vben-admin
```

### 方式二：使用模板

```bash
# 使用 degit 克隆模板（不包含 git 历史）
npx degit vbenjs/vue-vben-admin my-vben-project
cd my-vben-project
```

## 安装依赖

```bash
# 安装项目依赖
pnpm install

# 如果安装失败，尝试清理缓存
pnpm store prune
pnpm install
```

安装过程可能需要几分钟，请耐心等待。

## 开发服务器

### 启动开发服务器

```bash
# 启动默认应用（会提示选择）
pnpm dev

# 或直接启动指定应用
pnpm dev:antd    # Ant Design 版本
pnpm dev:ele     # Element Plus 版本
pnpm dev:naive   # Naive UI 版本
```

成功启动后，你会看到类似的输出：

```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

在浏览器中打开 [http://localhost:5173](http://localhost:5173) 即可访问应用。

### 默认账号

```
用户名: vben
密码: 123456
```

## 项目结构

```
vue-vben-admin/
├── .github/              # GitHub 配置
│   └── workflows/        # GitHub Actions 工作流
├── apps/                 # 应用目录
│   ├── web-antd/        # Ant Design 版本
│   ├── web-ele/         # Element Plus 版本
│   ├── web-naive/       # Naive UI 版本
│   └── backend-mock/    # Mock API 服务
├── docs/                 # 项目文档
├── packages/            # 共享包
│   ├── @core/          # 核心功能
│   │   ├── base/       # 基础模块
│   │   ├── composables/# Vue 组合式函数
│   │   └── ui-kit/     # UI 组件库
│   └── @vben/          # 业务模块
│       ├── access/     # 权限管理
│       ├── common-ui/  # 通用组件
│       ├── hooks/      # React Hooks 风格的钩子
│       ├── layouts/    # 布局组件
│       ├── locales/    # 国际化
│       ├── plugins/    # Vue 插件
│       ├── preferences/# 偏好设置
│       ├── request/    # HTTP 请求
│       ├── stores/     # 状态管理
│       ├── styles/     # 全局样式
│       ├── types/      # TypeScript 类型
│       └── utils/      # 工具函数
├── internal/            # 内部工具
│   ├── lint-configs/   # Lint 配置
│   ├── node-utils/     # Node 工具
│   ├── tailwind-config/# Tailwind 配置
│   ├── tsconfig/       # TypeScript 配置
│   └── vite-config/    # Vite 配置
├── scripts/             # 构建脚本
├── e2e/                 # E2E 测试
├── test/                # 测试工具
├── .gitignore          # Git 忽略配置
├── .npmrc              # npm 配置
├── package.json        # 项目配置
├── pnpm-lock.yaml      # 依赖锁定文件
├── pnpm-workspace.yaml # pnpm 工作空间配置
├── tsconfig.json       # TypeScript 配置
├── turbo.json          # Turbo 配置
├── vitest.config.ts    # Vitest 配置
└── README.md           # 项目说明
```

## 核心概念

### Monorepo 架构

本项目采用 Monorepo（单仓库多包）架构，使用 pnpm workspace 管理：

- **优势**:
  - 代码复用：共享组件和工具
  - 统一管理：统一的依赖和构建流程
  - 版本控制：方便的跨包版本管理
  - 类型安全：完整的 TypeScript 支持

### 构建工具

- **Vite**: 快速的前端构建工具
- **Turbo**: Monorepo 构建加速器
- **TypeScript**: 类型安全的 JavaScript 超集

### UI 框架

项目提供三个版本，可根据需求选择：

1. **Ant Design Vue** - 企业级 UI 设计语言
2. **Element Plus** - 基于 Vue 3 的组件库
3. **Naive UI** - 较为完整的 Vue 3 组件库

### 状态管理

- **Pinia**: Vue 3 官方推荐的状态管理库
- 响应式、类型安全、开发工具支持

### 路由管理

- **Vue Router 4**: Vue 3 官方路由
- 支持动态路由、路由守卫、路由懒加载

## 开发流程

### 1. 创建新页面

```bash
# 在对应应用的 views 目录下创建页面
apps/web-antd/src/views/example/
├── index.vue           # 页面组件
└── components/         # 页面专属组件
    └── ExampleForm.vue
```

### 2. 配置路由

```typescript
// apps/web-antd/src/router/routes/modules/example.ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/example',
    name: 'Example',
    component: () => import('@/views/example/index.vue'),
    meta: {
      title: '示例页面',
      icon: 'lucide:box',
    },
  },
];

export default routes;
```

### 3. 添加菜单

菜单通常由后端返回，本地开发可在 Mock 数据中配置：

```typescript
// apps/backend-mock/api/menu/index.ts
export default defineEventHandler(() => {
  return {
    code: 0,
    data: [
      {
        path: '/example',
        name: 'Example',
        component: 'Example',
        meta: {
          title: '示例页面',
          icon: 'lucide:box',
        },
      },
    ],
  };
});
```

### 4. 开发组件

```vue
<template>
  <div :class="rootClass">
    <h1>{{ title }}</h1>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@vben-core/shared';

interface Props {
  title: string;
  className?: string;
}

const props = defineProps<Props>();

const rootClass = computed(() =>
  cn('example-page', props.className)
);
</script>

<style scoped>
.example-page {
  @apply p-4;
}
</style>
```

## 常用命令

### 开发

```bash
pnpm dev              # 启动开发服务器（选择应用）
pnpm dev:antd        # 启动 Ant Design 版本
pnpm dev:ele         # 启动 Element Plus 版本
pnpm dev:naive       # 启动 Naive UI 版本
pnpm dev:docs        # 启动文档站点
```

### 构建

```bash
pnpm build           # 构建所有应用
pnpm build:antd      # 构建 Ant Design 版本
pnpm build:ele       # 构建 Element Plus 版本
pnpm build:naive     # 构建 Naive UI 版本
pnpm build:docs      # 构建文档
```

### 预览

```bash
pnpm preview         # 预览构建产物
```

### 测试

```bash
pnpm test            # 运行所有测试
pnpm test:unit       # 运行单元测试
pnpm test:e2e        # 运行 E2E 测试
```

### 代码质量

```bash
pnpm lint            # 运行 ESLint
pnpm lint:fix        # 修复 ESLint 问题
pnpm format          # 格式化代码
pnpm format:check    # 检查代码格式
pnpm check:type      # TypeScript 类型检查
```

### 依赖管理

```bash
pnpm install         # 安装依赖
pnpm add <pkg>       # 添加依赖
pnpm add -D <pkg>    # 添加开发依赖
pnpm remove <pkg>    # 移除依赖
pnpm update          # 更新依赖
```

## 调试技巧

### 1. Vue Devtools

安装 Vue Devtools 浏览器扩展，可以：
- 查看组件树
- 检查组件状态
- 监听事件
- 检查 Pinia store

### 2. VS Code 调试

创建 `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "vuejs: chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/apps/web-antd/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

### 3. 网络请求调试

使用浏览器开发者工具的 Network 面板查看 API 请求。

### 4. 性能分析

```typescript
// 使用 Vue 的性能追踪
app.config.performance = true;

// 使用浏览器 Performance API
performance.mark('myMark');
performance.measure('myMeasure', 'myMark');
```

## 常见问题

### 端口被占用

```bash
# 查找占用端口的进程
lsof -i :5173

# 或修改端口
# vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
  },
});
```

### 依赖安装失败

```bash
# 清理缓存
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml

# 重新安装
pnpm install
```

### 热更新不生效

1. 检查文件监听数量限制
   ```bash
   # Linux/Mac
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. 重启开发服务器

### TypeScript 报错

```bash
# 运行类型检查
pnpm check:type

# 重启 TS 服务器（VS Code）
Ctrl/Cmd + Shift + P -> TypeScript: Restart TS Server
```

## 下一步

- 阅读 [样式规范](../project/style-specification.md)
- 阅读 [组件开发指南](../project/component-development-guide.md)
- 了解 [路由和菜单](./routing.md)
- 了解 [权限管理](./permission.md)
- 查看 [API 文档](https://doc.vben.pro)

## 获取帮助

- [GitHub Issues](https://github.com/vbenjs/vue-vben-admin/issues)
- [GitHub Discussions](https://github.com/vbenjs/vue-vben-admin/discussions)
- [官方文档](https://doc.vben.pro)

欢迎加入我们的社区！