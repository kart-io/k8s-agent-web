#!/bin/bash

echo "======================================"
echo "树形表格修复验证脚本"
echo "======================================"
echo ""

# 1. 检查 shared library 构建状态
echo "1. 检查 shared library 是否已构建..."
if [ -f "shared/dist/components/vxe-table/VxeBasicTable.vue.js" ]; then
  echo "   ✅ VxeBasicTable.vue.js 已构建"
  SIZE=$(stat -f%z "shared/dist/components/vxe-table/VxeBasicTable.vue.js" 2>/dev/null || stat -c%s "shared/dist/components/vxe-table/VxeBasicTable.vue.js" 2>/dev/null)
  echo "   📦 文件大小: $SIZE 字节"

  # 检查是否包含 tree-config
  if grep -q "tree-config" "shared/dist/components/vxe-table/VxeBasicTable.vue.js"; then
    echo "   ✅ 包含 tree-config 配置"
  else
    echo "   ❌ 未找到 tree-config 配置（需要重新构建）"
  fi
else
  echo "   ❌ VxeBasicTable.vue.js 未构建"
  echo "   💡 运行: cd shared && pnpm build"
fi
echo ""

# 2. 检查 MenuList.vue 是否禁用分页
echo "2. 检查 MenuList.vue 分页配置..."
if grep -q ":show-pager=\"false\"" "system-app/src/views/MenuList.vue"; then
  echo "   ✅ 已禁用分页 (:show-pager=\"false\")"
else
  echo "   ❌ 未禁用分页"
  echo "   💡 需要在 VxeBasicTable 组件中添加 :show-pager=\"false\""
fi
echo ""

# 3. 检查源代码修改
echo "3. 检查 VxeBasicTable.vue 源代码..."
if grep -q ":tree-config=\"treeConfig\"" "shared/src/components/vxe-table/VxeBasicTable.vue"; then
  echo "   ✅ 模板中已添加 :tree-config 绑定"
else
  echo "   ❌ 模板中缺少 :tree-config 绑定"
fi

if grep -q "const treeConfig = computed" "shared/src/components/vxe-table/VxeBasicTable.vue"; then
  echo "   ✅ 已添加 treeConfig computed 属性"
else
  echo "   ❌ 缺少 treeConfig computed 属性"
fi
echo ""

# 4. 检查开发服务器状态
echo "4. 检查开发服务器状态..."
MAIN_APP_RUNNING=$(lsof -ti:3000 2>/dev/null)
SYSTEM_APP_RUNNING=$(lsof -ti:3005 2>/dev/null)

if [ -n "$MAIN_APP_RUNNING" ]; then
  echo "   ✅ Main App 正在运行 (端口 3000, PID: $MAIN_APP_RUNNING)"
else
  echo "   ❌ Main App 未运行"
fi

if [ -n "$SYSTEM_APP_RUNNING" ]; then
  echo "   ✅ System App 正在运行 (端口 3005, PID: $SYSTEM_APP_RUNNING)"
else
  echo "   ❌ System App 未运行"
fi
echo ""

# 5. 检查 Mock 数据结构
echo "5. 检查 Mock 数据结构..."
MENU_WITH_PARENT=$(grep -A 2 "id: 3," system-app/src/mock/index.js | grep "parentId: 2")
if [ -n "$MENU_WITH_PARENT" ]; then
  echo "   ✅ Mock 数据包含正确的父子关系"
else
  echo "   ❌ Mock 数据结构可能有问题"
fi
echo ""

# 6. 给出建议
echo "======================================"
echo "修复建议："
echo "======================================"

if [ ! -f "shared/dist/components/vxe-table/VxeBasicTable.vue.js" ] || ! grep -q "tree-config" "shared/dist/components/vxe-table/VxeBasicTable.vue.js"; then
  echo "📌 1. 重新构建 shared library:"
  echo "   cd shared && pnpm build && cd .."
fi

if [ -n "$MAIN_APP_RUNNING" ] || [ -n "$SYSTEM_APP_RUNNING" ]; then
  echo "📌 2. 重启开发服务器:"
  echo "   make restart"
  echo "   或"
  echo "   make kill && make dev"
else
  echo "📌 2. 启动开发服务器:"
  echo "   make dev"
fi

echo "📌 3. 清除浏览器缓存:"
echo "   在浏览器中按 Ctrl+Shift+R (或 Cmd+Shift+R)"
echo ""

echo "📌 4. 验证修复:"
echo "   访问: http://localhost:3000/system/menus"
echo "   期望看到: 'Agent管理' 和 '系统管理' 前面有 ▶ 展开图标"
echo ""
