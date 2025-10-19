#!/bin/bash

# API 代理配置验证脚本
# 用于测试前端是否正确代理到 cluster-service

echo "======================================"
echo "API 代理配置验证"
echo "======================================"
echo ""

# 检查 cluster-service 是否运行
echo "1. 检查 cluster-service (端口 8082)..."
if curl -s http://localhost:8082/health > /dev/null 2>&1; then
    echo "   ✅ cluster-service 运行正常"
else
    echo "   ❌ cluster-service 未运行"
    echo "   启动命令: cd k8s-agent/cluster-service && go run cmd/server/main.go -config configs/config-local.yaml"
    exit 1
fi

# 测试 cluster-service 的 K8s API
echo ""
echo "2. 测试 cluster-service K8s API..."
RESPONSE=$(curl -s http://localhost:8082/api/k8s/clusters)
if [ $? -eq 0 ]; then
    echo "   ✅ K8s API 响应成功"
    echo "   响应示例: ${RESPONSE:0:100}..."
else
    echo "   ❌ K8s API 请求失败"
    exit 1
fi

# 检查 backend-mock 是否运行
echo ""
echo "3. 检查 backend-mock (端口 5320)..."
if curl -s http://localhost:5320/api/auth/codes > /dev/null 2>&1; then
    echo "   ✅ backend-mock 运行正常"
else
    echo "   ⚠️  backend-mock 未运行 (登录功能将不可用)"
    echo "   启动命令: pnpm -F @vben/backend-mock run start"
fi

# 检查前端开发服务器
echo ""
echo "4. 检查前端开发服务器 (端口 5668)..."
if curl -s http://localhost:5668 > /dev/null 2>&1; then
    echo "   ✅ 前端服务器运行正常"
else
    echo "   ❌ 前端服务器未运行"
    echo "   启动命令: pnpm dev:k8s"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ 所有服务运行正常!"
echo "======================================"
echo ""
echo "测试建议:"
echo "1. 打开浏览器: http://localhost:5668"
echo "2. 打开开发者工具 (F12) -> Network 标签"
echo "3. 访问集群列表页面"
echo "4. 检查 /api/k8s/clusters 请求:"
echo "   - 远程地址应显示: localhost:8082"
echo "   - 响应应来自 cluster-service (非 mock)"
echo ""
echo "如果仍然显示 mock 数据,请:"
echo "1. 停止前端服务器 (Ctrl+C)"
echo "2. 重新启动: pnpm dev:k8s"
echo ""
