# 表单验证使用指南

## 📦 验证系统概述

本项目提供了完整的表单验证系统，参考 vue-vben-admin 实现，包括：

1. **验证规则工具函数** (`formRules.js`) - 20+ 种预定义验证规则
2. **验证 Hooks** (`useFormValidation.js`) - 表单验证相关的组合式函数
3. **增强的 BasicForm 组件** - 集成验证功能的表单组件

## 🚀 快速开始

### 1. 基础验证

```vue
<template>
  <BasicForm
    ref="formRef"
    :schemas="formSchemas"
    v-model="formData"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref } from 'vue'
import { BasicForm } from '@k8s-agent/shared/components'
import { createRequiredRule, createEmailRule } from '@k8s-agent/shared/utils/formRules'

const formRef = ref()
const formData = ref({})

const formSchemas = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    rules: [createRequiredRule('请输入用户名')]
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    rules: [
      createRequiredRule('请输入邮箱'),
      createEmailRule()
    ]
  }
]

const handleSubmit = (values) => {
  console.log('表单数据:', values)
}
</script>
```

## 📝 验证规则

### 常用验证规则

#### 1. 必填验证

```javascript
import { createRequiredRule } from '@k8s-agent/shared/utils/formRules'

// 默认提示
createRequiredRule()

// 自定义提示
createRequiredRule('用户名不能为空')
```

#### 2. 长度验证

```javascript
import { createLengthRule } from '@k8s-agent/shared/utils/formRules'

// 最小长度
createLengthRule(6)

// 长度范围
createLengthRule(6, 20)

// 自定义提示
createLengthRule(6, 20, '长度必须在6-20之间')
```

#### 3. 邮箱验证

```javascript
import { createEmailRule } from '@k8s-agent/shared/utils/formRules'

createEmailRule()
createEmailRule('邮箱格式不正确')
```

#### 4. 手机号验证

```javascript
import { createPhoneRule } from '@k8s-agent/shared/utils/formRules'

createPhoneRule()
createPhoneRule('手机号格式不正确')
```

#### 5. 密码验证

```javascript
import { createPasswordRule } from '@k8s-agent/shared/utils/formRules'

// 弱密码（6位以上）
createPasswordRule(1)

// 中等密码（8位以上，包含字母和数字）
createPasswordRule(2)

// 强密码（8位以上，包含字母、数字和特殊字符）
createPasswordRule(3)
```

#### 6. 确认密码验证

```javascript
import { createPasswordConfirmRule } from '@k8s-agent/shared/utils/formRules'

// 需要与 'password' 字段匹配
createPasswordConfirmRule('password')
createPasswordConfirmRule('password', '两次密码输入不一致')
```

### 完整的验证规则列表

| 规则函数 | 说明 | 示例 |
|---------|------|------|
| `createRequiredRule` | 必填验证 | `createRequiredRule('不能为空')` |
| `createLengthRule` | 长度验证 | `createLengthRule(6, 20)` |
| `createEmailRule` | 邮箱验证 | `createEmailRule()` |
| `createPhoneRule` | 手机号验证 | `createPhoneRule()` |
| `createIdCardRule` | 身份证验证 | `createIdCardRule()` |
| `createUrlRule` | URL验证 | `createUrlRule()` |
| `createNumberRule` | 数字验证 | `createNumberRule()` |
| `createNumberRangeRule` | 数字范围 | `createNumberRangeRule(1, 100)` |
| `createIntegerRule` | 整数验证 | `createIntegerRule()` |
| `createPositiveIntegerRule` | 正整数验证 | `createPositiveIntegerRule()` |
| `createIpRule` | IP地址验证 | `createIpRule()` |
| `createPortRule` | 端口号验证 | `createPortRule()` |
| `createUsernameRule` | 用户名验证 | `createUsernameRule()` |
| `createPasswordRule` | 密码强度验证 | `createPasswordRule(2)` |
| `createPasswordConfirmRule` | 确认密码 | `createPasswordConfirmRule('password')` |
| `createPatternRule` | 正则验证 | `createPatternRule(/^\d+$/)` |
| `createCustomRule` | 自定义验证 | `createCustomRule(validator)` |
| `createArrayRequiredRule` | 数组必填 | `createArrayRequiredRule()` |
| `createDateRule` | 日期验证 | `createDateRule()` |
| `createDateRangeRule` | 日期范围 | `createDateRangeRule()` |

