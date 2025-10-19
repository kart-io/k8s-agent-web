/**
 * Kubernetes Mock 数据生成
 */

import type {
  Cluster,
  ClusterListResult,
  ClusterRole,
  ClusterRoleBinding,
  ClusterRoleBindingListResult,
  ClusterRoleListResult,
  ConfigMap,
  ConfigMapListResult,
  CronJob,
  CronJobListResult,
  DaemonSet,
  DaemonSetListResult,
  Deployment,
  DeploymentListResult,
  Endpoints,
  EndpointSlice,
  EndpointSliceListResult,
  EndpointsListResult,
  EventListResult,
  HorizontalPodAutoscaler,
  HorizontalPodAutoscalerListResult,
  Ingress,
  IngressListResult,
  Job,
  JobListResult,
  K8sEvent,
  LimitRange,
  LimitRangeListResult,
  Namespace,
  NamespaceListResult,
  NetworkPolicy,
  NetworkPolicyListResult,
  Node,
  NodeListResult,
  PersistentVolume,
  PersistentVolumeClaim,
  PersistentVolumeClaimListResult,
  PersistentVolumeListResult,
  Pod,
  PodListResult,
  PriorityClass,
  PriorityClassListResult,
  ReplicaSet,
  ReplicaSetListResult,
  ResourceQuota,
  ResourceQuotaListResult,
  Role,
  RoleBinding,
  RoleBindingListResult,
  RoleListResult,
  Secret,
  SecretListResult,
  Service,
  ServiceAccount,
  ServiceAccountListResult,
  ServiceListResult,
  StatefulSet,
  StatefulSetListResult,
  StorageClass,
  StorageClassListResult,
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
      endpoint: `https://k8s-${env.toLowerCase()}-${regionId}.example.com:6443`,
      version: randomElement(CLUSTER_VERSIONS),
      status: randomElement(CLUSTER_STATUSES),
      region: '',
      provider: '',
      labels: null,
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
        nodeName: `node-${randomInt(1, 5)}`,
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

  // 转换为扁平化结构的 ServiceListItem[]
  const items = filteredServices.slice(start, end).map((service) => ({
    name: service.metadata.name,
    namespace: service.metadata.namespace,
    type: service.spec.type,
    clusterIP: service.spec.clusterIP,
    ports: service.spec.ports,
    createdAt: service.metadata.creationTimestamp,
    labels: service.metadata.labels,
  }));

  return {
    apiVersion: 'v1',
    kind: 'ServiceList',
    metadata: {},
    items: items as any, // 类型转换因为 ServiceListResult 仍然期望 Service[]
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

// ==================== Node 管理操作 Mock ====================

/**
 * Mock 封锁节点 (Cordon)
 */
export function mockCordonNode(
  clusterId: string,
  nodeName: string,
): Promise<Node> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const node = MOCK_NODES.find((n) => n.metadata.name === nodeName);
      if (node) {
        // 标记为不可调度
        node.spec = node.spec || {};
        node.spec.unschedulable = true;
      }
      resolve(node!);
    }, 500);
  });
}

/**
 * Mock 解除封锁节点 (Uncordon)
 */
export function mockUncordonNode(
  clusterId: string,
  nodeName: string,
): Promise<Node> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const node = MOCK_NODES.find((n) => n.metadata.name === nodeName);
      if (node && node.spec) {
        // 恢复可调度状态
        node.spec.unschedulable = false;
      }
      resolve(node!);
    }, 500);
  });
}

/**
 * Mock 驱逐节点 (Drain)
 */
export function mockDrainNode(
  clusterId: string,
  nodeName: string,
  options?: {
    deleteLocalData?: boolean;
    force?: boolean;
    ignoreDaemonsets?: boolean;
    timeout?: number;
  },
): Promise<{ message: string; success: boolean }> {
  return new Promise((resolve) => {
    // 模拟驱逐操作需要一些时间
    setTimeout(() => {
      const node = MOCK_NODES.find((n) => n.metadata.name === nodeName);
      if (node) {
        // 自动封锁节点
        node.spec = node.spec || {};
        node.spec.unschedulable = true;

        resolve({
          success: true,
          message: `Successfully drained node ${nodeName}. All pods have been evicted.`,
        });
      } else {
        resolve({
          success: false,
          message: `Node ${nodeName} not found.`,
        });
      }
    }, 2000); // 驱逐操作模拟 2 秒
  });
}

/**
 * Mock 更新节点标签
 */
export function mockUpdateNodeLabels(
  clusterId: string,
  nodeName: string,
  labels: Record<string, string>,
): Promise<Node> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const node = MOCK_NODES.find((n) => n.metadata.name === nodeName);
      if (node) {
        // 更新标签，保留系统标签
        const systemLabels = {
          'kubernetes.io/role': node.metadata.labels?.['kubernetes.io/role'],
          'kubernetes.io/hostname':
            node.metadata.labels?.['kubernetes.io/hostname'],
          'node-role.kubernetes.io/':
            node.metadata.labels?.['node-role.kubernetes.io/'],
        };

        node.metadata.labels = {
          ...systemLabels,
          ...labels,
        };
      }
      resolve(node!);
    }, 500);
  });
}

/**
 * Mock 更新节点污点
 */
export function mockUpdateNodeTaints(
  clusterId: string,
  nodeName: string,
  taints: Array<{
    effect: 'NoExecute' | 'NoSchedule' | 'PreferNoSchedule';
    key: string;
    value?: string;
  }>,
): Promise<Node> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const node = MOCK_NODES.find((n) => n.metadata.name === nodeName);
      if (node) {
        // 更新污点
        node.spec = node.spec || {};
        node.spec.taints = taints;
      }
      resolve(node!);
    }, 500);
  });
}

// ==================== PersistentVolume Mock 数据生成 ====================

const PV_PHASES = [
  'Pending',
  'Available',
  'Bound',
  'Released',
  'Failed',
] as const;
const PV_ACCESS_MODES = [
  'ReadWriteOnce',
  'ReadOnlyMany',
  'ReadWriteMany',
] as const;
const PV_RECLAIM_POLICIES = ['Retain', 'Delete'] as const;
const STORAGE_CLASSES = [
  'standard',
  'fast-ssd',
  'slow-hdd',
  'nfs-storage',
  'local-storage',
];
const STORAGE_BACKENDS = ['nfs', 'hostPath', 'csi'] as const;

const STORAGE_CAPACITIES = [
  '1Gi',
  '5Gi',
  '10Gi',
  '20Gi',
  '50Gi',
  '100Gi',
  '200Gi',
  '500Gi',
  '1Ti',
];

