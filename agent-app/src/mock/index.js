/**
 * Agent App Mock 数据服务
 */

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 生成随机 Agent 数据
const generateAgents = (count) => {
  const statuses = ['online', 'offline']
  const clusters = ['prod-cluster-1', 'prod-cluster-2', 'dev-cluster', 'test-cluster']
  const namespaces = ['default', 'kube-system', 'monitoring', 'app', 'database']
  const agents = []

  for (let i = 1; i <= count; i++) {
    agents.push({
      id: `agent-${String(i).padStart(3, '0')}`,
      name: `agent-${String(i).padStart(3, '0')}`,
      clusterName: clusters[Math.floor(Math.random() * clusters.length)],
      namespace: namespaces[Math.floor(Math.random() * namespaces.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      version: `v1.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
      lastHeartbeat: new Date(Date.now() - Math.floor(Math.random() * 300000)).toISOString(),
      cpu: (Math.random() * 100).toFixed(1),
      memory: (Math.random() * 100).toFixed(1),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 3600 * 1000).toISOString(),
      labels: {
        env: clusters[Math.floor(Math.random() * clusters.length)].includes('prod') ? 'production' : 'development',
        region: 'us-west-1'
      }
    })
  }

  return agents
}

// Mock 数据
const mockData = {
  agents: generateAgents(50),

  // 事件数据
  events: [
    {
      id: 1,
      agentId: 1,
      agentName: 'agent-001',
      type: 'pod_created',
      level: 'info',
      resource: 'nginx-deployment-abc123',
      message: 'Pod created successfully',
      timestamp: Date.now() - 180000,
      cluster: 'prod-cluster-1',
      namespace: 'default'
    },
    {
      id: 2,
      agentId: 2,
      agentName: 'agent-002',
      type: 'pod_failed',
      level: 'error',
      resource: 'api-service-xyz789',
      message: 'Pod failed: CrashLoopBackOff',
      timestamp: Date.now() - 360000,
      cluster: 'prod-cluster-2',
      namespace: 'app'
    },
    {
      id: 3,
      agentId: 1,
      agentName: 'agent-001',
      type: 'deployment_updated',
      level: 'warning',
      resource: 'web-deployment',
      message: 'Deployment scaled from 3 to 5 replicas',
      timestamp: Date.now() - 540000,
      cluster: 'prod-cluster-1',
      namespace: 'default'
    },
    {
      id: 4,
      agentId: 3,
      agentName: 'agent-003',
      type: 'service_created',
      level: 'info',
      resource: 'mysql-service',
      message: 'Service exposed on port 3306',
      timestamp: Date.now() - 720000,
      cluster: 'dev-cluster',
      namespace: 'database'
    },
    {
      id: 5,
      agentId: 2,
      agentName: 'agent-002',
      type: 'node_ready',
      level: 'success',
      resource: 'node-worker-05',
      message: 'Node is ready',
      timestamp: Date.now() - 900000,
      cluster: 'prod-cluster-2',
      namespace: '-'
    }
  ],

  // 命令数据
  commands: [
    {
      id: 1,
      agentId: 1,
      agentName: 'agent-001',
      command: 'get_pods',
      params: { namespace: 'default' },
      status: 'completed',
      result: 'Found 12 pods',
      createdAt: Date.now() - 120000,
      completedAt: Date.now() - 115000
    },
    {
      id: 2,
      agentId: 2,
      agentName: 'agent-002',
      command: 'restart_pod',
      params: { name: 'api-service-xyz789', namespace: 'app' },
      status: 'running',
      result: null,
      createdAt: Date.now() - 60000,
      completedAt: null
    },
    {
      id: 3,
      agentId: 1,
      agentName: 'agent-001',
      command: 'get_logs',
      params: { pod: 'nginx-abc123', lines: 100 },
      status: 'completed',
      result: 'Log data retrieved successfully',
      createdAt: Date.now() - 300000,
      completedAt: Date.now() - 295000
    },
    {
      id: 4,
      agentId: 3,
      agentName: 'agent-003',
      command: 'scale_deployment',
      params: { name: 'web-deployment', replicas: 5 },
      status: 'failed',
      result: 'Error: Insufficient resources',
      createdAt: Date.now() - 600000,
      completedAt: Date.now() - 595000
    }
  ]
}

// Mock API 实现
export const agentMockApi = {
  /**
   * 获取 Agent 列表
   */
  async getAgents(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let agents = [...mockData.agents]

    // 筛选
    if (params.status) {
      agents = agents.filter(a => a.status === params.status)
    }
    if (params.cluster) {
      agents = agents.filter(a => a.clusterName === params.cluster)
    }
    if (params.search || params.keyword) {
      const keyword = params.search || params.keyword
      agents = agents.filter(a =>
        a.name.includes(keyword) || a.ip.includes(keyword)
      )
    }

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: agents.slice(start, end),
      total: agents.length,
      page,
      pageSize
    }
  },

  /**
   * 获取 Agent 详情
   */
  async getAgentDetail(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const agent = mockData.agents.find(a => a.id == id)
    if (!agent) {
      throw new Error('Agent not found')
    }

    return {
      ...agent,
      metrics: {
        cpu: agent.cpu,
        memory: agent.memory,
        disk: (Math.random() * 100).toFixed(1),
        network: (Math.random() * 1000).toFixed(2)
      }
    }
  },

  /**
   * 更新 Agent
   */
  async updateAgent(id, data) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const agent = mockData.agents.find(a => a.id == id)
    if (!agent) {
      throw new Error('Agent not found')
    }

    Object.assign(agent, data)
    return agent
  },

  /**
   * 删除 Agent
   */
  async deleteAgent(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const index = mockData.agents.findIndex(a => a.id == id)
    if (index === -1) {
      throw new Error('Agent not found')
    }

    mockData.agents.splice(index, 1)
    return { message: 'Agent deleted successfully' }
  },

  /**
   * 获取事件列表
   */
  async getEvents(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let events = [...mockData.events]

    // 筛选
    if (params.agentId) {
      events = events.filter(e => e.agentId == params.agentId)
    }
    if (params.level) {
      events = events.filter(e => e.level === params.level)
    }
    if (params.type) {
      events = events.filter(e => e.type === params.type)
    }

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: events.slice(start, end),
      total: events.length,
      page,
      pageSize
    }
  },

  /**
   * 获取命令列表
   */
  async getCommands(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let commands = [...mockData.commands]

    // 筛选
    if (params.agentId) {
      commands = commands.filter(c => c.agentId == params.agentId)
    }
    if (params.status) {
      commands = commands.filter(c => c.status === params.status)
    }

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: commands.slice(start, end),
      total: commands.length,
      page,
      pageSize
    }
  },

  /**
   * 发送命令
   */
  async sendCommand(data) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const newCommand = {
      id: mockData.commands.length + 1,
      agentId: data.agentId,
      agentName: mockData.agents.find(a => a.id == data.agentId)?.name || 'unknown',
      command: data.command,
      params: data.params || {},
      status: 'pending',
      result: null,
      createdAt: Date.now(),
      completedAt: null
    }

    mockData.commands.unshift(newCommand)
    return newCommand
  }
}

// 导出别名以保持兼容
export const mockApi = agentMockApi

// 检查是否启用 Mock
export const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

// 为 Wujie 环境提供全局命名空间
if (typeof window !== 'undefined') {
  window.__AGENT_MOCK_API__ = agentMockApi
}

// 打印 Mock 状态
if (isMockEnabled()) {
  console.log(
    '%c[Agent] Mock 数据已启用',
    'color: #10b981; font-weight: bold;'
  )
  console.log('[Agent] Mock API:', agentMockApi)
} else {
  console.log(
    '%c[Agent] 使用真实接口',
    'color: #f59e0b; font-weight: bold;'
  )
}
