import { ref, watch, computed, resolveComponent, createElementBlock, openBlock, createVNode, createCommentVNode, createElementVNode, normalizeClass, createTextVNode, toDisplayString } from 'vue';
/* empty css                   */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "strength-meter" };
const _hoisted_2 = {
  key: 0,
  class: "strength-bar"
};
const _hoisted_3 = {
  key: 1,
  class: "strength-text"
};


const _sfc_main = {
  __name: 'StrengthMeter',
  props: {
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入密码'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showStrength: {
    type: Boolean,
    default: true
  }
},
  emits: ['update:modelValue', 'change', 'strength-change'],
  setup(__props, { emit }) {

const props = __props;





const passwordValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  passwordValue.value = val;
});

// 计算密码强度
const strength = computed(() => {
  const pwd = passwordValue.value;
  if (!pwd) return 0

  let score = 0;

  // 长度评分
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;

  // 包含数字
  if (/\d/.test(pwd)) score++;

  // 包含小写字母
  if (/[a-z]/.test(pwd)) score++;

  // 包含大写字母
  if (/[A-Z]/.test(pwd)) score++;

  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;

  // 映射到1-4级
  if (score <= 2) return 1
  if (score <= 4) return 2
  if (score <= 5) return 3
  return 4
});

const strengthText = computed(() => {
  const texts = ['', '弱', '中', '强', '非常强'];
  return texts[strength.value] || ''
});

const handleInput = () => {
  emit('update:modelValue', passwordValue.value);
  emit('change', passwordValue.value);
  emit('strength-change', strength.value);
};

return (_ctx, _cache) => {
  const _component_a_input_password = resolveComponent("a-input-password");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createVNode(_component_a_input_password, {
      value: passwordValue.value,
      "onUpdate:value": _cache[0] || (_cache[0] = $event => ((passwordValue).value = $event)),
      placeholder: __props.placeholder,
      disabled: __props.disabled,
      onInput: handleInput
    }, null, 8, ["value", "placeholder", "disabled"]),
    (__props.showStrength)
      ? (openBlock(), createElementBlock("div", _hoisted_2, [
          createElementVNode("div", {
            class: normalizeClass(["strength-bar-item", [`strength-${strength.value}`, { active: strength.value >= 1 }]])
          }, null, 2),
          createElementVNode("div", {
            class: normalizeClass(["strength-bar-item", [`strength-${strength.value}`, { active: strength.value >= 2 }]])
          }, null, 2),
          createElementVNode("div", {
            class: normalizeClass(["strength-bar-item", [`strength-${strength.value}`, { active: strength.value >= 3 }]])
          }, null, 2),
          createElementVNode("div", {
            class: normalizeClass(["strength-bar-item", [`strength-${strength.value}`, { active: strength.value >= 4 }]])
          }, null, 2)
        ]))
      : createCommentVNode("", true),
    (__props.showStrength)
      ? (openBlock(), createElementBlock("div", _hoisted_3, [
          createTextVNode(" 强度："),
          createElementVNode("span", {
            class: normalizeClass(`strength-text-${strength.value}`)
          }, toDisplayString(strengthText.value), 3)
        ]))
      : createCommentVNode("", true)
  ]))
}
}

};
const StrengthMeter = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-ab25a7d2"]]);

export { StrengthMeter as default };
//# sourceMappingURL=StrengthMeter.vue.js.map
