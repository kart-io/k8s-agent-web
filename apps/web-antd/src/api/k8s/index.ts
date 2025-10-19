/**
 * Kubernetes API 接口
 */

import type {
  Cluster,
  ClusterListParams,
  ClusterListResult,
  ClusterMetrics,
  ConfigMap,
  ConfigMapListParams,
  ConfigMapListResult,
  CronJob,
  CronJobListParams,
  CronJobListResult,
  DaemonSet,
  DaemonSetListParams,
  DaemonSetListResult,
  Deployment,
  DeploymentListParams,
  DeploymentListResult,
  Job,
  JobListParams,
  JobListResult,
  Namespace,
  NamespaceListResult,
  Node,
  NodeListResult,
  Pod,
  PodExecParams,
  PodListParams,
  PodListResult,
  PodLogsParams,
  RestartParams,
  ScaleParams,
  Secret,
  SecretListParams,
  SecretListResult,
  Service,
  ServiceListParams,
  ServiceListResult,
  StatefulSet,
  StatefulSetListParams,
  StatefulSetListResult,
} from './types';

import { requestClient } from '../request';

// ==================== 集群管理 ====================

/**
 * 获取集群列表
 */
export async function getClusterList(
  params?: ClusterListParams,
): Promise<ClusterListResult> {
  return requestClient.get('/k8s/clusters', { params });
}

/**
 * 获取集群详情
 */
export async function getClusterDetail(id: string): Promise<Cluster> {
  return requestClient.get(`/k8s/clusters/${id}`);
}

/**
 * 创建集群
 */
export async function createCluster(data: Partial<Cluster>): Promise<Cluster> {
  return requestClient.post('/k8s/clusters', data);
}

/**
 * 更新集群
 */
export async function updateCluster(
  id: string,
  data: Partial<Cluster>,
): Promise<Cluster> {
  return requestClient.put(`/k8s/clusters/${id}`, data);
}

/**
 * 删除集群
 */
export async function deleteCluster(id: string): Promise<void> {
  return requestClient.delete(`/k8s/clusters/${id}`);
}

/**
 * 获取集群监控指标
 */
export async function getClusterMetrics(id: string): Promise<ClusterMetrics> {
  return requestClient.get(`/k8s/clusters/${id}/metrics`);
}

// ==================== Pod 管理 ====================

/**
 * 获取 Pod 列表
 */
export async function getPodList(
  params: PodListParams,
): Promise<PodListResult> {
  return requestClient.get('/k8s/pods', { params });
}

/**
 * 获取 Pod 详情
 */
export async function getPodDetail(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<Pod> {
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}`,
  );
}

/**
 * 创建 Pod
 */
export async function createPod(
  clusterId: string,
  namespace: string,
  data: Pod,
): Promise<Pod> {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods`,
    data,
  );
}

/**
 * 更新 Pod
 */
export async function updatePod(
  clusterId: string,
  namespace: string,
  name: string,
  data: Pod,
): Promise<Pod> {
  return requestClient.put(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}`,
    data,
  );
}

/**
 * 删除 Pod
 */
export async function deletePod(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<void> {
  return requestClient.delete(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}`,
  );
}

/**
 * 获取 Pod 日志
 */
export async function getPodLogs(params: PodLogsParams): Promise<string> {
  const { clusterId, namespace, name, ...queryParams } = params;
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}/logs`,
    {
      params: queryParams,
    },
  );
}

/**
 * 执行 Pod 命令
 */
export async function execPod(params: PodExecParams): Promise<string> {
  const { clusterId, namespace, name, ...data } = params;
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/pods/${name}/exec`,
    data,
  );
}

// ==================== Service 管理 ====================

/**
 * 获取 Service 列表
 */
export async function getServiceList(
  params: ServiceListParams,
): Promise<ServiceListResult> {
  return requestClient.get('/k8s/services', { params });
}

/**
 * 获取 Service 详情
 */
export async function getServiceDetail(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<Service> {
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/services/${name}`,
  );
}

/**
 * 创建 Service
 */
export async function createService(
  clusterId: string,
  namespace: string,
  data: Service,
): Promise<Service> {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/services`,
    data,
  );
}

/**
 * 更新 Service
 */
export async function updateService(
  clusterId: string,
  namespace: string,
  name: string,
  data: Service,
): Promise<Service> {
  return requestClient.put(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/services/${name}`,
    data,
  );
}

/**
 * 删除 Service
 */
export async function deleteService(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<void> {
  return requestClient.delete(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/services/${name}`,
  );
}

