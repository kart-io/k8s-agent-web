# K8s Agent 共享组件库

> 基于 Vue 3 + Ant Design Vue + vue-vben-admin 的企业级组件库

## ✨ 特性

- 🎯 **31+ 组件** - 涵盖常见业务场景
- 🎨 **开箱即用** - 合理的默认配置
- 📦 **按需加载** - 支持 Tree Shaking
- 🔧 **TypeScript** - 完整的类型定义
- 🎭 **主题定制** - 灵活的样式配置
- 📱 **响应式** - 支持多种屏幕尺寸
- 🌍 **国际化** - 支持多语言

## 📦 包含组件

### 基础组件 (17个)
按钮、卡片、图标、加载、下拉菜单、面包屑、空状态、滚动容器、倒计时、数字动画、密码强度、代码编辑器、二维码、JSON预览、描述列表、状态标签、时间格式化

### 高级组件 (14个)
表单、表格、模态框、抽屉、树形控件、文件上传、结果页、布局系统等

## 🚀 快速开始

### 安装

```bash
# 已集成在项目中，无需单独安装
```

### 使用

```javascript
// 导入组件
import { BasicTable, BasicForm } from '@k8s-agent/shared/components'

// 在模板中使用
<BasicTable :columns="columns" :data-source="data" />
```

### 完整示例

```vue
<template>
  <BasicCard title="用户管理">
    <template #extra>
      <BasicButton type="primary" @click="handleAdd">
        新增用户
      </BasicButton>
    </template>

    <BasicTable
      :columns="columns"
      :data-source="users"
      :loading="loading"
      @refresh="loadUsers"
    />
  </BasicCard>

  <BasicModal v-model:open="visible" title="编辑用户" @ok="handleSubmit">
    <BasicForm :schemas="formSchemas" v-model="formData" />
  </BasicModal>
</template>

<script setup>
import { ref } from 'vue'
import { BasicCard, BasicButton, BasicTable, BasicModal, BasicForm } from '@k8s-agent/shared/components'

// 组件逻辑...
</script>
```

## 📖 文档

- [完整组件列表](./COMPONENTS.md) - 所有组件的详细说明
- [使用示例](./EXAMPLES.md) - 各组件的实际使用示例
- [快速参考](./QUICK_REFERENCE.md) - 组件属性速查

## 🎯 核心组件

### BasicTable - 数据表格
功能丰富的数据表格，支持排序、筛选、分页、操作列等。

```vue
<BasicTable
  :columns="columns"
  :data-source="dataSource"
  :pagination="pagination"
  :action-column="{ edit: true, delete: true }"
  @refresh="handleRefresh"
/>
```

### BasicForm - 动态表单
基于配置的动态表单，支持各种表单控件和验证规则。

```vue
<BasicForm
  :schemas="formSchemas"
  v-model="formData"
  @submit="handleSubmit"
/>
```

### BasicModal - 模态框
增强的模态框组件，支持确认加载状态。

```vue
<BasicModal
  v-model:open="visible"
  title="编辑"
  :confirm-loading="loading"
  @ok="handleOk"
/>
```

### BasicUpload - 文件上传
支持多文件上传、预览、大小限制、类型验证。

```vue
<BasicUpload
  action="/api/upload"
  :max-count="5"
  :max-size="10"
  list-type="picture-card"
/>
```

### VbenLayout - 主布局
完整的后台管理布局，包含侧边栏、头部、标签页等。

```vue
<VbenLayout
  :menu-data="menuList"
  title="K8s Agent"
  :user-name="userName"
  @user-menu-click="handleUserMenuClick"
>
  <router-view />
</VbenLayout>
```

## 🎨 组件设计原则

1. **一致性** - 统一的 API 设计和交互模式
2. **简洁性** - 合理的默认值，减少配置
3. **灵活性** - 丰富的插槽和事件支持
4. **可维护** - 清晰的代码结构和注释
5. **高性能** - 优化渲染，按需加载

## 🔧 开发指南

### 目录结构

```
shared/src/components/
├── basic/              # 基础组件
│   ├── BasicButton.vue
│   ├── BasicCard.vue
│   └── ...
├── form/               # 表单组件
├── table/              # 表格组件
├── modal/              # 模态框组件
├── layout/             # 布局组件
├── upload/             # 上传组件
├── tree/               # 树形组件
├── drawer/             # 抽屉组件
├── result/             # 结果页组件
└── index.js            # 统一导出
```

### 新增组件

1. 在对应目录下创建组件文件
2. 在目录的 index.js 中导出
3. 在根 index.js 中导出
4. 添加文档和示例

### 组件规范

```vue
<template>
  <!-- 组件模板 -->
</template>

<script setup>
// 使用 Composition API
const props = defineProps({
  // 定义 Props
})

const emit = defineEmits(['change', 'update:modelValue'])

// 组件逻辑

// 暴露方法
defineExpose({
  // 需要暴露的方法
})
</script>

<style scoped lang="scss">
// 组件样式
</style>
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交 PR

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- [Vue 3](https://vuejs.org/)
- [Ant Design Vue](https://antdv.com/)
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)

## 📞 联系方式

- Issue: [GitHub Issues](https://github.com/kart/k8s-agent/issues)

---

Made with ❤️ by K8s Agent Team
