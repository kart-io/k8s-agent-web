#!/bin/bash

# K8s Agent Web - 开发服务器启动脚本
# 此脚本临时禁用 HTTP 代理以避免本地开发服务器连接问题

echo "🚀 启动 K8s Agent Web 开发服务器"
echo ""

# 保存当前代理设置
OLD_HTTP_PROXY=$http_proxy
OLD_HTTPS_PROXY=$https_proxy
OLD_HTTP_PROXY_UPPER=$HTTP_PROXY
OLD_HTTPS_PROXY_UPPER=$HTTPS_PROXY
OLD_NO_PROXY=$no_proxy
OLD_NO_PROXY_UPPER=$NO_PROXY

# 临时禁用代理（仅对本次会话）
unset http_proxy
unset https_proxy
unset HTTP_PROXY
unset HTTPS_PROXY

# 设置不使用代理的地址
export no_proxy="localhost,127.0.0.1,::1"
export NO_PROXY="localhost,127.0.0.1,::1"

echo "✅ 已临时禁用 HTTP 代理（仅本次会话）"
echo "📝 no_proxy 设置为: $no_proxy"
echo ""

# 运行 pnpm dev
pnpm dev

# 脚本结束后恢复代理设置（虽然通常不会执行到这里，因为 pnpm dev 会保持运行）
export http_proxy=$OLD_HTTP_PROXY
export https_proxy=$OLD_HTTPS_PROXY
export HTTP_PROXY=$OLD_HTTP_PROXY_UPPER
export HTTPS_PROXY=$OLD_HTTPS_PROXY_UPPER
export no_proxy=$OLD_NO_PROXY
export NO_PROXY=$OLD_NO_PROXY_UPPER
