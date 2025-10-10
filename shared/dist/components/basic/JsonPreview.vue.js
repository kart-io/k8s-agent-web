import { ref, computed, resolveComponent, openBlock, createElementBlock, createVNode, withCtx, unref, createTextVNode, createBlock, toDisplayString, createCommentVNode, createElementVNode, normalizeClass } from 'vue';
import { message } from 'ant-design-vue';
import { CopyOutlined, ExpandOutlined, ShrinkOutlined, DownloadOutlined } from '@ant-design/icons-vue';
/* empty css                  */import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "json-preview" };
const _hoisted_2 = {
  key: 0,
  class: "json-toolbar"
};


const _sfc_main = {
  __name: 'JsonPreview',
  props: {
  data: {
    type: [Object, Array, String],
    required: true
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  showDownload: {
    type: Boolean,
    default: true
  },
  indent: {
    type: Number,
    default: 2
  },
  fileName: {
    type: String,
    default: 'data.json'
  }
},
  setup(__props) {

const props = __props;

const expanded = ref(true);

const formattedJson = computed(() => {
  try {
    const data = typeof props.data === 'string' ? JSON.parse(props.data) : props.data;
    return JSON.stringify(data, null, props.indent)
  } catch (error) {
    console.error('Failed to format JSON:', error);
    return String(props.data)
  }
});

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value);
    message.success('复制成功');
  } catch (error) {
    console.error('Failed to copy:', error);
    message.error('复制失败');
  }
};

const handleExpand = () => {
  expanded.value = !expanded.value;
};

const handleDownload = () => {
  try {
    const blob = new Blob([formattedJson.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = props.fileName;
    link.click();
    URL.revokeObjectURL(url);
    message.success('下载成功');
  } catch (error) {
    console.error('Failed to download:', error);
    message.error('下载失败');
  }
};

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");
  const _component_a_space = resolveComponent("a-space");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    (__props.showToolbar)
      ? (openBlock(), createElementBlock("div", _hoisted_2, [
          createVNode(_component_a_space, null, {
            default: withCtx(() => [
              createVNode(_component_a_button, {
                size: "small",
                onClick: handleCopy
              }, {
                icon: withCtx(() => [
                  createVNode(unref(CopyOutlined))
                ]),
                default: withCtx(() => [
                  _cache[0] || (_cache[0] = createTextVNode(" 复制 ", -1))
                ]),
                _: 1
              }),
              createVNode(_component_a_button, {
                size: "small",
                onClick: handleExpand
              }, {
                icon: withCtx(() => [
                  (!expanded.value)
                    ? (openBlock(), createBlock(unref(ExpandOutlined), { key: 0 }))
                    : (openBlock(), createBlock(unref(ShrinkOutlined), { key: 1 }))
                ]),
                default: withCtx(() => [
                  createTextVNode(" " + toDisplayString(expanded.value ? '折叠' : '展开'), 1)
                ]),
                _: 1
              }),
              (__props.showDownload)
                ? (openBlock(), createBlock(_component_a_button, {
                    key: 0,
                    size: "small",
                    onClick: handleDownload
                  }, {
                    icon: withCtx(() => [
                      createVNode(unref(DownloadOutlined))
                    ]),
                    default: withCtx(() => [
                      _cache[1] || (_cache[1] = createTextVNode(" 下载 ", -1))
                    ]),
                    _: 1
                  }))
                : createCommentVNode("", true)
            ]),
            _: 1
          })
        ]))
      : createCommentVNode("", true),
    createElementVNode("div", {
      class: normalizeClass(["json-content", { expanded: expanded.value }])
    }, [
      createElementVNode("pre", null, [
        createElementVNode("code", null, toDisplayString(formattedJson.value), 1)
      ])
    ], 2)
  ]))
}
}

};
const JsonPreview = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-0516112b"]]);

export { JsonPreview as default };
//# sourceMappingURL=JsonPreview.vue.js.map
