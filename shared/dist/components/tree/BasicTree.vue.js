import { ref, watch, resolveComponent, createBlock, openBlock, createSlots, withCtx, renderSlot } from 'vue';

const _sfc_main = {
  __name: 'BasicTree',
  props: {
  // 树数据
  treeData: {
    type: Array,
    default: () => []
  },
  // 是否可勾选
  checkable: {
    type: Boolean,
    default: false
  },
  // 是否可选择
  selectable: {
    type: Boolean,
    default: true
  },
  // 是否支持多选
  multiple: {
    type: Boolean,
    default: false
  },
  // 是否显示连接线
  showLine: {
    type: Boolean,
    default: false
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: false
  },
  // 默认展开所有
  defaultExpandAll: {
    type: Boolean,
    default: false
  },
  // 异步加载数据
  loadData: {
    type: Function
  },
  // 字段名称映射
  fieldNames: {
    type: Object,
    default: () => ({
      children: 'children',
      title: 'title',
      key: 'key'
    })
  },
  // 默认展开的节点
  defaultExpandedKeys: {
    type: Array,
    default: () => []
  },
  // 默认选中的节点
  defaultSelectedKeys: {
    type: Array,
    default: () => []
  },
  // 默认勾选的节点
  defaultCheckedKeys: {
    type: Array,
    default: () => []
  }
},
  emits: ['select', 'check', 'expand', 'update:expandedKeys', 'update:selectedKeys', 'update:checkedKeys'],
  setup(__props, { emit }) {

const props = __props;





const expandedKeys = ref(props.defaultExpandedKeys);
const selectedKeys = ref(props.defaultSelectedKeys);
const checkedKeys = ref(props.defaultCheckedKeys);

watch(() => props.defaultExpandedKeys, (val) => {
  expandedKeys.value = val;
});

watch(() => props.defaultSelectedKeys, (val) => {
  selectedKeys.value = val;
});

watch(() => props.defaultCheckedKeys, (val) => {
  checkedKeys.value = val;
});

const handleSelect = (keys, event) => {
  selectedKeys.value = keys;
  emit('update:selectedKeys', keys);
  emit('select', keys, event);
};

const handleCheck = (keys, event) => {
  checkedKeys.value = keys;
  emit('update:checkedKeys', keys);
  emit('check', keys, event);
};

const handleExpand = (keys, event) => {
  expandedKeys.value = keys;
  emit('update:expandedKeys', keys);
  emit('expand', keys, event);
};

return (_ctx, _cache) => {
  const _component_a_tree = resolveComponent("a-tree");

  return (openBlock(), createBlock(_component_a_tree, {
    "expanded-keys": expandedKeys.value,
    "onUpdate:expandedKeys": _cache[0] || (_cache[0] = $event => ((expandedKeys).value = $event)),
    "selected-keys": selectedKeys.value,
    "onUpdate:selectedKeys": _cache[1] || (_cache[1] = $event => ((selectedKeys).value = $event)),
    "checked-keys": checkedKeys.value,
    "onUpdate:checkedKeys": _cache[2] || (_cache[2] = $event => ((checkedKeys).value = $event)),
    "tree-data": __props.treeData,
    checkable: __props.checkable,
    selectable: __props.selectable,
    multiple: __props.multiple,
    "show-line": __props.showLine,
    "show-icon": __props.showIcon,
    "default-expand-all": __props.defaultExpandAll,
    "load-data": __props.loadData,
    "field-names": __props.fieldNames,
    onSelect: handleSelect,
    onCheck: handleCheck,
    onExpand: handleExpand
  }, createSlots({ _: 2 }, [
    (_ctx.$slots.title)
      ? {
          name: "title",
          fn: withCtx(({ title, key, dataRef }) => [
            renderSlot(_ctx.$slots, "title", {
              title: title,
              key: key,
              dataRef: dataRef
            })
          ]),
          key: "0"
        }
      : undefined,
    (_ctx.$slots.icon)
      ? {
          name: "icon",
          fn: withCtx(({ selected, expanded, dataRef }) => [
            renderSlot(_ctx.$slots, "icon", {
              selected: selected,
              expanded: expanded,
              dataRef: dataRef
            })
          ]),
          key: "1"
        }
      : undefined
  ]), 1032, ["expanded-keys", "selected-keys", "checked-keys", "tree-data", "checkable", "selectable", "multiple", "show-line", "show-icon", "default-expand-all", "load-data", "field-names"]))
}
}

};

export { _sfc_main as default };
//# sourceMappingURL=BasicTree.vue.js.map
