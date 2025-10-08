<template>
  <a-form
    ref="formRef"
    :model="formModel"
    :rules="formRules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    v-bind="$attrs"
  >
    <a-row :gutter="gutter">
      <template v-for="schema in schemas" :key="schema.field">
        <a-col v-if="!schema.hidden" :span="schema.colSpan || defaultColSpan">
          <a-form-item
            :label="schema.label"
            :name="schema.field"
            :label-col="schema.labelCol || labelCol"
            :wrapper-col="schema.wrapperCol || wrapperCol"
          >
            <!-- 输入框 -->
            <a-input
              v-if="schema.component === 'Input'"
              v-model:value="formModel[schema.field]"
              :placeholder="schema.placeholder || `请输入${schema.label}`"
              v-bind="schema.componentProps"
            />

            <!-- 密码输入框 -->
            <a-input-password
              v-else-if="schema.component === 'InputPassword'"
              v-model:value="formModel[schema.field]"
              :placeholder="schema.placeholder || `请输入${schema.label}`"
              v-bind="schema.componentProps"
            />

            <!-- 文本域 -->
            <a-textarea
              v-else-if="schema.component === 'Textarea'"
              v-model:value="formModel[schema.field]"
              :placeholder="schema.placeholder || `请输入${schema.label}`"
              v-bind="schema.componentProps"
            />

            <!-- 数字输入框 -->
            <a-input-number
              v-else-if="schema.component === 'InputNumber'"
              v-model:value="formModel[schema.field]"
              :placeholder="schema.placeholder || `请输入${schema.label}`"
              style="width: 100%"
              v-bind="schema.componentProps"
            />

            <!-- 选择框 -->
            <a-select
              v-else-if="schema.component === 'Select'"
              v-model:value="formModel[schema.field]"
              :placeholder="schema.placeholder || `请选择${schema.label}`"
              :options="schema.options"
              v-bind="schema.componentProps"
            />

            <!-- 多选框组 -->
            <a-checkbox-group
              v-else-if="schema.component === 'CheckboxGroup'"
              v-model:value="formModel[schema.field]"
              :options="schema.options"
              v-bind="schema.componentProps"
            />

            <!-- 单选框组 -->
            <a-radio-group
              v-else-if="schema.component === 'RadioGroup'"
              v-model:value="formModel[schema.field]"
              :options="schema.options"
              v-bind="schema.componentProps"
            />

            <!-- 开关 -->
            <a-switch
              v-else-if="schema.component === 'Switch'"
              v-model:checked="formModel[schema.field]"
              v-bind="schema.componentProps"
            />

            <!-- 日期选择器 -->
            <a-date-picker
              v-else-if="schema.component === 'DatePicker'"
              v-model:value="formModel[schema.field]"
              :placeholder="schema.placeholder || `请选择${schema.label}`"
              style="width: 100%"
              v-bind="schema.componentProps"
            />

            <!-- 时间选择器 -->
            <a-time-picker
              v-else-if="schema.component === 'TimePicker'"
              v-model:value="formModel[schema.field]"
              :placeholder="schema.placeholder || `请选择${schema.label}`"
              style="width: 100%"
              v-bind="schema.componentProps"
            />

            <!-- 日期范围选择器 -->
            <a-range-picker
              v-else-if="schema.component === 'RangePicker'"
              v-model:value="formModel[schema.field]"
              style="width: 100%"
              v-bind="schema.componentProps"
            />

            <!-- 自定义插槽 -->
            <slot
              v-else-if="schema.slot"
              :name="schema.slot"
              :model="formModel"
              :field="schema.field"
              :schema="schema"
            />
          </a-form-item>
        </a-col>
      </template>

      <!-- 操作按钮 -->
      <a-col v-if="showActionButtons" :span="actionColSpan">
        <a-form-item :wrapper-col="{ offset: labelCol.span }">
          <slot name="actions" :submit="handleSubmit" :reset="handleReset">
            <a-space>
              <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
                {{ submitText }}
              </a-button>
              <a-button @click="handleReset">{{ resetText }}</a-button>
            </a-space>
          </slot>
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'

const props = defineProps({
  // 表单配置项
  schemas: {
    type: Array,
    default: () => []
  },
  // 表单数据
  model: {
    type: Object,
    default: () => ({})
  },
  // 表单验证规则
  rules: {
    type: Object,
    default: () => ({})
  },
  // 标签布局
  labelCol: {
    type: Object,
    default: () => ({ span: 6 })
  },
  // 控件布局
  wrapperCol: {
    type: Object,
    default: () => ({ span: 18 })
  },
  // 栅格间距
  gutter: {
    type: Number,
    default: 16
  },
  // 默认列跨度
  defaultColSpan: {
    type: Number,
    default: 24
  },
  // 是否显示操作按钮
  showActionButtons: {
    type: Boolean,
    default: true
  },
  // 操作按钮列跨度
  actionColSpan: {
    type: Number,
    default: 24
  },
  // 提交按钮文本
  submitText: {
    type: String,
    default: '提交'
  },
  // 重置按钮文本
  resetText: {
    type: String,
    default: '重置'
  },
  // 提交加载状态
  submitLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'reset', 'update:model', 'register'])

// 表单引用
const formRef = ref(null)

// 表单数据
const formModel = reactive({ ...props.model })

// 监听外部 model 变化
watch(() => props.model, (newVal) => {
  Object.assign(formModel, newVal)
}, { deep: true })

// 监听内部 model 变化，同步到外部
watch(formModel, (newVal) => {
  emit('update:model', newVal)
}, { deep: true })

// 表单规则
const formRules = computed(() => {
  const rules = { ...props.rules }

  // 从 schemas 中提取规则
  props.schemas.forEach(schema => {
    if (schema.rules) {
      rules[schema.field] = schema.rules
    } else if (schema.required) {
      rules[schema.field] = [
        {
          required: true,
          message: `${schema.label}不能为空`,
          trigger: schema.component === 'Select' ? 'change' : 'blur'
        }
      ]
    }
  })

  return rules
})

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    emit('submit', formModel)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 重置
const handleReset = () => {
  formRef.value.resetFields()
  emit('reset')
}

// 验证
const validate = async () => {
  return await formRef.value.validate()
}

// 验证指定字段
const validateFields = async (fields) => {
  return await formRef.value.validateFields(fields)
}

// 清除验证
const clearValidate = (fields) => {
  formRef.value.clearValidate(fields)
}

// 重置字段
const resetFields = (fields) => {
  formRef.value.resetFields(fields)
}

// 设置字段值
const setFieldsValue = (values) => {
  Object.assign(formModel, values)
}

// 获取字段值
const getFieldsValue = () => {
  return { ...formModel }
}

// 暴露方法
defineExpose({
  validate,
  validateFields,
  clearValidate,
  resetFields,
  setFieldsValue,
  getFieldsValue,
  formRef
})

// 注册表单实例
emit('register', {
  validate,
  validateFields,
  clearValidate,
  resetFields,
  setFieldsValue,
  getFieldsValue
})
</script>
