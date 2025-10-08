<template>
  <div class="table-toolbar">
    <div class="table-toolbar-left">
      <slot name="toolbar-left" />
    </div>
    <div class="table-toolbar-right">
      <a-space>
        <slot name="toolbar-right" />
        <a-tooltip v-if="showRefresh" title="刷新">
          <a-button type="text" @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip v-if="showColumnSetting" title="列设置">
          <a-button type="text" @click="handleColumnSetting">
            <template #icon><SettingOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip v-if="showFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
          <a-button type="text" @click="handleFullscreen">
            <template #icon>
              <FullscreenExitOutlined v-if="isFullscreen" />
              <FullscreenOutlined v-else />
            </template>
          </a-button>
        </a-tooltip>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  ReloadOutlined,
  SettingOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons-vue'

defineProps({
  showRefresh: {
    type: Boolean,
    default: true
  },
  showColumnSetting: {
    type: Boolean,
    default: true
  },
  showFullscreen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['refresh', 'column-setting', 'fullscreen'])

const isFullscreen = ref(false)

const handleRefresh = () => {
  emit('refresh')
}

const handleColumnSetting = () => {
  emit('column-setting')
}

const handleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  emit('fullscreen', isFullscreen.value)
}

defineExpose({
  isFullscreen
})
</script>

<style scoped lang="scss">
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 16px;

  &-left,
  &-right {
    display: flex;
    align-items: center;
  }
}
</style>
