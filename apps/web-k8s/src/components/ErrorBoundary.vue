<script lang="ts" setup>
/**
 * 全局错误边界组件
 * 捕获子组件的错误并显示友好的错误界面
 */
import { onErrorCaptured, ref } from 'vue';

import { Button, Result } from 'ant-design-vue';

interface Props {
  /** 自定义错误标题 */
  title?: string;
  /** 是否显示错误详情 */
  showDetails?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '出错了',
  showDetails: import.meta.env.DEV,
});

const hasError = ref(false);
const errorInfo = ref<{
  componentName?: string;
  message: string;
  stack?: string;
}>({
  message: '',
});

/**
 * 捕获子组件错误
 */
onErrorCaptured((err, instance, info) => {
  hasError.value = true;
  errorInfo.value = {
    message: err.message || '未知错误',
    stack: err.stack,
    componentName: instance?.$options.name || '未知组件',
  };

  // 在开发环境输出到控制台
  if (import.meta.env.DEV) {
    console.error('[ErrorBoundary] Caught error:', {
      error: err,
      component: instance?.$options.name,
      info,
    });
  }

  // 上报错误到监控系统（生产环境）
  if (import.meta.env.PROD) {
    reportError(err, instance, info);
  }

  // 阻止错误继续向上传播
  return false;
});

/**
 * 重置错误状态
 */
function handleReset() {
  hasError.value = false;
  errorInfo.value = { message: '' };
}

/**
 * 重新加载页面
 */
function handleReload() {
  window.location.reload();
}

/**
 * 上报错误
 */
function reportError(err: Error, instance: any, info: string) {
  // TODO: 接入实际的错误监控服务（如 Sentry）
  console.error('[ErrorBoundary] Error reported:', {
    message: err.message,
    stack: err.stack,
    component: instance?.$options.name,
    info,
    url: window.location.href,
    userAgent: navigator.userAgent,
  });
}
</script>

<template>
  <div class="error-boundary">
    <!-- 错误状态 -->
    <div v-if="hasError" class="error-state">
      <Result
        status="error"
        :title="props.title"
        :sub-title="errorInfo.message"
      >
        <template #extra>
          <div class="error-actions">
            <Button type="primary" @click="handleReset"> 重试 </Button>
            <Button @click="handleReload"> 刷新页面 </Button>
          </div>
        </template>
      </Result>

      <!-- 错误详情（仅开发环境） -->
      <div v-if="props.showDetails && errorInfo.stack" class="error-details">
        <details>
          <summary>错误详情</summary>
          <div class="error-stack">
            <div class="error-component">
              <strong>组件:</strong> {{ errorInfo.componentName }}
            </div>
            <div class="error-message">
              <strong>错误:</strong> {{ errorInfo.message }}
            </div>
            <pre class="error-stack-trace">{{ errorInfo.stack }}</pre>
          </div>
        </details>
      </div>
    </div>

    <!-- 正常内容 -->
    <slot v-else></slot>
  </div>
</template>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  padding: 40px;
}

.error-actions {
  display: flex;
  gap: 12px;
}

.error-details {
  max-width: 800px;
  padding: 16px;
  margin-top: 24px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.error-details details {
  cursor: pointer;
}

.error-details summary {
  padding: 8px;
  font-weight: 600;
  color: #666;
}

.error-stack {
  padding: 12px;
  margin-top: 12px;
  background-color: white;
  border-radius: 4px;
}

.error-component,
.error-message {
  margin-bottom: 12px;
  font-size: 14px;
}

.error-stack-trace {
  padding: 12px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #c41d7f;
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

html[data-theme='dark'] .error-details {
  background-color: #1f1f1f;
}

html[data-theme='dark'] .error-stack {
  background-color: #141414;
}

html[data-theme='dark'] .error-stack-trace {
  color: #ff7875;
  background-color: #2a1215;
  border-color: #58181c;
}
</style>
