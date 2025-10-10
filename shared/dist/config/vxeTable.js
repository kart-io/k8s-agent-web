/**
 * VXE Table 全局配置
 * 参考 vue-vben-admin 实现
 *
 * ⚠️ 注意：此文件仅提供配置对象，不直接导入 vxe-table
 * 实际的 vxe-table 初始化需要在应用层完成
 */

/**
 * 默认配置
 */
const defaultVxeTableConfig = {
  size: 'medium',
  zIndex: 999,
  version: 0,
  table: {
    border: false,
    stripe: false,
    align: 'left',
    headerAlign: 'center',
    rowConfig: {
      isHover: true
    },
    columnConfig: {
      resizable: true,
      minWidth: 80
    },
    showOverflow: 'title',
    showHeaderOverflow: 'title',
    autoResize: true,
    emptyText: '暂无数据',
    fit: true
  },
  grid: {
    toolbarConfig: {
      enabled: true
    },
    pagerConfig: {
      enabled: true
    },
    formConfig: {
      enabled: true
    },
    proxyConfig: {
      enabled: false,
      autoLoad: true,
      message: true,
      props: {
        list: 'result',
        result: 'result',
        total: 'page.total'
      }
    }
  },
  pager: {
    pageSize: 10,
    pageSizes: [10, 15, 20, 50, 100],
    align: 'left',
    layouts: ['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'Sizes', 'FullJump', 'Total'],
    border: false,
    background: false,
    perfect: true
  },
  toolbar: {
    buttons: [],
    tools: [],
    refresh: true,
    import: false,
    export: false,
    print: false,
    zoom: false,
    custom: true
  },
  form: {
    titleColon: false,
    titleAlign: 'right',
    titleWidth: 100,
    align: 'left'
  }
};

/**
 * 创建 VXE Table 配置
 * @param {Object} options 自定义配置
 * @returns {Object} 合并后的配置对象
 */
function createVxeTableConfig(options = {}) {
  return {
    ...defaultVxeTableConfig,
    ...options,
    table: {
      ...defaultVxeTableConfig.table,
      ...(options.table || {})
    },
    grid: {
      ...defaultVxeTableConfig.grid,
      ...(options.grid || {})
    },
    pager: {
      ...defaultVxeTableConfig.pager,
      ...(options.pager || {})
    },
    toolbar: {
      ...defaultVxeTableConfig.toolbar,
      ...(options.toolbar || {})
    },
    form: {
      ...defaultVxeTableConfig.form,
      ...(options.form || {})
    }
  }
}

/**
 * 初始化 VXE Table 的辅助函数
 *
 * ⚠️ 此函数需要在应用层调用，确保 vxe-table 已安装
 *
 * @example
 * // 在应用的 main.js 中
 * import VXETable from 'vxe-table'
 * import VXETablePluginAntd from 'vxe-table-plugin-antd'
 * import 'vxe-table/lib/style.css'
 * import 'vxe-table-plugin-antd/dist/style.css'
 * import { createVxeTableConfig } from '@k8s-agent/shared/config/vxeTable'
 *
 * VXETable.use(VXETablePluginAntd)
 * const config = createVxeTableConfig({ size: 'medium' })
 * VXETable.setConfig(config)
 *
 * @param {Function} VXETable VXE Table 实例
 * @param {Object} options 配置选项
 */
function setupVxeTable(VXETable, options = {}) {
  if (!VXETable) {
    console.error('[VXE Table] VXETable instance is required');
    return
  }

  const config = createVxeTableConfig(options);
  VXETable.setConfig(config);

  console.log('[VXE Table] 配置已应用');
}

/**
 * @deprecated 请使用 setupVxeTable 并传入 VXETable 实例
 */
function initVxeTable(options = {}) {
  console.warn('[VXE Table] initVxeTable 已废弃，请在应用层手动初始化 VXE Table');
  console.warn('[VXE Table] 参考文档: VXE_TABLE_INTEGRATION.md');
  return createVxeTableConfig(options)
}

const vxeTable = {
  defaultVxeTableConfig,
  createVxeTableConfig,
  setupVxeTable,
  initVxeTable
};

export { createVxeTableConfig, vxeTable as default, defaultVxeTableConfig, initVxeTable, setupVxeTable };
//# sourceMappingURL=vxeTable.js.map
