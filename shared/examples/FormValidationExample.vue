<template>
  <div class="form-validation-example">
    <a-card title="表单验证示例" :bordered="false">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 基础验证 -->
        <a-tab-pane key="basic" tab="基础验证">
          <BasicForm
            ref="basicFormRef"
            :schemas="basicSchemas"
            v-model="basicFormData"
            :show-action-buttons="true"
            submit-text="提交"
            @submit="handleBasicSubmit"
          />
        </a-tab-pane>

        <!-- 注册表单 -->
        <a-tab-pane key="register" tab="注册表单">
          <BasicForm
            ref="registerFormRef"
            :schemas="registerSchemas"
            v-model="registerFormData"
            :show-action-buttons="true"
            submit-text="注册"
            @submit="handleRegisterSubmit"
          />
        </a-tab-pane>

        <!-- 动态验证 -->
        <a-tab-pane key="dynamic" tab="动态验证">
          <BasicForm
            ref="dynamicFormRef"
            :schemas="dynamicSchemas"
            v-model="dynamicFormData"
            :show-action-buttons="true"
            @submit="handleDynamicSubmit"
          />
        </a-tab-pane>

        <!-- 自定义验证 -->
        <a-tab-pane key="custom" tab="自定义验证">
          <a-form
            ref="customFormRef"
            :model="customFormData"
            :rules="customRules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-form-item name="username" label="用户名">
              <a-input v-model:value="customFormData.username" />
            </a-form-item>

            <a-form-item name="age" label="年龄">
              <a-input-number
                v-model:value="customFormData.age"
                style="width: 100%"
              />
            </a-form-item>

            <a-form-item name="website" label="个人网站">
              <a-input v-model:value="customFormData.website" />
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
              <a-space>
                <a-button type="primary" :loading="customSubmitting" @click="handleCustomSubmit">
                  提交
                </a-button>
                <a-button @click="handleCustomReset">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 提交结果显示 -->
    <a-card v-if="submitResult" title="提交结果" :bordered="false" style="margin-top: 16px">
      <JsonPreview :data="submitResult" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { BasicForm, JsonPreview } from '@k8s-agent/shared/components'
import {
  createRequiredRule,
  createLengthRule,
  createEmailRule,
  createPhoneRule,
  createUsernameRule,
  createPasswordRule,
  createPasswordConfirmRule,
  createNumberRangeRule,
  createUrlRule,
  createCustomRule,
  combineRules
} from '@k8s-agent/shared/utils/formRules'
import {
  useFormValidation,
  useFormSubmit
} from '@k8s-agent/shared/hooks/useFormValidation'

const activeTab = ref('basic')
const submitResult = ref(null)

// ===== 基础验证 =====
const basicFormRef = ref()
const basicFormData = ref({})

const basicSchemas = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    placeholder: '请输入用户名',
    rules: combineRules(
      createRequiredRule('请输入用户名'),
      createLengthRule(4, 20)
    )
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    placeholder: '请输入邮箱',
    rules: combineRules(
      createRequiredRule('请输入邮箱'),
      createEmailRule()
    )
  },
  {
    field: 'phone',
    label: '手机号',
    component: 'Input',
    placeholder: '请输入手机号',
    rules: [createPhoneRule()]
  },
  {
    field: 'age',
    label: '年龄',
    component: 'InputNumber',
    placeholder: '请输入年龄',
    componentProps: {
      min: 1,
      max: 150
    },
    rules: [createNumberRangeRule(1, 150)]
  }
]

const handleBasicSubmit = (values) => {
  console.log('基础验证提交:', values)
  submitResult.value = values
  message.success('提交成功')
}

// ===== 注册表单 =====
const registerFormRef = ref()
const registerFormData = ref({})

