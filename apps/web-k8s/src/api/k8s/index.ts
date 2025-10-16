/**
 * Kubernetes API 接口 - 使用工厂函数优化版本
 * 代码量从 874 行减少到约 300 行
 */

import type {
  Cluster,
  ClusterListParams,
  ClusterListResult,
  ClusterMetrics,
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
import {
  createResourceApi,
  createResourceApiWithExtras,
} from './resource-api-factory';

// ==================== 使用工厂函数创建资源 API ====================

/**
 * Pod API
 */
const podApiBase = createResourceApi<Pod>(requestClient, {
  resourceType: 'pod',
  namespaced: true,
});

export const podApi = {
  ...podApiBase,

  /**
   * 获取 Pod 日志
   */
  logs: async (params: PodLogsParams): Promise<string> => {
    const { clusterId, namespace, name, ...queryParams } = params;

    // 导入并使用 mock 数据
    const { getMockPodLogs } = await import('./mock');
    return getMockPodLogs({
      clusterId,
      namespace,
      name,
      container: queryParams.container,
      timestamps: queryParams.timestamps,
      tailLines: queryParams.tailLines,
    });

    // 实际 API 调用（当后端准备好时使用）
    // return requestClient.get(
    //   `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}/logs`,
    //   { params: queryParams },
    // );
  },

  /**
   * 执行 Pod 命令
   */
  exec: async (params: PodExecParams): Promise<string> => {
    const { clusterId, namespace, name, ...data } = params;
    return requestClient.post(
      `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}/exec`,
      data,
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
const serviceApiBase = createResourceApi<Service>(requestClient, {
  resourceType: 'service',
  namespaced: true,
});

export const serviceApi = serviceApiBase;
export const getServiceList = serviceApiBase.list;
export const getServiceDetail = serviceApiBase.detail;
export const createService = serviceApiBase.create;
export const updateService = serviceApiBase.update;
export const deleteService = serviceApiBase.delete;

/**
 * ConfigMap API
 */
const configMapApiBase = createResourceApi<ConfigMap>(requestClient, {
  resourceType: 'configmap',
  namespaced: true,
});

export const configMapApi = configMapApiBase;
export const getConfigMapList = configMapApiBase.list;
export const getConfigMapDetail = configMapApiBase.detail;
export const createConfigMap = configMapApiBase.create;
export const updateConfigMap = configMapApiBase.update;
export const deleteConfigMap = configMapApiBase.delete;

/**
 * Secret API
 */
const secretApiBase = createResourceApi<Secret>(requestClient, {
  resourceType: 'secret',
  namespaced: true,
});

export const secretApi = secretApiBase;
export const getSecretList = secretApiBase.list;
export const getSecretDetail = secretApiBase.detail;
export const createSecret = secretApiBase.create;
export const updateSecret = secretApiBase.update;
export const deleteSecret = secretApiBase.delete;

/**
 * Deployment API - 带扩展操作
 */
export const deploymentApi = createResourceApiWithExtras<
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
     */
    scale: (
      clusterId: string,
      namespace: string,
      name: string,
      params: ScaleParams,
    ) => {
      return requestClient.post(
        `/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments/${name}/scale`,
        params,
      );
    },

    /**
     * 重启 Deployment
     */
    restart: (clusterId: string, namespace: string, name: string) => {
      const restartParams: RestartParams = {
        restartedAt: new Date().toISOString(),
      };
      return requestClient.post(
        `/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments/${name}/restart`,
        restartParams,
      );
    },
  },
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
export const statefulSetApi = createResourceApiWithExtras<
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
    scale: (
      clusterId: string,
      namespace: string,
      name: string,
      params: ScaleParams,
    ) => {
      return requestClient.post(
        `/k8s/clusters/${clusterId}/namespaces/${namespace}/statefulsets/${name}/scale`,
        params,
      );
    },
  },
);

export const getStatefulSetList = statefulSetApi.list;
export const getStatefulSetDetail = statefulSetApi.detail;
export const createStatefulSet = statefulSetApi.create;
export const deleteStatefulSet = statefulSetApi.delete;
export const scaleStatefulSet = statefulSetApi.scale;

/**
 * DaemonSet API
 */
const daemonSetApiBase = createResourceApi<DaemonSet>(requestClient, {
  resourceType: 'daemonset',
  namespaced: true,
});

export const daemonSetApi = daemonSetApiBase;
export const getDaemonSetList = daemonSetApiBase.list;
export const getDaemonSetDetail = daemonSetApiBase.detail;
export const createDaemonSet = daemonSetApiBase.create;
export const deleteDaemonSet = daemonSetApiBase.delete;

/**
 * Job API
 */
const jobApiBase = createResourceApi<Job>(requestClient, {
  resourceType: 'job',
  namespaced: true,
});

export const jobApi = jobApiBase;
export const getJobList = jobApiBase.list;
export const getJobDetail = jobApiBase.detail;
export const createJob = jobApiBase.create;
export const deleteJob = jobApiBase.delete;

/**
 * CronJob API - 带扩展操作
 */
export const cronJobApi = createResourceApiWithExtras<
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
     */
    toggle: (
      clusterId: string,
      namespace: string,
      name: string,
      suspend: boolean,
    ) => {
      return requestClient.put(
        `/k8s/clusters/${clusterId}/namespaces/${namespace}/cronjobs/${name}`,
        {
          spec: { suspend },
        },
      );
    },
  },
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
   */
  list: async (clusterId: string) => {
    return requestClient.get(`/k8s/clusters/${clusterId}/namespaces`);
  },

  /**
   * 获取 Namespace 详情
   */
  detail: async (clusterId: string, name: string): Promise<Namespace> => {
    return requestClient.get(`/k8s/clusters/${clusterId}/namespaces/${name}`);
  },

  /**
   * 创建 Namespace
   */
  create: async (clusterId: string, data: Namespace): Promise<Namespace> => {
    return requestClient.post(`/k8s/clusters/${clusterId}/namespaces`, data);
  },

  /**
   * 删除 Namespace
   */
  delete: async (clusterId: string, name: string): Promise<void> => {
    return requestClient.delete(
      `/k8s/clusters/${clusterId}/namespaces/${name}`,
    );
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
   */
  list: async (clusterId: string) => {
    return requestClient.get(`/k8s/clusters/${clusterId}/nodes`);
  },

  /**
   * 获取 Node 详情
   */
  detail: async (clusterId: string, name: string): Promise<Node> => {
    return requestClient.get(`/k8s/clusters/${clusterId}/nodes/${name}`);
  },

  /**
   * 封锁 Node (Cordon)
   */
  cordon: async (clusterId: string, name: string): Promise<Node> => {
    return requestClient.post(
      `/k8s/clusters/${clusterId}/nodes/${name}/cordon`,
    );
  },

  /**
   * 解除封锁 Node (Uncordon)
   */
  uncordon: async (clusterId: string, name: string): Promise<Node> => {
    return requestClient.post(
      `/k8s/clusters/${clusterId}/nodes/${name}/uncordon`,
    );
  },

  /**
   * 驱逐 Node (Drain)
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
    return requestClient.post(
      `/k8s/clusters/${clusterId}/nodes/${name}/drain`,
      options,
    );
  },

  /**
   * 更新 Node 标签
   */
  updateLabels: async (
    clusterId: string,
    name: string,
    labels: Record<string, string>,
  ): Promise<Node> => {
    return requestClient.put(
      `/k8s/clusters/${clusterId}/nodes/${name}/labels`,
      { labels },
    );
  },

  /**
   * 更新 Node 污点
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
      `/k8s/clusters/${clusterId}/nodes/${name}/taints`,
      { taints },
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
   */
  list: async (params?: ClusterListParams): Promise<ClusterListResult> => {
    return requestClient.get('/k8s/clusters', { params });
  },

  /**
   * 获取集群详情
   */
  detail: async (id: string): Promise<Cluster> => {
    return requestClient.get(`/k8s/clusters/${id}`);
  },

  /**
   * 创建集群
   */
  create: async (data: Partial<Cluster>): Promise<Cluster> => {
    return requestClient.post('/k8s/clusters', data);
  },

  /**
   * 更新集群
   */
  update: async (id: string, data: Partial<Cluster>): Promise<Cluster> => {
    return requestClient.put(`/k8s/clusters/${id}`, data);
  },

  /**
   * 删除集群
   */
  delete: async (id: string): Promise<void> => {
    return requestClient.delete(`/k8s/clusters/${id}`);
  },

  /**
   * 获取集群监控指标
   */
  metrics: async (id: string): Promise<ClusterMetrics> => {
    return requestClient.get(`/k8s/clusters/${id}/metrics`);
  },
};

