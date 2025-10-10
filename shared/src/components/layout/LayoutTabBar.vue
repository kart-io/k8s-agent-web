<template>
  <div class="layout-tab-bar">
    <div class="tab-bar-content">
      <!-- 标签页列表 -->
      <div ref="tabsContainer" class="tabs-container">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { 'tab-active': tab.key === activeKey }]"
          @click="handleTabClick(tab)"
          @contextmenu.prevent="handleContextMenu($event, tab)"
        >
          <component
            :is="getIcon(tab.icon)"
            v-if="tab.icon"
            class="tab-icon"
          />
          <span class="tab-label">{{ tab.label }}</span>
          <CloseOutlined
            v-if="!tab.affix && tabs.length > 1"
            class="tab-close"
            @click.stop="handleClose(tab)"
          />
        </div>
      </div>

      <!-- 刷新按钮 -->
      <a-tooltip title="刷新当前页">
        <a-button
          type="text"
          size="small"
          class="tab-action-btn"
          @click="handleRefresh"
        >
          <ReloadOutlined :class="{ 'rotating': isRefreshing }" />
        </a-button>
      </a-tooltip>

      <!-- 更多操作 -->
      <a-dropdown placement="bottomRight">
        <a-button type="text" size="small" class="tab-action-btn">
          <DownOutlined />
        </a-button>
        <template #overlay>
          <a-menu @click="handleMenuClick">
            <a-menu-item key="refresh">
              <ReloadOutlined />
              刷新当前
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="close-current" :disabled="tabs.length === 1">
              <CloseOutlined />
              关闭当前
            </a-menu-item>
            <a-menu-item key="close-left" :disabled="!canCloseLeft">
              <VerticalRightOutlined />
              关闭左侧
            </a-menu-item>
            <a-menu-item key="close-right" :disabled="!canCloseRight">
              <VerticalLeftOutlined />
              关闭右侧
            </a-menu-item>
            <a-menu-item key="close-other" :disabled="tabs.length === 1">
              <ColumnWidthOutlined />
              关闭其他
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="close-all" :disabled="onlyAffixTabs">
              <MinusOutlined />
              关闭全部
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- 右键菜单 -->
    <a-dropdown
      v-model:open="contextMenuVisible"
      :trigger="[]"
      placement="bottomLeft"
      :overlay-style="{ position: 'fixed', left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
    >
      <div style="position: absolute; width: 0; height: 0;"></div>
      <template #overlay>
        <a-menu @click="handleContextMenuClick">
          <a-menu-item key="refresh">
            <ReloadOutlined />
            刷新
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item key="close" :disabled="contextTab?.affix || tabs.length === 1">
            <CloseOutlined />
            关闭
          </a-menu-item>
          <a-menu-item key="close-left" :disabled="!canCloseLeft">
            <VerticalRightOutlined />
            关闭左侧
          </a-menu-item>
          <a-menu-item key="close-right" :disabled="!canCloseRight">
            <VerticalLeftOutlined />
            关闭右侧
          </a-menu-item>
          <a-menu-item key="close-other" :disabled="tabs.length === 1">
            <ColumnWidthOutlined />
            关闭其他
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CloseOutlined,
  ReloadOutlined,
  DownOutlined,
  VerticalRightOutlined,
  VerticalLeftOutlined,
  ColumnWidthOutlined,
  MinusOutlined
} from '@ant-design/icons-vue'
import { getIconComponent } from '../../utils'

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    default: () => []
  },
  activeKey: {
    type: String,
    required: true
  }
})

const emit = defineEmits([
  'tab-click',
  'tab-close',
  'tab-refresh',
  'close-left',
  'close-right',
  'close-other',
  'close-all'
])

const tabsContainer = ref(null)
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextTab = ref(null)
const isRefreshing = ref(false)

const currentTabIndex = computed(() => {
  return props.tabs.findIndex(t => t.key === props.activeKey)
})

const canCloseLeft = computed(() => {
  const index = contextTab.value
    ? props.tabs.findIndex(t => t.key === contextTab.value.key)
    : currentTabIndex.value
  return index > 0 && props.tabs.slice(0, index).some(t => !t.affix)
})

const canCloseRight = computed(() => {
  const index = contextTab.value
    ? props.tabs.findIndex(t => t.key === contextTab.value.key)
    : currentTabIndex.value
  return index < props.tabs.length - 1 && props.tabs.slice(index + 1).some(t => !t.affix)
})

const onlyAffixTabs = computed(() => {
  return props.tabs.every(t => t.affix)
})

const getIcon = (iconName) => {
  if (!iconName) return null
  return getIconComponent(iconName)
}

const handleTabClick = (tab) => {
  emit('tab-click', tab)
}

const handleClose = (tab) => {
  emit('tab-close', tab)
}

const handleRefresh = () => {
  isRefreshing.value = true
  emit('tab-refresh')
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

const handleMenuClick = ({ key }) => {
  switch (key) {
    case 'refresh':
      handleRefresh()
      break
    case 'close-current':
      const currentTab = props.tabs.find(t => t.key === props.activeKey)
      if (currentTab && !currentTab.affix) {
        emit('tab-close', currentTab)
      }
      break
    case 'close-left':
      emit('close-left')
      break
    case 'close-right':
      emit('close-right')
      break
    case 'close-other':
      emit('close-other')
      break
    case 'close-all':
      emit('close-all')
      break
  }
}

const handleContextMenu = (e, tab) => {
  e.preventDefault()
  contextTab.value = tab
  contextMenuPosition.value = { x: e.clientX, y: e.clientY }
  contextMenuVisible.value = true
}

const handleContextMenuClick = ({ key }) => {
  contextMenuVisible.value = false
  switch (key) {
    case 'refresh':
      emit('tab-click', contextTab.value)
      setTimeout(() => handleRefresh(), 100)
      break
    case 'close':
      if (!contextTab.value.affix) {
        emit('tab-close', contextTab.value)
      }
      break
    case 'close-left':
      emit('tab-click', contextTab.value)
      setTimeout(() => emit('close-left'), 100)
      break
    case 'close-right':
      emit('tab-click', contextTab.value)
      setTimeout(() => emit('close-right'), 100)
      break
    case 'close-other':
      emit('tab-click', contextTab.value)
      setTimeout(() => emit('close-other'), 100)
      break
  }
  contextTab.value = null
}
</script>

<style scoped lang="scss">
.layout-tab-bar {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  z-index: 9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.tab-bar-content {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  gap: 4px;
}

.tabs-container {
  flex: 1;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 4px;

  &::-webkit-scrollbar {
    height: 0;
  }

  scrollbar-width: none;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 12px;
  border-radius: 2px;
  background: #fafafa;
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);

  &:hover {
    background: #f0f7ff;
    color: #1890ff;
    border-color: #d6e4ff;

    .tab-close {
      opacity: 0.7;
    }
  }

  &.tab-active {
    background: #1890ff;
    border-color: #1890ff;
    color: #fff;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);

    .tab-close {
      opacity: 0.8;
      color: rgba(255, 255, 255, 0.85);

      &:hover {
        color: #fff;
        opacity: 1;
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.tab-icon {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.tab-label {
  font-size: 13px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
}

.tab-close {
  font-size: 12px;
  padding: 2px;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #ff4d4f;
    opacity: 1 !important;
  }
}

.tab-action-btn {
  height: 26px;
  width: 26px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 2px;
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.65);
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #1890ff;
  }
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
