import { createApp } from 'vue';
import { initPreferences } from '@vben/preferences';
import { initStores } from '@vben/stores';
import '@vben/styles';
import '@vben/styles/antd';

import App from './App.vue';
import router from './router';
import { overridesPreferences } from './preferences';

async function bootstrap(namespace: string) {
  const app = createApp(App);

  // 配置 pinia store
  await initStores(app, { namespace });

  // 配置路由
  app.use(router);

  app.mount('#app');
}

async function initApplication() {
  const namespace = 'vben-web-auth';

  // app偏好设置初始化
  await initPreferences({
    namespace,
    overrides: overridesPreferences,
  });

  // 启动应用
  await bootstrap(namespace);
}

initApplication();
