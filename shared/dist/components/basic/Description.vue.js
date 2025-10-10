import { resolveComponent, createElementBlock, openBlock, normalizeClass, createCommentVNode, createElementVNode, renderSlot, toDisplayString, createVNode, withCtx, Fragment, renderList, createBlock, createTextVNode, unref, resolveDynamicComponent } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
/* empty css                 */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = {
  key: 0,
  class: "description-header"
};
const _hoisted_2 = { class: "description-title" };
const _hoisted_3 = {
  key: 0,
  class: "description-extra"
};
const _hoisted_4 = { class: "description-content" };
const _hoisted_5 = { class: "description-item" };
const _hoisted_6 = { class: "description-item-label" };
const _hoisted_7 = {
  key: 0,
  class: "description-item-required"
};
const _hoisted_8 = {
  key: 1,
  class: "description-item-tooltip"
};
const _hoisted_9 = { class: "description-item-value" };
const _hoisted_10 = { key: 2 };


const _sfc_main = {
  __name: 'Description',
  props: {
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 数据源
  data: {
    type: Object,
    default: () => ({})
  },
  // 描述配置
  schema: {
    type: Array,
    default: () => []
  },
  // 列数（每项占据的栅格数）
  defaultSpan: {
    type: Number,
    default: 8
  },
  // 栅格间距
  gutter: {
    type: [Number, Array],
    default: 16
  },
  // 是否显示边框
  bordered: {
    type: Boolean,
    default: false
  },
  // 空值显示文本
  emptyText: {
    type: String,
    default: '-'
  }
},
  setup(__props) {

const props = __props;



// 获取字段值
const getFieldValue = (field) => {
  if (!field) return ''

  // 支持嵌套字段，如 "user.name"
  const keys = field.split('.');
  let value = props.data;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return ''
    }
  }

  return value
};

return (_ctx, _cache) => {
  const _component_a_tooltip = resolveComponent("a-tooltip");
  const _component_a_col = resolveComponent("a-col");
  const _component_a_row = resolveComponent("a-row");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["description", { 'description--bordered': __props.bordered }])
  }, [
    (__props.title || _ctx.$slots.title)
      ? (openBlock(), createElementBlock("div", _hoisted_1, [
          renderSlot(_ctx.$slots, "title", {}, () => [
            createElementVNode("h3", _hoisted_2, toDisplayString(__props.title), 1)
          ], true),
          (_ctx.$slots.extra)
            ? (openBlock(), createElementBlock("div", _hoisted_3, [
                renderSlot(_ctx.$slots, "extra", {}, undefined, true)
              ]))
            : createCommentVNode("", true)
        ]))
      : createCommentVNode("", true),
    createElementVNode("div", _hoisted_4, [
      createVNode(_component_a_row, { gutter: __props.gutter }, {
        default: withCtx(() => [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.schema, (item, index) => {
            return (openBlock(), createBlock(_component_a_col, {
              key: index,
              span: item.span || __props.defaultSpan
            }, {
              default: withCtx(() => [
                createElementVNode("div", _hoisted_5, [
                  createElementVNode("div", _hoisted_6, [
                    createTextVNode(toDisplayString(item.label) + " ", 1),
                    (item.required)
                      ? (openBlock(), createElementBlock("span", _hoisted_7, "*"))
                      : createCommentVNode("", true),
                    (item.tooltip)
                      ? (openBlock(), createElementBlock("span", _hoisted_8, [
                          createVNode(_component_a_tooltip, {
                            title: item.tooltip
                          }, {
                            default: withCtx(() => [
                              createVNode(unref(QuestionCircleOutlined))
                            ]),
                            _: 2
                          }, 1032, ["title"])
                        ]))
                      : createCommentVNode("", true)
                  ]),
                  createElementVNode("div", _hoisted_9, [
                    (item.slot)
                      ? renderSlot(_ctx.$slots, item.slot, {
                          key: 0,
                          data: __props.data,
                          item: item
                        }, undefined, true)
                      : (item.render)
                        ? (openBlock(), createBlock(resolveDynamicComponent(item.render), {
                            key: 1,
                            data: __props.data,
                            item: item
                          }, null, 8, ["data", "item"]))
                        : (openBlock(), createElementBlock("span", _hoisted_10, toDisplayString(getFieldValue(item.field) || __props.emptyText), 1))
                  ])
                ])
              ]),
              _: 2
            }, 1032, ["span"]))
          }), 128))
        ]),
        _: 3
      }, 8, ["gutter"]),
      renderSlot(_ctx.$slots, "default", {}, undefined, true)
    ])
  ], 2))
}
}

};
const Description = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-2f728e8b"]]);

export { Description as default };
//# sourceMappingURL=Description.vue.js.map
