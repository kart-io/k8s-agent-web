/**
 * Kubernetes Mock 数据生成
 */

import type {
  Cluster,
  ClusterListResult,
  ConfigMap,
  ConfigMapListResult,
  CronJob,
  CronJobListResult,
  DaemonSet,
  DaemonSetListResult,
  Deployment,
  DeploymentListResult,
  Job,
  JobListResult,
  Namespace,
  NamespaceListResult,
  Node,
  NodeListResult,
  Pod,
  PodListResult,
  Secret,
  SecretListResult,
  Service,
  ServiceListResult,
  StatefulSet,
  StatefulSetListResult,
} from './types';

// ==================== 数据生成工具函数 ====================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function generateTimestamp(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// ==================== 集群 Mock 数据生成 ====================

const CLUSTER_STATUSES = ['healthy', 'unhealthy', 'unknown'] as const;
const CLUSTER_VERSIONS = [
  'v1.28.2',
  'v1.28.1',
  'v1.28.0',
  'v1.27.5',
  'v1.27.4',
];
const CLUSTER_ENVS = [
  'Production',
  'Staging',
  'Development',
  'Test',
  'QA',
  'UAT',
];

function generateMockClusters(count: number): Cluster[] {
  const clusters: Cluster[] = [];

  for (let i = 1; i <= count; i++) {
    const env = randomElement(CLUSTER_ENVS);
    const regionId = String(i).padStart(2, '0');
    const clusterId = `cluster-${env.toLowerCase()}-${regionId}`;
    const createdDaysAgo = randomInt(30, 365);

    clusters.push({
      id: clusterId,
      name: `${env} Cluster ${regionId}`,
      description: `${env}环境集群 - Region ${regionId}`,
      apiServer: `https://k8s-${env.toLowerCase()}-${regionId}.example.com:6443`,
      version: randomElement(CLUSTER_VERSIONS),
      status: randomElement(CLUSTER_STATUSES),
      nodeCount: randomInt(3, 50),
      podCount: randomInt(20, 500),
      namespaceCount: randomInt(3, 20),
      createdAt: generateTimestamp(createdDaysAgo),
      updatedAt: generateTimestamp(randomInt(0, 7)),
    });
  }

  return clusters;
}

const MOCK_CLUSTERS: Cluster[] = generateMockClusters(120);

export function getMockClusterList(params?: {
  keyword?: string;
  page?: number;
  pageSize?: number;
  status?: string;
}): ClusterListResult {
  let filteredClusters = [...MOCK_CLUSTERS];

  // 关键词搜索
  if (params?.keyword) {
    const keyword = params.keyword.toLowerCase();
    filteredClusters = filteredClusters.filter(
      (cluster) =>
        cluster.name.toLowerCase().includes(keyword) ||
        cluster.description?.toLowerCase().includes(keyword) ||
        cluster.id.toLowerCase().includes(keyword),
    );
  }

  // 状态筛选
  if (params?.status && params.status !== 'all') {
    filteredClusters = filteredClusters.filter(
      (cluster) => cluster.status === params.status,
    );
  }

  const total = filteredClusters.length;
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filteredClusters.slice(start, end);

  return { items, total };
}

// ==================== Pod Mock 数据生成 ====================

const POD_PHASES = ['Running', 'Pending', 'Succeeded', 'Failed', 'Unknown'];
const POD_IMAGES = [
  'nginx:1.25.0',
  'redis:7.0',
  'postgres:15',
  'mongo:6.0',
  'mysql:8.0',
  'node:18-alpine',
  'python:3.11-slim',
  'golang:1.21',
];
const NAMESPACES = [
  'default',
  'production',
  'staging',
  'development',
  'kube-system',
];
const APP_NAMES = [
  'nginx',
  'redis',
  'postgres',
  'mongodb',
  'mysql',
  'api-server',
  'web-frontend',
  'worker',
  'scheduler',
];

