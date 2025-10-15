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

export interface NodeListParams {
  clusterId: string;
  page?: number;
  pageSize?: number;
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

export interface PersistentVolume {
  apiVersion: string;
  kind: 'PersistentVolume';
  metadata: K8sMetadata;
  spec: PersistentVolumeSpec;
  status?: PersistentVolumeStatus;
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

export interface PersistentVolumeClaim {
  apiVersion: string;
  kind: 'PersistentVolumeClaim';
  metadata: K8sMetadata;
  spec: PersistentVolumeClaimSpec;
  status?: PersistentVolumeClaimStatus;
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
  type?: '' | 'Normal' | 'Warning';
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