// ==================== ConfigMap 管理 ====================

/**
 * 获取 ConfigMap 列表
 */
export async function getConfigMapList(
  params: ConfigMapListParams,
): Promise<ConfigMapListResult> {
  return requestClient.get('/k8s/configmaps', { params });
}

/**
 * 获取 ConfigMap 详情
 */
export async function getConfigMapDetail(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<ConfigMap> {
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/configmaps/${name}`,
  );
}

/**
 * 创建 ConfigMap
 */
export async function createConfigMap(
  clusterId: string,
  namespace: string,
  data: ConfigMap,
): Promise<ConfigMap> {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/configmaps`,
    data,
  );
}

/**
 * 更新 ConfigMap
 */
export async function updateConfigMap(
  clusterId: string,
  namespace: string,
  name: string,
  data: ConfigMap,
): Promise<ConfigMap> {
  return requestClient.put(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/configmaps/${name}`,
    data,
  );
}

/**
 * 删除 ConfigMap
 */
export async function deleteConfigMap(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<void> {
  return requestClient.delete(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/configmaps/${name}`,
  );
}

// ==================== CronJob 管理 ====================

/**
 * 获取 CronJob 列表
 */
export async function getCronJobList(
  params: CronJobListParams,
): Promise<CronJobListResult> {
  return requestClient.get('/k8s/cronjobs', { params });
}

/**
 * 获取 CronJob 详情
 */
export async function getCronJobDetail(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<CronJob> {
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/cronjobs/${name}`,
  );
}

/**
 * 创建 CronJob
 */
export async function createCronJob(
  clusterId: string,
  namespace: string,
  data: CronJob,
): Promise<CronJob> {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/cronjobs`,
    data,
  );
}

/**
 * 更新 CronJob
 */
export async function updateCronJob(
  clusterId: string,
  namespace: string,
  name: string,
  data: CronJob,
): Promise<CronJob> {
  return requestClient.put(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/cronjobs/${name}`,
    data,
  );
}

/**
 * 删除 CronJob
 */
export async function deleteCronJob(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<void> {
  return requestClient.delete(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/cronjobs/${name}`,
  );
}

/**
 * 暂停/恢复 CronJob
 */
export async function toggleCronJob(
  clusterId: string,
  namespace: string,
  name: string,
  suspend: boolean,
): Promise<CronJob> {
  return requestClient.patch(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/cronjobs/${name}`,
    {
      spec: { suspend },
    },
  );
}

// ==================== Deployment 管理 ====================

/**
 * 获取 Deployment 列表
 */
export async function getDeploymentList(
  params: DeploymentListParams,
): Promise<DeploymentListResult> {
  return requestClient.get('/k8s/deployments', { params });
}

/**
 * 获取 Deployment 详情
 */
export async function getDeploymentDetail(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<Deployment> {
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments/${name}`,
  );
}

/**
 * 创建 Deployment
 */
export async function createDeployment(
  clusterId: string,
  namespace: string,
  data: Deployment,
): Promise<Deployment> {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments`,
    data,
  );
}

/**
 * 更新 Deployment
 */
export async function updateDeployment(
  clusterId: string,
  namespace: string,
  name: string,
  data: Deployment,
): Promise<Deployment> {
  return requestClient.put(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments/${name}`,
    data,
  );
}

/**
 * 删除 Deployment
 */
