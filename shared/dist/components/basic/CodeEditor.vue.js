import { ref, onMounted, onBeforeUnmount, watch, openBlock, createElementBlock, normalizeStyle, createElementVNode } from 'vue';
import { message } from 'ant-design-vue';
/* empty css                 */import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = ["value"];


const _sfc_main = {
  __name: 'CodeEditor',
  props: {
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
},
  emits: ['update:modelValue', 'change'],
  setup(__props, { expose: __expose, emit: __emit }) {

const props = __props;

const emit = __emit;

const editorRef = ref(null);

onMounted(() => {
  initEditor();
});

onBeforeUnmount(() => {
  destroyEditor();
});

const initEditor = () => {
  try {
    // 这里可以集成 CodeMirror, Monaco Editor 或其他编辑器
    // 为了简化，这里使用简单的 textarea 实现
    // 实际项目中建议使用专业的代码编辑器库

    if (editorRef.value) {
      const textarea = editorRef.value;
      textarea.addEventListener('input', handleInput);

      // 应用基本样式
      applyBasicStyles(textarea);
    }
  } catch (error) {
    console.error('Failed to initialize editor:', error);
    message.error('代码编辑器初始化失败');
  }
};

const applyBasicStyles = (textarea) => {
  textarea.style.width = '100%';
  textarea.style.height = '100%';
  textarea.style.border = '1px solid #d9d9d9';
  textarea.style.borderRadius = '4px';
  textarea.style.padding = '12px';
  textarea.style.fontFamily = "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace";
  textarea.style.fontSize = '14px';
  textarea.style.lineHeight = '1.5';
  textarea.style.resize = 'none';
  textarea.style.outline = 'none';

  if (props.readonly) {
    textarea.readOnly = true;
    textarea.style.backgroundColor = '#f5f5f5';
  }
};

const handleInput = (e) => {
  const value = e.target.value;
  emit('update:modelValue', value);
  emit('change', value);
};

const destroyEditor = () => {
  if (editorRef.value) {
    editorRef.value.removeEventListener('input', handleInput);
  }
};

watch(() => props.modelValue, (newValue) => {
  if (editorRef.value && editorRef.value.value !== newValue) {
    editorRef.value.value = newValue;
  }
});

// 暴露方法
__expose({
  getValue: () => editorRef.value?.value || '',
  setValue: (value) => {
    if (editorRef.value) {
      editorRef.value.value = value;
      emit('update:modelValue', value);
    }
  },
  focus: () => editorRef.value?.focus()
});

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", {
    class: "code-editor",
    style: normalizeStyle({ height: __props.height })
  }, [
    createElementVNode("textarea", {
      ref_key: "editorRef",
      ref: editorRef,
      value: __props.modelValue
    }, null, 8, _hoisted_1)
  ], 4))
}
}

};
const CodeEditor = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-f2e4e7bd"]]);

export { CodeEditor as default };
//# sourceMappingURL=CodeEditor.vue.js.map
