#!/bin/bash

# 验证所有子应用的生命周期函数是否已正确修复

echo "🔍 检查所有子应用的 bootstrap 函数..."
echo ""

apps=("dashboard-app" "agent-app" "cluster-app" "monitor-app" "system-app" "image-build-app")
all_ok=true

for app in "${apps[@]}"; do
    if [ -f "$app/src/main.js" ]; then
        if grep -q "async bootstrap()" "$app/src/main.js"; then
            echo "  ✅ $app - bootstrap 函数已更新为 async"
        else
            echo "  ❌ $app - bootstrap 函数未找到或未更新"
            all_ok=false
        fi
    else
        echo "  ⚠️  $app/src/main.js 不存在"
        all_ok=false
    fi
done

echo ""

if [ "$all_ok" = true ]; then
    echo "✅ 所有应用的代码都已正确修复！"
    echo ""
    echo "如果浏览器仍显示错误，请尝试："
    echo ""
    echo "1. 硬刷新浏览器:"
    echo "   macOS: Cmd + Shift + R"
    echo "   Windows/Linux: Ctrl + Shift + R"
    echo ""
    echo "2. 清除浏览器缓存:"
    echo "   Chrome: F12 -> Application -> Clear storage -> Clear site data"
    echo ""
    echo "3. 使用隐私模式测试:"
    echo "   Chrome: Cmd/Ctrl + Shift + N"
    echo ""
    echo "4. 检查网络请求:"
    echo "   F12 -> Network -> 查看子应用的 main.js 是否返回新代码"
    echo ""
else
    echo "❌ 发现问题，请检查上述文件"
fi
