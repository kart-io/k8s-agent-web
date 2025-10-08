/**
 * System App Mock 数据服务
 */

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Mock 数据
const mockData = {
  // 用户列表
  users: [
    {
      id: 1,
      username: 'admin',
      nickname: '系统管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      status: 'active',
      roles: ['admin'],
      createdAt: Date.now() - 365 * 24 * 3600 * 1000,
      lastLoginAt: Date.now() - 3600 * 1000
    },
    {
      id: 2,
      username: 'user001',
      nickname: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138001',
      status: 'active',
      roles: ['user'],
      createdAt: Date.now() - 180 * 24 * 3600 * 1000,
      lastLoginAt: Date.now() - 7200 * 1000
    },
    {
      id: 3,
      username: 'user002',
      nickname: '李四',
      email: 'lisi@example.com',
      phone: '13800138002',
      status: 'active',
      roles: ['user', 'operator'],
      createdAt: Date.now() - 90 * 24 * 3600 * 1000,
      lastLoginAt: Date.now() - 86400 * 1000
    },
    {
      id: 4,
      username: 'user003',
      nickname: '王五',
      email: 'wangwu@example.com',
      phone: '13800138003',
      status: 'disabled',
      roles: ['guest'],
      createdAt: Date.now() - 60 * 24 * 3600 * 1000,
      lastLoginAt: Date.now() - 604800 * 1000
    }
  ],

  // 角色列表
  roles: [
    {
      id: 1,
      code: 'admin',
      name: '管理员',
      description: '系统管理员，拥有所有权限',
      permissions: ['*'],
      userCount: 1,
      createdAt: Date.now() - 365 * 24 * 3600 * 1000
    },
    {
      id: 2,
      code: 'operator',
      name: '运维人员',
      description: '负责系统运维和监控',
      permissions: ['cluster:*', 'agent:*', 'monitor:view'],
      userCount: 8,
      createdAt: Date.now() - 300 * 24 * 3600 * 1000
    },
    {
      id: 3,
      code: 'user',
      name: '普通用户',
      description: '普通用户权限',
      permissions: ['dashboard:view', 'agent:view', 'cluster:view'],
      userCount: 45,
      createdAt: Date.now() - 200 * 24 * 3600 * 1000
    },
    {
      id: 4,
      code: 'guest',
      name: '访客',
      description: '只读权限',
      permissions: ['dashboard:view'],
      userCount: 12,
      createdAt: Date.now() - 100 * 24 * 3600 * 1000
    }
  ],

  // 权限列表
  permissions: [
    { id: 1, code: 'dashboard:view', name: '查看仪表盘', group: '仪表盘' },
    { id: 2, code: 'agent:view', name: '查看Agent', group: 'Agent管理' },
    { id: 3, code: 'agent:create', name: '创建Agent', group: 'Agent管理' },
    { id: 4, code: 'agent:edit', name: '编辑Agent', group: 'Agent管理' },
    { id: 5, code: 'agent:delete', name: '删除Agent', group: 'Agent管理' },
    { id: 6, code: 'cluster:view', name: '查看集群', group: '集群管理' },
    { id: 7, code: 'cluster:create', name: '创建集群', group: '集群管理' },
    { id: 8, code: 'cluster:edit', name: '编辑集群', group: '集群管理' },
    { id: 9, code: 'cluster:delete', name: '删除集群', group: '集群管理' },
    { id: 10, code: 'monitor:view', name: '查看监控', group: '监控管理' },
    { id: 11, code: 'system:user', name: '用户管理', group: '系统管理' },
    { id: 12, code: 'system:role', name: '角色管理', group: '系统管理' },
    { id: 13, code: 'system:permission', name: '权限管理', group: '系统管理' }
  ],

  // 操作日志
  auditLogs: [
    {
      id: 1,
      user: 'admin',
      action: 'user.create',
      resource: 'user:user004',
      result: 'success',
      ip: '192.168.1.100',
      timestamp: Date.now() - 180000
    },
    {
      id: 2,
      user: 'user001',
      action: 'cluster.update',
      resource: 'cluster:prod-cluster-1',
      result: 'success',
      ip: '192.168.1.101',
      timestamp: Date.now() - 360000
    },
    {
      id: 3,
      user: 'user002',
      action: 'agent.delete',
      resource: 'agent:agent-050',
      result: 'failed',
      ip: '192.168.1.102',
      timestamp: Date.now() - 540000
    }
  ]
}

