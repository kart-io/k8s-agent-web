import { reactive, computed } from 'vue'

/**
 * 分页钩子
 * 用于管理分页状态
 */
export function usePagination(options = {}) {
  const {
    current = 1,
    pageSize = 10,
    total = 0,
    showSizeChanger = true,
    showQuickJumper = true,
    pageSizeOptions = ['10', '20', '50', '100']
  } = options

  const pagination = reactive({
    current,
    pageSize,
    total,
    showSizeChanger,
    showQuickJumper,
    pageSizeOptions,
    showTotal: (total) => `共 ${total} 条`
  })

  /**
   * 设置当前页
   */
  const setPage = (page) => {
    pagination.current = page
  }

  /**
   * 设置每页条数
   */
  const setPageSize = (size) => {
    pagination.pageSize = size
    // 重置到第一页
    pagination.current = 1
  }

  /**
   * 设置总数
   */
  const setTotal = (total) => {
    pagination.total = total
  }

  /**
   * 重置分页
   */
  const reset = () => {
    pagination.current = current
    pagination.pageSize = pageSize
    pagination.total = total
  }

  /**
   * 处理分页变化
   */
  const handleChange = (page, pageSize) => {
    pagination.current = page
    pagination.pageSize = pageSize
  }

  /**
   * 上一页
   */
  const prev = () => {
    if (pagination.current > 1) {
      pagination.current--
    }
  }

  /**
   * 下一页
   */
  const next = () => {
    const maxPage = Math.ceil(pagination.total / pagination.pageSize)
    if (pagination.current < maxPage) {
      pagination.current++
    }
  }

  /**
   * 跳转到第一页
   */
  const first = () => {
    pagination.current = 1
  }

  /**
   * 跳转到最后一页
   */
  const last = () => {
    const maxPage = Math.ceil(pagination.total / pagination.pageSize)
    pagination.current = maxPage
  }

  /**
   * 获取分页参数（用于API请求）
   */
  const getParams = computed(() => {
    return {
      page: pagination.current,
      pageSize: pagination.pageSize
    }
  })

  return {
    pagination,
    setPage,
    setPageSize,
    setTotal,
    reset,
    handleChange,
    prev,
    next,
    first,
    last,
    getParams
  }
}
