/**
 * K8s Mock 数据工具函数
 */

import { faker } from '@faker-js/faker/locale/zh_CN';

// Mock 数据存储
export const mockClusters: any[] = [];
export const mockPods: any[] = [];
export const mockDeployments: any[] = [];
export const mockServices: any[] = [];
export const mockConfigMaps: any[] = [];
export const mockCronJobs: any[] = [];
export const mockNamespaces: any[] = [];
export const mockNodes: any[] = [];
export const mockSecrets: any[] = [];
export const mockStatefulSets: any[] = [];
export const mockDaemonSets: any[] = [];
export const mockJobs: any[] = [];

// 生成集群数据
export function generateCluster(id?: string) {
  const clusterId = id || faker.string.uuid();
  const statuses = ['healthy', 'unhealthy', 'unknown'];
  const versions = ['v1.28.0', 'v1.27.3', 'v1.26.6', 'v1.25.11'];

  return {
    id: clusterId,
    name: `cluster-${faker.string.alphanumeric(8)}`,
    description: faker.lorem.sentence(),
    apiServer: `https://k8s-${faker.string.alphanumeric(6)}.example.com:6443`,
    version: faker.helpers.arrayElement(versions),
    status: faker.helpers.arrayElement(statuses),
    nodeCount: faker.number.int({ min: 1, max: 50 }),
    podCount: faker.number.int({ min: 10, max: 500 }),
    namespaceCount: faker.number.int({ min: 5, max: 30 }),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    kubeconfig: `apiVersion: v1\nkind: Config\nclusters:\n- cluster:\n    server: https://k8s.example.com:6443\n  name: ${clusterId}`,
  };
}

// 生成集群指标数据
export function generateClusterMetrics() {
  return {
    cpuUsage: Number.parseFloat(faker.number.float({ min: 20, max: 95, fractionDigits: 2 }).toFixed(2)),
    memoryUsage: Number.parseFloat(faker.number.float({ min: 30, max: 90, fractionDigits: 2 }).toFixed(2)),
    diskUsage: Number.parseFloat(faker.number.float({ min: 40, max: 85, fractionDigits: 2 }).toFixed(2)),
    podCount: faker.number.int({ min: 50, max: 500 }),
    nodeCount: faker.number.int({ min: 3, max: 20 }),
    namespaceCount: faker.number.int({ min: 10, max: 50 }),
  };
}

// 生成 Pod 数据
export function generatePod(namespace: string = 'default') {
  const phases = ['Running', 'Pending', 'Succeeded', 'Failed', 'Unknown'];
  const phase = faker.helpers.arrayElement(phases);
  const containerCount = faker.number.int({ min: 1, max: 3 });

  return {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: `${faker.word.noun()}-${faker.string.alphanumeric(10).toLowerCase()}`,
      namespace,
      uid: faker.string.uuid(),
      resourceVersion: faker.string.numeric(6),
      creationTimestamp: faker.date.past({ years: 1 }).toISOString(),
      labels: {
        app: faker.word.noun(),
        version: 'v1',
        environment: faker.helpers.arrayElement(['dev', 'staging', 'prod']),
      },
      annotations: {
        'kubernetes.io/created-by': 'deployment-controller',
      },
    },
    spec: {
      containers: Array.from({ length: containerCount }, () => ({
        name: faker.word.noun(),
        image: `${faker.word.noun()}:${faker.system.semver()}`,
        ports: [
          {
            containerPort: faker.number.int({ min: 3000, max: 9000 }),
            protocol: 'TCP',
          },
        ],
        resources: {
          limits: {
            cpu: `${faker.number.int({ min: 100, max: 2000 })}m`,
            memory: `${faker.number.int({ min: 128, max: 2048 })}Mi`,
          },
          requests: {
            cpu: `${faker.number.int({ min: 50, max: 1000 })}m`,
            memory: `${faker.number.int({ min: 64, max: 1024 })}Mi`,
          },
        },
      })),
      restartPolicy: 'Always',
      nodeName: `node-${faker.string.alphanumeric(8)}`,
    },
    status: {
      phase,
      hostIP: faker.internet.ipv4(),
      podIP: faker.internet.ipv4(),
      startTime: faker.date.past({ years: 1 }).toISOString(),
      conditions: [
        {
          type: 'Ready',
          status: phase === 'Running' ? 'True' : 'False',
          lastTransitionTime: faker.date.recent({ days: 7 }).toISOString(),
        },
      ],
      containerStatuses: Array.from({ length: containerCount }, (_, i) => ({
        name: `container-${i}`,
        state: phase === 'Running' ? {
          running: {
            startedAt: faker.date.past({ years: 1 }).toISOString(),
          },
        } : {
          waiting: {
            reason: 'ContainerCreating',
          },
        },
        ready: phase === 'Running',
        restartCount: faker.number.int({ min: 0, max: 5 }),
        image: `${faker.word.noun()}:${faker.system.semver()}`,
      })),
    },
  };
}

