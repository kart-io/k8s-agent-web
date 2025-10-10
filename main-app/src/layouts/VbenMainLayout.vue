<template>
  <VbenLayout
    :menu-data="menuList"
    :title="title"
    :logo="logo"
    :user-name="userStore.username"
    :user-avatar="userStore.avatar"
    :notification-count="5"
    :show-tabs="true"
    :wujie-bus="wujieBus"
    theme="dark"
    @user-menu-click="handleUserMenuClick"
    @tab-refresh="handleTabRefresh"
  >
    <!-- 微前端容器 -->
    <router-view v-slot="{ Component, route }">
      <!-- 使用 microApp 作为 key,相同微应用使用相同 key,避免不必要的组件销毁 -->
      <component
        :is="Component"
        v-if="Component"
        :key="route.meta.microApp || route.name"
      />
      <div v-else class="no-component-warning" style="padding: 20px; color: red;">
        No component matched for route: {{ route.fullPath }}
        <br>Route name: {{ route.name }}
        <br>Route meta: {{ JSON.stringify(route.meta) }}
      </div>
    </router-view>
  </VbenLayout>
</template>

<script setup>
import { useUserStore } from '@/store/user'
import { VbenLayout } from '@k8s-agent/shared/components'
// 显式导入 VbenLayout 的样式文件
import '@k8s-agent/shared/dist/components/layout/VbenLayout.css'
import '@k8s-agent/shared/dist/components/layout/LayoutHeader.css'
import '@k8s-agent/shared/dist/components/layout/LayoutTabBar.css'
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import WujieVue from 'wujie-vue3'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { bus: wujieBus } = WujieVue

// 监听路由变化，输出当前匹配的组件
watch(() => route.matched, (matched) => {
  console.log('[VbenMainLayout] Route matched count:', matched.length)
  matched.forEach((r, index) => {
    console.log(`[VbenMainLayout]   [${index}] name: ${r.name}, path: ${r.path}, hasComponent: ${!!r.components?.default}`)
  })
}, { immediate: true, deep: true })

const title = 'K8s Agent 管理平台'
const logo = '' // 可以设置 Logo 图片 URL

// 默认菜单
const defaultMenus = [
  {
    key: '/dashboard',
    label: '仪表盘',
    icon: 'DashboardOutlined'
  },
  {
    key: '/agents',
    label: 'Agent 管理',
    icon: 'ClusterOutlined'
  },
  {
    key: '/clusters',
    label: '集群管理',
    icon: 'DeploymentUnitOutlined',
    children: [
      {
        key: '/clusters/list',
        label: '集群列表',
        icon: 'UnorderedListOutlined'
      }
    ]
  },
  {
    key: '/monitor',
    label: '监控管理',
    icon: 'MonitorOutlined'
  },
  {
    key: '/image-build',
    label: '镜像构建',
    icon: 'BuildOutlined'
  },
  {
    key: '/system',
    label: '系统管理',
    icon: 'SettingOutlined',
    children: [
      {
        key: '/system/users',
        label: '用户管理',
        icon: 'UserOutlined'
      },
      {
        key: '/system/roles',
        label: '角色管理',
        icon: 'TeamOutlined'
      },
      {
        key: '/system/permissions',
        label: '权限管理',
        icon: 'SafetyOutlined'
      }
    ]
  }
]

// 从 store 获取菜单列表
const menuList = computed(() => {
  const menus = userStore.menuList
  if (menus === null || menus === undefined) {
    return defaultMenus
  }
  return menus
})

const handleUserMenuClick = (key) => {
  switch (key) {
    case 'profile':
      // 跳转到个人中心
      console.log('个人中心')
      break
    case 'settings':
      // 跳转到系统设置
      console.log('系统设置')
      break
    case 'logout':
      // 退出登录
      userStore.logout()
      break
  }
}

const handleTabRefresh = () => {
  // 刷新当前页面
  window.location.reload()
}
</script>

<style scoped lang="scss">
.micro-app-container {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
</style>
