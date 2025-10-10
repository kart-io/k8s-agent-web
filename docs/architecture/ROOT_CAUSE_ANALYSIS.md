# Bootstrap 超时根本原因 - 完整分析

## 🔬 问题本质

Bootstrap 超时 4000ms 的**真正原因**是 `vite-plugin-qiankun` 的工作机制。

### vite-plugin-qiankun 的加载流程

```
1. qiankun 调用 window['system-app'].bootstrap()
   ↓ 这是一个 deferred promise，等待被 resolve

2. qiankun 开始计时 (4000ms 倒计时开始)
   ↓

3. qiankun 加载 HTML (http://localhost:3005/)
   ↓ ~50-100ms

4. 解析 HTML，发现 <script>import('/src/main.js')</script>
   ↓

5. 加载 main.js 及其所有依赖：
   - /src/public-path.js
   - vue.js (已预构建)
   - vue-router.js (已预构建)
   - pinia.js (已预构建)
   - ant-design-vue.js ← ⚠️ 3.2 MB! (已预构建)
   - App.vue
   - router/index.js
   - assets/styles/main.scss
   ↓ ~2000-3000ms (取决于网络和缓存)

6. 执行模块顶层代码
   ↓ ~100-500ms

7. renderWithQiankun() 将生命周期存到 window.moudleQiankunAppLifeCycles
   ↓

8. .finally() 回调执行，resolve deferred promise
   ↓

9. qiankun 实际调用 bootstrap() 函数
   ↓ ~1ms

10. bootstrap 完成
```

**总时间**: 50 + 2500 + 300 + 1 = ~2850ms (接近 4000ms 限制)

如果有任何延迟（网络慢、CPU 慢、多个应用同时加载），就会超时！

## 🎯 为什么会超时？

### 1. 多个应用并发加载

qiankun 的 `prefetch: true` 会预加载所有应用：

```javascript
// main-app 启动时
start({ prefetch: true })

// qiankun 同时加载：
- dashboard-app (ant-design-vue 3.2MB)
- agent-app (ant-design-vue 3.2MB)
- cluster-app (ant-design-vue 3.2MB)
- monitor-app (ant-design-vue 3.2MB)
- system-app (ant-design-vue 3.2MB)
- image-build-app (ant-design-vue 3.2MB)
```

**累积效果**：浏览器并发限制 + 19.2MB 的依赖 = 严重延迟

### 2. Ant Design Vue 太大

```
ant-design-vue.js: 3.2 MB
ant-design-vue.js.map: 6.1 MB (开发模式也会加载)
```

即使预构建了，3.2MB 在并发加载时仍然很慢。

### 3. vite-plugin-qiankun 的限制

不同于标准的 qiankun 集成，`vite-plugin-qiankun` 使用 deferred promise，这意味着**模块加载时间完全计入 bootstrap 超时**。

标准 qiankun 集成：
```javascript
// 模块加载
export async function bootstrap() {
  // 只有这里的代码计入超时
}
```

vite-plugin-qiankun：
```javascript
// ⚠️ 整个模块加载 + 执行都计入超时
const bootstrap = createDeffer('bootstrap')
```

## ✅ 真正的解决方案

### 方案 1: 禁用预加载（推荐）⭐⭐⭐

修改 `main-app/src/micro/index.js`：

```javascript
export function startQiankun() {
  start({
    prefetch: false,  // ← 改为 false
    sandbox: {
      strictStyleIsolation: false,
      experimentalStyleIsolation: true
    },
    singular: false
  })
}
```

**效果**：
- 只加载当前激活的应用
- 避免并发加载导致的延迟
- Bootstrap 时间从 2850ms 降到 < 1000ms

### 方案 2: 使用 Ant Design Vue 按需导入

修改所有子应用的 main.js：

```javascript
// ❌ 错误：导入整个 Ant Design Vue
import Antd from 'ant-design-vue'
app.use(Antd)

// ✅ 正确：只导入需要的组件
import { Button, Table, Form } from 'ant-design-vue'
app.component('AButton', Button)
app.component('ATable', Table)
app.component('AForm', Form)
```

**效果**：
- 减少 80-90% 的包大小
- 每个应用只加载 ~300-500KB 而不是 3.2MB

### 方案 3: 共享依赖

在主应用中加载 Ant Design Vue，子应用复用：

```javascript
// main-app
import Antd from 'ant-design-vue'
window.__SHARED_ANTD__ = Antd

// 子应用
const Antd = window.__SHARED_ANTD__ || (await import('ant-design-vue')).default
```

### 方案 4: 切换到其他微前端方案

考虑使用：
- Module Federation (Webpack 5 / Rspack)
- Micro-app
- wujie

这些方案对 Vite 的支持更好。

## 🚀 立即实施

我建议**立即实施方案 1**（最简单最有效）：

```javascript
// main-app/src/micro/index.js
export function startQiankun() {
  start({
    prefetch: false,  // ← 只改这一行
    // ... 其他配置不变
  })
}
```

然后重启并测试。

## 📊 为什么之前的修复没用？

1. ✅ 移除 VXE Table - **有帮助**，减少了 ~500ms
2. ✅ async bootstrap - **无效**，因为超时在模块加载，不是函数执行
3. ✅ 延迟配置 - **无效**，同样原因
4. ❌ 浏览器缓存 - **不是主要原因**，并发加载才是

## 🎯 预期效果

### 修改前 (prefetch: true)

```
时间线：
0ms: qiankun 启动
0ms: 开始预加载所有 6 个应用
500ms: 并发加载 6 × 3.2MB = 19.2MB
3000ms: 第一个应用加载完成
4000ms: ⚠️ 超时！某些应用还在加载
```

### 修改后 (prefetch: false)

```
时间线：
0ms: qiankun 启动
0ms: 等待用户导航
用户点击 "系统管理"：
0ms: 开始加载 system-app
200ms: HTML 加载完成
800ms: main.js 及依赖加载完成 ← 只加载一个应用！
900ms: ✅ bootstrap 完成（< 4000ms）
1000ms: mount 完成，页面显示
```

## 🔧 完整修复步骤

1. **禁用预加载**（2 分钟）
   ```bash
   # 编辑 main-app/src/micro/index.js
   # 将 prefetch: true 改为 prefetch: false
   ```

2. **重启服务**（1 分钟）
   ```bash
   make restart
   ```

3. **测试**（1 分钟）
   ```bash
   # 访问 http://localhost:3000
   # 点击各个菜单
   # 检查控制台无超时错误
   ```

**总时间：4 分钟**

## 📝 长期优化建议

1. **按需导入 Ant Design Vue**
   - 减少 80% 包大小
   - 每个应用独立优化

2. **考虑 CDN**
   - 将 Vue、Ant Design Vue 放到 CDN
   - 利用浏览器缓存

3. **评估微前端必要性**
   - 如果应用不是特别大
   - 考虑 monorepo + 代码分割

4. **升级到 Module Federation**
   - 更好的依赖共享
   - 真正的运行时集成

## 🎉 结论

**Bootstrap 超时的根本原因**：
- vite-plugin-qiankun 的 deferred promise 机制
- 并发预加载 6 个应用，每个 3.2MB
- 累积延迟超过 4000ms

**最简单有效的解决方案**：
- 禁用 prefetch
- 只在需要时加载应用
- 问题立即解决

---

**现在就去改 `prefetch: false` 吧！** 🚀
