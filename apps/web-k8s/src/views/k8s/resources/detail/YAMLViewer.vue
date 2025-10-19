<script lang="ts" setup>
/**
 * YAML 查看器组件
 * 以只读模式展示资源的 YAML 格式
 */
import { computed } from 'vue';

import yaml from 'js-yaml';

interface Props {
  resource: any;
}

const props = defineProps<Props>();

// 转换为 YAML 字符串
const yamlContent = computed(() => {
  try {
    return yaml.dump(props.resource, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
  } catch (error) {
    console.error('YAML 转换失败:', error);
    return '# YAML 转换失败\n';
  }
});
</script>

<template>
  <div class="yaml-viewer">
    <pre><code>{{ yamlContent }}</code></pre>
  </div>
</template>

<style scoped>
.yaml-viewer {
  padding: 12px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  transition: all 0.3s ease;
}

.yaml-viewer pre {
  max-height: 600px;
  padding: 16px;
  margin: 0;
  overflow: auto;
  font-family:
    Monaco, Menlo, 'Ubuntu Mono', Consolas, source-code-pro, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vben-text-color);
  background-color: var(--vben-background-color-deep);
  border: 2px solid #808080;
  border-radius: 4px;
  transition: all 0.3s ease;
}

/* 深色主题 YAML 内容边框 */
html[data-theme='dark'] .yaml-viewer pre {
  border-color: #fff !important;
}

/* 浅色主题 YAML 内容边框 */
html[data-theme='light'] .yaml-viewer pre,
html:not([data-theme]) .yaml-viewer pre {
  border-color: #808080 !important;
}

.yaml-viewer code {
  display: block;
  overflow-x: auto;
  word-wrap: normal;
  white-space: pre;
}

/* 滚动条样式 */
.yaml-viewer pre::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.yaml-viewer pre::-webkit-scrollbar-track {
  background-color: var(--vben-background-color);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.yaml-viewer pre::-webkit-scrollbar-thumb {
  background-color: var(--vben-border-color);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.yaml-viewer pre::-webkit-scrollbar-thumb:hover {
  background-color: var(--vben-text-color-secondary);
}
</style>
