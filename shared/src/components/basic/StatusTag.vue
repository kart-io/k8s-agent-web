<template>
  <a-tag :color="tagColor" :class="['status-tag', customClass]">
    <template v-if="showIcon" #icon>
      <component :is="iconComponent" />
    </template>
    <slot>{{ text }}</slot>
  </a-tag>
</template>

<script setup>
import { computed } from 'vue'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  MinusCircleOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  // 状态值
  status: {
    type: String,
    default: ''
  },
  // 显示文本
  text: {
    type: String,
    default: ''
  },
  // 颜色映射
  colorMap: {
    type: Object,
    default: () => ({
      success: 'success',
      running: 'processing',
      error: 'error',
      warning: 'warning',
      default: 'default',
      pending: 'default',
      failed: 'error',
      stopped: 'default',
      active: 'success',
      inactive: 'default'
    })
  },
  // 图标映射
  iconMap: {
    type: Object,
    default: () => ({
      success: CheckCircleOutlined,
      running: SyncOutlined,
      error: CloseCircleOutlined,
      warning: ExclamationCircleOutlined,
      pending: ClockCircleOutlined,
      failed: CloseCircleOutlined,
      stopped: MinusCircleOutlined,
      active: CheckCircleOutlined,
      inactive: MinusCircleOutlined
    })
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: false
  },
  // 自定义颜色
  color: {
    type: String,
    default: ''
  },
  // 自定义类名
  customClass: {
    type: String,
    default: ''
  }
})

// 标签颜色
const tagColor = computed(() => {
  if (props.color) {
    return props.color
  }
  return props.colorMap[props.status] || props.colorMap.default
})

// 图标组件
const iconComponent = computed(() => {
  return props.iconMap[props.status] || null
})
</script>

<style scoped>
.status-tag {
  font-size: 14px;
}
</style>
