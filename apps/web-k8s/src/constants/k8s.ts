/**
 * K8s 相关常量定义
 */

/**
 * Pod 状态常量
 */
export const POD_STATUS = {
  RUNNING: 'Running',
  PENDING: 'Pending',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed',
  UNKNOWN: 'Unknown',
  TERMINATING: 'Terminating',
  CRASH_LOOP_BACK_OFF: 'CrashLoopBackOff',
  IMAGE_PULL_BACK_OFF: 'ImagePullBackOff',
  CREATE_CONTAINER_ERROR: 'CreateContainerError',
} as const;

/**
 * 节点状态常量
 */
export const NODE_STATUS = {
  READY: 'Ready',
  NOT_READY: 'NotReady',
  UNKNOWN: 'Unknown',
  SCHEDULING_DISABLED: 'SchedulingDisabled',
} as const;

/**
 * Service 类型常量
 */
export const SERVICE_TYPE = {
  CLUSTER_IP: 'ClusterIP',
  NODE_PORT: 'NodePort',
  LOAD_BALANCER: 'LoadBalancer',
  EXTERNAL_NAME: 'ExternalName',
} as const;

/**
 * 事件类型常量
 */
export const EVENT_TYPE = {
  NORMAL: 'Normal',
  WARNING: 'Warning',
  ERROR: 'Error',
} as const;

/**
 * PV 状态常量
 */
export const PV_STATUS = {
  AVAILABLE: 'Available',
  BOUND: 'Bound',
  RELEASED: 'Released',
  FAILED: 'Failed',
} as const;

/**
 * PVC 状态常量
 */
export const PVC_STATUS = {
  PENDING: 'Pending',
  BOUND: 'Bound',
  LOST: 'Lost',
} as const;

/**
 * 访问模式常量
 */
export const ACCESS_MODE = {
  READ_WRITE_ONCE: 'ReadWriteOnce',
  READ_ONLY_MANY: 'ReadOnlyMany',
  READ_WRITE_MANY: 'ReadWriteMany',
  READ_WRITE_ONCE_POD: 'ReadWriteOncePod',
} as const;

/**
 * 回收策略常量
 */
export const RECLAIM_POLICY = {
  RETAIN: 'Retain',
  RECYCLE: 'Recycle',
  DELETE: 'Delete',
} as const;

/**
 * Taint Effect 常量
 */
export const TAINT_EFFECT = {
  NO_SCHEDULE: 'NoSchedule',
  PREFER_NO_SCHEDULE: 'PreferNoSchedule',
  NO_EXECUTE: 'NoExecute',
} as const;

/**
 * Secret 类型常量
 */
export const SECRET_TYPE = {
  OPAQUE: 'Opaque',
  SERVICE_ACCOUNT_TOKEN: 'kubernetes.io/service-account-token',
  DOCKERCFG: 'kubernetes.io/dockercfg',
  DOCKERCONFIGJSON: 'kubernetes.io/dockerconfigjson',
  BASIC_AUTH: 'kubernetes.io/basic-auth',
  SSH_AUTH: 'kubernetes.io/ssh-auth',
  TLS: 'kubernetes.io/tls',
} as const;

/**
 * 更新策略常量
 */
export const UPDATE_STRATEGY = {
  ROLLING_UPDATE: 'RollingUpdate',
  RECREATE: 'Recreate',
  ON_DELETE: 'OnDelete',
} as const;

/**
 * CronJob 并发策略常量
 */
export const CONCURRENCY_POLICY = {
  ALLOW: 'Allow',
  FORBID: 'Forbid',
  REPLACE: 'Replace',
} as const;

/**
 * 资源类型常量
 */
