<template>
  <a-layout class="vben-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="siderCollapsed"
      :width="siderWidth"
      :collapsed-width="collapsedWidth"
      :trigger="null"
      collapsible
      class="layout-sider"
      :class="{ 'sider-dark': theme === 'dark', 'sider-light': theme === 'light' }"
    >
      <!-- Logo -->
      <div class="sider-logo">
        <slot name="logo">
          <div class="logo-content">
            <img v-if="logo" :src="logo" alt="logo" class="logo-img">
            <span v-if="!siderCollapsed" class="logo-text">{{ title }}</span>
          </div>
        </slot>
      </div>

      <!-- 菜单 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        :theme="theme"
        class="sider-menu"
        @click="handleMenuClick"
      >
        <template v-for="item in menuData" :key="item.key">
          <a-menu-item v-if="!item.children" :key="item.key">
            <template #icon>
              <component :is="getIcon(item.icon)" v-if="item.icon" />
            </template>
            <span>{{ item.label }}</span>
          </a-menu-item>

          <a-sub-menu v-else :key="item.key">
            <template #icon>
              <component :is="getIcon(item.icon)" v-if="item.icon" />
            </template>
            <template #title>{{ item.label }}</template>
            <a-menu-item v-for="child in item.children" :key="child.key">
              <template #icon>
                <component :is="getIcon(child.icon)" v-if="child.icon" />
              </template>
              <span>{{ child.label }}</span>
            </a-menu-item>
          </a-sub-menu>
        </template>
      </a-menu>
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout class="layout-main">
      <!-- Header -->
      <LayoutHeader
        v-model:collapsed="siderCollapsed"
        :show-logo="false"
        :logo-text="title"
        :user-name="userName"
        :user-avatar="userAvatar"
        :breadcrumb-list="breadcrumbList"
        :notification-count="notificationCount"
        @user-menu-click="handleUserMenuClick"
        @breadcrumb-click="handleBreadcrumbClick"
      >
        <template #actions>
          <slot name="header-actions" />
        </template>
      </LayoutHeader>

      <!-- 多标签页 -->
      <LayoutTabBar
        v-if="showTabs"
        :tabs="tabs"
        :active-key="activeTabKey"
        @tab-click="handleTabClick"
        @tab-close="handleTabClose"
        @tab-refresh="handleTabRefresh"
        @close-left="handleCloseLeft"
        @close-right="handleCloseRight"
        @close-other="handleCloseOther"
        @close-all="handleCloseAll"
      />

      <!-- 内容区 -->
      <a-layout-content class="layout-content">
        <slot />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LayoutHeader from './LayoutHeader.vue'
import LayoutTabBar from './LayoutTabBar.vue'
import { getIconComponent } from '../../utils'

const props = defineProps({
  // 菜单数据
  menuData: {
    type: Array,
    default: () => []
  },
  // Logo
  logo: {
    type: String,
    default: ''
  },
  // 标题
  title: {
    type: String,
    default: 'Vben Admin'
  },
  // 主题
  theme: {
    type: String,
    default: 'dark',
    validator: (value) => ['dark', 'light'].includes(value)
  },
  // 侧边栏宽度
  siderWidth: {
    type: Number,
    default: 210
  },
  // 折叠宽度
  collapsedWidth: {
    type: Number,
    default: 48
  },
  // 是否显示标签页
  showTabs: {
    type: Boolean,
    default: true
  },
  // 用户名
  userName: {
    type: String,
    default: 'Admin'
  },
  // 用户头像
  userAvatar: {
    type: String,
    default: ''
  },
  // 通知数量
  notificationCount: {
    type: Number,
    default: 0
  },
  // Wujie 事件总线（可选）
  wujieBus: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'menu-click',
  'user-menu-click',
  'breadcrumb-click',
  'tab-refresh'
])

const router = useRouter()
const route = useRoute()

console.log('[VbenLayout] Component mounted')
console.log('[VbenLayout] Initial route:', route.path, route.name)
console.log('[VbenLayout] Menu data:', props.menuData)

// 存储子应用的页面信息，用于创建独立的 tab
const subAppPageInfo = ref({})

const siderCollapsed = ref(false)
const selectedKeys = ref([])
const openKeys = ref([])
const tabs = ref([])
const activeTabKey = ref('')