## 🎯 完整示例

### 示例1: 用户注册表单

```vue
<template>
  <BasicForm
    ref="formRef"
    :schemas="schemas"
    v-model="formData"
    @submit="handleSubmit"
  >
    <template #actions="{ submit, reset }">
      <a-space>
        <a-button type="primary" :loading="submitting" @click="submit">
          注册
        </a-button>
        <a-button @click="reset">重置</a-button>
      </a-space>
    </template>
  </BasicForm>
</template>

<script setup>
import { ref } from 'vue'
import { BasicForm } from '@k8s-agent/shared/components'
import {
  createRequiredRule,
  createUsernameRule,
  createLengthRule,
  createEmailRule,
  createPhoneRule,
  createPasswordRule,
  createPasswordConfirmRule,
  combineRules
} from '@k8s-agent/shared/utils/formRules'
import { useFormSubmit } from '@k8s-agent/shared/hooks/useFormValidation'

const formRef = ref()
const formData = ref({})

const schemas = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    rules: combineRules(
      createRequiredRule('请输入用户名'),
      createUsernameRule(),
      createLengthRule(4, 20)
    )
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    rules: combineRules(
      createRequiredRule('请输入邮箱'),
      createEmailRule()
    )
  },
  {
    field: 'phone',
    label: '手机号',
    component: 'Input',
    rules: combineRules(
      createRequiredRule('请输入手机号'),
      createPhoneRule()
    )
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    rules: combineRules(
      createRequiredRule('请输入密码'),
      createPasswordRule(2)
    )
  },
  {
    field: 'confirmPassword',
    label: '确认密码',
    component: 'InputPassword',
    rules: combineRules(
      createRequiredRule('请再次输入密码'),
      createPasswordConfirmRule('password')
    )
  }
]

const { submitting, handleSubmit: submit } = useFormSubmit({
  formRef,
  onSubmit: async (values) => {
    // 调用注册API
    console.log('提交数据:', values)
    await new Promise(resolve => setTimeout(resolve, 1000))
  },
  successMessage: '注册成功'
})

const handleSubmit = () => {
  submit()
}
</script>
```

### 示例2: 动态验证

```vue
<template>
  <BasicForm
    ref="formRef"
    :schemas="schemas"
    v-model="formData"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import { BasicForm } from '@k8s-agent/shared/components'
import {
  createRequiredRule,
  createCustomRule
} from '@k8s-agent/shared/utils/formRules'
import { useFormValidation } from '@k8s-agent/shared/hooks/useFormValidation'

const formRef = ref()
const formData = ref({ type: 'email' })

const { validateField } = useFormValidation(formRef)

// 根据类型动态验证
const createDynamicRule = () => {
  return createCustomRule((rule, value) => {
    const type = formData.value.type

    if (type === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(value)) {
        return Promise.reject('邮箱格式不正确')
      }
    } else if (type === 'phone') {
      const phonePattern = /^1[3-9]\d{9}$/
      if (!phonePattern.test(value)) {
        return Promise.reject('手机号格式不正确')
      }
    }

    return Promise.resolve()
  })
}

const schemas = [
  {
    field: 'type',
    label: '联系方式类型',
    component: 'Select',
    options: [
      { label: '邮箱', value: 'email' },
      { label: '手机号', value: 'phone' }
    ],
    rules: [createRequiredRule()]
  },
  {
    field: 'contact',
    label: '联系方式',
    component: 'Input',
    rules: [
      createRequiredRule('请输入联系方式'),
      createDynamicRule()
    ]
  }
]

// 当类型改变时，重新验证联系方式字段
watch(() => formData.value.type, () => {
  if (formData.value.contact) {
    validateField('contact')
  }
})
</script>
```

### 示例3: 使用 Hooks