function generateMockPersistentVolumes(count: number): PersistentVolume[] {
  const pvs: PersistentVolume[] = [];

  for (let i = 1; i <= count; i++) {
    const phase = randomElement(PV_PHASES);
    const capacity = randomElement(STORAGE_CAPACITIES);
    const storageClass = randomElement(STORAGE_CLASSES);
    const accessMode = randomElement(PV_ACCESS_MODES);
    const reclaimPolicy = randomElement(PV_RECLAIM_POLICIES);
    const backend = randomElement(STORAGE_BACKENDS);
    const createdDaysAgo = randomInt(1, 180);

    const pvName = `pv-${storageClass}-${i.toString().padStart(4, '0')}`;

    // 构建存储后端配置
    const backendConfig: any = {};
    switch (backend) {
      case 'csi': {
        backendConfig.csi = {
          driver: 'csi.example.com',
          volumeHandle: `volume-${Math.random().toString(36).slice(2, 12)}`,
          readOnly: false,
          fsType: 'ext4',
          volumeAttributes: {
            storage: capacity,
          },
        };

        break;
      }
      case 'hostPath': {
        backendConfig.hostPath = {
          path: `/mnt/data/pv-${i}`,
          type: 'DirectoryOrCreate',
        };

        break;
      }
      case 'nfs': {
        backendConfig.nfs = {
          server: `nfs-server-${randomInt(1, 3)}.example.com`,
          path: `/exports/pv-${i}`,
          readOnly: false,
        };

        break;
      }
      // No default
    }

    // 如果是 Bound 状态，添加 claimRef
    const claimRef =
      phase === 'Bound'
        ? {
            kind: 'PersistentVolumeClaim',
            namespace: randomElement(NAMESPACES),
            name: `pvc-${storageClass}-${randomInt(1, 50)}`,
            uid: `pvc-uid-${Math.random().toString(36).slice(2, 12)}`,
            apiVersion: 'v1',
            resourceVersion: `${randomInt(1000, 9999)}`,
          }
        : undefined;

    pvs.push({
      apiVersion: 'v1',
      kind: 'PersistentVolume',
      metadata: {
        name: pvName,
        uid: `pv-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          'storage.k8s.io/type': backend,
          environment: randomElement(['production', 'staging', 'development']),
        },
        annotations: {
          'pv.kubernetes.io/provisioned-by':
            backend === 'csi' ? 'csi.example.com' : 'manual',
        },
      },
      spec: {
        capacity: {
          storage: capacity,
        },
        accessModes: [accessMode],
        persistentVolumeReclaimPolicy: reclaimPolicy,
        storageClassName: storageClass,
        volumeMode: 'Filesystem',
        mountOptions: backend === 'nfs' ? ['hard', 'nfsvers=4.1'] : undefined,
        claimRef,
        ...backendConfig,
      },
      status: {
        phase,
        message: phase === 'Failed' ? 'Failed to provision volume' : undefined,
        reason: phase === 'Failed' ? 'ProvisioningFailed' : undefined,
      },
    });
  }

  return pvs;
}

const MOCK_PVS: PersistentVolume[] = generateMockPersistentVolumes(150);

export function getMockPVList(params: {
  accessMode?: string;
  clusterId: string;
  page?: number;
  pageSize?: number;
  status?: string;
  storageClass?: string;
}): PersistentVolumeListResult {
  let filteredPVs = [...MOCK_PVS];

  // 存储类筛选
  if (params.storageClass) {
    filteredPVs = filteredPVs.filter(
      (pv) => pv.spec.storageClassName === params.storageClass,
    );
  }

  // 状态筛选
  if (params.status) {
    filteredPVs = filteredPVs.filter(
      (pv) => pv.status?.phase === params.status,
    );
  }

  // 访问模式筛选
  if (params.accessMode) {
    filteredPVs = filteredPVs.filter((pv) =>
      pv.spec.accessModes.includes(params.accessMode as any),
    );
  }

  const total = filteredPVs.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'PersistentVolumeList',
    metadata: {},
    items: filteredPVs.slice(start, end),
    total,
  };
}

// ==================== PersistentVolumeClaim Mock 数据生成 ====================

const PVC_PHASES = ['Pending', 'Bound', 'Lost'] as const;
const PVC_STORAGE_REQUESTS = ['1Gi', '5Gi', '10Gi', '20Gi', '50Gi', '100Gi'];

function generateMockPersistentVolumeClaims(
  count: number,
): PersistentVolumeClaim[] {
  const pvcs: PersistentVolumeClaim[] = [];

  for (let i = 1; i <= count; i++) {
    const phase = randomElement(PVC_PHASES);
    const storageClass = randomElement(STORAGE_CLASSES);
    const namespace = randomElement(NAMESPACES);
    const accessMode = randomElement(PV_ACCESS_MODES);
    const requestedStorage = randomElement(PVC_STORAGE_REQUESTS);
    const createdDaysAgo = randomInt(1, 90);

    const pvcName = `pvc-${storageClass}-${i.toString().padStart(3, '0')}`;

    // 如果是 Bound 状态，找到匹配的 PV（或创建引用）
    let volumeName: string | undefined;
    let actualCapacity: undefined | { storage: string };

    if (phase === 'Bound') {
      // 尝试找到一个 Bound 状态且匹配存储类的 PV
      const matchingPV = MOCK_PVS.find(
        (pv) =>
          pv.status?.phase === 'Bound' &&
          pv.spec.storageClassName === storageClass &&
          pv.spec.claimRef?.name === pvcName &&
          pv.spec.claimRef?.namespace === namespace,
      );

      if (matchingPV) {
        volumeName = matchingPV.metadata.name;
        actualCapacity = matchingPV.spec.capacity;
      } else {
        // 创建一个虚拟的 PV 引用
        volumeName = `pv-${storageClass}-${i.toString().padStart(4, '0')}`;
        actualCapacity = { storage: requestedStorage };
      }
    }

    pvcs.push({
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: {
        name: pvcName,
        namespace,
        uid: `pvc-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          app: randomElement(APP_NAMES),
          environment: randomElement(['production', 'staging', 'development']),
        },
        annotations: {
          'volume.beta.kubernetes.io/storage-provisioner':
            storageClass === 'nfs-storage'
              ? 'nfs.csi.k8s.io'
              : 'kubernetes.io/csi',
        },
      },
      spec: {
        accessModes: [accessMode],
        resources: {
          requests: {
            storage: requestedStorage,
          },
        },
        storageClassName: storageClass,
        volumeMode: 'Filesystem',
        volumeName,
      },
      status: {
        phase,
        accessModes: phase === 'Bound' ? [accessMode] : undefined,
        capacity: actualCapacity,
        conditions:
          phase === 'Pending'
            ? [
                {
                  type: 'Resizing',
                  status: 'False',
                  lastTransitionTime: generateTimestamp(
                    randomInt(0, createdDaysAgo),
                  ),
                },
              ]
            : undefined,
      },
    });
  }

  return pvcs;
}

const MOCK_PVCS: PersistentVolumeClaim[] =
  generateMockPersistentVolumeClaims(200);

export function getMockPVCList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  storageClass?: string;
}): PersistentVolumeClaimListResult {
  let filteredPVCs = [...MOCK_PVCS];

  // 命名空间筛选
  if (params.namespace) {
    filteredPVCs = filteredPVCs.filter(
      (pvc) => pvc.metadata.namespace === params.namespace,
    );
  }

  // 存储类筛选
  if (params.storageClass) {
    filteredPVCs = filteredPVCs.filter(
      (pvc) => pvc.spec.storageClassName === params.storageClass,
    );
  }

  // 状态筛选
  if (params.status) {
    filteredPVCs = filteredPVCs.filter(
      (pvc) => pvc.status?.phase === params.status,
    );
  }

  const total = filteredPVCs.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaimList',
    metadata: {},
    items: filteredPVCs.slice(start, end),
    total,
  };
}

// ==================== StorageClass Mock 数据生成 ====================

const STORAGE_PROVISIONERS = [
  'kubernetes.io/aws-ebs',
  'kubernetes.io/gce-pd',
  'kubernetes.io/azure-disk',
  'nfs.csi.k8s.io',
  'csi.example.com',
  'kubernetes.io/no-provisioner', // 本地存储
];

