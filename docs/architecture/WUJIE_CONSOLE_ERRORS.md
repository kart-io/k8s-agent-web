# Wujie 控制台错误说明

## 可以安全忽略的错误

在使用 Wujie 微前端框架时,您会在浏览器控制台看到以下错误,**这些都是正常的,可以安全忽略**:

### 1. Wujie 代码隔离错误 ✅ 正常

```
Uncaught Error: 此报错可以忽略,iframe主动中断主应用代码在子应用运行
    at stopMainAppRun (utils.ts:377:9)
    at Object.get (proxy.ts:90:26)
    at HTMLDocument.get [as documentElement] (iframe.ts:522:28)
```

**说明**:
- 这是 Wujie 的 **设计行为**,不是真正的错误
- 用途: 防止主应用的代码在子应用的 iframe 上下文中运行
- 机制: 通过抛出错误来中断代码执行,确保应用间的隔离
- 影响: 无任何负面影响,应用正常运行

**为什么无法过滤**:
- 这个错误是从 iframe 沙箱内部抛出的
- 主应用的全局错误处理器无法捕获 iframe 内的错误
- 这是浏览器同源策略的限制

**解决方案**:
目前没有办法完全消除这个控制台输出,但可以:
1. ✅ 在浏览器控制台中右键点击错误 → "Hide messages from ..."
2. ✅ 理解这是正常行为,不影响功能
3. ✅ 在代码审查和测试时忽略这类错误

### 2. ResizeObserver 错误 ✅ 已过滤

```
ResizeObserver loop completed with undelivered notifications.
```

**说明**:
- 浏览器的已知问题,非应用错误
- 发生在元素快速调整大小时
- 我们的错误报告器已自动过滤此错误

**状态**: ✅ 已通过 `error-reporter.js` 自动过滤

## 需要关注的真正错误

以下错误 **不会被过滤**,需要认真对待:

### 网络错误
```
Failed to fetch
GET http://localhost:3001/ 404 (Not Found)
```
- 说明: 微应用服务未启动或 URL 错误
- 解决: 检查所有服务是否运行 (`make status`)

### 超时错误
```
[MicroAppContainer] Micro-app loading timeout: xxx-app
```
- 说明: 微应用加载超过 5 秒
- 解决: 检查网络,确认微应用服务正常

### 配置错误
```
[CONFIG] ❌ Configuration validation failed
```
- 说明: 微应用配置文件验证失败
- 解决: 检查 `micro-apps.config.js` 和 schema

### JavaScript 运行时错误
```
TypeError: Cannot read property 'xxx' of undefined
ReferenceError: xxx is not defined
```
- 说明: 代码逻辑错误
- 解决: 检查代码,修复 bug

## 开发建议

### 1. 配置浏览器控制台过滤

**Chrome DevTools**:
1. 打开控制台 (F12)
2. 点击 "Filter" 图标
3. 添加过滤规则:
   ```
   -/此报错可以忽略/
   -/iframe主动中断/
   ```

**或者右键点击错误消息**:
- 选择 "Hide messages from utils.ts"
- 这会隐藏来自该文件的所有错误

### 2. 理解错误类型

在开发时,快速判断错误类型:

| 错误特征 | 类型 | 是否需要关注 |
|---------|------|-------------|
| `此报错可以忽略` | Wujie 内部 | ❌ 忽略 |
| `stopMainAppRun` | Wujie 内部 | ❌ 忽略 |
| `ResizeObserver` | 浏览器限制 | ❌ 忽略 |
| `Failed to fetch` | 网络错误 | ✅ 关注 |
| `404 Not Found` | 资源未找到 | ✅ 关注 |
| `timeout` | 加载超时 | ✅ 关注 |
| `TypeError` | 代码错误 | ✅ 关注 |
| `ReferenceError` | 代码错误 | ✅ 关注 |

### 3. 测试时的最佳实践

在进行 MVP 测试时:
1. ✅ **忽略** Wujie "此报错可以忽略" 错误
2. ✅ **关注** 应用功能是否正常
3. ✅ **关注** 网络请求是否成功
4. ✅ **关注** 页面加载是否顺利
5. ✅ **记录** 任何影响功能的错误

## 为什么 Wujie 使用这种机制?

Wujie 通过 iframe 沙箱实现微前端隔离:

```
主应用 (Main App)
├── Window (主应用全局对象)
└── Wujie Container
    └── iframe (子应用沙箱)
        ├── Proxy Window (代理对象)
        └── 子应用代码
```

当主应用代码尝试访问 iframe 内的 DOM 时:
1. Wujie 的 Proxy 拦截访问
2. 抛出 "此报错可以忽略" 错误
3. 中断主应用代码执行
4. 保护子应用的隔离性

**这是一种保护机制,不是 bug!**

## 相关资源

- [Wujie 官方文档](https://wujie-micro.github.io/doc/)
- [Wujie GitHub Issues](https://github.com/Tencent/wujie/issues)
- 项目文档: `WUJIE_MIGRATION_COMPLETE.md`
- Bug 修复记录: `BUGFIX_TIMEOUT_FALSE_POSITIVE.md`

## 总结

**重要**: Wujie 的 "此报错可以忽略" 错误是**正常现象**,表示框架的隔离机制正在工作。

在测试和开发时:
- ✅ 专注于应用功能是否正常
- ✅ 关注真正影响用户的错误
- ❌ 不要被 Wujie 内部错误分散注意力

**如果应用功能正常,就无需担心这个控制台输出。**
