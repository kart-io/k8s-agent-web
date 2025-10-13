# 启动 K8s 独立应用

## 快速启动指南

### 方式一：同时启动主应用（推荐用于开发）

主应用包含了 Mock 服务，所以最简单的方式是：

```bash
# 终端 1: 启动主应用（包含 Mock 服务）
make dev-antd
# 或
pnpm dev:antd

# 终端 2: 启动 K8s 独立应用
make dev-k8s
# 或
pnpm dev:k8s
```

然后访问：
- 主应用：http://localhost:5666
- K8s 应用：http://localhost:5667

### 方式二：仅启动 K8s 应用（需要后端 API）

如果你有真实的后端 API：

1. 修改 `apps/web-k8s/.env.development`:
```bash
VITE_GLOB_API_URL=http://your-backend-api:3000/api
VITE_NITRO_MOCK=false
```

2. 启动应用:
```bash
make dev-k8s
```

### 方式三：使用独立的 Mock 服务

如果想要完全独立运行（不依赖主应用）：

1. 确保 Mock 服务运行在 5320 端口（已配置）

2. 启动 K8s 应用:
```bash
cd apps/web-k8s
pnpm dev
```

## 当前配置

```
K8s 应用端口: 5667
Mock API 代理: localhost:5320
主应用端口: 5666 (可选)
```

## 故障排查

### 问题 1: API 请求失败

**原因**: Mock 服务未启动

**解决**:
```bash
# 启动主应用（包含 Mock 服务）
make dev-antd
```

### 问题 2: 端口被占用

**检查端口占用**:
```bash
lsof -i :5667
```

**更换端口**:
修改 `apps/web-k8s/.env.development` 中的 `VITE_PORT`

### 问题 3: 依赖错误

**重新安装依赖**:
```bash
pnpm install
```

## 功能验证

启动后访问 http://localhost:5667，你应该能看到：

1. ✅ 顶部导航栏（K8s Management Platform）
2. ✅ 左侧菜单（集群管理、Pod 管理等）
3. ✅ 集群列表页面（包含 Mock 数据）
4. ✅ 可以添加/编辑/删除集群
5. ✅ 用户下拉菜单和登出功能

## 认证说明

K8s 应用与主应用共享认证状态：

### 首次访问

1. 访问 http://localhost:5667
2. 如果未登录，自动重定向到主应用登录页
3. 在主应用登录（用户名: vben, 密码: 123456）
4. 登录成功后自动跳回 K8s 应用

### 登出操作

1. 点击右上角用户名下拉菜单
2. 选择"退出登录"
3. 自动重定向到主应用登录页

### Token 共享

- 两个应用共享 localStorage 中的 token
- Token 键名: `vben_access_token`
- 用户信息键名: `vben_user_info`

详细认证文档: [K8S_AUTHENTICATION_GUIDE.md](K8S_AUTHENTICATION_GUIDE.md)

## 生产部署

```bash
# 构建
make build-k8s

# 产物在
apps/web-k8s/dist/

# 部署到 Nginx
cp -r apps/web-k8s/dist/* /var/www/k8s-management/
```

## 下一步

1. **完善其他页面** - 参考集群管理页面实现其他资源的管理
2. **连接真实 API** - 替换 Mock 服务为真实的 K8s API
3. **添加认证** - 实现登录和权限控制
4. **优化 UI** - 改进用户体验

## 文档链接

- [应用 README](apps/web-k8s/README.md)
- [功能开发指南](K8S_FEATURE_GUIDE.md)
- [架构指南](K8S_STANDALONE_SERVICE_GUIDE.md)
