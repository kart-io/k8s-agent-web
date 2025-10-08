<template>
  <div class="multi-tab-layout">
    <!-- 面包屑导航 -->
    <div v-if="breadcrumb" class="breadcrumb-bar">
      <a-breadcrumb>
        <a-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
          {{ item.label }}
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 多标签页 -->
    <div class="tab-bar">
      <a-tabs
        v-model:activeKey="activeTabKey"
        type="editable-card"
        hide-add
        @edit="onEdit"
        @change="onTabChange"
      >
        <a-tab-pane
          v-for="tab in openTabs"
          :key="tab.key"
          :closable="tab.closable !== false && openTabs.length > 1"
        >
          <template #tab>
            <span>{{ tab.label }}</span>
          </template>
        </a-tab-pane>
      </a-tabs>

      <!-- 标签操作按钮 -->
      <div class="tab-actions">
        <a-dropdown>
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item key="refresh">
                <ReloadOutlined />
                刷新当前
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="close">
                <CloseOutlined />
                关闭当前
              </a-menu-item>
              <a-menu-item key="close-other">
                <ColumnWidthOutlined />
                关闭其他
              </a-menu-item>
              <a-menu-item key="close-all">
                <MinusOutlined />
                关闭全部
              </a-menu-item>
            </a-menu>
          </template>
          <a-button type="text" size="small">
            <DownOutlined />
          </a-button>
        </a-dropdown>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="tab-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ReloadOutlined,
  CloseOutlined,
  ColumnWidthOutlined,
  MinusOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  breadcrumb: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['tab-change', 'tab-close', 'tab-refresh'])

const router = useRouter()
const route = useRoute()

// 已打开的标签页列表
const openTabs = ref([])
const activeTabKey = ref('')

// 面包屑数据
const breadcrumbItems = computed(() => {
  const currentTab = openTabs.value.find(t => t.key === activeTabKey.value)
  if (!currentTab?.breadcrumb) return []
  return currentTab.breadcrumb
})

// 添加标签页
const addTab = (tab) => {
  const existingTab = openTabs.value.find(t => t.key === tab.key)
  if (!existingTab) {
    openTabs.value.push(tab)
  }
  activeTabKey.value = tab.key
}

// 移除标签页
const removeTab = (targetKey) => {
  const targetIndex = openTabs.value.findIndex(t => t.key === targetKey)
  if (targetIndex === -1) return

  const newTabs = openTabs.value.filter(t => t.key !== targetKey)

  // 如果关闭的是当前标签，需要激活另一个标签
  if (activeTabKey.value === targetKey && newTabs.length > 0) {
    // 激活前一个或后一个标签
    const newActiveTab = newTabs[Math.max(0, targetIndex - 1)]
    activeTabKey.value = newActiveTab.key
    if (newActiveTab.path) {
      router.push(newActiveTab.path)
    }
  }

  openTabs.value = newTabs
  emit('tab-close', targetKey)
}

// 监听路由变化，自动添加标签
watch(
  () => route.path,
  (newPath) => {
    if (route.meta?.noTab) return // 某些页面不显示标签

    const tab = {
      key: newPath,
      label: route.meta?.title || '未命名',
      path: newPath,
      closable: route.meta?.affix !== true, // affix 为 true 的标签不可关闭
      breadcrumb: route.meta?.breadcrumb || []
    }

    addTab(tab)
  },
  { immediate: true }
)

const onTabChange = (key) => {
  const tab = openTabs.value.find(t => t.key === key)
  if (tab?.path && tab.path !== route.path) {
    router.push(tab.path)
  }
  emit('tab-change', key, tab)
}

const onEdit = (targetKey, action) => {
  if (action === 'remove') {
    removeTab(targetKey)
  }
}

const handleMenuClick = ({ key }) => {
  switch (key) {
    case 'refresh':
      emit('tab-refresh', activeTabKey.value)
      window.location.reload()
      break
    case 'close':
      if (openTabs.value.length > 1) {
        removeTab(activeTabKey.value)
      }
      break
    case 'close-other':
      const currentTab = openTabs.value.find(t => t.key === activeTabKey.value)
      openTabs.value = openTabs.value.filter(
        t => t.key === activeTabKey.value || t.closable === false
      )
      break
    case 'close-all':
      const affixTabs = openTabs.value.filter(t => t.closable === false)
      if (affixTabs.length > 0) {
        openTabs.value = affixTabs
        activeTabKey.value = affixTabs[0].key
        if (affixTabs[0].path) {
          router.push(affixTabs[0].path)
        }
      }
      break
  }
}

// 暴露方法供外部使用
defineExpose({
  addTab,
  removeTab,
  openTabs,
  activeTabKey
})
</script>

<style scoped>
.multi-tab-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.breadcrumb-bar {
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.tab-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.tab-bar :deep(.ant-tabs) {
  flex: 1;
  margin-bottom: 0;
}

.tab-bar :deep(.ant-tabs-nav) {
  margin-bottom: 0;
  padding: 0 8px;
}

.tab-bar :deep(.ant-tabs-nav::before) {
  border-bottom: none;
}

.tab-bar :deep(.ant-tabs-tab) {
  border: 1px solid transparent;
  background: transparent;
  margin: 4px 2px !important;
  padding: 6px 12px;
  border-radius: 2px;
  transition: all 0.3s;
}

.tab-bar :deep(.ant-tabs-tab:hover) {
  background: #f5f5f5;
}

.tab-bar :deep(.ant-tabs-tab-active) {
  background: #1890ff;
  border-color: #1890ff;
}

.tab-bar :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #fff;
}

.tab-bar :deep(.ant-tabs-tab-active .ant-tabs-tab-remove) {
  color: #fff;
}

.tab-bar :deep(.ant-tabs-tab-active .ant-tabs-tab-remove:hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
}

.tab-bar :deep(.ant-tabs-content-holder) {
  display: none;
}

.tab-actions {
  padding: 0 12px;
  border-left: 1px solid #f0f0f0;
}

.tab-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
</style>
