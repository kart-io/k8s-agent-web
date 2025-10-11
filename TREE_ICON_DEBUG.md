# 树形图标调试指南

## 问题：图标仍然显示为空心方框

### 调试步骤

#### 1. 检查 DOM 结构

打开浏览器 DevTools (F12) → Elements，找到展开按钮元素：

```html
<!-- 应该看到类似这样的结构 -->
<div class="vxe-cell--tree-btn">
  <i class="..."><!-- 原始图标 --></i>
</div>
```

**或者**：

```html
<button class="vxe-cell--tree-btn">
  <svg>...</svg>
</button>
```

#### 2. 检查样式是否生效

在 DevTools 的 Elements 面板，选中展开按钮元素，查看 Styles 面板：

```css
/* 应该看到我们的自定义样式 */
.menu-list .vxe-table .vxe-cell--tree-btn::before {
  content: "▶" !important;
  font-size: 11px !important;
  color: rgba(0, 0, 0, 0.65) !important;
  /* ... */
}
```

**如果没有看到**：
- 检查 `.menu-list` 类是否存在
- 检查 `:deep()` 是否正确编译

#### 3. 手动测试样式

在浏览器控制台执行：

```javascript
// 1. 找到展开按钮
const btn = document.querySelector('.vxe-cell--tree-btn')
console.log('找到按钮:', btn)

// 2. 检查伪元素内容
const style = window.getComputedStyle(btn, '::before')
console.log('伪元素内容:', style.content)
console.log('伪元素颜色:', style.color)
console.log('伪元素字体:', style.fontFamily)

// 3. 如果没有按钮，尝试其他可能的类名
const alternatives = [
  '.vxe-tree--btn-wrapper',
  '.vxe-tree-btn',
  '[class*="tree"][class*="btn"]'
]

alternatives.forEach(selector => {
  const el = document.querySelector(selector)
  if (el) {
    console.log(`找到元素 (${selector}):`, el)
  }
})
```

#### 4. 临时强制样式（测试用）

如果样式不生效，在控制台临时注入样式测试：

```javascript
const style = document.createElement('style')
style.innerHTML = `
  .vxe-cell--tree-btn,
  [class*="vxe"][class*="tree"][class*="btn"] {
    position: relative !important;
    display: inline-flex !important;
    width: 20px !important;
    height: 20px !important;
  }

  .vxe-cell--tree-btn::before,
  [class*="vxe"][class*="tree"][class*="btn"]::before {
    content: '▶' !important;
    font-size: 14px !important;
    color: #ff0000 !important;  /* 红色，容易识别 */
    font-weight: bold !important;
    line-height: 1 !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
  }

  .vxe-cell--tree-btn i,
  .vxe-cell--tree-btn svg,
  [class*="vxe"][class*="tree"][class*="btn"] i,
  [class*="vxe"][class*="tree"][class*="btn"] svg {
    display: none !important;
  }
`
document.head.appendChild(style)
console.log('临时样式已注入，查看图标是否变为红色三角形')
```

### 可能的原因和解决方案

#### 原因1：VXE Table 版本差异

不同版本的 VXE Table 使用不同的类名。

**解决方案**：检查实际使用的类名

```bash
# 在项目根目录执行
grep -r "class.*tree.*btn" system-app/node_modules/vxe-table/lib/ | head -10
```

然后更新 `MenuList.vue` 中的选择器。

#### 原因2：Scoped CSS 穿透失败

`:deep()` 可能未正确编译。

**解决方案**：改用全局样式

```vue
<!-- MenuList.vue -->
</template>

<!-- 添加一个全局样式块 -->
<style lang="scss">
/* 全局样式，不使用 scoped */
.vxe-table .vxe-cell--tree-btn {
  &::before {
    content: '▶' !important;
    font-size: 11px !important;
    color: rgba(0, 0, 0, 0.65) !important;
  }

  &.is--active::before {
    content: '▼' !important;
    color: #1890ff !important;
  }
}
</style>

<!-- 保留原有的 scoped 样式 -->
<style scoped lang="scss">
.menu-list {
  /* ... */
}
</style>
```

#### 原因3：字体不支持 Unicode 字符

某些字体不包含 ▶ (U+25B6) 和 ▼ (U+25BC) 字符。

**解决方案**：使用 SVG Data URI

```scss
.vxe-cell--tree-btn::before {
  content: '' !important;
  display: block !important;
  width: 12px !important;
  height: 12px !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='rgba(0,0,0,0.65)' d='M4 2l8 6-8 6V2z'/%3E%3C/svg%3E") !important;
  background-size: contain !important;
  background-repeat: no-repeat !important;
}

.vxe-cell--tree-btn.is--active::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%231890ff' d='M2 4l6 8 6-8H2z'/%3E%3C/svg%3E") !important;
}
```

#### 原因4：CSS 被其他样式覆盖

VxeBasicTable 或 Ant Design 的样式优先级更高。

**解决方案**：提高选择器优先级

