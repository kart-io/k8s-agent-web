/**
 * 检查实际 DOM 结构和样式
 *
 * 在浏览器控制台执行此脚本
 */

console.clear()
console.log('====================================')
console.log('检查实际 DOM 结构和样式')
console.log('====================================\n')

// 1. 查找所有可能的按钮元素
console.log('1️⃣ 查找树形按钮元素\n')

const selectors = [
  '.vxe-cell--tree-btn',
  '.vxe-tree--btn-wrapper',
  'button[class*="tree"]',
  '.vxe-table button',
  '.vxe-body--column button'
]

let foundButtons = []

selectors.forEach(selector => {
  const elements = document.querySelectorAll(selector)
  if (elements.length > 0) {
    console.log(`✅ ${selector}: 找到 ${elements.length} 个`)
    foundButtons.push(...Array.from(elements))
  } else {
    console.log(`❌ ${selector}: 未找到`)
  }
})

// 去重
foundButtons = [...new Set(foundButtons)]

console.log(`\n总共找到 ${foundButtons.length} 个唯一按钮\n`)

if (foundButtons.length === 0) {
  console.log('❌ 未找到任何树形按钮！')
  console.log('尝试查找表格中的所有元素...\n')

  const allInTable = document.querySelectorAll('.vxe-table *')
  console.log(`表格内共有 ${allInTable.length} 个元素`)

  // 查找可能包含 "tree" 的元素
  const treeElements = Array.from(allInTable).filter(el =>
    el.className && el.className.includes && el.className.includes('tree')
  )

  console.log(`\n包含 "tree" 的元素 (${treeElements.length} 个):`)
  treeElements.forEach((el, i) => {
    if (i < 5) {
      console.log(`  ${i+1}. <${el.tagName.toLowerCase()} class="${el.className}">`)
    }
  })
} else {
  // 2. 分析第一个按钮
  console.log('2️⃣ 分析第一个按钮的详细信息\n')

  const firstBtn = foundButtons[0]
  console.log('标签名:', firstBtn.tagName)
  console.log('完整类名:', firstBtn.className)
  console.log('父元素类名:', firstBtn.parentElement?.className || 'N/A')
  console.log('HTML:', firstBtn.outerHTML.substring(0, 200))
  console.log('\n')

  // 3. 检查计算后的样式
  console.log('3️⃣ 计算后的样式\n')

  const style = window.getComputedStyle(firstBtn)
  console.log('基础样式:')
  console.log('  display:', style.display)
  console.log('  position:', style.position)
  console.log('  width:', style.width)
  console.log('  height:', style.height)
  console.log('  padding:', style.padding)
  console.log('  border:', style.border)
  console.log('  background:', style.backgroundColor)
  console.log('\n')

  // 4. 检查 ::before 伪元素
  console.log('4️⃣ ::before 伪元素样式\n')

  const before = window.getComputedStyle(firstBtn, '::before')
  console.log('content:', before.content)
  console.log('display:', before.display)
  console.log('position:', before.position)
  console.log('left:', before.left)
  console.log('top:', before.top)
  console.log('transform:', before.transform)
  console.log('font-size:', before.fontSize)
  console.log('font-family:', before.fontFamily)
  console.log('font-weight:', before.fontWeight)
  console.log('color:', before.color)
  console.log('z-index:', before.zIndex)

  const content = before.content.replace(/['"]/g, '')
  if (content) {
    console.log('\n实际字符:', content)
    console.log('Unicode 码点:', content.charCodeAt(0), '(0x' + content.charCodeAt(0).toString(16) + ')')
    console.log('期望字符: ▶ (9654 / 0x25b6) 或 ▼ (9660 / 0x25bc)')
  }

  if (before.content === 'none' || before.content === '""') {
    console.log('\n⚠️  ::before content 为空！这是问题所在。')
  } else if (content === '▶' || content === '▼') {
    console.log('\n✅ ::before content 正确！')
  } else {
    console.log('\n⚠️  ::before content 不是预期的三角形字符')
  }

  console.log('\n')

  // 5. 检查样式优先级
  console.log('5️⃣ 样式优先级检查\n')

  // 检查是否有 scoped 属性
  const allStyles = Array.from(document.styleSheets)
  let foundTreeStyles = false

  allStyles.forEach((sheet, idx) => {
    try {
      const rules = Array.from(sheet.cssRules || [])

      rules.forEach(rule => {
        if (rule.cssText && (
          rule.cssText.includes('vxe-cell--tree-btn') ||
          rule.cssText.includes('vxe-tree--btn-wrapper')
        )) {
          if (!foundTreeStyles) {
            console.log('找到相关样式规则:\n')
            foundTreeStyles = true
          }
          console.log(`样式表 [${idx}]:`)
          console.log(rule.cssText.substring(0, 300))
          console.log('---')
        }
      })
    } catch (e) {
      // CORS 限制
    }
  })

  if (!foundTreeStyles) {
    console.log('❌ 未找到树形按钮的样式规则！')
    console.log('这可能是样式未加载或被其他样式覆盖')
  }

  console.log('\n')

  // 6. 检查按钮内部元素
  console.log('6️⃣ 按钮内部元素\n')

  console.log('子元素数量:', firstBtn.children.length)
  if (firstBtn.children.length > 0) {
    Array.from(firstBtn.children).forEach((child, i) => {
      console.log(`  子元素 ${i+1}: <${child.tagName.toLowerCase()} class="${child.className}">`)
      const childStyle = window.getComputedStyle(child)
      console.log(`    display: ${childStyle.display}`)
    })
  }

  console.log('innerText:', firstBtn.innerText)
  console.log('innerHTML:', firstBtn.innerHTML.substring(0, 200))
}

console.log('\n====================================')
console.log('检查完成')
console.log('====================================\n')

// 保存结果
window.__DOM_CHECK_RESULT__ = {
  foundButtons,
  totalButtons: foundButtons.length,
  firstButton: foundButtons[0] || null
}

console.log('结果已保存到 window.__DOM_CHECK_RESULT__')
