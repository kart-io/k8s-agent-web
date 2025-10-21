/**
 * Kubernetes API 接口 - 使用工厂函数优化版本
 * 代码量从 874 行减少到约 300 行
 */

import type {
  Cluster,
  ClusterListParams,
  ClusterListResult,
  ClusterMetrics,
  ClusterOption,
  ConfigMap,
  CronJob,
  DaemonSet,
  Deployment,
  Endpoints,
  EndpointSlice,
  HorizontalPodAutoscaler,
  Job,
  Namespace,
  NetworkPolicy,
  Node,
  Pod,
  PodExecParams,
  PodLogsParams,
  PriorityClass,
  ReplicaSet,
  RestartParams,
  ScaleParams,
  Secret,
  Service,
  StatefulSet,
} from './types';

import { requestClient } from '../request';
import { createMockableApi } from './mock-adapter';
import { createMockableResourceApi } from './mock-resource-factory';
import {
  createResourceApi,
  createResourceApiWithExtras,
} from './resource-api-factory';

// ==================== 使用工厂函数创建资源 API ====================

/**
 * Pod API
 */
const podApiBase = createMockableResourceApi(
  createResourceApi<Pod>(requestClient, {
    resourceType: 'pod',
    namespaced: true,
  }),
  'pod',
);

export const podApi = {
  ...podApiBase,

  /**
   * 获取 Pod 日志
   * 支持 mock 模式切换（通过环境变量 VITE_USE_K8S_MOCK 控制）
   * GET /k8s/pod/logs?clusterId=xxx&namespace=yyy&name=zzz&container=aaa
   */
  logs: createMockableApi(
    // 真实 API
    async (params: PodLogsParams): Promise<string> => {
      return requestClient.get('/k8s/pod/logs', { params });
    },
    // Mock API
    async (params: PodLogsParams): Promise<string> => {
      const { getMockPodLogs } = await import('./mock');
      return getMockPodLogs({
        clusterId: params.clusterId,
        namespace: params.namespace,
        name: params.name,
        container: params.container,
        timestamps: params.timestamps,
        tailLines: params.tailLines,
      });
    },
  ),

  /**
   * 执行 Pod 命令
   * POST /k8s/pod/exec?clusterId=xxx&namespace=yyy&name=zzz
   */
  exec: async (params: PodExecParams): Promise<string> => {
    const { clusterId, namespace, name, ...data } = params;
    return requestClient.post(
      '/k8s/pod/exec',
      data,
      { params: { clusterId, namespace, name } },
    );
  },
};

// 导出兼容旧 API 的函数
export const getPodList = podApiBase.list;
export const getPodDetail = podApiBase.detail;
export const createPod = podApiBase.create;
export const updatePod = podApiBase.update;
export const deletePod = podApiBase.delete;
export const getPodLogs = podApi.logs;
export const execPod = podApi.exec;

/**
 * Service API
 */
const serviceApiBase = createMockableResourceApi(
  createResourceApi<Service>(requestClient, {
    resourceType: 'service',
    namespaced: true,
  }),
  'service',
);

export const serviceApi = serviceApiBase;
export const getServiceList = serviceApiBase.list;
export const getServiceDetail = serviceApiBase.detail;
export const createService = serviceApiBase.create;
export const updateService = serviceApiBase.update;
export const deleteService = serviceApiBase.delete;

/**
 * ConfigMap API
 */
const configMapApiBase = createMockableResourceApi(
  createResourceApi<ConfigMap>(requestClient, {
    resourceType: 'configmap',
    namespaced: true,
  }),
  'configmap',
);

export const configMapApi = configMapApiBase;
export const getConfigMapList = configMapApiBase.list;
export const getConfigMapDetail = configMapApiBase.detail;
export const createConfigMap = configMapApiBase.create;
export const updateConfigMap = configMapApiBase.update;
export const deleteConfigMap = configMapApiBase.delete;

/**
 * Secret API
 */
const secretApiBase = createMockableResourceApi(
  createResourceApi<Secret>(requestClient, {
    resourceType: 'secret',
    namespaced: true,
  }),
  'secret',
);

export const secretApi = secretApiBase;
export const getSecretList = secretApiBase.list;
export const getSecretDetail = secretApiBase.detail;
export const createSecret = secretApiBase.create;
export const updateSecret = secretApiBase.update;
export const deleteSecret = secretApiBase.delete;

