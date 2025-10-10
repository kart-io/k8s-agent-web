import { computed, openBlock, createElementBlock, normalizeClass, normalizeStyle, renderSlot } from 'vue';
/* empty css                      */import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _sfc_main = {
  __name: 'ScrollContainer',
  props: {
  // 是否显示滚动条
  showScrollbar: {
    type: Boolean,
    default: true
  },
  // 高度
  height: {
    type: [String, Number]
  },
  // 最大高度
  maxHeight: {
    type: [String, Number]
  }
},
  setup(__props) {

const props = __props;

const containerStyle = computed(() => {
  const style = {};
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight;
  }
  return style
});

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(['scroll-container', { 'show-scrollbar': __props.showScrollbar }]),
    style: normalizeStyle(containerStyle.value)
  }, [
    renderSlot(_ctx.$slots, "default", {}, undefined, true)
  ], 6))
}
}

};
const ScrollContainer = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-b9f63ee2"]]);

export { ScrollContainer as default };
//# sourceMappingURL=ScrollContainer.vue.js.map