export const getClusterList = clusterApi.list;
export const getClusterDetail = clusterApi.detail;
export const createCluster = clusterApi.create;
export const updateCluster = clusterApi.update;
export const deleteCluster = clusterApi.delete;
export const getClusterMetrics = clusterApi.metrics;

// ==================== 网络资源 ====================

/**
 * Ingress API
 */
const ingressApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'ingress',
  resourceTypePlural: 'ingresses',
  namespaced: true,
});

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
const persistentVolumeApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'persistentvolume',
  namespaced: false, // PV 是集群级别资源
});

export const persistentVolumeApi = persistentVolumeApiBase;
export const getPersistentVolumeList = persistentVolumeApiBase.list;
export const getPersistentVolumeDetail = persistentVolumeApiBase.detail;
export const createPersistentVolume = persistentVolumeApiBase.create;
export const updatePersistentVolume = persistentVolumeApiBase.update;
export const deletePersistentVolume = persistentVolumeApiBase.delete;

/**
 * PersistentVolumeClaim API
 */
const persistentVolumeClaimApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'persistentvolumeclaim',
  namespaced: true,
});

export const persistentVolumeClaimApi = persistentVolumeClaimApiBase;
export const getPersistentVolumeClaimList = persistentVolumeClaimApiBase.list;
export const getPersistentVolumeClaimDetail =
  persistentVolumeClaimApiBase.detail;
