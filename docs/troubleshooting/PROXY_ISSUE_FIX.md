# HTTP 代理导致的本地开发问题及解决方案

## 问题现象

启动应用后，浏览器控制台出现以下错误：

```
GET http://localhost:3001/ 404 (Not Found)
application 'dashboard-app' died in status LOADING_SOURCE_CODE
You need to export lifecycle functions in dashboard-app entry
```

## 问题原因

你的系统设置了 HTTP 代理环境变量（`http_proxy=http://127.0.0.1:7890`），这个代理会拦截所有 HTTP 请求，包括对本地 localhost 的请求。

当主应用尝试通过 qiankun 加载子应用时，请求会被代理拦截并返回 502 Bad Gateway，导致子应用无法加载。

## 解决方案

### 方案 1：使用提供的启动脚本（推荐）

项目已经提供了自动处理代理问题的脚本：

```bash
# 使用 Makefile（推荐）
make dev

# 或直接使用脚本
./dev.sh
```

这些命令会自动禁用代理并设置 `no_proxy`，确保本地开发服务器正常工作。

### 方案 2：手动设置 no_proxy 环境变量

在启动应用前设置 `no_proxy`：

```bash
# 临时设置（仅当前终端会话）
export no_proxy=localhost,127.0.0.1,::1
export NO_PROXY=localhost,127.0.0.1,::1

# 然后启动应用
pnpm dev
```

### 方案 3：临时禁用代理

```bash
# 临时禁用代理（仅当前终端会话）
unset http_proxy
unset https_proxy
unset HTTP_PROXY
unset HTTPS_PROXY

# 启动应用
pnpm dev
```

### 方案 4：永久配置 no_proxy（推荐用于长期开发）

在你的 shell 配置文件中添加 `no_proxy` 设置：

**对于 zsh（macOS 默认）：**

编辑 `~/.zshrc`：

```bash
# 在文件末尾添加
export no_proxy="localhost,127.0.0.1,::1"
export NO_PROXY="localhost,127.0.0.1,::1"
```

然后重新加载配置：

```bash
source ~/.zshrc
```

**对于 bash：**

编辑 `~/.bashrc` 或 `~/.bash_profile`：

```bash
# 在文件末尾添加
export no_proxy="localhost,127.0.0.1,::1"
export NO_PROXY="localhost,127.0.0.1,::1"
```

然后重新加载配置：

```bash
source ~/.bashrc
```

## 验证方案是否有效

### 1. 检查环境变量

```bash
echo $http_proxy
echo $no_proxy
```

理想情况下，`no_proxy` 应该包含 `localhost,127.0.0.1`。

### 2. 测试本地连接

```bash
# 测试子应用是否可访问
curl http://localhost:3001/

# 应该返回 HTML 内容，而不是 502 错误
```

### 3. 检查应用状态

```bash
make status
```

所有应用应该都显示为运行中。

## 技术细节

### 为什么会出现这个问题？

1. **代理拦截**：系统设置的 `http_proxy` 会拦截所有 HTTP 请求
2. **本地请求**：qiankun 主应用尝试加载 `http://localhost:3001/` 等本地地址
3. **代理失败**：代理服务器无法处理对 localhost 的请求，返回 502
4. **加载失败**：qiankun 无法获取子应用的入口 HTML，导致加载失败

### no_proxy 的作用

`no_proxy` 环境变量告诉系统哪些地址不应该通过代理访问。设置为 `localhost,127.0.0.1,::1` 后，所有对本地地址的请求都会直接连接，绕过代理。

### 项目提供的解决方案

- **dev.sh**：启动脚本，自动临时禁用代理
- **Makefile**：集成了启动脚本，使用 `make dev` 时自动处理代理问题
- **后台启动**：`make dev-bg` 也包含了代理禁用逻辑

## 常见问题

### Q1: 为什么不能直接使用 pnpm dev？

可以，但需要先设置 `no_proxy` 或禁用代理。使用 `make dev` 或 `./dev.sh` 更方便，它们会自动处理。

### Q2: 设置 no_proxy 会影响其他网络请求吗？

不会。`no_proxy` 只影响列表中的地址（localhost、127.0.0.1），其他地址仍然会使用代理。

### Q3: 我需要每次启动都设置吗？

- 使用 `make dev`：不需要，自动处理
- 使用 `pnpm dev`：需要先设置环境变量，或者将 `no_proxy` 添加到 shell 配置文件（方案 4）

### Q4: 生产环境需要处理吗？

不需要。这个问题只影响开发环境。生产环境中，子应用会被构建成静态文件，不存在这个问题。

## 推荐做法

1. **开发时**：使用 `make dev` 启动（已集成代理处理）
2. **长期开发**：在 shell 配置文件中永久设置 `no_proxy`（方案 4）
3. **CI/CD**：确保构建环境也设置了 `no_proxy`

## 相关文件

- `dev.sh` - 开发启动脚本
- `Makefile` - 包含 `make dev` 命令
- `.gitignore` - 已忽略临时文件

## 总结

这是一个环境配置问题，不是代码问题。通过正确配置 `no_proxy` 或使用提供的启动脚本，可以完全解决。

**最简单的解决方案：使用 `make dev` 启动应用** ✅
