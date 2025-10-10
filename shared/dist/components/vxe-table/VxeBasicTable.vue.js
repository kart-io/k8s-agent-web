import { ref, computed, watch, onMounted, nextTick, onActivated, resolveComponent, createElementBlock, openBlock, normalizeClass, createCommentVNode, createElementVNode, renderSlot, toDisplayString, createVNode, mergeProps, withCtx, Fragment, renderList, createBlock, createSlots, normalizeProps, guardReactiveProps } from 'vue';
/* empty css                   */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = {
  key: 0,
  class: "vxe-table-title"
};
const _hoisted_2 = { class: "title-left" };
const _hoisted_3 = { class: "title-text" };
const _hoisted_4 = { class: "title-right" };
const _hoisted_5 = {
  key: 0,
  class: "vxe-custom-pager"
};


const _sfc_main = {
  __name: 'VxeBasicTable',
  props: {
  // 表格标题
  title: {
    type: String,
    default: ''
  },
  // 表格配置
  gridOptions: {
    type: Object,
    default: () => ({})
  },
  // 表格事件
  gridEvents: {
    type: Object,
    default: () => ({})
  },
  // 表单配置
  formOptions: {
    type: Object,
    default: () => ({})
  },
  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true
  },
  // 是否显示分页
  showPager: {
    type: Boolean,
    default: true
  },
  // 是否立即加载
  immediate: {
    type: Boolean,
    default: true
  },
  // 表格类名
  tableClass: {
    type: [String, Array, Object],
    default: ''
  },
  // 表格样式
  tableStyle: {
    type: Object,
    default: () => ({})
  },
  // API 请求方法
  api: {
    type: Function,
    default: null
  },
  // 请求参数
  params: {
    type: Object,
    default: () => ({})
  },
  // 数据源
  dataSource: {
    type: Array,
    default: null
  },
  // 分页配置
  pagination: {
    type: [Object, Boolean],
    default: () => ({})
  },
  // 是否自动高度
  autoHeight: {
    type: Boolean,
    default: true
  },
  // 最大高度
  maxHeight: {
    type: [Number, String],
    default: null
  }
},
  emits: [
  'register',
  'checkbox-change',
  'checkbox-all',
  'page-change',
  'sort-change',
  'filter-change',
  'toolbar-button-click',
  'load-success',
  'load-error'
],
  setup(__props, { expose: __expose, emit }) {

const props = __props;





const isFullScreen = ref(false);
const gridContainer = ref(null);
const gridRef = ref(null);
const loading = ref(false);
const tableData = ref([]);
const pagerConfig = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 提取列配置
const columns = computed(() => {
  return props.gridOptions?.columns || []
});

// 表格选项（不包含列）
const tableOptions = computed(() => {
  const { columns: _, ...options } = props.gridOptions || {};
  return {
    border: 'inner',
    round: true,
    showOverflow: 'title',
    showHeaderOverflow: 'title',
    stripe: true,
    align: 'left',
    headerAlign: 'left',
    rowConfig: {
      isHover: true,
      isCurrent: false
    },
    cellConfig: {
      height: 54
    },
    columnConfig: {
      resizable: true,
      minWidth: 100
    },
    autoResize: true,
    scrollY: {
      enabled: true,
      gt: 20
    },
    emptyText: '暂无数据',
    ...options
  }
});

// 加载数据
const loadData = async () => {
  if (!props.api) {
    // 如果没有 API，使用 dataSource
    if (props.dataSource) {
      tableData.value = props.dataSource;
    }
    return
  }

  loading.value = true;
  console.log('[VxeBasicTable] loadData called, current page:', pagerConfig.value.currentPage);

  try {
    const params = {
      page: pagerConfig.value.currentPage,
      pageSize: pagerConfig.value.pageSize,
      ...props.params
    };

    console.log('[VxeBasicTable] Calling API with params:', params);
    const result = await props.api(params);
    console.log('[VxeBasicTable] API result:', result);

    if (result && result.data) {
      tableData.value = result.data.list || result.data || [];
      pagerConfig.value.total = result.data.total || 0;

      console.log('[VxeBasicTable] Data loaded successfully, count:', tableData.value.length, 'total:', pagerConfig.value.total);
      emit('load-success', result.data);
    } else {
      console.warn('[VxeBasicTable] API returned invalid data structure:', result);
      tableData.value = [];
      pagerConfig.value.total = 0;
    }
  } catch (error) {
    console.error('[VxeBasicTable] 加载数据失败:', error);
    tableData.value = [];
    pagerConfig.value.total = 0;
    emit('load-error', error);
  } finally {
    loading.value = false;
    console.log('[VxeBasicTable] loadData finished, loading:', loading.value, 'data count:', tableData.value.length);
  }
};

// 分页变化
const handlePageChange = (page, pageSize) => {
  pagerConfig.value.currentPage = page;
  pagerConfig.value.pageSize = pageSize;
  loadData();
  emit('page-change', { currentPage: page, pageSize });
};

// 暴露的 API 方法
const tableApi = {
  reload: () => {
    pagerConfig.value.currentPage = 1;
    loadData();
  },
  query: () => {
    pagerConfig.value.currentPage = 1;
    loadData();
  },
  refresh: () => {
    loadData();
  },
  getTableData: () => tableData.value,
  setTableData: (data) => {
    tableData.value = data;
  }
};

// 监听 dataSource 变化
watch(() => props.dataSource, (newVal) => {
  if (newVal && !props.api) {
    tableData.value = newVal;
  }
}, { immediate: true });

// 监听 params 变化
watch(() => props.params, () => {
  if (props.api) {
    loadData();
  }
}, { deep: true });

// 组件挂载
onMounted(() => {
  console.log('[VxeBasicTable] Component mounted, immediate:', props.immediate, 'has api:', !!props.api);
  nextTick(() => {
    console.log('[VxeBasicTable] nextTick, emitting register event');
    emit('register', tableApi);

    if (props.immediate && props.api) {
      console.log('[VxeBasicTable] immediate is true and api exists, calling loadData()');
      loadData();
    } else {
      console.log('[VxeBasicTable] Skipping initial loadData, immediate:', props.immediate, 'api:', !!props.api);
    }
  });
});

// 组件激活（用于 keep-alive 场景，如 Wujie 微前端）
// 注意：这个钩子只在使用 <keep-alive> 包裹的组件中才会触发
// Wujie 的 alive 模式在主应用层面实现 keep-alive，子应用内部的组件不会触发 onActivated
// 所以这个钩子主要用于子应用内部使用 keep-alive 的场景
onActivated(() => {
  console.log('[VxeBasicTable] onActivated triggered');
  // 在 keep-alive 场景中，组件激活时刷新数据
  if (props.immediate && props.api && tableData.value.length === 0) {
    console.log('[VxeBasicTable] onActivated: loading data because tableData is empty');
    loadData();
  }
});

// 暴露 API 方法
__expose({
  gridContainer,
  gridRef,
  ...tableApi
});

return (_ctx, _cache) => {
  const _component_vxe_column = resolveComponent("vxe-column");
  const _component_vxe_table = resolveComponent("vxe-table");
  const _component_a_pagination = resolveComponent("a-pagination");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["vxe-basic-table", { 'is-full-screen': isFullScreen.value }])
  }, [
    (__props.title)
      ? (openBlock(), createElementBlock("div", _hoisted_1, [
          createElementVNode("div", _hoisted_2, [
            renderSlot(_ctx.$slots, "title", {}, () => [
              createElementVNode("span", _hoisted_3, toDisplayString(__props.title), 1)
            ], true)
          ]),
          createElementVNode("div", _hoisted_4, [
            renderSlot(_ctx.$slots, "title-right", {}, undefined, true)
          ])
        ]))
      : createCommentVNode("", true),
    createElementVNode("div", {
      ref_key: "gridContainer",
      ref: gridContainer,
      class: "vxe-grid-container"
    }, [
      createVNode(_component_vxe_table, mergeProps({
        ref_key: "gridRef",
        ref: gridRef
      }, tableOptions.value, {
        data: tableData.value,
        loading: loading.value,
        class: "vxe-table-main"
      }), {
        default: withCtx(() => [
          (openBlock(true), createElementBlock(Fragment, null, renderList(columns.value, (col, index) => {
            return (openBlock(), createBlock(_component_vxe_column, mergeProps({ key: index }, col), createSlots({ _: 2 }, [
              (col.slots?.default)
                ? {
                    name: "default",
                    fn: withCtx((scope) => [
                      renderSlot(_ctx.$slots, col.slots.default, normalizeProps(guardReactiveProps(scope)), undefined, true)
                    ]),
                    key: "0"
                  }
                : undefined
            ]), 1040))
          }), 128))
        ]),
        _: 3
      }, 16, ["data", "loading"]),
      (__props.showPager)
        ? (openBlock(), createElementBlock("div", _hoisted_5, [
            createVNode(_component_a_pagination, {
              current: pagerConfig.value.currentPage,
              "onUpdate:current": _cache[0] || (_cache[0] = $event => ((pagerConfig.value.currentPage) = $event)),
              "page-size": pagerConfig.value.pageSize,
              "onUpdate:pageSize": _cache[1] || (_cache[1] = $event => ((pagerConfig.value.pageSize) = $event)),
              total: pagerConfig.value.total,
              "show-total": total => `共 ${total} 条`,
              "show-size-changer": true,
              "page-size-options": ['10', '20', '50', '100'],
              onChange: handlePageChange,
              onShowSizeChange: handlePageChange
            }, null, 8, ["current", "page-size", "total", "show-total"])
          ]))
        : createCommentVNode("", true)
    ], 512)
  ], 2))
}
}

};
const VxeBasicTable = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-353298b6"]]);

export { VxeBasicTable as default };
//# sourceMappingURL=VxeBasicTable.vue.js.map
