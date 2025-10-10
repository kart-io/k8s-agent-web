import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import routes from './router'
import '@/assets/styles/main.scss'

// 导入 VXE Table
import VXETable from 'vxe-table'
import VXETablePluginAntd from 'vxe-table-plugin-antd'
import 'vxe-table/lib/style.css'
import 'vxe-table-plugin-antd/dist/style.css'

// 使用 Ant Design 插件
VXETable.use(VXETablePluginAntd)

// Wujie 环境检测
const isWujie = window.__POWERED_BY_WUJIE__
const base = isWujie ? '/clusters' : '/'

const router = createRouter({
  history: createWebHistory(base),
  routes
})

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(Antd)
app.use(VXETable)

// 在 Wujie 环境中监听主应用的路由变化
if (isWujie && window.$wujie) {
  const useStandardRouteSync = import.meta.env.VITE_FEATURE_STANDARD_ROUTE_SYNC === 'true'

  if (useStandardRouteSync) {
    import('@k8s-agent/shared/core/route-sync.js').then(({ RouteSync }) => {
      const routeSync = new RouteSync('cluster-app', window.$wujie.bus, router)
      routeSync.setupListener()
      window.__ROUTE_SYNC__ = routeSync
      console.log('[Cluster App] ✅ RouteSync listener set up')
    }).catch(() => {
      setupLegacyRouteSync()
    })
  } else {
    setupLegacyRouteSync()
  }

  // 监听子应用路由变化，通知主应用更新页面信息
  router.afterEach((to) => {
    console.log('[Cluster App] Route changed, notifying main app:', to.path, to.name)

    const pageInfo = {
      path: `/clusters${to.path}`,
      subPath: to.path,
      name: to.name,
      title: getRouteTitle(to),
      fullPath: `/clusters${to.fullPath}`
    }

    console.log('[Cluster App] Emitting sub-app-page-change:', pageInfo)
    window.$wujie.bus.$emit('sub-app-page-change', pageInfo)
  })
} else {
  console.log('[Cluster App] Running in standalone mode')
}

function setupLegacyRouteSync() {
  let isReceivingFromMain = false
  let isInitialLoad = true

  window.$wujie.bus.$on('cluster-app-route-change', (subPath) => {
    console.log('[Cluster App] Received route change from main app:', subPath)

    if (isInitialLoad) {
      isInitialLoad = false
    }

    if (router.currentRoute.value.path !== subPath) {
      isReceivingFromMain = true
      router.push(subPath).then(() => {
        setTimeout(() => {
          isReceivingFromMain = false
        }, 100)
      })
    }
  })
}

// 根据路由获取页面标题
function getRouteTitle(route) {
  // 路由名称到标题的映射
  const titleMap = {
    'ClusterList': '集群列表',
    'ClusterDetail': '集群详情',
    'NodeList': '节点列表',
    'PodList': 'Pod 列表',
    'ServiceList': 'Service 列表'
  }
  return titleMap[route.name] || '集群管理'
}

// 始终挂载到 #cluster-app（Wujie 会加载完整的 HTML）
app.mount('#cluster-app')