function generateMockStorageClasses(): StorageClass[] {
  const storageClasses: StorageClass[] = [];

  STORAGE_CLASSES.forEach((scName, index) => {
    const provisioner = randomElement(STORAGE_PROVISIONERS);
    const reclaimPolicy: 'Delete' | 'Retain' = randomElement([
      'Delete',
      'Retain',
    ]);
    const volumeBindingMode =
      provisioner === 'kubernetes.io/no-provisioner'
        ? 'WaitForFirstConsumer'
        : randomElement(['Immediate', 'WaitForFirstConsumer']);
    const allowVolumeExpansion = Math.random() > 0.3; // 70% 支持扩容
    const isDefault = index === 0; // 第一个为默认存储类

    // 根据 provisioner 类型生成参数
    let parameters: Record<string, string> = {};
    switch (provisioner) {
      case 'csi.example.com': {
        parameters = {
          type: 'ssd',
          replication: '3',
          fsType: 'ext4',
        };

        break;
      }
      case 'kubernetes.io/aws-ebs': {
        parameters = {
          type: randomElement(['gp3', 'gp2', 'io1']),
          iopsPerGB: '10',
          encrypted: 'true',
          fsType: 'ext4',
        };

        break;
      }
      case 'kubernetes.io/azure-disk': {
        parameters = {
          storageaccounttype: randomElement([
            'Standard_LRS',
            'Premium_LRS',
            'StandardSSD_LRS',
          ]),
          kind: 'Managed',
          cachingMode: 'ReadOnly',
        };

        break;
      }
      case 'kubernetes.io/gce-pd': {
        parameters = {
          type: randomElement(['pd-standard', 'pd-ssd', 'pd-balanced']),
          'replication-type': 'none',
          fsType: 'ext4',
        };

        break;
      }
      case 'nfs.csi.k8s.io': {
        parameters = {
          server: 'nfs-server.example.com',
          share: '/exports',
          mountOptions: 'nfsvers=4.1,hard',
        };

        break;
      }
      // No default
    }

    const mountOptions =
      provisioner === 'nfs.csi.k8s.io'
        ? ['hard', 'nfsvers=4.1', 'noatime']
        : undefined;

    storageClasses.push({
      apiVersion: 'storage.k8s.io/v1',
      kind: 'StorageClass',
      metadata: {
        name: scName,
        uid: `sc-${(index + 1).toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(randomInt(30, 365)),
        labels: {
          'storage.k8s.io/type': provisioner.includes('csi') ? 'csi' : 'native',
        },
        annotations: isDefault
          ? {
              'storageclass.kubernetes.io/is-default-class': 'true',
            }
          : undefined,
      },
      provisioner,
      parameters,
      reclaimPolicy,
      mountOptions,
      volumeBindingMode,
      allowVolumeExpansion,
      allowedTopologies:
        provisioner === 'kubernetes.io/no-provisioner'
          ? [
              {
                matchLabelExpressions: [
                  {
                    key: 'kubernetes.io/hostname',
                    values: ['node-1', 'node-2', 'node-3'],
                  },
                ],
              },
            ]
          : undefined,
    });
  });

  return storageClasses;
}

const MOCK_STORAGE_CLASSES: StorageClass[] = generateMockStorageClasses();

export function getMockStorageClassList(params: {
  clusterId: string;
  page?: number;
  pageSize?: number;
  provisioner?: string;
  reclaimPolicy?: string;
}): StorageClassListResult {
  let filteredSCs = [...MOCK_STORAGE_CLASSES];

  // Provisioner 筛选
  if (params.provisioner) {
    filteredSCs = filteredSCs.filter(
      (sc) => sc.provisioner === params.provisioner,
    );
  }

  // 回收策略筛选
  if (params.reclaimPolicy) {
    filteredSCs = filteredSCs.filter(
      (sc) => sc.reclaimPolicy === params.reclaimPolicy,
    );
  }

  const total = filteredSCs.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'storage.k8s.io/v1',
    kind: 'StorageClassList',
    metadata: {},
    items: filteredSCs.slice(start, end),
    total,
  };
}

// ==================== 存储资源删除操作 Mock ====================

/**
 * 删除结果接口
 */
export interface DeleteResult {
  success: boolean;
  message: string;
  warnings?: string[];
}

/**
 * 删除前检查 PV
 */
export function checkPVBeforeDelete(
  clusterId: string,
  pvName: string,
): { canDelete: boolean; warnings: string[] } {
  const pv = MOCK_PVS.find((p) => p.metadata.name === pvName);

  if (!pv) {
    return { canDelete: false, warnings: ['PV 不存在'] };
  }

  const warnings: string[] = [];

  // 检查是否已绑定 PVC
  if (pv.status?.phase === 'Bound' && pv.spec.claimRef) {
    warnings.push(
      `此 PV 已绑定到 PVC: ${pv.spec.claimRef.namespace}/${pv.spec.claimRef.name}`,
      '删除 PV 可能导致 PVC 无法访问数据',
    );
  }

  // 检查回收策略
  if (pv.spec.persistentVolumeReclaimPolicy === 'Retain') {
    warnings.push(
      '回收策略为 Retain，底层存储资源不会被自动删除',
      '需要手动清理底层存储资源',
    );
  } else if (pv.spec.persistentVolumeReclaimPolicy === 'Delete') {
    warnings.push(
      '回收策略为 Delete，底层存储资源将被自动删除',
      '数据将永久丢失，请确保已备份',
    );
  }

  return { canDelete: true, warnings };
}

/**
 * Mock 删除 PV
 */
export function mockDeletePV(
  clusterId: string,
  pvName: string,
): Promise<DeleteResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = MOCK_PVS.findIndex((pv) => pv.metadata.name === pvName);

      if (index === -1) {
        resolve({
          success: false,
          message: `PV ${pvName} 不存在`,
        });
        return;
      }

      const pv = MOCK_PVS[index];

      // 检查是否可以删除
      if (pv.status?.phase === 'Bound') {
        resolve({
          success: false,
          message: `PV ${pvName} 已绑定到 PVC，无法删除`,
          warnings: [
            `已绑定到 PVC: ${pv.spec.claimRef?.namespace}/${pv.spec.claimRef?.name}`,
            '请先删除或解绑 PVC',
          ],
        });
        return;
      }

      // 删除 PV
      MOCK_PVS.splice(index, 1);

      resolve({
        success: true,
        message: `PV ${pvName} 已成功删除`,
      });
    }, 800);
  });
}

/**
 * 删除前检查 PVC
 */
export function checkPVCBeforeDelete(
  clusterId: string,
  namespace: string,
  pvcName: string,
): { canDelete: boolean; warnings: string[] } {
  const pvc = MOCK_PVCS.find(
    (p) => p.metadata.name === pvcName && p.metadata.namespace === namespace,
  );

  if (!pvc) {
    return { canDelete: false, warnings: ['PVC 不存在'] };
  }

  const warnings: string[] = [];

  // 检查是否正在被 Pod 使用（这里简化处理，实际应该查询 Pod）
  if (pvc.status?.phase === 'Bound') {
    warnings.push(
      '此 PVC 可能正在被 Pod 使用',
      '删除 PVC 将导致使用该存储的 Pod 无法访问数据',
      '建议先检查并停止使用该 PVC 的 Pod',
    );
  }

  // 检查绑定的 PV
  if (pvc.spec.volumeName) {
    const boundPV = MOCK_PVS.find(
      (pv) => pv.metadata.name === pvc.spec.volumeName,
    );
    if (boundPV) {
      warnings.push(`此 PVC 已绑定到 PV: ${pvc.spec.volumeName}`);
      if (boundPV.spec.persistentVolumeReclaimPolicy === 'Delete') {
        warnings.push(
          'PV 的回收策略为 Delete，删除 PVC 将同时删除 PV',
          '底层存储资源和数据将永久丢失',
        );
      } else if (boundPV.spec.persistentVolumeReclaimPolicy === 'Retain') {
        warnings.push(
          'PV 的回收策略为 Retain，PV 将变为 Released 状态',
          '需要手动清理或重新绑定 PV',
        );
      }
    }
  }

  return { canDelete: true, warnings };
}

/**
 * Mock 删除 PVC
 */
export function mockDeletePVC(
  clusterId: string,
  namespace: string,
  pvcName: string,
): Promise<DeleteResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = MOCK_PVCS.findIndex(
        (pvc) =>
          pvc.metadata.name === pvcName && pvc.metadata.namespace === namespace,
      );

      if (index === -1) {
        resolve({
          success: false,
          message: `PVC ${namespace}/${pvcName} 不存在`,
        });
        return;
      }

      const pvc = MOCK_PVCS[index];

      // 删除 PVC
      MOCK_PVCS.splice(index, 1);

      // 如果 PVC 绑定了 PV，根据 PV 的回收策略处理
      if (pvc.spec.volumeName) {
        const pvIndex = MOCK_PVS.findIndex(
          (pv) => pv.metadata.name === pvc.spec.volumeName,
        );

        if (pvIndex !== -1) {
          const pv = MOCK_PVS[pvIndex];

          if (pv.spec.persistentVolumeReclaimPolicy === 'Delete') {
            // 删除 PV
            MOCK_PVS.splice(pvIndex, 1);
          } else if (pv.spec.persistentVolumeReclaimPolicy === 'Retain') {
            // 设置 PV 为 Released 状态
            pv.status = pv.status || {};
            pv.status.phase = 'Released';
            pv.spec.claimRef = undefined;
          }
        }
      }

      resolve({
        success: true,
        message: `PVC ${namespace}/${pvcName} 已成功删除`,
      });
    }, 800);
  });
}

/**
 * 删除前检查 StorageClass
 */
export function checkStorageClassBeforeDelete(
  clusterId: string,
  scName: string,
): { canDelete: boolean; warnings: string[] } {
  const sc = MOCK_STORAGE_CLASSES.find((s) => s.metadata.name === scName);

  if (!sc) {
    return { canDelete: false, warnings: ['StorageClass 不存在'] };
  }

  const warnings: string[] = [];

  // 检查是否为默认存储类
  const isDefault =
    sc.metadata.annotations?.['storageclass.kubernetes.io/is-default-class'] ===
    'true';
  if (isDefault) {
    warnings.push(
      '这是默认存储类',
      '删除后，新的 PVC 可能无法自动分配存储类',
      '建议先设置其他存储类为默认',
    );
  }

  // 检查是否有 PV 使用此存储类
  const pvCount = MOCK_PVS.filter(
    (pv) => pv.spec.storageClassName === scName,
  ).length;
  if (pvCount > 0) {
    warnings.push(
      `当前有 ${pvCount} 个 PV 使用此存储类`,
      '删除存储类不会影响现有 PV',
    );
  }

  // 检查是否有 PVC 使用此存储类
  const pvcCount = MOCK_PVCS.filter(
    (pvc) => pvc.spec.storageClassName === scName,
  ).length;
  if (pvcCount > 0) {
    warnings.push(
      `当前有 ${pvcCount} 个 PVC 使用此存储类`,
      '删除存储类不会影响现有 PVC',
      '但无法再创建使用此存储类的新 PVC',
    );
  }

  return { canDelete: true, warnings };
}

/**
 * Mock 删除 StorageClass
 */
export function mockDeleteStorageClass(
  clusterId: string,
  scName: string,
): Promise<DeleteResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = MOCK_STORAGE_CLASSES.findIndex(
        (sc) => sc.metadata.name === scName,
      );

      if (index === -1) {
        resolve({
          success: false,
          message: `StorageClass ${scName} 不存在`,
        });
        return;
      }

      // 删除 StorageClass
      MOCK_STORAGE_CLASSES.splice(index, 1);

      resolve({
        success: true,
        message: `StorageClass ${scName} 已成功删除`,
      });
    }, 600);
  });
}

// ==================== Ingress Mock 数据生成 ====================

const INGRESS_CLASSES = ['nginx', 'traefik', 'kong', 'haproxy'];
const INGRESS_HOSTS = [
  'api.example.com',
  'app.example.com',
  'admin.example.com',
  'dashboard.example.com',
  'auth.example.com',
  'blog.example.com',
  'shop.example.com',
  'docs.example.com',
];
const PATH_TYPES = ['Prefix', 'Exact', 'ImplementationSpecific'] as const;

function generateMockIngresses(count: number): Ingress[] {
  const ingresses: Ingress[] = [];

  for (let i = 1; i <= count; i++) {
    const namespace = randomElement(NAMESPACES);
    const ingressClass = randomElement(INGRESS_CLASSES);
    const host = randomElement(INGRESS_HOSTS);
    const createdDaysAgo = randomInt(1, 180);
    const hasTLS = Math.random() > 0.4; // 60% 概率使用 TLS
    const pathCount = randomInt(1, 4); // 每个 host 1-4 个路径

    const paths = [];
    for (let j = 0; j < pathCount; j++) {
      const serviceName = `${randomElement(APP_NAMES)}-service`;
      const pathType = randomElement(PATH_TYPES);
      const path =
        j === 0
          ? '/'
          : `/${randomElement(['api', 'admin', 'dashboard', 'docs'])}`;

      paths.push({
        path,
        pathType,
        backend: {
          service: {
            name: serviceName,
            port: {
              number: randomInt(3000, 9000),
            },
          },
        },
      });
    }

    const rules = [
      {
        host,
        http: {
          paths,
        },
      },
    ];

    // 可能有多个 host
    if (Math.random() > 0.7) {
      const secondHost = randomElement(INGRESS_HOSTS.filter((h) => h !== host));
      rules.push({
        host: secondHost,
        http: {
          paths: [
            {
              path: '/',
              pathType: 'Prefix' as const,
              backend: {
                service: {
                  name: `${randomElement(APP_NAMES)}-service`,
                  port: {
                    number: randomInt(3000, 9000),
                  },
                },
              },
            },
          ],
        },
      });
    }

    const tls = hasTLS
      ? [
          {
            hosts: rules.map((r) => r.host!),
            secretName: `${host.split('.')[0]}-tls`,
          },
        ]
      : undefined;

    // 生成 LoadBalancer IP (如果有)
    const hasLoadBalancerIP = Math.random() > 0.5;
    const loadBalancerIP = hasLoadBalancerIP
      ? `${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`
      : undefined;

    ingresses.push({
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: `${host.split('.')[0]}-ingress-${i}`,
        namespace,
        uid: `ing-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          app: host.split('.')[0],
          environment: randomElement(['production', 'staging', 'development']),
        },
        annotations: {
          'kubernetes.io/ingress.class': ingressClass,
          'nginx.ingress.kubernetes.io/rewrite-target': '/',
          'cert-manager.io/cluster-issuer': hasTLS
            ? 'letsencrypt-prod'
            : undefined,
        },
      },
      spec: {
        ingressClassName: ingressClass,
        tls,
        rules,
      },
      status: loadBalancerIP
        ? {
            loadBalancer: {
              ingress: [
                {
                  ip: loadBalancerIP,
                },
              ],
            },
          }
        : undefined,
    });
  }

  return ingresses;
}

const MOCK_INGRESSES: Ingress[] = generateMockIngresses(80);

export function getMockIngressList(params: {
  clusterId: string;
  ingressClass?: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): IngressListResult {
  let filteredIngresses = [...MOCK_INGRESSES];

  // 命名空间筛选
  if (params.namespace) {
    filteredIngresses = filteredIngresses.filter(
      (ing) => ing.metadata.namespace === params.namespace,
    );
  }

  // Ingress Class 筛选
  if (params.ingressClass) {
    filteredIngresses = filteredIngresses.filter(
      (ing) => ing.spec.ingressClassName === params.ingressClass,
    );
  }

  const total = filteredIngresses.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'IngressList',
    metadata: {},
    items: filteredIngresses.slice(start, end),
    total,
  };
}

/**
 * 删除前检查 Ingress
 */
export function checkIngressBeforeDelete(
  clusterId: string,
  namespace: string,
  ingressName: string,
): { canDelete: boolean; warnings: string[] } {
  const ingress = MOCK_INGRESSES.find(
    (ing) =>
      ing.metadata.name === ingressName && ing.metadata.namespace === namespace,
  );

  if (!ingress) {
    return { canDelete: false, warnings: ['Ingress 不存在'] };
  }

  const warnings: string[] = [];

  // 检查是否有 TLS 配置
  if (ingress.spec.tls && ingress.spec.tls.length > 0) {
    warnings.push('此 Ingress 配置了 TLS', '删除后，HTTPS 访问将不可用');
  }

  // 检查规则数量
  const ruleCount = ingress.spec.rules?.length || 0;
  if (ruleCount > 0) {
    warnings.push(
      `此 Ingress 包含 ${ruleCount} 条路由规则`,
      '删除后，相关域名的流量路由将失效',
    );
  }

  // 检查是否有 LoadBalancer IP
  if (ingress.status?.loadBalancer?.ingress) {
    warnings.push(
      '此 Ingress 已分配 LoadBalancer IP',
      '删除后，外部访问入口将失效',
    );
  }

  return { canDelete: true, warnings };
}

/**
 * Mock 删除 Ingress
 */
export function mockDeleteIngress(
  clusterId: string,
  namespace: string,
  ingressName: string,
): Promise<DeleteResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = MOCK_INGRESSES.findIndex(
        (ing) =>
          ing.metadata.name === ingressName &&
          ing.metadata.namespace === namespace,
      );

      if (index === -1) {
        resolve({
          success: false,
          message: `Ingress ${namespace}/${ingressName} 不存在`,
        });
        return;
      }

      // 删除 Ingress
      MOCK_INGRESSES.splice(index, 1);

      resolve({
        success: true,
        message: `Ingress ${namespace}/${ingressName} 已成功删除`,
      });
    }, 600);
  });
}

