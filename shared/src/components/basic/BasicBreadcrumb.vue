<template>
  <a-breadcrumb :class="['basic-breadcrumb', customClass]" :separator="separator">
    <a-breadcrumb-item v-for="(item, index) in items" :key="index">
      <component :is="getIcon(item.icon)" v-if="item.icon" />
      <a v-if="item.path && index < items.length - 1" @click="handleClick(item)">
        {{ item.label }}
      </a>
      <span v-else>{{ item.label }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { getIconComponent } from '../../utils'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  separator: {
    type: String,
    default: '/'
  },
  customClass: {
    type: String
  }
})

const emit = defineEmits(['item-click'])
const router = useRouter()

const getIcon = (iconName) => {
  if (!iconName) return null
  return getIconComponent(iconName)
}

const handleClick = (item) => {
  emit('item-click', item)
  if (item.path) {
    router.push(item.path)
  }
}
</script>

<style scoped lang="scss">
.basic-breadcrumb {
  :deep(.anticon) {
    margin-right: 4px;
  }

  a {
    color: #1890ff;
    text-decoration: none;
    transition: color 0.3s;

    &:hover {
      color: #40a9ff;
    }
  }
}
</style>
