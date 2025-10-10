import { resolveComponent, createBlock, openBlock, normalizeClass, withCtx, createElementBlock, Fragment, renderList, createCommentVNode, resolveDynamicComponent, toDisplayString } from 'vue';
import { useRouter } from 'vue-router';
import '../../utils/storage.js';
import { getIconComponent } from '../../utils/icons.js';
/* empty css                     */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = ["onClick"];
const _hoisted_2 = { key: 2 };


const _sfc_main = {
  __name: 'BasicBreadcrumb',
  props: {
  items: {
    type: Array,
    default: () => []
  },
  separator: {
    type: String,
    default: '/'
  },
  customClass: {
    type: String
  }
},
  emits: ['item-click'],
  setup(__props, { emit }) {




const router = useRouter();

const getIcon = (iconName) => {
  if (!iconName) return null
  return getIconComponent(iconName)
};

const handleClick = (item) => {
  emit('item-click', item);
  if (item.path) {
    router.push(item.path);
  }
};

return (_ctx, _cache) => {
  const _component_a_breadcrumb_item = resolveComponent("a-breadcrumb-item");
  const _component_a_breadcrumb = resolveComponent("a-breadcrumb");

  return (openBlock(), createBlock(_component_a_breadcrumb, {
    class: normalizeClass(['basic-breadcrumb', __props.customClass]),
    separator: __props.separator
  }, {
    default: withCtx(() => [
      (openBlock(true), createElementBlock(Fragment, null, renderList(__props.items, (item, index) => {
        return (openBlock(), createBlock(_component_a_breadcrumb_item, { key: index }, {
          default: withCtx(() => [
            (item.icon)
              ? (openBlock(), createBlock(resolveDynamicComponent(getIcon(item.icon)), { key: 0 }))
              : createCommentVNode("", true),
            (item.path && index < __props.items.length - 1)
              ? (openBlock(), createElementBlock("a", {
                  key: 1,
                  onClick: $event => (handleClick(item))
                }, toDisplayString(item.label), 9, _hoisted_1))
              : (openBlock(), createElementBlock("span", _hoisted_2, toDisplayString(item.label), 1))
          ]),
          _: 2
        }, 1024))
      }), 128))
    ]),
    _: 1
  }, 8, ["class", "separator"]))
}
}

};
const BasicBreadcrumb = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-aa9931e4"]]);

export { BasicBreadcrumb as default };
//# sourceMappingURL=BasicBreadcrumb.vue.js.map
