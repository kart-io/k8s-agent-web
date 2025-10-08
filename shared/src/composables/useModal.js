import { ref, reactive, unref } from 'vue'

/**
 * 模态框组合函数
 * 简化模态框的打开、关闭、提交等操作
 */
export function useModal(options = {}) {
  const {
    onOk,
    onCancel,
    afterClose
  } = options

  // 可见性
  const visible = ref(false)

  // 确认加载状态
  const confirmLoading = ref(false)

  // 模态框数据
  const modalData = reactive({})

  /**
   * 打开模态框
   */
  const open = (data = {}) => {
    visible.value = true
    Object.assign(modalData, data)
  }

  /**
   * 关闭模态框
   */
  const close = () => {
    visible.value = false
  }

  /**
   * 确定按钮处理
   */
  const handleOk = async () => {
    if (!onOk) {
      close()
      return
    }

    try {
      confirmLoading.value = true
      await onOk(modalData)
      close()
    } catch (error) {
      console.error('Modal ok failed:', error)
      // 不关闭模态框，让用户可以修改
    } finally {
      confirmLoading.value = false
    }
  }

  /**
   * 取消按钮处理
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    close()
  }

  /**
   * 关闭后回调
   */
  const handleAfterClose = () => {
    // 清空数据
    Object.keys(modalData).forEach(key => {
      delete modalData[key]
    })

    if (afterClose) {
      afterClose()
    }
  }

  /**
   * 设置模态框数据
   */
  const setModalData = (data = {}) => {
    Object.assign(modalData, data)
  }

  /**
   * 重置模态框数据
   */
  const resetModalData = () => {
    Object.keys(modalData).forEach(key => {
      delete modalData[key]
    })
  }

  /**
   * 设置加载状态
   */
  const setConfirmLoading = (loading) => {
    confirmLoading.value = loading
  }

  return {
    visible,
    confirmLoading,
    modalData,
    open,
    close,
    handleOk,
    handleCancel,
    handleAfterClose,
    setModalData,
    resetModalData,
    setConfirmLoading
  }
}
