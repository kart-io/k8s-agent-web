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

// 导入 Shared 组件的样式
import '@k8s-agent/shared/dist/components/vxe-table/VxeBasicTable.css'

// 使用 Ant Design 插件
VXETable.use(VXETablePluginAntd)

// Wujie 环境检测
const isWujie = window.__POWERED_BY_WUJIE__
const base = isWujie ? '/monitor' : '/'

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
      const routeSync = new RouteSync('monitor-app', window.$wujie.bus, router)
      routeSync.setupListener()
      window.__ROUTE_SYNC__ = routeSync
      console.log('[Monitor App] ✅ RouteSync listener set up')
    }).catch(() => {
      window.$wujie.bus.$on('monitor-app-route-change', (subPath) => {
        if (router.currentRoute.value.path !== subPath) router.push(subPath)
      })
    })
  } else {
    window.$wujie.bus.$on('monitor-app-route-change', (subPath) => {
      console.log('[Monitor App] Received route change from main app:', subPath)
      if (router.currentRoute.value.path !== subPath) {
        router.push(subPath)
      }
    })
  }
}

// 始终挂载到 #monitor-app（Wujie 会加载完整的 HTML）
app.mount('#monitor-app')
