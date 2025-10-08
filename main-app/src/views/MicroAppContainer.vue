<template>
  <div class="micro-app-container">
    <WujieVue
      :name="microAppName"
      :url="microAppUrl"
      :sync="false"
      :alive="true"
      :props="appProps"
      @activated="handleActivated"
      @deactivated="handleDeactivated"
    />
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import WujieVue from 'wujie-vue3'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { bus } = WujieVue

const microAppName = computed(() => {
  console.log('[MicroAppContainer] microAppName:', route.meta.microApp)
  return route.meta.microApp
})

const microAppUrl = computed(() => {
  const urls = {
    'dashboard-app': '//localhost:3001',
    'agent-app': '//localhost:3002',
    'cluster-app': '//localhost:3003',
    'monitor-app': '//localhost:3004',
    'system-app': '//localhost:3005',
    'image-build-app': '//localhost:3006'
  }
  const url = urls[microAppName.value]
  console.log('[MicroAppContainer] Loading micro app:', microAppName.value, 'from URL:', url)
  return url
})

const appProps = computed(() => ({
  userInfo: userStore.userInfo,
  token: userStore.token,
  permissions: userStore.permissions
}))

// 同步路由到子应用的函数
const syncRouteToSubApp = (path) => {
  const appName = microAppName.value
  if (!appName) {
    console.log('[MicroAppContainer] No appName, skipping sync')
    return
  }

  // 提取子应用路由路径
  const basePath = path.split('/')[1] // 例如 'clusters'
  const subPath = path.replace(`/${basePath}`, '') || '/'

  console.log('[MicroAppContainer] Syncing route to sub-app:', appName, 'subPath:', subPath)
  console.log('[MicroAppContainer] bus:', bus)

  // 通过 Wujie 的 bus 通知子应用路由变化
  if (bus) {
    const eventName = `${appName}-route-change`
    console.log('[MicroAppContainer] ✅ Emitting event:', eventName, 'with subPath:', subPath)

    // 延迟发送，确保子应用已经设置好监听器
    setTimeout(() => {
      bus.$emit(eventName, subPath)
      console.log('[MicroAppContainer] Event emitted after delay')
    }, 100)
  } else {
    console.error('[MicroAppContainer] ❌ Wujie bus not available!')
  }
}

// 用于防止路由循环的标志
let lastSyncedPath = ''

// 手动同步路由：主应用路由变化时通知子应用
watch(() => route.path, (newPath) => {
  console.log('[MicroAppContainer] Route changed to:', newPath)

  // 避免重复同步相同的路径
  if (newPath === lastSyncedPath) {
    console.log('[MicroAppContainer] Path already synced, skipping')
    return
  }

  lastSyncedPath = newPath
  syncRouteToSubApp(newPath)
}, { immediate: false }) // 改为 false，不立即执行

// 子应用激活时的处理
const handleActivated = () => {
  console.log('[MicroAppContainer] App activated:', microAppName.value)
  // 激活时同步路由 - 这是最可靠的时机，因为此时子应用已经完全加载
  setTimeout(() => {
    lastSyncedPath = '' // 重置同步标志
    console.log('[MicroAppContainer] Syncing route on activation:', route.path)
    syncRouteToSubApp(route.path)
  }, 150)
}

// 子应用停用时的处理
const handleDeactivated = () => {
  console.log('[MicroAppContainer] App deactivated:', microAppName.value)
}
</script>

<style scoped>
.micro-app-container {
  width: 100%;
  height: 100%;
}
</style>
