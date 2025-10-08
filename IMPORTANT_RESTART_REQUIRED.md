# ⚠️ 重要：需要重启服务

## 问题原因

你看到的 `bootstrap timeout` 错误是因为：

**所有子应用的代码已经修复，但正在运行的服务仍在使用旧代码。**

Vite 开发服务器的热重载（HMR）**不会**自动检测 `main.js` 这种入口文件的更改，必须手动重启。

## 立即解决

**停止所有服务并重启**：

```bash
# 方式 1: 使用 Makefile（推荐）
make kill     # 强制停止所有服务
make dev      # 重新启动

# 方式 2: 如果当前在前台运行
# 按 Ctrl+C 停止
# 然后重新运行
make dev
```

## 验证修复

重启后，在浏览器控制台应该看到：

```
[monitor-app] bootstrap
[cluster-app] bootstrap
[system-app] bootstrap
```

**不应该再有** `bootstrap timeout` 错误。

## 为什么需要重启？

### Vite HMR 的限制

Vite 的热模块替换（HMR）只能处理：
- ✅ Vue 组件更改
- ✅ CSS 样式更改
- ✅ 普通 JavaScript 模块

**不能处理**：
- ❌ 入口文件（`main.js`）更改
- ❌ Vite 配置更改
- ❌ 依赖安装/更新

### 我们修改的是什么？

我们修改了所有子应用的 `main.js`（入口文件），将生命周期函数从：

```javascript
// 旧代码（同步）
bootstrap() {
  console.log('[app] bootstrap')
}
```

改为：

```javascript
// 新代码（异步）
async bootstrap() {
  console.log('[app] bootstrap')
  return Promise.resolve()
}
```

这种修改**必须重启**才能生效。

## 其他需要重启的情况

以后遇到以下情况也需要重启：

1. **修改 `main.js`** - 入口文件
2. **修改 `vite.config.js`** - Vite 配置
3. **修改 `.env.development`** - 环境变量
4. **安装新依赖** - `pnpm install`
5. **修改 `package.json`** - 依赖配置
6. **修改 qiankun 配置** - 主应用的微前端配置

## 快速命令参考

```bash
# 检查服务状态
make status

# 停止所有服务
make stop      # 优雅停止
make kill      # 强制停止

# 启动服务
make dev       # 前台启动
make dev-bg    # 后台启动

# 重启服务
make restart   # 停止 + 启动
```

## 常见误解

❌ **错误想法**: "我修改了代码，HMR 会自动更新"
✅ **正确理解**: "只有组件和样式会 HMR，入口文件必须重启"

❌ **错误想法**: "刷新浏览器就能看到更改"
✅ **正确理解**: "刷新只是重新加载，后端服务仍在使用旧代码"

❌ **错误想法**: "只重启主应用就够了"
✅ **正确理解**: "每个子应用都是独立的 Vite 服务，都需要重启"

## 下一步

1. **立即执行**:
   ```bash
   make kill
   make dev
   ```

2. **等待启动**: 所有 7 个应用启动需要 10-30 秒

3. **刷新浏览器**: 访问 http://localhost:3000

4. **验证**: 浏览器控制台不应该有 timeout 错误

5. **测试**: 点击各个菜单，确认子应用正常加载

## 如果重启后仍有问题

如果重启后仍然看到错误，可能是浏览器缓存问题：

```bash
# 1. 硬刷新浏览器
# macOS: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + R

# 2. 或清除浏览器缓存
# Chrome: F12 -> Network -> Disable cache（勾选）

# 3. 或使用隐私模式
# Chrome: Cmd/Ctrl + Shift + N
```

如果还是不行，查看详细排查：[TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**现在就执行**: `make kill && make dev` 🚀