// 生成 Deployment 数据
export function generateDeployment(namespace: string = 'default') {
  const replicas = faker.number.int({ min: 1, max: 10 });

  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: `${faker.word.noun()}-deployment`,
      namespace,
      uid: faker.string.uuid(),
      creationTimestamp: faker.date.past({ years: 1 }).toISOString(),
      labels: {
        app: faker.word.noun(),
      },
    },
    spec: {
      replicas,
      selector: {
        matchLabels: {
          app: faker.word.noun(),
        },
      },
      template: {
        metadata: {
          labels: {
            app: faker.word.noun(),
          },
        },
        spec: {
          containers: [
            {
              name: faker.word.noun(),
              image: `${faker.word.noun()}:${faker.system.semver()}`,
              ports: [
                {
                  containerPort: faker.number.int({ min: 3000, max: 9000 }),
                },
              ],
            },
          ],
        },
      },
      strategy: {
        type: 'RollingUpdate',
        rollingUpdate: {
          maxSurge: 1,
          maxUnavailable: 0,
        },
      },
    },
    status: {
      replicas,
      updatedReplicas: replicas,
      readyReplicas: faker.number.int({ min: 0, max: replicas }),
      availableReplicas: faker.number.int({ min: 0, max: replicas }),
      conditions: [
        {
          type: 'Available',
          status: 'True',
          lastTransitionTime: faker.date.recent({ days: 7 }).toISOString(),
        },
      ],
    },
  };
}

// 生成 Service 数据
export function generateService(namespace: string = 'default') {
  const types = ['ClusterIP', 'NodePort', 'LoadBalancer'];
  const serviceType = faker.helpers.arrayElement(types);

  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: `${faker.word.noun()}-service`,
      namespace,
      uid: faker.string.uuid(),
      creationTimestamp: faker.date.past({ years: 1 }).toISOString(),
    },
    spec: {
      type: serviceType,
      clusterIP: faker.internet.ipv4(),
      ports: [
        {
          name: 'http',
          protocol: 'TCP',
          port: 80,
          targetPort: 8080,
          ...(serviceType === 'NodePort' && {
            nodePort: faker.number.int({ min: 30000, max: 32767 }),
          }),
        },
      ],
      selector: {
        app: faker.word.noun(),
      },
    },
    status: serviceType === 'LoadBalancer' ? {
      loadBalancer: {
        ingress: [
          {
            ip: faker.internet.ipv4(),
          },
        ],
      },
    } : undefined,
  };
}

// 生成 ConfigMap 数据
export function generateConfigMap(namespace: string = 'default') {
  return {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: `${faker.word.noun()}-config`,
      namespace,
      uid: faker.string.uuid(),
      creationTimestamp: faker.date.past({ years: 1 }).toISOString(),
    },
    data: {
      'config.yaml': `app:
  name: ${faker.word.noun()}
  port: ${faker.number.int({ min: 3000, max: 9000 })}
  debug: ${faker.datatype.boolean()}`,
      'database.url': faker.internet.url(),
      'log.level': faker.helpers.arrayElement(['debug', 'info', 'warning', 'error']),
    },
  };
}

