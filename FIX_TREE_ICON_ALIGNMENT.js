/**
 * 树形图标对齐问题 - 紧急修复脚本
 *
 * 在菜单管理页面的浏览器控制台执行此脚本
 */

console.clear()
console.log('🔧 开始修复树形图标对齐问题...\n')

// 1. 先诊断当前问题
console.log('1️⃣ 诊断当前布局\n')

const cells = document.querySelectorAll('.vxe-body--column .vxe-cell')
console.log(`找到 ${cells.length} 个单元格`)

if (cells.length > 0) {
  const firstCell = cells[0]
  const cellStyle = window.getComputedStyle(firstCell)

  console.log('第一个单元格样式:')
  console.log('  display:', cellStyle.display)
  console.log('  flex-direction:', cellStyle.flexDirection)
  console.log('  flex-wrap:', cellStyle.flexWrap)
  console.log('')

  // 检查单元格内的元素
  const children = Array.from(firstCell.children)
  console.log(`单元格内有 ${children.length} 个子元素:`)
  children.forEach((child, i) => {
    const style = window.getComputedStyle(child)
    console.log(`  ${i+1}. <${child.tagName.toLowerCase()} class="${child.className.substring(0, 30)}...">`)
    console.log(`     display: ${style.display}`)
    console.log(`     float: ${style.float}`)
  })
}

console.log('\n2️⃣ 应用修复样式\n')

// 2. 注入强力修复样式
const style = document.createElement('style')
style.id = 'emergency-tree-icon-alignment-fix'
style.innerHTML = `
  /* ==================== 紧急修复：树形图标对齐 ==================== */

  /* 第一列（树形列）的单元格 */
  .vxe-table .vxe-body--column:first-child .vxe-cell,
  .vxe-table .vxe-tree-cell {
    display: inline-flex !important;
    flex-direction: row !important;
    align-items: center !important;
    flex-wrap: nowrap !important;
    width: 100% !important;
  }

  /* 树形按钮 */
  .vxe-table button,
  .vxe-cell--tree-btn,
  .vxe-tree--btn-wrapper {
    display: inline-block !important;
    width: 14px !important;
    height: 14px !important;
    min-width: 14px !important;
    max-width: 14px !important;
    min-height: 14px !important;
    max-height: 14px !important;
    margin: 0 6px 0 0 !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    vertical-align: middle !important;
    flex-shrink: 0 !important;
    float: none !important;
    position: relative !important;
    line-height: 14px !important;
  }

  /* 隐藏按钮内的原始图标 */
  .vxe-table button > *,
  .vxe-cell--tree-btn > * {
    display: none !important;
  }

  /* 使用 ::before 插入三角形 */
  .vxe-table button::before,
  .vxe-cell--tree-btn::before {
    content: '▶' !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    font-size: 10px !important;
    font-weight: 900 !important;
    color: rgba(0, 0, 0, 0.65) !important;
    display: block !important;
    z-index: 1 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  /* 悬停效果 */
  .vxe-table button:hover,
  .vxe-cell--tree-btn:hover {
    background-color: rgba(24, 144, 255, 0.1) !important;
    border-radius: 2px !important;
  }

  .vxe-table button:hover::before,
  .vxe-cell--tree-btn:hover::before {
    color: #1890ff !important;
    transform: translate(-50%, -50%) scale(1.2) !important;
  }

  /* 展开状态 */
  .vxe-table button.is--active::before,
  .vxe-table button[aria-expanded="true"]::before,
  .vxe-cell--tree-btn.is--active::before {
    content: '▼' !important;
    color: #1890ff !important;
  }

  /* 文字标签 */
  .vxe-cell--label,
  .vxe-tree-cell .vxe-cell--label {
    display: inline-block !important;
    vertical-align: middle !important;
    white-space: nowrap !important;
    line-height: 1.5 !important;
  }

  /* 确保所有子元素都在同一行 */
  .vxe-tree-cell > * {
    display: inline-block !important;
    vertical-align: middle !important;
  }
`

// 删除旧的修复样式（如果存在）
const oldStyle = document.getElementById('emergency-tree-icon-alignment-fix')
if (oldStyle) {
  oldStyle.remove()
}

document.head.appendChild(style)

console.log('✅ 修复样式已注入！\n')

// 3. 验证修复效果
setTimeout(() => {
  console.log('3️⃣ 验证修复效果\n')

  const cells = document.querySelectorAll('.vxe-body--column .vxe-cell')
  if (cells.length > 0) {
    const firstCell = cells[0]
    const cellStyle = window.getComputedStyle(firstCell)

    console.log('修复后的单元格样式:')
    console.log('  display:', cellStyle.display)
    console.log('  flex-direction:', cellStyle.flexDirection)
    console.log('  align-items:', cellStyle.alignItems)

    const btn = firstCell.querySelector('button, .vxe-cell--tree-btn')
    if (btn) {
      const btnStyle = window.getComputedStyle(btn)
      console.log('\n按钮样式:')
      console.log('  display:', btnStyle.display)
      console.log('  width:', btnStyle.width)
      console.log('  height:', btnStyle.height)
      console.log('  margin-right:', btnStyle.marginRight)

      const before = window.getComputedStyle(btn, '::before')
      console.log('\n图标样式:')
      console.log('  content:', before.content)
      console.log('  color:', before.color)
    }
  }

  console.log('\n✨ 修复完成！\n')
  console.log('请检查表格，图标和文字现在应该在同一行了。')
  console.log('\n如果还有问题，请截图并提供以下信息：')
  console.log('1. 浏览器类型和版本')
  console.log('2. 是否启用了浏览器缩放（Ctrl+0 重置为 100%）')
  console.log('3. 控制台是否有任何错误信息')

}, 100)

// 保存修复函数供后续使用
window.__FIX_TREE_ALIGNMENT__ = () => {
  document.head.appendChild(style.cloneNode(true))
  console.log('✅ 修复样式已重新应用')
}

console.log('💡 提示：如果刷新页面后问题重现，执行 window.__FIX_TREE_ALIGNMENT__() 重新应用修复')