// ==================== Event Mock 数据生成 ====================

const EVENT_TYPES = ['Normal', 'Warning'] as const;

// 常见的 K8s 事件原因
const EVENT_REASONS = {
  Pod: [
    'Scheduled',
    'Pulling',
    'Pulled',
    'Created',
    'Started',
    'Killing',
    'FailedScheduling',
    'FailedMount',
    'BackOff',
    'Unhealthy',
    'Killing',
  ],
  Deployment: ['ScalingReplicaSet', 'SuccessfulCreate', 'FailedCreate'],
  Service: [
    'EnsuringLoadBalancer',
    'EnsuredLoadBalancer',
    'DeletingLoadBalancer',
    'DeletedLoadBalancer',
  ],
  Node: [
    'NodeReady',
    'NodeNotReady',
    'RegisteredNode',
    'RemovingNode',
    'DeletingNode',
    'DeletingAllPods',
  ],
  PersistentVolumeClaim: [
    'ProvisioningSucceeded',
    'ProvisioningFailed',
    'WaitForFirstConsumer',
    'ExternalProvisioning',
  ],
  Ingress: ['Sync', 'CREATE', 'UPDATE', 'DELETE'],
};

const EVENT_MESSAGES = {
  Normal: [
    'Successfully assigned {namespace}/{name} to {node}',
    'Pulling image "{image}"',
    'Successfully pulled image "{image}" in {time}',
    'Created container {container}',
    'Started container {container}',
    'Scaled up replica set {name} to {count}',
    'Scaled down replica set {name} to {count}',
    'Ensured load balancer',
    'Successfully provisioned volume',
  ],
  Warning: [
    'Failed to pull image "{image}": rpc error: code = Unknown',
    'Back-off restarting failed container',
    'Error: ImagePullBackOff',
    '0/5 nodes are available: 5 Insufficient cpu',
    'Unable to attach or mount volumes: timeout expired',
    'Liveness probe failed: HTTP probe failed',
    'Readiness probe failed: dial tcp {ip}:{port}: connect: connection refused',
    'Failed to create pod sandbox: rpc error',
  ],
};

