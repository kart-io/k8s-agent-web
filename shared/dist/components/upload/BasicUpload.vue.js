import { ref, watch, resolveComponent, createElementBlock, openBlock, Fragment, createVNode, withCtx, renderSlot, createBlock, createTextVNode, toDisplayString, unref, createElementVNode } from 'vue';
import { message } from 'ant-design-vue';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons-vue';

const _hoisted_1 = { key: 1 };
const _hoisted_2 = { class: "ant-upload-text" };
const _hoisted_3 = ["src"];


const _sfc_main = {
  __name: 'BasicUpload',
  props: {
  modelValue: {
    type: Array,
    default: () => []
  },
  action: {
    type: String,
    required: true
  },
  headers: {
    type: Object,
    default: () => ({})
  },
  data: {
    type: Object,
    default: () => ({})
  },
  accept: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  maxCount: {
    type: Number
  },
  maxSize: {
    type: Number,
    default: 5 // MB
  },
  listType: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'picture', 'picture-card'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: '上传文件'
  },
  showUploadList: {
    type: [Boolean, Object],
    default: true
  }
},
  emits: ['update:modelValue', 'change', 'preview', 'remove'],
  setup(__props, { emit }) {

const props = __props;





const fileList = ref([]);
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

watch(
  () => props.modelValue,
  (val) => {
    fileList.value = val || [];
  },
  { immediate: true }
);

const handleBeforeUpload = (file) => {
  // 检查文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize;
  if (!isLtMaxSize) {
    message.error(`文件大小不能超过 ${props.maxSize}MB`);
    return false
  }

  // 检查文件类型
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileName = file.name;
    const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

    const isAccepted = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExt === type.toLowerCase()
      }
      return fileType.includes(type.replace('*', ''))
    });

    if (!isAccepted) {
      message.error('文件格式不支持');
      return false
    }
  }

  return true
};

const handleChange = ({ fileList: newFileList }) => {
  fileList.value = newFileList;
  emit('update:modelValue', newFileList);
  emit('change', newFileList);
};

const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj);
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
  emit('preview', file);
};

const handleRemove = (file) => {
  emit('remove', file);
};

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  })
};

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");
  const _component_a_upload = resolveComponent("a-upload");
  const _component_a_modal = resolveComponent("a-modal");

  return (openBlock(), createElementBlock(Fragment, null, [
    createVNode(_component_a_upload, {
      "file-list": fileList.value,
      "onUpdate:fileList": _cache[0] || (_cache[0] = $event => ((fileList).value = $event)),
      action: __props.action,
      headers: __props.headers,
      data: __props.data,
      accept: __props.accept,
      multiple: __props.multiple,
      "max-count": __props.maxCount,
      "before-upload": handleBeforeUpload,
      "on-preview": handlePreview,
      "on-remove": handleRemove,
      "on-change": handleChange,
      "list-type": __props.listType,
      disabled: __props.disabled,
      "show-upload-list": __props.showUploadList
    }, {
      default: withCtx(() => [
        renderSlot(_ctx.$slots, "default", {}, () => [
          (__props.listType !== 'picture-card')
            ? (openBlock(), createBlock(_component_a_button, {
                key: 0,
                disabled: __props.disabled
              }, {
                icon: withCtx(() => [
                  createVNode(unref(UploadOutlined))
                ]),
                default: withCtx(() => [
                  createTextVNode(" " + toDisplayString(__props.buttonText), 1)
                ]),
                _: 1
              }, 8, ["disabled"]))
            : (openBlock(), createElementBlock("div", _hoisted_1, [
                createVNode(unref(PlusOutlined)),
                createElementVNode("div", _hoisted_2, toDisplayString(__props.buttonText), 1)
              ]))
        ])
      ]),
      _: 3
    }, 8, ["file-list", "action", "headers", "data", "accept", "multiple", "max-count", "list-type", "disabled", "show-upload-list"]),
    createVNode(_component_a_modal, {
      open: previewVisible.value,
      "onUpdate:open": _cache[1] || (_cache[1] = $event => ((previewVisible).value = $event)),
      footer: null,
      title: previewTitle.value
    }, {
      default: withCtx(() => [
        createElementVNode("img", {
          src: previewImage.value,
          alt: "preview",
          style: {"width":"100%"}
        }, null, 8, _hoisted_3)
      ]),
      _: 1
    }, 8, ["open", "title"])
  ], 64))
}
}

};

export { _sfc_main as default };
//# sourceMappingURL=BasicUpload.vue.js.map
