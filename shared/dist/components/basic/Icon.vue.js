import { computed, createBlock, createCommentVNode, openBlock, resolveDynamicComponent, normalizeStyle, normalizeClass } from 'vue';
import '../../utils/storage.js';
import { getIconComponent } from '../../utils/icons.js';
/* empty css          */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _sfc_main = {
  __name: 'Icon',
  props: {
  // 图标名称
  icon: {
    type: String,
    required: true
  },
  // 图标大小
  size: {
    type: [String, Number],
    default: 'inherit'
  },
  // 图标颜色
  color: {
    type: String
  },
  // 自定义类名
  customClass: {
    type: String
  }
},
  setup(__props) {

const props = __props;



const iconComponent = computed(() => {
  return getIconComponent(props.icon)
});

const iconStyle = computed(() => {
  const style = {};
  if (props.size) {
    const size = typeof props.size === 'number' ? `${props.size}px` : props.size;
    style.fontSize = size;
  }
  if (props.color) {
    style.color = props.color;
  }
  return style
});

return (_ctx, _cache) => {
  return (iconComponent.value)
    ? (openBlock(), createBlock(resolveDynamicComponent(iconComponent.value), {
        key: 0,
        class: normalizeClass(['vben-icon', __props.customClass]),
        style: normalizeStyle(iconStyle.value)
      }, null, 8, ["class", "style"]))
    : createCommentVNode("", true)
}
}

};
const Icon = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-e6670332"]]);

export { Icon as default };
//# sourceMappingURL=Icon.vue.js.map