/**
 * Deployment API - 带扩展操作
 */
export const deploymentApi = createMockableResourceApi(
  createResourceApiWithExtras<
    Deployment,
    {
      restart: (
        clusterId: string,
        namespace: string,
        name: string,
      ) => Promise<Deployment>;
      scale: (
        clusterId: string,
        namespace: string,
        name: string,
        params: ScaleParams,
      ) => Promise<Deployment>;
    }
  >(
    requestClient,
    {
      resourceType: 'deployment',
      namespaced: true,
    },
    {
      /**
       * 扩缩容 Deployment
       * PUT /k8s/deployment/scale?clusterId=xxx&namespace=yyy&name=zzz
       */
      scale: (
        clusterId: string,
        namespace: string,
        name: string,
        scaleParams: ScaleParams,
      ) => {
        return requestClient.put(
          '/k8s/deployment/scale',
          { replicas: scaleParams.replicas },
          { params: { clusterId, namespace, name } },
        );
      },

      /**
       * 重启 Deployment
       * POST /k8s/deployment/restart?clusterId=xxx&namespace=yyy&name=zzz
       */
      restart: (clusterId: string, namespace: string, name: string) => {
        const restartParams: RestartParams = {
          restartedAt: new Date().toISOString(),
        };
        return requestClient.post(
          '/k8s/deployment/restart',
          restartParams,
          { params: { clusterId, namespace, name } },
        );
      },
    },
  ),
  'deployment',
);

export const getDeploymentList = deploymentApi.list;
export const getDeploymentDetail = deploymentApi.detail;
export const createDeployment = deploymentApi.create;
export const updateDeployment = deploymentApi.update;
export const deleteDeployment = deploymentApi.delete;
export const scaleDeployment = deploymentApi.scale;
export const restartDeployment = deploymentApi.restart;

/**
 * StatefulSet API - 带扩展操作
 */
export const statefulSetApi = createMockableResourceApi(
  createResourceApiWithExtras<
    StatefulSet,
    {
      scale: (
        clusterId: string,
        namespace: string,
        name: string,
        params: ScaleParams,
      ) => Promise<StatefulSet>;
    }
  >(
    requestClient,
    {
      resourceType: 'statefulset',
      namespaced: true,
    },
    {
      /**
       * 扩缩容 StatefulSet
       * PUT /k8s/statefulset/scale?clusterId=xxx&namespace=yyy&name=zzz
       */
      scale: (
        clusterId: string,
        namespace: string,
        name: string,
        scaleParams: ScaleParams,
      ) => {
        return requestClient.put(
          '/k8s/statefulset/scale',
          { replicas: scaleParams.replicas },
          { params: { clusterId, namespace, name } },
        );
      },
    },
  ),
  'statefulset',
);

export const getStatefulSetList = statefulSetApi.list;
export const getStatefulSetDetail = statefulSetApi.detail;
export const createStatefulSet = statefulSetApi.create;
export const deleteStatefulSet = statefulSetApi.delete;
export const scaleStatefulSet = statefulSetApi.scale;

/**
 * DaemonSet API
 */
const daemonSetApiBase = createMockableResourceApi(
  createResourceApi<DaemonSet>(requestClient, {
    resourceType: 'daemonset',
    namespaced: true,
  }),
  'daemonset',
);

export const daemonSetApi = daemonSetApiBase;
export const getDaemonSetList = daemonSetApiBase.list;
export const getDaemonSetDetail = daemonSetApiBase.detail;
export const createDaemonSet = daemonSetApiBase.create;
export const deleteDaemonSet = daemonSetApiBase.delete;

/**
 * Job API
 */
const jobApiBase = createMockableResourceApi(
  createResourceApi<Job>(requestClient, {
    resourceType: 'job',
    namespaced: true,
  }),
  'job',
);

export const jobApi = jobApiBase;
export const getJobList = jobApiBase.list;
export const getJobDetail = jobApiBase.detail;
export const createJob = jobApiBase.create;
export const deleteJob = jobApiBase.delete;

/**
 * CronJob API - 带扩展操作
 */
