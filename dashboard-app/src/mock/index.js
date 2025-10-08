/**
 * Dashboard App Mock 数据服务
 */

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Mock 数据
const mockData = {
  // 统计数据
  stats: {
    totalAgents: 156,
    onlineAgents: 142,
    totalClusters: 23,
    totalEvents: 8934,
    cpuUsage: 65.8,
    memoryUsage: 72.3,
    networkTraffic: 1234.56,
    diskUsage: 45.2
  },

  // 近期事件
  recentEvents: [
    {
      id: 1,
      type: 'pod_created',
      level: 'info',
      cluster: 'prod-cluster-1',
      namespace: 'default',
      resource: 'nginx-deployment-abc123',
      message: 'Pod created successfully',
      timestamp: Date.now() - 300000
    },
    {
      id: 2,
      type: 'pod_failed',
      level: 'error',
      cluster: 'prod-cluster-2',
      namespace: 'kube-system',
      resource: 'coredns-xyz789',
      message: 'Pod failed: CrashLoopBackOff',
      timestamp: Date.now() - 600000
    },
    {
      id: 3,
      type: 'node_ready',
      level: 'success',
      cluster: 'prod-cluster-1',
      namespace: '-',
      resource: 'node-worker-03',
      message: 'Node is ready',
      timestamp: Date.now() - 900000
    },
    {
      id: 4,
      type: 'deployment_updated',
      level: 'warning',
      cluster: 'dev-cluster',
      namespace: 'app',
      resource: 'api-service',
      message: 'Deployment scaled to 5 replicas',
      timestamp: Date.now() - 1200000
    },
    {
      id: 5,
      type: 'service_created',
      level: 'info',
      cluster: 'prod-cluster-1',
      namespace: 'default',
      resource: 'nginx-service',
      message: 'Service exposed on port 80',
      timestamp: Date.now() - 1500000
    }
  ],

  // 集群状态
  clusterStatus: [
    {
      id: 1,
      name: 'prod-cluster-1',
      status: 'healthy',
      nodes: 12,
      pods: 234,
      cpu: 65.3,
      memory: 78.2,
      region: 'us-west-1'
    },
    {
      id: 2,
      name: 'prod-cluster-2',
      status: 'healthy',
      nodes: 8,
      pods: 156,
      cpu: 54.7,
      memory: 68.5,
      region: 'us-east-1'
    },
    {
      id: 3,
      name: 'dev-cluster',
      status: 'warning',
      nodes: 4,
      pods: 87,
      cpu: 82.1,
      memory: 91.3,
      region: 'us-west-2'
    },
    {
      id: 4,
      name: 'test-cluster',
      status: 'healthy',
      nodes: 3,
      pods: 45,
      cpu: 38.2,
      memory: 52.8,
      region: 'eu-central-1'
    }
  ],

  // 资源使用趋势（最近24小时）
  resourceTrends: {
    cpu: [
      { time: '00:00', value: 45.2 },
      { time: '02:00', value: 38.5 },
      { time: '04:00', value: 35.8 },
      { time: '06:00', value: 42.3 },
      { time: '08:00', value: 58.9 },
      { time: '10:00', value: 72.4 },
      { time: '12:00', value: 68.7 },
      { time: '14:00', value: 75.3 },
      { time: '16:00', value: 82.1 },
      { time: '18:00', value: 78.6 },
      { time: '20:00', value: 65.4 },
      { time: '22:00', value: 55.8 }
    ],
    memory: [
      { time: '00:00', value: 52.1 },
      { time: '02:00', value: 48.3 },
      { time: '04:00', value: 45.7 },
      { time: '06:00', value: 51.2 },
      { time: '08:00', value: 64.5 },
      { time: '10:00', value: 78.3 },
      { time: '12:00', value: 75.8 },
      { time: '14:00', value: 82.4 },
      { time: '16:00', value: 88.7 },
      { time: '18:00', value: 85.2 },
      { time: '20:00', value: 72.6 },
      { time: '22:00', value: 62.3 }
    ]
  }
}

// Mock API 实现
export const dashboardMockApi = {
  /**
   * 获取统计数据
   */
  async getStats() {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)
    return mockData.stats
  },

  /**
   * 获取近期事件
   */
  async getRecentEvents(limit = 10) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)
    return mockData.recentEvents.slice(0, limit)
  },

  /**
   * 获取集群状态
   */
  async getClusterStatus() {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)
    return mockData.clusterStatus
  },

  /**
   * 获取资源使用趋势
   */
  async getResourceTrends(type = 'cpu', hours = 24) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)
    return mockData.resourceTrends[type] || []
  }
}

// 导出别名以保持兼容
export const mockApi = dashboardMockApi

// 检查是否启用 Mock
export const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

// 为 Wujie 环境提供全局命名空间
if (typeof window !== 'undefined') {
  window.__DASHBOARD_MOCK_API__ = dashboardMockApi
}

// 打印 Mock 状态
if (isMockEnabled()) {
  console.log(
    '%c[Dashboard] Mock 数据已启用',
    'color: #10b981; font-weight: bold;'
  )
  console.log('[Dashboard] Mock API:', dashboardMockApi)
} else {
  console.log(
    '%c[Dashboard] 使用真实接口',
    'color: #f59e0b; font-weight: bold;'
  )
}
