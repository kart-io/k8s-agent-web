# 🚀 快速开始：Mock 模式切换

## 切换到 Mock 模式（使用演示数据）

```bash
# 1. 编辑环境配置文件
# apps/web-k8s/.env.development

VITE_USE_K8S_MOCK=true

# 2. 重启开发服务器
pnpm dev:k8s
```

✅ 现在前端将使用 mock 数据，无需后端服务

## 切换到真实 API 模式（连接后端）

```bash
# 1. 编辑环境配置文件
# apps/web-k8s/.env.development

VITE_USE_K8S_MOCK=false

# 2. 启动后端服务（另一个终端）
cd /path/to/cluster-service
go run cmd/server/main.go -config configs/config-local.yaml

# 3. 重启前端服务
pnpm dev:k8s
```

✅ 现在前端将连接到 `localhost:8082` 的真实 API

## 查看详细文档

完整配置和使用指南请查看：[K8S_API_MOCK_MODE_GUIDE.md](./K8S_API_MOCK_MODE_GUIDE.md)

## 常见问题

**Q: 如何确认当前使用的是哪种模式？**

A: 打开浏览器控制台（F12），如果看到 `[K8s Mock]` 日志，说明使用的是 mock 模式

**Q: 切换模式后没有生效？**

A: 必须重启开发服务器（Ctrl+C 然后重新 `pnpm dev:k8s`）

**Q: 可以只对某些 API 使用 mock 吗？**

A: 当前是全局切换，如需部分 mock，请查看详细文档的高级配置部分
