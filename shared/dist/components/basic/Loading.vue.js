import { resolveComponent, openBlock, createElementBlock, normalizeClass, createVNode, renderSlot, createCommentVNode } from 'vue';
/* empty css              */import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { key: 1 };


const _sfc_main = {
  __name: 'Loading',
  props: {
  loading: {
    type: Boolean,
    default: false
  },
  tip: {
    type: String,
    default: '加载中...'
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large'].includes(value)
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
},
  setup(__props) {



return (_ctx, _cache) => {
  const _component_a_spin = resolveComponent("a-spin");

  return (__props.loading)
    ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: normalizeClass(["loading-wrapper", { 'loading-fullscreen': __props.fullscreen }])
      }, [
        createVNode(_component_a_spin, {
          size: __props.size,
          tip: __props.tip
        }, null, 8, ["size", "tip"])
      ], 2))
    : (!__props.loading && !__props.fullscreen)
      ? (openBlock(), createElementBlock("div", _hoisted_1, [
          renderSlot(_ctx.$slots, "default", {}, undefined, true)
        ]))
      : createCommentVNode("", true)
}
}

};
const Loading = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-4a8221b9"]]);

export { Loading as default };
//# sourceMappingURL=Loading.vue.js.map
