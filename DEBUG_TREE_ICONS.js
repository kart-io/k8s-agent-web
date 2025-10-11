/**
 * VXE Table 树形图标调试脚本
 *
 * 使用方法：
 * 1. 访问 http://localhost:3000/system/menus
 * 2. 打开浏览器控制台 (F12)
 * 3. 复制粘贴此脚本并执行
 */

console.clear()
console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║            VXE Table 树形图标调试报告                           ║')
console.log('╚════════════════════════════════════════════════════════════════╝')
console.log('')

let issueCount = 0
const issues = []
const fixes = []

// ==================== 1. 检查表格元素 ====================
console.log('📋 第一部分：表格元素检查')
console.log('─────────────────────────────────────────────────────────────')

const table = document.querySelector('.vxe-table')
if (table) {
  console.log('✅ 找到 VXE Table 元素')
  console.log('   Class:', table.className)
} else {
  console.log('❌ 未找到 VXE Table 元素')
  issues.push('表格未加载')
  issueCount++
}

console.log('')

// ==================== 2. 检查树形按钮 ====================
console.log('📋 第二部分：树形按钮元素检查')
console.log('─────────────────────────────────────────────────────────────')

// 尝试多种可能的选择器
const selectors = [
  '.vxe-cell--tree-btn',
  '.vxe-tree--btn-wrapper',
  '.vxe-tree-btn',
  '[class*="vxe"][class*="tree"][class*="btn"]',
  '.vxe-table--tree-node-btn',
  '.vxe-tree-cell button',
  '.vxe-tree-cell .vxe-tree--btn'
]

console.log('尝试以下选择器:')
let foundButton = null
selectors.forEach(selector => {
  const elements = document.querySelectorAll(selector)
  if (elements.length > 0) {
    console.log(`  ✅ ${selector} (找到 ${elements.length} 个)`)
    if (!foundButton) foundButton = elements[0]
    console.log(`     第一个元素的完整类名: ${elements[0].className}`)
  } else {
    console.log(`  ❌ ${selector} (未找到)`)
  }
})

console.log('')