export const createPersistentVolumeClaim = persistentVolumeClaimApiBase.create;
export const updatePersistentVolumeClaim = persistentVolumeClaimApiBase.update;
export const deletePersistentVolumeClaim = persistentVolumeClaimApiBase.delete;

/**
 * StorageClass API
 */
const storageClassApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'storageclass',
  resourceTypePlural: 'storageclasses',
  namespaced: false, // StorageClass 是集群级别资源
});

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
const serviceAccountApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'serviceaccount',
  namespaced: true,
});

export const serviceAccountApi = serviceAccountApiBase;
export const getServiceAccountList = serviceAccountApiBase.list;
export const getServiceAccountDetail = serviceAccountApiBase.detail;
export const createServiceAccount = serviceAccountApiBase.create;
export const updateServiceAccount = serviceAccountApiBase.update;
export const deleteServiceAccount = serviceAccountApiBase.delete;

/**
 * Role API
 */
const roleApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'role',
  namespaced: true,
});

export const roleApi = roleApiBase;
export const getRoleList = roleApiBase.list;
export const getRoleDetail = roleApiBase.detail;
export const createRole = roleApiBase.create;
export const updateRole = roleApiBase.update;
export const deleteRole = roleApiBase.delete;

/**
 * RoleBinding API
 */
const roleBindingApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'rolebinding',
  namespaced: true,
});

export const roleBindingApi = roleBindingApiBase;
export const getRoleBindingList = roleBindingApiBase.list;
export const getRoleBindingDetail = roleBindingApiBase.detail;
export const createRoleBinding = roleBindingApiBase.create;
export const updateRoleBinding = roleBindingApiBase.update;
export const deleteRoleBinding = roleBindingApiBase.delete;

/**
 * ClusterRole API
 */
const clusterRoleApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'clusterrole',
  namespaced: false,
});

export const clusterRoleApi = clusterRoleApiBase;
export const getClusterRoleList = clusterRoleApiBase.list;
export const getClusterRoleDetail = clusterRoleApiBase.detail;
export const createClusterRole = clusterRoleApiBase.create;
export const updateClusterRole = clusterRoleApiBase.update;
export const deleteClusterRole = clusterRoleApiBase.delete;

/**
 * ClusterRoleBinding API
 */
const clusterRoleBindingApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'clusterrolebinding',
  namespaced: false,
});

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
const resourceQuotaApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'resourcequota',
  namespaced: true,
});

