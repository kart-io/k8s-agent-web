import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Ant Design Vue 样式
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

// 使用 Pinia
app.use(createPinia());

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app');

console.log('K8s Management Platform Started');
console.log('Environment:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_GLOB_API_URL);
