/**
 * 综合验证脚本 - 菜单管理页面样式检查
 *
 * 使用方法：
 * 1. 访问 http://localhost:3000/system/menus
 * 2. 打开浏览器控制台 (F12)
 * 3. 复制粘贴此脚本并执行
 */

console.clear()
console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║          菜单管理页面 - 综合样式验证报告                        ║')
console.log('╚════════════════════════════════════════════════════════════════╝')
console.log('')

let passCount = 0
let failCount = 0

// ==================== 第一部分：左侧菜单栏样式 ====================
console.log('📋 第一部分：左侧菜单栏样式检查')
console.log('─────────────────────────────────────────────────────────────')

// 1.1 检查菜单项
const menuItem = document.querySelector('.ant-menu-item')
if (menuItem) {
  const style = window.getComputedStyle(menuItem)

  console.log('1.1 菜单项基础样式:')

  // 高度
  const height = parseInt(style.height)
  if (height === 40) {
    console.log('  ✅ 高度: 40px')
    passCount++
  } else {
    console.log(`  ❌ 高度: ${style.height} (应该是 40px)`)
    failCount++
  }

  // 圆角
  const radius = parseInt(style.borderRadius)
  if (radius === 6) {
    console.log('  ✅ 圆角: 6px')
    passCount++
  } else {
    console.log(`  ❌ 圆角: ${style.borderRadius} (应该是 6px)`)
    failCount++
  }

  // Flex 布局
  if (style.display.includes('flex')) {
    console.log('  ✅ 布局: flex')
    passCount++
  } else {
    console.log(`  ❌ 布局: ${style.display} (应该包含 flex)`)
    failCount++
  }
} else {
  console.log('  ❌ 未找到菜单项元素')
  failCount += 3
}

console.log('')

// 1.2 检查图标
const icon = document.querySelector('.ant-menu-item .anticon, .ant-menu-submenu-title .anticon')
if (icon) {
  const style = window.getComputedStyle(icon)

  console.log('1.2 菜单图标样式:')

  // 字体大小
  const fontSize = parseInt(style.fontSize)
  if (fontSize === 18) {
    console.log('  ✅ 图标大小: 18px')
    passCount++
  } else {
    console.log(`  ❌ 图标大小: ${style.fontSize} (应该是 18px)`)
    failCount++
  }

  // 右边距
  const marginRight = parseInt(style.marginRight)
  if (marginRight === 12) {
    console.log('  ✅ 图标间距: 12px')
    passCount++
  } else {
    console.log(`  ❌ 图标间距: ${style.marginRight} (应该是 12px)`)
    failCount++
  }

  // 宽度
  const width = parseInt(style.width)
  if (width === 20) {
    console.log('  ✅ 图标宽度: 20px')
    passCount++
  } else {
    console.log(`  ❌ 图标宽度: ${style.width} (应该是 20px)`)
    failCount++
  }
} else {
  console.log('  ❌ 未找到菜单图标元素')
  failCount += 3
}

console.log('')

// 1.3 检查过渡动画
if (menuItem) {
  const transition = window.getComputedStyle(menuItem).transition

  console.log('1.3 动画效果:')

  if (transition.includes('0.3s') || transition.includes('300ms')) {
    console.log('  ✅ 过渡时间: 0.3s')
    passCount++
  } else {
    console.log(`  ⚠️  过渡时间: ${transition} (应包含 0.3s)`)
    failCount++
  }

  if (transition.includes('cubic-bezier')) {
    console.log('  ✅ 缓动函数: cubic-bezier')
    passCount++
  } else {
    console.log('  ⚠️  缓动函数: 未使用自定义缓动')
    failCount++
  }
}

console.log('')
console.log('')

// ==================== 第二部分：表格树形图标 ====================
console.log('📋 第二部分：表格树形展开图标检查')
console.log('─────────────────────────────────────────────────────────────')

