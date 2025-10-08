<template>
  <a-dropdown :trigger="trigger" :placement="placement">
    <slot name="default">
      <a-button>
        <slot name="button-content">
          操作
          <DownOutlined />
        </slot>
      </a-button>
    </slot>
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <template v-for="item in items" :key="item.key">
          <a-menu-divider v-if="item.divider" />
          <a-menu-item
            v-else
            :key="item.key"
            :disabled="item.disabled"
            :danger="item.danger"
          >
            <component :is="getIcon(item.icon)" v-if="item.icon" />
            <span>{{ item.label }}</span>
          </a-menu-item>
        </template>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup>
import { DownOutlined } from '@ant-design/icons-vue'
import { getIconComponent } from '../../utils'

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  trigger: {
    type: Array,
    default: () => ['hover']
  },
  placement: {
    type: String,
    default: 'bottomLeft'
  }
})

const emit = defineEmits(['menu-click'])

const getIcon = (iconName) => {
  if (!iconName) return null
  return getIconComponent(iconName)
}

const handleMenuClick = ({ key }) => {
  emit('menu-click', key)
}
</script>
