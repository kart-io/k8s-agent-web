/**
 * Cluster App Mock 数据服务
 */

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 生成集群数据
const generateClusters = () => {
  return [
    {
      id: 1,
      name: 'prod-cluster-1',
      region: 'us-west-1',
      status: 'healthy',
      version: 'v1.28.3',
      nodeCount: 12,
      podCount: 234,
      namespaceCount: 18,
      cpu: { used: 45.2, total: 96 },
      memory: { used: 178.5, total: 256 },
      storage: { used: 1200, total: 2000 },
      createdAt: Date.now() - 90 * 24 * 3600 * 1000,
      provider: 'AWS',
      apiServer: 'https://api.prod-cluster-1.k8s.local'
    },
    {
      id: 2,
      name: 'prod-cluster-2',
      region: 'us-east-1',
      status: 'healthy',
      version: 'v1.28.3',
      nodeCount: 8,
      podCount: 156,
      namespaceCount: 12,
      cpu: { used: 32.8, total: 64 },
      memory: { used: 98.3, total: 192 },
      storage: { used: 800, total: 1500 },
      createdAt: Date.now() - 75 * 24 * 3600 * 1000,
      provider: 'AWS',
      apiServer: 'https://api.prod-cluster-2.k8s.local'
    },
    {
      id: 3,
      name: 'dev-cluster',
      region: 'us-west-2',
      status: 'warning',
      version: 'v1.27.8',
      nodeCount: 4,
      podCount: 87,
      namespaceCount: 8,
      cpu: { used: 28.2, total: 32 },
      memory: { used: 56.7, total: 64 },
      storage: { used: 450, total: 800 },
      createdAt: Date.now() - 45 * 24 * 3600 * 1000,
      provider: 'GCP',
      apiServer: 'https://api.dev-cluster.k8s.local'
    },
    {
      id: 4,
      name: 'test-cluster',
      region: 'eu-central-1',
      status: 'healthy',
      version: 'v1.29.0',
      nodeCount: 3,
      podCount: 45,
      namespaceCount: 5,
      cpu: { used: 8.5, total: 24 },
      memory: { used: 18.2, total: 48 },
      storage: { used: 200, total: 500 },
      createdAt: Date.now() - 30 * 24 * 3600 * 1000,
      provider: 'Azure',
      apiServer: 'https://api.test-cluster.k8s.local'
    }
  ]
}

// Mock 数据
const mockData = {
  clusters: generateClusters(),

  // 节点数据
  nodes: [
    {
      id: 1,
      clusterId: 1,
      clusterName: 'prod-cluster-1',
      name: 'node-master-01',
      role: 'master',
      status: 'Ready',
      ip: '10.0.1.10',
      cpu: { used: 45.2, total: 8 },
      memory: { used: 12.3, total: 16 },
      pods: { used: 18, total: 110 }
    },
    {
      id: 2,
      clusterId: 1,
      clusterName: 'prod-cluster-1',
      name: 'node-worker-01',
      role: 'worker',
      status: 'Ready',
      ip: '10.0.1.20',
      cpu: { used: 65.8, total: 8 },
      memory: { used: 14.2, total: 16 },
      pods: { used: 24, total: 110 }
    },
    {
      id: 3,
      clusterId: 1,
      clusterName: 'prod-cluster-1',
      name: 'node-worker-02',
      role: 'worker',
      status: 'Ready',
      ip: '10.0.1.21',
      cpu: { used: 52.3, total: 8 },
      memory: { used: 13.5, total: 16 },
      pods: { used: 21, total: 110 }
    },
    {
      id: 4,
      clusterId: 2,
      clusterName: 'prod-cluster-2',
      name: 'node-master-01',
      role: 'master',
      status: 'Ready',
      ip: '10.0.2.10',
      cpu: { used: 38.5, total: 8 },
      memory: { used: 10.8, total: 16 },
      pods: { used: 15, total: 110 }
    }
  ],

  // 命名空间数据
  namespaces: [
    {
      id: 1,
      clusterId: 1,
      clusterName: 'prod-cluster-1',
      name: 'default',
      status: 'Active',
      podCount: 45,
      serviceCount: 12,
      deploymentCount: 8,
      createdAt: Date.now() - 90 * 24 * 3600 * 1000
    },
    {
      id: 2,
      clusterId: 1,
      clusterName: 'prod-cluster-1',
      name: 'kube-system',
      status: 'Active',
      podCount: 28,
      serviceCount: 8,
      deploymentCount: 5,
      createdAt: Date.now() - 90 * 24 * 3600 * 1000
    },
    {
      id: 3,
      clusterId: 1,
      clusterName: 'prod-cluster-1',
      name: 'app',
      status: 'Active',
      podCount: 67,
      serviceCount: 18,
      deploymentCount: 12,
      createdAt: Date.now() - 60 * 24 * 3600 * 1000
    }
  ]
}

