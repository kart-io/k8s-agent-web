#!/bin/bash

echo "🔍 诊断 Bootstrap 超时问题"
echo "================================================"
echo ""

# 1. 检查所有应用是否运行
echo "1️⃣  检查应用运行状态..."
make status
echo ""

# 2. 检查代码是否已修复
echo "2️⃣  检查代码修复状态..."
for app in dashboard-app agent-app cluster-app monitor-app system-app; do
    if grep -q "function configureVXETable" "$app/src/main.js" 2>/dev/null; then
        echo "  ✅ $app - 代码已修复"
    else
        echo "  ❌ $app - 代码未修复或文件不存在"
    fi
done
echo ""

# 3. 检查服务器是否返回新代码
echo "3️⃣  检查服务器返回的代码..."
for port in 3001 3002 3003 3004 3005; do
    app_name=""
    case $port in
        3001) app_name="dashboard-app" ;;
        3002) app_name="agent-app" ;;
        3003) app_name="cluster-app" ;;
        3004) app_name="monitor-app" ;;
        3005) app_name="system-app" ;;
    esac

    if curl -s --noproxy localhost "http://localhost:$port/src/main.js" 2>&1 | grep -q "configureVXETable"; then
        echo "  ✅ $app_name (port $port) - 返回新代码"
    else
        echo "  ❌ $app_name (port $port) - 返回旧代码或无响应"
    fi
done
echo ""

# 4. 检查进程启动时间
echo "4️⃣  检查进程启动时间（应该是最近才启动）..."
ps aux | grep -E "vite.*(dashboard|agent|cluster|monitor|system)-app" | grep -v grep | awk '{print "  " $2, $9, $11, $12, $13, $14}'
echo ""

# 5. 提供下一步建议
echo "================================================"
echo "📋 诊断结果"
echo "================================================"
echo ""
echo "如果所有检查都通过（✅）但浏览器仍显示错误："
echo ""
echo "👉 这是浏览器缓存问题！"
echo ""
echo "解决方案："
echo "  1. 打开浏览器开发者工具 (F12)"
echo "  2. Network 标签 → 勾选 'Disable cache'"
echo "  3. 硬刷新: Cmd+Shift+R (macOS) 或 Ctrl+Shift+R (Windows)"
echo ""
echo "或者："
echo "  使用隐私模式测试: Cmd/Ctrl+Shift+N"
echo ""
echo "如果有 ❌ 标记："
echo "  1. 代码未修复 → 检查文件是否正确保存"
echo "  2. 返回旧代码 → 需要重启服务: make restart"
echo "  3. 进程时间不对 → 服务未重启或重启失败"
echo ""
