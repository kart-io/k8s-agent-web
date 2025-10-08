<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    :class="['vben-icon', customClass]"
    :style="iconStyle"
  />
</template>

<script setup>
import { computed } from 'vue'
import { getIconComponent } from '../../utils'

const props = defineProps({
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
})

const iconComponent = computed(() => {
  return getIconComponent(props.icon)
})

const iconStyle = computed(() => {
  const style = {}
  if (props.size) {
    const size = typeof props.size === 'number' ? `${props.size}px` : props.size
    style.fontSize = size
  }
  if (props.color) {
    style.color = props.color
  }
  return style
})
</script>

<style scoped lang="scss">
.vben-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
</style>
