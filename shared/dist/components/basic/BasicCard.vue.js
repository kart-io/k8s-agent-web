import { resolveComponent, openBlock, createBlock, normalizeClass, createSlots, withCtx, renderSlot } from 'vue';
/* empty css                */import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _sfc_main = {
  __name: 'BasicCard',
  props: {
  title: {
    type: String
  },
  bordered: {
    type: Boolean,
    default: true
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'small'].includes(value)
  },
  customClass: {
    type: String
  }
},
  setup(__props) {



return (_ctx, _cache) => {
  const _component_a_card = resolveComponent("a-card");

  return (openBlock(), createBlock(_component_a_card, {
    title: __props.title,
    bordered: __props.bordered,
    hoverable: __props.hoverable,
    loading: __props.loading,
    size: __props.size,
    class: normalizeClass(['basic-card', __props.customClass])
  }, createSlots({
    default: withCtx(() => [
      renderSlot(_ctx.$slots, "default", {}, undefined, true)
    ]),
    _: 2
  }, [
    (_ctx.$slots.extra)
      ? {
          name: "extra",
          fn: withCtx(() => [
            renderSlot(_ctx.$slots, "extra", {}, undefined, true)
          ]),
          key: "0"
        }
      : undefined,
    (_ctx.$slots.actions)
      ? {
          name: "actions",
          fn: withCtx(() => [
            renderSlot(_ctx.$slots, "actions", {}, undefined, true)
          ]),
          key: "1"
        }
      : undefined,
    (_ctx.$slots.cover)
      ? {
          name: "cover",
          fn: withCtx(() => [
            renderSlot(_ctx.$slots, "cover", {}, undefined, true)
          ]),
          key: "2"
        }
      : undefined
  ]), 1032, ["title", "bordered", "hoverable", "loading", "size", "class"]))
}
}

};
const BasicCard = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-daef9500"]]);

export { BasicCard as default };
//# sourceMappingURL=BasicCard.vue.js.map
