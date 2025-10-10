# 故障排查指南

本文档汇总了 K8s Agent Web 项目的常见问题和解决方案。

## 🚨 常见错误及解决方案

### 0. 修改代码后错误仍然存在 ⚠️

**症状**: 修改了代码，但浏览器仍然显示相同的错误

**原因**: Vite HMR 不会自动检测入口文件（`main.js`）的更改

**解决方案**: 👉 **必须重启服务**

```bash
# 停止当前服务（二选一）
make kill              # 方式 1: 强制停止
# 或按 Ctrl+C          # 方式 2: 如果在前台运行

# 重新启动
make dev
```

**需要重启的情况**:
- ✅ 修改 `main.js`（入口文件）
- ✅ 修改 `vite.config.js`（配置文件）
- ✅ 修改 `.env.development`（环境变量）
- ✅ 安装新依赖（`pnpm install`）
- ✅ 修改 qiankun 配置

**不需要重启的情况**:
- ❌ 修改 Vue 组件（`.vue` 文件）
- ❌ 修改样式文件（`.css`, `.scss`）
- ❌ 修改普通 JavaScript 模块

详细说明: [IMPORTANT_RESTART_REQUIRED.md](IMPORTANT_RESTART_REQUIRED.md)

---

### 1. 子应用加载失败（404/502 错误）

**错误信息**:
```
GET http://localhost:3001/ 404 (Not Found)
GET http://localhost:3001/ 502 (Bad Gateway)
application 'dashboard-app' died in status LOADING_SOURCE_CODE
You need to export lifecycle functions in dashboard-app entry
```

**原因**: HTTP 代理拦截 localhost 请求

**解决方案**: 👉 详见 [PROXY_ISSUE_FIX.md](PROXY_ISSUE_FIX.md)

**快速修复**:
```bash
make kill
make dev  # 自动处理代理问题
```

---

### 2. Bootstrap 超时错误

**错误信息**:
```
single-spa minified message #31
application 'cluster-app' died in status LOADING_SOURCE_CODE
bootstrap timeout (4000ms)
```

**原因**: 子应用生命周期函数超时

**解决方案**: 👉 详见 [BOOTSTRAP_TIMEOUT_FIX.md](BOOTSTRAP_TIMEOUT_FIX.md)

**快速修复**:
```bash
# 所有应用已修复，如果仍有问题：
make kill
make dev
```

---

### 3. 端口被占用

**错误信息**:
```
Port 3000 is in use
```

**解决方案**:
```bash
# 方案 1: 使用 Makefile 清理
make kill

# 方案 2: 手动清理特定端口
lsof -ti:3000 | xargs kill -9

# 方案 3: 清理所有开发端口
lsof -ti:3000,3001,3002,3003,3004,3005,3006 | xargs kill -9
```

---

### 4. 依赖安装失败

**错误信息**:
```
ERR_PNPM_PEER_DEP_ISSUES
Cannot find module '@k8s-agent/shared'
```

**解决方案**:
```bash
# 方案 1: 重新安装所有依赖
make clean
make setup

# 方案 2: 手动安装
pnpm install          # 根目录
cd shared && pnpm install
cd ../main-app && pnpm install
# ... 其他子应用
```

---

### 5. CORS 错误

