<template>
  <a-layout class="main-layout">
    <a-layout-header class="header">
      <div class="logo">K8s Agent 管理平台</div>
      <div class="user-info">
        <a-dropdown>
          <a-avatar :src="userStore.avatar">{{ userStore.username?.[0] }}</a-avatar>
          <template #overlay>
            <a-menu>
              <a-menu-item key="profile">
                <UserOutlined /> 个人信息
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout" @click="handleLogout">
                <LogoutOutlined /> 退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>

    <a-layout>
      <a-layout-sider v-model:collapsed="collapsed" collapsible>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          mode="inline"
          theme="dark"
          @click="handleMenuClick"
        >
          <template v-for="menu in menuList" :key="menu.key">
            <!-- 一级菜单 -->
            <a-menu-item v-if="!menu.children" :key="menu.key">
              <component :is="getMenuIcon(menu.icon)" v-if="menu.icon" />
              <span>{{ menu.label }}</span>
            </a-menu-item>

            <!-- 带子菜单的菜单项 -->
            <a-sub-menu v-else :key="menu.key">
              <template #icon>
                <component :is="getMenuIcon(menu.icon)" v-if="menu.icon" />
              </template>
              <template #title>{{ menu.label }}</template>
              <a-menu-item v-for="child in menu.children" :key="child.key">
                <component :is="getMenuIcon(child.icon)" v-if="child.icon" />
                <span>{{ child.label }}</span>
              </a-menu-item>
            </a-sub-menu>
          </template>
        </a-menu>
      </a-layout-sider>

      <a-layout-content class="content">
        <div
          id="micro-app-container"
          class="micro-app-container"
        />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getIconComponent } from '@k8s-agent/shared/utils'
import {
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)
const selectedKeys = ref([route.path])
const openKeys = ref([])

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
    icon: 'DeploymentUnitOutlined'
  },
  {
    key: '/monitor',
    label: '监控管理',
    icon: 'MonitorOutlined'
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
// 如果是空数组 []，表示用户无权限，显示空菜单
// 如果是 null/undefined（初始状态或加载失败），使用默认菜单
const menuList = computed(() => {
  const menus = userStore.menuList
  if (menus === null || menus === undefined) {
    return defaultMenus
  }
  return menus
})

// 根据图标名称获取图标组件
const getMenuIcon = (iconName) => {
  return getIconComponent(iconName)
}

watch(() => route.path, (path) => {
  // 根据路径设置选中的菜单
  // 找到匹配的菜单项
  const matchedMenu = menuList.value.find(menu => {
    if (path === menu.key) return true
    if (path.startsWith(menu.key)) return true
    if (menu.children) {
      return menu.children.some(child => path === child.key || path.startsWith(child.key))
    }
    return false
  })

  if (matchedMenu) {
    // 如果是子菜单项，选中子菜单并展开父菜单
    if (matchedMenu.children) {
      const matchedChild = matchedMenu.children.find(child =>
        path === child.key || path.startsWith(child.key)
      )
      selectedKeys.value = matchedChild ? [matchedChild.key] : [matchedMenu.key]
      // 自动展开包含当前路由的父菜单
      if (matchedChild) {
        openKeys.value = [matchedMenu.key]
      }
    } else {
      selectedKeys.value = [matchedMenu.key]
    }
  }
}, { immediate: true })

const handleMenuClick = ({ key }) => {
  router.push(key)
}

const handleLogout = () => {
  userStore.logout()
}
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #001529;
  padding: 0 20px;
  color: white;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.user-info {
  cursor: pointer;

  :deep(.ant-avatar) {
    background-color: #1890ff;
  }
}

.content {
  margin: 16px;
  padding: 24px;
  background: white;
  min-height: 280px;
  overflow: auto;
}

.micro-app-container {
  min-height: 100%;
}
</style>