export const RESOURCE_TYPE = {
  POD: 'Pod',
  DEPLOYMENT: 'Deployment',
  STATEFUL_SET: 'StatefulSet',
  DAEMON_SET: 'DaemonSet',
  JOB: 'Job',
  CRON_JOB: 'CronJob',
  SERVICE: 'Service',
  INGRESS: 'Ingress',
  CONFIG_MAP: 'ConfigMap',
  SECRET: 'Secret',
  PERSISTENT_VOLUME: 'PersistentVolume',
  PERSISTENT_VOLUME_CLAIM: 'PersistentVolumeClaim',
  STORAGE_CLASS: 'StorageClass',
  SERVICE_ACCOUNT: 'ServiceAccount',
  ROLE: 'Role',
  ROLE_BINDING: 'RoleBinding',
  CLUSTER_ROLE: 'ClusterRole',
  CLUSTER_ROLE_BINDING: 'ClusterRoleBinding',
  RESOURCE_QUOTA: 'ResourceQuota',
  LIMIT_RANGE: 'LimitRange',
  NAMESPACE: 'Namespace',
  NODE: 'Node',
  EVENT: 'Event',
} as const;

/**
 * API 版本常量
 */
export const API_VERSION = {
  V1: 'v1',
  APPS_V1: 'apps/v1',
  BATCH_V1: 'batch/v1',
  NETWORKING_V1: 'networking.k8s.io/v1',
  STORAGE_V1: 'storage.k8s.io/v1',
  RBAC_V1: 'rbac.authorization.k8s.io/v1',
} as const;

/**
 * 默认值常量
 */
export const DEFAULTS = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  TIMEOUT: 30000, // 30 秒
  RETRY_COUNT: 3,
  DEBOUNCE_DELAY: 300, // 300 毫秒
  THROTTLE_DELAY: 500, // 500 毫秒
} as const;

/**
 * 路径常量
 */
export const ROUTES = {
  DASHBOARD: '/k8s/dashboard',
  PODS: '/k8s/pods',
  DEPLOYMENTS: '/k8s/deployments',
  STATEFUL_SETS: '/k8s/statefulsets',
  DAEMON_SETS: '/k8s/daemonsets',
  JOBS: '/k8s/jobs',
  CRON_JOBS: '/k8s/cronjobs',
  REPLICA_SETS: '/k8s/replicasets',
  SERVICES: '/k8s/services',
  INGRESS: '/k8s/ingress',
  NETWORK_POLICIES: '/k8s/network-policies',
  ENDPOINTS: '/k8s/endpoints',
  ENDPOINT_SLICES: '/k8s/endpoint-slices',
  CONFIG_MAPS: '/k8s/configmaps',
  SECRETS: '/k8s/secrets',
  PERSISTENT_VOLUMES: '/k8s/persistent-volumes',
  PERSISTENT_VOLUME_CLAIMS: '/k8s/persistent-volume-claims',
  STORAGE_CLASSES: '/k8s/storage-classes',
  SERVICE_ACCOUNTS: '/k8s/service-accounts',
  ROLES: '/k8s/roles',
  ROLE_BINDINGS: '/k8s/role-bindings',
  CLUSTER_ROLES: '/k8s/cluster-roles',
  CLUSTER_ROLE_BINDINGS: '/k8s/cluster-role-bindings',
  RESOURCE_QUOTAS: '/k8s/resource-quotas',
  LIMIT_RANGES: '/k8s/limit-ranges',
  CLUSTERS: '/k8s/clusters',
  NODES: '/k8s/nodes',
  NAMESPACES: '/k8s/namespaces',
  EVENTS: '/k8s/events',
  HPA: '/k8s/hpa',
  PRIORITY_CLASSES: '/k8s/priority-classes',
  STORAGE_OVERVIEW: '/k8s/storage-overview',
  SEARCH: '/k8s/search',
} as const;

/**
 * 颜色常量
 */
export const COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#f5222d',
  INFO: '#13c2c2',
  PURPLE: '#722ed1',
  ORANGE: '#fa8c16',
  PINK: '#eb2f96',
  CYAN: '#13c2c2',
  LIME: '#a0d911',
  GEEKBLUE: '#2f54eb',
  GOLD: '#faad14',
} as const;

/**
 * 图表颜色
 */
export const CHART_COLORS = [
  COLORS.PRIMARY,
  COLORS.SUCCESS,
  COLORS.WARNING,
  COLORS.ERROR,
  COLORS.PURPLE,
  COLORS.INFO,
  COLORS.PINK,
  COLORS.ORANGE,
  COLORS.LIME,
  COLORS.GEEKBLUE,
] as const;

