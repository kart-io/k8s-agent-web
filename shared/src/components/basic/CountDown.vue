<template>
  <div class="count-down">
    <a-statistic-countdown
      :value="deadline"
      :format="format"
      :value-style="valueStyle"
      @finish="handleFinish"
    >
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>
      <template v-if="$slots.suffix" #suffix>
        <slot name="suffix" />
      </template>
    </a-statistic-countdown>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  format: {
    type: String,
    default: 'HH:mm:ss'
  },
  valueStyle: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['finish'])

const deadline = computed(() => {
  return Date.now() + props.value
})

const handleFinish = () => {
  emit('finish')
}
</script>

<style scoped lang="scss">
.count-down {
  display: inline-block;
}
</style>