function generateMockPods(count: number): Pod[] {
  const pods: Pod[] = [];

  for (let i = 1; i <= count; i++) {
    const appName = randomElement(APP_NAMES);
    const namespace = randomElement(NAMESPACES);
    const podId = `${appName}-${randomInt(100_000, 999_999)}`;
    const hash = Math.random().toString(36).slice(2, 12);
    const createdDaysAgo = randomInt(0, 30);
    const phase = randomElement(POD_PHASES);
    const image = randomElement(POD_IMAGES);

    pods.push({
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: {
        name: `${podId}-${hash}`,
        namespace,
        uid: `pod-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          app: appName,
          'pod-template-hash': hash,
        },
      },
      spec: {
        containers: [
          {
            name: appName,
            image,
            ports: [{ containerPort: randomInt(3000, 9000), protocol: 'TCP' }],
          },
        ],
        nodeName: `node-${randomInt(1, 20).toString().padStart(2, '0')}`,
      },
      status: {
        phase,
        conditions: [],
        hostIP: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
        podIP: `10.244.${randomInt(0, 255)}.${randomInt(1, 254)}`,
        startTime: generateTimestamp(createdDaysAgo),
        containerStatuses: [
          {
            name: appName,
            state:
              phase === 'Running'
                ? { running: { startedAt: generateTimestamp(createdDaysAgo) } }
                : {},
            ready: phase === 'Running',
            restartCount: randomInt(0, 5),
            image,
          },
        ],
      },
    });
  }

  return pods;
}

const MOCK_PODS: Pod[] = generateMockPods(500);

export function getMockPodList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): PodListResult {
  let filteredPods = [...MOCK_PODS];

  // 命名空间筛选
  if (params.namespace) {
    filteredPods = filteredPods.filter(
      (pod) => pod.metadata.namespace === params.namespace,
    );
  }

  const total = filteredPods.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'PodList',
    metadata: {},
    items: filteredPods.slice(start, end),
    total,
  };
}

// ==================== Deployment Mock 数据生成 ====================

function generateMockDeployments(count: number): Deployment[] {
  const deployments: Deployment[] = [];

  for (let i = 1; i <= count; i++) {
    const appName = randomElement(APP_NAMES);
    const namespace = randomElement(NAMESPACES);
    const replicas = randomInt(1, 10);
    const readyReplicas = randomInt(0, replicas);
    const createdDaysAgo = randomInt(1, 90);
    const image = randomElement(POD_IMAGES);

    deployments.push({
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: `${appName}-deployment-${i}`,
        namespace,
        uid: `dep-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          app: appName,
        },
      },
      spec: {
        replicas,
        selector: {
          matchLabels: {
            app: appName,
          },
        },
        template: {
          metadata: {
            name: appName,
            labels: {
              app: appName,
            },
          },
          spec: {
            containers: [
              {
                name: appName,
                image,
                ports: [{ containerPort: randomInt(3000, 9000) }],
              },
            ],
          },
        },
      },
      status: {
        replicas,
        updatedReplicas: replicas,
        readyReplicas,
        availableReplicas: readyReplicas,
      },
    });
  }

  return deployments;
}

const MOCK_DEPLOYMENTS: Deployment[] = generateMockDeployments(200);

export function getMockDeploymentList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): DeploymentListResult {
  let filteredDeployments = [...MOCK_DEPLOYMENTS];

  // 命名空间筛选
  if (params.namespace) {
    filteredDeployments = filteredDeployments.filter(
      (deployment) => deployment.metadata.namespace === params.namespace,
    );
  }

  const total = filteredDeployments.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'apps/v1',
    kind: 'DeploymentList',
    metadata: {},
    items: filteredDeployments.slice(start, end),
    total,
  };
}

// ==================== Service Mock 数据生成 ====================

const SERVICE_TYPES = ['ClusterIP', 'NodePort', 'LoadBalancer'];

