# 微应用容器问题修复

## 🚨 问题描述

错误信息：
```
Uncaught Error: application 'dashboard-app' died in status LOADING_SOURCE_CODE:
[qiankun]: Target container with #micro-app-container not existed while dashboard-app loading!
```

## 🔍 根本原因

### 问题 1: 路由配置错误

**原配置**：
```javascript
{
  path: '/',
  component: MainLayout,
  redirect: '/dashboard',
  children: [] // 空的子路由
}
```

**问题**：
- 访问 `/dashboard` 时，不匹配 `/` 路由
- MainLayout 不会被渲染
- `#micro-app-container` 容器不存在
- qiankun 无法挂载子应用

### 问题 2: MainLayout 逻辑混乱

**原代码**：
```vue
<a-layout-content class="content">
  <router-view v-if="isMainRoute" />
  <div id="micro-app-container" v-show="!isMainRoute" />
</a-layout-content>
```

```javascript
const isMainRoute = computed(() => {
  return route.path === '/' || route.path === '/login'
})
```

**问题**：
- `isMainRoute` 判断逻辑有误
- `/dashboard` 时，`isMainRoute = false`
- 但此时 MainLayout 根本没渲染（路由不匹配）

## ✅ 修复方案

### 修复 1: 路由配置 - 添加通配符子路由

```javascript
{
  path: '/',
  component: MainLayout,
  meta: { requiresAuth: true },
  children: [
    {
      path: '',
      redirect: '/dashboard'
    },
    {
      path: 'dashboard/:pathMatch(.*)*',  // 匹配 /dashboard 及其子路径
      name: 'dashboard',
      meta: { requiresAuth: true }
    },
    {
      path: 'agents/:pathMatch(.*)*',
      name: 'agents',
      meta: { requiresAuth: true }
    },
    {
      path: 'clusters/:pathMatch(.*)*',
      name: 'clusters',
      meta: { requiresAuth: true }
    },
    {
      path: 'monitor/:pathMatch(.*)*',
      name: 'monitor',
      meta: { requiresAuth: true }
    },
    {
      path: 'system/:pathMatch(.*)*',
      name: 'system',
      meta: { requiresAuth: true }
    }
  ]
}
```

**效果**：
- 所有 `/dashboard`、`/agents` 等路径都会匹配到 `/` 路由
- MainLayout 始终会被渲染
- `#micro-app-container` 容器始终存在

### 修复 2: MainLayout - 简化容器逻辑

```vue
<a-layout-content class="content">
  <div
    id="micro-app-container"
    class="micro-app-container"
  />
</a-layout-content>
```

**移除**：
- ❌ `<router-view>` - 不需要，子应用由 qiankun 渲染
- ❌ `v-if="isMainRoute"` - 不需要条件渲染
- ❌ `v-show="!isMainRoute"` - 容器始终显示
- ❌ `isMainRoute` computed - 不需要这个判断

## 📊 路由流转对比

### 修复前 ❌

```
访问 /dashboard
  ↓
路由匹配: 无匹配（只有 / 和 /login）
  ↓
降级到 / 路由？不会，因为没有通配符
  ↓
MainLayout 不渲染
  ↓
#micro-app-container 不存在
  ↓
qiankun 报错 ❌
```

### 修复后 ✅

```
访问 /dashboard
  ↓
路由匹配: / (父路由) + dashboard/:pathMatch(.*)* (子路由)
  ↓
MainLayout 渲染
  ↓
#micro-app-container 存在
  ↓
qiankun 加载 dashboard-app
  ↓
子应用挂载到容器 ✅
```

## 🧪 测试验证

### 测试 1: 直接访问子应用路由
```
访问 http://localhost:3000/dashboard
预期: MainLayout 渲染，dashboard-app 加载 ✅
```

### 测试 2: 从首页跳转
```
访问 http://localhost:3000/
  ↓ 自动重定向
http://localhost:3000/dashboard
预期: dashboard-app 加载 ✅
```

### 测试 3: 子应用间切换
```
/dashboard → /agents → /clusters
预期: MainLayout 保持，子应用切换 ✅
```

### 测试 4: 刷新页面
```
在 /agents 页面刷新
预期: MainLayout 渲染，agents-app 加载 ✅
```

## 💡 设计原理

### qiankun 微前端路由策略

1. **主应用路由**: Vue Router 负责
   - 匹配所有子应用的顶级路径
   - 渲染 MainLayout 布局
   - 提供 `#micro-app-container` 容器

2. **子应用路由**: qiankun + 子应用 Router 负责
   - qiankun 根据 `activeRule` 决定加载哪个子应用
   - 子应用内部路由由各自的 Vue Router 管理
   - 子应用挂载到容器后，接管容器内的路由

### 路由配置关键点

```javascript
// 主应用: 捕获所有子应用路径
{
  path: 'dashboard/:pathMatch(.*)*'  // ✅ 通配符捕获所有子路径
}

// qiankun: 激活规则
{
  name: 'dashboard-app',
  activeRule: '/dashboard'  // 匹配 /dashboard 及子路径
}

// 子应用: 内部路由
{
  history: createWebHistory('/dashboard'),  // base path
  routes: [
    { path: '/', component: Dashboard },
    { path: '/detail', component: Detail }
  ]
}
```

**实际路径映射**：
```
/dashboard       → dashboard-app: /
/dashboard/detail → dashboard-app: /detail
```

## ⚠️ 注意事项

### 1. 不要在 MainLayout 中使用 `<router-view>`

```vue
<!-- ❌ 错误 -->
<router-view />  <!-- 会和 qiankun 冲突 -->

<!-- ✅ 正确 -->
<div id="micro-app-container" />  <!-- 只提供容器 -->
```

### 2. 子路由必须使用通配符

```javascript
// ❌ 错误
{ path: 'dashboard' }  // 只匹配 /dashboard

// ✅ 正确
{ path: 'dashboard/:pathMatch(.*)*' }  // 匹配 /dashboard/*
```

### 3. 容器不要条件渲染

```vue
<!-- ❌ 错误 -->
<div v-if="someCondition" id="micro-app-container" />

<!-- ✅ 正确 -->
<div id="micro-app-container" />  <!-- 始终存在 -->
```

## 📝 总结

### 问题根源
- 主应用路由配置缺少子路由
- MainLayout 容器逻辑过于复杂

### 解决方案
- ✅ 添加通配符子路由捕获所有子应用路径
- ✅ 简化 MainLayout，移除不必要的逻辑
- ✅ 容器始终渲染，不做条件判断

### 关键改动
1. `router/index.js` - 添加 6 个通配符子路由
2. `MainLayout.vue` - 移除 `router-view` 和 `isMainRoute`

修复后，所有子应用都能正常加载！