export const cronJobApi = createMockableResourceApi(
  createResourceApiWithExtras<
    CronJob,
    {
      toggle: (
        clusterId: string,
        namespace: string,
        name: string,
        suspend: boolean,
      ) => Promise<CronJob>;
    }
  >(
    requestClient,
    {
      resourceType: 'cronjob',
      namespaced: true,
    },
    {
      /**
       * 暂停/恢复 CronJob
       * PUT /k8s/cronjob?clusterId=xxx&namespace=yyy&name=zzz
       */
      toggle: (
        clusterId: string,
        namespace: string,
        name: string,
        suspend: boolean,
      ) => {
        return requestClient.put(
          '/k8s/cronjob',
          {
            spec: { suspend },
          },
          { params: { clusterId, namespace, name } },
        );
      },
    },
  ),
  'cronjob',
);

export const getCronJobList = cronJobApi.list;
export const getCronJobDetail = cronJobApi.detail;
export const createCronJob = cronJobApi.create;
export const updateCronJob = cronJobApi.update;
export const deleteCronJob = cronJobApi.delete;
export const toggleCronJob = cronJobApi.toggle;

// ==================== 集群级别资源 ====================

/**
 * Namespace API
 */
export const namespaceApi = {
  /**
   * 获取 Namespace 列表
   * GET /k8s/namespaces?clusterId=xxx
   */
  list: createMockableApi(
    async (clusterId: string) => {
      return requestClient.get('/k8s/namespaces', { params: { clusterId } });
    },
    async (clusterId: string) => {
      const { getMockNamespaceList } = await import('./mock');
      return getMockNamespaceList({ clusterId });
    },
  ),

  /**
   * 获取 Namespace 选项（用于下拉选择）
   * GET /k8s/namespaces?clusterId=xxx
   */
  options: createMockableApi(
    async (
      clusterId: string,
    ): Promise<Array<{ label: string; value: string }>> => {
      const result = await requestClient.get('/k8s/namespaces', {
        params: { clusterId },
      });
      return result.items.map((ns: any) => ({
        label: ns.name || ns.metadata?.name,
        value: ns.name || ns.metadata?.name,
      }));
    },
    async (
      clusterId: string,
    ): Promise<Array<{ label: string; value: string }>> => {
      const { getMockNamespaceList } = await import('./mock');
      const result = await getMockNamespaceList({ clusterId });
      return result.items.map((ns: any) => ({
        label: ns.name || ns.metadata?.name,
        value: ns.name || ns.metadata?.name,
      }));
    },
  ),

  /**
   * 获取 Namespace 详情
   * GET /k8s/namespace?clusterId=xxx&namespace=yyy
   */
  detail: async (clusterId: string, name: string): Promise<Namespace> => {
    return requestClient.get('/k8s/namespace', {
      params: { clusterId, namespace: name },
    });
  },

  /**
   * 创建 Namespace
   * POST /k8s/namespaces?clusterId=xxx
   */
  create: async (clusterId: string, data: Namespace): Promise<Namespace> => {
    return requestClient.post('/k8s/namespaces', data, {
      params: { clusterId },
    });
  },

  /**
   * 删除 Namespace
   * DELETE /k8s/namespace?clusterId=xxx&namespace=yyy
   */
  delete: async (clusterId: string, name: string): Promise<void> => {
    return requestClient.delete('/k8s/namespace', {
      params: { clusterId, namespace: name },
    });
  },
};

export const getNamespaceList = namespaceApi.list;
export const getNamespaceDetail = namespaceApi.detail;
export const createNamespace = namespaceApi.create;
export const deleteNamespace = namespaceApi.delete;

/**
 * Node API - 带扩展操作
 */
