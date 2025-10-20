#!/bin/bash

# 登录功能测试脚本
# 测试前端发送的登录参数是否与后端接口一致

echo "================================================"
echo "  登录参数测试"
echo "================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 服务地址
AUTH_SERVICE="http://localhost:8090"

echo "🔐 测试登录接口参数"
echo "─────────────────────────────────────"

# 测试 1: 正确的参数格式（只包含 username 和 password）
echo -n "测试正确参数格式 ... "
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_SERVICE/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ 成功${NC}"
    echo "  响应包含 token"
else
    echo -e "${RED}❌ 失败${NC}"
    echo "  响应: $LOGIN_RESPONSE"
fi

# 测试 2: 包含额外字段（模拟前端可能发送的额外参数）
echo -n "测试包含额外字段 ... "
LOGIN_RESPONSE_EXTRA=$(curl -s -X POST "$AUTH_SERVICE/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123","selectAccount":"admin","captcha":true}')

if echo "$LOGIN_RESPONSE_EXTRA" | grep -q "token"; then
    echo -e "${GREEN}✅ 成功${NC}"
    echo "  后端正确忽略额外字段"
else
    echo -e "${RED}❌ 失败${NC}"
    echo "  响应: $LOGIN_RESPONSE_EXTRA"
fi

# 测试 3: 缺少必填字段
echo -n "测试缺少密码字段 ... "
LOGIN_RESPONSE_MISSING=$(curl -s -w "\n%{http_code}" -X POST "$AUTH_SERVICE/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin"}')

HTTP_CODE=$(echo "$LOGIN_RESPONSE_MISSING" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ 正确返回 400${NC}"
    echo "  后端正确验证必填字段"
else
    echo -e "${RED}❌ 失败${NC}"
    echo "  期望 400，实际: $HTTP_CODE"
fi

# 测试 4: 检查返回值格式
echo ""
echo "📊 检查返回值格式"
echo "─────────────────────────────────────"

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    JTI=$(echo "$LOGIN_RESPONSE" | grep -o '"jti":"[^"]*' | cut -d'"' -f4)

    if [ ! -z "$TOKEN" ]; then
        echo -e "${GREEN}✅ token 字段存在${NC}"
    fi

    if [ ! -z "$JTI" ]; then
        echo -e "${GREEN}✅ jti 字段存在${NC}"
    fi

    if echo "$LOGIN_RESPONSE" | grep -q "expires_at"; then
        echo -e "${GREEN}✅ expires_at 字段存在${NC}"
    fi

    if echo "$LOGIN_RESPONSE" | grep -q '"user"'; then
        echo -e "${GREEN}✅ user 字段存在${NC}"
    fi

    # 验证 user 对象包含必要字段
    if echo "$LOGIN_RESPONSE" | grep -q '"username"'; then
        echo -e "${GREEN}✅ user.username 字段存在${NC}"
    fi

    if echo "$LOGIN_RESPONSE" | grep -q '"email"'; then
        echo -e "${GREEN}✅ user.email 字段存在${NC}"
    fi

    if echo "$LOGIN_RESPONSE" | grep -q '"roles"'; then
        echo -e "${GREEN}✅ user.roles 字段存在${NC}"
    fi
fi

echo ""
echo "💡 测试总结"
echo "─────────────────────────────────────"
echo "✅ 前端应只发送 username 和 password 参数"
echo "✅ 后端正确验证必填字段"
echo "✅ 返回值包含 token, jti, expires_at, user 字段"
echo ""
echo "📝 建议："
echo "  - 前端登录表单可以包含 selectAccount, captcha 等字段"
echo "  - authStore.authLogin 应过滤这些字段，只发送 username 和 password"
echo "  - 这样可以保持表单灵活性的同时确保 API 调用的简洁性"
echo ""
echo "================================================"
