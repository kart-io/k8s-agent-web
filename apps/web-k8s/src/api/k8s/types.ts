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
  description: string;
  endpoint: string;
  version: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  region: string;
  provider: string;
  labels: null | Record<string, string>;
  createdAt: string;
  updatedAt: string;
  kubeconfig?: string;
  // Cluster statistics (returned by detail API)
  nodeCount?: number;
  podCount?: number;
  namespaceCount?: number;
  resources?: {
    cpu: {
      total: number;
      used: number;
    };
    memory: {
      total: number;
      used: number;
    };
  };
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

export interface ClusterOption {
  label: string;
  value: string;
}

export interface CreateClusterRequest {
  name: string;
  description?: string;
  endpoint: string;
  kubeconfig: string;
  region?: string;
  provider?: string;
  labels?: Record<string, string>;
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

/**
 * Pod 列表项 - 扁平化数据结构（用于列表显示）
 */
export interface PodListItem {
  /** Pod 名称 */
  name: string;
  /** 命名空间 */
  namespace: string;
  /** 状态 */
  status: 'Failed' | 'Pending' | 'Running' | 'Succeeded' | 'Unknown';
  /** Pod IP */
  podIP?: string;
  /** 节点名称 */
  nodeName?: string;
  /** 重启次数 */
  restartCount?: number;
  /** 容器数量 */
  containerCount?: number;
  /** 就绪容器数量 */
  readyCount?: number;
  /** 创建时间 */
  createdAt: string;
  /** 标签 */
  labels?: Record<string, string>;
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

/**
 * Service 列表项（扁平化结构，用于列表展示）
 */
export interface ServiceListItem {
  /** Service 名称 */
  name: string;
  /** 命名空间 */
  namespace: string;
  /** 服务类型 */
  type: 'ClusterIP' | 'ExternalName' | 'LoadBalancer' | 'NodePort';
  /** Cluster IP */
  clusterIP?: string;
  /** 端口列表 */
  ports: ServicePort[];
  /** 创建时间 */
  createdAt: string;
  /** 标签 */
  labels?: Record<string, string>;
}

// ==================== ConfigMap 管理 ====================

// ConfigMap - 扁平数据结构（匹配后端返回）
export interface ConfigMap {
  name: string; // ConfigMap 名称
  namespace: string; // 命名空间
  data?: Record<string, string>; // 配置数据（键值对）
  binaryData?: Record<string, string>; // 二进制数据（base64 编码）
  labels?: Record<string, string>; // 标签
  annotations?: Record<string, string>; // 注解
  immutable?: boolean; // 是否不可变
  createdAt: string; // 创建时间
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

/**
 * Deployment 列表项 - 扁平化数据结构（用于列表显示）
 */
export interface DeploymentListItem {
  /** Deployment 名称 */
  name: string;
  /** 命名空间 */
  namespace: string;
  /** 副本数 */
  replicas: number;
  /** 就绪副本数 */
  readyReplicas?: number;
  /** 可用副本数 */
  availableReplicas?: number;
  /** 更新的副本数 */
  updatedReplicas?: number;
  /** 创建时间 */
  createdAt: string;
  /** 标签 */
  labels?: Record<string, string>;
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

/**
 * Namespace 列表项 - 扁平化数据结构（用于列表显示）
 */
export interface NamespaceListItem {
  /** 命名空间名称 */
  name: string;
  /** 状态 */
  status: 'Active' | 'Terminating';
  /** 标签 */
  labels?: Record<string, string>;
  /** 注解 */
  annotations?: Record<string, string>;
  /** 创建时间 */
  createdAt: string;
  /** Pod 数量 */
  podCount?: number;
  /** 资源配额 */
  resourceQuota?: {
    hard?: Record<string, string>;
    used?: Record<string, string>;
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

export interface NodeSpec {
  podCIDR?: string;
  podCIDRs?: string[];
  providerID?: string;
  unschedulable?: boolean;
  taints?: Array<{
    effect: 'NoExecute' | 'NoSchedule' | 'PreferNoSchedule';
    key: string;
    timeAdded?: string;
    value?: string;
  }>;
}

// 简化的 Node 列表项（后端返回的扁平化结构）
export interface NodeListItem {
  name: string;
  status: string;
  roles: string[];
  version: string;
  internalIP: string;
  externalIP: string;
  osImage: string;
  kernelVersion: string;
  containerRuntime: string;
  capacity: Record<string, string>;
  allocatable: Record<string, string>;
  conditions: Array<{
    message: string;
    reason: string;
    status: string;
    type: string;
  }>;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  taints: Array<{
    effect: string;
    key: string;
    value?: string;
  }>;
  createdAt: string;
  // 可选的使用率字段（如果后端计算）
  cpuUsagePercent?: number;
  memoryUsagePercent?: number;
}

// 标准 K8s Node 对象（用于详情等场景）
export interface Node {
  apiVersion: string;
  kind: 'Node';
  metadata: K8sMetadata;
  spec?: NodeSpec;
  status?: NodeStatus;
}

export interface NodeListParams {
  clusterId: string;
  page?: number;
  pageSize?: number;
}

export interface NodeListResult {
  items: NodeListItem[];
  total: number;
  page?: number;
  pageSize?: number;
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

/**
 * Secret 列表项（扁平化结构，用于列表显示）
 */
export interface SecretListItem {
  /** Secret 名称 */
  name: string;
  /** 命名空间 */
  namespace: string;
  /** Secret 类型 */
  type: string;
  /** 数据键值对 */
  data?: Record<string, string>;
  /** 键数量 */
  keysCount: number;
  /** 创建时间 */
  createdAt: string;
  /** 标签 */
  labels?: Record<string, string>;
  /** 是否不可变 */
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

// ==================== 存储管理 ====================

// PersistentVolume
export interface PersistentVolumeSpec {
  capacity: {
    storage: string;
  };
  accessModes: (
    | 'ReadOnlyMany'
    | 'ReadWriteMany'
    | 'ReadWriteOnce'
    | 'ReadWriteOncePod'
  )[];
  persistentVolumeReclaimPolicy?: 'Delete' | 'Recycle' | 'Retain';
  storageClassName?: string;
  volumeMode?: 'Block' | 'Filesystem';
  mountOptions?: string[];
  claimRef?: {
    apiVersion: string;
    kind: string;
    name: string;
    namespace: string;
    resourceVersion: string;
    uid: string;
  };
  nodeAffinity?: {
    required?: {
      nodeSelectorTerms: Array<{
        matchExpressions?: Array<{
          key: string;
          operator: string;
          values?: string[];
        }>;
      }>;
    };
  };
  // 存储后端配置（多选一）
  hostPath?: {
    path: string;
    type?: string;
  };
  nfs?: {
    path: string;
    readOnly?: boolean;
    server: string;
  };
  csi?: {
    controllerPublishSecretRef?: {
      name: string;
      namespace: string;
    };
    driver: string;
    fsType?: string;
    nodePublishSecretRef?: {
      name: string;
      namespace: string;
    };
    nodeStageSecretRef?: {
      name: string;
      namespace: string;
    };
    readOnly?: boolean;
    volumeAttributes?: Record<string, string>;
    volumeHandle: string;
  };
  awsElasticBlockStore?: {
    fsType?: string;
    partition?: number;
    readOnly?: boolean;
    volumeID: string;
  };
  gcePersistentDisk?: {
    fsType?: string;
    partition?: number;
    pdName: string;
    readOnly?: boolean;
  };
  azureDisk?: {
    cachingMode?: string;
    diskName: string;
    diskURI: string;
    fsType?: string;
    kind?: string;
    readOnly?: boolean;
  };
}

export interface PersistentVolumeStatus {
  phase: 'Available' | 'Bound' | 'Failed' | 'Pending' | 'Released';
  message?: string;
  reason?: string;
  lastPhaseTransitionTime?: string;
}

// PersistentVolume - 扁平数据结构（匹配后端返回）
export interface PersistentVolume {
  name: string; // PV 名称
  status: string; // 状态：Bound | Available | Released | Failed
  claim: string; // 绑定的 PVC（格式：namespace/name）
  capacity: string; // 容量（如 "5Gi"）
  accessModes: string[]; // 访问模式
  storageClassName: string; // 存储类名称
  reclaimPolicy: string; // 回收策略：Delete | Retain | Recycle
  labels?: Record<string, string>; // 标签
  createdAt: string; // 创建时间
}

export interface PersistentVolumeListParams {
  clusterId: string;
  storageClass?: string;
  status?: string;
  accessMode?: string;
  page?: number;
  pageSize?: number;
}

export interface PersistentVolumeListResult {
  apiVersion: string;
  kind: 'PersistentVolumeList';
  metadata: K8sListMetadata;
  items: PersistentVolume[];
  total: number;
}

// PersistentVolumeClaim
export interface PersistentVolumeClaimSpec {
  accessModes: (
    | 'ReadOnlyMany'
    | 'ReadWriteMany'
    | 'ReadWriteOnce'
    | 'ReadWriteOncePod'
  )[];
  resources: {
    limits?: {
      storage?: string;
    };
    requests: {
      storage: string;
    };
  };
  storageClassName?: string;
  volumeMode?: 'Block' | 'Filesystem';
  volumeName?: string;
  selector?: {
    matchExpressions?: Array<{
      key: string;
      operator: string;
      values?: string[];
    }>;
    matchLabels?: Record<string, string>;
  };
  dataSource?: {
    apiGroup?: string;
    kind: string;
    name: string;
  };
  dataSourceRef?: {
    apiGroup?: string;
    kind: string;
    name: string;
    namespace?: string;
  };
}

export interface PersistentVolumeClaimCondition {
  type: string;
  status: string;
  lastProbeTime?: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface PersistentVolumeClaimStatus {
  phase: 'Bound' | 'Lost' | 'Pending';
  accessModes?: string[];
  capacity?: {
    storage: string;
  };
  conditions?: PersistentVolumeClaimCondition[];
  allocatedResources?: {
    storage?: string;
  };
  resizeStatus?: string;
}

// PersistentVolumeClaim - 扁平数据结构（匹配后端返回）
export interface PersistentVolumeClaim {
  name: string; // PVC 名称
  namespace: string; // 命名空间
  status: string; // 状态：Bound | Pending | Lost
  volume: string; // 绑定的 PV 名称
  capacity: string; // 容量（如 "2Gi"）
  accessModes: string[]; // 访问模式
  storageClassName: string; // 存储类名称
  labels?: Record<string, string>; // 标签
  createdAt: string; // 创建时间
}

export interface PersistentVolumeClaimListParams {
  clusterId: string;
  namespace?: string;
  storageClass?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PersistentVolumeClaimListResult {
  apiVersion: string;
  kind: 'PersistentVolumeClaimList';
  metadata: K8sListMetadata;
  items: PersistentVolumeClaim[];
  total: number;
}

// StorageClass
export interface StorageClassSpec {
  provisioner: string;
  parameters?: Record<string, string>;
  reclaimPolicy?: 'Delete' | 'Retain';
  mountOptions?: string[];
  volumeBindingMode?: 'Immediate' | 'WaitForFirstConsumer';
  allowVolumeExpansion?: boolean;
  allowedTopologies?: Array<{
    matchLabelExpressions?: Array<{
      key: string;
      values: string[];
    }>;
  }>;
}

export interface StorageClass {
  apiVersion: string;
  kind: 'StorageClass';
  metadata: K8sMetadata;
  provisioner: string;
  parameters?: Record<string, string>;
  reclaimPolicy?: 'Delete' | 'Retain';
  mountOptions?: string[];
  volumeBindingMode?: 'Immediate' | 'WaitForFirstConsumer';
  allowVolumeExpansion?: boolean;
  allowedTopologies?: Array<{
    matchLabelExpressions?: Array<{
      key: string;
      values: string[];
    }>;
  }>;
}

export interface StorageClassListParams {
  clusterId: string;
  provisioner?: string;
  reclaimPolicy?: string;
  page?: number;
  pageSize?: number;
}

export interface StorageClassListResult {
  apiVersion: string;
  kind: 'StorageClassList';
  metadata: K8sListMetadata;
  items: StorageClass[];
  total: number;
}

// 存储统计
export interface StorageStats {
  totalCapacity: string; // 总容量（如 "100Gi"）
  usedCapacity: string; // 已用容量
  availableCapacity: string; // 可用容量
  usagePercent: number; // 使用率百分比
  pvCount: number; // PV 总数
  pvBoundCount: number; // 已绑定的 PV 数
  pvAvailableCount: number; // 可用的 PV 数
  pvReleasedCount: number; // Released 状态的 PV 数
  pvFailedCount: number; // Failed 状态的 PV 数
  pvcCount: number; // PVC 总数
  pvcBoundCount: number; // 已绑定的 PVC 数
  pvcPendingCount: number; // Pending 状态的 PVC 数
  pvcLostCount: number; // Lost 状态的 PVC 数
}

export interface StorageStatsByClass {
  storageClassName: string;
  pvCount: number;
  pvcCount: number;
  totalCapacity: string;
  usedCapacity: string;
  availableCapacity: string;
  usagePercent: number;
}

export interface StorageStatsByNamespace {
  namespace: string;
  pvcCount: number;
  totalRequestedStorage: string;
  totalUsedStorage: string;
  storageClasses: string[]; // 使用的存储类列表
}

export interface PodUsingPVC {
  pod: Pod;
  volumeMounts: Array<{
    mountPath: string;
    pvcName: string;
    readOnly: boolean;
  }>;
}

// ==================== Ingress 管理 ====================

export interface IngressBackend {
  service?: {
    name: string;
    port: {
      name?: string;
      number?: number;
    };
  };
  resource?: {
    apiGroup?: string;
    kind: string;
    name: string;
  };
}

export interface IngressTLS {
  hosts: string[];
  secretName?: string;
}

export interface IngressRule {
  host?: string;
  http?: {
    paths: Array<{
      backend: IngressBackend;
      path?: string;
      pathType: 'Exact' | 'ImplementationSpecific' | 'Prefix';
    }>;
  };
}

export interface IngressSpec {
  ingressClassName?: string;
  defaultBackend?: IngressBackend;
  tls?: IngressTLS[];
  rules?: IngressRule[];
}

export interface IngressStatus {
  loadBalancer?: {
    ingress?: Array<{
      hostname?: string;
      ip?: string;
      ports?: Array<{
        error?: string;
        port: number;
        protocol: string;
      }>;
    }>;
  };
}

export interface Ingress {
  apiVersion: string;
  kind: 'Ingress';
  metadata: K8sMetadata;
  spec: IngressSpec;
  status?: IngressStatus;
}

export interface IngressListParams {
  clusterId: string;
  namespace?: string;
  ingressClass?: string;
  page?: number;
  pageSize?: number;
}

export interface IngressListResult {
  apiVersion: string;
  kind: 'IngressList';
  metadata: K8sListMetadata;
  items: Ingress[];
  total: number;
}

// ==================== Event 管理 ====================

export interface EventSource {
  component?: string;
  host?: string;
}

export interface EventSeries {
  count: number;
  lastObservedTime: string;
}

export interface K8sEvent {
  apiVersion: string;
  kind: 'Event';
  metadata: K8sMetadata;
  involvedObject: {
    apiVersion?: string;
    fieldPath?: string;
    kind: string;
    name: string;
    namespace?: string;
    resourceVersion?: string;
    uid?: string;
  };
  reason: string;
  message: string;
  source: EventSource;
  firstTimestamp?: string;
  lastTimestamp?: string;
  count?: number;
  type: 'Normal' | 'Warning';
  eventTime?: string;
  series?: EventSeries;
  action?: string;
  reportingComponent?: string;
  reportingInstance?: string;
}

export interface EventListParams {
  clusterId: string;
  namespace?: string;
  involvedObjectKind?: string;
  involvedObjectName?: string;
  type?: '' | 'Error' | 'Normal' | 'Warning';
  reason?: string;
  page?: number;
  pageSize?: number;
}

export interface EventListResult {
  apiVersion: string;
  kind: 'EventList';
  metadata: K8sListMetadata;
  items: K8sEvent[];
  total: number;
}

// ==================== RBAC 权限管理 ====================

// ServiceAccount
export interface ServiceAccount {
  apiVersion: string;
  kind: 'ServiceAccount';
  metadata: K8sMetadata;
  secrets?: Array<{
    apiVersion?: string;
    fieldPath?: string;
    kind?: string;
    name: string;
    namespace?: string;
    resourceVersion?: string;
    uid?: string;
  }>;
  imagePullSecrets?: Array<{
    name: string;
  }>;
  automountServiceAccountToken?: boolean;
}

export interface ServiceAccountListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface ServiceAccountListResult {
  apiVersion: string;
  kind: 'ServiceAccountList';
  metadata: K8sListMetadata;
  items: ServiceAccount[];
  total: number;
}

// Role & ClusterRole
export interface PolicyRule {
  apiGroups?: string[];
  resources?: string[];
  verbs: string[];
  resourceNames?: string[];
  nonResourceURLs?: string[];
}

export interface Role {
  apiVersion: string;
  kind: 'Role';
  metadata: K8sMetadata;
  rules: PolicyRule[];
}

export interface ClusterRole {
  apiVersion: string;
  kind: 'ClusterRole';
  metadata: K8sMetadata;
  rules: PolicyRule[];
  aggregationRule?: {
    clusterRoleSelectors?: Array<{
      matchExpressions?: Array<{
        key: string;
        operator: string;
        values?: string[];
      }>;
      matchLabels?: Record<string, string>;
    }>;
  };
}

export interface RoleListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface RoleListResult {
  apiVersion: string;
  kind: 'RoleList';
  metadata: K8sListMetadata;
  items: Role[];
  total: number;
}

export interface ClusterRoleListParams {
  clusterId: string;
  page?: number;
  pageSize?: number;
}

export interface ClusterRoleListResult {
  apiVersion: string;
  kind: 'ClusterRoleList';
  metadata: K8sListMetadata;
  items: ClusterRole[];
  total: number;
}

// RoleBinding & ClusterRoleBinding
export interface Subject {
  kind: 'Group' | 'ServiceAccount' | 'User';
  name: string;
  namespace?: string;
  apiGroup?: string;
}

export interface RoleRef {
  apiGroup: string;
  kind: 'ClusterRole' | 'Role';
  name: string;
}

export interface RoleBinding {
  apiVersion: string;
  kind: 'RoleBinding';
  metadata: K8sMetadata;
  subjects?: Subject[];
  roleRef: RoleRef;
}

export interface ClusterRoleBinding {
  apiVersion: string;
  kind: 'ClusterRoleBinding';
  metadata: K8sMetadata;
  subjects?: Subject[];
  roleRef: RoleRef;
}

export interface RoleBindingListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface RoleBindingListResult {
  apiVersion: string;
  kind: 'RoleBindingList';
  metadata: K8sListMetadata;
  items: RoleBinding[];
  total: number;
}

export interface ClusterRoleBindingListParams {
  clusterId: string;
  page?: number;
  pageSize?: number;
}

export interface ClusterRoleBindingListResult {
  apiVersion: string;
  kind: 'ClusterRoleBindingList';
  metadata: K8sListMetadata;
  items: ClusterRoleBinding[];
  total: number;
}

// ==================== 资源配额管理 ====================

// ResourceQuota
export interface ResourceQuotaSpec {
  hard?: Record<string, string>; // 硬限制
  scopes?: Array<
    | 'BestEffort'
    | 'CrossNamespacePodAffinity'
    | 'NotBestEffort'
    | 'NotTerminating'
    | 'PriorityClass'
    | 'Terminating'
  >;
  scopeSelector?: {
    matchExpressions?: Array<{
      operator: 'DoesNotExist' | 'Exists' | 'In' | 'NotIn';
      scopeName: string;
      values?: string[];
    }>;
  };
}

export interface ResourceQuotaStatus {
  hard?: Record<string, string>; // 硬限制
  used?: Record<string, string>; // 已使用
}

export interface ResourceQuota {
  apiVersion: string;
  kind: 'ResourceQuota';
  metadata: K8sMetadata;
  spec: ResourceQuotaSpec;
  status?: ResourceQuotaStatus;
}

export interface ResourceQuotaListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface ResourceQuotaListResult {
  apiVersion: string;
  kind: 'ResourceQuotaList';
  metadata: K8sListMetadata;
  items: ResourceQuota[];
  total: number;
}

// LimitRange
export interface LimitRangeItem {
  type: 'Container' | 'PersistentVolumeClaim' | 'Pod';
  max?: Record<string, string>; // 最大值
  min?: Record<string, string>; // 最小值
  default?: Record<string, string>; // 默认限制值
  defaultRequest?: Record<string, string>; // 默认请求值
  maxLimitRequestRatio?: Record<string, string>; // 最大限制/请求比率
}

export interface LimitRangeSpec {
  limits: LimitRangeItem[];
}

export interface LimitRange {
  apiVersion: string;
  kind: 'LimitRange';
  metadata: K8sMetadata;
  spec: LimitRangeSpec;
}

export interface LimitRangeListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface LimitRangeListResult {
  apiVersion: string;
  kind: 'LimitRangeList';
  metadata: K8sListMetadata;
  items: LimitRange[];
  total: number;
}

// ==================== 网络策略 ====================

// NetworkPolicy
export interface NetworkPolicyPort {
  protocol?: 'SCTP' | 'TCP' | 'UDP';
  port?: number | string;
  endPort?: number;
}

export interface NetworkPolicyPeer {
  podSelector?: {
    matchExpressions?: Array<{
      key: string;
      operator: string;
      values?: string[];
    }>;
    matchLabels?: Record<string, string>;
  };
  namespaceSelector?: {
    matchExpressions?: Array<{
      key: string;
      operator: string;
      values?: string[];
    }>;
    matchLabels?: Record<string, string>;
  };
  ipBlock?: {
    cidr: string;
    except?: string[];
  };
}

export interface NetworkPolicyIngressRule {
  from?: NetworkPolicyPeer[];
  ports?: NetworkPolicyPort[];
}

export interface NetworkPolicyEgressRule {
  to?: NetworkPolicyPeer[];
  ports?: NetworkPolicyPort[];
}

export interface NetworkPolicySpec {
  podSelector: {
    matchExpressions?: Array<{
      key: string;
      operator: string;
      values?: string[];
    }>;
    matchLabels?: Record<string, string>;
  };
  policyTypes?: ('Egress' | 'Ingress')[];
  ingress?: NetworkPolicyIngressRule[];
  egress?: NetworkPolicyEgressRule[];
}

export interface NetworkPolicy {
  apiVersion: string;
  kind: 'NetworkPolicy';
  metadata: K8sMetadata;
  spec: NetworkPolicySpec;
}

export interface NetworkPolicyListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface NetworkPolicyListResult {
  apiVersion: string;
  kind: 'NetworkPolicyList';
  metadata: K8sListMetadata;
  items: NetworkPolicy[];
  total: number;
}

// ==================== 自动扩缩容 ====================

// HorizontalPodAutoscaler (HPA)
export interface MetricTarget {
  type: 'AverageValue' | 'Utilization' | 'Value';
  averageUtilization?: number;
  averageValue?: string;
  value?: string;
}

export interface ResourceMetricSource {
  name: string;
  target: MetricTarget;
}

export interface PodsMetricSource {
  metric: {
    name: string;
    selector?: {
      matchLabels?: Record<string, string>;
    };
  };
  target: MetricTarget;
}

export interface ObjectMetricSource {
  describedObject: {
    apiVersion: string;
    kind: string;
    name: string;
  };
  metric: {
    name: string;
    selector?: {
      matchLabels?: Record<string, string>;
    };
  };
  target: MetricTarget;
}

export interface ExternalMetricSource {
  metric: {
    name: string;
    selector?: {
      matchLabels?: Record<string, string>;
    };
  };
  target: MetricTarget;
}

export interface ContainerResourceMetricSource {
  container: string;
  name: string;
  target: MetricTarget;
}

export interface MetricSpec {
  type: 'ContainerResource' | 'External' | 'Object' | 'Pods' | 'Resource';
  resource?: ResourceMetricSource;
  pods?: PodsMetricSource;
  object?: ObjectMetricSource;
  external?: ExternalMetricSource;
  containerResource?: ContainerResourceMetricSource;
}

export interface HPAScalingPolicy {
  type: 'Percent' | 'Pods';
  value: number;
  periodSeconds: number;
}

export interface HPAScalingRules {
  stabilizationWindowSeconds?: number;
  selectPolicy?: 'Disabled' | 'Max' | 'Min';
  policies?: HPAScalingPolicy[];
}

export interface HPABehavior {
  scaleDown?: HPAScalingRules;
  scaleUp?: HPAScalingRules;
}

export interface HorizontalPodAutoscalerSpec {
  scaleTargetRef: {
    apiVersion: string;
    kind: string;
    name: string;
  };
  minReplicas?: number;
  maxReplicas: number;
  metrics?: MetricSpec[];
  behavior?: HPABehavior;
}

export interface MetricStatus {
  type: 'ContainerResource' | 'External' | 'Object' | 'Pods' | 'Resource';
  resource?: {
    current: MetricTarget;
    name: string;
  };
  pods?: {
    current: MetricTarget;
    metric: {
      name: string;
    };
  };
  object?: {
    current: MetricTarget;
    describedObject: {
      apiVersion: string;
      kind: string;
      name: string;
    };
    metric: {
      name: string;
    };
  };
  external?: {
    current: MetricTarget;
    metric: {
      name: string;
    };
  };
  containerResource?: {
    container: string;
    current: MetricTarget;
    name: string;
  };
}

export interface HorizontalPodAutoscalerStatus {
  currentReplicas: number;
  desiredReplicas: number;
  currentMetrics?: MetricStatus[];
  conditions?: Array<{
    lastTransitionTime?: string;
    message?: string;
    reason?: string;
    status: string;
    type: string;
  }>;
  observedGeneration?: number;
  lastScaleTime?: string;
}

export interface HorizontalPodAutoscaler {
  apiVersion: string;
  kind: 'HorizontalPodAutoscaler';
  metadata: K8sMetadata;
  spec: HorizontalPodAutoscalerSpec;
  status?: HorizontalPodAutoscalerStatus;
}

export interface HorizontalPodAutoscalerListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface HorizontalPodAutoscalerListResult {
  apiVersion: string;
  kind: 'HorizontalPodAutoscalerList';
  metadata: K8sListMetadata;
  items: HorizontalPodAutoscaler[];
  total: number;
}

// ==================== 调度与优先级 ====================

// PriorityClass - 扁平数据结构（匹配后端返回）
export interface PriorityClass {
  name: string; // PriorityClass 名称
  value: number; // 优先级值，越高越优先
  globalDefault: boolean; // 是否为全局默认
  preemptionPolicy?: string; // 抢占策略：Never | PreemptLowerPriority
  description?: string; // 描述信息
  labels?: Record<string, string>; // 标签
  createdAt: string; // 创建时间
}

export interface PriorityClassListParams {
  clusterId: string;
  page?: number;
  pageSize?: number;
}

export interface PriorityClassListResult {
  apiVersion: string;
  kind: 'PriorityClassList';
  metadata: K8sListMetadata;
  items: PriorityClass[];
  total: number;
}

// ==================== ReplicaSet ====================

export interface ReplicaSetSpec {
  replicas: number;
  selector: {
    matchExpressions?: Array<{
      key: string;
      operator: string;
      values?: string[];
    }>;
    matchLabels: Record<string, string>;
  };
  template: {
    metadata: K8sMetadata;
    spec: PodSpec;
  };
  minReadySeconds?: number;
}

export interface ReplicaSetCondition {
  type: string;
  status: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface ReplicaSetStatus {
  replicas: number;
  fullyLabeledReplicas?: number;
  readyReplicas?: number;
  availableReplicas?: number;
  observedGeneration?: number;
  conditions?: ReplicaSetCondition[];
}

export interface ReplicaSet {
  apiVersion: string;
  kind: 'ReplicaSet';
  metadata: K8sMetadata;
  spec: ReplicaSetSpec;
  status?: ReplicaSetStatus;
}

export interface ReplicaSetListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface ReplicaSetListResult {
  apiVersion: string;
  kind: 'ReplicaSetList';
  metadata: K8sListMetadata;
  items: ReplicaSet[];
  total: number;
}

// ==================== Endpoints ====================

export interface EndpointAddress {
  ip: string;
  hostname?: string;
  nodeName?: string;
  targetRef?: {
    apiVersion?: string;
    fieldPath?: string;
    kind: string;
    name: string;
    namespace?: string;
    resourceVersion?: string;
    uid?: string;
  };
}

export interface EndpointPort {
  name?: string;
  port: number;
  protocol?: string;
  appProtocol?: string;
}

export interface EndpointSubset {
  addresses?: EndpointAddress[];
  notReadyAddresses?: EndpointAddress[];
  ports?: EndpointPort[];
}

export interface Endpoints {
  apiVersion: string;
  kind: 'Endpoints';
  metadata: K8sMetadata;
  subsets?: EndpointSubset[];
}

export interface EndpointsListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface EndpointsListResult {
  apiVersion: string;
  kind: 'EndpointsList';
  metadata: K8sListMetadata;
  items: Endpoints[];
  total: number;
}

// EndpointSlice - 扁平数据结构（匹配后端返回）
export interface EndpointSlice {
  name: string; // EndpointSlice 名称
  namespace: string; // 命名空间
  addressType: string; // 地址类型：IPv4 | IPv6 | FQDN
  endpointCount: number; // 端点数量
  portCount: number; // 端口数量
  labels?: Record<string, string>; // 标签
  createdAt: string; // 创建时间
}

export interface EndpointSliceListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}

export interface EndpointSliceListResult {
  apiVersion: string;
  kind: 'EndpointSliceList';
  metadata: K8sListMetadata;
  items: EndpointSlice[];
  total: number;
}
