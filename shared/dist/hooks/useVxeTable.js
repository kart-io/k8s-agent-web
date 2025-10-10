import { ref, computed, unref, nextTick } from 'vue';

/**
 * VXE Table 表格 Hook
 * 参考 vue-vben-admin 实现
 *
 * ⚠️ 注意：此 Hook 不直接导入 vxe-table，只提供状态管理和 API
 * 实际的 VXE Table 组件需要在应用层集成
 */

/**
 * 使用 VXE Table
 * @param {Object} options 配置选项
 * @returns {Array} [gridRef, gridApi]
 */
function useVxeTable(options = {}) {
  const {
    gridOptions = {},
    gridEvents = {},
    formOptions = {},
    tableTitle = '',
    showToolbar = true,
    showPager = true,
    immediate = true
  } = options;

  const gridRef = ref(null);
  const loading = ref(false);
  const dataSource = ref([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(gridOptions.pagerConfig?.pageSize || 10);

  /**
   * 获取表格实例
   */
  const getGrid = () => {
    const grid = unref(gridRef);
    if (!grid) {
      console.error('Grid instance is not ready');
    }
    return grid
  };

  /**
   * 设置加载状态
   */
  const setLoading = (value) => {
    loading.value = value;
    const grid = getGrid();
    if (grid) {
      grid.setLoading && grid.setLoading(value);
    }
  };

  /**
   * 设置数据源
   */
  const setDataSource = (data) => {
    dataSource.value = data;
    const grid = getGrid();
    if (grid) {
      grid.reloadData && grid.reloadData(data);
    }
  };

  /**
   * 获取数据源
   */
  const getDataSource = () => {
    return dataSource.value
  };

  /**
   * 重新加载数据
   */
  const reload = async (opt = {}) => {
    const grid = getGrid();
    if (!grid) return

    setLoading(true);
    try {
      // 如果配置了 ajax，使用 commitProxy 重新加载
      if (gridOptions.proxyConfig?.ajax) {
        await grid.commitProxy('query');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 查询数据
   */
  const query = async () => {
    currentPage.value = 1;
    await reload();
  };

  /**
   * 获取查询参数
   */
  const getQueryParams = () => {
    const grid = getGrid();
    if (!grid) return {}

    const { sortBy, filterBy } = grid.getProxyInfo?.() || {};
    return {
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy,
      filterBy
    }
  };

  /**
   * 清空数据
   */
  const clearData = () => {
    setDataSource([]);
    total.value = 0;
  };

  /**
   * 获取选中的行
   */
  const getSelectRecords = () => {
    const grid = getGrid();
    if (!grid) return []

    return grid.getCheckboxRecords ? grid.getCheckboxRecords() : []
  };

  /**
   * 获取选中的行数据
   */
  const getSelectRows = () => {
    return getSelectRecords()
  };

  /**
   * 设置选中的行
   */
  const setSelectRows = (rows) => {
    const grid = getGrid();
    if (!grid) return

    if (grid.setCheckboxRow) {
      grid.setCheckboxRow(rows, true);
    }
  };

  /**
   * 清空选中
   */
  const clearSelect = () => {
    const grid = getGrid();
    if (!grid) return

    if (grid.clearCheckboxRow) {
      grid.clearCheckboxRow();
    }
  };

  /**
   * 删除选中的行
   */
  const deleteSelectRows = async () => {
    const grid = getGrid();
    if (!grid) return

    const selectRecords = getSelectRecords();
    if (selectRecords.length === 0) {
      console.warn('No rows selected');
      return
    }

    await grid.remove(selectRecords);
  };

  /**
   * 插入一行
   */
  const insertRow = async (record = {}) => {
    const grid = getGrid();
    if (!grid) return

    const { row } = await grid.insertAt(record, -1);
    return row
  };

  /**
   * 删除行
   */
  const deleteRow = async (row) => {
    const grid = getGrid();
    if (!grid) return

    await grid.remove(row);
  };

  /**
   * 更新行数据
   */
  const updateRow = async (row, record) => {
    const grid = getGrid();
    if (!grid) return

    await grid.reloadRow(row, record);
  };

  /**
   * 获取表格数据
   */
  const getTableData = () => {
    const grid = getGrid();
    if (!grid) return []

    return grid.getTableData ? grid.getTableData().fullData : []
  };

  /**
   * 设置表格配置
   */
  const setGridOptions = (options) => {
    const grid = getGrid();
    if (!grid) return

    Object.assign(gridOptions, options);
    nextTick(() => {
      grid.refreshColumn && grid.refreshColumn();
    });
  };

  /**
   * 刷新列配置
   */
  const refreshColumn = async () => {
    const grid = getGrid();
    if (!grid) return

    await nextTick();
    grid.refreshColumn && grid.refreshColumn();
  };

  /**
   * 刷新表格
   */
  const refresh = async () => {
    const grid = getGrid();
    if (!grid) return

    await nextTick();
    grid.syncData && grid.syncData();
  };

  /**
   * 导出数据
   */
  const exportData = (options = {}) => {
    const grid = getGrid();
    if (!grid) return

    grid.exportData && grid.exportData(options);
  };

  /**
   * 打印表格
   */
  const print = (options = {}) => {
    const grid = getGrid();
    if (!grid) return

    grid.print && grid.print(options);
  };

  /**
   * 展开所有树节点
   */
  const expandAll = () => {
    const grid = getGrid();
    if (!grid) return

    grid.setAllTreeExpand && grid.setAllTreeExpand(true);
  };

  /**
   * 折叠所有树节点
   */
  const collapseAll = () => {
    const grid = getGrid();
    if (!grid) return

    grid.clearTreeExpand && grid.clearTreeExpand();
  };

  /**
   * 设置树节点展开状态
   */
  const setTreeExpand = (rows, expanded) => {
    const grid = getGrid();
    if (!grid) return

    grid.setTreeExpand && grid.setTreeExpand(rows, expanded);
  };

  /**
   * 获取表单数据
   */
  const getFormData = () => {
    const grid = getGrid();
    if (!grid) return {}

    return grid.getFormItems ? grid.getFormItems() : {}
  };

  /**
   * 设置表单数据
   */
  const setFormData = (data) => {
    const grid = getGrid();
    if (!grid) return

    grid.setFormItems && grid.setFormItems(data);
  };

  /**
   * 清空表单
   */
  const clearFormData = () => {
    const grid = getGrid();
    if (!grid) return

    grid.clearFormItems && grid.clearFormItems();
  };

  /**
   * 全屏切换
   */
  const toggleFullScreen = () => {
    const grid = getGrid();
    if (!grid) return

    grid.zoom && grid.zoom();
  };

  /**
   * 分页变化处理
   */
  const handlePageChange = ({ currentPage: page, pageSize: size }) => {
    currentPage.value = page;
    pageSize.value = size;
    reload();
  };

  // 合并的 grid 配置
  const mergedGridOptions = computed(() => {
    return {
      ...gridOptions,
      loading: loading.value,
      data: dataSource.value,
      pagerConfig: showPager ? {
        enabled: true,
        currentPage: currentPage.value,
        pageSize: pageSize.value,
        total: total.value,
        ...gridOptions.pagerConfig
      } : false,
      toolbarConfig: showToolbar ? {
        enabled: true,
        ...gridOptions.toolbarConfig
      } : false,
      ...gridEvents
    }
  });

  // Grid API
  const gridApi = {
    gridRef,
    loading,
    dataSource,
    total,
    currentPage,
    pageSize,
    getGrid,
    setLoading,
    setDataSource,
    getDataSource,
    reload,
    query,
    getQueryParams,
    clearData,
    getSelectRecords,
    getSelectRows,
    setSelectRows,
    clearSelect,
    deleteSelectRows,
    insertRow,
    deleteRow,
    updateRow,
    getTableData,
    setGridOptions,
    refreshColumn,
    refresh,
    exportData,
    print,
    expandAll,
    collapseAll,
    setTreeExpand,
    getFormData,
    setFormData,
    clearFormData,
    toggleFullScreen,
    handlePageChange
  };

  return [gridRef, gridApi, mergedGridOptions]
}

/**
 * 使用 VXE Grid
 * 简化版本的 useVxeTable
 */
function useVxeGrid(props = {}) {
  const { gridOptions, gridEvents, ...rest } = props;

  const [gridRef, gridApi, mergedGridOptions] = useVxeTable({
    gridOptions,
    gridEvents,
    ...rest
  });

  return {
    gridRef,
    gridApi,
    gridOptions: mergedGridOptions
  }
}

export { useVxeGrid, useVxeTable };
//# sourceMappingURL=useVxeTable.js.map
