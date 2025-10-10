import { computed, ref, watch, resolveComponent, createElementBlock, openBlock, createCommentVNode, createVNode, createElementVNode, renderSlot, toDisplayString, withCtx, createBlock, createTextVNode, unref, mergeProps, createSlots, renderList, normalizeProps, guardReactiveProps } from 'vue';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons-vue';
/* empty css                */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "basic-table" };
const _hoisted_2 = {
  key: 0,
  class: "table-toolbar"
};
const _hoisted_3 = { class: "toolbar-left" };
const _hoisted_4 = {
  key: 0,
  class: "table-title"
};
const _hoisted_5 = { class: "toolbar-right" };


const _sfc_main = {
  __name: 'BasicTable',
  props: {
  // 数据源
  dataSource: {
    type: Array,
    default: () => []
  },
  // 列配置
  columns: {
    type: Array,
    default: () => []
  },
  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true
  },
  // 表格标题
  title: {
    type: String,
    default: ''
  },
  // 是否显示刷新按钮
  showRefresh: {
    type: Boolean,
    default: true
  },
  // 是否显示列设置按钮
  showColumnSetting: {
    type: Boolean,
    default: false
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 分页配置
  pagination: {
    type: [Object, Boolean],
    default: () => ({})
  },
  // 行的 key
  rowKey: {
    type: [String, Function],
    default: 'id'
  },
  // 滚动配置
  scroll: {
    type: Object,
    default: () => ({ x: 'max-content' })
  },
  // 操作列配置
  actionColumn: {
    type: Object,
    default: null
  },
  // 请求数据的方法
  api: {
    type: Function,
    default: null
  },
  // 立即加载
  immediate: {
    type: Boolean,
    default: true
  },
  // 请求参数
  searchParams: {
    type: Object,
    default: () => ({})
  }
},
  emits: ['refresh', 'edit', 'delete', 'change', 'register'],
  setup(__props, { expose: __expose, emit }) {

const props = __props;





// 内部分页配置
const innerPagination = computed(() => {
  if (props.pagination === false) {
    return false
  }
  return {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    ...props.pagination
  }
});

// 内部列配置（添加操作列）
const innerColumns = computed(() => {
  const cols = [...props.columns];
  if (props.actionColumn) {
    cols.push({
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      ...props.actionColumn,
      slots: { customRender: 'action' }
    });
  }
  return cols
});

// 刷新
const handleRefresh = () => {
  emit('refresh');
  if (props.api) {
    reload();
  }
};

// 编辑
const handleEdit = (record) => {
  emit('edit', record);
};

// 删除
const handleDelete = (record) => {
  emit('delete', record);
};

// 表格变化（分页、排序、筛选）
const handleTableChange = (pagination, filters, sorter) => {
  emit('change', { pagination, filters, sorter });
};

// 加载数据
const loading = ref(false);
const reload = async (params = {}) => {
  if (!props.api) return

  try {
    loading.value = true;
    const mergedParams = { ...props.searchParams, ...params };

    // 如果有分页配置，添加分页参数
    if (innerPagination.value) {
      mergedParams.page = innerPagination.value.current;
      mergedParams.pageSize = innerPagination.value.pageSize;
    }

    const result = await props.api(mergedParams);

    // 假设返回格式为 { data: [], total: 0 }
    if (result.data) {
      emit('update:dataSource', result.data);
      if (innerPagination.value) {
        innerPagination.value.total = result.total || 0;
      }
    }
  } catch (error) {
    console.error('Failed to load table data:', error);
  } finally {
    loading.value = false;
  }
};

// 立即加载
if (props.immediate && props.api) {
  reload();
}

// 监听搜索参数变化
watch(() => props.searchParams, () => {
  if (props.api) {
    reload();
  }
}, { deep: true });

// 暴露方法给父组件
__expose({
  reload
});

// 注册表格实例
emit('register', { reload });

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");
  const _component_a_space = resolveComponent("a-space");
  const _component_a_popconfirm = resolveComponent("a-popconfirm");
  const _component_a_table = resolveComponent("a-table");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    (__props.showToolbar)
      ? (openBlock(), createElementBlock("div", _hoisted_2, [
          createElementVNode("div", _hoisted_3, [
            renderSlot(_ctx.$slots, "toolbar-left", {}, () => [
              (__props.title)
                ? (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString(__props.title), 1))
                : createCommentVNode("", true)
            ], true)
          ]),
          createElementVNode("div", _hoisted_5, [
            renderSlot(_ctx.$slots, "toolbar-right", {}, () => [
              createVNode(_component_a_space, null, {
                default: withCtx(() => [
                  (__props.showRefresh)
                    ? (openBlock(), createBlock(_component_a_button, {
                        key: 0,
                        onClick: handleRefresh
                      }, {
                        icon: withCtx(() => [
                          createVNode(unref(ReloadOutlined))
                        ]),
                        default: withCtx(() => [
                          createTextVNode(" 刷新 ")
                        ]),
                        _: 1
                      }))
                    : createCommentVNode("", true),
                  (__props.showColumnSetting)
                    ? (openBlock(), createBlock(_component_a_button, { key: 1 }, {
                        icon: withCtx(() => [
                          createVNode(unref(SettingOutlined))
                        ]),
                        default: withCtx(() => [
                          createTextVNode(" 列设置 ")
                        ]),
                        _: 1
                      }))
                    : createCommentVNode("", true)
                ]),
                _: 1
              })
            ], true)
          ])
        ]))
      : createCommentVNode("", true),
    createVNode(_component_a_table, mergeProps(_ctx.$attrs, {
      columns: innerColumns.value,
      "data-source": __props.dataSource,
      loading: loading.value,
      pagination: innerPagination.value,
      "row-key": __props.rowKey,
      scroll: __props.scroll,
      onChange: handleTableChange
    }), createSlots({ _: 2 }, [
      renderList(_ctx.$slots, (_, name) => {
        return {
          name: name,
          fn: withCtx((slotData) => [
            renderSlot(_ctx.$slots, name, normalizeProps(guardReactiveProps(slotData || {})), undefined, true)
          ])
        }
      }),
      (__props.actionColumn)
        ? {
            name: "action",
            fn: withCtx(({ record }) => [
              renderSlot(_ctx.$slots, "action", { record: record }, () => [
                createVNode(_component_a_space, null, {
                  default: withCtx(() => [
                    (__props.actionColumn.edit)
                      ? (openBlock(), createBlock(_component_a_button, {
                          key: 0,
                          type: "link",
                          size: "small",
                          onClick: $event => (handleEdit(record))
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" 编辑 ")
                          ]),
                          _: 2
                        }, 1032, ["onClick"]))
                      : createCommentVNode("", true),
                    (__props.actionColumn.delete)
                      ? (openBlock(), createBlock(_component_a_popconfirm, {
                          key: 1,
                          title: "确定要删除吗？",
                          onConfirm: $event => (handleDelete(record))
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_a_button, {
                              type: "link",
                              danger: "",
                              size: "small"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("删除")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 2
                        }, 1032, ["onConfirm"]))
                      : createCommentVNode("", true)
                  ]),
                  _: 2
                }, 1024)
              ], true)
            ]),
            key: "0"
          }
        : undefined
    ]), 1040, ["columns", "data-source", "loading", "pagination", "row-key", "scroll"])
  ]))
}
}

};
const BasicTable = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-80a25e43"]]);

export { BasicTable as default };
//# sourceMappingURL=BasicTable.vue.js.map