export const nodeApi = {
  /**
   * 获取 Node 列表
   * GET /k8s/nodes?clusterId=xxx
   */
  list: createMockableApi(
    async (clusterId: string) => {
      return requestClient.get('/k8s/nodes', { params: { clusterId } });
    },
    async (clusterId: string) => {
      const { getMockNodeList } = await import('./mock');
      return getMockNodeList({ clusterId });
    },
  ),

  /**
   * 获取 Node 详情
   * GET /k8s/node?clusterId=xxx&name=yyy
   */
  detail: async (clusterId: string, name: string): Promise<Node> => {
    return requestClient.get('/k8s/node', {
      params: { clusterId, name },
    });
  },

  /**
   * 封锁 Node (Cordon)
   * POST /k8s/node/cordon?clusterId=xxx&name=yyy
   */
  cordon: async (clusterId: string, name: string): Promise<Node> => {
    return requestClient.post(
      '/k8s/node/cordon',
      {},
      { params: { clusterId, name } },
    );
  },

  /**
   * 解除封锁 Node (Uncordon)
   * POST /k8s/node/uncordon?clusterId=xxx&name=yyy
   */
  uncordon: async (clusterId: string, name: string): Promise<Node> => {
    return requestClient.post(
      '/k8s/node/uncordon',
      {},
      { params: { clusterId, name } },
    );
  },

  /**
   * 驱逐 Node (Drain)
   * POST /k8s/node/drain?clusterId=xxx&name=yyy
   */
  drain: async (
    clusterId: string,
    name: string,
    options?: {
      deleteLocalData?: boolean;
      force?: boolean;
      ignoreDaemonsets?: boolean;
      timeout?: number;
    },
  ): Promise<{ message: string; success: boolean }> => {
    return requestClient.post('/k8s/node/drain', options || {}, {
      params: { clusterId, name },
    });
  },

  /**
   * 更新 Node 标签
   * PUT /k8s/node/labels?clusterId=xxx&name=yyy
   */
  updateLabels: async (
    clusterId: string,
    name: string,
    labels: Record<string, string>,
  ): Promise<Node> => {
    return requestClient.put(
      '/k8s/node/labels',
      { labels },
      { params: { clusterId, name } },
    );
  },

  /**
   * 更新 Node 污点
   * PUT /k8s/node/taints?clusterId=xxx&name=yyy
   */
  updateTaints: async (
    clusterId: string,
    name: string,
    taints: Array<{
      effect: 'NoExecute' | 'NoSchedule' | 'PreferNoSchedule';
      key: string;
      value?: string;
    }>,
  ): Promise<Node> => {
    return requestClient.put(
      '/k8s/node/taints',
      { taints },
      { params: { clusterId, name } },
    );
  },
};

export const getNodeList = nodeApi.list;
export const getNodeDetail = nodeApi.detail;
export const cordonNode = nodeApi.cordon;
export const uncordonNode = nodeApi.uncordon;
export const drainNode = nodeApi.drain;
export const updateNodeLabels = nodeApi.updateLabels;
export const updateNodeTaints = nodeApi.updateTaints;

// ==================== 集群管理 ====================

/**
 * 集群 API
 */
export const clusterApi = {
  /**
   * 获取集群列表
   * GET /k8s/clusters?page=xxx&pageSize=xxx
   */
  list: createMockableApi(
    async (params?: ClusterListParams): Promise<ClusterListResult> => {
      return requestClient.get('/k8s/clusters', { params });
    },
    async (params?: ClusterListParams): Promise<ClusterListResult> => {
      const { getMockClusterList } = await import('./mock');
      return getMockClusterList(params);
    },
  ),

  /**
   * 获取集群选择器列表
   * GET /k8s/clusters/options
   */
  options: async (): Promise<ClusterOption[]> => {
    return requestClient.get('/k8s/clusters/options');
  },

  /**
   * 获取集群详情
   * GET /k8s/cluster?clusterId=xxx
   */
  detail: async (id: string): Promise<Cluster> => {
    return requestClient.get('/k8s/cluster', {
      params: { clusterId: id },
    });
  },

  /**
   * 创建集群
   * POST /k8s/clusters
   */
  create: async (data: Partial<Cluster>): Promise<Cluster> => {
    return requestClient.post('/k8s/clusters', data);
  },

  /**
   * 更新集群
   * PUT /k8s/cluster?clusterId=xxx
   */
  update: async (id: string, data: Partial<Cluster>): Promise<Cluster> => {
    return requestClient.put('/k8s/cluster', data, {
      params: { clusterId: id },
    });
  },

  /**
   * 删除集群
   * DELETE /k8s/cluster?clusterId=xxx
   */
  delete: async (id: string): Promise<void> => {
    return requestClient.delete('/k8s/cluster', {
      params: { clusterId: id },
    });
  },

  /**
   * 获取集群监控指标
   * GET /k8s/cluster/metrics?clusterId=xxx
   */
  metrics: async (id: string): Promise<ClusterMetrics> => {
    return requestClient.get('/k8s/cluster/metrics', {
      params: { clusterId: id },
    });
  },
};

export const getClusterList = clusterApi.list;
export const getClusterOptions = clusterApi.options;
export const getClusterDetail = clusterApi.detail;
export const createCluster = clusterApi.create;
export const updateCluster = clusterApi.update;
export const deleteCluster = clusterApi.delete;
export const getClusterMetrics = clusterApi.metrics;