```vue
<template>
  <a-form ref="formRef" :model="formData" :rules="rules">
    <a-form-item name="username" label="用户名">
      <a-input v-model:value="formData.username" />
    </a-form-item>
    <a-form-item name="email" label="邮箱">
      <a-input v-model:value="formData.email" />
    </a-form-item>
    <a-form-item>
      <a-space>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">
          提交
        </a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref } from 'vue'
import {
  createRequiredRule,
  createEmailRule
} from '@k8s-agent/shared/utils/formRules'
import {
  useFormValidation,
  useFormSubmit
} from '@k8s-agent/shared/hooks/useFormValidation'

const formRef = ref()
const formData = ref({
  username: '',
  email: ''
})

const rules = {
  username: [createRequiredRule('请输入用户名')],
  email: [
    createRequiredRule('请输入邮箱'),
    createEmailRule()
  ]
}

const { validate, resetForm } = useFormValidation(formRef)

const { submitting, handleSubmit: submit } = useFormSubmit({
  formRef,
  onSubmit: async (values) => {
    console.log('提交:', values)
    // API 调用...
  }
})

const handleSubmit = () => {
  submit()
}

const handleReset = () => {
  resetForm()
  formData.value = { username: '', email: '' }
}
</script>
```

## 🔧 高级用法

### 自定义验证器

```javascript
import { createCustomRule } from '@k8s-agent/shared/utils/formRules'

// 异步验证 - 检查用户名是否已存在
const checkUsernameExists = createCustomRule(async (rule, value) => {
  if (!value) return Promise.resolve()

  // 调用API检查
  const exists = await checkUsername(value)

  if (exists) {
    return Promise.reject('用户名已存在')
  }

  return Promise.resolve()
})

// 使用
{
  field: 'username',
  label: '用户名',
  component: 'Input',
  rules: [
    createRequiredRule(),
    checkUsernameExists
  ]
}
```

### 组合规则

```javascript
import { combineRules, createRules } from '@k8s-agent/shared/utils/formRules'

// 方式1: 使用 combineRules
const rules1 = combineRules(
  createRequiredRule(),
  createLengthRule(6, 20),
  createUsernameRule()
)

// 方式2: 使用 createRules 配置
const rules2 = createRules({
  required: true,
  requiredMessage: '请输入用户名',
  type: 'username',
  min: 6,
  max: 20
})

// 方式3: 数组方式
const rules3 = [
  createRequiredRule(),
  createLengthRule(6, 20),
  createUsernameRule()
]
```

## 📚 API 文档

### formRules 工具函数

所有验证规则函数都返回符合 Ant Design Vue 规范的规则对象。

### useFormValidation Hook

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `validate` | 验证整个表单 | - | Promise<boolean> |
| `validateField` | 验证指定字段 | fields: string \| string[] | Promise<boolean> |
| `resetValidation` | 重置验证状态 | - | void |
| `resetForm` | 重置表单 | - | void |
| `getFieldsValue` | 获取表单值 | - | Object |
| `setFieldsValue` | 设置表单值 | values: Object | void |

### useFormSubmit Hook

| 选项 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `formRef` | 表单引用 | Ref | - |
| `onSubmit` | 提交回调 | Function | - |
| `onSuccess` | 成功回调 | Function | - |
| `onError` | 错误回调 | Function | - |
| `validateFirst` | 先验证 | boolean | true |
| `showSuccessMessage` | 显示成功消息 | boolean | true |

## 💡 最佳实践

1. **统一使用工具函数**：使用预定义的验证规则函数，保持代码一致性
2. **合理组合规则**：使用 `combineRules` 组合多个验证规则
3. **自定义验证器**：复杂验证逻辑使用 `createCustomRule`
4. **使用 Hooks**：在组件中使用 hooks 简化表单操作
5. **错误提示清晰**：提供明确的错误提示信息
6. **异步验证**：需要调用API的验证使用异步验证器

## 🐛 常见问题

### Q: 验证不生效？
A: 检查是否正确设置了 `rules` 属性，并确保字段 `name/field` 正确。

### Q: 如何禁用验证？
A: 设置 schema 的 `rules: []` 或不设置 rules 属性。

### Q: 如何手动触发验证？
A: 使用 `useFormValidation` 的 `validate` 或 `validateField` 方法。

### Q: 如何清除验证状态？
A: 使用 `resetValidation` 方法。

---

更多详情请参考：
- [Ant Design Vue Form 文档](https://antdv.com/components/form-cn)
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
