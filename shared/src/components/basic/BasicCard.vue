<template>
  <a-card
    :title="title"
    :bordered="bordered"
    :hoverable="hoverable"
    :loading="loading"
    :size="size"
    :class="['basic-card', customClass]"
  >
    <template v-if="$slots.extra" #extra>
      <slot name="extra" />
    </template>
    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
    <template v-if="$slots.cover" #cover>
      <slot name="cover" />
    </template>
    <slot />
  </a-card>
</template>

<script setup>
defineProps({
  title: {
    type: String
  },
  bordered: {
    type: Boolean,
    default: true
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'small'].includes(value)
  },
  customClass: {
    type: String
  }
})
</script>

<style scoped lang="scss">
.basic-card {
  :deep(.ant-card-body) {
    padding: 24px;
  }
}
</style>
