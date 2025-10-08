<template>
  <div v-if="loading" class="loading-wrapper" :class="{ 'loading-fullscreen': fullscreen }">
    <a-spin :size="size" :tip="tip" />
  </div>
  <div v-else-if="!loading && !fullscreen">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  tip: {
    type: String,
    default: '加载中...'
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large'].includes(value)
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped lang="scss">
.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 0;

  &.loading-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>