export async function deleteDeployment(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<void> {
  return requestClient.delete(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments/${name}`,
  );
}

/**
 * 扩缩容 Deployment
 */
export async function scaleDeployment(
  clusterId: string,
  namespace: string,
  name: string,
  params: ScaleParams,
): Promise<Deployment> {
  return requestClient.patch(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments/${name}/scale`,
    params,
  );
}

/**
 * 重启 Deployment
 */
export async function restartDeployment(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<Deployment> {
  const restartParams: RestartParams = {
    restartedAt: new Date().toISOString(),
  };
  return requestClient.patch(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments/${name}/restart`,
    restartParams,
  );
}

// ==================== 其他资源管理 ====================

/**
 * 获取 Namespace 列表
 */
export async function getNamespaceList(
  clusterId: string,
): Promise<NamespaceListResult> {
  return requestClient.get(`/k8s/clusters/${clusterId}/namespaces`);
}

/**
 * 获取 Namespace 详情
 */
export async function getNamespaceDetail(
  clusterId: string,
  name: string,
): Promise<Namespace> {
  return requestClient.get(`/k8s/clusters/${clusterId}/namespaces/${name}`);
}

/**
 * 创建 Namespace
 */
export async function createNamespace(
  clusterId: string,
  data: Namespace,
): Promise<Namespace> {
  return requestClient.post(`/k8s/clusters/${clusterId}/namespaces`, data);
}

/**
 * 删除 Namespace
 */
export async function deleteNamespace(
  clusterId: string,
  name: string,
): Promise<void> {
  return requestClient.delete(`/k8s/clusters/${clusterId}/namespaces/${name}`);
}

/**
 * 获取 Node 列表
 */
export async function getNodeList(clusterId: string): Promise<NodeListResult> {
  return requestClient.get(`/k8s/clusters/${clusterId}/nodes`);
}

/**
 * 获取 Node 详情
 */
export async function getNodeDetail(
  clusterId: string,
  name: string,
): Promise<Node> {
  return requestClient.get(`/k8s/clusters/${clusterId}/nodes/${name}`);
}

/**
 * 获取 Secret 列表
 */
export async function getSecretList(
  params: SecretListParams,
): Promise<SecretListResult> {
  return requestClient.get('/k8s/secrets', { params });
}

/**
 * 获取 Secret 详情
 */
export async function getSecretDetail(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<Secret> {
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/secrets/${name}`,
  );
}

/**
 * 创建 Secret
 */
export async function createSecret(
  clusterId: string,
  namespace: string,
  data: Secret,
): Promise<Secret> {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/secrets`,
    data,
  );
}

/**
 * 更新 Secret
 */
export async function updateSecret(
  clusterId: string,
  namespace: string,
  name: string,
  data: Secret,
): Promise<Secret> {
  return requestClient.put(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/secrets/${name}`,
    data,
  );
}

/**
 * 删除 Secret
 */
export async function deleteSecret(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<void> {
  return requestClient.delete(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/secrets/${name}`,
  );
}

/**
 * 获取 StatefulSet 列表
 */
export async function getStatefulSetList(
  params: StatefulSetListParams,
): Promise<StatefulSetListResult> {
  return requestClient.get('/k8s/statefulsets', { params });
}

/**
 * 获取 StatefulSet 详情
 */
export async function getStatefulSetDetail(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<StatefulSet> {
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/statefulsets/${name}`,
  );
}

/**
 * 创建 StatefulSet
 */
export async function createStatefulSet(
  clusterId: string,
  namespace: string,
  data: StatefulSet,
): Promise<StatefulSet> {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/statefulsets`,
    data,
  );
}

/**
 * 删除 StatefulSet
 */
export async function deleteStatefulSet(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<void> {
  return requestClient.delete(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/statefulsets/${name}`,
  );
}

/**
 * 扩缩容 StatefulSet
 */
export async function scaleStatefulSet(
  clusterId: string,
  namespace: string,
  name: string,
  params: ScaleParams,
): Promise<StatefulSet> {
  return requestClient.patch(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/statefulsets/${name}/scale`,
    params,
  );
}

/**
 * 获取 DaemonSet 列表
 */
export async function getDaemonSetList(
  params: DaemonSetListParams,
): Promise<DaemonSetListResult> {
  return requestClient.get('/k8s/daemonsets', { params });
}

/**
 * 获取 DaemonSet 详情
 */
export async function getDaemonSetDetail(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<DaemonSet> {
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/daemonsets/${name}`,
  );
}

/**
 * 创建 DaemonSet
 */
export async function createDaemonSet(
  clusterId: string,
  namespace: string,
  data: DaemonSet,
): Promise<DaemonSet> {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/daemonsets`,
    data,
  );
}

/**
 * 删除 DaemonSet
 */
export async function deleteDaemonSet(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<void> {
  return requestClient.delete(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/daemonsets/${name}`,
  );
}

/**
 * 获取 Job 列表
 */
export async function getJobList(
  params: JobListParams,
): Promise<JobListResult> {
  return requestClient.get('/k8s/jobs', { params });
}

/**
 * 获取 Job 详情
 */
export async function getJobDetail(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<Job> {
  return requestClient.get(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/jobs/${name}`,
  );
}

/**
 * 创建 Job
 */
export async function createJob(
  clusterId: string,
  namespace: string,
  data: Job,
): Promise<Job> {
  return requestClient.post(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/jobs`,
    data,
  );
}

/**
 * 删除 Job
 */
export async function deleteJob(
  clusterId: string,
  namespace: string,
  name: string,
): Promise<void> {
  return requestClient.delete(
    `/k8s/clusters/${clusterId}/namespaces/${namespace}/jobs/${name}`,
  );
}