const RESOURCE_KINDS = [
  'Pod',
  'Deployment',
  'Service',
  'Node',
  'PersistentVolumeClaim',
  'Ingress',
];

function generateMockEvents(count: number): K8sEvent[] {
  const events: K8sEvent[] = [];

  for (let i = 1; i <= count; i++) {
    const kind = randomElement(RESOURCE_KINDS);
    const namespace = randomElement(NAMESPACES);
    const eventType = Math.random() > 0.7 ? 'Warning' : 'Normal'; // 70% Normal, 30% Warning
    const daysAgo = randomInt(0, 7);
    const hoursAgo = randomInt(0, 23);
    const minutesAgo = randomInt(0, 59);

    // 生成时间戳（从现在往前推）
    const now = new Date();
    const eventDate = new Date(
      now.getTime() -
        daysAgo * 24 * 60 * 60 * 1000 -
        hoursAgo * 60 * 60 * 1000 -
        minutesAgo * 60 * 1000,
    );
    const firstTimestamp = eventDate.toISOString();

    // lastTimestamp 可能与 firstTimestamp 相同，或者稍晚一些
    const lastEventDate = new Date(
      eventDate.getTime() + randomInt(0, 3600) * 1000,
    );
    const lastTimestamp = lastEventDate.toISOString();

    const count_value =
      eventType === 'Warning' ? randomInt(1, 20) : randomInt(1, 5);

    // 根据资源类型选择事件原因
    const reasons = EVENT_REASONS[kind as keyof typeof EVENT_REASONS] || [
      'Unknown',
    ];
    const reason = randomElement(reasons);

    // 根据事件类型选择消息模板
    const messageTemplates = EVENT_MESSAGES[eventType];
    let message = randomElement(messageTemplates);

    // 替换消息模板中的占位符
    message = message
      .replace('{namespace}', namespace)
      .replace('{name}', `${randomElement(APP_NAMES)}-${randomInt(1000, 9999)}`)
      .replace('{node}', `node-${randomInt(1, 10)}`)
      .replace('{image}', randomElement(POD_IMAGES))
      .replace('{container}', randomElement(APP_NAMES))
      .replace('{time}', `${randomInt(1, 60)}s`)
      .replace('{count}', String(randomInt(1, 10)))
      .replace('{ip}', `10.244.${randomInt(0, 255)}.${randomInt(1, 254)}`)
      .replace('{port}', String(randomInt(3000, 9000)));

    // 生成 involvedObject（关联的资源对象）
    const involvedObjectName =
      kind === 'Node'
        ? `node-${randomInt(1, 10)}`
        : `${randomElement(APP_NAMES)}-${kind.toLowerCase()}-${randomInt(1000, 9999)}`;

    events.push({
      apiVersion: 'v1',
      kind: 'Event',
      metadata: {
        name: `event-${i.toString().padStart(6, '0')}`,
        namespace: kind === 'Node' ? undefined : namespace,
        uid: `event-${i.toString().padStart(6, '0')}`,
        creationTimestamp: firstTimestamp,
      },
      involvedObject: {
        apiVersion:
          kind === 'Pod' ||
          kind === 'Service' ||
          kind === 'PersistentVolumeClaim'
            ? 'v1'
            : kind === 'Deployment'
              ? 'apps/v1'
              : kind === 'Ingress'
                ? 'networking.k8s.io/v1'
                : 'v1',
        kind,
        name: involvedObjectName,
        namespace: kind === 'Node' ? undefined : namespace,
        uid: `${kind.toLowerCase()}-${randomInt(100_000, 999_999)}`,
      },
      reason,
      message,
      source: {
        component: randomElement([
          'kubelet',
          'scheduler',
          'controller-manager',
          'default-scheduler',
          'deployment-controller',
        ]),
        host: kind === 'Node' ? involvedObjectName : `node-${randomInt(1, 10)}`,
      },
      firstTimestamp,
      lastTimestamp,
      count: count_value,
      type: eventType,
      reportingComponent: randomElement([
        'kubelet',
        'default-scheduler',
        'replicaset-controller',
      ]),
      reportingInstance: `instance-${randomInt(1, 5)}`,
    });
  }

  // 按时间倒序排列（最新的在前）
  return events.sort((a, b) => {
    const timeA = new Date(a.lastTimestamp || a.firstTimestamp || 0).getTime();
    const timeB = new Date(b.lastTimestamp || b.firstTimestamp || 0).getTime();
    return timeB - timeA;
  });
}

const MOCK_EVENTS: K8sEvent[] = generateMockEvents(200);

export function getMockEventList(params: {
  clusterId: string;
  involvedObjectKind?: string;
  involvedObjectName?: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
  type?: '' | 'Normal' | 'Warning';
}): EventListResult {
  let filteredEvents = [...MOCK_EVENTS];

  // 命名空间筛选
  if (params.namespace) {
    filteredEvents = filteredEvents.filter(
      (event) => event.metadata.namespace === params.namespace,
    );
  }

  // 资源类型筛选
  if (params.involvedObjectKind) {
    filteredEvents = filteredEvents.filter(
      (event) => event.involvedObject.kind === params.involvedObjectKind,
    );
  }

  // 资源名称筛选
  if (params.involvedObjectName) {
    filteredEvents = filteredEvents.filter((event) =>
      event.involvedObject.name.includes(params.involvedObjectName),
    );
  }

  // 事件类型筛选
  if (params.type && params.type !== '') {
    filteredEvents = filteredEvents.filter(
      (event) => event.type === params.type,
    );
  }

  const total = filteredEvents.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'EventList',
    metadata: {},
    items: filteredEvents.slice(start, end),
    total,
  };
}

// ==================== RBAC Mock 数据生成 ====================

// ServiceAccount 相关常量
const SA_NAMES = [
  'default',
  'deployer',
  'monitoring',
  'logging',
  'backup',
  'ci-cd',
  'app-runner',
  'job-executor',
];

function generateMockServiceAccounts(count: number): ServiceAccount[] {
  const serviceAccounts: ServiceAccount[] = [];

  for (let i = 1; i <= count; i++) {
    const saName =
      i <= SA_NAMES.length
        ? SA_NAMES[i - 1]
        : `${randomElement(SA_NAMES)}-${i}`;
    const namespace = randomElement(NAMESPACES);
    const createdDaysAgo = randomInt(1, 365);
    const hasSecrets = Math.random() > 0.3;

    serviceAccounts.push({
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        name: saName,
        namespace,
        uid: `sa-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
      },
      secrets: hasSecrets
        ? [
            {
              name: `${saName}-token-${Math.random().toString(36).slice(2, 7)}`,
            },
          ]
        : undefined,
      automountServiceAccountToken: Math.random() > 0.5,
    });
  }

  return serviceAccounts;
}

const MOCK_SERVICE_ACCOUNTS: ServiceAccount[] =
  generateMockServiceAccounts(100);

export function getMockServiceAccountList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): ServiceAccountListResult {
  let filteredSAs = [...MOCK_SERVICE_ACCOUNTS];

  if (params.namespace) {
    filteredSAs = filteredSAs.filter(
      (sa) => sa.metadata.namespace === params.namespace,
    );
  }

  const total = filteredSAs.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'ServiceAccountList',
    metadata: {},
    items: filteredSAs.slice(start, end),
    total,
  };
}

// Role 相关常量
const VERBS = ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete'];
const RESOURCES = ['pods', 'services', 'deployments', 'configmaps', 'secrets'];
const API_GROUPS = ['', 'apps', 'batch'];

function generateMockRoles(count: number): Role[] {
  const roles: Role[] = [];

  for (let i = 1; i <= count; i++) {
    const namespace = randomElement(NAMESPACES);
    const ruleCount = randomInt(1, 3);
    const rules = [];

    for (let j = 0; j < ruleCount; j++) {
      rules.push({
        apiGroups: [randomElement(API_GROUPS)],
        resources: [randomElement(RESOURCES)],
        verbs: [randomElement(VERBS), randomElement(VERBS)].filter(
          (v, idx, arr) => arr.indexOf(v) === idx,
        ),
      });
    }

    roles.push({
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Role',
      metadata: {
        name: `role-${i}`,
        namespace,
        uid: `role-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(randomInt(1, 180)),
      },
      rules,
    });
  }

  return roles;
}

const MOCK_ROLES: Role[] = generateMockRoles(80);