// 在组件挂载时设置 Wujie 事件监听
onMounted(() => {
  if (props.wujieBus) {
    console.log('[VbenLayout] Wujie bus provided, subscribing to events')
    props.wujieBus.$on('sub-app-page-change', handleSubAppPageChange)
    console.log('[VbenLayout] Subscribed to sub-app-page-change event')
  } else {
    console.log('[VbenLayout] No Wujie bus provided')
  }
})

// 用于防止路由循环的标志
let isUpdatingFromSubApp = false

// 处理子应用页面变化
const handleSubAppPageChange = (pageInfo) => {
  console.log('[VbenLayout] Received sub-app page change:', pageInfo)

  // 存储子应用页面信息
  subAppPageInfo.value[pageInfo.path] = pageInfo

  // 同步更新主应用的 URL（如果与当前路由不同）
  if (route.path !== pageInfo.path) {
    console.log('[VbenLayout] Updating main app URL from:', route.path, 'to:', pageInfo.path)
    isUpdatingFromSubApp = true
    router.replace(pageInfo.path).then(() => {
      // 延迟重置标志，确保路由变化已完成
      setTimeout(() => {
        isUpdatingFromSubApp = false
      }, 100)
    })
  }

  // 如果需要显示 tabs，查找并更新已有的 tab
  if (props.showTabs) {
    console.log('[VbenLayout] Looking for existing tab to update')

    // 查找是否已经有这个页面的 tab（可能使用了 route.name 作为 key）
    const existingTabByRouteName = tabs.value.find(t => t.key === route.name)
    const existingTabByPath = tabs.value.find(t => t.key === pageInfo.path)

    if (existingTabByRouteName && !existingTabByPath) {
      // 如果找到了用 route.name 作为 key 的 tab，更新它
      console.log('[VbenLayout] Updating existing tab (by route name):', existingTabByRouteName.key, '→', pageInfo.path)
      existingTabByRouteName.key = pageInfo.path
      existingTabByRouteName.label = pageInfo.title
      existingTabByRouteName.path = pageInfo.path
      activeTabKey.value = pageInfo.path
    } else if (!existingTabByPath) {
      // 如果没有找到任何 tab，创建新的
      console.log('[VbenLayout] Creating new tab for:', pageInfo.title)
      addTab({
        key: pageInfo.path,
        label: pageInfo.title,
        path: pageInfo.path,
        closable: true
      })
    } else {
      // 已经有正确的 tab，只需要激活它
      console.log('[VbenLayout] Tab already exists, activating:', pageInfo.path)
      activeTabKey.value = pageInfo.path
    }
  }
}

// 面包屑数据
const breadcrumbList = computed(() => {
  // 如果路由元信息有面包屑，直接使用
  if (route.meta?.breadcrumb && route.meta.breadcrumb.length > 0) {
    return route.meta.breadcrumb
  }

  // 否则根据路径和菜单数据生成面包屑
  const breadcrumbs = []
  const path = route.path

  // 查找匹配的菜单项
  for (const menu of props.menuData) {
    if (path === menu.key || path.startsWith(menu.key + '/')) {
      // 添加顶层菜单
      breadcrumbs.push({
        label: menu.label,
        path: menu.key,
        icon: menu.icon
      })

      // 如果有子菜单，查找匹配的子菜单
      if (menu.children) {
        const child = menu.children.find(
          c => path === c.key || path.startsWith(c.key + '/')
        )
        if (child) {
          breadcrumbs.push({
            label: child.label,
            path: child.key,
            icon: child.icon
          })
        }
      }
      break
    }
  }

  return breadcrumbs
})

// 更新选中的菜单
const updateSelectedMenu = (path) => {
  console.log('[VbenLayout] updateSelectedMenu called with path:', path)
  console.log('[VbenLayout] menuData:', JSON.stringify(props.menuData, null, 2))

  // 查找匹配的菜单
  let matchedMenu = null
  let parentKey = null

  for (const menu of props.menuData) {
    // 检查顶层菜单
    if (path === menu.key || path.startsWith(menu.key + '/')) {
      // 如果有子菜单，继续在子菜单中查找更精确的匹配
      if (menu.children) {
        const child = menu.children.find(
          c => path === c.key || path.startsWith(c.key + '/')
        )
        if (child) {
          matchedMenu = child
          parentKey = menu.key
          console.log('[VbenLayout] Matched child menu:', child.key, 'parent:', parentKey)
          break
        }
      }
      // 如果没有子菜单或子菜单中没有匹配，则匹配顶层菜单
      if (!matchedMenu) {
        matchedMenu = menu
        console.log('[VbenLayout] Matched top-level menu:', menu.key)
        break
      }
    }
  }

  if (matchedMenu) {
    selectedKeys.value = [matchedMenu.key]
    if (parentKey) {
      openKeys.value = [parentKey]
    }
    console.log('[VbenLayout] Updated selectedKeys:', selectedKeys.value, 'openKeys:', openKeys.value)
  } else {
    console.log('[VbenLayout] No menu matched for path:', path)
  }
}

