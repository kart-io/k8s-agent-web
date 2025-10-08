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
  window.$wujie.bus.$on('cluster-app-route-change', (subPath) => {
    console.log('[Cluster App] Received route change from main app:', subPath)
    if (router.currentRoute.value.path !== subPath) {
      router.push(subPath)
    }
  })
}

// 始终挂载到 #cluster-app（Wujie 会加载完整的 HTML）
app.mount('#cluster-app')
