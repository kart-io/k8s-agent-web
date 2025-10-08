/**
 * 表单验证 Hook
 * 参考 vue-vben-admin 实现
 */
import { ref, unref, nextTick } from 'vue'

/**
 * 使用表单验证
 * @param {Object} formRef 表单ref
 * @returns {Object} 表单验证方法
 */
export function useFormValidation(formRef) {
  const validating = ref(false)

  /**
   * 验证整个表单
   */
  const validate = async () => {
    const form = unref(formRef)
    if (!form) {
      console.warn('Form ref is not ready')
      return false
    }

    validating.value = true
    try {
      await form.validate()
      validating.value = false
      return true
    } catch (error) {
      validating.value = false
      console.error('Form validation failed:', error)
      return false
    }
  }

  /**
   * 验证指定字段
   */
  const validateField = async (fields) => {
    const form = unref(formRef)
    if (!form) {
      console.warn('Form ref is not ready')
      return false
    }

    const fieldArray = Array.isArray(fields) ? fields : [fields]

    try {
      await form.validateFields(fieldArray)
      return true
    } catch (error) {
      console.error('Field validation failed:', error)
      return false
    }
  }

  /**
   * 重置表单验证状态
   */
  const resetValidation = () => {
    const form = unref(formRef)
    if (form) {
      form.clearValidate()
    }
  }

  /**
   * 重置表单（包括值和验证状态）
   */
  const resetForm = () => {
    const form = unref(formRef)
    if (form) {
      form.resetFields()
    }
  }

  /**
   * 获取表单值
   */
  const getFieldsValue = () => {
    const form = unref(formRef)
    if (!form) {
      return {}
    }
    return form.getFieldsValue ? form.getFieldsValue() : {}
  }

  /**
   * 设置表单值
   */
  const setFieldsValue = (values) => {
    const form = unref(formRef)
    if (form && form.setFieldsValue) {
      form.setFieldsValue(values)
    }
  }

  /**
   * 设置字段错误信息
   */
  const setFields = (fields) => {
    const form = unref(formRef)
    if (form && form.setFields) {
      form.setFields(fields)
    }
  }

  /**
   * 滚动到第一个错误字段
   */
  const scrollToField = async (field) => {
    const form = unref(formRef)
    if (form && form.scrollToField) {
      await nextTick()
      form.scrollToField(field)
    }
  }

  return {
    validating,
    validate,
    validateField,
    resetValidation,
    resetForm,
    getFieldsValue,
    setFieldsValue,
    setFields,
    scrollToField
  }
}

/**
 * 使用表单提交
 * @param {Object} options 配置选项
 * @returns {Object} 表单提交方法和状态
 */
export function useFormSubmit(options = {}) {
  const {
    formRef,
    onSubmit,
    onSuccess,
    onError,
    validateFirst = true,
    showSuccessMessage = true,
    successMessage = '提交成功',
    showErrorMessage = true,
    errorMessage = '提交失败'
  } = options

  const submitting = ref(false)
  const { validate } = useFormValidation(formRef)

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    // 验证表单
    if (validateFirst) {
      const valid = await validate()
      if (!valid) {
        return false
      }
    }

    submitting.value = true

    try {
      const form = unref(formRef)
      const values = form ? (form.getFieldsValue ? form.getFieldsValue() : {}) : {}

      // 执行提交回调
      if (onSubmit) {
        await onSubmit(values)
      }

      // 成功回调
      if (onSuccess) {
        onSuccess(values)
      }

      // 显示成功消息
      if (showSuccessMessage && window.$message) {
        window.$message.success(successMessage)
      }

      submitting.value = false
      return true
    } catch (error) {
      console.error('Form submit error:', error)

      // 错误回调
      if (onError) {
        onError(error)
      }

      // 显示错误消息
      if (showErrorMessage && window.$message) {
        window.$message.error(errorMessage)
      }

      submitting.value = false
      return false
    }
  }

  return {
    submitting,
    handleSubmit
  }
}

/**
 * 使用表单错误处理
 */
export function useFormErrors() {
  const errors = ref({})

  /**
   * 设置错误
   */
  const setError = (field, message) => {
    errors.value[field] = message
  }

  /**
   * 设置多个错误
   */
  const setErrors = (errorObj) => {
    errors.value = { ...errors.value, ...errorObj }
  }

  /**
   * 清除错误
   */
  const clearError = (field) => {
    delete errors.value[field]
  }

  /**
   * 清除所有错误
   */
  const clearErrors = () => {
    errors.value = {}
  }

  /**
   * 获取错误
   */
  const getError = (field) => {
    return errors.value[field]
  }

  /**
   * 是否有错误
   */
  const hasError = (field) => {
    return field ? !!errors.value[field] : Object.keys(errors.value).length > 0
  }

  return {
    errors,
    setError,
    setErrors,
    clearError,
    clearErrors,
    getError,
    hasError
  }
}

/**
 * 使用字段依赖验证
 * 当某个字段改变时，重新验证依赖它的字段
 */
export function useFieldDependencies(formRef) {
  const { validateField } = useFormValidation(formRef)

  /**
   * 注册字段依赖关系
   * @param {Object} dependencies { field: [dependentFields] }
   */
  const registerDependencies = (dependencies) => {
    const form = unref(formRef)
    if (!form) return

    Object.keys(dependencies).forEach(field => {
      const dependentFields = dependencies[field]

      // 监听字段变化
      form.watchField && form.watchField(field, () => {
        // 重新验证依赖字段
        dependentFields.forEach(depField => {
          validateField(depField)
        })
      })
    })
  }

  return {
    registerDependencies
  }
}

export default {
  useFormValidation,
  useFormSubmit,
  useFormErrors,
  useFieldDependencies
}
