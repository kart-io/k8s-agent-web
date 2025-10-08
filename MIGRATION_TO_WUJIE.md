# 迁移到 Wujie 微前端方案

## 🎯 为什么选择 Wujie？

### qiankun + vite-plugin-qiankun 的问题

1. **架构不兼容**：
   - qiankun 设计于 Webpack 时代，期望 UMD 格式
   - Vite 使用 ESM，与 qiankun 的预期不符
   - vite-plugin-qiankun 使用 hack 方式，导致 bootstrap 超时

2. **性能问题**：
   - deferred promise 机制将整个模块加载计入超时
   - 无法利用 Vite 的 HMR 和快速冷启动
   - 并发加载导致严重延迟

3. **开发体验差**：
   - 频繁超时错误
   - 需要各种 workaround
   - 难以调试

### Wujie 的优势

1. **天然支持 Vite**：
   - 无需任何插件或 hack
   - 完美支持 ESM
   - 充分利用 Vite 的特性

2. **更好的隔离**：
   - 基于 WebComponent + iframe
   - 样式、JS 完全隔离
   - 不需要沙箱配置

3. **更简单**：
   - 子应用零改造（或极少改造）
   - 主应用集成简单
   - 类似 iframe 的使用方式

4. **性能优秀**：
   - 预加载机制更合理
   - 应用切换更快
   - 无 bootstrap 超时问题

## 📋 迁移计划

### 阶段 1: 准备工作（5 分钟）

1. 安装 Wujie
2. 备份当前配置
3. 了解新架构

### 阶段 2: 修改主应用（10 分钟）

1. 移除 qiankun 依赖
2. 安装并配置 Wujie
3. 更新路由集成

### 阶段 3: 修改子应用（15 分钟）

1. 移除 vite-plugin-qiankun
2. 移除生命周期函数
3. 清理配置

### 阶段 4: 测试验证（10 分钟）

1. 启动所有应用
2. 测试路由跳转
3. 验证功能正常

**总时间：约 40 分钟**

## 🚀 详细步骤

### 步骤 1: 主应用安装 Wujie

```bash
cd main-app
pnpm add wujie-vue3
```

### 步骤 2: 主应用配置

创建 `main-app/src/micro/wujie-config.js`：

```javascript
import WujieVue from 'wujie-vue3'

export const wujieConfig = {
  apps: [
    {
      name: 'dashboard-app',
      url: '//localhost:3001',
      exec: true,
      alive: true,
      sync: true
    },
    {
      name: 'agent-app',
      url: '//localhost:3002',
      exec: true,
      alive: true,
      sync: true
    },
    {
      name: 'cluster-app',
      url: '//localhost:3003',
      exec: true,
      alive: true,
      sync: true
    },
    {
      name: 'monitor-app',
      url: '//localhost:3004',
      exec: true,
      alive: true,
      sync: true
    },
    {
      name: 'system-app',
      url: '//localhost:3005',
      exec: true,
      alive: true,
      sync: true
    },
    {
      name: 'image-build-app',
      url: '//localhost:3006',
      exec: true,
      alive: true,
      sync: true
    }
  ]
}

export function setupWujie(app) {
  app.use(WujieVue)
}
```

修改 `main-app/src/main.js`：

```javascript
import { setupWujie } from './micro/wujie-config'

const app = createApp(App)
// ... 其他配置

setupWujie(app)  // 注册 Wujie

app.mount('#app')
```

### 步骤 3: 主应用路由配置

修改 `main-app/src/router/index.js`：

```javascript
const routes = [
  // ... 其他路由

  // 微应用路由
  {
    path: '/dashboard/:pathMatch(.*)*',
    name: 'Dashboard',
    component: () => import('@/views/MicroAppContainer.vue'),
    meta: { microApp: 'dashboard-app' }
  },
  {
    path: '/agents/:pathMatch(.*)*',
    name: 'Agents',
    component: () => import('@/views/MicroAppContainer.vue'),
    meta: { microApp: 'agent-app' }
  },
  {
    path: '/clusters/:pathMatch(.*)*',
    name: 'Clusters',
    component: () => import('@/views/MicroAppContainer.vue'),
    meta: { microApp: 'cluster-app' }
  },
  {
    path: '/monitor/:pathMatch(.*)*',
    name: 'Monitor',
    component: () => import('@/views/MicroAppContainer.vue'),
    meta: { microApp: 'monitor-app' }
  },
  {
    path: '/system/:pathMatch(.*)*',
    name: 'System',
    component: () => import('@/views/MicroAppContainer.vue'),
    meta: { microApp: 'system-app' }
  },
  {
    path: '/image-build/:pathMatch(.*)*',
    name: 'ImageBuild',
    component: () => import('@/views/MicroAppContainer.vue'),
    meta: { microApp: 'image-build-app' }
  }
]
```