// 添加标签页
const addTab = (tab) => {
  const existingTab = tabs.value.find(t => t.key === tab.key)
  if (!existingTab) {
    tabs.value.push(tab)
  } else {
    // 更新已存在标签的所有属性
    existingTab.path = tab.path
    existingTab.label = tab.label
    existingTab.icon = tab.icon
  }
  activeTabKey.value = tab.key
}

// 移除标签页
const removeTab = (tab) => {
  const index = tabs.value.findIndex(t => t.key === tab.key)
  if (index === -1) return

  const newTabs = tabs.value.filter(t => t.key !== tab.key)

  if (activeTabKey.value === tab.key && newTabs.length > 0) {
    const newActiveTab = newTabs[Math.max(0, index - 1)]
    activeTabKey.value = newActiveTab.key
    router.push(newActiveTab.path)
  }

  tabs.value = newTabs
}

// 根据路径从菜单中查找标题
const getTabLabelFromMenu = (path) => {
  for (const menu of props.menuData) {
    if (path === menu.key || path.startsWith(menu.key + '/')) {
      // 如果有子菜单，查找更精确的匹配
      if (menu.children) {
        const child = menu.children.find(
          c => path === c.key || path.startsWith(c.key + '/')
        )
        if (child) {
          return child.label
        }
      }
      // 没有子菜单或子菜单中没有匹配，返回顶层菜单标题
      return menu.label
    }
  }
  return null
}

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    console.log('[VbenLayout] Route changed to:', newPath)
    console.log('[VbenLayout] Route name:', route.name)
    console.log('[VbenLayout] Route meta:', route.meta)

    // 更新选中的菜单
    updateSelectedMenu(newPath)

    // 添加标签页
    if (!route.meta?.noTab && props.showTabs) {
      // 检查是否有子应用的页面信息
      const subPageInfo = subAppPageInfo.value[newPath]

      if (subPageInfo) {
        // 使用子应用提供的页面信息创建 tab
        console.log('[VbenLayout] Creating tab from sub-app info:', subPageInfo.title)
        addTab({
          key: subPageInfo.path,
          label: subPageInfo.title,
          path: subPageInfo.path,
          closable: true
        })
      } else {
        // 使用默认逻辑创建 tab
        const tabKey = route.name || newPath
        const tabLabel = route.meta?.title || getTabLabelFromMenu(newPath) || '未命名'

        console.log('[VbenLayout] Creating tab with key:', tabKey, 'label:', tabLabel)
        addTab({
          key: tabKey,
          label: tabLabel,
          path: newPath,
          icon: route.meta?.icon,
          affix: route.meta?.affix === true,
          closable: route.meta?.affix !== true
        })
      }
    } else {
      console.log('[VbenLayout] Tab not created - noTab:', route.meta?.noTab, 'showTabs:', props.showTabs)
    }
  },
  { immediate: true }
)

const getIcon = (iconName) => {
  if (!iconName) return null
  return getIconComponent(iconName)
}

const handleMenuClick = ({ key }) => {
  router.push(key)
  emit('menu-click', key)
}

const handleUserMenuClick = (key) => {
  emit('user-menu-click', key)
}

const handleBreadcrumbClick = (item) => {
  emit('breadcrumb-click', item)
}

const handleTabClick = (tab) => {
  if (tab.path) {
    router.push(tab.path)
  }
}

const handleTabClose = (tab) => {
  removeTab(tab)
}

const handleTabRefresh = () => {
  emit('tab-refresh')
}

const handleCloseLeft = () => {
  const currentIndex = tabs.value.findIndex(t => t.key === activeTabKey.value)
  tabs.value = tabs.value.filter((t, i) => i >= currentIndex || t.affix)
}

const handleCloseRight = () => {
  const currentIndex = tabs.value.findIndex(t => t.key === activeTabKey.value)
  tabs.value = tabs.value.filter((t, i) => i <= currentIndex || t.affix)
}

