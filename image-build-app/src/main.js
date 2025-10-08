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

app.mount('#app')
