<template>
  <a-result
    :status="status"
    :title="title"
    :sub-title="subTitle"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    <template v-if="$slots.extra" #extra>
      <slot name="extra" />
    </template>
    <template v-if="$slots.default">
      <slot />
    </template>
  </a-result>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info', 'warning', '404', '403', '500'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  subTitle: {
    type: String
  }
})
</script>