function generateMockServices(count: number): Service[] {
  const services: Service[] = [];

  for (let i = 1; i <= count; i++) {
    const appName = randomElement(APP_NAMES);
    const namespace = randomElement(NAMESPACES);
    const serviceType = randomElement(SERVICE_TYPES);
    const port = randomInt(3000, 9000);
    const createdDaysAgo = randomInt(1, 180);

    services.push({
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: `${appName}-service-${i}`,
        namespace,
        uid: `svc-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
      },
      spec: {
        type: serviceType,
        clusterIP: `10.96.${randomInt(0, 255)}.${randomInt(1, 254)}`,
        ports: [
          {
            name: 'http',
            protocol: 'TCP',
            port,
            targetPort: port,
          },
        ],
        selector: {
          app: appName,
        },
      },
    });
  }

  return services;
}

const MOCK_SERVICES: Service[] = generateMockServices(150);

export function getMockServiceList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): ServiceListResult {
  let filteredServices = [...MOCK_SERVICES];

  // 命名空间筛选
  if (params.namespace) {
    filteredServices = filteredServices.filter(
      (service) => service.metadata.namespace === params.namespace,
    );
  }

  const total = filteredServices.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'ServiceList',
    metadata: {},
    items: filteredServices.slice(start, end),
    total,
  };
}

// ==================== ConfigMap Mock 数据生成 ====================

const CONFIG_TYPES = [
  'app-config',
  'database-config',
  'redis-config',
  'nginx-config',
  'env-config',
];

function generateMockConfigMaps(count: number): ConfigMap[] {
  const configMaps: ConfigMap[] = [];

  for (let i = 1; i <= count; i++) {
    const configType = randomElement(CONFIG_TYPES);
    const namespace = randomElement(NAMESPACES);
    const keyCount = randomInt(2, 10);
    const data: Record<string, string> = {};

    // 生成随机配置键值对
    for (let j = 0; j < keyCount; j++) {
      data[`config-key-${j + 1}`] = `config-value-${randomInt(1000, 9999)}`;
    }

    configMaps.push({
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: `${configType}-${i}`,
        namespace,
        uid: `cm-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(randomInt(1, 180)),
      },
      data,
    });
  }

  return configMaps;
}

const MOCK_CONFIGMAPS: ConfigMap[] = generateMockConfigMaps(100);

export function getMockConfigMapList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): ConfigMapListResult {
  let filteredConfigMaps = [...MOCK_CONFIGMAPS];

  // 命名空间筛选
  if (params.namespace) {
    filteredConfigMaps = filteredConfigMaps.filter(
      (configMap) => configMap.metadata.namespace === params.namespace,
    );
  }

  const total = filteredConfigMaps.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'ConfigMapList',
    metadata: {},
    items: filteredConfigMaps.slice(start, end),
    total,
  };
}

// ==================== CronJob Mock 数据生成 ====================

const CRON_SCHEDULES = [
  '0 2 * * *', // 每天凌晨2点
  '*/5 * * * *', // 每5分钟
  '0 */6 * * *', // 每6小时
  '0 0 * * 0', // 每周日零点
  '0 0 1 * *', // 每月1号零点
];

const JOB_TYPES = ['backup', 'cleanup', 'sync', 'report', 'monitor'];

