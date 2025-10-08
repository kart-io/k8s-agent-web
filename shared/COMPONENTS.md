# K8s Agent 共享组件库

参考 vue-vben-admin 实现的完整企业级组件库

## 📦 组件总览

当前共有 **31个** Vue 组件，分为 8 大类别：

## 🎯 组件分类

### 1. Basic 基础组件 (17个)

#### 布局相关
- **BasicCard** - 卡片容器，支持 header/footer/actions 插槽
- **ScrollContainer** - 滚动容器，支持自定义滚动条样式
- **PageWrapper** - 页面包装器

#### 交互组件
- **BasicButton** - 增强按钮，支持加载状态和图标
- **BasicDropdown** - 下拉菜单，支持图标和分割线
- **BasicEmpty** - 空状态展示
- **Loading** - 加载动画，支持全屏和局部加载

#### 导航组件
- **BasicBreadcrumb** - 面包屑导航，支持图标和路由跳转
- **Icon** - 统一图标组件，支持自定义大小和颜色

#### 数据展示
- **Description** - 描述列表
- **StatusTag** - 状态标签
- **TimeFormat** - 时间格式化
- **CountDown** - 倒计时组件
- **CountTo** - 数字动画组件，支持千位分隔符

#### 高级组件
- **CodeEditor** - 代码编辑器
- **JsonPreview** - JSON 数据预览，支持复制和下载
- **QrCode** - 二维码生成器，支持下载
- **StrengthMeter** - 密码强度计，实时显示密码强度

### 2. Form 表单组件 (1个)

- **BasicForm** - 动态表单组件
  - 支持多种表单控件（Input/Select/DatePicker/Upload 等）
  - 支持动态表单项
  - 支持表单验证
  - 支持栅格布局

### 3. Table 表格组件 (2个)

- **BasicTable** - 增强表格
  - 支持分页
  - 支持排序/筛选
  - 支持操作列
  - 内置工具栏
- **TableToolbar** - 表格工具栏
  - 刷新功能
  - 列设置
  - 全屏显示

### 4. Modal 模态框组件 (1个)

- **BasicModal** - 增强模态框
  - 支持确认按钮加载状态
  - 支持自定义 footer
  - 支持拖拽（可选）

### 5. Layout 布局组件 (6个)

- **VbenLayout** - 主布局框架
  - 侧边栏菜单
  - 顶部导航
  - 多标签页
  - 面包屑
- **LayoutHeader** - 布局头部
- **LayoutTabBar** - 多标签页栏
- **PageWrapper** - 页面包装器
- **TabLayout** - 标签布局
- **MultiTabLayout** - 多标签布局

### 6. Upload 上传组件 (1个)

- **BasicUpload** - 文件上传
  - 支持多文件上传
  - 文件大小验证
  - 文件类型验证
  - 图片预览
  - 支持三种展示模式（text/picture/picture-card）

### 7. Tree 树形组件 (1个)

- **BasicTree** - 树形控件
  - 支持选择/勾选
  - 支持展开/折叠
  - 支持异步加载
  - 支持自定义字段映射
  - 支持图标和连接线

### 8. Drawer 抽屉组件 (1个)

- **BasicDrawer** - 抽屉面板
  - 支持四个方向（top/right/bottom/left）
  - 支持自定义 footer
  - 支持确认加载状态
  - 支持销毁时关闭

### 9. Result 结果页组件 (1个)

- **BasicResult** - 结果页展示
  - 支持多种状态（success/error/info/warning/404/403/500）
  - 支持自定义图标
  - 支持操作按钮

## 🚀 使用方式

### 全量导入

```javascript
import * as Components from '@k8s-agent/shared/components'
```

### 按需导入

```javascript
// 导入单个组件
import { BasicTable, BasicForm, BasicModal } from '@k8s-agent/shared/components'

// 导入分类组件
import * as BasicComponents from '@k8s-agent/shared/components/basic'
import * as LayoutComponents from '@k8s-agent/shared/components/layout'
```

### 在 Vue 组件中使用

```vue
<template>
  <BasicCard title="用户列表">
    <template #extra>
      <BasicButton type="primary" @click="handleAdd">
        新增用户
      </BasicButton>
    </template>

    <BasicTable
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      @refresh="loadData"
    />
  </BasicCard>

  <BasicModal
    v-model:open="modalVisible"
    title="编辑用户"
    @ok="handleSubmit"
  >
    <BasicForm
      :schemas="formSchemas"
      v-model="formData"
    />
  </BasicModal>
</template>

<script setup>
import { ref } from 'vue'
import {
  BasicCard,
  BasicButton,
  BasicTable,
  BasicModal,
  BasicForm
} from '@k8s-agent/shared/components'

// 组件逻辑...
</script>
```

## ✨ 组件特性

所有组件都具备以下特性：

- ✅ 基于 Ant Design Vue 封装
- ✅ 完整的 TypeScript 类型支持
- ✅ 完善的 Props 验证
- ✅ 统一的事件命名规范
- ✅ 丰富的插槽扩展
- ✅ 响应式设计
- ✅ 支持双向绑定
- ✅ 完整的文档注释

## 📁 目录结构

```
shared/src/components/
├── basic/          # 基础组件 (17个)
│   ├── BasicButton.vue
│   ├── BasicCard.vue
│   ├── BasicBreadcrumb.vue
│   ├── BasicDropdown.vue
│   ├── BasicEmpty.vue
│   ├── Icon.vue
│   ├── Loading.vue
│   ├── ScrollContainer.vue
│   ├── CountDown.vue
│   ├── CountTo.vue
│   ├── StrengthMeter.vue
│   ├── CodeEditor.vue
│   ├── QrCode.vue
│   ├── JsonPreview.vue
│   ├── Description.vue
│   ├── StatusTag.vue
│   ├── TimeFormat.vue
│   └── index.js
├── form/           # 表单组件 (1个)
│   ├── BasicForm.vue
│   └── index.js
├── table/          # 表格组件 (2个)
│   ├── BasicTable.vue
│   ├── TableToolbar.vue
│   └── index.js
├── modal/          # 模态框组件 (1个)
│   ├── BasicModal.vue
│   └── index.js
├── layout/         # 布局组件 (6个)
│   ├── VbenLayout.vue
│   ├── LayoutHeader.vue
│   ├── LayoutTabBar.vue
│   ├── PageWrapper.vue
│   ├── TabLayout.vue
│   ├── MultiTabLayout.vue
│   └── index.js
├── upload/         # 上传组件 (1个)
│   ├── BasicUpload.vue
│   └── index.js
├── tree/           # 树形组件 (1个)
│   ├── BasicTree.vue
│   └── index.js
├── drawer/         # 抽屉组件 (1个)
│   ├── BasicDrawer.vue
│   └── index.js
├── result/         # 结果页组件 (1个)
│   ├── BasicResult.vue
│   └── index.js
└── index.js        # 统一导出
```

## 🎨 设计原则

1. **统一性** - 所有组件遵循统一的 API 设计规范
2. **可扩展** - 提供丰富的插槽和事件支持
3. **易用性** - 合理的默认值，开箱即用
4. **性能** - 按需加载，避免不必要的渲染
5. **类型安全** - 完整的 TypeScript 类型定义

## 📝 版本信息

- 基于框架：Vue 3 + Ant Design Vue
- 参考项目：vue-vben-admin
- 构建工具：Vite
- 包管理：pnpm

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Ant Design Vue 文档](https://antdv.com/)
- [vue-vben-admin 项目](https://github.com/vbenjs/vue-vben-admin)