export function getMockRoleList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): RoleListResult {
  let filteredRoles = [...MOCK_ROLES];

  if (params.namespace) {
    filteredRoles = filteredRoles.filter(
      (role) => role.metadata.namespace === params.namespace,
    );
  }

  const total = filteredRoles.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleList',
    metadata: {},
    items: filteredRoles.slice(start, end),
    total,
  };
}

// ClusterRole
const CLUSTER_ROLE_NAMES = [
  'cluster-admin',
  'admin',
  'edit',
  'view',
  'system:node',
];

function generateMockClusterRoles(count: number): ClusterRole[] {
  const clusterRoles: ClusterRole[] = [];

  for (let i = 1; i <= count; i++) {
    const crName =
      i <= CLUSTER_ROLE_NAMES.length
        ? CLUSTER_ROLE_NAMES[i - 1]
        : `cluster-role-${i}`;
    const ruleCount = randomInt(2, 5);
    const rules = [];

    for (let j = 0; j < ruleCount; j++) {
      rules.push({
        apiGroups: [randomElement(API_GROUPS)],
        resources: [randomElement(RESOURCES)],
        verbs: [
          randomElement(VERBS),
          randomElement(VERBS),
          randomElement(VERBS),
        ].filter((v, idx, arr) => arr.indexOf(v) === idx),
      });
    }

    clusterRoles.push({
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRole',
      metadata: {
        name: crName,
        uid: `cr-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(randomInt(30, 365)),
      },
      rules,
    });
  }

  return clusterRoles;
}

const MOCK_CLUSTER_ROLES: ClusterRole[] = generateMockClusterRoles(30);

export function getMockClusterRoleList(params: {
  clusterId: string;
  page?: number;
  pageSize?: number;
}): ClusterRoleListResult {
  const total = MOCK_CLUSTER_ROLES.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRoleList',
    metadata: {},
    items: MOCK_CLUSTER_ROLES.slice(start, end),
    total,
  };
}

// RoleBinding
const SUBJECT_TYPES = ['User', 'Group', 'ServiceAccount'] as const;
const USER_NAMES = ['alice', 'bob', 'charlie', 'david'];

function generateMockRoleBindings(count: number): RoleBinding[] {
  const roleBindings: RoleBinding[] = [];

  for (let i = 1; i <= count; i++) {
    const namespace = randomElement(NAMESPACES);
    const role = randomElement(
      MOCK_ROLES.filter((r) => r.metadata.namespace === namespace),
    );
    const roleName = role ? role.metadata.name : 'default-role';
    const subjectType = randomElement(SUBJECT_TYPES);

    const subject =
      subjectType === 'ServiceAccount'
        ? {
            kind: 'ServiceAccount' as const,
            name: randomElement(
              MOCK_SERVICE_ACCOUNTS.filter(
                (s) => s.metadata.namespace === namespace,
              ).map((s) => s.metadata.name),
            ),
            namespace,
          }
        : subjectType === 'User'
          ? {
              kind: 'User' as const,
              name: randomElement(USER_NAMES),
              apiGroup: 'rbac.authorization.k8s.io',
            }
          : {
              kind: 'Group' as const,
              name: 'developers',
              apiGroup: 'rbac.authorization.k8s.io',
            };

    roleBindings.push({
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'RoleBinding',
      metadata: {
        name: `rolebinding-${i}`,
        namespace,
        uid: `rb-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(randomInt(1, 180)),
      },
      subjects: [subject],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: roleName,
      },
    });
  }

  return roleBindings;
}

const MOCK_ROLE_BINDINGS: RoleBinding[] = generateMockRoleBindings(100);

export function getMockRoleBindingList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): RoleBindingListResult {
  let filteredRBs = [...MOCK_ROLE_BINDINGS];

  if (params.namespace) {
    filteredRBs = filteredRBs.filter(
      (rb) => rb.metadata.namespace === params.namespace,
    );
  }

  const total = filteredRBs.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBindingList',
    metadata: {},
    items: filteredRBs.slice(start, end),
    total,
  };
}

// ClusterRoleBinding
function generateMockClusterRoleBindings(count: number): ClusterRoleBinding[] {
  const clusterRoleBindings: ClusterRoleBinding[] = [];

  for (let i = 1; i <= count; i++) {
    const clusterRoleName = randomElement(
      MOCK_CLUSTER_ROLES.map((cr) => cr.metadata.name),
    );
    const subjectType = randomElement(SUBJECT_TYPES);
    const sa = randomElement(MOCK_SERVICE_ACCOUNTS);

    const subject =
      subjectType === 'ServiceAccount'
        ? {
            kind: 'ServiceAccount' as const,
            name: sa.metadata.name,
            namespace: sa.metadata.namespace,
          }
        : subjectType === 'User'
          ? {
              kind: 'User' as const,
              name: randomElement(USER_NAMES),
              apiGroup: 'rbac.authorization.k8s.io',
            }
          : {
              kind: 'Group' as const,
              name: 'admins',
              apiGroup: 'rbac.authorization.k8s.io',
            };

    clusterRoleBindings.push({
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRoleBinding',
      metadata: {
        name: `clusterrolebinding-${i}`,
        uid: `crb-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(randomInt(30, 365)),
      },
      subjects: [subject],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: clusterRoleName,
      },
    });
  }

  return clusterRoleBindings;
}

const MOCK_CLUSTER_ROLE_BINDINGS: ClusterRoleBinding[] =
  generateMockClusterRoleBindings(40);

export function getMockClusterRoleBindingList(params: {
  clusterId: string;
  page?: number;
  pageSize?: number;
}): ClusterRoleBindingListResult {
  const total = MOCK_CLUSTER_ROLE_BINDINGS.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRoleBindingList',
    metadata: {},
    items: MOCK_CLUSTER_ROLE_BINDINGS.slice(start, end),
    total,
  };
}

// ==================== ResourceQuota Mock 数据生成 ====================

// 资源类型常量
const RESOURCE_TYPES = [
  'cpu',
  'memory',
  'pods',
  'services',
  'replicationcontrollers',
  'resourcequotas',
  'secrets',
  'configmaps',
  'persistentvolumeclaims',
  'requests.storage',
  'requests.cpu',
  'requests.memory',
  'limits.cpu',
  'limits.memory',
];

// 资源配额作用域
const QUOTA_SCOPES = [
  'Terminating',
  'NotTerminating',
  'BestEffort',
  'NotBestEffort',
  'PriorityClass',
] as const;

function generateMockResourceQuotas(count: number): ResourceQuota[] {
  const quotas: ResourceQuota[] = [];

  for (let i = 1; i <= count; i++) {
    const namespace = randomElement(NAMESPACES);
    const createdDaysAgo = randomInt(1, 180);
    const hasScope = Math.random() > 0.6; // 40% 有作用域

    // 生成硬限制
    const hard: Record<string, string> = {};
    const resourceCount = randomInt(3, 8);
    const selectedResources = [];
    for (let j = 0; j < resourceCount; j++) {
      selectedResources.push(randomElement(RESOURCE_TYPES));
    }

    selectedResources.forEach((resource) => {
      if (resource === 'cpu' || resource.includes('.cpu')) {
        hard[resource] = `${randomInt(1, 20)}`;
      } else if (resource === 'memory' || resource.includes('.memory')) {
        hard[resource] = `${randomInt(1, 32)}Gi`;
      } else if (resource.includes('.storage')) {
        hard[resource] = `${randomInt(10, 500)}Gi`;
      } else {
        hard[resource] = `${randomInt(5, 100)}`;
      }
    });

    // 生成已使用量 (used)
    const used: Record<string, string> = {};
    Object.keys(hard).forEach((resource) => {
      const hardValue = hard[resource];
      if (hardValue.endsWith('Gi')) {
        const maxValue = Number.parseInt(hardValue);
        const usedValue = randomInt(0, Math.floor(maxValue * 0.9));
        used[resource] = `${usedValue}Gi`;
      } else {
        const maxValue = Number.parseInt(hardValue);
        const usedValue = randomInt(0, Math.floor(maxValue * 0.9));
        used[resource] = `${usedValue}`;
      }
    });

    quotas.push({
      apiVersion: 'v1',
      kind: 'ResourceQuota',
      metadata: {
        name: `resourcequota-${i}`,
        namespace,
        uid: `rq-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          environment: randomElement(['production', 'staging', 'development']),
        },
      },
      spec: {
        hard,
        scopes: hasScope ? [randomElement(QUOTA_SCOPES)] : undefined,
      },
      status: {
        hard,
        used,
      },
    });
  }

  return quotas;
}

const MOCK_RESOURCE_QUOTAS: ResourceQuota[] = generateMockResourceQuotas(60);

