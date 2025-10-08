<template>
  <div :class="['scroll-container', { 'show-scrollbar': showScrollbar }]" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 是否显示滚动条
  showScrollbar: {
    type: Boolean,
    default: true
  },
  // 高度
  height: {
    type: [String, Number]
  },
  // 最大高度
  maxHeight: {
    type: [String, Number]
  }
})

const containerStyle = computed(() => {
  const style = {}
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }
  return style
})
</script>

<style scoped lang="scss">
.scroll-container {
  overflow: auto;

  &:not(.show-scrollbar) {
    // 隐藏滚动条但保持滚动功能
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */

    &::-webkit-scrollbar {
      display: none; /* Chrome Safari */
    }
  }

  &.show-scrollbar {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.3);
      }
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
}
</style>
