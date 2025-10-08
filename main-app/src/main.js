import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import App from './App.vue'
import router from './router'
import permissionDirective from './directives/permission'
import { setupWujie } from './micro/wujie-config'

import './assets/styles/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)
app.use(permissionDirective)
setupWujie(app)  // 注册 Wujie

app.mount('#app')