export function getMockResourceQuotaList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): ResourceQuotaListResult {
  let filteredQuotas = [...MOCK_RESOURCE_QUOTAS];

  // 命名空间筛选
  if (params.namespace) {
    filteredQuotas = filteredQuotas.filter(
      (quota) => quota.metadata.namespace === params.namespace,
    );
  }

  const total = filteredQuotas.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'ResourceQuotaList',
    metadata: {},
    items: filteredQuotas.slice(start, end),
    total,
  };
}

// ==================== LimitRange Mock 数据生成 ====================

// LimitRange 类型
const LIMIT_RANGE_TYPES = [
  'Container',
  'Pod',
  'PersistentVolumeClaim',
] as const;

function generateMockLimitRanges(count: number): LimitRange[] {
  const limitRanges: LimitRange[] = [];

  for (let i = 1; i <= count; i++) {
    const namespace = randomElement(NAMESPACES);
    const createdDaysAgo = randomInt(1, 180);
    const itemCount = randomInt(1, 3);
    const limits = [];

    for (let j = 0; j < itemCount; j++) {
      const type = randomElement(LIMIT_RANGE_TYPES);
      const item: any = { type };

      switch (type) {
        case 'Container': {
          // Container 限制
          item.max = {
            cpu: `${randomInt(2, 8)}`,
            memory: `${randomInt(2, 16)}Gi`,
          };
          item.min = {
            cpu: '100m',
            memory: '128Mi',
          };
          item.default = {
            cpu: `${randomInt(500, 2000)}m`,
            memory: `${randomInt(256, 2048)}Mi`,
          };
          item.defaultRequest = {
            cpu: '100m',
            memory: '128Mi',
          };
          item.maxLimitRequestRatio = {
            cpu: `${randomInt(2, 10)}`,
            memory: `${randomInt(2, 10)}`,
          };

          break;
        }
        case 'PersistentVolumeClaim': {
          // PVC 存储限制
          item.max = {
            storage: `${randomInt(100, 1000)}Gi`,
          };
          item.min = {
            storage: '1Gi',
          };

          break;
        }
        case 'Pod': {
          // Pod 限制
          item.max = {
            cpu: `${randomInt(4, 16)}`,
            memory: `${randomInt(8, 64)}Gi`,
          };
          item.min = {
            cpu: '200m',
            memory: '256Mi',
          };

          break;
        }
        // No default
      }

      limits.push(item);
    }

    limitRanges.push({
      apiVersion: 'v1',
      kind: 'LimitRange',
      metadata: {
        name: `limitrange-${i}`,
        namespace,
        uid: `lr-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          environment: randomElement(['production', 'staging', 'development']),
        },
      },
      spec: {
        limits,
      },
    });
  }

  return limitRanges;
}

const MOCK_LIMIT_RANGES: LimitRange[] = generateMockLimitRanges(40);

export function getMockLimitRangeList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): LimitRangeListResult {
  let filteredLimitRanges = [...MOCK_LIMIT_RANGES];

  // 命名空间筛选
  if (params.namespace) {
    filteredLimitRanges = filteredLimitRanges.filter(
      (lr) => lr.metadata.namespace === params.namespace,
    );
  }

  const total = filteredLimitRanges.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'LimitRangeList',
    metadata: {},
    items: filteredLimitRanges.slice(start, end),
    total,
  };
}

// ==================== NetworkPolicy Mock 数据生成 ====================

const NETWORK_POLICY_TYPES = ['Ingress', 'Egress'] as const;
const NETWORK_PROTOCOLS = ['TCP', 'UDP', 'SCTP'] as const;

function generateMockNetworkPolicies(count: number): NetworkPolicy[] {
  const networkPolicies: NetworkPolicy[] = [];

  for (let i = 1; i <= count; i++) {
    const namespace = randomElement(NAMESPACES);
    const appName = randomElement(APP_NAMES);
    const createdDaysAgo = randomInt(1, 180);
    const hasBothTypes = Math.random() > 0.5;
    const policyTypes = hasBothTypes
      ? (['Ingress', 'Egress'] as const)
      : [randomElement(NETWORK_POLICY_TYPES)];

    // 生成 Ingress 规则
    const ingress = policyTypes.includes('Ingress')
      ? [
          {
            from: [
              {
                podSelector: {
                  matchLabels: {
                    app: randomElement(APP_NAMES),
                  },
                },
              },
              {
                namespaceSelector: {
                  matchLabels: {
                    environment: randomElement(['production', 'staging']),
                  },
                },
              },
            ],
            ports: [
              {
                protocol: randomElement(NETWORK_PROTOCOLS),
                port: randomInt(3000, 9000),
              },
            ],
          },
        ]
      : undefined;

    // 生成 Egress 规则
    const egress = policyTypes.includes('Egress')
      ? [
          {
            to: [
              {
                podSelector: {
                  matchLabels: {
                    app: 'database',
                  },
                },
              },
            ],
            ports: [
              {
                protocol: 'TCP' as const,
                port: randomElement([3306, 5432, 6379, 27_017]),
              },
            ],
          },
        ]
      : undefined;

    networkPolicies.push({
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: `${appName}-network-policy-${i}`,
        namespace,
        uid: `np-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          app: appName,
        },
      },
      spec: {
        podSelector: {
          matchLabels: {
            app: appName,
          },
        },
        policyTypes,
        ingress,
        egress,
      },
    });
  }

  return networkPolicies;
}

const MOCK_NETWORK_POLICIES: NetworkPolicy[] = generateMockNetworkPolicies(60);

export function getMockNetworkPolicyList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): NetworkPolicyListResult {
  let filteredPolicies = [...MOCK_NETWORK_POLICIES];

  // 命名空间筛选
  if (params.namespace) {
    filteredPolicies = filteredPolicies.filter(
      (np) => np.metadata.namespace === params.namespace,
    );
  }

  const total = filteredPolicies.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'NetworkPolicyList',
    metadata: {},
    items: filteredPolicies.slice(start, end),
    total,
  };
}

// ==================== HorizontalPodAutoscaler Mock 数据生成 ====================

const METRIC_TYPES = ['Resource', 'Pods', 'Object'] as const;

function generateMockHPAs(count: number): HorizontalPodAutoscaler[] {
  const hpas: HorizontalPodAutoscaler[] = [];

  for (let i = 1; i <= count; i++) {
    const namespace = randomElement(NAMESPACES);
    const targetKind = randomElement([
      'Deployment',
      'StatefulSet',
      'ReplicaSet',
    ]);
    const targetName = `${randomElement(APP_NAMES)}-${targetKind.toLowerCase()}`;
    const minReplicas = randomInt(1, 3);
    const maxReplicas = randomInt(5, 20);
    const currentReplicas = randomInt(minReplicas, maxReplicas);
    const desiredReplicas = randomInt(minReplicas, maxReplicas);
    const createdDaysAgo = randomInt(1, 180);

    hpas.push({
      apiVersion: 'autoscaling/v2',
      kind: 'HorizontalPodAutoscaler',
      metadata: {
        name: `${targetName}-hpa-${i}`,
        namespace,
        uid: `hpa-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          target: targetName,
        },
      },
      spec: {
        scaleTargetRef: {
          apiVersion:
            targetKind === 'Deployment' || targetKind === 'StatefulSet'
              ? 'apps/v1'
              : 'apps/v1',
          kind: targetKind,
          name: targetName,
        },
        minReplicas,
        maxReplicas,
        metrics: [
          {
            type: 'Resource',
            resource: {
              name: 'cpu',
              target: {
                type: 'Utilization',
                averageUtilization: randomInt(50, 80),
              },
            },
          },
          {
            type: 'Resource',
            resource: {
              name: 'memory',
              target: {
                type: 'Utilization',
                averageUtilization: randomInt(60, 85),
              },
            },
          },
        ],
      },
      status: {
        currentReplicas,
        desiredReplicas,
        currentMetrics: [
          {
            type: 'Resource',
            resource: {
              name: 'cpu',
              current: {
                type: 'Utilization',
                averageUtilization: randomInt(30, 90),
              },
            },
          },
        ],
        conditions: [
          {
            type: 'AbleToScale',
            status: 'True',
            lastTransitionTime: generateTimestamp(randomInt(0, 7)),
            reason: 'ReadyForNewScale',
            message: 'recommended size matches current size',
          },
        ],
      },
    });
  }

  return hpas;
}

const MOCK_HPAS: HorizontalPodAutoscaler[] = generateMockHPAs(80);

export function getMockHPAList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): HorizontalPodAutoscalerListResult {
  let filteredHPAs = [...MOCK_HPAS];

  // 命名空间筛选
  if (params.namespace) {
    filteredHPAs = filteredHPAs.filter(
      (hpa) => hpa.metadata.namespace === params.namespace,
    );
  }

  const total = filteredHPAs.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'autoscaling/v2',
    kind: 'HorizontalPodAutoscalerList',
    metadata: {},
    items: filteredHPAs.slice(start, end),
    total,
  };
}

// ==================== PriorityClass Mock 数据生成 ====================

const PRIORITY_CLASS_NAMES = [
  'system-cluster-critical',
  'system-node-critical',
  'high-priority',
  'medium-priority',
  'low-priority',
  'best-effort',
];

function generateMockPriorityClasses(): PriorityClass[] {
  const priorityClasses: PriorityClass[] = [];

  PRIORITY_CLASS_NAMES.forEach((name, index) => {
    const value = name.startsWith('system')
      ? 2_000_000_000 - index * 1000
      : 1_000_000 - index * 100_000;
    const globalDefault = name === 'medium-priority';
    const preemptionPolicy = name.includes('best-effort')
      ? 'Never'
      : 'PreemptLowerPriority';

    priorityClasses.push({
      apiVersion: 'scheduling.k8s.io/v1',
      kind: 'PriorityClass',
      metadata: {
        name,
        uid: `pc-${(index + 1).toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(randomInt(30, 365)),
      },
      value,
      globalDefault,
      description: `${name} priority class`,
      preemptionPolicy: preemptionPolicy as 'Never' | 'PreemptLowerPriority',
    });
  });

  return priorityClasses;
}