function generateMockCronJobs(count: number): CronJob[] {
  const cronJobs: CronJob[] = [];

  for (let i = 1; i <= count; i++) {
    const jobType = randomElement(JOB_TYPES);
    const namespace = randomElement(NAMESPACES);
    const schedule = randomElement(CRON_SCHEDULES);
    const createdDaysAgo = randomInt(1, 180);
    const suspend = Math.random() > 0.8; // 20% 概率暂停

    cronJobs.push({
      apiVersion: 'batch/v1',
      kind: 'CronJob',
      metadata: {
        name: `${jobType}-job-${i}`,
        namespace,
        uid: `cj-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
      },
      spec: {
        schedule,
        suspend,
        jobTemplate: {
          spec: {
            template: {
              spec: {
                containers: [
                  {
                    name: jobType,
                    image: `${jobType}:latest`,
                  },
                ],
              },
            },
          },
        },
      },
      status: {
        lastScheduleTime: suspend
          ? undefined
          : generateTimestamp(randomInt(0, 7)),
      },
    });
  }

  return cronJobs;
}

const MOCK_CRONJOBS: CronJob[] = generateMockCronJobs(80);

export function getMockCronJobList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): CronJobListResult {
  let filteredCronJobs = [...MOCK_CRONJOBS];

  // 命名空间筛选
  if (params.namespace) {
    filteredCronJobs = filteredCronJobs.filter(
      (cronJob) => cronJob.metadata.namespace === params.namespace,
    );
  }

  const total = filteredCronJobs.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'batch/v1',
    kind: 'CronJobList',
    metadata: {},
    items: filteredCronJobs.slice(start, end),
    total,
  };
}

// ==================== Node Mock 数据生成 ====================

const _NODE_ROLES = ['master', 'worker'];
const _NODE_STATUSES = ['Ready', 'NotReady', 'Unknown'];
const OS_IMAGES = [
  'Ubuntu 22.04.3 LTS',
  'CentOS Linux 7 (Core)',
  'Debian GNU/Linux 11 (bullseye)',
];
const KERNEL_VERSIONS = [
  '5.15.0-91-generic',
  '5.4.0-169-generic',
  '4.19.0-25-amd64',
];

function generateMockNodes(count: number): Node[] {
  const nodes: Node[] = [];

  for (let i = 1; i <= count; i++) {
    const nodeName = `node-${i.toString().padStart(2, '0')}`;
    const role = i <= 3 ? 'master' : 'worker';
    const status =
      Math.random() > 0.1 ? 'Ready' : randomElement(['NotReady', 'Unknown']);
    const createdDaysAgo = randomInt(30, 365);
    const cpuCapacity = randomInt(2, 64);
    const memoryCapacity = randomInt(4, 256);
    const osImage = randomElement(OS_IMAGES);
    const kernelVersion = randomElement(KERNEL_VERSIONS);

    nodes.push({
      apiVersion: 'v1',
      kind: 'Node',
      metadata: {
        name: nodeName,
        uid: `node-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          'kubernetes.io/role': role,
          'kubernetes.io/hostname': nodeName,
          'node-role.kubernetes.io/': role,
        },
      },
      spec: {
        podCIDR: `10.244.${i}.0/24`,
        podCIDRs: [`10.244.${i}.0/24`],
      },
      status: {
        capacity: {
          cpu: `${cpuCapacity}`,
          memory: `${memoryCapacity}Gi`,
          pods: '110',
        },
        allocatable: {
          cpu: `${cpuCapacity - 1}`,
          memory: `${memoryCapacity - 2}Gi`,
          pods: '110',
        },
        conditions: [
          {
            type: 'Ready',
            status: status === 'Ready' ? 'True' : 'False',
            lastHeartbeatTime: generateTimestamp(0),
            lastTransitionTime: generateTimestamp(createdDaysAgo),
            reason: status === 'Ready' ? 'KubeletReady' : 'KubeletNotReady',
            message:
              status === 'Ready'
                ? 'kubelet is posting ready status'
                : 'kubelet is not ready',
          },
        ],
        addresses: [
          {
            type: 'InternalIP',
            address: `192.168.1.${10 + i}`,
          },
          {
            type: 'Hostname',
            address: nodeName,
          },
        ],
        nodeInfo: {
          machineID: Math.random().toString(36).slice(2, 18),
          systemUUID: Math.random().toString(36).slice(2, 18),
          bootID: Math.random().toString(36).slice(2, 18),
          kernelVersion,
          osImage,
          containerRuntimeVersion: 'containerd://1.7.2',
          kubeletVersion: 'v1.28.2',
          kubeProxyVersion: 'v1.28.2',
          operatingSystem: 'linux',
          architecture: 'amd64',
        },
      },
    });
  }

  return nodes;
}

const MOCK_NODES: Node[] = generateMockNodes(50);

export function getMockNodeList(params: {
  clusterId: string;
  page?: number;
  pageSize?: number;
}): NodeListResult {
  const total = MOCK_NODES.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'NodeList',
    metadata: {},
    items: MOCK_NODES.slice(start, end),
    total,
  };
}

// ==================== Secret Mock 数据生成 ====================

const SECRET_TYPES = [
  'Opaque',
  'kubernetes.io/service-account-token',
  'kubernetes.io/dockerconfigjson',
  'kubernetes.io/tls',
  'kubernetes.io/basic-auth',
];

const SECRET_NAMES = [
  'db-credentials',
  'api-keys',
  'tls-cert',
  'registry-secret',
  'jwt-secret',
  'aws-credentials',
  'github-token',
  'redis-password',
];

