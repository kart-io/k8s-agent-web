import { resolveComponent, createBlock, openBlock, withCtx, renderSlot, createVNode, createTextVNode, unref, createElementBlock, Fragment, renderList, createCommentVNode, createElementVNode, resolveDynamicComponent, toDisplayString } from 'vue';
import { DownOutlined } from '@ant-design/icons-vue';
import '../../utils/storage.js';
import { getIconComponent } from '../../utils/icons.js';

const _sfc_main = {
  __name: 'BasicDropdown',
  props: {
  items: {
    type: Array,
    default: () => []
  },
  trigger: {
    type: Array,
    default: () => ['hover']
  },
  placement: {
    type: String,
    default: 'bottomLeft'
  }
},
  emits: ['menu-click'],
  setup(__props, { emit }) {





const getIcon = (iconName) => {
  if (!iconName) return null
  return getIconComponent(iconName)
};

const handleMenuClick = ({ key }) => {
  emit('menu-click', key);
};

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");
  const _component_a_menu_divider = resolveComponent("a-menu-divider");
  const _component_a_menu_item = resolveComponent("a-menu-item");
  const _component_a_menu = resolveComponent("a-menu");
  const _component_a_dropdown = resolveComponent("a-dropdown");

  return (openBlock(), createBlock(_component_a_dropdown, {
    trigger: __props.trigger,
    placement: __props.placement
  }, {
    overlay: withCtx(() => [
      createVNode(_component_a_menu, { onClick: handleMenuClick }, {
        default: withCtx(() => [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.items, (item) => {
            return (openBlock(), createElementBlock(Fragment, {
              key: item.key
            }, [
              (item.divider)
                ? (openBlock(), createBlock(_component_a_menu_divider, { key: 0 }))
                : (openBlock(), createBlock(_component_a_menu_item, {
                    key: item.key,
                    disabled: item.disabled,
                    danger: item.danger
                  }, {
                    default: withCtx(() => [
                      (item.icon)
                        ? (openBlock(), createBlock(resolveDynamicComponent(getIcon(item.icon)), { key: 0 }))
                        : createCommentVNode("", true),
                      createElementVNode("span", null, toDisplayString(item.label), 1)
                    ]),
                    _: 2
                  }, 1032, ["disabled", "danger"]))
            ], 64))
          }), 128))
        ]),
        _: 1
      })
    ]),
    default: withCtx(() => [
      renderSlot(_ctx.$slots, "default", {}, () => [
        createVNode(_component_a_button, null, {
          default: withCtx(() => [
            renderSlot(_ctx.$slots, "button-content", {}, () => [
              createTextVNode(" 操作 "),
              createVNode(unref(DownOutlined))
            ])
          ]),
          _: 3
        })
      ])
    ]),
    _: 3
  }, 8, ["trigger", "placement"]))
}
}

};

export { _sfc_main as default };
//# sourceMappingURL=BasicDropdown.vue.js.map