// 2.1 检查树形按钮
const treeBtn = document.querySelector('.vxe-cell--tree-btn, [class*="tree"][class*="btn"]')
if (treeBtn) {
  console.log('2.1 树形展开按钮:')
  console.log('  ✅ 找到展开按钮元素')
  console.log('  Class:', treeBtn.className)
  passCount++

  // 检查伪元素内容
  const before = window.getComputedStyle(treeBtn, '::before')
  const content = before.content.replace(/['"]/g, '')

  if (content === '▶' || content === '▼') {
    console.log(`  ✅ 图标内容: ${content} (实心三角形)`)
    passCount++
  } else {
    console.log(`  ❌ 图标内容: ${before.content} (应该是 ▶ 或 ▼)`)
    failCount++
  }

  // 检查图标颜色
  const color = before.color
  console.log(`  ℹ️  图标颜色: ${color}`)

} else {
  console.log('2.1 树形展开按钮:')
  console.log('  ⚠️  未找到树形按钮（可能需要有父子关系的数据）')
  console.log('  💡 提示: 确保有 type=directory 的菜单项')
}

console.log('')

// 2.2 检查表格样式
const table = document.querySelector('.vxe-table')
if (table) {
  console.log('2.2 表格元素:')
  console.log('  ✅ 找到 VXE Table 元素')
  passCount++

  // 检查是否有分页器
  const pager = document.querySelector('.vxe-custom-pager, .vxe-pager')
  if (!pager || pager.style.display === 'none') {
    console.log('  ✅ 分页已禁用（树形表格正确配置）')
    passCount++
  } else {
    console.log('  ❌ 分页未禁用（树形表格需要禁用分页）')
    failCount++
  }
} else {
  console.log('2.2 表格元素:')
  console.log('  ❌ 未找到 VXE Table 元素')
  failCount += 2
}

console.log('')

// 2.3 检查样式文件加载
console.log('2.3 样式文件加载:')
const styles = Array.from(document.styleSheets)

// 检查树形图标样式
const treeIconStyle = styles.some(s => {
  try {
    return s.href?.includes('vxe-table-tree-icon') ||
           Array.from(s.cssRules || []).some(r =>
             r.cssText?.includes('vxe-cell--tree-btn') &&
             r.cssText?.includes('content')
           )
  } catch (e) {
    return false
  }
})

if (treeIconStyle) {
  console.log('  ✅ 树形图标样式已加载')
  passCount++
} else {
  console.log('  ⚠️  树形图标样式可能未加载')
  failCount++
}

// 检查 VbenLayout 样式
const vbenStyle = styles.some(s => {
  try {
    return s.href?.includes('VbenLayout') ||
           Array.from(s.cssRules || []).some(r =>
             r.cssText?.includes('ant-menu-item') &&
             r.cssText?.includes('18px')
           )
  } catch (e) {
    return false
  }
})

if (vbenStyle) {
  console.log('  ✅ VbenLayout 样式已加载')
  passCount++
} else {
  console.log('  ⚠️  VbenLayout 样式可能未加载')
  failCount++
}

console.log('')
console.log('')

// ==================== 第三部分：Mock 数据检查 ====================
console.log('📋 第三部分：Mock 数据检查')
console.log('─────────────────────────────────────────────────────────────')

// 检查是否有菜单数据
const tableRows = document.querySelectorAll('.vxe-body--row')
console.log('3.1 表格数据:')
console.log(`  ℹ️  当前显示行数: ${tableRows.length}`)

if (tableRows.length >= 6) {
  console.log('  ✅ 数据已加载（至少6条）')
  passCount++
} else if (tableRows.length > 0) {
  console.log('  ⚠️  数据较少，可能不完整')
  failCount++
} else {
  console.log('  ❌ 未找到数据行')
  failCount++
}

// 检查是否有父子关系的数据
const hasTreeIcon = document.querySelector('.vxe-cell--tree-btn, [class*="tree"][class*="btn"]')
console.log('3.2 树形结构:')
if (hasTreeIcon) {
  console.log('  ✅ 存在树形结构（有展开按钮）')
  passCount++
} else {
  console.log('  ⚠️  未检测到树形结构')
  console.log('  💡 可能原因:')
  console.log('     - Mock 数据中没有 parentId 字段')
  console.log('     - 没有 type=directory 的菜单项')
}

console.log('')
console.log('')

// ==================== 总结 ====================
console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║                        验证结果统计                              ║')
console.log('╚════════════════════════════════════════════════════════════════╝')
console.log('')
console.log(`  ✅ 通过项: ${passCount}`)
console.log(`  ❌ 失败项: ${failCount}`)
console.log(`  📊 通过率: ${Math.round(passCount / (passCount + failCount) * 100)}%`)
console.log('')

if (failCount === 0) {
  console.log('🎉 恭喜！所有样式优化已成功应用！')
  console.log('')
  console.log('✨ 优化效果：')
  console.log('  • 左侧菜单图标更大更清晰（18px）')
  console.log('  • 菜单项更宽松舒适（40px 高度）')
  console.log('  • 悬停时有平滑的动画效果')
  console.log('  • 表格树形图标显示为实心三角形')
  console.log('  • 树形表格禁用分页，正确显示层级')
} else if (failCount <= 3) {
  console.log('⚠️  大部分样式已应用，但有些许问题')
  console.log('')
  console.log('💡 建议：')
  console.log('  1. 强制刷新浏览器 (Ctrl+Shift+R)')
  console.log('  2. 清除浏览器缓存')
  console.log('  3. 检查 Network 面板，确认样式文件已加载')
} else {
  console.log('❌ 样式未正确应用，需要排查')
  console.log('')
  console.log('🔍 排查步骤：')
  console.log('  1. 检查开发服务器是否正常运行')
  console.log('  2. 检查 shared library 是否已重新构建')
  console.log('  3. 清除 Vite 缓存并重启服务')
  console.log('  4. 在 Network 面板检查样式文件是否加载')
  console.log('')
  console.log('📝 执行以下命令重新构建：')
  console.log('  cd shared && pnpm build')
  console.log('  make kill && make dev')
}

console.log('')
console.log('─────────────────────────────────────────────────────────────')
console.log('💬 如需帮助，请将此报告截图发送给开发者')
console.log('─────────────────────────────────────────────────────────────')
console.log('')

// 返回验证结果对象
const result = {
  passed: passCount,
  failed: failCount,
  total: passCount + failCount,
  success: failCount === 0
}

console.log('验证结果已保存到 window.verificationResult')
window.verificationResult = result

// 如果有失败项，提供手动测试按钮
if (failCount > 0) {
  console.log('')
  console.log('🧪 手动测试悬停效果：')
  console.log('执行以下命令测试菜单悬停动画：')
  console.log('')
  console.log('const menuItem = document.querySelector(".ant-menu-item")')
  console.log('menuItem.dispatchEvent(new MouseEvent("mouseenter"))')
  console.log('// 观察菜单是否向右移动、图标是否放大')
  console.log('')
}
