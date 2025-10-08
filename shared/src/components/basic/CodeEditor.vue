<template>
  <div class="code-editor" :style="{ height: height }">
    <textarea ref="editorRef" :value="modelValue" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript',
    validator: (value) => ['javascript', 'typescript', 'json', 'html', 'css', 'python', 'go', 'yaml'].includes(value)
  },
  theme: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'monokai', 'dracula'].includes(value)
  },
  height: {
    type: String,
    default: '400px'
  },
  readonly: {
    type: Boolean,
    default: false
  },
  showLineNumbers: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const editorRef = ref(null)
let editor = null

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  destroyEditor()
})

const initEditor = () => {
  try {
    // 这里可以集成 CodeMirror, Monaco Editor 或其他编辑器
    // 为了简化，这里使用简单的 textarea 实现
    // 实际项目中建议使用专业的代码编辑器库

    if (editorRef.value) {
      const textarea = editorRef.value
      textarea.addEventListener('input', handleInput)

      // 应用基本样式
      applyBasicStyles(textarea)
    }
  } catch (error) {
    console.error('Failed to initialize editor:', error)
    message.error('代码编辑器初始化失败')
  }
}

const applyBasicStyles = (textarea) => {
  textarea.style.width = '100%'
  textarea.style.height = '100%'
  textarea.style.border = '1px solid #d9d9d9'
  textarea.style.borderRadius = '4px'
  textarea.style.padding = '12px'
  textarea.style.fontFamily = "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace"
  textarea.style.fontSize = '14px'
  textarea.style.lineHeight = '1.5'
  textarea.style.resize = 'none'
  textarea.style.outline = 'none'

  if (props.readonly) {
    textarea.readOnly = true
    textarea.style.backgroundColor = '#f5f5f5'
  }
}

const handleInput = (e) => {
  const value = e.target.value
  emit('update:modelValue', value)
  emit('change', value)
}

const destroyEditor = () => {
  if (editorRef.value) {
    editorRef.value.removeEventListener('input', handleInput)
  }
}

watch(() => props.modelValue, (newValue) => {
  if (editorRef.value && editorRef.value.value !== newValue) {
    editorRef.value.value = newValue
  }
})

// 暴露方法
defineExpose({
  getValue: () => editorRef.value?.value || '',
  setValue: (value) => {
    if (editorRef.value) {
      editorRef.value.value = value
      emit('update:modelValue', value)
    }
  },
  focus: () => editorRef.value?.focus()
})
</script>

<style scoped lang="scss">
.code-editor {
  width: 100%;
  position: relative;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;

  &:hover {
    border-color: #40a9ff;
  }

  &:focus-within {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
}
</style>