**错误信息**:
```
Access to fetch at 'http://localhost:3001' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**原因**: Vite 配置问题

**解决方案**:

检查子应用的 `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3001,
    cors: true,                      // ✅ 启用 CORS
    origin: 'http://localhost:3001'  // ✅ 设置 origin
  }
})
```

---

### 6. 子应用白屏

**症状**: 子应用路由显示，但页面空白无内容

**可能原因**:
1. Vue 应用未正确挂载
2. 容器元素 ID 不匹配
3. JavaScript 错误

**排查步骤**:

1. 检查浏览器控制台是否有错误
2. 检查容器 ID 是否匹配:
   ```javascript
   // main.js
   const containerElement = container
     ? container.querySelector('#dashboard-app')  // ✅ 必须匹配
     : document.getElementById('dashboard-app')
   ```

3. 检查 `index.html`:
   ```html
   <div id="dashboard-app"></div>  <!-- ✅ ID 必须匹配 -->
   ```

4. 单独运行子应用测试:
   ```bash
   make dev-dashboard
   # 访问 http://localhost:3001
   ```

---

### 7. 路由跳转无效

**症状**: 点击菜单后 URL 改变，但页面不切换

**可能原因**:
1. qiankun 路由配置不正确
2. 主应用和子应用路由冲突

**解决方案**:

检查 `main-app/src/micro/apps.js`:
```javascript
{
  name: 'dashboard-app',
  entry: '//localhost:3001',
  container: '#micro-app-container',
  activeRule: '/dashboard',  // ✅ 必须与菜单路由匹配
}
```

检查子应用路由基础路径:
```javascript
// dashboard-app/src/main.js
history = createWebHistory(
  qiankunWindow.__POWERED_BY_QIANKUN__ ? '/dashboard' : '/'  // ✅ 匹配 activeRule
)
```

---

### 8. 样式冲突

**症状**: 子应用样式影响主应用，或样式丢失

**解决方案**:

1. 确认 qiankun 样式隔离已启用:
   ```javascript
   // main-app/src/micro/index.js
   start({
     sandbox: {
       strictStyleIsolation: false,
       experimentalStyleIsolation: true  // ✅ 实验性样式隔离
     }
   })
   ```

2. 使用 Vue scoped 样式:
   ```vue
   <style scoped>
   /* 样式只影响当前组件 */
   </style>
   ```

3. 避免全局样式污染:
   ```css
   /* ❌ 避免 */
   div { color: red; }

   /* ✅ 推荐 */
   .my-component div { color: red; }
   ```

---

### 9. 共享组件导入失败

**错误信息**:
```
Cannot find module '@k8s-agent/shared/components'
```

**解决方案**:

1. 确认 shared 包已安装:
   ```bash
   cd shared && pnpm install
   ```

2. 确认子应用 package.json 中有依赖:
   ```json
   {
     "dependencies": {
       "@k8s-agent/shared": "workspace:*"
     }
   }
   ```

3. 重新安装依赖:
   ```bash
   make install
   ```

---

### 10. Mock 数据不生效

**症状**: 配置了 Mock 但仍然调用真实接口

**解决方案**:

1. 检查环境变量:
   ```bash
   cat main-app/.env.development
   # 应该看到 VITE_USE_MOCK=true
   ```

2. 重启应用（环境变量需要重启生效）:
   ```bash
   make restart
   ```

3. 检查 Mock 文件是否存在:
   ```bash
   ls main-app/src/mock/
   ls dashboard-app/src/mock/
   ```

---

## 🔍 调试技巧

### 1. 检查应用状态

```bash
make status
```

输出示例:
```
📊 应用运行状态:
  ✅ 主应用 (main-app) - 运行中 (PID: 12345, Port: 3000)
  ✅ 仪表盘 (dashboard-app) - 运行中 (PID: 12346, Port: 3001)
  ❌ Agent管理 (agent-app) - 未运行 (Port: 3002)
```

### 2. 查看日志

```bash
# 后台模式的日志
make logs

# 或直接查看文件
tail -f logs/all-apps.log
```

### 3. 检查端口占用

```bash
# 检查特定端口
lsof -ti:3000

# 检查所有开发端口
lsof -ti:3000,3001,3002,3003,3004,3005,3006
```

### 4. 单独测试子应用

```bash
# 单独启动某个子应用
make dev-dashboard

