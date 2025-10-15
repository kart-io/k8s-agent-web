<script lang="ts" setup>
/**
 * YAML 编辑器模态框
 * 用于编辑 K8s 资源的 YAML 配置
 */
import { computed, ref, watch } from 'vue';

import { Alert, Button, Modal } from 'ant-design-vue';
import * as yaml from 'js-yaml';

defineOptions({ name: 'YAMLEditorModal' });

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

interface Props {
  visible: boolean;
  resource: any;
  resourceType: string;
  resourceName?: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', resource: any): void;
}

// YAML 内容
const yamlContent = ref('');
const loading = ref(false);
const validationError = ref('');

// 文本框引用
const textareaRef = ref<HTMLTextAreaElement>();

// 当资源变化时，转换为 YAML
watch(
  () => props.resource,
  (newResource) => {
    if (newResource) {
      try {
        yamlContent.value = yaml.dump(newResource, {
          indent: 2,
          lineWidth: -1, // 不自动换行
          noRefs: true,
        });
        validationError.value = '';
      } catch (error: any) {
        validationError.value = `转换为 YAML 失败: ${error.message}`;
      }
    }
  },
  { immediate: true },
);

// 标题
const title = computed(() => {
  const name = props.resourceName || props.resource?.metadata?.name || '';
  return `编辑 ${props.resourceType}${name ? ` - ${name}` : ''}`;
});

/**
 * 实时验证 YAML
 */
function validateYAML() {
  try {
    yaml.load(yamlContent.value);
    validationError.value = '';
    return true;
  } catch (error: any) {
    validationError.value = `YAML 格式错误: ${error.message}`;
    return false;
  }
}

/**
 * 处理 YAML 变化
 */
function handleYAMLChange() {
  // 实时验证（但不显示错误，只在提交时显示）
  try {
    yaml.load(yamlContent.value);
    validationError.value = '';
  } catch {
    // 不在输入时显示错误
  }
}

/**
 * 格式化 YAML
 */
function handleFormat() {
  try {
    const parsed = yaml.load(yamlContent.value);
    yamlContent.value = yaml.dump(parsed, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
    validationError.value = '';
  } catch (error: any) {
    validationError.value = `格式化失败: ${error.message}`;
  }
}

/**
 * 确认编辑
 */
async function handleOk() {
  // 验证 YAML
  if (!validateYAML()) {
    return;
  }

  try {
    loading.value = true;

    // 解析 YAML
    const updatedResource = yaml.load(yamlContent.value);

    // 发送确认事件
    emit('confirm', updatedResource);

    // 关闭模态框
    emit('update:visible', false);
  } catch (error: any) {
    validationError.value = `解析 YAML 失败: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

/**
 * 取消编辑
 */
function handleCancel() {
  emit('update:visible', false);
  validationError.value = '';
}
</script>

<template>
  <Modal
    :open="visible"
    :title="title"
    width="900px"
    :confirm-loading="loading"
    :destroy-on-close="true"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <Button size="small" @click="handleFormat">格式化</Button>
      <span class="editor-info"> 支持 YAML 格式编辑 K8s 资源配置 </span>
    </div>

    <!-- 错误提示 -->
    <Alert
      v-if="validationError"
      :message="validationError"
      type="error"
      show-icon
      closable
      class="editor-error"
      @close="() => (validationError = '')"
    />

    <!-- YAML 编辑器 -->
    <div class="yaml-editor-wrapper">
      <textarea
        ref="textareaRef"
        v-model="yamlContent"
        class="yaml-editor"
        spellcheck="false"
        @input="handleYAMLChange"
      ></textarea>
    </div>

    <!-- 提示信息 -->
    <Alert
      message="提示"
      description="编辑 YAML 配置时请谨慎操作，错误的配置可能导致资源无法正常工作。"
      type="info"
      show-icon
      class="editor-hint"
    />
  </Modal>
</template>

<style scoped>
.editor-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.editor-info {
  margin-left: auto;
  font-size: 13px;
  color: var(--vben-text-color-secondary);
}

.editor-error {
  margin-bottom: 12px;
}

.editor-hint {
  margin-top: 12px;
}

.yaml-editor-wrapper {
  position: relative;
  height: 600px;
  overflow: hidden;
  border: 2px solid var(--yaml-border-color);
  border-radius: 4px;
}

.yaml-editor {
  width: 100%;
  height: 100%;
  padding: 16px;
  overflow-x: auto;
  font-family:
    Monaco, Menlo, 'Ubuntu Mono', Consolas, source-code-pro, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--yaml-text-color);
  overflow-wrap: normal;
  tab-size: 2;
  white-space: pre;
  resize: none;
  outline: none;
  background-color: var(--yaml-bg-color);
  border: none;
}

/* 滚动条样式 */
.yaml-editor::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.yaml-editor::-webkit-scrollbar-track {
  background-color: var(--yaml-scrollbar-track-color);
}

.yaml-editor::-webkit-scrollbar-thumb {
  background-color: var(--yaml-scrollbar-thumb-color);
  border-radius: 4px;
}

.yaml-editor::-webkit-scrollbar-thumb:hover {
  background-color: var(--yaml-scrollbar-thumb-hover-color);
}

/* 深色主题 */
html[data-theme='dark'] {
  --yaml-bg-color: #1e1e1e;
  --yaml-text-color: #d4d4d4;
  --yaml-border-color: #3c3c3c;
  --yaml-scrollbar-track-color: #2d2d2d;
  --yaml-scrollbar-thumb-color: #555;
  --yaml-scrollbar-thumb-hover-color: #666;
}

/* 浅色主题 */
html[data-theme='light'],
html:not([data-theme]) {
  --yaml-bg-color: #fff;
  --yaml-text-color: #24292e;
  --yaml-border-color: #d1d5da;
  --yaml-scrollbar-track-color: #f0f0f0;
  --yaml-scrollbar-thumb-color: #c1c1c1;
  --yaml-scrollbar-thumb-hover-color: #a8a8a8;
}
</style>
