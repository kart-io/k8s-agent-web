<script lang="ts" setup>
/**
 * 异步组件加载错误组件
 * 用于 defineAsyncComponent 的 error 状态显示
 */
import { Button, Result } from 'ant-design-vue';

interface Props {
  /** 错误信息 */
  error?: Error;
  /** 重试回调 */
  onRetry?: () => void;
}

const props = defineProps<Props>();

function handleRetry() {
  if (props.onRetry) {
    props.onRetry();
  } else {
    window.location.reload();
  }
}
</script>

<template>
  <div class="async-error">
    <Result
      status="error"
      title="组件加载失败"
      :sub-title="error?.message || '网络错误，请重试'"
    >
      <template #extra>
        <Button type="primary" @click="handleRetry"> 重新加载 </Button>
      </template>
    </Result>
  </div>
</template>

<style scoped>
.async-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}
</style>
