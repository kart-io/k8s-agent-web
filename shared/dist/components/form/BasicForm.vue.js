import { ref, reactive, watch, computed, resolveComponent, createBlock, openBlock, mergeProps, withCtx, createVNode, createElementBlock, createCommentVNode, Fragment, renderList, renderSlot, createTextVNode, toDisplayString } from 'vue';

const _sfc_main = {
  __name: 'BasicForm',
  props: {
  // 表单配置项
  schemas: {
    type: Array,
    default: () => []
  },
  // 表单数据
  model: {
    type: Object,
    default: () => ({})
  },
  // 表单验证规则
  rules: {
    type: Object,
    default: () => ({})
  },
  // 标签布局
  labelCol: {
    type: Object,
    default: () => ({ span: 6 })
  },
  // 控件布局
  wrapperCol: {
    type: Object,
    default: () => ({ span: 18 })
  },
  // 栅格间距
  gutter: {
    type: Number,
    default: 16
  },
  // 默认列跨度
  defaultColSpan: {
    type: Number,
    default: 24
  },
  // 是否显示操作按钮
  showActionButtons: {
    type: Boolean,
    default: true
  },
  // 操作按钮列跨度
  actionColSpan: {
    type: Number,
    default: 24
  },
  // 提交按钮文本
  submitText: {
    type: String,
    default: '提交'
  },
  // 重置按钮文本
  resetText: {
    type: String,
    default: '重置'
  },
  // 提交加载状态
  submitLoading: {
    type: Boolean,
    default: false
  }
},
  emits: ['submit', 'reset', 'update:model', 'register'],
  setup(__props, { expose: __expose, emit }) {

const props = __props;





// 表单引用
const formRef = ref(null);

// 表单数据
const formModel = reactive({ ...props.model });

// 监听外部 model 变化
watch(() => props.model, (newVal) => {
  Object.assign(formModel, newVal);
}, { deep: true });

// 监听内部 model 变化，同步到外部
watch(formModel, (newVal) => {
  emit('update:model', newVal);
}, { deep: true });

// 表单规则
const formRules = computed(() => {
  const rules = { ...props.rules };

  // 从 schemas 中提取规则
  props.schemas.forEach(schema => {
    if (schema.rules) {
      rules[schema.field] = schema.rules;
    } else if (schema.required) {
      rules[schema.field] = [
        {
          required: true,
          message: `${schema.label}不能为空`,
          trigger: schema.component === 'Select' ? 'change' : 'blur'
        }
      ];
    }
  });

  return rules
});

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    emit('submit', formModel);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 重置
const handleReset = () => {
  formRef.value.resetFields();
  emit('reset');
};

// 验证
const validate = async () => {
  return await formRef.value.validate()
};

// 验证指定字段
const validateFields = async (fields) => {
  return await formRef.value.validateFields(fields)
};

// 清除验证
const clearValidate = (fields) => {
  formRef.value.clearValidate(fields);
};

// 重置字段
const resetFields = (fields) => {
  formRef.value.resetFields(fields);
};

// 设置字段值
const setFieldsValue = (values) => {
  Object.assign(formModel, values);
};

// 获取字段值
const getFieldsValue = () => {
  return { ...formModel }
};

// 暴露方法
__expose({
  validate,
  validateFields,
  clearValidate,
  resetFields,
  setFieldsValue,
  getFieldsValue,
  formRef
});

// 注册表单实例
emit('register', {
  validate,
  validateFields,
  clearValidate,
  resetFields,
  setFieldsValue,
  getFieldsValue
});

return (_ctx, _cache) => {
  const _component_a_input = resolveComponent("a-input");
  const _component_a_input_password = resolveComponent("a-input-password");
  const _component_a_textarea = resolveComponent("a-textarea");
  const _component_a_input_number = resolveComponent("a-input-number");
  const _component_a_select = resolveComponent("a-select");
  const _component_a_checkbox_group = resolveComponent("a-checkbox-group");
  const _component_a_radio_group = resolveComponent("a-radio-group");
  const _component_a_switch = resolveComponent("a-switch");
  const _component_a_date_picker = resolveComponent("a-date-picker");
  const _component_a_time_picker = resolveComponent("a-time-picker");
  const _component_a_range_picker = resolveComponent("a-range-picker");
  const _component_a_form_item = resolveComponent("a-form-item");
  const _component_a_col = resolveComponent("a-col");
  const _component_a_button = resolveComponent("a-button");
  const _component_a_space = resolveComponent("a-space");
  const _component_a_row = resolveComponent("a-row");
  const _component_a_form = resolveComponent("a-form");

  return (openBlock(), createBlock(_component_a_form, mergeProps({
    ref_key: "formRef",
    ref: formRef,
    model: formModel,
    rules: formRules.value,
    "label-col": __props.labelCol,
    "wrapper-col": __props.wrapperCol
  }, _ctx.$attrs), {
    default: withCtx(() => [
      createVNode(_component_a_row, { gutter: __props.gutter }, {
        default: withCtx(() => [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.schemas, (schema) => {
            return (openBlock(), createElementBlock(Fragment, {
              key: schema.field
            }, [
              (!schema.hidden)
                ? (openBlock(), createBlock(_component_a_col, {
                    key: 0,
                    span: schema.colSpan || __props.defaultColSpan
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_a_form_item, {
                        label: schema.label,
                        name: schema.field,
                        "label-col": schema.labelCol || __props.labelCol,
                        "wrapper-col": schema.wrapperCol || __props.wrapperCol
                      }, {
                        default: withCtx(() => [
                          (schema.component === 'Input')
                            ? (openBlock(), createBlock(_component_a_input, mergeProps({
                                key: 0,
                                value: formModel[schema.field],
                                "onUpdate:value": $event => ((formModel[schema.field]) = $event),
                                placeholder: schema.placeholder || `请输入${schema.label}`
                              }, schema.componentProps), null, 16, ["value", "onUpdate:value", "placeholder"]))
                            : (schema.component === 'InputPassword')
                              ? (openBlock(), createBlock(_component_a_input_password, mergeProps({
                                  key: 1,
                                  value: formModel[schema.field],
                                  "onUpdate:value": $event => ((formModel[schema.field]) = $event),
                                  placeholder: schema.placeholder || `请输入${schema.label}`
                                }, schema.componentProps), null, 16, ["value", "onUpdate:value", "placeholder"]))
                              : (schema.component === 'Textarea')
                                ? (openBlock(), createBlock(_component_a_textarea, mergeProps({
                                    key: 2,
                                    value: formModel[schema.field],
                                    "onUpdate:value": $event => ((formModel[schema.field]) = $event),
                                    placeholder: schema.placeholder || `请输入${schema.label}`
                                  }, schema.componentProps), null, 16, ["value", "onUpdate:value", "placeholder"]))
                                : (schema.component === 'InputNumber')
                                  ? (openBlock(), createBlock(_component_a_input_number, mergeProps({
                                      key: 3,
                                      value: formModel[schema.field],
                                      "onUpdate:value": $event => ((formModel[schema.field]) = $event),
                                      placeholder: schema.placeholder || `请输入${schema.label}`,
                                      style: {"width":"100%"}
                                    }, schema.componentProps), null, 16, ["value", "onUpdate:value", "placeholder"]))
                                  : (schema.component === 'Select')
                                    ? (openBlock(), createBlock(_component_a_select, mergeProps({
                                        key: 4,
                                        value: formModel[schema.field],
                                        "onUpdate:value": $event => ((formModel[schema.field]) = $event),
                                        placeholder: schema.placeholder || `请选择${schema.label}`,
                                        options: schema.options
                                      }, schema.componentProps), null, 16, ["value", "onUpdate:value", "placeholder", "options"]))
                                    : (schema.component === 'CheckboxGroup')
                                      ? (openBlock(), createBlock(_component_a_checkbox_group, mergeProps({
                                          key: 5,
                                          value: formModel[schema.field],
                                          "onUpdate:value": $event => ((formModel[schema.field]) = $event),
                                          options: schema.options
                                        }, schema.componentProps), null, 16, ["value", "onUpdate:value", "options"]))
                                      : (schema.component === 'RadioGroup')
                                        ? (openBlock(), createBlock(_component_a_radio_group, mergeProps({
                                            key: 6,
                                            value: formModel[schema.field],
                                            "onUpdate:value": $event => ((formModel[schema.field]) = $event),
                                            options: schema.options
                                          }, schema.componentProps), null, 16, ["value", "onUpdate:value", "options"]))
                                        : (schema.component === 'Switch')
                                          ? (openBlock(), createBlock(_component_a_switch, mergeProps({
                                              key: 7,
                                              checked: formModel[schema.field],
                                              "onUpdate:checked": $event => ((formModel[schema.field]) = $event)
                                            }, schema.componentProps), null, 16, ["checked", "onUpdate:checked"]))
                                          : (schema.component === 'DatePicker')
                                            ? (openBlock(), createBlock(_component_a_date_picker, mergeProps({
                                                key: 8,
                                                value: formModel[schema.field],
                                                "onUpdate:value": $event => ((formModel[schema.field]) = $event),
                                                placeholder: schema.placeholder || `请选择${schema.label}`,
                                                style: {"width":"100%"}
                                              }, schema.componentProps), null, 16, ["value", "onUpdate:value", "placeholder"]))
                                            : (schema.component === 'TimePicker')
                                              ? (openBlock(), createBlock(_component_a_time_picker, mergeProps({
                                                  key: 9,
                                                  value: formModel[schema.field],
                                                  "onUpdate:value": $event => ((formModel[schema.field]) = $event),
                                                  placeholder: schema.placeholder || `请选择${schema.label}`,
                                                  style: {"width":"100%"}
                                                }, schema.componentProps), null, 16, ["value", "onUpdate:value", "placeholder"]))
                                              : (schema.component === 'RangePicker')
                                                ? (openBlock(), createBlock(_component_a_range_picker, mergeProps({
                                                    key: 10,
                                                    value: formModel[schema.field],
                                                    "onUpdate:value": $event => ((formModel[schema.field]) = $event),
                                                    style: {"width":"100%"}
                                                  }, schema.componentProps), null, 16, ["value", "onUpdate:value"]))
                                                : (schema.slot)
                                                  ? renderSlot(_ctx.$slots, schema.slot, {
                                                      key: 11,
                                                      model: formModel,
                                                      field: schema.field,
                                                      schema: schema
                                                    })
                                                  : createCommentVNode("", true)
                        ]),
                        _: 2
                      }, 1032, ["label", "name", "label-col", "wrapper-col"])
                    ]),
                    _: 2
                  }, 1032, ["span"]))
                : createCommentVNode("", true)
            ], 64))
          }), 128)),
          (__props.showActionButtons)
            ? (openBlock(), createBlock(_component_a_col, {
                key: 0,
                span: __props.actionColSpan
              }, {
                default: withCtx(() => [
                  createVNode(_component_a_form_item, {
                    "wrapper-col": { offset: __props.labelCol.span }
                  }, {
                    default: withCtx(() => [
                      renderSlot(_ctx.$slots, "actions", {
                        submit: handleSubmit,
                        reset: handleReset
                      }, () => [
                        createVNode(_component_a_space, null, {
                          default: withCtx(() => [
                            createVNode(_component_a_button, {
                              type: "primary",
                              loading: __props.submitLoading,
                              onClick: handleSubmit
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(__props.submitText), 1)
                              ]),
                              _: 1
                            }, 8, ["loading"]),
                            createVNode(_component_a_button, { onClick: handleReset }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(__props.resetText), 1)
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ])
                    ]),
                    _: 3
                  }, 8, ["wrapper-col"])
                ]),
                _: 3
              }, 8, ["span"]))
            : createCommentVNode("", true)
        ]),
        _: 3
      }, 8, ["gutter"])
    ]),
    _: 3
  }, 16, ["model", "rules", "label-col", "wrapper-col"]))
}
}

};

export { _sfc_main as default };
//# sourceMappingURL=BasicForm.vue.js.map
