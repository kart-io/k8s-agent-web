/**
 * 强制修复树形图标对齐 - 最激进的方案
 *
 * 直接操作 DOM 和样式
 */

console.clear()
console.log('🚨 强制修复模式启动...\n')

// 1. 先移除所有可能干扰的样式
console.log('1️⃣ 清理干扰样式\n')

const allStyles = Array.from(document.styleSheets)
let removedCount = 0

allStyles.forEach(sheet => {
  try {
    const rules = Array.from(sheet.cssRules || [])
    rules.forEach((rule, idx) => {
      if (rule.cssText && (
        rule.cssText.includes('.vxe-tree-cell') ||
        rule.cssText.includes('.vxe-cell--tree-btn')
      )) {
        // 不删除，只是记录
        console.log('找到相关规则:', rule.selectorText)
      }
    })
  } catch (e) {
    // CORS
  }
})

// 2. 注入最强力的修复样式
console.log('\n2️⃣ 注入强制样式\n')

const style = document.createElement('style')
style.id = 'force-fix-tree-alignment'
style.innerHTML = `
  /* 最高优先级修复 - 10000+ */

  /* 表格单元格 - 强制水平布局 */
  .vxe-table .vxe-body--column .vxe-cell {
    display: block !important;
    width: 100% !important;
    line-height: 32px !important;
  }

  .vxe-table .vxe-body--column .vxe-cell * {
    display: inline !important;
    vertical-align: middle !important;
    line-height: 32px !important;
  }

  /* 树形单元格 */
  .vxe-table .vxe-tree-cell {
    display: inline !important;
    width: auto !important;
  }

  /* 树形按钮 - 极小尺寸 */
  .vxe-table button,
  .vxe-table .vxe-cell--tree-btn {
    display: inline-block !important;
    width: 12px !important;
    height: 12px !important;
    min-width: 12px !important;
    max-width: 12px !important;
    margin: 0 4px 0 0 !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    vertical-align: middle !important;
    position: relative !important;
    line-height: 12px !important;
    overflow: visible !important;
  }

  /* 隐藏按钮内的所有内容 */
  .vxe-table button *,
  .vxe-table .vxe-cell--tree-btn * {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
  }

  /* 三角形图标 */
  .vxe-table button::before,
  .vxe-table .vxe-cell--tree-btn::before {
    content: '▶' !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    transform: none !important;
    font-size: 10px !important;
    font-weight: 900 !important;
    color: rgba(0, 0, 0, 0.65) !important;
    display: block !important;
    z-index: 9999 !important;
    line-height: 12px !important;
    width: 12px !important;
    height: 12px !important;
    text-align: center !important;
  }

  /* 悬停 */
  .vxe-table button:hover::before {
    color: #1890ff !important;
  }

  /* 展开状态 */
  .vxe-table button.is--active::before,
  .vxe-table button[aria-expanded="true"]::before {
    content: '▼' !important;
    color: #1890ff !important;
  }

  /* 文字标签 */
  .vxe-table .vxe-cell--label {
    display: inline !important;
    vertical-align: middle !important;
    line-height: 32px !important;
    white-space: nowrap !important;
  }

  /* 移除所有可能的 clear 和 float */
  .vxe-table .vxe-tree-cell::before,
  .vxe-table .vxe-tree-cell::after {
    display: none !important;
  }

  .vxe-table * {
    float: none !important;
    clear: none !important;
  }
`

// 删除旧样式
const oldStyle = document.getElementById('force-fix-tree-alignment')
if (oldStyle) oldStyle.remove()

document.head.appendChild(style)

console.log('✅ 强制样式已注入\n')

// 3. 直接修改 DOM 元素的 style 属性
console.log('3️⃣ 直接修改 DOM 元素\n')

setTimeout(() => {
  const cells = document.querySelectorAll('.vxe-body--column .vxe-cell')
  console.log(`找到 ${cells.length} 个单元格`)

  cells.forEach((cell, i) => {
    // 强制单元格样式
    cell.style.display = 'block'
    cell.style.lineHeight = '32px'

    // 强制所有子元素为 inline
    Array.from(cell.children).forEach(child => {
      child.style.display = 'inline'
      child.style.verticalAlign = 'middle'
      child.style.lineHeight = '32px'

      // 如果是按钮
      if (child.tagName === 'BUTTON' || child.className.includes('tree-btn')) {
        child.style.display = 'inline-block'
        child.style.width = '12px'
        child.style.height = '12px'
        child.style.marginRight = '4px'
        child.style.verticalAlign = 'middle'
        child.style.padding = '0'
        child.style.border = 'none'
        child.style.background = 'transparent'
        child.style.position = 'relative'

        // 隐藏按钮内的内容
        Array.from(child.children).forEach(grandChild => {
          grandChild.style.display = 'none'
        })
      }
    })

    if (i < 3) {
      console.log(`修改了单元格 ${i + 1}`)
    }
  })

  console.log('\n✅ DOM 直接修改完成\n')

  // 4. 验证结果
  console.log('4️⃣ 验证修复结果\n')

  if (cells.length > 0) {
    const firstCell = cells[0]
    const computed = window.getComputedStyle(firstCell)
    console.log('第一个单元格:')
    console.log('  display:', computed.display)
    console.log('  line-height:', computed.lineHeight)

    const btn = firstCell.querySelector('button')
    if (btn) {
      const btnComputed = window.getComputedStyle(btn)
      console.log('\n第一个按钮:')
      console.log('  display:', btnComputed.display)
      console.log('  width:', btnComputed.width)
      console.log('  height:', btnComputed.height)

      const before = window.getComputedStyle(btn, '::before')
      console.log('\n::before 伪元素:')
      console.log('  content:', before.content)
      console.log('  display:', before.display)
    }
  }

  console.log('\n✨ 强制修复完成！\n')
  console.log('请查看表格，图标和文字现在应该在同一行了。')
  console.log('\n如果仍然不行，请提供以下信息:')
  console.log('1. 在 Elements 面板检查第2行的 HTML 结构')
  console.log('2. 截图 Elements 面板中的 DOM 树')
  console.log('3. 执行: document.querySelector(".vxe-body--column .vxe-cell").innerHTML')
  console.log('   然后复制输出')

}, 200)

window.__FORCE_FIX__ = () => {
  document.head.appendChild(style.cloneNode(true))
  console.log('✅ 已重新应用强制修复')
}

console.log('💡 保存了 window.__FORCE_FIX__() 函数供后续使用\n')