// ==================== 网络资源 ====================

/**
 * Ingress API
 */
const ingressApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'ingress',
    resourceTypePlural: 'ingresses',
    namespaced: true,
  }),
  'ingress',
);

export const ingressApi = ingressApiBase;
export const getIngressList = ingressApiBase.list;
export const getIngressDetail = ingressApiBase.detail;
export const createIngress = ingressApiBase.create;
export const updateIngress = ingressApiBase.update;
export const deleteIngress = ingressApiBase.delete;

// ==================== 存储资源 ====================

/**
 * PersistentVolume API
 */
const persistentVolumeApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'persistentvolume',
    namespaced: false, // PV 是集群级别资源
  }),
  'persistentvolume',
);

export const persistentVolumeApi = persistentVolumeApiBase;
export const pvApi = persistentVolumeApiBase; // 简短别名
export const getPersistentVolumeList = persistentVolumeApiBase.list;
export const getPersistentVolumeDetail = persistentVolumeApiBase.detail;
export const createPersistentVolume = persistentVolumeApiBase.create;
export const updatePersistentVolume = persistentVolumeApiBase.update;
export const deletePersistentVolume = persistentVolumeApiBase.delete;

/**
 * PersistentVolumeClaim API
 */
const persistentVolumeClaimApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'persistentvolumeclaim',
    namespaced: true,
  }),
  'persistentvolumeclaim',
);

export const persistentVolumeClaimApi = persistentVolumeClaimApiBase;
export const pvcApi = persistentVolumeClaimApiBase; // 简短别名
export const getPersistentVolumeClaimList = persistentVolumeClaimApiBase.list;
export const getPersistentVolumeClaimDetail =
  persistentVolumeClaimApiBase.detail;
export const createPersistentVolumeClaim = persistentVolumeClaimApiBase.create;
export const updatePersistentVolumeClaim = persistentVolumeClaimApiBase.update;
export const deletePersistentVolumeClaim = persistentVolumeClaimApiBase.delete;

/**
 * StorageClass API
 */
const storageClassApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'storageclass',
    resourceTypePlural: 'storageclasses',
    namespaced: false, // StorageClass 是集群级别资源
  }),
  'storageclass',
);

export const storageClassApi = storageClassApiBase;
export const getStorageClassList = storageClassApiBase.list;
export const getStorageClassDetail = storageClassApiBase.detail;
export const createStorageClass = storageClassApiBase.create;
export const updateStorageClass = storageClassApiBase.update;
export const deleteStorageClass = storageClassApiBase.delete;

// ==================== RBAC 权限资源 ====================

/**
 * ServiceAccount API
 */
const serviceAccountApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'serviceaccount',
    namespaced: true,
  }),
  'serviceaccount',
);

export const serviceAccountApi = serviceAccountApiBase;
export const getServiceAccountList = serviceAccountApiBase.list;
export const getServiceAccountDetail = serviceAccountApiBase.detail;
export const createServiceAccount = serviceAccountApiBase.create;
export const updateServiceAccount = serviceAccountApiBase.update;
export const deleteServiceAccount = serviceAccountApiBase.delete;

/**
 * Role API
 */
const roleApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'role',
    namespaced: true,
  }),
  'role',
);

export const roleApi = roleApiBase;
export const getRoleList = roleApiBase.list;
export const getRoleDetail = roleApiBase.detail;
export const createRole = roleApiBase.create;
export const updateRole = roleApiBase.update;
export const deleteRole = roleApiBase.delete;

/**
 * RoleBinding API
 */
const roleBindingApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'rolebinding',
    namespaced: true,
  }),
  'rolebinding',
);

export const roleBindingApi = roleBindingApiBase;
export const getRoleBindingList = roleBindingApiBase.list;
export const getRoleBindingDetail = roleBindingApiBase.detail;
export const createRoleBinding = roleBindingApiBase.create;
export const updateRoleBinding = roleBindingApiBase.update;
export const deleteRoleBinding = roleBindingApiBase.delete;

/**
 * ClusterRole API
 */
const clusterRoleApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'clusterrole',
    namespaced: false,
  }),
  'clusterrole',
);

