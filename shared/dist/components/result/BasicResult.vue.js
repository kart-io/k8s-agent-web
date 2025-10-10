import { resolveComponent, openBlock, createBlock, createSlots, withCtx, renderSlot, createCommentVNode } from 'vue';

const _sfc_main = {
  __name: 'BasicResult',
  props: {
  status: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info', 'warning', '404', '403', '500'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  subTitle: {
    type: String
  }
},
  setup(__props) {



return (_ctx, _cache) => {
  const _component_a_result = resolveComponent("a-result");

  return (openBlock(), createBlock(_component_a_result, {
    status: __props.status,
    title: __props.title,
    "sub-title": __props.subTitle
  }, createSlots({
    default: withCtx(() => [
      (_ctx.$slots.default)
        ? renderSlot(_ctx.$slots, "default", { key: 0 })
        : createCommentVNode("", true)
    ]),
    _: 2
  }, [
    (_ctx.$slots.icon)
      ? {
          name: "icon",
          fn: withCtx(() => [
            renderSlot(_ctx.$slots, "icon")
          ]),
          key: "0"
        }
      : undefined,
    (_ctx.$slots.extra)
      ? {
          name: "extra",
          fn: withCtx(() => [
            renderSlot(_ctx.$slots, "extra")
          ]),
          key: "1"
        }
      : undefined
  ]), 1032, ["status", "title", "sub-title"]))
}
}

};

export { _sfc_main as default };
//# sourceMappingURL=BasicResult.vue.js.map
