import { computed, resolveComponent, createBlock, openBlock, withCtx, renderSlot, createCommentVNode, createTextVNode, toDisplayString } from 'vue';

const _sfc_main = {
  __name: 'BasicEmpty',
  props: {
  description: {
    type: String,
    default: '暂无数据'
  },
  image: {
    type: String,
    default: 'default' // 'default' | 'simple' | custom image url
  },
  imageHeight: {
    type: Number,
    default: 60
  },
  showButton: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: '立即创建'
  }
},
  emits: ['button-click'],
  setup(__props, { emit }) {

const props = __props;





const imageUrl = computed(() => {
  if (props.image === 'simple') {
    return 'https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'
  }
  if (props.image === 'default') {
    return undefined
  }
  return props.image
});

const imageStyle = computed(() => {
  return {
    height: `${props.imageHeight}px`
  }
});

const handleClick = () => {
  emit('button-click');
};

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");
  const _component_a_empty = resolveComponent("a-empty");

  return (openBlock(), createBlock(_component_a_empty, {
    image: imageUrl.value,
    "image-style": imageStyle.value,
    description: __props.description
  }, {
    default: withCtx(() => [
      (_ctx.$slots.default)
        ? renderSlot(_ctx.$slots, "default", { key: 0 })
        : (__props.showButton)
          ? (openBlock(), createBlock(_component_a_button, {
              key: 1,
              type: "primary",
              onClick: handleClick
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(__props.buttonText), 1)
              ]),
              _: 1
            }))
          : createCommentVNode("", true)
    ]),
    _: 3
  }, 8, ["image", "image-style", "description"]))
}
}

};

export { _sfc_main as default };
//# sourceMappingURL=BasicEmpty.vue.js.map
