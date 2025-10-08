# Wujie 路由问题修复

## 🔍 问题发现

在 Wujie 迁移后，发现访问 http://localhost:3000/clusters 时：
- 页面能正常显示
- 但列表没有数据（空表格）

## 🐛 根本原因

### 路由路径不匹配

**主应用路由**：`/clusters/:pathMatch(.*)*`
- 访问 `/clusters` 时，Wujie 加载 cluster-app

**子应用路由**（修复前）：
```javascript
// cluster-app/src/main.js
const router = createRouter({
  history: createWebHistory('/'),  // ❌ base path = '/'
  routes
})

// cluster-app/src/router/index.js
{
  path: '/list',   // 实际路径：/list
  component: ClusterList
}
```

**问题**：
- 主应用访问：`/clusters`
- 子应用期望：`/list`
- 实际访问：`/clusters` 在子应用中没有匹配的路由
- 结果：路由不匹配，组件未渲染，列表为空

## ✅ 解决方案

### 修改所有子应用的 main.js

为每个子应用添加 Wujie 环境检测和动态 base path：

```javascript
// cluster-app/src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import routes from './router'
import '@/assets/styles/main.scss'

// ✅ Wujie 环境检测
const isWujie = window.__POWERED_BY_WUJIE__
const base = isWujie ? '/clusters' : '/'

const router = createRouter({
  history: createWebHistory(base),  // ✅ 动态 base path
  routes
})

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(Antd)

app.mount('#app')
```

### 工作原理

1. **独立运行时** (`window.__POWERED_BY_WUJIE__` = undefined)：
   ```
   base = '/'
   子应用路由：/list
   访问：http://localhost:3003/list ✅
   ```

2. **Wujie 环境中** (`window.__POWERED_BY_WUJIE__` = true)：
   ```
   base = '/clusters'
   子应用路由：/clusters/list
   主应用访问：/clusters
   子应用匹配：/clusters/ (redirect to /clusters/list) ✅
   ```

### 路由匹配过程

**修复前**：
```
主应用：访问 /clusters
  ↓
Wujie：加载 cluster-app
  ↓
cluster-app：base = '/'
  ↓
尝试匹配：/clusters
  ↓
子应用路由：['/list', '/:id']
  ↓
结果：❌ 无匹配路由 → 空白页面
```

**修复后**：
```
主应用：访问 /clusters
  ↓
Wujie：加载 cluster-app
  ↓
cluster-app：base = '/clusters'
  ↓
尝试匹配：/clusters
  ↓
子应用路由：['/clusters/', '/clusters/list', '/clusters/:id']
  ↓
匹配：/clusters/ → redirect to /clusters/list
  ↓
结果：✅ 显示 ClusterList 组件
```

## 📝 已修复的文件

所有 6 个子应用的 main.js：

| 应用 | Base Path | 文件路径 |
|-----|-----------|---------|
| dashboard-app | `/dashboard` | `dashboard-app/src/main.js` |
| agent-app | `/agents` | `agent-app/src/main.js` |
| cluster-app | `/clusters` | `cluster-app/src/main.js` |
| monitor-app | `/monitor` | `monitor-app/src/main.js` |
| system-app | `/system` | `system-app/src/main.js` |
| image-build-app | `/image-build` | `image-build-app/src/main.js` |

## 🎯 关键要点

### 1. Wujie 不会自动处理路由 base path

与 qiankun 不同，Wujie 要求子应用**自己处理** base path 配置。

### 2. `window.__POWERED_BY_WUJIE__` 检测

Wujie 会在子应用中注入 `window.__POWERED_BY_WUJIE__` 标识，用于：
- 检测是否运行在 Wujie 环境中
- 动态调整 base path
- 兼容独立运行和微前端运行

### 3. 路由配置必须一致

主应用路由前缀 → 子应用 base path：
- `/clusters/:pathMatch(.*)*` → `base = '/clusters'`
- `/agents/:pathMatch(.*)*` → `base = '/agents'`
- `/dashboard/:pathMatch(.*)*` → `base = '/dashboard'`

## ✅ 验证方法

### 1. 独立运行
```bash
cd cluster-app
pnpm dev
# 访问 http://localhost:3003/list
# 应该显示集群列表 ✅
```

### 2. Wujie 环境运行
```bash
make dev
# 访问 http://localhost:3000/clusters
# 应该显示集群列表 ✅
```

### 3. 检查浏览器控制台
```javascript
// 在子应用中打开控制台
console.log('Is Wujie:', window.__POWERED_BY_WUJIE__)
console.log('Router base:', router.options.history.base)
```

预期输出：
- 独立运行：`Is Wujie: undefined`, `Router base: /`
- Wujie 环境：`Is Wujie: true`, `Router base: /clusters`

## 🎉 结果

修复后：
- ✅ 路由路径正确匹配
- ✅ 组件正常渲染
- ✅ Mock 数据正常加载
- ✅ 列表显示 4 条集群记录
- ✅ 支持独立运行和 Wujie 运行

## 📚 相关文档

- `WUJIE_MIGRATION_COMPLETE.md` - Wujie 迁移完整报告
- `IPv6_FIX.md` - IPv6 监听问题修复
- `BROWSER_PROXY_FIX.md` - 浏览器代理问题解决方案

---

**修复时间**: 2025-10-08
**影响范围**: 所有 6 个子应用
**问题严重度**: 高（阻塞使用）
**修复难度**: 简单（3 行代码）
