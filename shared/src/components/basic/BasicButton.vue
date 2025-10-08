<template>
  <a-button
    :type="type"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :danger="danger"
    :ghost="ghost"
    :shape="shape"
    :block="block"
    :icon="iconComponent"
    @click="handleClick"
  >
    <slot />
  </a-button>
</template>

<script setup>
import { computed } from 'vue'
import { getIconComponent } from '../../utils'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'dashed', 'link', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'middle',
    validator: (value) => ['large', 'middle', 'small'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  danger: {
    type: Boolean,
    default: false
  },
  ghost: {
    type: Boolean,
    default: false
  },
  shape: {
    type: String,
    validator: (value) => ['default', 'circle', 'round'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String
  }
})

const emit = defineEmits(['click'])

const iconComponent = computed(() => {
  if (!props.icon) return undefined
  return getIconComponent(props.icon)
})

const handleClick = (e) => {
  if (!props.loading && !props.disabled) {
    emit('click', e)
  }
}
</script>
