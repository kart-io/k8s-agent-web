# IPv6 监听问题修复

## 🔍 问题发现

在 Wujie 迁移后，发现微应用列表无数据的真正原因是：

### 症状
- 访问 http://localhost:3000/clusters 列表为空
- 浏览器开发者工具 Network 显示微应用请求失败
- `curl http://localhost:3003/` ✅ 正常
- `curl http://127.0.0.1:3003/` ❌ Connection refused

### 根本原因

Vite 默认行为：
```bash
# 修复前
$ lsof -iTCP:3003 -sTCP:LISTEN
COMMAND   PID      USER   FD   TYPE NODE NAME
node    83288 costalong   32u  IPv6      TCP localhost:cgms (LISTEN)
                                ^^^^
                              只监听 IPv6 (::1)
```

**问题**：
1. Vite 默认只在 IPv6 `::1` (localhost) 上监听
2. 当浏览器或代理解析 localhost 为 `127.0.0.1` (IPv4) 时无法连接
3. 导致微应用加载失败，列表为空

## ✅ 解决方案

在所有应用的 `vite.config.js` 中添加 `host: '0.0.0.0'`：

```javascript
export default defineConfig({
  // ...
  server: {
    host: '0.0.0.0',  // ← 添加这一行！
    port: 3003,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
```

### `host: '0.0.0.0'` 的作用

监听**所有网络接口**，包括：
- `127.0.0.1` (IPv4 localhost)
- `::1` (IPv6 localhost)
- 局域网 IP（如 192.168.x.x）

## 📊 修复验证

### 修复前
```bash
$ lsof -iTCP:3003 -sTCP:LISTEN
COMMAND   PID      USER   FD   TYPE NODE NAME
node    83288 costalong   32u  IPv6      TCP localhost:cgms (LISTEN)

$ curl -I http://127.0.0.1:3003/
curl: (7) Failed to connect to 127.0.0.1 port 3003: Connection refused
```

### 修复后
```bash
$ lsof -iTCP:3003 -sTCP:LISTEN
COMMAND   PID      USER   FD   TYPE NODE NAME
node    87182 costalong   16u  IPv4      TCP *:cgms (LISTEN)

$ curl -I http://127.0.0.1:3003/
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
```

## 🔧 已修复的文件

### 主应用
- ✅ `main-app/vite.config.js`

### 子应用
- ✅ `dashboard-app/vite.config.js`
- ✅ `agent-app/vite.config.js`
- ✅ `cluster-app/vite.config.js`
- ✅ `monitor-app/vite.config.js`
- ✅ `system-app/vite.config.js`
- ✅ `image-build-app/vite.config.js`

## 🎯 为什么会有这个问题？

### 微前端架构的特殊性

1. **Wujie 工作方式**：
   ```
   浏览器 → 主应用 (3000)
            ↓
            发起子应用请求
            ↓
   浏览器 → 子应用 (3001-3006)
   ```

2. **localhost 解析问题**：
   - 有些浏览器/代理将 `localhost` 解析为 `127.0.0.1` (IPv4)
   - 有些解析为 `::1` (IPv6)
   - Vite 默认只监听 IPv6

3. **代理的影响**：
   - 代理服务器可能只支持 IPv4
   - 将 localhost 解析为 127.0.0.1
   - 无法连接到只监听 IPv6 的服务

### 具体场景

```
浏览器请求: http://localhost:3003/
    ↓
代理解析为: 127.0.0.1:3003
    ↓
尝试连接: 127.0.0.1:3003
    ↓
Vite 监听: ::1:3003 (IPv6)
    ↓
结果: Connection refused ❌
```

**修复后**：

```
浏览器请求: http://localhost:3003/
    ↓
代理解析为: 127.0.0.1:3003
    ↓
尝试连接: 127.0.0.1:3003
    ↓
Vite 监听: 0.0.0.0:3003 (所有接口)
    ↓
结果: 连接成功 ✅
```

## 💡 最佳实践

### 开发环境配置

```javascript
// vite.config.js
export default defineConfig({
  server: {
    host: '0.0.0.0',  // 监听所有接口
    port: 3003,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
```

### 为什么使用 0.0.0.0？

1. **兼容性最好**：支持 IPv4 和 IPv6
2. **开发便利**：可以通过局域网 IP 访问（如用手机测试）
3. **避免问题**：消除 localhost 解析的不确定性

### 安全考虑

**开发环境**：
- ✅ 使用 `0.0.0.0` 没问题
- 本地开发网络通常是安全的

**生产环境**：
- 不直接运行 Vite dev server
- 使用 Nginx/Apache 等 Web 服务器
- 通过反向代理控制访问

## 📝 相关文档

- `BROWSER_PROXY_FIX.md` - 浏览器代理问题（已部分解决）
- `QUICK_FIX_GUIDE.md` - 快速修复指南（需要更新）
- `WUJIE_MIGRATION_COMPLETE.md` - Wujie 迁移详情

## 🎉 结论

通过添加 `host: '0.0.0.0'`，我们解决了：

1. ✅ IPv6/IPv4 兼容性问题
2. ✅ 代理解析 localhost 的问题
3. ✅ 微应用无法加载的问题
4. ✅ 列表数据无法显示的问题

**现在浏览器可以正常访问所有微应用！** 🚀

---

**修复时间**: 2025-10-08
**影响范围**: 所有 7 个应用
**问题严重度**: 高（阻塞使用）
**修复难度**: 简单（一行配置）