```scss
// 方法1：增加选择器深度
.menu-list .vxe-basic-table .vxe-table .vxe-cell--tree-btn::before {
  content: '▶' !important;
}

// 方法2：使用 ID 选择器（不推荐）
#app .menu-list .vxe-table .vxe-cell--tree-btn::before {
  content: '▶' !important;
}

// 方法3：重复选择器（提高优先级）
.vxe-cell--tree-btn.vxe-cell--tree-btn::before {
  content: '▶' !important;
}
```

### 最终测试方案

如果以上方法都不行，使用这个终极方案（直接修改 VXE Table 主题）：

#### 创建自定义 VXE Table 主题文件

**文件**：`system-app/src/styles/vxe-table-custom.scss`

```scss
/* VXE Table 树形图标自定义样式 */

// 展开/收起按钮
.vxe-cell--tree-btn {
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 20px !important;
  height: 20px !important;
  margin-right: 8px !important;
  cursor: pointer !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;

  // 隐藏原始图标
  * {
    display: none !important;
  }

  // 自定义图标（折叠）
  &::before {
    content: '▶' !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 11px !important;
    font-weight: bold !important;
    color: rgba(0, 0, 0, 0.65) !important;
    line-height: 1 !important;
    display: block !important;
  }

  // 悬停效果
  &:hover {
    background-color: rgba(24, 144, 255, 0.1) !important;

    &::before {
      color: #1890ff !important;
      transform: translate(-50%, -50%) scale(1.1) !important;
    }
  }

  // 展开状态
  &.is--active,
  &.active {
    &::before {
      content: '▼' !important;
      color: #1890ff !important;
    }
  }
}

// 树形单元格
.vxe-tree-cell {
  display: flex !important;
  align-items: center !important;
}
```

#### 在 main.js 中引入

**文件**：`system-app/src/main.js`

```javascript
import { createApp } from 'vue'
import App from './App.vue'

// 引入 VXE Table 自定义样式
import './styles/vxe-table-custom.scss'

// ... 其他代码
```

### 提交 Bug 报告

如果所有方法都不行，请提供以下信息：

1. **VXE Table 版本**：
   ```bash
   grep "vxe-table" system-app/package.json
   ```

2. **浏览器信息**：
   - Chrome/Firefox/Safari 版本号
   - 操作系统

3. **实际 DOM 结构**（DevTools Elements 面板截图）

4. **实际应用的 CSS**（DevTools Styles 面板截图）

5. **控制台错误**（DevTools Console 面板截图）

### 快速验证清单

执行以下命令生成完整的调试报告：

```bash
cat > /tmp/vxe-tree-debug.js << 'EOF'
console.log('=== VXE Table 树形图标调试报告 ===\n')

// 1. 查找所有可能的树形按钮元素
const selectors = [
  '.vxe-cell--tree-btn',
  '.vxe-tree--btn-wrapper',
  '.vxe-tree-btn',
  '[class*="tree"][class*="btn"]'
]

console.log('1. 查找树形按钮元素:')
selectors.forEach(sel => {
  const els = document.querySelectorAll(sel)
  if (els.length > 0) {
    console.log(`  ✅ ${sel}: 找到 ${els.length} 个`)
    console.log('     示例HTML:', els[0].outerHTML.slice(0, 200))
  } else {
    console.log(`  ❌ ${sel}: 未找到`)
  }
})

// 2. 检查第一个按钮的样式
const firstBtn = document.querySelector('.vxe-cell--tree-btn')
if (firstBtn) {
  console.log('\n2. 第一个按钮的样式:')
  const style = window.getComputedStyle(firstBtn)
  console.log('  display:', style.display)
  console.log('  width:', style.width)
  console.log('  height:', style.height)

  const beforeStyle = window.getComputedStyle(firstBtn, '::before')
  console.log('\n  ::before 伪元素:')
  console.log('    content:', beforeStyle.content)
  console.log('    color:', beforeStyle.color)
  console.log('    font-size:', beforeStyle.fontSize)
  console.log('    font-family:', beforeStyle.fontFamily)
} else {
  console.log('\n2. ❌ 未找到 .vxe-cell--tree-btn 元素')
}

// 3. 检查 .menu-list 容器
const menuList = document.querySelector('.menu-list')
console.log('\n3. .menu-list 容器:', menuList ? '✅ 存在' : '❌ 不存在')

// 4. 检查 VXE Table 版本
console.log('\n4. VXE Table 版本: 请在 package.json 中查看')

console.log('\n=== 调试报告结束 ===')
console.log('\n💡 提示: 请将此输出截图发送给开发者')
EOF

echo "调试脚本已创建: /tmp/vxe-tree-debug.js"
echo "请在浏览器控制台中复制粘贴该文件内容并执行"
cat /tmp/vxe-tree-debug.js
```

---

**最后的建议**：

如果图标仍然不显示，最可能的原因是 VXE Table 版本使用了不同的 DOM 结构。请：

1. 打开浏览器 DevTools
2. 找到"Agent管理"那一行
3. 查看展开按钮的实际 HTML 结构
4. 截图发送给我，我会据此调整样式选择器
