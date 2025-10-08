<template>
  <div class="layout-header">
    <!-- Logo 和折叠按钮 -->
    <div class="header-left">
      <div v-if="showLogo" class="logo">
        <slot name="logo">
          {{ logoText }}
        </slot>
      </div>
      <a-button
        v-if="showTrigger"
        type="text"
        class="trigger"
        @click="toggleCollapsed"
      >
        <MenuFoldOutlined v-if="!collapsed" />
        <MenuUnfoldOutlined v-else />
      </a-button>
    </div>

    <!-- 面包屑 -->
    <div v-if="showBreadcrumb" class="header-breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
          <component :is="getIcon(item.icon)" v-if="item.icon" />
          <span v-if="item.path" class="breadcrumb-link" @click="handleBreadcrumbClick(item)">
            {{ item.label }}
          </span>
          <span v-else>{{ item.label }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 右侧操作区 -->
    <div class="header-actions">
      <slot name="actions">
        <!-- 搜索 -->
        <a-tooltip title="搜索">
          <a-button type="text" class="action-btn">
            <SearchOutlined />
          </a-button>
        </a-tooltip>

        <!-- 全屏 -->
        <a-tooltip :title="isFullscreen ? '退出全屏' : '全屏'">
          <a-button type="text" class="action-btn" @click="toggleFullscreen">
            <FullscreenExitOutlined v-if="isFullscreen" />
            <FullscreenOutlined v-else />
          </a-button>
        </a-tooltip>

        <!-- 通知 -->
        <a-badge :count="notificationCount" :offset="[-5, 5]">
          <a-button type="text" class="action-btn">
            <BellOutlined />
          </a-button>
        </a-badge>

        <!-- 用户信息 -->
        <a-dropdown placement="bottomRight">
          <div class="user-dropdown">
            <a-avatar :size="32" :src="userAvatar">
              {{ userName?.[0] }}
            </a-avatar>
            <span class="user-name">{{ userName }}</span>
          </div>
          <template #overlay>
            <a-menu @click="handleUserMenuClick">
              <a-menu-item key="profile">
                <UserOutlined />
                个人中心
              </a-menu-item>
              <a-menu-item key="settings">
                <SettingOutlined />
                系统设置
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout">
                <LogoutOutlined />
                退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import { getIconComponent } from '../../utils'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  showLogo: {
    type: Boolean,
    default: true
  },
  showTrigger: {
    type: Boolean,
    default: true
  },
  showBreadcrumb: {
    type: Boolean,
    default: true
  },
  logoText: {
    type: String,
    default: 'Vben Admin'
  },
  userName: {
    type: String,
    default: 'Admin'
  },
  userAvatar: {
    type: String,
    default: ''
  },
  breadcrumbList: {
    type: Array,
    default: () => []
  },
  notificationCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:collapsed', 'user-menu-click', 'breadcrumb-click'])

const router = useRouter()
const isFullscreen = ref(false)

const toggleCollapsed = () => {
  emit('update:collapsed', !props.collapsed)
}

const getIcon = (iconName) => {
  if (!iconName) return null
  return getIconComponent(iconName)
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

const handleUserMenuClick = ({ key }) => {
  emit('user-menu-click', key)
}

const handleBreadcrumbClick = (item) => {
  if (item.path) {
    emit('breadcrumb-click', item)
    router.push(item.path)
  }
}

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})
</script>

<style scoped lang="scss">
.layout-header {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  padding-left: 16px;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  margin-right: 16px;
  white-space: nowrap;
}

.trigger {
  font-size: 18px;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}

.header-breadcrumb {
  flex: 1;
  padding: 0 16px;
  overflow: hidden;

  :deep(.ant-breadcrumb) {
    font-size: 14px;
  }

  .breadcrumb-link {
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #1890ff;
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  padding-right: 16px;
  gap: 4px;
}

.action-btn {
  font-size: 16px;
  padding: 0 12px;
  height: 48px;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 48px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }

  .user-name {
    font-size: 14px;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

:deep(.ant-avatar) {
  background-color: #1890ff;
}
</style>