function generateMockSecrets(count: number): Secret[] {
  const secrets: Secret[] = [];

  for (let i = 1; i <= count; i++) {
    const secretName = randomElement(SECRET_NAMES);
    const namespace = randomElement(NAMESPACES);
    const secretType = randomElement(SECRET_TYPES);
    const createdDaysAgo = randomInt(1, 365);
    const keyCount = randomInt(1, 5);
    const data: Record<string, string> = {};

    // 生成随机密钥数据（Base64 编码）
    for (let j = 0; j < keyCount; j++) {
      const key =
        ['username', 'password', 'token', 'key', 'cert'][j] || `secret-${j}`;
      // 模拟 Base64 编码的数据（使用浏览器原生 btoa）
      data[key] = btoa(`secret-value-${randomInt(10_000, 99_999)}`);
    }

    secrets.push({
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: `${secretName}-${i}`,
        namespace,
        uid: `secret-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
      },
      type: secretType,
      data,
    });
  }

  return secrets;
}

const MOCK_SECRETS: Secret[] = generateMockSecrets(120);

export function getMockSecretList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): SecretListResult {
  let filteredSecrets = [...MOCK_SECRETS];

  // 命名空间筛选
  if (params.namespace) {
    filteredSecrets = filteredSecrets.filter(
      (secret) => secret.metadata.namespace === params.namespace,
    );
  }

  const total = filteredSecrets.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'SecretList',
    metadata: {},
    items: filteredSecrets.slice(start, end),
    total,
  };
}

// ==================== Namespace Mock 数据生成 ====================

function generateMockNamespaces(): Namespace[] {
  const namespaces: Namespace[] = [];
  const namespaceList = [
    { name: 'default', daysAgo: 365, phase: 'Active' },
    { name: 'kube-system', daysAgo: 365, phase: 'Active' },
    { name: 'kube-public', daysAgo: 365, phase: 'Active' },
    { name: 'kube-node-lease', daysAgo: 365, phase: 'Active' },
    { name: 'production', daysAgo: 180, phase: 'Active' },
    { name: 'staging', daysAgo: 150, phase: 'Active' },
    { name: 'development', daysAgo: 120, phase: 'Active' },
    { name: 'testing', daysAgo: 90, phase: 'Active' },
    { name: 'monitoring', daysAgo: 200, phase: 'Active' },
    { name: 'logging', daysAgo: 200, phase: 'Active' },
    { name: 'ingress-nginx', daysAgo: 180, phase: 'Active' },
    { name: 'cert-manager', daysAgo: 180, phase: 'Active' },
  ];

  namespaceList.forEach((ns, index) => {
    namespaces.push({
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: ns.name,
        uid: `ns-${(index + 1).toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(ns.daysAgo),
        labels: {
          'kubernetes.io/metadata.name': ns.name,
          environment: ns.name.includes('prod')
            ? 'production'
            : ns.name.includes('stag')
              ? 'staging'
              : 'development',
        },
      },
      status: {
        phase: ns.phase as 'Active' | 'Terminating',
      },
    });
  });

  return namespaces;
}

const MOCK_NAMESPACES: Namespace[] = generateMockNamespaces();

export function getMockNamespaceList(params: {
  clusterId: string;
  page?: number;
  pageSize?: number;
}): NamespaceListResult {
  const total = MOCK_NAMESPACES.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'NamespaceList',
    metadata: {},
    items: MOCK_NAMESPACES.slice(start, end),
    total,
  };
}

// ==================== StatefulSet Mock 数据生成 ====================