const MOCK_PRIORITY_CLASSES: PriorityClass[] = generateMockPriorityClasses();

export function getMockPriorityClassList(params: {
  clusterId: string;
  page?: number;
  pageSize?: number;
}): PriorityClassListResult {
  const total = MOCK_PRIORITY_CLASSES.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'scheduling.k8s.io/v1',
    kind: 'PriorityClassList',
    metadata: {},
    items: MOCK_PRIORITY_CLASSES.slice(start, end),
    total,
  };
}

// ==================== ReplicaSet Mock 数据生成 ====================

function generateMockReplicaSets(count: number): ReplicaSet[] {
  const replicaSets: ReplicaSet[] = [];

  for (let i = 1; i <= count; i++) {
    const appName = randomElement(APP_NAMES);
    const namespace = randomElement(NAMESPACES);
    const replicas = randomInt(1, 10);
    const readyReplicas = randomInt(0, replicas);
    const createdDaysAgo = randomInt(1, 90);
    const image = randomElement(POD_IMAGES);

    replicaSets.push({
      apiVersion: 'apps/v1',
      kind: 'ReplicaSet',
      metadata: {
        name: `${appName}-replicaset-${i}`,
        namespace,
        uid: `rs-${i.toString().padStart(6, '0')}`,
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
        fullyLabeledReplicas: replicas,
        readyReplicas,
        availableReplicas: readyReplicas,
      },
    });
  }

  return replicaSets;
}

const MOCK_REPLICASETS: ReplicaSet[] = generateMockReplicaSets(150);

export function getMockReplicaSetList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): ReplicaSetListResult {
  let filteredRS = [...MOCK_REPLICASETS];

  // 命名空间筛选
  if (params.namespace) {
    filteredRS = filteredRS.filter(
      (rs) => rs.metadata.namespace === params.namespace,
    );
  }

  const total = filteredRS.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'apps/v1',
    kind: 'ReplicaSetList',
    metadata: {},
    items: filteredRS.slice(start, end),
    total,
  };
}

// ==================== Endpoints Mock 数据生成 ====================

function generateMockEndpoints(count: number): Endpoints[] {
  const endpoints: Endpoints[] = [];

  for (let i = 1; i <= count; i++) {
    const serviceName = `${randomElement(APP_NAMES)}-service`;
    const namespace = randomElement(NAMESPACES);
    const createdDaysAgo = randomInt(1, 180);
    const portCount = randomInt(1, 3);
    const addressCount = randomInt(1, 5);

    const addresses = [];
    for (let j = 0; j < addressCount; j++) {
      addresses.push({
        ip: `10.244.${randomInt(0, 255)}.${randomInt(1, 254)}`,
        nodeName: `node-${randomInt(1, 10)}`,
        targetRef: {
          kind: 'Pod',
          name: `${randomElement(APP_NAMES)}-pod-${randomInt(1000, 9999)}`,
          namespace,
          uid: `pod-${randomInt(100_000, 999_999)}`,
        },
      });
    }

    const ports = [];
    for (let k = 0; k < portCount; k++) {
      ports.push({
        name: ['http', 'https', 'grpc'][k] || `port-${k}`,
        port: randomInt(3000, 9000),
        protocol: randomElement(['TCP', 'UDP']),
      });
    }

    endpoints.push({
      apiVersion: 'v1',
      kind: 'Endpoints',
      metadata: {
        name: serviceName,
        namespace,
        uid: `ep-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
      },
      subsets: [
        {
          addresses,
          ports,
        },
      ],
    });
  }

  return endpoints;
}

const MOCK_ENDPOINTS: Endpoints[] = generateMockEndpoints(100);

export function getMockEndpointsList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): EndpointsListResult {
  let filteredEP = [...MOCK_ENDPOINTS];

  // 命名空间筛选
  if (params.namespace) {
    filteredEP = filteredEP.filter(
      (ep) => ep.metadata.namespace === params.namespace,
    );
  }

  const total = filteredEP.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'v1',
    kind: 'EndpointsList',
    metadata: {},
    items: filteredEP.slice(start, end),
    total,
  };
}

// ==================== EndpointSlice Mock 数据生成 ====================

const ADDRESS_TYPES = ['IPv4', 'IPv6', 'FQDN'] as const;

function generateMockEndpointSlices(count: number): EndpointSlice[] {
  const endpointSlices: EndpointSlice[] = [];

  for (let i = 1; i <= count; i++) {
    const serviceName = `${randomElement(APP_NAMES)}-service`;
    const namespace = randomElement(NAMESPACES);
    const createdDaysAgo = randomInt(1, 180);
    const addressType = randomElement(ADDRESS_TYPES);
    const endpointCount = randomInt(1, 5);
    const portCount = randomInt(1, 3);

    const endpoints_array = [];
    for (let j = 0; j < endpointCount; j++) {
      const addresses =
        addressType === 'IPv4'
          ? [`10.244.${randomInt(0, 255)}.${randomInt(1, 254)}`]
          : addressType === 'IPv6'
            ? [`fd00::${randomInt(1, 255)}:${randomInt(1, 255)}`]
            : [`pod-${randomInt(1, 100)}.${namespace}.svc.cluster.local`];

      endpoints_array.push({
        addresses,
        conditions: {
          ready: Math.random() > 0.2,
          serving: Math.random() > 0.1,
          terminating: Math.random() < 0.1,
        },
        nodeName: `node-${randomInt(1, 10)}`,
        targetRef: {
          kind: 'Pod',
          name: `${randomElement(APP_NAMES)}-pod-${randomInt(1000, 9999)}`,
          namespace,
          uid: `pod-${randomInt(100_000, 999_999)}`,
        },
        zone: randomElement(['us-west-1a', 'us-west-1b', 'us-west-1c']),
      });
    }

    const ports = [];
    for (let k = 0; k < portCount; k++) {
      ports.push({
        name: ['http', 'https', 'grpc'][k] || `port-${k}`,
        port: randomInt(3000, 9000),
        protocol: randomElement(['TCP', 'UDP']),
      });
    }

    endpointSlices.push({
      apiVersion: 'discovery.k8s.io/v1',
      kind: 'EndpointSlice',
      metadata: {
        name: `${serviceName}-${Math.random().toString(36).slice(2, 7)}`,
        namespace,
        uid: `eps-${i.toString().padStart(6, '0')}`,
        creationTimestamp: generateTimestamp(createdDaysAgo),
        labels: {
          'kubernetes.io/service-name': serviceName,
        },
      },
      addressType,
      endpoints: endpoints_array,
      ports,
    });
  }

  return endpointSlices;
}

const MOCK_ENDPOINT_SLICES: EndpointSlice[] = generateMockEndpointSlices(120);

export function getMockEndpointSliceList(params: {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}): EndpointSliceListResult {
  let filteredEPS = [...MOCK_ENDPOINT_SLICES];

  // 命名空间筛选
  if (params.namespace) {
    filteredEPS = filteredEPS.filter(
      (eps) => eps.metadata.namespace === params.namespace,
    );
  }

  const total = filteredEPS.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'discovery.k8s.io/v1',
    kind: 'EndpointSliceList',
    metadata: {},
    items: filteredEPS.slice(start, end),
    total,
  };
}
