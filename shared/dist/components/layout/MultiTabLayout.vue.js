import { ref, computed, watch, resolveComponent, openBlock, createElementBlock, createVNode, withCtx, Fragment, renderList, createBlock, createTextVNode, toDisplayString, createCommentVNode, createElementVNode, unref, renderSlot } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ReloadOutlined, CloseOutlined, ColumnWidthOutlined, MinusOutlined, DownOutlined } from '@ant-design/icons-vue';
/* empty css                     */import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "multi-tab-layout" };
const _hoisted_2 = {
  key: 0,
  class: "breadcrumb-bar"
};
const _hoisted_3 = { class: "tab-bar" };
const _hoisted_4 = { class: "tab-actions" };
const _hoisted_5 = { class: "tab-content" };


const _sfc_main = {
  __name: 'MultiTabLayout',
  props: {
  breadcrumb: {
    type: Boolean,
    default: true
  }
},
  emits: ['tab-change', 'tab-close', 'tab-refresh'],
  setup(__props, { expose: __expose, emit: __emit }) {

const emit = __emit;

const router = useRouter();
const route = useRoute();

// 已打开的标签页列表
const openTabs = ref([]);
const activeTabKey = ref('');

// 面包屑数据
const breadcrumbItems = computed(() => {
  const currentTab = openTabs.value.find(t => t.key === activeTabKey.value);
  if (!currentTab?.breadcrumb) return []
  return currentTab.breadcrumb
});

// 添加标签页
const addTab = (tab) => {
  const existingTab = openTabs.value.find(t => t.key === tab.key);
  if (!existingTab) {
    openTabs.value.push(tab);
  }
  activeTabKey.value = tab.key;
};

// 移除标签页
const removeTab = (targetKey) => {
  const targetIndex = openTabs.value.findIndex(t => t.key === targetKey);
  if (targetIndex === -1) return

  const newTabs = openTabs.value.filter(t => t.key !== targetKey);

  // 如果关闭的是当前标签，需要激活另一个标签
  if (activeTabKey.value === targetKey && newTabs.length > 0) {
    // 激活前一个或后一个标签
    const newActiveTab = newTabs[Math.max(0, targetIndex - 1)];
    activeTabKey.value = newActiveTab.key;
    if (newActiveTab.path) {
      router.push(newActiveTab.path);
    }
  }

  openTabs.value = newTabs;
  emit('tab-close', targetKey);
};

// 监听路由变化，自动添加标签
watch(
  () => route.path,
  (newPath) => {
    if (route.meta?.noTab) return // 某些页面不显示标签

    const tab = {
      key: newPath,
      label: route.meta?.title || '未命名',
      path: newPath,
      closable: route.meta?.affix !== true, // affix 为 true 的标签不可关闭
      breadcrumb: route.meta?.breadcrumb || []
    };

    addTab(tab);
  },
  { immediate: true }
);

const onTabChange = (key) => {
  const tab = openTabs.value.find(t => t.key === key);
  if (tab?.path && tab.path !== route.path) {
    router.push(tab.path);
  }
  emit('tab-change', key, tab);
};

const onEdit = (targetKey, action) => {
  if (action === 'remove') {
    removeTab(targetKey);
  }
};

const handleMenuClick = ({ key }) => {
  switch (key) {
    case 'refresh':
      emit('tab-refresh', activeTabKey.value);
      window.location.reload();
      break
    case 'close':
      if (openTabs.value.length > 1) {
        removeTab(activeTabKey.value);
      }
      break
    case 'close-other':
      openTabs.value.find(t => t.key === activeTabKey.value);
      openTabs.value = openTabs.value.filter(
        t => t.key === activeTabKey.value || t.closable === false
      );
      break
    case 'close-all':
      const affixTabs = openTabs.value.filter(t => t.closable === false);
      if (affixTabs.length > 0) {
        openTabs.value = affixTabs;
        activeTabKey.value = affixTabs[0].key;
        if (affixTabs[0].path) {
          router.push(affixTabs[0].path);
        }
      }
      break
  }
};

// 暴露方法供外部使用
__expose({
  addTab,
  removeTab,
  openTabs,
  activeTabKey
});

return (_ctx, _cache) => {
  const _component_a_breadcrumb_item = resolveComponent("a-breadcrumb-item");
  const _component_a_breadcrumb = resolveComponent("a-breadcrumb");
  const _component_a_tab_pane = resolveComponent("a-tab-pane");
  const _component_a_tabs = resolveComponent("a-tabs");
  const _component_a_menu_item = resolveComponent("a-menu-item");
  const _component_a_menu_divider = resolveComponent("a-menu-divider");
  const _component_a_menu = resolveComponent("a-menu");
  const _component_a_button = resolveComponent("a-button");
  const _component_a_dropdown = resolveComponent("a-dropdown");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    (__props.breadcrumb)
      ? (openBlock(), createElementBlock("div", _hoisted_2, [
          createVNode(_component_a_breadcrumb, null, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(breadcrumbItems.value, (item) => {
                return (openBlock(), createBlock(_component_a_breadcrumb_item, {
                  key: item.path
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(item.label), 1)
                  ]),
                  _: 2
                }, 1024))
              }), 128))
            ]),
            _: 1
          })
        ]))
      : createCommentVNode("", true),
    createElementVNode("div", _hoisted_3, [
      createVNode(_component_a_tabs, {
        activeKey: activeTabKey.value,
        "onUpdate:activeKey": _cache[0] || (_cache[0] = $event => ((activeTabKey).value = $event)),
        type: "editable-card",
        "hide-add": "",
        onEdit: onEdit,
        onChange: onTabChange
      }, {
        default: withCtx(() => [
          (openBlock(true), createElementBlock(Fragment, null, renderList(openTabs.value, (tab) => {
            return (openBlock(), createBlock(_component_a_tab_pane, {
              key: tab.key,
              closable: tab.closable !== false && openTabs.value.length > 1
            }, {
              tab: withCtx(() => [
                createElementVNode("span", null, toDisplayString(tab.label), 1)
              ]),
              _: 2
            }, 1032, ["closable"]))
          }), 128))
        ]),
        _: 1
      }, 8, ["activeKey"]),
      createElementVNode("div", _hoisted_4, [
        createVNode(_component_a_dropdown, null, {
          overlay: withCtx(() => [
            createVNode(_component_a_menu, { onClick: handleMenuClick }, {
              default: withCtx(() => [
                createVNode(_component_a_menu_item, { key: "refresh" }, {
                  default: withCtx(() => [
                    createVNode(unref(ReloadOutlined)),
                    _cache[1] || (_cache[1] = createTextVNode(" 刷新当前 ", -1))
                  ]),
                  _: 1
                }),
                createVNode(_component_a_menu_divider),
                createVNode(_component_a_menu_item, { key: "close" }, {
                  default: withCtx(() => [
                    createVNode(unref(CloseOutlined)),
                    _cache[2] || (_cache[2] = createTextVNode(" 关闭当前 ", -1))
                  ]),
                  _: 1
                }),
                createVNode(_component_a_menu_item, { key: "close-other" }, {
                  default: withCtx(() => [
                    createVNode(unref(ColumnWidthOutlined)),
                    _cache[3] || (_cache[3] = createTextVNode(" 关闭其他 ", -1))
                  ]),
                  _: 1
                }),
                createVNode(_component_a_menu_item, { key: "close-all" }, {
                  default: withCtx(() => [
                    createVNode(unref(MinusOutlined)),
                    _cache[4] || (_cache[4] = createTextVNode(" 关闭全部 ", -1))
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          default: withCtx(() => [
            createVNode(_component_a_button, {
              type: "text",
              size: "small"
            }, {
              default: withCtx(() => [
                createVNode(unref(DownOutlined))
              ]),
              _: 1
            })
          ]),
          _: 1
        })
      ])
    ]),
    createElementVNode("div", _hoisted_5, [
      renderSlot(_ctx.$slots, "default", {}, undefined, true)
    ])
  ]))
}
}

};
const MultiTabLayout = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-bc409a42"]]);

export { MultiTabLayout as default };
//# sourceMappingURL=MultiTabLayout.vue.js.map