function generateMockStatefulSets(count: number): StatefulSet[] {
  const statefulSets: StatefulSet[] = [];

  for (let i = 1; i <= count; i++) {
    const appName = randomElement(APP_NAMES);
    const namespace = randomElement(NAMESPACES);
    const replicas = randomInt(2, 5);
    const readyReplicas = randomInt(0, replicas);
    const createdDaysAgo = randomInt(1, 90);
    const image = randomElement(POD_IMAGES);

    statefulSets.push({
      apiVersion: 'apps/v1',
      kind: 'StatefulSet',
      metadata: {
        name: `${appName}-statefulset-${i}`,
        namespace,
        uid: `sts-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          app: appName,
        },
      },
      spec: {
        replicas,
        serviceName: `${appName}-service`,
        selector: {
          matchLabels: {
            app: appName,
          },
        },
        template: {
          metadata: {
            name: appName,
            labels: {
              app: appName,
            },
          },
          spec: {
            containers: [
              {
                name: appName,
                image,
                ports: [{ containerPort: randomInt(3000, 9000) }],
              },
            ],
          },
        },
      },
      status: {
        replicas,
        readyReplicas,
        currentReplicas: replicas,
        updatedReplicas: replicas,
      },
    });
  }

  return statefulSets;
}

const MOCK_STATEFULSETS: StatefulSet[] = generateMockStatefulSets(80);

export function getMockStatefulSetList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): StatefulSetListResult {
  let filteredStatefulSets = [...MOCK_STATEFULSETS];

  // 命名空间筛选
  if (params.namespace) {
    filteredStatefulSets = filteredStatefulSets.filter(
      (sts) => sts.metadata.namespace === params.namespace,
    );
  }

  const total = filteredStatefulSets.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'apps/v1',
    kind: 'StatefulSetList',
    metadata: {},
    items: filteredStatefulSets.slice(start, end),
    total,
  };
}

// ==================== DaemonSet Mock 数据生成 ====================

function generateMockDaemonSets(count: number): DaemonSet[] {
  const daemonSets: DaemonSet[] = [];

  for (let i = 1; i <= count; i++) {
    const appName = randomElement([
      'nginx',
      'fluentd',
      'node-exporter',
      'kube-proxy',
    ]);
    const namespace = randomElement(NAMESPACES);
    const desiredNumber = randomInt(3, 20);
    const numberReady = randomInt(desiredNumber - 2, desiredNumber);
    const createdDaysAgo = randomInt(1, 180);
    const image = randomElement(POD_IMAGES);

    daemonSets.push({
      apiVersion: 'apps/v1',
      kind: 'DaemonSet',
      metadata: {
        name: `${appName}-daemonset-${i}`,
        namespace,
        uid: `ds-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          app: appName,
        },
      },
      spec: {
        selector: {
          matchLabels: {
            app: appName,
          },
        },
        template: {
          metadata: {
            name: appName,
            labels: {
              app: appName,
            },
          },
          spec: {
            containers: [
              {
                name: appName,
                image,
                ports: [{ containerPort: randomInt(3000, 9000) }],
              },
            ],
          },
        },
      },
      status: {
        currentNumberScheduled: desiredNumber,
        numberMisscheduled: 0,
        desiredNumberScheduled: desiredNumber,
        numberReady,
        updatedNumberScheduled: desiredNumber,
        numberAvailable: numberReady,
        numberUnavailable: desiredNumber - numberReady,
      },
    });
  }

  return daemonSets;
}

const MOCK_DAEMONSETS: DaemonSet[] = generateMockDaemonSets(50);

export function getMockDaemonSetList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): DaemonSetListResult {
  let filteredDaemonSets = [...MOCK_DAEMONSETS];

  // 命名空间筛选
  if (params.namespace) {
    filteredDaemonSets = filteredDaemonSets.filter(
      (ds) => ds.metadata.namespace === params.namespace,
    );
  }

  const total = filteredDaemonSets.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'apps/v1',
    kind: 'DaemonSetList',
    metadata: {},
    items: filteredDaemonSets.slice(start, end),
    total,
  };
}

// ==================== Job Mock 数据生成 ====================

const JOB_STATUSES = ['Running', 'Succeeded', 'Failed'] as const;

