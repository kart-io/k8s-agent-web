# 组件快速参考

## 📦 组件总览（31个）

```
Basic 基础组件 (17个)
├── BasicButton         按钮
├── BasicCard           卡片
├── BasicBreadcrumb     面包屑
├── BasicDropdown       下拉菜单
├── BasicEmpty          空状态
├── Icon                图标
├── Loading             加载
├── ScrollContainer     滚动容器
├── CountDown           倒计时
├── CountTo             数字动画
├── StrengthMeter       密码强度
├── CodeEditor          代码编辑器
├── QrCode              二维码
├── JsonPreview         JSON预览
├── Description         描述列表
├── StatusTag           状态标签
└── TimeFormat          时间格式化

Form 表单组件 (1个)
└── BasicForm           动态表单

Table 表格组件 (2个)
├── BasicTable          数据表格
└── TableToolbar        表格工具栏

Modal 模态框 (1个)
└── BasicModal          模态框

Layout 布局组件 (6个)
├── VbenLayout          主布局
├── LayoutHeader        头部
├── LayoutTabBar        标签栏
├── PageWrapper         页面包装
├── TabLayout           标签布局
└── MultiTabLayout      多标签布局

Upload 上传组件 (1个)
└── BasicUpload         文件上传

Tree 树形组件 (1个)
└── BasicTree           树形控件

Drawer 抽屉组件 (1个)
└── BasicDrawer         抽屉面板

Result 结果页 (1个)
└── BasicResult         结果页
```

## 🚀 快速开始

### 1. 安装导入

```javascript
// 导入所有组件
import * as Components from '@k8s-agent/shared/components'

// 按需导入
import { BasicTable, BasicForm, BasicModal } from '@k8s-agent/shared/components'
```

### 2. 常用组合

#### 列表页面
```vue
<BasicCard>
  <BasicTable />
</BasicCard>
```

#### 表单页面
```vue
<BasicModal>
  <BasicForm />
</BasicModal>
```

#### 详情页面
```vue
<BasicDrawer>
  <Description />
</BasicDrawer>
```

## 📝 组件属性速查

### BasicButton
```javascript
{
  type: 'primary' | 'default' | 'dashed' | 'link' | 'text',
  size: 'large' | 'middle' | 'small',
  loading: boolean,
  disabled: boolean,
  danger: boolean,
  icon: string
}
```

### BasicTable
```javascript
{
  columns: Array,
  dataSource: Array,
  loading: boolean,
  pagination: Object,
  showToolbar: boolean,
  actionColumn: Object
}
```

### BasicForm
```javascript
{
  schemas: Array,      // 表单项配置
  modelValue: Object,  // v-model
  labelCol: Object,
  wrapperCol: Object
}
```

### BasicModal
```javascript
{
  open: boolean,       // v-model:open
  title: string,
  width: number | string,
  confirmLoading: boolean,
  destroyOnClose: boolean
}
```

### BasicUpload
```javascript
{
  action: string,      // 上传地址
  accept: string,      // 文件类型
  maxCount: number,    // 最大数量
  maxSize: number,     // 最大大小(MB)
  listType: 'text' | 'picture' | 'picture-card'
}
```

### BasicTree
```javascript
{
  treeData: Array,
  checkable: boolean,
  selectable: boolean,
  multiple: boolean,
  showLine: boolean,
  defaultExpandAll: boolean
}
```

### BasicDrawer
```javascript
{
  open: boolean,       // v-model:open
  title: string,
  width: number | string,
  placement: 'top' | 'right' | 'bottom' | 'left',
  showFooter: boolean
}
```

## 🎯 使用场景

| 场景 | 推荐组件组合 |
|------|------------|
| 数据列表 | BasicCard + BasicTable |
| 表单编辑 | BasicModal + BasicForm |
| 详情查看 | BasicDrawer + Description |
| 数据统计 | BasicCard + CountTo |
| 文件管理 | BasicUpload + BasicTable |
| 树形选择 | BasicTree + BasicModal |
| 代码展示 | CodeEditor + BasicCard |
| 结果反馈 | BasicResult |

## 🎨 主题定制

所有组件都基于 Ant Design Vue，支持主题定制：

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#1890ff',
          'link-color': '#1890ff',
          'border-radius-base': '4px'
        },
        javascriptEnabled: true
      }
    }
  }
})
```

## 📚 相关文档

- [完整组件列表](./COMPONENTS.md)
- [使用示例](./EXAMPLES.md)
- [Ant Design Vue 文档](https://antdv.com/)
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)

## 🔧 开发建议

1. **组件选择**: 优先使用封装的 Basic 组件
2. **状态管理**: 使用 v-model 进行双向绑定
3. **事件处理**: 监听组件事件进行交互
4. **样式定制**: 通过 props 和插槽进行定制
5. **性能优化**: 使用 v-show 替代 v-if（频繁切换）

## ⚡ 性能优化

```vue
<!-- 1. 按需导入，减少打包体积 -->
<script setup>
import { BasicTable } from '@k8s-agent/shared/components'
</script>

<!-- 2. 使用 v-show 优化频繁切换 -->
<BasicModal v-show="visible" />

<!-- 3. 大列表使用虚拟滚动 -->
<BasicTable :scroll="{ y: 500 }" />

<!-- 4. 图片懒加载 -->
<BasicUpload list-type="picture-card" :custom-request="lazyUpload" />
```

## 🐛 常见问题

### Q: 组件样式不生效？
A: 检查是否正确导入了 Ant Design Vue 的样式文件。

### Q: 表单验证不生效？
A: 确保在 schemas 中配置了 rules 或 required 属性。

### Q: 表格分页不工作？
A: 检查 pagination 对象配置和 @change 事件处理。

### Q: Upload 组件上传失败？
A: 检查 action 地址和 headers 配置。

## 📞 技术支持

遇到问题？查看：
1. [组件文档](./COMPONENTS.md)
2. [使用示例](./EXAMPLES.md)
3. [Issue](https://github.com/kart/k8s-agent/issues)