// Mock API 实现
export const clusterMockApi = {
  /**
   * 获取集群列表
   */
  async getClusters(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let clusters = [...mockData.clusters]

    // 筛选
    if (params.status) {
      clusters = clusters.filter(c => c.status === params.status)
    }
    if (params.region) {
      clusters = clusters.filter(c => c.region === params.region)
    }
    if (params.keyword) {
      clusters = clusters.filter(c => c.name.includes(params.keyword))
    }

    return {
      data: clusters,
      total: clusters.length
    }
  },

  /**
   * 获取集群详情
   */
  async getClusterDetail(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const cluster = mockData.clusters.find(c => c.id == id)
    if (!cluster) {
      throw new Error('Cluster not found')
    }

    return {
      ...cluster,
      labels: {
        env: cluster.name.includes('prod') ? 'production' : 'development',
        managed: 'true',
        region: cluster.region
      },
      metrics: {
        cpuUsage: ((cluster.cpu.used / cluster.cpu.total) * 100).toFixed(1),
        memoryUsage: ((cluster.memory.used / cluster.memory.total) * 100).toFixed(1),
        storageUsage: ((cluster.storage.used / cluster.storage.total) * 100).toFixed(1),
        podUtilization: ((cluster.podCount / (cluster.nodeCount * 110)) * 100).toFixed(1)
      }
    }
  },

  /**
   * 获取节点列表
   */
  async getNodes(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let nodes = [...mockData.nodes]

    if (params.clusterId) {
      nodes = nodes.filter(n => n.clusterId == params.clusterId)
    }
    if (params.status) {
      nodes = nodes.filter(n => n.status === params.status)
    }

    return {
      data: nodes,
      total: nodes.length
    }
  },

  /**
   * 获取命名空间列表
   */
  async getNamespaces(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let namespaces = [...mockData.namespaces]

    if (params.clusterId) {
      namespaces = namespaces.filter(ns => ns.clusterId == params.clusterId)
    }

    return {
      data: namespaces,
      total: namespaces.length
    }
  },

  /**
   * 创建集群
   */
  async createCluster(data) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const newCluster = {
      id: mockData.clusters.length + 1,
      name: data.name,
      region: data.region,
      status: 'initializing',
      version: data.version || 'v1.28.3',
      nodeCount: 0,
      podCount: 0,
      namespaceCount: 0,
      cpu: { used: 0, total: data.cpuTotal || 32 },
      memory: { used: 0, total: data.memoryTotal || 64 },
      storage: { used: 0, total: data.storageTotal || 500 },
      createdAt: Date.now(),
      provider: data.provider || 'AWS',
      apiServer: `https://api.${data.name}.k8s.local`
    }

    mockData.clusters.push(newCluster)
    return newCluster
  },

  /**
   * 更新集群
   */
  async updateCluster(id, data) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const cluster = mockData.clusters.find(c => c.id == id)
    if (!cluster) {
      throw new Error('Cluster not found')
    }

    Object.assign(cluster, data)
    return cluster
  },

  /**
   * 删除集群
   */
  async deleteCluster(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const index = mockData.clusters.findIndex(c => c.id == id)
    if (index === -1) {
      throw new Error('Cluster not found')
    }

    mockData.clusters.splice(index, 1)
    return { message: 'Cluster deleted successfully' }
  }
}

// 导出别名以保持兼容
export const mockApi = clusterMockApi

// 检查是否启用 Mock
export const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

// 为 Wujie 环境提供全局命名空间
if (typeof window !== 'undefined') {
  window.__CLUSTER_MOCK_API__ = clusterMockApi
}

// 打印 Mock 状态
if (isMockEnabled()) {
  console.log(
    '%c[Cluster] Mock 数据已启用',
    'color: #10b981; font-weight: bold;'
  )
  console.log('[Cluster] Mock API:', clusterMockApi)
} else {
  console.log(
    '%c[Cluster] 使用真实接口',
    'color: #f59e0b; font-weight: bold;'
  )
}
