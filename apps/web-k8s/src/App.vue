<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ConfigProvider, Layout, LayoutContent, LayoutHeader, LayoutSider, Menu, Button, Dropdown, message } from 'ant-design-vue';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { clearAuth, getUserInfo } from './utils/auth';

const route = useRoute();
const router = useRouter();

// 获取用户信息
const userInfo = computed(() => getUserInfo());

// 菜单项
const menuItems = computed(() => {
  return router.options.routes
    .filter((r) => !r.meta?.hideInMenu && r.path !== '/')
    .map((r) => ({
      key: r.path,
      label: r.meta?.title || r.name,
      icon: r.meta?.icon,
      children: r.children
        ?.filter((c) => !c.meta?.hideInMenu)
        .map((c) => ({
          key: r.path + '/' + c.path,
          label: c.meta?.title || c.name,
          icon: c.meta?.icon,
        })),
    }));
});

// 当前选中的菜单
const selectedKeys = computed(() => [route.path]);
const openKeys = computed(() => {
  const path = route.path;
  const parts = path.split('/').filter(Boolean);
  return parts.length > 1 ? ['/' + parts[0]] : [];
});

// 菜单点击
function handleMenuClick({ key }: { key: string }) {
  router.push(key);
}

// 返回主应用
function goToMainApp() {
  const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:5666';
  window.location.href = mainAppUrl;
}

// 登出
function handleLogout() {
  clearAuth();
  message.success('已登出');
  // 重定向到主应用登录页
  const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:5666';
  window.location.href = `${mainAppUrl}/auth/login`;
}

// 用户菜单项
const userMenuItems = [
  {
    key: 'logout',
    label: '退出登录',
    icon: LogoutOutlined,
  },
];

function handleUserMenuClick({ key }: { key: string }) {
  if (key === 'logout') {
    handleLogout();
  }
}

onMounted(() => {
  console.log('K8s Management Platform Loaded');
});
</script>

<template>
  <ConfigProvider :locale="zhCN">
    <Layout style="min-height: 100vh">
      <!-- 顶部导航 -->
      <LayoutHeader style="background: #001529; padding: 0 20px; display: flex; align-items: center; justify-content: space-between">
        <div style="color: white; font-size: 20px; font-weight: bold">
          🚀 K8s Management Platform
        </div>
        <div style="display: flex; align-items: center; gap: 16px">
          <Button type="link" style="color: white" @click="goToMainApp">
            返回主应用
          </Button>
          <Dropdown :menu="{ items: userMenuItems, onClick: handleUserMenuClick }" placement="bottomRight">
            <Button type="link" style="color: white; display: flex; align-items: center">
              <UserOutlined />
              <span style="margin-left: 8px">{{ userInfo?.realName || userInfo?.username || '用户' }}</span>
            </Button>
          </Dropdown>
        </div>
      </LayoutHeader>

      <Layout>
        <!-- 侧边栏菜单 -->
        <LayoutSider
          width="200"
          style="background: #fff"
          :collapsed="false"
        >
          <Menu
            :items="menuItems"
            :selected-keys="selectedKeys"
            :open-keys="openKeys"
            mode="inline"
            style="height: 100%; border-right: 0"
            @click="handleMenuClick"
          />
        </LayoutSider>

        <!-- 主内容区 -->
        <Layout style="padding: 0">
          <LayoutContent style="background: #f0f2f5; min-height: 280px">
            <router-view v-slot="{ Component }">
              <component :is="Component" />
            </router-view>
          </LayoutContent>
        </Layout>
      </Layout>
    </Layout>
  </ConfigProvider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
