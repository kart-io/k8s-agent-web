import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import routes from './router'

// 导入 VXE Table
import VXETable from 'vxe-table'
import VXETablePluginAntd from 'vxe-table-plugin-antd'
import 'vxe-table/lib/style.css'
import 'vxe-table-plugin-antd/dist/style.css'
import { createVxeTableConfig } from '@k8s-agent/shared/config/vxeTable'

// 使用 Ant Design 插件
VXETable.use(VXETablePluginAntd)

// 配置 VXE Table
const vxeTableConfig = createVxeTableConfig({
  size: 'medium',
  zIndex: 999,
  table: {
    border: true,
    stripe: false,
    rowConfig: {
      isHover: true
    }
  }
})
VXETable.setConfig(vxeTableConfig)

// Wujie 环境检测
const isWujie = window.__POWERED_BY_WUJIE__
const base = isWujie ? '/image-build' : '/'

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
      const routeSync = new RouteSync('image-build-app', window.$wujie.bus, router)
      routeSync.setupListener()
      window.__ROUTE_SYNC__ = routeSync
      console.log('[Image Build App] ✅ RouteSync listener set up')
    }).catch(() => {
      window.$wujie.bus.$on('image-build-app-route-change', (subPath) => {
        if (router.currentRoute.value.path !== subPath) router.push(subPath)
      })
    })
  } else {
    window.$wujie.bus.$on('image-build-app-route-change', (subPath) => {
      console.log('[Image Build App] Received route change from main app:', subPath)
      if (router.currentRoute.value.path !== subPath) {
        router.push(subPath)
      }
    })
  }
}

app.mount('#app')
