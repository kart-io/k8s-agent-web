<script lang="ts" setup>
/**
 * 异步组件加载状态组件
 * 用于 defineAsyncComponent 的 loading 状态显示
 */
import { Spin } from 'ant-design-vue';

interface Props {
  /** 提示文本 */
  tip?: string;
  /** 最小高度 */
  minHeight?: string;
}

withDefaults(defineProps<Props>(), {
  tip: '加载中...',
  minHeight: '200px',
});
</script>

<template>
  <div class="async-loading" :style="{ minHeight }">
    <Spin :tip="tip" size="large" />
  </div>
</template>

<style scoped>
.async-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
