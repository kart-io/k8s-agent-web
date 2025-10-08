# 浏览器代理问题修复指南

## 🔍 问题现象

访问 http://localhost:3000/clusters 时，页面显示但列表没有数据，浏览器开发者工具的 Network 标签显示微应用请求返回 502 Bad Gateway。

## 🎯 问题原因

系统或浏览器的 HTTP 代理设置拦截了对 localhost 的请求，导致：

1. 浏览器请求 http://localhost:3003/（cluster-app）被代理服务器拦截
2. 代理服务器（如 127.0.0.1:7890）无法访问 localhost
3. 返回 502 Bad Gateway 错误
4. Wujie 无法加载微应用，列表为空

## ✅ 解决方案

### 方案 1：配置系统 no_proxy 环境变量（推荐）

**macOS / Linux:**

1. 编辑 shell 配置文件：
   ```bash
   # 如果使用 zsh
   vim ~/.zshrc

   # 如果使用 bash
   vim ~/.bash_profile
   ```

2. 添加以下配置：
   ```bash
   export no_proxy="localhost,127.0.0.1,::1"
   export NO_PROXY="localhost,127.0.0.1,::1"
   ```

3. 重新加载配置：
   ```bash
   source ~/.zshrc  # 或 source ~/.bash_profile
   ```

4. 验证配置：
   ```bash
   echo $no_proxy
   # 应该输出: localhost,127.0.0.1,::1
   ```

5. 重启浏览器

**Windows:**

1. 打开"系统属性" -> "高级" -> "环境变量"
2. 添加系统变量：
   - 变量名: `no_proxy`
   - 变量值: `localhost,127.0.0.1,::1`
3. 重启浏览器

### 方案 2：配置浏览器代理插件

如果使用 **SwitchyOmega** 或类似插件：

1. 打开插件设置
2. 编辑代理配置
3. 添加"不代理的地址列表"：
   ```
   localhost
   127.0.0.1
   ::1
   *.local
   ```
4. 保存并应用

如果使用 **Proxy SwitchySharp**：

1. 打开选项
2. 在"Bypass List"中添加：
   ```
   localhost;127.0.0.1;::1;*.local
   ```

### 方案 3：配置代理软件

#### Clash

编辑 `config.yaml` 或在界面中配置：

```yaml
bypass:
  - localhost
  - 127.0.0.1
  - "::1"
  - "*.local"
```

#### V2Ray / V2RayN

1. 打开设置
2. 找到"路由设置"或"绕过规则"
3. 添加：
   ```
   geoip:private
   domain:localhost
   ```

#### Surge

在配置文件中添加：

```
[General]
skip-proxy = localhost, 127.0.0.1, ::1, *.local
```

### 方案 4：临时禁用代理（最简单，但不推荐）

每次开发时：

1. 关闭系统代理或浏览器代理插件
2. 访问 http://localhost:3000
3. 开发完成后再启用

**缺点**：需要频繁切换，不方便

## 🧪 验证修复

### 1. 命令行验证

```bash
# 清除代理环境变量
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY

# 测试访问
curl -I http://localhost:3003/

# 应该返回: HTTP/1.1 200 OK
```

### 2. 浏览器验证

1. 重启浏览器（确保新配置生效）
2. 访问 http://localhost:3000
3. 导航到"集群管理"菜单
4. 应该能看到集群列表数据
5. 打开开发者工具 Network 标签
6. 刷新页面
7. 检查 `http://localhost:3003/` 请求：
   - ✅ Status: 200 OK
   - ❌ Status: 502 Bad Gateway (仍有问题)

### 3. 浏览器开发者工具验证

1. 打开开发者工具（F12）
2. 切换到 Console 标签
3. 应该看到：
   ```
   [Cluster] Mock 数据已启用
   [ClusterList] API response: { data: [...], total: 4 }
   ```
4. 切换到 Network 标签
5. 筛选 XHR 请求
6. 应该看不到 502 错误

## 🔧 开发服务器配置

dev.sh 脚本已经在服务器进程中禁用了代理：

```bash
#!/bin/bash
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY
export no_proxy=localhost,127.0.0.1,::1
export NO_PROXY=localhost,127.0.0.1,::1
pnpm dev
```

但这只影响服务器进程，**不影响浏览器**。所以需要单独配置浏览器的代理规则。

## 📊 诊断命令

检查当前代理设置：

```bash
# 检查环境变量
env | grep -i proxy

# 应该输出（开发环境正确配置）:
# no_proxy=localhost,127.0.0.1,::1
# NO_PROXY=localhost,127.0.0.1,::1
```

测试服务可访问性：

```bash
# 测试主应用
curl -I http://localhost:3000/

# 测试微应用
curl -I http://localhost:3001/  # dashboard-app
curl -I http://localhost:3002/  # agent-app
curl -I http://localhost:3003/  # cluster-app
curl -I http://localhost:3004/  # monitor-app
curl -I http://localhost:3005/  # system-app
curl -I http://localhost:3006/  # image-build-app

# 所有应该返回: HTTP/1.1 200 OK
```

## 💡 为什么会有这个问题？

1. **微前端架构**：Wujie 主应用（3000）通过浏览器直接请求微应用（3001-3006）
2. **浏览器代理**：浏览器对所有 HTTP 请求应用代理规则，包括 localhost
3. **代理限制**：代理服务器通常运行在 127.0.0.1:7890，无法访问其他 localhost 端口
4. **结果**：请求被代理拦截 → 代理无法连接 → 返回 502

## 🎯 最佳实践

1. **永久配置** no_proxy 环境变量（方案 1）
2. 在代理软件中添加 localhost 绕过规则（方案 3）
3. 使用浏览器配置文件管理不同场景的代理设置
4. 团队共享这个配置文档

## 📝 相关文档

- `PROXY_ISSUE_FIX.md` - 服务器端代理问题（已通过 dev.sh 解决）
- `TROUBLESHOOTING.md` - 常见问题排查
- `CLAUDE.md` - 开发指南

---

**修复后记得重启浏览器！** 🔄
