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
const base = isWujie ? '/system' : '/'

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
if (isWujie) {
  console.log('[System App] Running in Wujie environment')
  console.log('[System App] window.$wujie:', window.$wujie)
  console.log('[System App] window.$wujie.bus:', window.$wujie?.bus)

  if (window.$wujie?.bus) {
    console.log('[System App] Setting up route listener for: system-app-route-change')
    window.$wujie.bus.$on('system-app-route-change', (subPath) => {
      console.log('[System App] ✅ Received route change from main app:', subPath)
      console.log('[System App] Current route path:', router.currentRoute.value.path)
      if (router.currentRoute.value.path !== subPath) {
        console.log('[System App] Pushing to new route:', subPath)
        router.push(subPath)
      } else {
        console.log('[System App] Already on route:', subPath)
      }
    })

    // 监听子应用路由变化，通知主应用更新页面信息
    router.afterEach((to) => {
      console.log('[System App] Route changed, notifying main app:', to.path, to.name)

      // 构建页面信息
      const pageInfo = {
        path: `/system${to.path}`, // 完整路径，包含 /system 前缀
        subPath: to.path,           // 子应用内部路径
        name: to.name,               // 路由名称
        title: getRouteTitle(to),    // 页面标题
        fullPath: `/system${to.fullPath}`
      }

      console.log('[System App] Emitting sub-app-page-change:', pageInfo)
      window.$wujie.bus.$emit('sub-app-page-change', pageInfo)
    })
  } else {
    console.error('[System App] ❌ window.$wujie.bus not available!')
  }
} else {
  console.log('[System App] Running in standalone mode')
}

// 根据路由获取页面标题
function getRouteTitle(route) {
  // 路由名称到标题的映射
  const titleMap = {
    'UserList': '用户管理',
    'RoleList': '角色管理',
    'PermissionList': '权限管理'
  }

  return route.meta?.title || titleMap[route.name] || route.name || '系统管理'
}

// 始终挂载到 #system-app（Wujie 会加载完整的 HTML）
app.mount('#system-app')
