# K8s 资源创建/编辑功能实现说明

## 概述

本次实现为 K8s 资源管理系统添加了创建/编辑功能，支持表单模式和 YAML 模式两种方式。

## 实现内容

### 1. 类型定义扩展 (`k8s-resource-base.ts`)

添加了以下类型定义：

- `FormFieldType`: 表单字段类型枚举
- `FormFieldConfig`: 表单字段配置接口
- `FormGroupConfig`: 表单分组配置接口
- `ResourceFormConfig`: 资源表单配置接口
- 在 `ResourceListConfig` 中添加了 `formConfig` 和 `enableCreate` 字段

### 2. 资源编辑器组件 (`ResourceEditorModal.vue`)

创建了通用的资源编辑器模态框组件，特性包括：

#### Tab 切换
- 表单模式：用户友好的表单界面
- YAML 模式：高级用户的 YAML 编辑器

#### 表单模式功能
- 支持多种字段类型：
  - `input`: 文本输入
  - `textarea`: 多行文本
  - `number`: 数字输入
  - `select`: 下拉选择
  - `switch`: 开关
  - `labels`: 标签编辑器（键值对）
- 支持嵌套字段（如 `metadata.name`）
- 支持字段禁用（根据创建/编辑模式）
- 支持表单分组（可折叠）
- 支持字段验证

#### YAML 模式功能
- YAML 编辑和格式化
- 实时验证
- 错误提示

### 3. ResourceList 组件更新

扩展了 `ResourceList.vue` 组件：

- 添加"创建资源"按钮（当 `enableCreate` 为 true 时显示）
- 集成 ResourceEditorModal 组件
- 提供 `handleCreate` 和 `handleEdit` 方法
- 通过 `defineExpose` 暴露给父组件

### 4. Namespace 资源示例配置

在 `k8s-resources.ts` 中为 Namespace 资源添加了完整的表单配置：

```typescript
formConfig: {
  groups: [
    {
      title: '基本信息',
      fields: [
        {
          field: 'metadata.name',
          label: '名称',
          type: 'input',
          required: true,
          disabled: (mode) => mode === 'edit',
          // ...
        },
      ],
    },
    {
      title: '标签',
      fields: [
        {
          field: 'metadata.labels',
          label: '标签',
          type: 'labels',
          // ...
        },
      ],
      collapsible: true,
    },
    // ...
  ],
  createInitialValues: {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
      name: '',
      labels: {},
      annotations: {},
    },
    status: {
      phase: 'Active',
    },
  },
},
enableCreate: true,
```

## 使用方法

### 为资源添加创建/编辑功能

1. 在资源配置中添加 `formConfig`
2. 设置 `enableCreate: true`
3. 配置表单字段和分组

示例：

```typescript
export function createMyResourceConfig(): ResourceListConfig<MyResource> {
  return {
    // ... 其他配置
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入资源名称',
              rules: [
                { required: true, message: '请输入名称' },
              ],
            },
          ],
        },
      ],
      createInitialValues: {
        // 创建时的初始值
      },
    },
    enableCreate: true,
  };
}
```

### 字段配置说明

#### 通用字段属性
- `field`: 字段路径（支持嵌套，如 'metadata.name'）
- `label`: 字段标签
- `type`: 字段类型
- `required`: 是否必填
- `disabled`: 是否禁用（可以是函数）
- `placeholder`: 占位符
- `help`: 帮助文本
- `rules`: 验证规则（Ant Design Vue 表单规则）

#### 特殊字段类型

##### labels 类型
用于编辑键值对（如 labels、annotations）：
```typescript
{
  field: 'metadata.labels',
  label: '标签',
  type: 'labels',
}
```

##### select 类型
需要提供 `options` 数组：
```typescript
{
  field: 'spec.type',
  label: '类型',
  type: 'select',
  options: [
    { label: 'ClusterIP', value: 'ClusterIP' },
    { label: 'NodePort', value: 'NodePort' },
  ],
}
```

#### 字段分组
使用 `collapsible` 创建可折叠的分组：
```typescript
{
  title: '高级配置',
  fields: [...],
  collapsible: true,
  defaultCollapsed: true,  // 默认折叠
}
```

## 文件清单

1. `/home/hellotalk/code/web/k8s-agent-web/apps/web-k8s/src/types/k8s-resource-base.ts`
   - 扩展了类型定义

2. `/home/hellotalk/code/web/k8s-agent-web/apps/web-k8s/src/views/k8s/_shared/ResourceEditorModal.vue`
   - 新建的资源编辑器组件

3. `/home/hellotalk/code/web/k8s-agent-web/apps/web-k8s/src/views/k8s/_shared/ResourceList.vue`
   - 更新以支持创建功能

4. `/home/hellotalk/code/web/k8s-agent-web/apps/web-k8s/src/config/k8s-resources.ts`
   - Namespace 资源配置示例

## 下一步

为其他 K8s 资源（如 ConfigMap、Secret、Service 等）添加表单配置，可以参考 Namespace 的配置模式。

## 注意事项

1. 创建模式下，某些字段（如 `metadata.name`）应该是必填的
2. 编辑模式下，某些字段（如 `metadata.name`）应该是只读的
3. 使用 `disabled: (mode) => mode === 'edit'` 来实现模式相关的字段状态
4. 表单验证使用 Ant Design Vue 的规则系统
5. YAML 模式保留给高级用户，允许完全控制资源配置
