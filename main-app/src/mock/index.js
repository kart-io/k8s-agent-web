/**
 * Mock 数据服务
 * 用于开发环境模拟后端接口
 */

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock 数据存储
const mockData = {
  // 用户信息
  users: {
    admin: {
      username: 'admin',
      password: 'admin123',
      token: 'mock-token-admin-' + Date.now(),
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      user: {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        email: 'admin@example.com',
        roles: ['admin']
      },
      permissions: ['*'],
      menus: [
        {
          key: '/dashboard',
          path: '/dashboard',
          name: 'dashboard',
          label: '仪表盘',
          icon: 'DashboardOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: '仪表盘',
            affix: true
          }
        },
        {
          key: '/agents',
          path: '/agents',
          name: 'agents',
          label: 'Agent 管理',
          icon: 'ClusterOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: 'Agent 管理'
          }
        },
        {
          key: '/clusters',
          path: '/clusters',
          name: 'clusters',
          label: '集群管理',
          icon: 'DeploymentUnitOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: '集群管理'
          }
        },
        {
          key: '/monitor',
          path: '/monitor',
          name: 'monitor',
          label: '监控管理',
          icon: 'MonitorOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: '监控管理'
          }
        },
        {
          key: '/image-build',
          path: '/image-build',
          name: 'image-build',
          label: '镜像构建',
          icon: 'BuildOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: '镜像构建'
          }
        },
        {
          key: '/system',
          path: '/system',
          name: 'system',
          label: '系统管理',
          icon: 'SettingOutlined',
          component: 'SubMenu',
          meta: {
            requiresAuth: true,
            title: '系统管理'
          },
          children: [
            {
              key: '/system/users',
              path: '/system/users',
              name: 'system-users',
              label: '用户管理',
              icon: 'UserOutlined',
              component: 'MicroAppPlaceholder',
              meta: {
                requiresAuth: true,
                title: '用户管理'
              }
            },
            {
              key: '/system/roles',
              path: '/system/roles',
              name: 'system-roles',
              label: '角色管理',
              icon: 'TeamOutlined',
              component: 'MicroAppPlaceholder',
              meta: {
                requiresAuth: true,
                title: '角色管理'
              }
            },
            {
              key: '/system/permissions',
              path: '/system/permissions',
              name: 'system-permissions',
              label: '权限管理',
              icon: 'SafetyOutlined',
              component: 'MicroAppPlaceholder',
              meta: {
                requiresAuth: true,
                title: '权限管理'
              }
            }
          ]
        }
      ]
    },
    user: {
      username: 'user',
      password: 'user123',
      token: 'mock-token-user-' + Date.now(),
      avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
      user: {
        id: 2,
        username: 'user',
        nickname: '普通用户',
        email: 'user@example.com',
        roles: ['user']
      },
      permissions: ['dashboard:view', 'agents:view'],
      menus: [
        {
          key: '/dashboard',
          path: '/dashboard',
          name: 'dashboard',
          label: '仪表盘',
          icon: 'DashboardOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: '仪表盘'
          }
        },
        {
          key: '/agents',
          path: '/agents',
          name: 'agents',
          label: 'Agent 管理',
          icon: 'ClusterOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: 'Agent 管理'
          }
        }
      ]
    },
    guest: {
      username: 'guest',
      password: 'guest123',
      token: 'mock-token-guest-' + Date.now(),
      avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
      user: {
        id: 3,
        username: 'guest',
        nickname: '访客',
        email: 'guest@example.com',
        roles: ['guest']
      },
      permissions: [],
      menus: [] // 无菜单权限
    }
  }
}

// Mock API 实现
export const mockApi = {
  /**
   * 登录接口
   */
  async login(username, password) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 500)

    const user = mockData.users[username]

    if (!user) {
      throw new Error('用户不存在')
    }

    if (user.password !== password) {
      throw new Error('密码错误')
    }

    return {
      token: user.token,
      user: user.user,
      permissions: user.permissions
    }
  },

  /**
   * 获取用户菜单
   */
  async getUserMenus(token) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 500)

    // 根据 token 找到对应用户
    const user = Object.values(mockData.users).find(u => u.token === token)

    if (!user) {
      throw new Error('用户未登录或 token 无效')
    }

    return user.menus
  },

  /**
   * 获取用户信息
   */
  async getUserInfo(token) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 500)

    const user = Object.values(mockData.users).find(u => u.token === token)

    if (!user) {
      throw new Error('用户未登录或 token 无效')
    }

    return user.user
  }
}

// 检查是否启用 Mock
export const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

// 打印 Mock 状态
if (isMockEnabled()) {
  console.log(
    '%c🎭 Mock 数据已启用',
    'color: #10b981; font-weight: bold; font-size: 14px;'
  )
  console.log(
    '%c可用的测试账号:',
    'color: #3b82f6; font-weight: bold;'
  )
  console.table([
    { 用户名: 'admin', 密码: 'admin123', 说明: '管理员（所有权限）' },
    { 用户名: 'user', 密码: 'user123', 说明: '普通用户（部分权限）' },
    { 用户名: 'guest', 密码: 'guest123', 说明: '访客（无菜单权限）' }
  ])
  console.log(
    '%c在 .env.development 中设置 VITE_USE_MOCK=false 可关闭 Mock',
    'color: #6b7280; font-style: italic;'
  )
} else {
  console.log(
    '%c🌐 使用真实接口',
    'color: #f59e0b; font-weight: bold; font-size: 14px;'
  )
}
