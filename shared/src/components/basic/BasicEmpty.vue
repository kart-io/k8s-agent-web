<template>
  <a-empty
    :image="imageUrl"
    :image-style="imageStyle"
    :description="description"
  >
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else-if="showButton">
      <a-button type="primary" @click="handleClick">
        {{ buttonText }}
      </a-button>
    </template>
  </a-empty>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  description: {
    type: String,
    default: '暂无数据'
  },
  image: {
    type: String,
    default: 'default' // 'default' | 'simple' | custom image url
  },
  imageHeight: {
    type: Number,
    default: 60
  },
  showButton: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: '立即创建'
  }
})

const emit = defineEmits(['button-click'])

const imageUrl = computed(() => {
  if (props.image === 'simple') {
    return 'https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'
  }
  if (props.image === 'default') {
    return undefined
  }
  return props.image
})

const imageStyle = computed(() => {
  return {
    height: `${props.imageHeight}px`
  }
})

const handleClick = () => {
  emit('button-click')
}
</script>
