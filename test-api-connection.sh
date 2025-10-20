#!/bin/bash

# API 连接测试脚本
# 用于验证 k8s-agent-web 与 auth-service 的连接

echo "================================================"
echo "  k8s-agent API 连接测试"
echo "================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 服务地址
AUTH_SERVICE="http://localhost:8090"
CLUSTER_SERVICE="http://localhost:8082"
MOCK_SERVICE="http://localhost:5320"
WEB_APP="http://localhost:5667"

# 测试函数
test_service() {
    local name=$1
    local url=$2

    echo -n "测试 $name ... "

    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 运行中${NC}"
        return 0
    else
        echo -e "${RED}❌ 未运行${NC}"
        return 1
    fi
}

# 测试 API 端点
test_api() {
    local name=$1
    local url=$2
    local expected_code=$3

    echo -n "测试 $name ... "

    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ 响应: $http_code${NC}"
        return 0
    else
        echo -e "${RED}❌ 响应: $http_code (期望: $expected_code)${NC}"
        return 1
    fi
}

echo "🔍 检查服务状态"
echo "─────────────────────────────────────"

# 检查 auth-service
test_service "auth-service    " "$AUTH_SERVICE/health"
AUTH_STATUS=$?

# 检查 cluster-service
test_service "cluster-service " "$CLUSTER_SERVICE/health"
CLUSTER_STATUS=$?

# 检查 mock-service
test_service "mock-service    " "$MOCK_SERVICE/api/status"
MOCK_STATUS=$?

# 检查 web-app
test_service "web-app (k8s)  " "$WEB_APP"
WEB_STATUS=$?

echo ""
echo "🧪 测试 API 端点"
echo "─────────────────────────────────────"

# 测试 auth-service 健康检查
test_api "健康检查        " "$AUTH_SERVICE/health" "200"

# 测试登录端点（期望 400，因为没有提供凭证）
test_api "登录端点        " "$AUTH_SERVICE/api/v1/auth/login" "400"

# 测试用户列表（期望 401，因为没有 token）
test_api "用户列表        " "$AUTH_SERVICE/api/v1/users" "401"

# 测试角色列表（期望 401）
test_api "角色列表        " "$AUTH_SERVICE/api/v1/roles" "401"

# 测试权限列表（期望 401）
test_api "权限列表        " "$AUTH_SERVICE/api/v1/permissions" "401"

echo ""
echo "🔐 测试完整登录流程"
echo "─────────────────────────────────────"

# 执行登录
echo -n "登录测试 (admin/admin123) ... "
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_SERVICE/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

# 检查是否成功
if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ 登录成功${NC}"

    # 提取 token
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

    if [ ! -z "$TOKEN" ]; then
        echo -e "${GREEN}Token: ${TOKEN:0:50}...${NC}"

        # 使用 token 测试受保护的端点
        echo ""
        echo "使用 Token 测试受保护端点:"
        echo "─────────────────────────────────────"

        # 测试获取当前用户信息
        echo -n "获取用户信息    ... "
        USER_INFO=$(curl -s -H "Authorization: Bearer $TOKEN" "$AUTH_SERVICE/api/v1/auth/me")
        if echo "$USER_INFO" | grep -q "username"; then
            echo -e "${GREEN}✅ 成功${NC}"
            echo "  用户: $(echo $USER_INFO | grep -o '"username":"[^"]*' | cut -d'"' -f4)"
        else
            echo -e "${RED}❌ 失败${NC}"
        fi

        # 测试获取用户列表
        echo -n "获取用户列表    ... "
        USERS=$(curl -s -H "Authorization: Bearer $TOKEN" "$AUTH_SERVICE/api/v1/users")
        if echo "$USERS" | grep -q "items"; then
            echo -e "${GREEN}✅ 成功${NC}"
        else
            echo -e "${RED}❌ 失败${NC}"
        fi

        # 测试获取角色列表
        echo -n "获取角色列表    ... "
        ROLES=$(curl -s -H "Authorization: Bearer $TOKEN" "$AUTH_SERVICE/api/v1/roles")
        if echo "$ROLES" | grep -q "items"; then
            echo -e "${GREEN}✅ 成功${NC}"
        else
            echo -e "${RED}❌ 失败${NC}"
        fi
    fi
else
    echo -e "${RED}❌ 登录失败${NC}"
    echo "响应: $LOGIN_RESPONSE"
fi

echo ""
echo "📊 测试总结"
echo "================================================"

TOTAL=0
SUCCESS=0

# 统计服务状态
if [ $AUTH_STATUS -eq 0 ]; then SUCCESS=$((SUCCESS+1)); fi
if [ $CLUSTER_STATUS -eq 0 ]; then SUCCESS=$((SUCCESS+1)); fi
if [ $MOCK_STATUS -eq 0 ]; then SUCCESS=$((SUCCESS+1)); fi
if [ $WEB_STATUS -eq 0 ]; then SUCCESS=$((SUCCESS+1)); fi
TOTAL=$((TOTAL+4))

echo "服务状态: $SUCCESS/$TOTAL 正常运行"

# 建议
echo ""
echo "💡 建议:"
echo "─────────────────────────────────────"

if [ $AUTH_STATUS -ne 0 ]; then
    echo -e "${YELLOW}⚠️  auth-service 未运行${NC}"
    echo "   启动命令: cd k8s-agent/auth-service && make run-local"
fi

if [ $WEB_STATUS -ne 0 ]; then
    echo -e "${YELLOW}⚠️  web-app 未运行${NC}"
    echo "   启动命令: cd k8s-agent-web && pnpm dev:k8s"
fi

if [ $CLUSTER_STATUS -ne 0 ]; then
    echo -e "${YELLOW}⚠️  cluster-service 未运行 (可选)${NC}"
    echo "   启动命令: cd k8s-agent/cluster-service && make run"
fi

if [ $MOCK_STATUS -ne 0 ]; then
    echo -e "${YELLOW}⚠️  mock-service 未运行 (可选)${NC}"
    echo "   启动命令: cd k8s-agent-web/apps/backend-mock && pnpm run start"
fi

echo ""
echo "================================================"