if (!foundButton) {
  console.log('⚠️  未找到任何树形按钮元素')
  console.log('')
  console.log('尝试查找表格中所有可能的按钮:')

  const allButtons = document.querySelectorAll('.vxe-table button, .vxe-table [role="button"]')
  console.log(`找到 ${allButtons.length} 个按钮元素:`)

  allButtons.forEach((btn, idx) => {
    if (idx < 5) { // 只显示前5个
      console.log(`  ${idx + 1}. Class: "${btn.className}"`)
      console.log(`     HTML: ${btn.outerHTML.substring(0, 100)}...`)
    }
  })

  issues.push('树形按钮元素未找到 - 类名可能不匹配')
  fixes.push('需要检查 VXE Table 实际渲染的 DOM 结构')
  issueCount++
} else {
  console.log('✅ 找到树形按钮元素')
  console.log(`   完整类名: ${foundButton.className}`)
  console.log(`   父元素: ${foundButton.parentElement?.className || 'N/A'}`)

  // 检查样式
  const style = window.getComputedStyle(foundButton)
  const beforeStyle = window.getComputedStyle(foundButton, '::before')

  console.log('')
  console.log('   计算后的样式:')
  console.log(`   - display: ${style.display}`)
  console.log(`   - width: ${style.width}`)
  console.log(`   - height: ${style.height}`)
  console.log(`   - position: ${style.position}`)

  console.log('')
  console.log('   ::before 伪元素样式:')
  console.log(`   - content: ${beforeStyle.content}`)
  console.log(`   - display: ${beforeStyle.display}`)
  console.log(`   - color: ${beforeStyle.color}`)
  console.log(`   - font-size: ${beforeStyle.fontSize}`)

  // 检查 content 是否是预期的三角形
  const content = beforeStyle.content.replace(/['"]/g, '')
  if (content === '▶' || content === '▼') {
    console.log('   ✅ 图标内容正确')
  } else if (content === 'none' || content === '') {
    console.log('   ❌ ::before content 为空')
    issues.push('::before 伪元素未生效')
    fixes.push('样式文件可能未正确加载，或被其他样式覆盖')
    issueCount++
  } else {
    console.log(`   ⚠️  图标内容异常: ${beforeStyle.content}`)
    issues.push(`::before content 值异常: ${beforeStyle.content}`)
    issueCount++
  }
}

console.log('')

// ==================== 3. 检查样式文件加载 ====================
console.log('📋 第三部分：样式文件加载检查')
console.log('─────────────────────────────────────────────────────────────')

const styleSheets = Array.from(document.styleSheets)
console.log(`共有 ${styleSheets.length} 个样式表`)

let foundTreeIconStyles = false
let foundMenuListStyles = false

styleSheets.forEach((sheet, idx) => {
  try {
    const href = sheet.href || '(inline)'

    // 检查是否包含树形图标样式
    if (sheet.href?.includes('vxe-table-tree-icon')) {
      console.log(`✅ [${idx}] 树形图标样式文件: ${href}`)
      foundTreeIconStyles = true
    }

    // 检查 CSS 规则
    const rules = Array.from(sheet.cssRules || [])
    const hasTreeBtnRule = rules.some(r =>
      r.cssText?.includes('vxe-cell--tree-btn') ||
      r.cssText?.includes('vxe-tree--btn-wrapper')
    )

    if (hasTreeBtnRule) {
      console.log(`✅ [${idx}] 包含树形按钮样式规则`)
      foundTreeIconStyles = true

      // 显示相关规则
      rules.forEach(rule => {
        if (rule.cssText?.includes('vxe-cell--tree-btn') ||
            rule.cssText?.includes('vxe-tree--btn-wrapper')) {
          console.log(`   规则: ${rule.cssText.substring(0, 100)}...`)
        }
      })
    }

    // 检查 MenuList 组件样式
    if (rules.some(r => r.cssText?.includes('menu-list'))) {
      console.log(`✅ [${idx}] MenuList 组件样式`)
      foundMenuListStyles = true
    }

  } catch (e) {
    // CORS 限制的样式表，跳过
  }
})

console.log('')

if (!foundTreeIconStyles) {
  console.log('❌ 未找到树形图标样式规则')
  issues.push('vxe-table-tree-icon.scss 可能未正确加载')
  fixes.push('检查 system-app/src/main.js 是否正确导入了样式文件')
  fixes.push('执行: grep "vxe-table-tree-icon" system-app/src/main.js')
  issueCount++
}

if (!foundMenuListStyles) {
  console.log('⚠️  未找到 MenuList 组件样式')
}

console.log('')

// ==================== 4. 检查 VXE Table 配置 ====================
console.log('📋 第四部分：VXE Table 配置检查')
console.log('─────────────────────────────────────────────────────────────')

const treeRows = document.querySelectorAll('.vxe-body--row')
console.log(`表格总行数: ${treeRows.length}`)

if (treeRows.length === 0) {
  console.log('❌ 表格无数据')
  issues.push('表格数据未加载')
  issueCount++
} else {
  // 检查是否有层级属性
  const hasLevel = Array.from(treeRows).some(row =>
    row.hasAttribute('data-level') ||
    row.className.includes('level')
  )

  if (hasLevel) {
    console.log('✅ 检测到树形层级结构')

    // 统计层级
    const levels = {}
    treeRows.forEach(row => {
      const level = row.getAttribute('data-level') ||
                   (row.className.match(/level-(\d+)/) || [])[1] || '0'
      levels[level] = (levels[level] || 0) + 1
    })

    console.log('层级分布:')
    Object.entries(levels).forEach(([level, count]) => {
      console.log(`  Level ${level}: ${count} 行`)
    })
  } else {
    console.log('⚠️  未检测到树形层级属性')
    console.log('   可能的原因: treeConfig 未正确配置')
  }
}

console.log('')

// ==================== 5. DOM 结构分析 ====================
console.log('📋 第五部分：DOM 结构分析')
console.log('─────────────────────────────────────────────────────────────')

if (treeRows.length > 0) {
  console.log('第一行的 HTML 结构:')
  const firstRow = treeRows[0]
  const treeCell = firstRow.querySelector('[class*="tree"]')

  if (treeCell) {
    console.log('树形单元格 HTML:')
    console.log(treeCell.innerHTML.substring(0, 300))
    console.log('')

    // 检查按钮元素的确切结构
    const btnElement = treeCell.querySelector('button, [role="button"]')
    if (btnElement) {
      console.log('按钮元素:')
      console.log(`  标签: ${btnElement.tagName}`)
      console.log(`  类名: ${btnElement.className}`)
      console.log(`  HTML: ${btnElement.outerHTML}`)
    }
  }
}

console.log('')

// ==================== 总结 ====================
console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║                        调试结果总结                              ║')
console.log('╚════════════════════════════════════════════════════════════════╝')
console.log('')

if (issueCount === 0) {
  console.log('✅ 未发现明显问题')
  console.log('')
  console.log('如果图标仍然不显示，尝试以下操作:')
  console.log('1. 强制刷新浏览器 (Ctrl+Shift+R)')
  console.log('2. 清除浏览器缓存')
  console.log('3. 重启开发服务器: make restart')
} else {
  console.log(`❌ 发现 ${issueCount} 个问题:`)
  console.log('')
  issues.forEach((issue, idx) => {
    console.log(`${idx + 1}. ${issue}`)
  })

  console.log('')
  console.log('🔧 建议的修复步骤:')
  console.log('')
  fixes.forEach((fix, idx) => {
    console.log(`${idx + 1}. ${fix}`)
  })
}

console.log('')
console.log('─────────────────────────────────────────────────────────────')
console.log('💡 额外调试命令:')
console.log('')
console.log('// 手动注入样式测试')
console.log('const style = document.createElement("style")')
console.log('style.innerHTML = `')
console.log('  .vxe-cell--tree-btn::before,')
console.log('  .vxe-tree--btn-wrapper::before,')
console.log('  button[class*="tree"]::before {')
console.log('    content: "▶" !important;')
console.log('    font-size: 14px !important;')
console.log('    color: red !important;')
console.log('  }')
console.log('`')
console.log('document.head.appendChild(style)')
console.log('')
console.log('// 如果上述命令让图标显示为红色三角形，说明:')
console.log('// 1. 选择器是正确的')
console.log('// 2. 样式文件可能未正确加载或被覆盖')
console.log('─────────────────────────────────────────────────────────────')
console.log('')

// 返回调试结果对象
window.__TREE_ICON_DEBUG__ = {
  hasTable: !!table,
  hasTreeButton: !!foundButton,
  hasTreeStyles: foundTreeIconStyles,
  issueCount,
  issues,
  fixes,
  buttonElement: foundButton,
  buttonClass: foundButton?.className || null
}

console.log('调试结果已保存到 window.__TREE_ICON_DEBUG__')
console.log('')
