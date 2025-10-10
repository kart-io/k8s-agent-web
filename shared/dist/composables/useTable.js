import { ref, reactive } from 'vue';

/**
 * 表格组合函数
 * 用于简化表格操作，包括加载、分页、搜索等
 */
function useTable(options = {}) {
  const {
    api,
    immediate = true,
    searchParams = {},
    pagination: paginationOptions = {}
  } = options;

  // 表格数据
  const dataSource = ref([]);

  // 加载状态
  const loading = ref(false);

  // 分页信息
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    ...paginationOptions
  });

  // 搜索参数
  const search = reactive({ ...searchParams });

  /**
   * 加载数据
   */
  const loadData = async (params = {}) => {
    if (!api) {
      console.warn('useTable: api is required');
      return
    }

    try {
      loading.value = true;

      const requestParams = {
        ...search,
        ...params,
        page: pagination.current,
        pageSize: pagination.pageSize
      };

      const result = await api(requestParams);

      // 支持不同的返回格式
      if (Array.isArray(result)) {
        dataSource.value = result;
      } else if (result.data) {
        dataSource.value = result.data;
        pagination.total = result.total || 0;
      } else {
        dataSource.value = [];
      }
    } catch (error) {
      console.error('Failed to load table data:', error);
      dataSource.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 刷新数据（保持当前页）
   */
  const reload = async (params = {}) => {
    await loadData(params);
  };

  /**
   * 重新加载（重置到第一页）
   */
  const reset = async (params = {}) => {
    pagination.current = 1;
    await loadData(params);
  };

  /**
   * 设置搜索参数
   */
  const setSearch = (params = {}) => {
    Object.assign(search, params);
    reset();
  };

  /**
   * 重置搜索参数
   */
  const resetSearch = () => {
    Object.keys(search).forEach(key => {
      search[key] = searchParams[key] || undefined;
    });
    reset();
  };

  /**
   * 表格变化处理（分页、排序、筛选）
   */
  const handleTableChange = (pag, filters, sorter) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;

    const params = {};

    // 处理排序
    if (sorter && sorter.field) {
      params.sortField = sorter.field;
      params.sortOrder = sorter.order;
    }

    // 处理筛选
    if (filters) {
      Object.assign(params, filters);
    }

    loadData(params);
  };

  /**
   * 删除后刷新
   */
  const deleteAndReload = async (deleteFn) => {
    try {
      await deleteFn();

      // 如果删除后当前页没数据了，回到上一页
      if (dataSource.value.length === 1 && pagination.current > 1) {
        pagination.current--;
      }

      await reload();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // 立即加载
  if (immediate && api) {
    loadData();
  }

  return {
    dataSource,
    loading,
    pagination,
    search,
    loadData,
    reload,
    reset,
    setSearch,
    resetSearch,
    handleTableChange,
    deleteAndReload
  }
}

export { useTable };
//# sourceMappingURL=useTable.js.map