// Mock API 实现
export const systemMockApi = {
  /**
   * 获取用户列表
   */
  async getUsers(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let users = [...mockData.users]

    if (params.status) {
      users = users.filter(u => u.status === params.status)
    }
    if (params.keyword) {
      users = users.filter(u =>
        u.username.includes(params.keyword) ||
        u.nickname.includes(params.keyword) ||
        u.email.includes(params.keyword)
      )
    }

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    console.log('[System Mock] getUsers called, returning:', users.slice(start, end))
    return {
      data: users.slice(start, end),
      total: users.length,
      page,
      pageSize
    }
  },

  /**
   * 获取用户详情
   */
  async getUserDetail(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const user = mockData.users.find(u => u.id == id)
    if (!user) {
      throw new Error('User not found')
    }

    return user
  },

  /**
   * 创建用户
   */
  async createUser(data) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const newUser = {
      id: mockData.users.length + 1,
      username: data.username,
      nickname: data.nickname,
      email: data.email,
      phone: data.phone || '',
      status: 'active',
      roles: data.roles || ['guest'],
      createdAt: Date.now(),
      lastLoginAt: null
    }

    mockData.users.push(newUser)
    return newUser
  },

  /**
   * 更新用户
   */
  async updateUser(id, data) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const user = mockData.users.find(u => u.id == id)
    if (!user) {
      throw new Error('User not found')
    }

    Object.assign(user, data)
    return user
  },

  /**
   * 删除用户
   */
  async deleteUser(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const index = mockData.users.findIndex(u => u.id == id)
    if (index === -1) {
      throw new Error('User not found')
    }

    mockData.users.splice(index, 1)
    return { message: 'User deleted successfully' }
  },

  /**
   * 获取角色列表
   */
  async getRoles(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    console.log('[System Mock] getRoles called, returning:', mockData.roles)
    return {
      data: mockData.roles,
      total: mockData.roles.length
    }
  },

  /**
   * 获取权限列表
   */
  async getPermissions(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    console.log('[System Mock] getPermissions called, returning:', mockData.permissions)
    return {
      data: mockData.permissions,
      total: mockData.permissions.length
    }
  },

  /**
   * 获取操作日志
   */
  async getAuditLogs(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let logs = [...mockData.auditLogs]

    if (params.user) {
      logs = logs.filter(l => l.user === params.user)
    }
    if (params.action) {
      logs = logs.filter(l => l.action.includes(params.action))
    }

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: logs.slice(start, end),
      total: logs.length,
      page,
      pageSize
    }
  }
}

// 导出别名以保持兼容 - 直接使用 systemMockApi
export const mockApi = systemMockApi

// 检查是否启用 Mock
export const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

// 为 Wujie 环境提供全局命名空间
if (typeof window !== 'undefined') {
  window.__SYSTEM_MOCK_API__ = systemMockApi
  // 同时确保 mockApi 指向正确的对象
  console.log('[System Mock] Registering global namespace')
  console.log('[System Mock] systemMockApi === mockApi:', systemMockApi === mockApi)
}

// 打印 Mock 状态
if (isMockEnabled()) {
  console.log(
    '%c[System] Mock 数据已启用',
    'color: #10b981; font-weight: bold;'
  )
  console.log('[System] Mock API:', systemMockApi)
  console.log('[System] mockApi.getRoles:', mockApi.getRoles)
  console.log('[System] mockApi.getPermissions:', mockApi.getPermissions)
  console.log('[System] mockApi.getUsers:', mockApi.getUsers)
} else {
  console.log(
    '%c[System] 使用真实接口',
    'color: #f59e0b; font-weight: bold;'
  )
}