export const resourceQuotaApi = resourceQuotaApiBase;
export const getResourceQuotaList = resourceQuotaApiBase.list;
export const getResourceQuotaDetail = resourceQuotaApiBase.detail;
export const createResourceQuota = resourceQuotaApiBase.create;
export const updateResourceQuota = resourceQuotaApiBase.update;
export const deleteResourceQuota = resourceQuotaApiBase.delete;

/**
 * LimitRange API
 */
const limitRangeApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'limitrange',
  namespaced: true,
});

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
const eventApiBase = createResourceApi<any>(requestClient, {
  resourceType: 'event',
  namespaced: true,
});

export const eventApi = eventApiBase;
export const getEventList = eventApiBase.list;
export const getEventDetail = eventApiBase.detail;

// ==================== 网络策略 ====================

/**
 * NetworkPolicy API
 */
const networkPolicyApiBase = createResourceApi<NetworkPolicy>(requestClient, {
  resourceType: 'networkpolicy',
  resourceTypePlural: 'networkpolicies',
  namespaced: true,
});

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
const horizontalPodAutoscalerApiBase = createResourceApi<HorizontalPodAutoscaler>(
  requestClient,
  {
    resourceType: 'horizontalpodautoscaler',
    resourceTypePlural: 'horizontalpodautoscalers',
    namespaced: true,
  },
);

export const horizontalPodAutoscalerApi = horizontalPodAutoscalerApiBase;
export const hpaApi = horizontalPodAutoscalerApiBase; // 简短别名
export const getHorizontalPodAutoscalerList = horizontalPodAutoscalerApiBase.list;
export const getHPAList = horizontalPodAutoscalerApiBase.list; // 简短别名
export const getHorizontalPodAutoscalerDetail = horizontalPodAutoscalerApiBase.detail;
export const getHPADetail = horizontalPodAutoscalerApiBase.detail; // 简短别名
export const createHorizontalPodAutoscaler = horizontalPodAutoscalerApiBase.create;
export const createHPA = horizontalPodAutoscalerApiBase.create; // 简短别名
export const updateHorizontalPodAutoscaler = horizontalPodAutoscalerApiBase.update;
export const updateHPA = horizontalPodAutoscalerApiBase.update; // 简短别名
export const deleteHorizontalPodAutoscaler = horizontalPodAutoscalerApiBase.delete;
export const deleteHPA = horizontalPodAutoscalerApiBase.delete; // 简短别名

// ==================== 调度与优先级 ====================

/**
 * PriorityClass API
 */
const priorityClassApiBase = createResourceApi<PriorityClass>(requestClient, {
  resourceType: 'priorityclass',
  resourceTypePlural: 'priorityclasses',
  namespaced: false, // PriorityClass 是集群级别资源
});

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
export const replicaSetApi = createResourceApiWithExtras<
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
     */
    scale: (
      clusterId: string,
      namespace: string,
      name: string,
      params: ScaleParams,
    ) => {
      return requestClient.post(
        `/k8s/clusters/${clusterId}/namespaces/${namespace}/replicasets/${name}/scale`,
        params,
      );
    },
  },
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
const endpointsApiBase = createResourceApi<Endpoints>(requestClient, {
  resourceType: 'endpoints',
  resourceTypePlural: 'endpoints', // 复数形式相同
  namespaced: true,
});

export const endpointsApi = endpointsApiBase;
export const getEndpointsList = endpointsApiBase.list;
export const getEndpointsDetail = endpointsApiBase.detail;
export const createEndpoints = endpointsApiBase.create;
export const updateEndpoints = endpointsApiBase.update;
export const deleteEndpoints = endpointsApiBase.delete;

/**
 * EndpointSlice API
 */
const endpointSliceApiBase = createResourceApi<EndpointSlice>(requestClient, {
  resourceType: 'endpointslice',
  namespaced: true,
});

export const endpointSliceApi = endpointSliceApiBase;
export const getEndpointSliceList = endpointSliceApiBase.list;
export const getEndpointSliceDetail = endpointSliceApiBase.detail;
export const createEndpointSlice = endpointSliceApiBase.create;
export const updateEndpointSlice = endpointSliceApiBase.update;
export const deleteEndpointSlice = endpointSliceApiBase.delete;
