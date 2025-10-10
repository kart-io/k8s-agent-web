import { ref, watch, resolveComponent, createElementBlock, openBlock, createVNode, createElementVNode, withCtx, Fragment, renderList, createBlock, renderSlot } from 'vue';
import { useRouter, useRoute } from 'vue-router';
/* empty css               */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "tab-layout" };
const _hoisted_2 = { class: "tab-content" };


const _sfc_main = {
  __name: 'TabLayout',
  props: {
  tabs: {
    type: Array,
    required: true,
    default: () => []
  },
  defaultActiveKey: {
    type: String,
    default: ''
  }
},
  emits: ['tab-change', 'tab-close'],
  setup(__props, { emit }) {

const props = __props;





const router = useRouter();
const route = useRoute();

const activeKey = ref(props.defaultActiveKey || (props.tabs[0]?.key || ''));

// 监听路由变化，更新激活的标签
watch(
  () => route.path,
  (newPath) => {
    const tab = props.tabs.find(t => t.path === newPath);
    if (tab) {
      activeKey.value = tab.key;
    }
  },
  { immediate: true }
);

const onTabChange = (key) => {
  const tab = props.tabs.find(t => t.key === key);
  if (tab?.path) {
    router.push(tab.path);
  }
  emit('tab-change', key, tab);
};

const onEdit = (targetKey, action) => {
  if (action === 'remove') {
    const tab = props.tabs.find(t => t.key === targetKey);
    emit('tab-close', targetKey, tab);
  }
};

return (_ctx, _cache) => {
  const _component_a_tab_pane = resolveComponent("a-tab-pane");
  const _component_a_tabs = resolveComponent("a-tabs");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createVNode(_component_a_tabs, {
      activeKey: activeKey.value,
      "onUpdate:activeKey": _cache[0] || (_cache[0] = $event => ((activeKey).value = $event)),
      type: "editable-card",
      "hide-add": "",
      onEdit: onEdit,
      onChange: onTabChange
    }, {
      default: withCtx(() => [
        (openBlock(true), createElementBlock(Fragment, null, renderList(__props.tabs, (tab) => {
          return (openBlock(), createBlock(_component_a_tab_pane, {
            key: tab.key,
            tab: tab.label,
            closable: tab.closable !== false
          }, null, 8, ["tab", "closable"]))
        }), 128))
      ]),
      _: 1
    }, 8, ["activeKey"]),
    createElementVNode("div", _hoisted_2, [
      renderSlot(_ctx.$slots, "default", {}, undefined, true)
    ])
  ]))
}
}

};
const TabLayout = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-e219ac25"]]);

export { TabLayout as default };
//# sourceMappingURL=TabLayout.vue.js.map
