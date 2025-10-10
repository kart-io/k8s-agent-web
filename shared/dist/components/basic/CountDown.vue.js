import { computed, resolveComponent, createElementBlock, openBlock, createVNode, createSlots, withCtx, renderSlot } from 'vue';
/* empty css               */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "count-down" };


const _sfc_main = {
  __name: 'CountDown',
  props: {
  value: {
    type: Number,
    required: true
  },
  format: {
    type: String,
    default: 'HH:mm:ss'
  },
  valueStyle: {
    type: Object,
    default: () => ({})
  }
},
  emits: ['finish'],
  setup(__props, { emit }) {

const props = __props;





const deadline = computed(() => {
  return Date.now() + props.value
});

const handleFinish = () => {
  emit('finish');
};

return (_ctx, _cache) => {
  const _component_a_statistic_countdown = resolveComponent("a-statistic-countdown");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createVNode(_component_a_statistic_countdown, {
      value: deadline.value,
      format: __props.format,
      "value-style": __props.valueStyle,
      onFinish: handleFinish
    }, createSlots({ _: 2 }, [
      (_ctx.$slots.prefix)
        ? {
            name: "prefix",
            fn: withCtx(() => [
              renderSlot(_ctx.$slots, "prefix", {}, undefined, true)
            ]),
            key: "0"
          }
        : undefined,
      (_ctx.$slots.suffix)
        ? {
            name: "suffix",
            fn: withCtx(() => [
              renderSlot(_ctx.$slots, "suffix", {}, undefined, true)
            ]),
            key: "1"
          }
        : undefined
    ]), 1032, ["value", "format", "value-style"])
  ]))
}
}

};
const CountDown = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-a3e66161"]]);

export { CountDown as default };
//# sourceMappingURL=CountDown.vue.js.map
