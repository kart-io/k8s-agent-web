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
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 16px;
  max-height: 600px;
  overflow: auto;
}

.yaml-viewer pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro',
    monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
}

.yaml-viewer code {
  display: block;
  white-space: pre;
  word-wrap: normal;
  overflow-x: auto;
}

/* 滚动条样式 */
.yaml-viewer::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.yaml-viewer::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.yaml-viewer::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.yaml-viewer::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
