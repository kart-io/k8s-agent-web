import { ref, reactive, unref } from 'vue'

/**
 * 表单组合函数
 * 简化表单的验证、提交、重置等操作
 */
export function useForm(options = {}) {
  const {
    schemas = [],
    initialValues = {},
    onSubmit,
    onReset
  } = options

  // 表单引用
  const formRef = ref(null)

  // 表单数据
  const formModel = reactive({ ...initialValues })

  // 提交加载状态
  const submitLoading = ref(false)

  /**
   * 验证表单
   */
  const validate = async () => {
    if (!formRef.value) {
      console.warn('useForm: formRef is not ready')
      return false
    }

    try {
      await formRef.value.validate()
      return true
    } catch (error) {
      console.error('Form validation failed:', error)
      return false
    }
  }

  /**
   * 验证指定字段
   */
  const validateFields = async (fields) => {
    if (!formRef.value) {
      return false
    }

    try {
      await formRef.value.validateFields(fields)
      return true
    } catch (error) {
      console.error('Fields validation failed:', error)
      return false
    }
  }

  /**
   * 清除验证
   */
  const clearValidate = (fields) => {
    formRef.value?.clearValidate(fields)
  }

  /**
   * 重置表单
   */
  const resetFields = (fields) => {
    formRef.value?.resetFields(fields)

    if (onReset) {
      onReset()
    }
  }

  /**
   * 设置字段值
   */
  const setFieldsValue = (values) => {
    Object.assign(formModel, values)
  }

  /**
   * 获取字段值
   */
  const getFieldsValue = () => {
    return { ...formModel }
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    const isValid = await validate()

    if (!isValid) {
      return false
    }

    if (!onSubmit) {
      return true
    }

    try {
      submitLoading.value = true
      await onSubmit(formModel)
      return true
    } catch (error) {
      console.error('Form submit failed:', error)
      return false
    } finally {
      submitLoading.value = false
    }
  }

  /**
   * 重置表单
   */
  const handleReset = () => {
    resetFields()
  }

  /**
   * 设置表单引用
   */
  const setFormRef = (ref) => {
    formRef.value = ref
  }

  return {
    formRef,
    formModel,
    submitLoading,
    schemas,
    validate,
    validateFields,
    clearValidate,
    resetFields,
    setFieldsValue,
    getFieldsValue,
    handleSubmit,
    handleReset,
    setFormRef
  }
}
