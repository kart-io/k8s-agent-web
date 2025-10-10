# Bootstrap 超时错误修复

## 问题现象

浏览器控制台出现以下错误：

```
single-spa minified message #31
application 'cluster-app' died in status LOADING_SOURCE_CODE
bootstrap timeout (4000ms)
```

## 问题原因

子应用的 `bootstrap` 生命周期函数超时。single-spa/qiankun 默认超时时间是 4000ms（4秒）。

超时可能由以下原因导致：
1. **生命周期函数未返回 Promise**: 如果函数是同步的但内部有异步操作，qiankun 无法知道何时完成
2. **依赖加载缓慢**: VXE Table、Ant Design Vue 等大型库加载时间过长
3. **网络问题**: 代理或网络延迟导致资源加载缓慢
4. **初始化逻辑过重**: 在 bootstrap 阶段执行了过多操作

## 解决方案

### 已实施的修复

所有子应用的生命周期函数已更新为异步函数并返回 Promise：

**修复前**:
```javascript
renderWithQiankun({
  bootstrap() {
    console.log('[app] bootstrap')
  },
  mount(props) {
    render(props)
  }
})
```

**修复后**:
```javascript
renderWithQiankun({
  async bootstrap() {
    console.log('[app] bootstrap')
    return Promise.resolve()
  },
  async mount(props) {
    render(props)
  }
})
```

### 为什么需要返回 Promise

single-spa/qiankun 期望生命周期函数返回 Promise，以便知道何时完成：

1. **同步函数**: 立即完成，但无法等待异步操作
2. **async 函数**: 自动返回 Promise，qiankun 会等待其完成
3. **显式返回 Promise**: 更清晰地表示异步操作

### 如果问题仍然存在

#### 方案 1: 延迟重型初始化

将重型初始化从 bootstrap 移到 mount：

```javascript
// ❌ 不推荐：在 bootstrap 中初始化
async bootstrap() {
  await heavyInitialization()
}

// ✅ 推荐：在 mount 中初始化
async bootstrap() {
  console.log('[app] bootstrap')
  return Promise.resolve()
}

async mount(props) {
  await heavyInitialization()
  render(props)
}
```

#### 方案 2: 优化依赖加载

使用动态导入延迟加载大型库：

```javascript
async mount(props) {
  // 动态导入 VXE Table
  const { default: VXETable } = await import('vxe-table')
  const { default: VXETablePluginAntd } = await import('vxe-table-plugin-antd')

  VXETable.use(VXETablePluginAntd)

  render(props)
}
```

#### 方案 3: 减少初始化操作

只在必要时初始化：

```javascript
// ❌ 所有应用都初始化 VXE Table
import VXETable from 'vxe-table'
VXETable.setConfig(config)

// ✅ 按需初始化
async mount(props) {
  if (needsVXETable) {
    const VXETable = await import('vxe-table')
    VXETable.setConfig(config)
  }
  render(props)
}
```

## 生命周期函数最佳实践

### Bootstrap 阶段

- **用途**: 应用初始化，只执行一次
- **最佳实践**:
  - 保持简单，只做必要的初始化
  - 避免重型操作
  - 返回 Promise

```javascript
async bootstrap() {
  console.log('[app] 启动')
  // 轻量级初始化
  initConfig()
  return Promise.resolve()
}
```

### Mount 阶段

- **用途**: 挂载应用，每次激活时执行
- **最佳实践**:
  - 创建 Vue 实例
  - 初始化路由和状态
  - 挂载到 DOM

```javascript
async mount(props) {
  console.log('[app] 挂载')

  // 创建路由
  router = createRouter({ ... })

  // 创建应用
  app = createApp(App)
  app.use(router)
  app.use(createPinia())
  app.use(Antd)

  // 挂载
  app.mount(container)
}
```

### Unmount 阶段

- **用途**: 卸载应用
- **最佳实践**:
  - 清理 Vue 实例
  - 销毁路由
  - 清空变量

```javascript
async unmount(props) {
  console.log('[app] 卸载')

  app?.unmount()
  app = null
  router = null
  history = null
}
```

## 调试技巧

### 1. 添加性能监控

```javascript
async bootstrap() {
  const start = Date.now()
  console.log('[app] bootstrap 开始')

  await initialization()

  const duration = Date.now() - start
  console.log(`[app] bootstrap 完成，耗时: ${duration}ms`)

  if (duration > 2000) {
    console.warn('[app] bootstrap 耗时过长')
  }
}
```

### 2. 检查浏览器控制台

查看子应用的日志输出：
- `[app] bootstrap` - 启动开始
- `[app] mount` - 挂载开始
- 如果超时，会看到 single-spa 错误

### 3. 检查网络面板

- 查看资源加载时间
- 检查是否有失败的请求
- 确认没有被代理拦截（见 PROXY_ISSUE_FIX.md）

### 4. 使用 Vue DevTools

- 检查子应用是否正确挂载
- 查看组件树
- 检查路由状态

## 相关问题

### 与代理问题的关系

如果看到 bootstrap 超时，可能是因为：
1. 主应用无法加载子应用 HTML（代理问题）
2. 子应用 JavaScript 加载失败
3. 生命周期函数未正确实现

**先检查代理问题**: 参见 [PROXY_ISSUE_FIX.md](PROXY_ISSUE_FIX.md)

### 超时时间配置

single-spa 的超时时间是硬编码的（4000ms），无法直接修改。但可以通过优化代码避免超时。

## 已修复的应用

以下应用的生命周期函数已全部更新：

- ✅ dashboard-app
- ✅ agent-app
- ✅ cluster-app
- ✅ monitor-app
- ✅ system-app
- ✅ image-build-app

## 验证修复

1. 停止所有应用
   ```bash
   make kill
   ```

2. 重新启动
   ```bash
   make dev
   ```

3. 访问 http://localhost:3000

4. 检查浏览器控制台
   - 应该看到各个应用的 bootstrap 和 mount 日志
   - 不应该有超时错误

## 总结

- **核心问题**: 生命周期函数未返回 Promise
- **解决方案**: 使用 `async` 函数并返回 `Promise.resolve()`
- **最佳实践**: Bootstrap 轻量化，重型操作移到 mount
- **调试方法**: 添加日志、监控性能、检查网络
