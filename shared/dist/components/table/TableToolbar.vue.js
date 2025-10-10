import { ref, resolveComponent, openBlock, createElementBlock, createElementVNode, renderSlot, createVNode, withCtx, createBlock, unref, createCommentVNode } from 'vue';
import { ReloadOutlined, SettingOutlined, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
/* empty css                   */import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "table-toolbar" };
const _hoisted_2 = { class: "table-toolbar-left" };
const _hoisted_3 = { class: "table-toolbar-right" };


const _sfc_main = {
  __name: 'TableToolbar',
  props: {
  showRefresh: {
    type: Boolean,
    default: true
  },
  showColumnSetting: {
    type: Boolean,
    default: true
  },
  showFullscreen: {
    type: Boolean,
    default: true
  }
},
  emits: ['refresh', 'column-setting', 'fullscreen'],
  setup(__props, { expose: __expose, emit: __emit }) {



const emit = __emit;

const isFullscreen = ref(false);

const handleRefresh = () => {
  emit('refresh');
};

const handleColumnSetting = () => {
  emit('column-setting');
};

const handleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  emit('fullscreen', isFullscreen.value);
};

__expose({
  isFullscreen
});

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");
  const _component_a_tooltip = resolveComponent("a-tooltip");
  const _component_a_space = resolveComponent("a-space");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createElementVNode("div", _hoisted_2, [
      renderSlot(_ctx.$slots, "toolbar-left", {}, undefined, true)
    ]),
    createElementVNode("div", _hoisted_3, [
      createVNode(_component_a_space, null, {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "toolbar-right", {}, undefined, true),
          (__props.showRefresh)
            ? (openBlock(), createBlock(_component_a_tooltip, {
                key: 0,
                title: "刷新"
              }, {
                default: withCtx(() => [
                  createVNode(_component_a_button, {
                    type: "text",
                    onClick: handleRefresh
                  }, {
                    icon: withCtx(() => [
                      createVNode(unref(ReloadOutlined))
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }))
            : createCommentVNode("", true),
          (__props.showColumnSetting)
            ? (openBlock(), createBlock(_component_a_tooltip, {
                key: 1,
                title: "列设置"
              }, {
                default: withCtx(() => [
                  createVNode(_component_a_button, {
                    type: "text",
                    onClick: handleColumnSetting
                  }, {
                    icon: withCtx(() => [
                      createVNode(unref(SettingOutlined))
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }))
            : createCommentVNode("", true),
          (__props.showFullscreen)
            ? (openBlock(), createBlock(_component_a_tooltip, {
                key: 2,
                title: isFullscreen.value ? '退出全屏' : '全屏'
              }, {
                default: withCtx(() => [
                  createVNode(_component_a_button, {
                    type: "text",
                    onClick: handleFullscreen
                  }, {
                    icon: withCtx(() => [
                      (isFullscreen.value)
                        ? (openBlock(), createBlock(unref(FullscreenExitOutlined), { key: 0 }))
                        : (openBlock(), createBlock(unref(FullscreenOutlined), { key: 1 }))
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["title"]))
            : createCommentVNode("", true)
        ]),
        _: 3
      })
    ])
  ]))
}
}

};
const TableToolbar = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-3c0d64a1"]]);

export { TableToolbar as default };
//# sourceMappingURL=TableToolbar.vue.js.map
