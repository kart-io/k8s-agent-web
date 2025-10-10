import { ref, onMounted, onUnmounted, watch, createElementBlock, openBlock, toDisplayString } from 'vue';
/* empty css             */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "count-to" };


const _sfc_main = {
  __name: 'CountTo',
  props: {
  startVal: {
    type: Number,
    default: 0
  },
  endVal: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 2000
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  decimals: {
    type: Number,
    default: 0
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  separator: {
    type: String,
    default: ','
  },
  decimal: {
    type: String,
    default: '.'
  }
},
  emits: ['finished'],
  setup(__props, { expose: __expose, emit }) {

const props = __props;





const displayValue = ref('');
let animationFrameId = null;
let startTime = null;

onMounted(() => {
  if (props.autoplay) {
    start();
  }
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

watch(() => props.endVal, () => {
  if (props.autoplay) {
    restart();
  }
});

const formatNumber = (num) => {
  const number = Number(num).toFixed(props.decimals);
  const parts = number.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // 添加千位分隔符
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, props.separator);

  // 组合结果
  let result = formattedInteger;
  if (decimalPart) {
    result += props.decimal + decimalPart;
  }

  return props.prefix + result + props.suffix
};

const count = (timestamp) => {
  if (!startTime) {
    startTime = timestamp;
  }

  const progress = timestamp - startTime;
  const currentVal = props.startVal + (props.endVal - props.startVal) * Math.min(progress / props.duration, 1);

  displayValue.value = formatNumber(currentVal);

  if (progress < props.duration) {
    animationFrameId = requestAnimationFrame(count);
  } else {
    displayValue.value = formatNumber(props.endVal);
    emit('finished');
  }
};

const start = () => {
  startTime = null;
  displayValue.value = formatNumber(props.startVal);
  animationFrameId = requestAnimationFrame(count);
};

const restart = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  start();
};

__expose({
  start,
  restart
});

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("span", _hoisted_1, toDisplayString(displayValue.value), 1))
}
}

};
const CountTo = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-533ebeb7"]]);

export { CountTo as default };
//# sourceMappingURL=CountTo.vue.js.map