const registerSchemas = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    placeholder: '4-20位字母、数字、下划线',
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
    placeholder: '请输入邮箱地址',
    rules: combineRules(
      createRequiredRule('请输入邮箱'),
      createEmailRule()
    )
  },
  {
    field: 'phone',
    label: '手机号',
    component: 'Input',
    placeholder: '请输入11位手机号',
    rules: combineRules(
      createRequiredRule('请输入手机号'),
      createPhoneRule()
    )
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    placeholder: '至少8位，包含字母和数字',
    rules: combineRules(
      createRequiredRule('请输入密码'),
      createPasswordRule(2)
    )
  },
  {
    field: 'confirmPassword',
    label: '确认密码',
    component: 'InputPassword',
    placeholder: '请再次输入密码',
    rules: combineRules(
      createRequiredRule('请再次输入密码'),
      createPasswordConfirmRule('password')
    )
  },
  {
    field: 'agree',
    label: '同意协议',
    component: 'Switch',
    rules: [
      createCustomRule((rule, value) => {
        if (!value) {
          return Promise.reject('请同意用户协议')
        }
        return Promise.resolve()
      })
    ]
  }
]

const handleRegisterSubmit = (values) => {
  console.log('注册提交:', values)
  submitResult.value = values
  message.success('注册成功')
}

// 监听密码变化，重新验证确认密码
watch(() => registerFormData.value.password, () => {
  if (registerFormData.value.confirmPassword && registerFormRef.value) {
    const { validateField } = useFormValidation(registerFormRef)
    validateField('confirmPassword')
  }
})

// ===== 动态验证 =====
const dynamicFormRef = ref()
const dynamicFormData = ref({ contactType: 'email' })

// 动态验证规则
const createDynamicContactRule = () => {
  return createCustomRule((rule, value) => {
    if (!value) {
      return Promise.reject('请输入联系方式')
    }

    const type = dynamicFormData.value.contactType

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

const dynamicSchemas = [
  {
    field: 'contactType',
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
    placeholder: '根据类型输入邮箱或手机号',
    rules: [createDynamicContactRule()]
  }
]

// 监听类型变化，重新验证联系方式
watch(() => dynamicFormData.value.contactType, () => {
  if (dynamicFormData.value.contact && dynamicFormRef.value) {
    const { validateField } = useFormValidation(dynamicFormRef)
    validateField('contact')
  }
})

const handleDynamicSubmit = (values) => {
  console.log('动态验证提交:', values)
  submitResult.value = values
  message.success('提交成功')
}

// ===== 自定义验证 =====
const customFormRef = ref()
const customFormData = ref({
  username: '',
  age: null,
  website: ''
})

// 异步验证用户名
const checkUsernameAsync = createCustomRule(async (rule, value) => {
  if (!value) return Promise.resolve()

  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 500))

  const forbiddenNames = ['admin', 'root', 'test']
  if (forbiddenNames.includes(value.toLowerCase())) {
    return Promise.reject('该用户名已被使用')
  }

  return Promise.resolve()
})

const customRules = {
  username: combineRules(
    createRequiredRule('请输入用户名'),
    createLengthRule(4, 20),
    checkUsernameAsync
  ),
  age: [
    createCustomRule((rule, value) => {
      if (value === null || value === undefined || value === '') {
        return Promise.resolve()
      }
      if (value < 18) {
        return Promise.reject('年龄必须大于18岁')
      }
      if (value > 100) {
        return Promise.reject('年龄必须小于100岁')
      }
      return Promise.resolve()
    })
  ],
  website: [createUrlRule('请输入正确的网站地址')]
}

const customSubmitting = ref(false)

const handleCustomSubmit = async () => {
  const { validate } = useFormValidation(customFormRef)
  const valid = await validate()

  if (valid) {
    customSubmitting.value = true
    try {
      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 1000))
      submitResult.value = customFormData.value
      message.success('提交成功')
    } finally {
      customSubmitting.value = false
    }
  }
}

const handleCustomReset = () => {
  const { resetForm } = useFormValidation(customFormRef)
  resetForm()
  customFormData.value = { username: '', age: null, website: '' }
}
</script>

<style scoped lang="scss">
.form-validation-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}
</style>
