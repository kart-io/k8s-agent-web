# 快速修复指南 - 列表无数据问题

## 🎯 问题
访问 http://localhost:3000/clusters 时页面显示但列表没有数据。

## ✅ 解决方案（5 分钟）

### 步骤 1: 配置 no_proxy 环境变量

打开终端，执行以下命令：

```bash
# 如果使用 zsh（macOS 默认）
echo 'export no_proxy="localhost,127.0.0.1,::1"' >> ~/.zshrc
echo 'export NO_PROXY="localhost,127.0.0.1,::1"' >> ~/.zshrc
source ~/.zshrc

# 如果使用 bash
echo 'export no_proxy="localhost,127.0.0.1,::1"' >> ~/.bash_profile
echo 'export NO_PROXY="localhost,127.0.0.1,::1"' >> ~/.bash_profile
source ~/.bash_profile
```

### 步骤 2: 验证配置

```bash
echo $no_proxy
# 应该输出: localhost,127.0.0.1,::1
```

### 步骤 3: 重启浏览器

**重要**：必须完全关闭并重新打开浏览器，而不是刷新页面。

```bash
# macOS Chrome 示例
# 1. 完全退出 Chrome（Cmd+Q）
# 2. 重新打开 Chrome
```

### 步骤 4: 验证服务状态

```bash
cd /Users/costalong/code/go/src/github.com/kart/k8s-agent-web
make status
```

应该看到所有服务都在运行：

```
✅ 主应用 (main-app) - 运行中 (Port: 3000)
✅ 仪表盘 (dashboard-app) - 运行中 (Port: 3001)
✅ Agent管理 (agent-app) - 运行中 (Port: 3002)
✅ 集群管理 (cluster-app) - 运行中 (Port: 3003)
✅ 监控管理 (monitor-app) - 运行中 (Port: 3004)
✅ 系统管理 (system-app) - 运行中 (Port: 3005)
✅ 镜像构建 (image-build-app) - 运行中 (Port: 3006)
```

如果服务未运行：

```bash
make dev
```

### 步骤 5: 测试访问

1. 打开浏览器（已重启）
2. 访问 http://localhost:3000
3. 点击左侧菜单"集群管理"
4. 应该能看到 4 条集群数据：
   - prod-cluster-1
   - prod-cluster-2
   - dev-cluster
   - test-cluster

### 步骤 6: 验证（开发者工具）

打开浏览器开发者工具（F12）：

**Console 标签**应该看到：
```
[Cluster] Mock 数据已启用
[ClusterList] API response: { data: [...], total: 4 }
```

**Network 标签**应该看到：
- `http://localhost:3003/` - Status: 200 OK（不是 502）

---

## 🚨 如果仍然没有数据

### 检查 1: 代理是否生效

```bash
curl -I http://localhost:3003/
```

**期望输出**:
```
HTTP/1.1 200 OK
```

**如果看到 502**，说明代理仍在拦截：
1. 确认已重启浏览器
2. 检查浏览器代理插件设置
3. 尝试临时关闭浏览器代理

### 检查 2: 服务是否运行

```bash
make status
```

如果有服务未运行：
```bash
make kill        # 停止所有服务
make dev         # 重新启动
```

### 检查 3: Mock 数据是否启用

查看 `cluster-app/.env.development`：

```bash
cat cluster-app/.env.development
```

应该包含：
```
VITE_USE_MOCK=true
```

### 检查 4: 浏览器控制台错误

打开开发者工具 Console，查看是否有红色错误信息，并将错误信息提供给开发者。

---

## 📱 临时解决方案

如果配置 no_proxy 后仍有问题，可以临时：

1. **关闭浏览器代理**:
   - 如果使用代理插件（如 SwitchyOmega），临时关闭
   - 如果使用系统代理，临时在系统设置中关闭

2. **访问应用**: http://localhost:3000

3. **使用完成后重新启用代理**

---

## 🔍 原因说明

**为什么会有这个问题？**

1. Wujie 微前端架构中，主应用（3000）通过浏览器请求微应用（3001-3006）
2. 你的系统配置了 HTTP 代理（127.0.0.1:7890）
3. 浏览器将所有 HTTP 请求发送给代理服务器
4. 代理服务器无法访问你本地的其他端口（3001-3006）
5. 返回 502 Bad Gateway
6. 结果：微应用无法加载，列表为空

**解决方案**: 配置 `no_proxy` 告诉浏览器"访问 localhost 时不要使用代理"

---

## 📚 详细文档

- **BROWSER_PROXY_FIX.md** - 浏览器代理问题完整解决方案
- **WUJIE_MIGRATION_COMPLETE.md** - Wujie 迁移详情
- **CLAUDE.md** - 开发指南

---

**配置一次，永久生效！** ✨