const handleCloseOther = () => {
  tabs.value = tabs.value.filter(t => t.key === activeTabKey.value || t.affix)
}

const handleCloseAll = () => {
  tabs.value = tabs.value.filter(t => t.affix)
  if (tabs.value.length > 0) {
    const firstTab = tabs.value[0]
    activeTabKey.value = firstTab.key
    router.push(firstTab.path)
  }
}

// 暴露方法
defineExpose({
  addTab,
  removeTab,
  tabs,
  activeTabKey
})
</script>

<style scoped lang="scss">
.vben-layout {
  height: 100vh;
  overflow: hidden;
  background: #f0f2f5;
}

.layout-sider {
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 10;
  transition: all 0.2s;

  &.sider-dark {
    background: #001529;
  }

  &.sider-light {
    background: #fff;
    border-right: 1px solid #f0f0f0;
  }
}

.sider-logo {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transition: all 0.2s;
}

.logo-content {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.logo-img {
  height: 32px;
  width: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.5px;
}

.sider-light .logo-text {
  color: #1890ff;
}

.sider-menu {
  border-right: none;
  height: calc(100vh - 48px);
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }

  // 菜单选中样式 - Vben风格
  :deep(.ant-menu-dark.ant-menu-inline .ant-menu-item-selected) {
    background: linear-gradient(90deg, rgba(24, 144, 255, 0.9) 0%, rgba(24, 144, 255, 0.7) 100%) !important;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 3px;
      background: #1890ff;
    }
  }

  :deep(.ant-menu-item-selected) {
    background: linear-gradient(90deg, rgba(24, 144, 255, 0.9) 0%, rgba(24, 144, 255, 0.7) 100%) !important;
    color: #fff !important;
    font-weight: 500;

    &::after {
      opacity: 0 !important;
      border-right: none !important;
    }

    .anticon {
      color: #fff !important;
    }
  }

  :deep(.ant-menu-dark .ant-menu-item-selected) {
    background: linear-gradient(90deg, rgba(24, 144, 255, 0.9) 0%, rgba(24, 144, 255, 0.7) 100%) !important;
  }

  :deep(.ant-menu-item) {
    margin: 4px 8px !important;
    padding-left: 16px !important;
    height: 40px !important;
    line-height: 40px !important;
    border-radius: 6px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex !important;
    align-items: center !important;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
      color: rgba(255, 255, 255, 0.95) !important;
      transform: translateX(2px);
    }

    .anticon {
      font-size: 18px !important;
      margin-right: 12px !important;
      transition: all 0.3s;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 20px !important;
      height: 20px !important;
      color: rgba(255, 255, 255, 0.75) !important;
    }

    &:hover .anticon {
      color: #fff !important;
      transform: scale(1.1);
    }
  }

  :deep(.ant-menu-submenu-title) {
    margin: 4px 8px !important;
    padding-left: 16px !important;
    height: 40px !important;
    line-height: 40px !important;
    border-radius: 6px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex !important;
    align-items: center !important;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
      color: rgba(255, 255, 255, 0.95) !important;
      transform: translateX(2px);
    }

    .anticon {
      font-size: 18px !important;
      margin-right: 12px !important;
      transition: all 0.3s;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 20px !important;
      height: 20px !important;
      color: rgba(255, 255, 255, 0.75) !important;
    }

    &:hover .anticon {
      color: #fff !important;
      transform: scale(1.1);
    }
  }

  // 展开的子菜单标题图标颜色
  :deep(.ant-menu-submenu-open > .ant-menu-submenu-title .anticon) {
    color: #1890ff !important;
  }

  // 子菜单项选中样式
  :deep(.ant-menu-sub .ant-menu-item-selected) {
    background: linear-gradient(90deg, rgba(24, 144, 255, 0.9) 0%, rgba(24, 144, 255, 0.7) 100%) !important;
  }

  // 子菜单背景
  :deep(.ant-menu-sub) {
    background: rgba(0, 0, 0, 0.2) !important;
  }

  // 子菜单项样式
  :deep(.ant-menu-sub .ant-menu-item) {
    margin: 4px 8px !important;
    padding-left: 40px !important;
  }
}

.layout-main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f0f2f5;
}

.layout-content {
  flex: 1;
  overflow: auto;
  background: #f0f2f5;
  padding: 12px;
  min-height: 0;
}
</style>
