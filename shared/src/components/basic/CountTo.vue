<template>
  <span class="count-to">{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
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
})

const emit = defineEmits(['finished'])

const displayValue = ref('')
let animationFrameId = null
let startTime = null

onMounted(() => {
  if (props.autoplay) {
    start()
  }
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

watch(() => props.endVal, () => {
  if (props.autoplay) {
    restart()
  }
})

const formatNumber = (num) => {
  const number = Number(num).toFixed(props.decimals)
  const parts = number.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]

  // 添加千位分隔符
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, props.separator)

  // 组合结果
  let result = formattedInteger
  if (decimalPart) {
    result += props.decimal + decimalPart
  }

  return props.prefix + result + props.suffix
}

const count = (timestamp) => {
  if (!startTime) {
    startTime = timestamp
  }

  const progress = timestamp - startTime
  const currentVal = props.startVal + (props.endVal - props.startVal) * Math.min(progress / props.duration, 1)

  displayValue.value = formatNumber(currentVal)

  if (progress < props.duration) {
    animationFrameId = requestAnimationFrame(count)
  } else {
    displayValue.value = formatNumber(props.endVal)
    emit('finished')
  }
}

const start = () => {
  startTime = null
  displayValue.value = formatNumber(props.startVal)
  animationFrameId = requestAnimationFrame(count)
}

const restart = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  start()
}

defineExpose({
  start,
  restart
})
</script>

<style scoped lang="scss">
.count-to {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}
</style>
