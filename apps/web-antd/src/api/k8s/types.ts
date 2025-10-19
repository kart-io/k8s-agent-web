/**
 * Kubernetes API 类型定义
 */

// ==================== 通用类型 ====================

export interface K8sMetadata {
  name: string;
  namespace?: string;
  uid?: string;
  resourceVersion?: string;
  creationTimestamp?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface K8sListMetadata {
  resourceVersion?: string;
  continue?: string;
  remainingItemCount?: number;
}

export interface K8sStatus {
  kind: 'Status';
  apiVersion: string;
  code: number;
  message: string;
  reason?: string;
}

// ==================== 集群管理 ====================

export interface Cluster {
  id: string;
  name: string;
  description?: string;
  apiServer: string;
  version: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  nodeCount: number;
  podCount: number;
  namespaceCount: number;
  createdAt: string;
  updatedAt: string;
  kubeconfig?: string;
}

export interface ClusterMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  podCount: number;
  nodeCount: number;
  namespaceCount: number;
}

export interface ClusterListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

export interface ClusterListResult {
  items: Cluster[];
  total: number;
}

// ==================== Pod 管理 ====================

export interface PodCondition {
  type: string;
  status: string;
  lastProbeTime?: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface ContainerStatus {
  name: string;
  state: {
    running?: { startedAt: string };
    terminated?: {
      exitCode: number;
      finishedAt: string;
      reason: string;
      startedAt: string;
    };
    waiting?: { message?: string; reason: string };
  };
  ready: boolean;
  restartCount: number;
  image: string;
  imageID?: string;
  containerID?: string;
}

export interface PodStatus {
  phase: 'Failed' | 'Pending' | 'Running' | 'Succeeded' | 'Unknown';
  conditions: PodCondition[];
  hostIP?: string;
  podIP?: string;
  podIPs?: Array<{ ip: string }>;
  startTime?: string;
  containerStatuses?: ContainerStatus[];
  qosClass?: string;
}

export interface Container {
  name: string;
  image: string;
  ports?: Array<{
    containerPort: number;
    name?: string;
    protocol?: string;
  }>;
  env?: Array<{
    name: string;
    value?: string;
    valueFrom?: any;
  }>;
  resources?: {
    limits?: { cpu?: string; memory?: string };
    requests?: { cpu?: string; memory?: string };
  };
  volumeMounts?: Array<{
    mountPath: string;
    name: string;
    readOnly?: boolean;
  }>;
}

export interface PodSpec {
  containers: Container[];
  restartPolicy?: string;
  nodeName?: string;
  serviceAccountName?: string;
  volumes?: any[];
}

export interface Pod {
  apiVersion: string;
  kind: 'Pod';
  metadata: K8sMetadata;
  spec: PodSpec;
  status: PodStatus;
}

export interface PodListParams {
  clusterId: string;
  namespace?: string;
  labelSelector?: string;
  fieldSelector?: string;
  page?: number;
  pageSize?: number;
}

export interface PodListResult {
  apiVersion: string;
  kind: 'PodList';
  metadata: K8sListMetadata;
  items: Pod[];
  total: number;
}

// ==================== Service 管理 ====================

export interface ServicePort {
  name?: string;
  protocol?: string;
  port: number;
  targetPort: number | string;
  nodePort?: number;
}

export interface ServiceSpec {
  type: 'ClusterIP' | 'ExternalName' | 'LoadBalancer' | 'NodePort';
  clusterIP?: string;
  clusterIPs?: string[];
  externalIPs?: string[];
  ports: ServicePort[];
  selector?: Record<string, string>;
  sessionAffinity?: string;
  loadBalancerIP?: string;
  externalName?: string;
}

export interface ServiceStatus {
  loadBalancer?: {
    ingress?: Array<{
      hostname?: string;
      ip?: string;
    }>;
  };
}

export interface Service {
  apiVersion: string;
  kind: 'Service';
  metadata: K8sMetadata;
  spec: ServiceSpec;
  status?: ServiceStatus;
}

export interface ServiceListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface ServiceListResult {
  apiVersion: string;
  kind: 'ServiceList';
  metadata: K8sListMetadata;
  items: Service[];
  total: number;
}

// ==================== ConfigMap 管理 ====================

export interface ConfigMap {
  apiVersion: string;
  kind: 'ConfigMap';
  metadata: K8sMetadata;
  data?: Record<string, string>;
  binaryData?: Record<string, string>;
  immutable?: boolean;
}

export interface ConfigMapListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface ConfigMapListResult {
  apiVersion: string;
  kind: 'ConfigMapList';
  metadata: K8sListMetadata;
  items: ConfigMap[];
  total: number;
}

// ==================== CronJob 管理 ====================

export interface JobTemplateSpec {
  metadata?: K8sMetadata;
  spec: {
    backoffLimit?: number;
    completions?: number;
    parallelism?: number;
    template: {
      metadata?: K8sMetadata;
      spec: PodSpec;
    };
  };
}

export interface CronJobSpec {
  schedule: string;
  timeZone?: string;
  startingDeadlineSeconds?: number;
  concurrencyPolicy?: 'Allow' | 'Forbid' | 'Replace';
  suspend?: boolean;
  jobTemplate: JobTemplateSpec;
  successfulJobsHistoryLimit?: number;
  failedJobsHistoryLimit?: number;
}

export interface CronJobStatus {
  active?: Array<{ name: string; namespace: string; uid: string }>;
  lastScheduleTime?: string;
  lastSuccessfulTime?: string;
}

export interface CronJob {
  apiVersion: string;
  kind: 'CronJob';
  metadata: K8sMetadata;
  spec: CronJobSpec;
  status?: CronJobStatus;
}

export interface CronJobListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface CronJobListResult {
  apiVersion: string;
  kind: 'CronJobList';
  metadata: K8sListMetadata;
  items: CronJob[];
  total: number;
}

// ==================== Deployment 管理 ====================

export interface DeploymentStrategy {
  type: 'Recreate' | 'RollingUpdate';
  rollingUpdate?: {
    maxSurge?: number | string;
    maxUnavailable?: number | string;
  };
}

export interface DeploymentSpec {
  replicas: number;
  selector: {
    matchExpressions?: any[];
    matchLabels: Record<string, string>;
  };
  template: {
    metadata: K8sMetadata;
    spec: PodSpec;
  };
  strategy?: DeploymentStrategy;
  minReadySeconds?: number;
  revisionHistoryLimit?: number;
  paused?: boolean;
  progressDeadlineSeconds?: number;
}

export interface DeploymentCondition {
  type: string;
  status: string;
  lastUpdateTime?: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface DeploymentStatus {
  observedGeneration?: number;
  replicas?: number;
  updatedReplicas?: number;
  readyReplicas?: number;
  availableReplicas?: number;
  unavailableReplicas?: number;
  conditions?: DeploymentCondition[];
  collisionCount?: number;
}

export interface Deployment {
  apiVersion: string;
  kind: 'Deployment';
  metadata: K8sMetadata;
  spec: DeploymentSpec;
  status?: DeploymentStatus;
}

export interface DeploymentListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface DeploymentListResult {
  apiVersion: string;
  kind: 'DeploymentList';
  metadata: K8sListMetadata;
  items: Deployment[];
  total: number;
}

// ==================== 其他资源 ====================

// Namespace
export interface Namespace {
  apiVersion: string;
  kind: 'Namespace';
  metadata: K8sMetadata;
  spec?: {
    finalizers?: string[];
  };
  status?: {
    phase: 'Active' | 'Terminating';
  };
}

export interface NamespaceListResult {
  apiVersion: string;
  kind: 'NamespaceList';
  metadata: K8sListMetadata;
  items: Namespace[];
  total: number;
}

// Node
export interface NodeAddress {
  type: 'ExternalIP' | 'Hostname' | 'InternalIP';
  address: string;
}

export interface NodeCondition {
  type: string;
  status: string;
  lastHeartbeatTime?: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface NodeStatus {
  capacity?: Record<string, string>;
  allocatable?: Record<string, string>;
  conditions?: NodeCondition[];
  addresses?: NodeAddress[];
  nodeInfo?: {
    architecture: string;
    bootID: string;
    containerRuntimeVersion: string;
    kernelVersion: string;
    kubeletVersion: string;
    kubeProxyVersion: string;
    machineID: string;
    operatingSystem: string;
    osImage: string;
    systemUUID: string;
  };
}

export interface Node {
  apiVersion: string;
  kind: 'Node';
  metadata: K8sMetadata;
  spec?: {
    podCIDR?: string;
    podCIDRs?: string[];
    taints?: any[];
  };
  status?: NodeStatus;
}

export interface NodeListResult {
  apiVersion: string;
  kind: 'NodeList';
  metadata: K8sListMetadata;
  items: Node[];
  total: number;
}

// Secret
export interface Secret {
  apiVersion: string;
  kind: 'Secret';
  metadata: K8sMetadata;
  type: string;
  data?: Record<string, string>;
  stringData?: Record<string, string>;
  immutable?: boolean;
}

export interface SecretListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface SecretListResult {
  apiVersion: string;
  kind: 'SecretList';
  metadata: K8sListMetadata;
  items: Secret[];
  total: number;
}

// StatefulSet
export interface StatefulSet {
  apiVersion: string;
  kind: 'StatefulSet';
  metadata: K8sMetadata;
  spec: {
    podManagementPolicy?: string;
    replicas: number;
    selector: {
      matchLabels: Record<string, string>;
    };
    serviceName: string;
    template: {
      metadata: K8sMetadata;
      spec: PodSpec;
    };
    updateStrategy?: any;
    volumeClaimTemplates?: any[];
  };
  status?: {
    collisionCount?: number;
    currentReplicas?: number;
    currentRevision?: string;
    observedGeneration?: number;
    readyReplicas?: number;
    replicas?: number;
    updatedReplicas?: number;
    updateRevision?: string;
  };
}

export interface StatefulSetListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface StatefulSetListResult {
  apiVersion: string;
  kind: 'StatefulSetList';
  metadata: K8sListMetadata;
  items: StatefulSet[];
  total: number;
}

// DaemonSet
export interface DaemonSet {
  apiVersion: string;
  kind: 'DaemonSet';
  metadata: K8sMetadata;
  spec: {
    minReadySeconds?: number;
    revisionHistoryLimit?: number;
    selector: {
      matchLabels: Record<string, string>;
    };
    template: {
      metadata: K8sMetadata;
      spec: PodSpec;
    };
    updateStrategy?: any;
  };
  status?: {
    currentNumberScheduled: number;
    desiredNumberScheduled: number;
    numberAvailable?: number;
    numberMisscheduled: number;
    numberReady: number;
    numberUnavailable?: number;
    observedGeneration?: number;
    updatedNumberScheduled?: number;
  };
}

export interface DaemonSetListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface DaemonSetListResult {
  apiVersion: string;
  kind: 'DaemonSetList';
  metadata: K8sListMetadata;
  items: DaemonSet[];
  total: number;
}

// Job
export interface Job {
  apiVersion: string;
  kind: 'Job';
  metadata: K8sMetadata;
  spec: {
    activeDeadlineSeconds?: number;
    backoffLimit?: number;
    completions?: number;
    parallelism?: number;
    template: {
      metadata?: K8sMetadata;
      spec: PodSpec;
    };
  };
  status?: {
    active?: number;
    completionTime?: string;
    conditions?: Array<{
      lastProbeTime?: string;
      lastTransitionTime?: string;
      message?: string;
      reason?: string;
      status: string;
      type: string;
    }>;
    failed?: number;
    startTime?: string;
    succeeded?: number;
  };
}

export interface JobListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface JobListResult {
  apiVersion: string;
  kind: 'JobList';
  metadata: K8sListMetadata;
  items: Job[];
  total: number;
}

// ==================== 操作相关类型 ====================

export interface K8sResourceAction {
  type: 'create' | 'delete' | 'exec' | 'logs' | 'restart' | 'scale' | 'update';
  resource: string;
  namespace?: string;
  name?: string;
  data?: any;
}

export interface PodLogsParams {
  clusterId: string;
  namespace: string;
  name: string;
  container?: string;
  follow?: boolean;
  previous?: boolean;
  sinceSeconds?: number;
  sinceTime?: string;
  timestamps?: boolean;
  tailLines?: number;
  limitBytes?: number;
}

export interface PodExecParams {
  clusterId: string;
  namespace: string;
  name: string;
  container?: string;
  command: string[];
  stdin?: boolean;
  stdout?: boolean;
  stderr?: boolean;
  tty?: boolean;
}

export interface ScaleParams {
  replicas: number;
}

export interface RestartParams {
  restartedAt?: string;
}
