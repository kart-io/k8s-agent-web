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
      roles: 'control-plane,master',
      status: 'Ready',
      ready: true,
      version: 'v1.28.3',
      ip: '10.0.1.10',
      cpuUsage: '3.6',
      cpuCapacity: '8',
      cpuUsagePercent: 45,
      memoryUsage: '12.3Gi',
      memoryCapacity: '16Gi',
      memoryUsagePercent: 77,
      podCount: 18,
      age: '90d',
      createdAt: Date.now() - 90 * 24 * 3600 * 1000
    },
    {
      id: 2,
      clusterId: 1,
      clusterName: 'prod-cluster-1',
      name: 'node-worker-01',
      roles: 'worker',
      status: 'Ready',
      ready: true,
      version: 'v1.28.3',
      ip: '10.0.1.20',
      cpuUsage: '5.3',
      cpuCapacity: '8',
      cpuUsagePercent: 66,
      memoryUsage: '14.2Gi',
      memoryCapacity: '16Gi',
      memoryUsagePercent: 89,
      podCount: 24,
      age: '90d',
      createdAt: Date.now() - 90 * 24 * 3600 * 1000
    },
    {
      id: 3,
      clusterId: 1,
      clusterName: 'prod-cluster-1',
      name: 'node-worker-02',
      roles: 'worker',
      status: 'Ready',
      ready: true,
      version: 'v1.28.3',
      ip: '10.0.1.21',
      cpuUsage: '4.2',
      cpuCapacity: '8',
      cpuUsagePercent: 53,
      memoryUsage: '13.5Gi',
      memoryCapacity: '16Gi',
      memoryUsagePercent: 84,
      podCount: 21,
      age: '90d',
      createdAt: Date.now() - 90 * 24 * 3600 * 1000
    },
    {
      id: 4,
      clusterId: 2,
      clusterName: 'prod-cluster-2',
      name: 'node-master-01',
      roles: 'control-plane,master',
      status: 'Ready',
      ready: true,
      version: 'v1.28.3',
      ip: '10.0.2.10',
      cpuUsage: '3.1',
      cpuCapacity: '8',
      cpuUsagePercent: 39,
      memoryUsage: '10.8Gi',
      memoryCapacity: '16Gi',
      memoryUsagePercent: 68,
      podCount: 15,
      age: '75d',
      createdAt: Date.now() - 75 * 24 * 3600 * 1000
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
  ],

  // Pods 数据
  pods: [
    {
      id: 1,
      clusterId: 1,
      name: 'nginx-deployment-7d8f6c9b5d-x7h9m',
      namespace: 'default',
      status: 'Running',
      readyContainers: 1,
      totalContainers: 1,
      restarts: 0,
      nodeName: 'node-worker-01',
      podIP: '10.244.1.23',
      age: '5d',
      createdAt: Date.now() - 5 * 24 * 3600 * 1000
    },
    {
      id: 2,
      clusterId: 1,
      name: 'redis-master-0',
      namespace: 'default',
      status: 'Running',
      readyContainers: 1,
      totalContainers: 1,
      restarts: 2,
      nodeName: 'node-worker-02',
      podIP: '10.244.2.15',
      age: '12d',
      createdAt: Date.now() - 12 * 24 * 3600 * 1000
    },
    {
      id: 3,
      clusterId: 1,
      name: 'api-server-6f8c9d5b7c-k4n2p',
      namespace: 'app',
      status: 'Running',
      readyContainers: 2,
      totalContainers: 2,
      restarts: 0,
      nodeName: 'node-worker-01',
      podIP: '10.244.1.45',
      age: '3d',
      createdAt: Date.now() - 3 * 24 * 3600 * 1000
    },
    {
      id: 4,
      clusterId: 1,
      name: 'mysql-statefulset-0',
      namespace: 'app',
      status: 'Running',
      readyContainers: 1,
      totalContainers: 1,
      restarts: 1,
      nodeName: 'node-worker-02',
      podIP: '10.244.2.32',
      age: '8d',
      createdAt: Date.now() - 8 * 24 * 3600 * 1000
    },
    {
      id: 5,
      clusterId: 1,
      name: 'coredns-5d78c9684d-8xp7m',
      namespace: 'kube-system',
      status: 'Running',
      readyContainers: 1,
      totalContainers: 1,
      restarts: 0,
      nodeName: 'node-master-01',
      podIP: '10.244.0.12',
      age: '90d',
      createdAt: Date.now() - 90 * 24 * 3600 * 1000
    },
    {
      id: 6,
      clusterId: 1,
      name: 'metrics-server-7cd5fcb6b7-qn5kt',
      namespace: 'kube-system',
      status: 'Running',
      readyContainers: 1,
      totalContainers: 1,
      restarts: 3,
      nodeName: 'node-master-01',
      podIP: '10.244.0.18',
      age: '45d',
      createdAt: Date.now() - 45 * 24 * 3600 * 1000
    }
  ],

  // Deployments 数据
  deployments: [
    {
      id: 1,
      clusterId: 1,
      name: 'nginx-deployment',
      namespace: 'default',
      replicas: 3,
      readyReplicas: 3,
      availableReplicas: 3,
      updatedReplicas: 3,
      age: '15d',
      createdAt: Date.now() - 15 * 24 * 3600 * 1000
    },
    {
      id: 2,
      clusterId: 1,
      name: 'redis-deployment',
      namespace: 'default',
      replicas: 2,
      readyReplicas: 2,
      availableReplicas: 2,
      updatedReplicas: 2,
      age: '20d',
      createdAt: Date.now() - 20 * 24 * 3600 * 1000
    },
    {
      id: 3,
      clusterId: 1,
      name: 'api-server',
      namespace: 'app',
      replicas: 5,
      readyReplicas: 5,
      availableReplicas: 5,
      updatedReplicas: 5,
      age: '7d',
      createdAt: Date.now() - 7 * 24 * 3600 * 1000
    },
    {
      id: 4,
      clusterId: 1,
      name: 'frontend',
      namespace: 'app',
      replicas: 3,
      readyReplicas: 2,
      availableReplicas: 2,
      updatedReplicas: 3,
      age: '10d',
      createdAt: Date.now() - 10 * 24 * 3600 * 1000
    },
    {
      id: 5,
      clusterId: 1,
      name: 'coredns',
      namespace: 'kube-system',
      replicas: 2,
      readyReplicas: 2,
      availableReplicas: 2,
      updatedReplicas: 2,
      age: '90d',
      createdAt: Date.now() - 90 * 24 * 3600 * 1000
    },
    {
      id: 6,
      clusterId: 1,
      name: 'metrics-server',
      namespace: 'kube-system',
      replicas: 1,
      readyReplicas: 1,
      availableReplicas: 1,
      updatedReplicas: 1,
      age: '45d',
      createdAt: Date.now() - 45 * 24 * 3600 * 1000
    }
  ],

  // Services 数据
  services: [
    {
      id: 1,
      clusterId: 1,
      name: 'kubernetes',
      namespace: 'default',
      type: 'ClusterIP',
      clusterIP: '10.96.0.1',
      externalIP: null,
      ports: ['443/TCP'],
      selector: '<none>',
      age: '90d',
      createdAt: Date.now() - 90 * 24 * 3600 * 1000
    },
    {
      id: 2,
      clusterId: 1,
      name: 'nginx-service',
      namespace: 'default',
      type: 'LoadBalancer',
      clusterIP: '10.96.45.123',
      externalIP: '34.123.45.67',
      ports: ['80/TCP', '443/TCP'],
      selector: 'app=nginx',
      age: '15d',
      createdAt: Date.now() - 15 * 24 * 3600 * 1000
    },
    {
      id: 3,
      clusterId: 1,
      name: 'redis-service',
      namespace: 'default',
      type: 'ClusterIP',
      clusterIP: '10.96.67.89',
      externalIP: null,
      ports: ['6379/TCP'],
      selector: 'app=redis',
      age: '20d',
      createdAt: Date.now() - 20 * 24 * 3600 * 1000
    },
    {
      id: 4,
      clusterId: 1,
      name: 'api-service',
      namespace: 'app',
      type: 'NodePort',
      clusterIP: '10.96.123.45',
      externalIP: null,
      ports: ['8080:30080/TCP'],
      selector: 'app=api-server',
      age: '7d',
      createdAt: Date.now() - 7 * 24 * 3600 * 1000
    },
    {
      id: 5,
      clusterId: 1,
      name: 'mysql-service',
      namespace: 'app',
      type: 'ClusterIP',
      clusterIP: '10.96.234.56',
      externalIP: null,
      ports: ['3306/TCP'],
      selector: 'app=mysql',
      age: '10d',
      createdAt: Date.now() - 10 * 24 * 3600 * 1000
    },
    {
      id: 6,
      clusterId: 1,
      name: 'kube-dns',
      namespace: 'kube-system',
      type: 'ClusterIP',
      clusterIP: '10.96.0.10',
      externalIP: null,
      ports: ['53/UDP', '53/TCP', '9153/TCP'],
      selector: 'k8s-app=kube-dns',
      age: '90d',
      createdAt: Date.now() - 90 * 24 * 3600 * 1000
    },
    {
      id: 7,
      clusterId: 1,
      name: 'metrics-server',
      namespace: 'kube-system',
      type: 'ClusterIP',
      clusterIP: '10.96.12.34',
      externalIP: null,
      ports: ['443/TCP'],
      selector: 'k8s-app=metrics-server',
      age: '45d',
      createdAt: Date.now() - 45 * 24 * 3600 * 1000
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
      stats: {
        nodeCount: cluster.nodeCount,
        podCount: cluster.podCount,
        serviceCount: mockData.services.filter(s => s.clusterId == id).length,
        deploymentCount: cluster.namespaceCount * 2 // 简化计算
      },
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
  },

  /**
   * 获取 Pods 列表
   */
  async getPods(clusterId, params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let pods = [...mockData.pods]

    // 按集群过滤
    if (clusterId) {
      pods = pods.filter(p => p.clusterId == clusterId)
    }

    // 按命名空间过滤
    if (params.namespace) {
      pods = pods.filter(p => p.namespace === params.namespace)
    }

    // 按节点名称过滤
    if (params.nodeName) {
      pods = pods.filter(p => p.nodeName === params.nodeName)
    }

    // 搜索
    if (params.search) {
      pods = pods.filter(p => p.name.includes(params.search))
    }

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: pods.slice(start, end),
      items: pods.slice(start, end),
      total: pods.length
    }
  },

  /**
   * 获取 Services 列表
   */
  async getServices(clusterId, params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let services = [...mockData.services]

    // 按集群过滤
    if (clusterId) {
      services = services.filter(s => s.clusterId == clusterId)
    }

    // 按命名空间过滤
    if (params.namespace) {
      services = services.filter(s => s.namespace === params.namespace)
    }

    // 搜索
    if (params.search) {
      services = services.filter(s => s.name.includes(params.search))
    }

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: services.slice(start, end),
      items: services.slice(start, end),
      total: services.length
    }
  },

  /**
   * 获取 Deployments 列表
   */
  async getDeployments(clusterId, params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let deployments = [...mockData.deployments]

    // 按集群过滤
    if (clusterId) {
      deployments = deployments.filter(d => d.clusterId == clusterId)
    }

    // 按命名空间过滤
    if (params.namespace) {
      deployments = deployments.filter(d => d.namespace === params.namespace)
    }

    // 搜索
    if (params.search) {
      deployments = deployments.filter(d => d.name.includes(params.search))
    }

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: deployments.slice(start, end),
      items: deployments.slice(start, end),
      total: deployments.length
    }
  },

  // 获取 Pod 容器列表
  async getPodContainers({ clusterId, namespace, podName }) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    // 根据 Pod 名称返回不同的容器配置
    const containers = [
      {
        name: 'app',
        image: 'nginx:1.21',
        ready: true,
        restartCount: 0,
        state: 'running'
      }
    ]

    // 某些 Pod 有多个容器
    if (podName.includes('multi') || podName.includes('sidecar')) {
      containers.push({
        name: 'sidecar',
        image: 'busybox:latest',
        ready: true,
        restartCount: 0,
        state: 'running'
      })
    }

    return {
      data: containers,
      items: containers
    }
  },

  // 获取 Pod 日志
  async getPodLogs({ clusterId, namespace, podName, container, tail = 100, follow = false }) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    // 生成模拟日志
    const generateLogLines = (count) => {
      const logLevels = ['INFO', 'DEBUG', 'WARN', 'ERROR']
      const messages = [
        'Application started successfully',
        'Connected to database',
        'Processing request',
        'Query executed in 45ms',
        'Cache hit ratio: 85%',
        'HTTP GET /api/users 200 OK',
        'Background job completed',
        'Scheduled task started',
        'Memory usage: 256MB',
        'CPU usage: 15%'
      ]

      const logs = []
      const now = Date.now()

      for (let i = 0; i < count; i++) {
        const timestamp = new Date(now - (count - i) * 1000).toISOString()
        const level = logLevels[Math.floor(Math.random() * logLevels.length)]
        const message = messages[Math.floor(Math.random() * messages.length)]
        logs.push(`${timestamp} [${level}] ${message}`)
      }

      return logs
    }

    const logs = generateLogLines(tail || 100)

    return {
      data: {
        logs: logs.join('\n'),
        lines: logs
      }
    }
  },

  // 获取 Pod 详情
  async getPodDetail({ clusterId, namespace, podName }) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const now = Date.now()
    const createdAt = now - 7 * 24 * 3600 * 1000 // 7天前

    return {
      data: {
        name: podName,
        namespace: namespace,
        status: 'Running',
        podIP: '10.244.1.23',
        hostIP: '192.168.1.10',
        nodeName: 'node-worker-01',
        qosClass: 'Burstable',
        restartPolicy: 'Always',
        serviceAccountName: 'default',
        priority: 0,
        createdAt: createdAt,
        age: '7d',
        labels: {
          'app': 'nginx',
          'version': 'v1.21',
          'env': 'production',
          'team': 'platform'
        },
        annotations: {
          'kubectl.kubernetes.io/last-applied-configuration': '{"apiVersion":"v1","kind":"Pod",...}',
          'prometheus.io/scrape': 'true',
          'prometheus.io/port': '9090'
        },
        containers: [
          {
            name: 'app',
            image: 'nginx:1.21',
            state: 'running',
            ready: true,
            restartCount: 0,
            resources: {
              requests: {
                cpu: '100m',
                memory: '128Mi'
              },
              limits: {
                cpu: '500m',
                memory: '512Mi'
              }
            }
          },
          {
            name: 'sidecar',
            image: 'busybox:latest',
            state: 'running',
            ready: true,
            restartCount: 0,
            resources: {
              requests: {
                cpu: '50m',
                memory: '64Mi'
              },
              limits: {
                cpu: '100m',
                memory: '128Mi'
              }
            }
          }
        ],
        cpuUsage: 85,
        cpuUsagePercent: 17,
        cpuRequest: '150m',
        cpuLimit: '600m',
        memoryUsage: 256,
        memoryUsagePercent: 40,
        memoryRequest: '192Mi',
        memoryLimit: '640Mi',
        volumes: [
          {
            name: 'config-volume',
            type: 'ConfigMap',
            mountPath: '/etc/config',
            readOnly: true
          },
          {
            name: 'data-volume',
            type: 'PersistentVolumeClaim',
            mountPath: '/data',
            readOnly: false
          },
          {
            name: 'secret-volume',
            type: 'Secret',
            mountPath: '/etc/secrets',
            readOnly: true
          }
        ],
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
            reason: 'PodInitialized',
            message: 'All init containers have completed successfully',
            lastTransitionTime: createdAt
          },
          {
            type: 'Ready',
            status: 'True',
            reason: 'ContainersReady',
            message: 'All containers are ready',
            lastTransitionTime: createdAt + 30000
          },
          {
            type: 'ContainersReady',
            status: 'True',
            reason: 'ContainersReady',
            message: 'All containers are ready',
            lastTransitionTime: createdAt + 30000
          },
          {
            type: 'PodScheduled',
            status: 'True',
            reason: 'PodScheduled',
            message: 'Successfully assigned to node-worker-01',
            lastTransitionTime: createdAt
          }
        ],
        events: [
          {
            id: 1,
            type: 'Normal',
            reason: 'Scheduled',
            message: 'Successfully assigned default/nginx-deployment-7d9c8f5b6d-abc12 to node-worker-01',
            timestamp: createdAt
          },
          {
            id: 2,
            type: 'Normal',
            reason: 'Pulling',
            message: 'Pulling image "nginx:1.21"',
            timestamp: createdAt + 5000
          },
          {
            id: 3,
            type: 'Normal',
            reason: 'Pulled',
            message: 'Successfully pulled image "nginx:1.21" in 15.234s',
            timestamp: createdAt + 20000
          },
          {
            id: 4,
            type: 'Normal',
            reason: 'Created',
            message: 'Created container app',
            timestamp: createdAt + 22000
          },
          {
            id: 5,
            type: 'Normal',
            reason: 'Started',
            message: 'Started container app',
            timestamp: createdAt + 25000
          }
        ],
        yaml: `apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${namespace}
  labels:
    app: nginx
    version: v1.21
    env: production
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "9090"
spec:
  containers:
  - name: app
    image: nginx:1.21
    ports:
    - containerPort: 80
      protocol: TCP
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 500m
        memory: 512Mi
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
      readOnly: true
  - name: sidecar
    image: busybox:latest
    command: ['sh', '-c', 'tail -f /dev/null']
    resources:
      requests:
        cpu: 50m
        memory: 64Mi
      limits:
        cpu: 100m
        memory: 128Mi
  volumes:
  - name: config-volume
    configMap:
      name: app-config
  restartPolicy: Always
  serviceAccountName: default
  nodeName: node-worker-01
status:
  phase: Running
  podIP: 10.244.1.23
  hostIP: 192.168.1.10
  conditions:
  - type: Ready
    status: "True"
    lastTransitionTime: "${new Date(createdAt + 30000).toISOString()}"
  - type: ContainersReady
    status: "True"
    lastTransitionTime: "${new Date(createdAt + 30000).toISOString()}"
  containerStatuses:
  - name: app
    ready: true
    restartCount: 0
    state:
      running:
        startedAt: "${new Date(createdAt + 25000).toISOString()}"
`
      }
    }
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