// 生成 CronJob 数据
export function generateCronJob(namespace: string = 'default') {
  return {
    apiVersion: 'batch/v1',
    kind: 'CronJob',
    metadata: {
      name: `${faker.word.noun()}-cronjob`,
      namespace,
      uid: faker.string.uuid(),
      creationTimestamp: faker.date.past({ years: 1 }).toISOString(),
    },
    spec: {
      schedule: faker.helpers.arrayElement([
        '*/5 * * * *',
        '0 */2 * * *',
        '0 0 * * *',
        '0 0 * * 0',
      ]),
      jobTemplate: {
        spec: {
          template: {
            spec: {
              containers: [
                {
                  name: faker.word.noun(),
                  image: `${faker.word.noun()}:${faker.system.semver()}`,
                  command: ['sh', '-c', 'echo Hello from CronJob'],
                },
              ],
              restartPolicy: 'OnFailure',
            },
          },
        },
      },
      successfulJobsHistoryLimit: 3,
      failedJobsHistoryLimit: 1,
    },
    status: {
      lastScheduleTime: faker.date.recent({ days: 1 }).toISOString(),
    },
  };
}

// 初始化 Mock 数据
export function initMockData() {
  // 生成 3 个集群
  for (let i = 0; i < 3; i++) {
    mockClusters.push(generateCluster());
  }

  // 为每个集群生成资源
  mockClusters.forEach((cluster) => {
    // Namespaces
    ['default', 'kube-system', 'kube-public', 'prod', 'staging'].forEach((ns) => {
      mockNamespaces.push({
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: ns,
          uid: faker.string.uuid(),
          creationTimestamp: faker.date.past({ years: 2 }).toISOString(),
        },
        status: {
          phase: 'Active',
        },
      });

      // Pods
      for (let i = 0; i < 5; i++) {
        mockPods.push(generatePod(ns));
      }

      // Deployments
      for (let i = 0; i < 3; i++) {
        mockDeployments.push(generateDeployment(ns));
      }

      // Services
      for (let i = 0; i < 3; i++) {
        mockServices.push(generateService(ns));
      }

      // ConfigMaps
      for (let i = 0; i < 2; i++) {
        mockConfigMaps.push(generateConfigMap(ns));
      }

      // CronJobs
      mockCronJobs.push(generateCronJob(ns));
    });
  });

  // Nodes
  for (let i = 0; i < 5; i++) {
    mockNodes.push({
      apiVersion: 'v1',
      kind: 'Node',
      metadata: {
        name: `node-${i + 1}`,
        uid: faker.string.uuid(),
        creationTimestamp: faker.date.past({ years: 2 }).toISOString(),
        labels: {
          'kubernetes.io/hostname': `node-${i + 1}`,
          'node-role.kubernetes.io/worker': '',
        },
      },
      status: {
        capacity: {
          cpu: `${faker.number.int({ min: 4, max: 32 })}`,
          memory: `${faker.number.int({ min: 8, max: 128 })}Gi`,
          pods: '110',
        },
        allocatable: {
          cpu: `${faker.number.int({ min: 3, max: 30 })}`,
          memory: `${faker.number.int({ min: 7, max: 120 })}Gi`,
          pods: '110',
        },
        conditions: [
          {
            type: 'Ready',
            status: 'True',
            lastTransitionTime: faker.date.recent({ days: 30 }).toISOString(),
          },
        ],
        addresses: [
          {
            type: 'InternalIP',
            address: faker.internet.ipv4(),
          },
          {
            type: 'Hostname',
            address: `node-${i + 1}`,
          },
        ],
        nodeInfo: {
          machineID: faker.string.uuid(),
          systemUUID: faker.string.uuid(),
          bootID: faker.string.uuid(),
          kernelVersion: '5.15.0-91-generic',
          osImage: 'Ubuntu 22.04.3 LTS',
          containerRuntimeVersion: 'containerd://1.7.2',
          kubeletVersion: 'v1.28.0',
          kubeProxyVersion: 'v1.28.0',
          operatingSystem: 'linux',
          architecture: 'amd64',
        },
      },
    });
  }
}

// 分页工具函数
export function paginate<T>(items: T[], page: number = 1, pageSize: number = 10) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    total: items.length,
  };
}

// 过滤工具函数
export function filterByKeyword<T extends Record<string, any>>(
  items: T[],
  keyword: string,
  fields: string[] = ['name'],
): T[] {
  if (!keyword) {
    return items;
  }

  const lowerKeyword = keyword.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return value && String(value).toLowerCase().includes(lowerKeyword);
    }),
  );
}
