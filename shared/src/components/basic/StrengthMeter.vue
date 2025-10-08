<template>
  <div class="strength-meter">
    <a-input-password
      v-model:value="passwordValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
    />
    <div v-if="showStrength" class="strength-bar">
      <div
        class="strength-bar-item"
        :class="[`strength-${strength}`, { active: strength >= 1 }]"
      />
      <div
        class="strength-bar-item"
        :class="[`strength-${strength}`, { active: strength >= 2 }]"
      />
      <div
        class="strength-bar-item"
        :class="[`strength-${strength}`, { active: strength >= 3 }]"
      />
      <div
        class="strength-bar-item"
        :class="[`strength-${strength}`, { active: strength >= 4 }]"
      />
    </div>
    <div v-if="showStrength" class="strength-text">
      强度：<span :class="`strength-text-${strength}`">{{ strengthText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
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
})

const emit = defineEmits(['update:modelValue', 'change', 'strength-change'])

const passwordValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  passwordValue.value = val
})

// 计算密码强度
const strength = computed(() => {
  const pwd = passwordValue.value
  if (!pwd) return 0

  let score = 0

  // 长度评分
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++

  // 包含数字
  if (/\d/.test(pwd)) score++

  // 包含小写字母
  if (/[a-z]/.test(pwd)) score++

  // 包含大写字母
  if (/[A-Z]/.test(pwd)) score++

  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(pwd)) score++

  // 映射到1-4级
  if (score <= 2) return 1
  if (score <= 4) return 2
  if (score <= 5) return 3
  return 4
})

const strengthText = computed(() => {
  const texts = ['', '弱', '中', '强', '非常强']
  return texts[strength.value] || ''
})

const handleInput = () => {
  emit('update:modelValue', passwordValue.value)
  emit('change', passwordValue.value)
  emit('strength-change', strength.value)
}
</script>

<style scoped lang="scss">
.strength-meter {
  width: 100%;
}

.strength-bar {
  display: flex;
  gap: 8px;
  margin-top: 8px;

  &-item {
    flex: 1;
    height: 4px;
    background-color: #e8e8e8;
    border-radius: 2px;
    transition: all 0.3s;

    &.active {
      &.strength-1 {
        background-color: #ff4d4f;
      }

      &.strength-2 {
        background-color: #faad14;
      }

      &.strength-3 {
        background-color: #52c41a;
      }

      &.strength-4 {
        background-color: #1890ff;
      }
    }
  }
}

.strength-text {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);

  span {
    font-weight: 500;

    &.strength-text-1 {
      color: #ff4d4f;
    }

    &.strength-text-2 {
      color: #faad14;
    }

    &.strength-text-3 {
      color: #52c41a;
    }

    &.strength-text-4 {
      color: #1890ff;
    }
  }
}
</style>
