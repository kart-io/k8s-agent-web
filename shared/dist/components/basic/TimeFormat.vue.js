import { computed, createElementBlock, openBlock, normalizeClass, toDisplayString } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

const _hoisted_1 = ["title"];

// 配置 dayjs

const _sfc_main = {
  __name: 'TimeFormat',
  props: {
  // 时间值
  value: {
    type: [String, Number, Date],
    default: null
  },
  // 格式化模式
  mode: {
    type: String,
    default: 'datetime', // datetime, date, time, relative, fromNow, custom
    validator: (value) =>
      ['datetime', 'date', 'time', 'relative', 'fromNow', 'custom'].includes(value)
  },
  // 自定义格式（mode 为 custom 时使用）
  format: {
    type: String,
    default: 'YYYY-MM-DD HH:mm:ss'
  },
  // 空值显示文本
  emptyText: {
    type: String,
    default: '-'
  },
  // 自定义类名
  customClass: {
    type: String,
    default: ''
  }
},
  setup(__props) {

const props = __props;

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');



// 格式化时间
const formattedTime = computed(() => {
  if (!props.value) {
    return props.emptyText
  }

  const time = dayjs(props.value);

  if (!time.isValid()) {
    return props.emptyText
  }

  switch (props.mode) {
    case 'date':
      return time.format('YYYY-MM-DD')
    case 'time':
      return time.format('HH:mm:ss')
    case 'datetime':
      return time.format('YYYY-MM-DD HH:mm:ss')
    case 'relative':
      return time.fromNow()
    case 'fromNow':
      return time.fromNow()
    case 'custom':
      return time.format(props.format)
    default:
      return time.format('YYYY-MM-DD HH:mm:ss')
  }
});

// 完整时间（用于 title 提示）
const fullTime = computed(() => {
  if (!props.value) {
    return ''
  }

  const time = dayjs(props.value);

  if (!time.isValid()) {
    return ''
  }

  return time.format('YYYY-MM-DD HH:mm:ss')
});

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("span", {
    class: normalizeClass(__props.customClass),
    title: fullTime.value
  }, toDisplayString(formattedTime.value), 11, _hoisted_1))
}
}

};

export { _sfc_main as default };
//# sourceMappingURL=TimeFormat.vue.js.map