创建 `main-app/src/views/MicroAppContainer.vue`：

```vue
<template>
  <WujieVue
    :name="microAppName"
    :url="microAppUrl"
    :sync="true"
    :alive="true"
    :props="appProps"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const userStore = useUserStore()

const microAppName = computed(() => route.meta.microApp)

const microAppUrl = computed(() => {
  const urls = {
    'dashboard-app': '//localhost:3001',
    'agent-app': '//localhost:3002',
    'cluster-app': '//localhost:3003',
    'monitor-app': '//localhost:3004',
    'system-app': '//localhost:3005',
    'image-build-app': '//localhost:3006'
  }
  return urls[microAppName.value]
})

const appProps = computed(() => ({
  userInfo: userStore.userInfo,
  token: userStore.token,
  permissions: userStore.permissions
}))
</script>
```

### 步骤 4: 子应用清理

对每个子应用：

1. **卸载 vite-plugin-qiankun**：
```bash
cd dashboard-app
pnpm remove vite-plugin-qiankun
```

2. **简化 vite.config.js**：
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3001,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
```

3. **简化 main.js**（移除所有 qiankun 相关代码）：
```javascript
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import routes from './router'
import '@/assets/styles/main.scss'

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(Antd)

app.mount('#app')
```

4. **删除不需要的文件**：
```bash
rm src/public-path.js  # 不再需要
```

5. **简化 index.html**：
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard - K8s Agent</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### 步骤 5: 更新根 package.json

```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:*\" --prefix-colors \"cyan.bold,green.bold,yellow.bold,blue.bold,magenta.bold,red.bold\"",
    "dev:main": "cd main-app && pnpm dev",
    "dev:dashboard": "cd dashboard-app && pnpm dev",
    "dev:agent": "cd agent-app && pnpm dev",
    "dev:cluster": "cd cluster-app && pnpm dev",
    "dev:monitor": "cd monitor-app && pnpm dev",
    "dev:system": "cd system-app && pnpm dev",
    "dev:image-build": "cd image-build-app && pnpm dev"
  }
}
```

## ✅ 优势对比

### 之前（qiankun + vite-plugin-qiankun）

```
❌ Bootstrap 超时问题
❌ 需要复杂的生命周期函数
❌ 需要特殊的 Vite 插件
❌ UMD 构建配置
❌ deferred promise hack
❌ 频繁的缓存问题
```

### 之后（Wujie）

```
✅ 无超时问题
✅ 子应用零改造（标准 Vue 3 应用）
✅ 不需要特殊插件
✅ 使用 Vite 原生 ESM
✅ 开发体验流畅
✅ 样式隔离更好
```

## 🎯 迁移后的文件结构

```
k8s-agent-web/
├── main-app/
│   ├── src/
│   │   ├── micro/
│   │   │   └── wujie-config.js       ← 新增
│   │   ├── views/
│   │   │   └── MicroAppContainer.vue ← 新增
│   │   └── main.js                   ← 修改
│   └── package.json                  ← 修改依赖
│
├── dashboard-app/
│   ├── src/
│   │   └── main.js                   ← 简化
│   ├── vite.config.js                ← 简化
│   └── package.json                  ← 移除 vite-plugin-qiankun
│
└── (其他子应用同样处理)
```

## 📝 注意事项

1. **路由模式**：
   - Wujie 支持多种路由同步模式
   - 建议使用 `sync: true` 自动同步路由

2. **通信方式**：
   - 使用 props 传递数据（单向）
   - 使用 `$wujie.bus` 进行事件通信

3. **样式隔离**：
   - Wujie 默认使用 Shadow DOM
   - 样式自动隔离，无需配置

4. **预加载**：
   - 可以使用 `preloadApp` 预加载应用
   - 比 qiankun 的 prefetch 更智能

## 🚀 开始迁移

是否现在开始迁移到 Wujie？我可以帮你：

1. 修改主应用配置
2. 批量更新所有子应用
3. 测试验证

预计 **30-40 分钟**完成整个迁移。

迁移完成后，你会得到：
- ✅ 完全消除 bootstrap 超时问题
- ✅ 更快的开发体验
- ✅ 更简洁的代码
- ✅ 更好的维护性