function generateMockJobs(count: number): Job[] {
  const jobs: Job[] = [];

  for (let i = 1; i <= count; i++) {
    const jobType = randomElement(JOB_TYPES);
    const namespace = randomElement(NAMESPACES);
    const completions = randomInt(1, 10);
    const parallelism = randomInt(1, completions);
    const createdDaysAgo = randomInt(0, 30);
    const image = randomElement(POD_IMAGES);
    const statusType = randomElement(JOB_STATUSES);

    let succeeded = 0;
    let failed = 0;
    let active = 0;

    if (statusType === 'Succeeded') {
      succeeded = completions;
    } else if (statusType === 'Failed') {
      failed = randomInt(1, completions);
    } else {
      active = randomInt(1, parallelism);
      succeeded = randomInt(0, completions - active);
    }

    jobs.push({
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: `${jobType}-job-${i}`,
        namespace,
        uid: `job-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          'job-name': `${jobType}-job-${i}`,
        },
      },
      spec: {
        completions,
        parallelism,
        backoffLimit: 6,
        template: {
          spec: {
            containers: [
              {
                name: jobType,
                image,
              },
            ],
            restartPolicy: 'OnFailure',
          },
        },
      },
      status: {
        active,
        succeeded,
        failed,
        startTime: generateTimestamp(createdDaysAgo),
        completionTime:
          statusType === 'Succeeded' || statusType === 'Failed'
            ? generateTimestamp(randomInt(0, createdDaysAgo))
            : undefined,
        conditions:
          statusType === 'Succeeded'
            ? [
                {
                  type: 'Complete',
                  status: 'True',
                  lastTransitionTime: generateTimestamp(
                    randomInt(0, createdDaysAgo),
                  ),
                },
              ]
            : statusType === 'Failed'
              ? [
                  {
                    type: 'Failed',
                    status: 'True',
                    reason: 'BackoffLimitExceeded',
                    message: 'Job has reached the specified backoff limit',
                    lastTransitionTime: generateTimestamp(
                      randomInt(0, createdDaysAgo),
                    ),
                  },
                ]
              : [],
      },
    });
  }

  return jobs;
}

const MOCK_JOBS: Job[] = generateMockJobs(100);

export function getMockJobList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): JobListResult {
  let filteredJobs = [...MOCK_JOBS];

  // 命名空间筛选
  if (params.namespace) {
    filteredJobs = filteredJobs.filter(
      (job) => job.metadata.namespace === params.namespace,
    );
  }

  const total = filteredJobs.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'batch/v1',
    kind: 'JobList',
    metadata: {},
    items: filteredJobs.slice(start, end),
    total,
  };
}

// ==================== Pod 日志 Mock 数据生成 ====================

/**
 * 生成 Mock Pod 日志
 */
export function getMockPodLogs(params: {
  clusterId: string;
  container?: string;
  name: string;
  namespace: string;
  tailLines?: number;
  timestamps?: boolean;
}): string {
  const { container, timestamps = false, tailLines = 100 } = params;

  const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG'];

  const logMessages = [
    'Application started successfully',
    'Database connection established',
    'Processing request from client',
    'Cache hit for key: user_session_12345',
    'HTTP GET /api/users - Status: 200',
    'HTTP POST /api/orders - Status: 201',
    'HTTP PUT /api/products/123 - Status: 200',
    'HTTP DELETE /api/cart/456 - Status: 204',
    'Connecting to Redis server at redis:6379',
    'Query executed successfully in 45ms',
    'Background job processing started',
    'Email notification sent to user@example.com',
    'File uploaded successfully: document.pdf',
    'User authentication successful',
    'Session expired for user: john.doe',
    'Rate limit check passed',
    'Scheduled task completed',
    'Memory usage: 512MB / 2GB',
    'CPU usage: 25%',
    'Disk I/O: Read 100KB, Write 50KB',
    'WebSocket connection established',
    'Message queue consumed: 10 items',
    'Cache expired for key: product_list',
    'Middleware processing time: 12ms',
    'Request validation passed',
    'Response compressed: 2.5MB -> 500KB',
    'Health check endpoint called',
    'Graceful shutdown initiated',
    'All connections closed',
    'Application stopped',
  ];

  const errorMessages = [
    'Failed to connect to database: Connection timeout',
    'Invalid request parameter: user_id is required',
    'Authentication failed: Invalid credentials',
    'Permission denied: User does not have access',
    'Resource not found: /api/products/999',
    'Internal server error: Null pointer exception',
    'Failed to send notification: SMTP connection failed',
    'Rate limit exceeded for IP: 192.168.1.100',
    'Database query timeout after 30s',
    'Failed to parse JSON request body',
  ];

  const logs: string[] = [];
  const containerName = container || 'main-container';
  const now = new Date();

  for (let i = 0; i < tailLines; i++) {
    const timestamp = new Date(now.getTime() - (tailLines - i) * 1000);
    const logType = randomElement(logTypes);
    const isError = logType === 'ERROR' || Math.random() < 0.05;
    const message = isError
      ? randomElement(errorMessages)
      : randomElement(logMessages);

    let logLine = '';

    if (timestamps) {
      logLine += `${timestamp.toISOString()} `;
    }

    logLine += `[${logType}] [${containerName}] ${message}`;

    // 添加一些随机的详细信息
    if (Math.random() < 0.3) {
      logLine += ` | request_id=${Math.random().toString(36).slice(7)}`;
    }

    if (Math.random() < 0.2) {
      logLine += ` | trace_id=${Math.random().toString(36).slice(2, 15)}`;
    }

    logs.push(logLine);
  }

  return logs.join('\n');
}
