import { ref } from 'vue'

/**
 * 加载状态钩子
 * 用于管理异步操作的加载状态
 */
export function useLoading(initialLoading = false) {
  const loading = ref(initialLoading)

  /**
   * 设置加载状态
   */
  const setLoading = (value) => {
    loading.value = value
  }

  /**
   * 开始加载
   */
  const startLoading = () => {
    loading.value = true
  }

  /**
   * 结束加载
   */
  const endLoading = () => {
    loading.value = false
  }

  /**
   * 包装异步函数，自动管理加载状态
   */
  const withLoading = async (fn, ...args) => {
    try {
      startLoading()
      return await fn(...args)
    } finally {
      endLoading()
    }
  }

  /**
   * 创建带加载状态的函数
   */
  const createLoadingFn = (fn) => {
    return async (...args) => {
      return await withLoading(fn, ...args)
    }
  }

  return {
    loading,
    setLoading,
    startLoading,
    endLoading,
    withLoading,
    createLoadingFn
  }
}