export const clusterRoleApi = clusterRoleApiBase;
export const getClusterRoleList = clusterRoleApiBase.list;
export const getClusterRoleDetail = clusterRoleApiBase.detail;
export const createClusterRole = clusterRoleApiBase.create;
export const updateClusterRole = clusterRoleApiBase.update;
export const deleteClusterRole = clusterRoleApiBase.delete;

/**
 * ClusterRoleBinding API
 */
const clusterRoleBindingApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'clusterrolebinding',
    namespaced: false,
  }),
  'clusterrolebinding',
);

export const clusterRoleBindingApi = clusterRoleBindingApiBase;
export const getClusterRoleBindingList = clusterRoleBindingApiBase.list;
export const getClusterRoleBindingDetail = clusterRoleBindingApiBase.detail;
export const createClusterRoleBinding = clusterRoleBindingApiBase.create;
export const updateClusterRoleBinding = clusterRoleBindingApiBase.update;
export const deleteClusterRoleBinding = clusterRoleBindingApiBase.delete;

// ==================== 资源配额 ====================

/**
 * ResourceQuota API
 */
const resourceQuotaApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'resourcequota',
    namespaced: true,
  }),
  'resourcequota',
);

export const resourceQuotaApi = resourceQuotaApiBase;
export const getResourceQuotaList = resourceQuotaApiBase.list;
export const getResourceQuotaDetail = resourceQuotaApiBase.detail;
export const createResourceQuota = resourceQuotaApiBase.create;
export const updateResourceQuota = resourceQuotaApiBase.update;
export const deleteResourceQuota = resourceQuotaApiBase.delete;

/**
 * LimitRange API
 */
const limitRangeApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'limitrange',
    namespaced: true,
  }),
  'limitrange',
);

export const limitRangeApi = limitRangeApiBase;
export const getLimitRangeList = limitRangeApiBase.list;
export const getLimitRangeDetail = limitRangeApiBase.detail;
export const createLimitRange = limitRangeApiBase.create;
export const updateLimitRange = limitRangeApiBase.update;
export const deleteLimitRange = limitRangeApiBase.delete;

// ==================== 事件 ====================

/**
 * Event API
 */
const eventApiBase = createMockableResourceApi(
  createResourceApi<any>(requestClient, {
    resourceType: 'event',
    namespaced: true,
  }),
  'event',
);

export const eventApi = {
  ...eventApiBase,

  /**
   * AI 分析事件
   */
  analyzeEvent: async (
    clusterId: string,
    eventData: any,
  ): Promise<{
    analysis: string;
    confidence: number;
    recommendations?: string[];
    rootCause: string;
  }> => {
    return requestClient.post(
      'http://localhost:8083/api/v1/analyze/k8s-event',
      {
        cluster_id: clusterId,
        event: eventData,
        use_llm: true,
      },
      {
        timeout: 30_000, // 30秒超时，给 LLM 足够的响应时间
      },
    );
  },
};

export const getEventList = eventApiBase.list;
export const getEventDetail = eventApiBase.detail;

// ==================== 网络策略 ====================

/**
 * NetworkPolicy API
 */
const networkPolicyApiBase = createMockableResourceApi(
  createResourceApi<NetworkPolicy>(requestClient, {
    resourceType: 'networkpolicy',
    resourceTypePlural: 'networkpolicies',
    namespaced: true,
  }),
  'networkpolicy',
);

export const networkPolicyApi = networkPolicyApiBase;
export const getNetworkPolicyList = networkPolicyApiBase.list;
export const getNetworkPolicyDetail = networkPolicyApiBase.detail;
export const createNetworkPolicy = networkPolicyApiBase.create;
export const updateNetworkPolicy = networkPolicyApiBase.update;
export const deleteNetworkPolicy = networkPolicyApiBase.delete;

// ==================== 自动扩缩容 ====================

/**
 * HorizontalPodAutoscaler (HPA) API
 */
const horizontalPodAutoscalerApiBase = createMockableResourceApi(
  createResourceApi<HorizontalPodAutoscaler>(requestClient, {
    resourceType: 'horizontalpodautoscaler',
    resourceTypePlural: 'horizontalpodautoscalers',
    namespaced: true,
  }),
  'horizontalpodautoscaler',
);

export const horizontalPodAutoscalerApi = horizontalPodAutoscalerApiBase;
export const hpaApi = horizontalPodAutoscalerApiBase; // 简短别名
export const getHorizontalPodAutoscalerList =
  horizontalPodAutoscalerApiBase.list;
