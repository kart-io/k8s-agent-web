import { computed, resolveComponent, openBlock, createElementBlock, normalizeClass, createElementVNode, renderSlot, toDisplayString, createCommentVNode, createVNode, withCtx, Fragment, renderList, createBlock, createTextVNode } from 'vue';
import { useRoute } from 'vue-router';
/* empty css                  */import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = {
  key: 0,
  class: "page-header"
};
const _hoisted_2 = { class: "page-header-content" };
const _hoisted_3 = { class: "page-title-area" };
const _hoisted_4 = { class: "page-title" };
const _hoisted_5 = {
  key: 0,
  class: "page-description"
};
const _hoisted_6 = {
  key: 0,
  class: "page-extra"
};
const _hoisted_7 = {
  key: 0,
  class: "page-breadcrumb"
};
const _hoisted_8 = { key: 1 };
const _hoisted_9 = {
  key: 1,
  class: "page-footer"
};


const _sfc_main = {
  __name: 'PageWrapper',
  props: {
  // 页面标题
  title: {
    type: String,
    default: ''
  },
  // 页面描述
  description: {
    type: String,
    default: ''
  },
  // 是否显示头部
  showHeader: {
    type: Boolean,
    default: true
  },
  // 是否显示面包屑
  showBreadcrumb: {
    type: Boolean,
    default: false
  },
  // 面包屑列表
  breadcrumbList: {
    type: Array,
    default: () => []
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 加载提示文字
  loadingTip: {
    type: String,
    default: '加载中...'
  },
  // 紧凑模式
  dense: {
    type: Boolean,
    default: false
  },
  // 内容区域 class
  contentClass: {
    type: [String, Array, Object],
    default: ''
  }
},
  setup(__props) {

const props = __props;

const route = useRoute();

// 从路由生成面包屑
computed(() => {
  if (props.breadcrumbList.length > 0) {
    return props.breadcrumbList
  }

  // 自动从路由生成
  const matched = route.matched;
  return matched
    .filter(item => item.meta && item.meta.title)
    .map(item => ({
      title: item.meta.title,
      path: item.path
    }))
});

return (_ctx, _cache) => {
  const _component_router_link = resolveComponent("router-link");
  const _component_a_breadcrumb_item = resolveComponent("a-breadcrumb-item");
  const _component_a_breadcrumb = resolveComponent("a-breadcrumb");
  const _component_a_spin = resolveComponent("a-spin");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["page-wrapper", { 'page-wrapper--dense': __props.dense }])
  }, [
    (__props.showHeader)
      ? (openBlock(), createElementBlock("div", _hoisted_1, [
          createElementVNode("div", _hoisted_2, [
            createElementVNode("div", _hoisted_3, [
              renderSlot(_ctx.$slots, "title", {}, () => [
                createElementVNode("h2", _hoisted_4, toDisplayString(__props.title), 1)
              ], true),
              (__props.description)
                ? (openBlock(), createElementBlock("div", _hoisted_5, toDisplayString(__props.description), 1))
                : createCommentVNode("", true)
            ]),
            (_ctx.$slots.extra)
              ? (openBlock(), createElementBlock("div", _hoisted_6, [
                  renderSlot(_ctx.$slots, "extra", {}, undefined, true)
                ]))
              : createCommentVNode("", true)
          ]),
          (__props.showBreadcrumb)
            ? (openBlock(), createElementBlock("div", _hoisted_7, [
                renderSlot(_ctx.$slots, "breadcrumb", {}, () => [
                  createVNode(_component_a_breadcrumb, null, {
                    default: withCtx(() => [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(__props.breadcrumbList, (item) => {
                        return (openBlock(), createBlock(_component_a_breadcrumb_item, {
                          key: item.path
                        }, {
                          default: withCtx(() => [
                            (item.path)
                              ? (openBlock(), createBlock(_component_router_link, {
                                  key: 0,
                                  to: item.path
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(item.title), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["to"]))
                              : (openBlock(), createElementBlock("span", _hoisted_8, toDisplayString(item.title), 1))
                          ]),
                          _: 2
                        }, 1024))
                      }), 128))
                    ]),
                    _: 1
                  })
                ], true)
              ]))
            : createCommentVNode("", true)
        ]))
      : createCommentVNode("", true),
    createElementVNode("div", {
      class: normalizeClass(["page-content", __props.contentClass])
    }, [
      createVNode(_component_a_spin, {
        spinning: __props.loading,
        tip: __props.loadingTip
      }, {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default", {}, undefined, true)
        ]),
        _: 3
      }, 8, ["spinning", "tip"])
    ], 2),
    (_ctx.$slots.footer)
      ? (openBlock(), createElementBlock("div", _hoisted_9, [
          renderSlot(_ctx.$slots, "footer", {}, undefined, true)
        ]))
      : createCommentVNode("", true)
  ], 2))
}
}

};
const PageWrapper = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-e76a0a54"]]);

export { PageWrapper as default };
//# sourceMappingURL=PageWrapper.vue.js.map
