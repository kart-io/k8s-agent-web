import { computed, resolveComponent, openBlock, createBlock, normalizeClass, createSlots, withCtx, renderSlot, createTextVNode, toDisplayString, resolveDynamicComponent } from 'vue';
import { CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined, MinusCircleOutlined } from '@ant-design/icons-vue';
/* empty css                */import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _sfc_main = {
  __name: 'StatusTag',
  props: {
  // 状态值
  status: {
    type: String,
    default: ''
  },
  // 显示文本
  text: {
    type: String,
    default: ''
  },
  // 颜色映射
  colorMap: {
    type: Object,
    default: () => ({
      success: 'success',
      running: 'processing',
      error: 'error',
      warning: 'warning',
      default: 'default',
      pending: 'default',
      failed: 'error',
      stopped: 'default',
      active: 'success',
      inactive: 'default'
    })
  },
  // 图标映射
  iconMap: {
    type: Object,
    default: () => ({
      success: CheckCircleOutlined,
      running: SyncOutlined,
      error: CloseCircleOutlined,
      warning: ExclamationCircleOutlined,
      pending: ClockCircleOutlined,
      failed: CloseCircleOutlined,
      stopped: MinusCircleOutlined,
      active: CheckCircleOutlined,
      inactive: MinusCircleOutlined
    })
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: false
  },
  // 自定义颜色
  color: {
    type: String,
    default: ''
  },
  // 自定义类名
  customClass: {
    type: String,
    default: ''
  }
},
  setup(__props) {

const props = __props;

// 标签颜色
const tagColor = computed(() => {
  if (props.color) {
    return props.color
  }
  return props.colorMap[props.status] || props.colorMap.default
});

// 图标组件
const iconComponent = computed(() => {
  return props.iconMap[props.status] || null
});

return (_ctx, _cache) => {
  const _component_a_tag = resolveComponent("a-tag");

  return (openBlock(), createBlock(_component_a_tag, {
    color: tagColor.value,
    class: normalizeClass(['status-tag', __props.customClass])
  }, createSlots({
    default: withCtx(() => [
      renderSlot(_ctx.$slots, "default", {}, () => [
        createTextVNode(toDisplayString(__props.text), 1)
      ], true)
    ]),
    _: 2
  }, [
    (__props.showIcon)
      ? {
          name: "icon",
          fn: withCtx(() => [
            (openBlock(), createBlock(resolveDynamicComponent(iconComponent.value)))
          ]),
          key: "0"
        }
      : undefined
  ]), 1032, ["color", "class"]))
}
}

};
const StatusTag = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-5f9f454a"]]);

export { StatusTag as default };
//# sourceMappingURL=StatusTag.vue.js.map