/**
 * 状态颜色映射
 */
export const STATUS_COLORS = {
  [POD_STATUS.RUNNING]: COLORS.SUCCESS,
  [POD_STATUS.SUCCEEDED]: COLORS.SUCCESS,
  [POD_STATUS.PENDING]: COLORS.WARNING,
  [POD_STATUS.FAILED]: COLORS.ERROR,
  [POD_STATUS.UNKNOWN]: 'default',
  [POD_STATUS.TERMINATING]: 'processing',
  [POD_STATUS.CRASH_LOOP_BACK_OFF]: COLORS.ERROR,
  [POD_STATUS.IMAGE_PULL_BACK_OFF]: COLORS.WARNING,
  [POD_STATUS.CREATE_CONTAINER_ERROR]: COLORS.ERROR,

  [NODE_STATUS.READY]: COLORS.SUCCESS,
  [NODE_STATUS.NOT_READY]: COLORS.ERROR,
  [NODE_STATUS.UNKNOWN]: 'default',
  [NODE_STATUS.SCHEDULING_DISABLED]: COLORS.WARNING,

  [EVENT_TYPE.NORMAL]: COLORS.INFO,
  [EVENT_TYPE.WARNING]: COLORS.WARNING,
  [EVENT_TYPE.ERROR]: COLORS.ERROR,

  [PV_STATUS.AVAILABLE]: COLORS.SUCCESS,
  [PV_STATUS.BOUND]: COLORS.PRIMARY,
  [PV_STATUS.RELEASED]: COLORS.WARNING,
  [PV_STATUS.FAILED]: COLORS.ERROR,

  [PVC_STATUS.PENDING]: COLORS.WARNING,
  [PVC_STATUS.BOUND]: COLORS.SUCCESS,
  [PVC_STATUS.LOST]: COLORS.ERROR,
} as const;

/**
 * 验证正则表达式
 */
export const REGEX = {
  K8S_NAME: /^[a-z0-9]([a-z0-9-.])*[a-z0-9]$/,
  LABEL_KEY_NAME: /^[a-z0-9A-Z]([-a-z0-9A-Z_.]*[a-z0-9A-Z])?$/,
  LABEL_KEY_PREFIX: /^[a-z0-9]([-a-z0-9.]*[a-z0-9])?$/,
  LABEL_VALUE: /^[a-z0-9A-Z]([-a-z0-9A-Z_.]*[a-z0-9A-Z])?$/,
  DNS_SUBDOMAIN: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
  IP_ADDRESS: /^(\d{1,3}\.){3}\d{1,3}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

/**
 * 单位常量
 */
export const UNITS = {
  BYTE: {
    BYTES: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
    PB: 1024 * 1024 * 1024 * 1024 * 1024,
  },
  K8S_MEMORY: {
    Ki: 1024,
    Mi: 1024 * 1024,
    Gi: 1024 * 1024 * 1024,
    Ti: 1024 * 1024 * 1024 * 1024,
    Pi: 1024 * 1024 * 1024 * 1024 * 1024,
    Ei: 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
  },
  TIME: {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
  },
} as const;

/**
 * 常用命名空间
 */
export const SYSTEM_NAMESPACES = [
  'default',
  'kube-system',
  'kube-public',
  'kube-node-lease',
] as const;

/**
 * 常用 Labels
 */
export const COMMON_LABELS = {
  APP: 'app',
  NAME: 'app.kubernetes.io/name',
  INSTANCE: 'app.kubernetes.io/instance',
  VERSION: 'app.kubernetes.io/version',
  COMPONENT: 'app.kubernetes.io/component',
  PART_OF: 'app.kubernetes.io/part-of',
  MANAGED_BY: 'app.kubernetes.io/managed-by',
} as const;

/**
 * 常用 Annotations
 */
export const COMMON_ANNOTATIONS = {
  DESCRIPTION: 'description',
  PROMETHEUS_SCRAPE: 'prometheus.io/scrape',
  PROMETHEUS_PORT: 'prometheus.io/port',
  PROMETHEUS_PATH: 'prometheus.io/path',
} as const;
