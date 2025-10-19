#!/bin/bash

# Minikube 集群配置生成脚本
# 用于生成添加 minikube 集群所需的配置信息

echo "=========================================="
echo "Minikube 集群配置信息"
echo "=========================================="
echo ""

# 获取 minikube 状态
echo "1. 检查 minikube 状态..."
minikube status
echo ""

# 获取 minikube IP
echo "2. 获取 minikube IP 地址..."
MINIKUBE_IP=$(minikube ip)
echo "IP 地址: $MINIKUBE_IP"
echo ""

# 获取 API Server 地址
echo "3. 获取 API Server 地址..."
API_SERVER=$(kubectl config view --minify --context=minikube -o jsonpath='{.clusters[0].cluster.server}')
echo "API Server: $API_SERVER"
echo ""

# 获取 Kubernetes 版本
echo "4. 获取 Kubernetes 版本..."
K8S_VERSION=$(kubectl version --short --context=minikube 2>/dev/null | grep Server | awk '{print $3}')
echo "Kubernetes 版本: $K8S_VERSION"
echo ""

# 生成 KubeConfig
echo "5. 生成 KubeConfig..."
KUBECONFIG_CONTENT=$(kubectl config view --minify --flatten --context=minikube)
echo "KubeConfig 已生成"
echo ""

# 保存到文件
KUBECONFIG_FILE="minikube-kubeconfig.yaml"
echo "$KUBECONFIG_CONTENT" > "$KUBECONFIG_FILE"
echo "KubeConfig 已保存到: $KUBECONFIG_FILE"
echo ""

# 生成 JSON 格式的请求数据
echo "6. 生成 API 请求数据..."
cat > minikube-cluster-request.json <<EOF
{
  "name": "minikube-local",
  "description": "本地 Minikube 开发集群",
  "endpoint": "$API_SERVER",
  "kubeconfig": $(echo "$KUBECONFIG_CONTENT" | jq -Rs .),
  "region": "local",
  "provider": "minikube",
  "labels": {
    "env": "development",
    "type": "minikube",
    "location": "local"
  }
}
EOF

echo "API 请求数据已保存到: minikube-cluster-request.json"
echo ""

echo "=========================================="
echo "集群添加信息摘要"
echo "=========================================="
echo "集群名称: minikube-local"
echo "API Server: $API_SERVER"
echo "IP 地址: $MINIKUBE_IP"
echo "K8s 版本: $K8S_VERSION"
echo "区域: local"
echo "云服务商: minikube"
echo ""
echo "=========================================="
echo "使用方法"
echo "=========================================="
echo "1. 在 Web UI 中打开集群添加页面"
echo "2. 填写以下信息："
echo "   - 集群名称: minikube-local"
echo "   - 描述: 本地 Minikube 开发集群"
echo "   - API Server: $API_SERVER"
echo "   - KubeConfig: 复制 $KUBECONFIG_FILE 的内容"
echo "   - 区域: local"
echo "   - 云服务商: minikube"
echo "   - 标签: env=development, type=minikube, location=local"
echo ""
echo "或者使用 curl 直接提交："
echo "curl -X POST http://localhost:5668/api/k8s/clusters \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d @minikube-cluster-request.json"
echo ""
