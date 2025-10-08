#!/bin/bash

# Web 项目一键安装脚本

set -e

echo "================================"
echo "K8s Agent Web 项目安装脚本"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js (>= 16)"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "错误: Node.js 版本过低，需要 >= 16，当前版本: $(node -v)"
    exit 1
fi

echo "✓ Node.js 版本检查通过: $(node -v)"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "未找到 pnpm，正在安装..."
    npm install -g pnpm
fi

echo "✓ pnpm 版本: $(pnpm -v)"

echo ""
echo "开始安装依赖..."
echo ""

# 安装主应用依赖
echo "[1/6] 安装主应用 (main-app) 依赖..."
cd main-app && pnpm install && cd ..

# 安装 dashboard-app 依赖
echo "[2/6] 安装 dashboard-app 依赖..."
cd dashboard-app && pnpm install && cd ..

# 安装 agent-app 依赖
echo "[3/6] 安装 agent-app 依赖..."
cd agent-app && pnpm install && cd ..

# 安装 cluster-app 依赖
echo "[4/6] 安装 cluster-app 依赖..."
cd cluster-app && pnpm install && cd ..

# 安装 monitor-app 依赖
echo "[5/6] 安装 monitor-app 依赖..."
cd monitor-app && pnpm install && cd ..

# 安装 system-app 依赖
echo "[6/6] 安装 system-app 依赖..."
cd system-app && pnpm install && cd ..

echo ""
echo "================================"
echo "✓ 所有依赖安装完成！"
echo "================================"
echo ""
echo "下一步："
echo "  1. 运行 'pnpm dev' 启动所有应用"
echo "  2. 在浏览器中访问 http://localhost:3000"
echo "  3. 使用默认账号登录: admin / admin123"
echo ""
echo "详细文档请参考: QUICK_START.md"
echo ""
