import { ref, watch, resolveComponent, openBlock, createBlock, createSlots, withCtx, createElementVNode, renderSlot, createVNode, createTextVNode, toDisplayString } from 'vue';
/* empty css                  */import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "drawer-content" };
const _hoisted_2 = { class: "drawer-footer" };


const _sfc_main = {
  __name: 'BasicDrawer',
  props: {
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: 378
  },
  height: {
    type: [String, Number],
    default: 378
  },
  placement: {
    type: String,
    default: 'right',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  okText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmLoading: {
    type: Boolean,
    default: false
  },
  getContainer: {
    type: [String, Function],
    default: 'body'
  },
  footerStyle: {
    type: Object,
    default: () => ({})
  }
},
  emits: ['update:open', 'ok', 'cancel', 'close'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;

const visible = ref(props.open);

watch(() => props.open, (val) => {
  visible.value = val;
});

watch(visible, (val) => {
  emit('update:open', val);
});

const handleOk = () => {
  emit('ok');
};

const handleCancel = () => {
  visible.value = false;
  emit('cancel');
};

const handleClose = () => {
  visible.value = false;
  emit('close');
};

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");
  const _component_a_space = resolveComponent("a-space");
  const _component_a_drawer = resolveComponent("a-drawer");

  return (openBlock(), createBlock(_component_a_drawer, {
    open: visible.value,
    "onUpdate:open": _cache[0] || (_cache[0] = $event => ((visible).value = $event)),
    title: __props.title,
    width: __props.width,
    height: __props.height,
    placement: __props.placement,
    closable: __props.closable,
    "mask-closable": __props.maskClosable,
    "destroy-on-close": __props.destroyOnClose,
    "get-container": __props.getContainer,
    "footer-style": __props.footerStyle,
    onClose: handleClose
  }, createSlots({
    default: withCtx(() => [
      createElementVNode("div", _hoisted_1, [
        renderSlot(_ctx.$slots, "default", {}, undefined, true)
      ])
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
    (__props.showFooter)
      ? {
          name: "footer",
          fn: withCtx(() => [
            renderSlot(_ctx.$slots, "footer", {}, () => [
              createElementVNode("div", _hoisted_2, [
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
            ], true)
          ]),
          key: "1"
        }
      : undefined
  ]), 1032, ["open", "title", "width", "height", "placement", "closable", "mask-closable", "destroy-on-close", "get-container", "footer-style"]))
}
}

};
const BasicDrawer = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-5e5402fc"]]);

export { BasicDrawer as default };
//# sourceMappingURL=BasicDrawer.vue.js.map
