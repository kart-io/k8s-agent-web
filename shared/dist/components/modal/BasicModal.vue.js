import { ref, watch, resolveComponent, createBlock, openBlock, mergeProps, createSlots, withCtx, renderSlot, createVNode, createTextVNode, toDisplayString } from 'vue';

const _sfc_main = {
  __name: 'BasicModal',
  props: {
  // 是否显示
  open: {
    type: Boolean,
    default: false
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 宽度
  width: {
    type: [String, Number],
    default: 520
  },
  // 底部内容
  footer: {
    type: [Object, Boolean],
    default: null
  },
  // 是否显示底部
  showFooter: {
    type: Boolean,
    default: true
  },
  // 点击蒙层是否允许关闭
  maskClosable: {
    type: Boolean,
    default: false
  },
  // 关闭时销毁子元素
  destroyOnClose: {
    type: Boolean,
    default: true
  },
  // 确定按钮 loading
  confirmLoading: {
    type: Boolean,
    default: false
  },
  // 确定按钮文字
  okText: {
    type: String,
    default: '确定'
  },
  // 取消按钮文字
  cancelText: {
    type: String,
    default: '取消'
  }
},
  emits: ['update:open', 'ok', 'cancel', 'register'],
  setup(__props, { expose: __expose, emit }) {

const props = __props;





// 内部可见状态
const visible = ref(props.open);

// 监听 prop 变化
watch(() => props.open, (val) => {
  visible.value = val;
});

// 监听内部状态变化
watch(visible, (val) => {
  emit('update:open', val);
});

// 确定
const handleOk = () => {
  emit('ok');
};

// 取消
const handleCancel = () => {
  visible.value = false;
  emit('cancel');
};

// 打开
const open = () => {
  visible.value = true;
};

// 关闭
const close = () => {
  visible.value = false;
};

// 暴露方法
__expose({
  open,
  close
});

// 注册实例
emit('register', {
  open,
  close
});

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");
  const _component_a_space = resolveComponent("a-space");
  const _component_a_modal = resolveComponent("a-modal");

  return (openBlock(), createBlock(_component_a_modal, mergeProps({
    open: visible.value,
    "onUpdate:open": _cache[0] || (_cache[0] = $event => ((visible).value = $event)),
    title: __props.title,
    width: __props.width,
    footer: __props.footer,
    "mask-closable": __props.maskClosable,
    "destroy-on-close": __props.destroyOnClose,
    "confirm-loading": __props.confirmLoading
  }, _ctx.$attrs, {
    onOk: handleOk,
    onCancel: handleCancel
  }), createSlots({
    default: withCtx(() => [
      renderSlot(_ctx.$slots, "default")
    ]),
    _: 2
  }, [
    (!__props.footer && __props.showFooter)
      ? {
          name: "footer",
          fn: withCtx(() => [
            renderSlot(_ctx.$slots, "footer", {
              ok: handleOk,
              cancel: handleCancel
            }, () => [
              createVNode(_component_a_space, null, {
                default: withCtx(() => [
                  createVNode(_component_a_button, { onClick: handleCancel }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(__props.cancelText), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_a_button, {
                    type: "primary",
                    loading: __props.confirmLoading,
                    onClick: handleOk
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(__props.okText), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ]),
                _: 1
              })
            ])
          ]),
          key: "0"
        }
      : undefined
  ]), 1040, ["open", "title", "width", "footer", "mask-closable", "destroy-on-close", "confirm-loading"]))
}
}

};

export { _sfc_main as default };
//# sourceMappingURL=BasicModal.vue.js.map
