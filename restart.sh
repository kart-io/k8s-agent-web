#!/bin/bash

# K8s Agent Web - 重启脚本
# 用于在修改入口文件后快速重启所有服务

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              K8s Agent Web - 服务重启                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. 停止所有服务
echo "🛑 停止所有服务..."
make kill
echo ""

# 等待进程完全停止
sleep 2

# 2. 验证所有端口已释放
echo "🔍 验证端口状态..."
for port in 3000 3001 3002 3003 3004 3005 3006; do
  if lsof -ti:$port > /dev/null 2>&1; then
    echo "  ⚠️  端口 $port 仍被占用，再次尝试清理..."
    lsof -ti:$port | xargs kill -9 2>/dev/null
  fi
done
echo "  ✅ 所有端口已释放"
echo ""

# 3. 重新启动
echo "🚀 重新启动所有服务..."
echo ""
echo "提示："
echo "  - 启动需要 10-30 秒"
echo "  - 启动后访问 http://localhost:3000"
echo "  - 按 Ctrl+C 可停止服务"
echo ""

# 启动服务
make dev
