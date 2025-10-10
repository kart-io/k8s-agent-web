import { computed, resolveComponent, openBlock, createBlock, withCtx, renderSlot } from 'vue';
import { getIconComponent } from '../../utils/icons.js';

const _sfc_main = {
  __name: 'BasicButton',
  props: {
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'dashed', 'link', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'middle',
    validator: (value) => ['large', 'middle', 'small'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  danger: {
    type: Boolean,
    default: false
  },
  ghost: {
    type: Boolean,
    default: false
  },
  shape: {
    type: String,
    validator: (value) => ['default', 'circle', 'round'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String
  }
},
  emits: ['click'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;

const iconComponent = computed(() => {
  if (!props.icon) return undefined
  return getIconComponent(props.icon)
});

const handleClick = (e) => {
  if (!props.loading && !props.disabled) {
    emit('click', e);
  }
};

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");

  return (openBlock(), createBlock(_component_a_button, {
    type: __props.type,
    size: __props.size,
    loading: __props.loading,
    disabled: __props.disabled,
    danger: __props.danger,
    ghost: __props.ghost,
    shape: __props.shape,
    block: __props.block,
    icon: iconComponent.value,
    onClick: handleClick
  }, {
    default: withCtx(() => [
      renderSlot(_ctx.$slots, "default")
    ]),
    _: 3
  }, 8, ["type", "size", "loading", "disabled", "danger", "ghost", "shape", "block", "icon"]))
}
}

};

export { _sfc_main as default };
//# sourceMappingURL=BasicButton.vue.js.map