export const getHPAList = horizontalPodAutoscalerApiBase.list; // 简短别名
export const getHorizontalPodAutoscalerDetail =
  horizontalPodAutoscalerApiBase.detail;
export const getHPADetail = horizontalPodAutoscalerApiBase.detail; // 简短别名
export const createHorizontalPodAutoscaler =
  horizontalPodAutoscalerApiBase.create;
export const createHPA = horizontalPodAutoscalerApiBase.create; // 简短别名
export const updateHorizontalPodAutoscaler =
  horizontalPodAutoscalerApiBase.update;
export const updateHPA = horizontalPodAutoscalerApiBase.update; // 简短别名
export const deleteHorizontalPodAutoscaler =
  horizontalPodAutoscalerApiBase.delete;
export const deleteHPA = horizontalPodAutoscalerApiBase.delete; // 简短别名

// ==================== 调度与优先级 ====================

/**
 * PriorityClass API
 */
const priorityClassApiBase = createMockableResourceApi(
  createResourceApi<PriorityClass>(requestClient, {
    resourceType: 'priorityclass',
    resourceTypePlural: 'priorityclasses',
    namespaced: false, // PriorityClass 是集群级别资源
  }),
  'priorityclass',
);

export const priorityClassApi = priorityClassApiBase;
export const getPriorityClassList = priorityClassApiBase.list;
export const getPriorityClassDetail = priorityClassApiBase.detail;
export const createPriorityClass = priorityClassApiBase.create;
export const updatePriorityClass = priorityClassApiBase.update;
export const deletePriorityClass = priorityClassApiBase.delete;

// ==================== ReplicaSet ====================

/**
 * ReplicaSet API - 带扩展操作
 */
export const replicaSetApi = createMockableResourceApi(
  createResourceApiWithExtras<
    ReplicaSet,
    {
      scale: (
        clusterId: string,
        namespace: string,
        name: string,
        params: ScaleParams,
      ) => Promise<ReplicaSet>;
    }
  >(
    requestClient,
    {
      resourceType: 'replicaset',
      namespaced: true,
    },
    {
      /**
       * 扩缩容 ReplicaSet
       * PUT /k8s/replicaset/scale?clusterId=xxx&namespace=yyy&name=zzz
       */
      scale: (
        clusterId: string,
        namespace: string,
        name: string,
        scaleParams: ScaleParams,
      ) => {
        return requestClient.put(
          '/k8s/replicaset/scale',
          { replicas: scaleParams.replicas },
          { params: { clusterId, namespace, name } },
        );
      },
    },
  ),
  'replicaset',
);

export const getReplicaSetList = replicaSetApi.list;
export const getReplicaSetDetail = replicaSetApi.detail;
export const createReplicaSet = replicaSetApi.create;
export const updateReplicaSet = replicaSetApi.update;
export const deleteReplicaSet = replicaSetApi.delete;
export const scaleReplicaSet = replicaSetApi.scale;

// ==================== Endpoints ====================

/**
 * Endpoints API
 */
const endpointsApiBase = createMockableResourceApi(
  createResourceApi<Endpoints>(requestClient, {
    resourceType: 'endpoints',
    resourceTypePlural: 'endpoints', // 复数形式相同
    namespaced: true,
  }),
  'endpoints',
);

export const endpointsApi = endpointsApiBase;
export const getEndpointsList = endpointsApiBase.list;
export const getEndpointsDetail = endpointsApiBase.detail;
export const createEndpoints = endpointsApiBase.create;
export const updateEndpoints = endpointsApiBase.update;
export const deleteEndpoints = endpointsApiBase.delete;

/**
 * EndpointSlice API
 */
const endpointSliceApiBase = createMockableResourceApi(
  createResourceApi<EndpointSlice>(requestClient, {
    resourceType: 'endpointslice',
    namespaced: true,
  }),
  'endpointslice',
);

export const endpointSliceApi = endpointSliceApiBase;
export const getEndpointSliceList = endpointSliceApiBase.list;
export const getEndpointSliceDetail = endpointSliceApiBase.detail;
export const createEndpointSlice = endpointSliceApiBase.create;
export const updateEndpointSlice = endpointSliceApiBase.update;
export const deleteEndpointSlice = endpointSliceApiBase.delete;
