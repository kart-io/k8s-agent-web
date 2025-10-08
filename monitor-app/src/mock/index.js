/**
 * Monitor App Mock 数据服务
 */

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 生成时间序列数据
const generateTimeSeriesData = (points = 24, baseValue = 50) => {
  const data = []
  const now = Date.now()
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - i * 3600 * 1000
    const variation = (Math.random() - 0.5) * 20
    data.push({
      timestamp,
      value: Math.max(0, Math.min(100, baseValue + variation))
    })
  }
  return data
}

// Mock 数据
const mockData = {
  // 监控指标
  metrics: {
    cpu: generateTimeSeriesData(24, 60),
    memory: generateTimeSeriesData(24, 70),
    network: generateTimeSeriesData(24, 40),
    disk: generateTimeSeriesData(24, 50)
  },

  // 告警列表
  alerts: [
    {
      id: 1,
      level: 'critical',
      title: 'CPU 使用率过高',
      message: 'prod-cluster-1 CPU 使用率持续超过 90%',
      source: 'prod-cluster-1',
      timestamp: Date.now() - 300000,
      status: 'firing'
    },
    {
      id: 2,
      level: 'warning',
      title: '内存使用率告警',
      message: 'prod-cluster-2 内存使用率达到 85%',
      source: 'prod-cluster-2',
      timestamp: Date.now() - 600000,
      status: 'firing'
    },
    {
      id: 3,
      level: 'info',
      title: 'Pod 重启',
      message: 'api-service pod 重启完成',
      source: 'dev-cluster',
      timestamp: Date.now() - 900000,
      status: 'resolved'
    },
    {
      id: 4,
      level: 'warning',
      title: '磁盘空间不足',
      message: 'node-worker-03 磁盘使用率达到 80%',
      source: 'prod-cluster-1',
      timestamp: Date.now() - 1200000,
      status: 'firing'
    }
  ],

  // 日志数据
  logs: [
    {
      id: 1,
      timestamp: Date.now() - 60000,
      level: 'info',
      source: 'api-service',
      message: 'Request processed successfully',
      cluster: 'prod-cluster-1',
      namespace: 'app'
    },
    {
      id: 2,
      timestamp: Date.now() - 120000,
      level: 'error',
      source: 'database-service',
      message: 'Connection timeout after 30s',
      cluster: 'prod-cluster-2',
      namespace: 'database'
    },
    {
      id: 3,
      timestamp: Date.now() - 180000,
      level: 'warn',
      source: 'nginx-ingress',
      message: 'High response time: 2.5s',
      cluster: 'prod-cluster-1',
      namespace: 'ingress'
    },
    {
      id: 4,
      timestamp: Date.now() - 240000,
      level: 'info',
      source: 'worker-service',
      message: 'Job completed in 45s',
      cluster: 'dev-cluster',
      namespace: 'jobs'
    }
  ]
}

// Mock API 实现
export const monitorMockApi = {
  /**
   * 获取监控指标
   */
  async getMetrics(type = 'cpu', range = '24h') {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)
    return mockData.metrics[type] || []
  },

  /**
   * 获取告警列表
   */
  async getAlerts(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let alerts = [...mockData.alerts]

    if (params.level) {
      alerts = alerts.filter(a => a.level === params.level)
    }
    if (params.status) {
      alerts = alerts.filter(a => a.status === params.status)
    }

    return {
      data: alerts,
      total: alerts.length
    }
  },

  /**
   * 获取日志
   */
  async getLogs(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let logs = [...mockData.logs]

    if (params.level) {
      logs = logs.filter(l => l.level === params.level)
    }
    if (params.source) {
      logs = logs.filter(l => l.source.includes(params.source))
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

// 导出别名以保持兼容
export const mockApi = monitorMockApi

// 检查是否启用 Mock
export const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

// 为 Wujie 环境提供全局命名空间
if (typeof window !== 'undefined') {
  window.__MONITOR_MOCK_API__ = monitorMockApi
}

// 打印 Mock 状态
if (isMockEnabled()) {
  console.log(
    '%c[Monitor] Mock 数据已启用',
    'color: #10b981; font-weight: bold;'
  )
  console.log('[Monitor] Mock API:', monitorMockApi)
} else {
  console.log(
    '%c[Monitor] 使用真实接口',
    'color: #f59e0b; font-weight: bold;'
  )
}
