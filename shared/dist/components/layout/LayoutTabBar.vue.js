import { ref, computed, resolveComponent, createElementBlock, openBlock, createElementVNode, createVNode, Fragment, renderList, withModifiers, normalizeClass, createBlock, createCommentVNode, resolveDynamicComponent, toDisplayString, unref, withCtx, createTextVNode, pushScopeId, popScopeId } from 'vue';
import { CloseOutlined, ReloadOutlined, DownOutlined, VerticalRightOutlined, VerticalLeftOutlined, ColumnWidthOutlined, MinusOutlined } from '@ant-design/icons-vue';
import '../../utils/storage.js';
import { getIconComponent } from '../../utils/icons.js';
/* empty css                  */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _withScopeId = n => (pushScopeId("data-v-36abc11c"),n=n(),popScopeId(),n);
const _hoisted_1 = { class: "layout-tab-bar" };
const _hoisted_2 = { class: "tab-bar-content" };
const _hoisted_3 = ["onClick", "onContextmenu"];
const _hoisted_4 = { class: "tab-label" };
const _hoisted_5 = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/createElementVNode("div", { style: {"position":"absolute","width":"0","height":"0"} }, null, -1));


const _sfc_main = {
  __name: 'LayoutTabBar',
  props: {
  tabs: {
    type: Array,
    required: true,
    default: () => []
  },
  activeKey: {
    type: String,
    required: true
  }
},
  emits: [
  'tab-click',
  'tab-close',
  'tab-refresh',
  'close-left',
  'close-right',
  'close-other',
  'close-all'
],
  setup(__props, { emit }) {

const props = __props;





const tabsContainer = ref(null);
const contextMenuVisible = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const contextTab = ref(null);
const isRefreshing = ref(false);

const currentTabIndex = computed(() => {
  return props.tabs.findIndex(t => t.key === props.activeKey)
});

const canCloseLeft = computed(() => {
  const index = contextTab.value
    ? props.tabs.findIndex(t => t.key === contextTab.value.key)
    : currentTabIndex.value;
  return index > 0 && props.tabs.slice(0, index).some(t => !t.affix)
});

const canCloseRight = computed(() => {
  const index = contextTab.value
    ? props.tabs.findIndex(t => t.key === contextTab.value.key)
    : currentTabIndex.value;
  return index < props.tabs.length - 1 && props.tabs.slice(index + 1).some(t => !t.affix)
});

const onlyAffixTabs = computed(() => {
  return props.tabs.every(t => t.affix)
});

const getIcon = (iconName) => {
  if (!iconName) return null
  return getIconComponent(iconName)
};

const handleTabClick = (tab) => {
  emit('tab-click', tab);
};

const handleClose = (tab) => {
  emit('tab-close', tab);
};

const handleRefresh = () => {
  isRefreshing.value = true;
  emit('tab-refresh');
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
};

const handleMenuClick = ({ key }) => {
  switch (key) {
    case 'refresh':
      handleRefresh();
      break
    case 'close-current':
      const currentTab = props.tabs.find(t => t.key === props.activeKey);
      if (currentTab && !currentTab.affix) {
        emit('tab-close', currentTab);
      }
      break
    case 'close-left':
      emit('close-left');
      break
    case 'close-right':
      emit('close-right');
      break
    case 'close-other':
      emit('close-other');
      break
    case 'close-all':
      emit('close-all');
      break
  }
};

const handleContextMenu = (e, tab) => {
  e.preventDefault();
  contextTab.value = tab;
  contextMenuPosition.value = { x: e.clientX, y: e.clientY };
  contextMenuVisible.value = true;
};

const handleContextMenuClick = ({ key }) => {
  contextMenuVisible.value = false;
  switch (key) {
    case 'refresh':
      emit('tab-click', contextTab.value);
      setTimeout(() => handleRefresh(), 100);
      break
    case 'close':
      if (!contextTab.value.affix) {
        emit('tab-close', contextTab.value);
      }
      break
    case 'close-left':
      emit('tab-click', contextTab.value);
      setTimeout(() => emit('close-left'), 100);
      break
    case 'close-right':
      emit('tab-click', contextTab.value);
      setTimeout(() => emit('close-right'), 100);
      break
    case 'close-other':
      emit('tab-click', contextTab.value);
      setTimeout(() => emit('close-other'), 100);
      break
  }
  contextTab.value = null;
};

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");
  const _component_a_tooltip = resolveComponent("a-tooltip");
  const _component_a_menu_item = resolveComponent("a-menu-item");
  const _component_a_menu_divider = resolveComponent("a-menu-divider");
  const _component_a_menu = resolveComponent("a-menu");
  const _component_a_dropdown = resolveComponent("a-dropdown");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createElementVNode("div", _hoisted_2, [
      createElementVNode("div", {
        ref_key: "tabsContainer",
        ref: tabsContainer,
        class: "tabs-container"
      }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(__props.tabs, (tab) => {
          return (openBlock(), createElementBlock("div", {
            key: tab.key,
            class: normalizeClass(['tab-item', { 'tab-active': tab.key === __props.activeKey }]),
            onClick: $event => (handleTabClick(tab)),
            onContextmenu: withModifiers($event => (handleContextMenu($event, tab)), ["prevent"])
          }, [
            (tab.icon)
              ? (openBlock(), createBlock(resolveDynamicComponent(getIcon(tab.icon)), {
                  key: 0,
                  class: "tab-icon"
                }))
              : createCommentVNode("", true),
            createElementVNode("span", _hoisted_4, toDisplayString(tab.label), 1),
            (!tab.affix && __props.tabs.length > 1)
              ? (openBlock(), createBlock(unref(CloseOutlined), {
                  key: 1,
                  class: "tab-close",
                  onClick: withModifiers($event => (handleClose(tab)), ["stop"])
                }, null, 8, ["onClick"]))
              : createCommentVNode("", true)
          ], 42, _hoisted_3))
        }), 128))
      ], 512),
      createVNode(_component_a_tooltip, { title: "刷新当前页" }, {
        default: withCtx(() => [
          createVNode(_component_a_button, {
            type: "text",
            size: "small",
            class: "tab-action-btn",
            onClick: handleRefresh
          }, {
            default: withCtx(() => [
              createVNode(unref(ReloadOutlined), {
                class: normalizeClass({ 'rotating': isRefreshing.value })
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]),
        _: 1
      }),
      createVNode(_component_a_dropdown, { placement: "bottomRight" }, {
        overlay: withCtx(() => [
          createVNode(_component_a_menu, { onClick: handleMenuClick }, {
            default: withCtx(() => [
              createVNode(_component_a_menu_item, { key: "refresh" }, {
                default: withCtx(() => [
                  createVNode(unref(ReloadOutlined)),
                  createTextVNode(" 刷新当前 ")
                ]),
                _: 1
              }),
              createVNode(_component_a_menu_divider),
              createVNode(_component_a_menu_item, {
                key: "close-current",
                disabled: __props.tabs.length === 1
              }, {
                default: withCtx(() => [
                  createVNode(unref(CloseOutlined)),
                  createTextVNode(" 关闭当前 ")
                ]),
                _: 1
              }, 8, ["disabled"]),
              createVNode(_component_a_menu_item, {
                key: "close-left",
                disabled: !canCloseLeft.value
              }, {
                default: withCtx(() => [
                  createVNode(unref(VerticalRightOutlined)),
                  createTextVNode(" 关闭左侧 ")
                ]),
                _: 1
              }, 8, ["disabled"]),
              createVNode(_component_a_menu_item, {
                key: "close-right",
                disabled: !canCloseRight.value
              }, {
                default: withCtx(() => [
                  createVNode(unref(VerticalLeftOutlined)),
                  createTextVNode(" 关闭右侧 ")
                ]),
                _: 1
              }, 8, ["disabled"]),
              createVNode(_component_a_menu_item, {
                key: "close-other",
                disabled: __props.tabs.length === 1
              }, {
                default: withCtx(() => [
                  createVNode(unref(ColumnWidthOutlined)),
                  createTextVNode(" 关闭其他 ")
                ]),
                _: 1
              }, 8, ["disabled"]),
              createVNode(_component_a_menu_divider),
              createVNode(_component_a_menu_item, {
                key: "close-all",
                disabled: onlyAffixTabs.value
              }, {
                default: withCtx(() => [
                  createVNode(unref(MinusOutlined)),
                  createTextVNode(" 关闭全部 ")
                ]),
                _: 1
              }, 8, ["disabled"])
            ]),
            _: 1
          })
        ]),
        default: withCtx(() => [
          createVNode(_component_a_button, {
            type: "text",
            size: "small",
            class: "tab-action-btn"
          }, {
            default: withCtx(() => [
              createVNode(unref(DownOutlined))
            ]),
            _: 1
          })
        ]),
        _: 1
      })
    ]),
    createVNode(_component_a_dropdown, {
      open: contextMenuVisible.value,
      "onUpdate:open": _cache[0] || (_cache[0] = $event => ((contextMenuVisible).value = $event)),
      trigger: [],
      placement: "bottomLeft",
      "overlay-style": { position: 'fixed', left: contextMenuPosition.value.x + 'px', top: contextMenuPosition.value.y + 'px' }
    }, {
      overlay: withCtx(() => [
        createVNode(_component_a_menu, { onClick: handleContextMenuClick }, {
          default: withCtx(() => [
            createVNode(_component_a_menu_item, { key: "refresh" }, {
              default: withCtx(() => [
                createVNode(unref(ReloadOutlined)),
                createTextVNode(" 刷新 ")
              ]),
              _: 1
            }),
            createVNode(_component_a_menu_divider),
            createVNode(_component_a_menu_item, {
              key: "close",
              disabled: contextTab.value?.affix || __props.tabs.length === 1
            }, {
              default: withCtx(() => [
                createVNode(unref(CloseOutlined)),
                createTextVNode(" 关闭 ")
              ]),
              _: 1
            }, 8, ["disabled"]),
            createVNode(_component_a_menu_item, {
              key: "close-left",
              disabled: !canCloseLeft.value
            }, {
              default: withCtx(() => [
                createVNode(unref(VerticalRightOutlined)),
                createTextVNode(" 关闭左侧 ")
              ]),
              _: 1
            }, 8, ["disabled"]),
            createVNode(_component_a_menu_item, {
              key: "close-right",
              disabled: !canCloseRight.value
            }, {
              default: withCtx(() => [
                createVNode(unref(VerticalLeftOutlined)),
                createTextVNode(" 关闭右侧 ")
              ]),
              _: 1
            }, 8, ["disabled"]),
            createVNode(_component_a_menu_item, {
              key: "close-other",
              disabled: __props.tabs.length === 1
            }, {
              default: withCtx(() => [
                createVNode(unref(ColumnWidthOutlined)),
                createTextVNode(" 关闭其他 ")
              ]),
              _: 1
            }, 8, ["disabled"])
          ]),
          _: 1
        })
      ]),
      default: withCtx(() => [
        _hoisted_5
      ]),
      _: 1
    }, 8, ["open", "overlay-style"])
  ]))
}
}

};
const LayoutTabBar = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-36abc11c"]]);

export { LayoutTabBar as default };
//# sourceMappingURL=LayoutTabBar.vue.js.map