# 访问 http://localhost:3001 测试
```

### 5. 使用浏览器开发者工具

**Console 面板**:
- 查看应用启动日志
- 查看错误信息
- 检查生命周期函数调用

**Network 面板**:
- 检查子应用 HTML/JS 是否加载成功
- 查看 API 请求状态
- 确认没有 404/502 错误

**Vue DevTools**:
- 查看组件树
- 检查路由状态
- 查看 Pinia store

---

## 📋 问题诊断流程

遇到问题时，按以下顺序排查：

### 第 1 步: 检查基础环境

```bash
# 1. 检查 Node 和 pnpm 版本
node --version  # >= 16
pnpm --version  # >= 8

# 2. 检查应用状态
make status

# 3. 检查代理设置
echo $http_proxy
echo $no_proxy
```

### 第 2 步: 查看错误信息

1. 打开浏览器控制台（F12）
2. 查看 Console 面板的错误信息
3. 查看 Network 面板的失败请求
4. 记录错误代码和信息

### 第 3 步: 根据错误类型查找解决方案

| 错误特征 | 参考文档 |
|---------|---------|
| 404/502 错误 | [PROXY_ISSUE_FIX.md](PROXY_ISSUE_FIX.md) |
| Bootstrap timeout | [BOOTSTRAP_TIMEOUT_FIX.md](BOOTSTRAP_TIMEOUT_FIX.md) |
| 端口占用 | 本文档第 3 节 |
| CORS 错误 | 本文档第 5 节 |
| 依赖问题 | 本文档第 4 节 |

### 第 4 步: 尝试通用修复

```bash
# 1. 清理并重启
make kill
make dev

# 2. 如果还不行，重新安装
make clean
make setup
make dev
```

### 第 5 步: 寻求帮助

如果以上步骤都无法解决问题：

1. 收集错误信息:
   - 浏览器控制台截图
   - `make status` 输出
   - 错误日志

2. 检查相关文档:
   - [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
   - [CLAUDE.md](CLAUDE.md)

3. 查看项目文档:
   - [README.md](README.md)
   - [START_GUIDE.md](START_GUIDE.md)

---

## 🛠️ 预防措施

### 开发最佳实践

1. **使用 Makefile 启动**
   ```bash
   make dev  # 自动处理代理等问题
   ```

2. **定期检查状态**
   ```bash
   make status  # 确认所有应用正常运行
   ```

3. **保持依赖更新**
   ```bash
   pnpm update  # 定期更新依赖
   ```

4. **使用 Mock 开发**
   - 开发时使用 Mock 数据（默认）
   - 减少对后端的依赖
   - 提高开发效率

5. **单元测试子应用**
   - 独立运行测试功能
   - 确认没问题再集成

### 环境配置建议

1. **永久设置 no_proxy**（推荐）

   编辑 `~/.zshrc` 或 `~/.bashrc`:
   ```bash
   export no_proxy="localhost,127.0.0.1,::1"
   export NO_PROXY="localhost,127.0.0.1,::1"
   ```

2. **使用版本管理工具**
   - nvm (Node Version Manager)
   - 确保 Node 版本一致

3. **配置编辑器**
   - ESLint 自动修复
   - Prettier 代码格式化
   - Vue 语法高亮

---

## 📞 快速帮助

```bash
# 查看所有可用命令
make help

# 查看应用状态
make status

# 查看快速参考
cat QUICK_REFERENCE.md

# 查看 Makefile 使用说明
cat MAKEFILE_GUIDE.md
```

---

## 🔗 相关文档

- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 快速参考
- [PROXY_ISSUE_FIX.md](PROXY_ISSUE_FIX.md) - 代理问题解决方案
- [BOOTSTRAP_TIMEOUT_FIX.md](BOOTSTRAP_TIMEOUT_FIX.md) - Bootstrap 超时解决方案
- [MAKEFILE_GUIDE.md](MAKEFILE_GUIDE.md) - Makefile 使用指南
- [CLAUDE.md](CLAUDE.md) - Claude Code 开发指南
