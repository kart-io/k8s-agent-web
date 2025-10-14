/**
 * K8s 资源基础类型定义
 * 提供通用的资源管理接口和配置类型
 */

import type { VxeGridPropTypes } from 'vxe-table';

import type { K8sMetadata } from '#/api/k8s/types';

/**
 * K8s 资源基础接口
 */
export interface K8sResourceBase {
  apiVersion: string;
  kind: string;
  metadata: K8sMetadata;
  spec?: any;
  status?: any;
}

/**
 * 资源操作类型
 */
export type ResourceAction =
  | 'view'
  | 'edit'
  | 'delete'
  | 'scale'
  | 'restart'
  | 'logs'
  | 'exec'
  | 'create'
  | 'update';

/**
 * 资源操作配置
 */
export interface ResourceActionConfig {
  action: ResourceAction;
  label: string;
  icon?: string;
  danger?: boolean;
  permission?: string;
  show?: (row: any) => boolean;
  handler: (row: any) => void | Promise<void>;
}

/**
 * 资源状态标签配置
 */
export interface ResourceStatusConfig {
  field: string;
  statusMap: Record<
    string,
    {
      color: 'success' | 'warning' | 'error' | 'default' | 'processing';
      label?: string;
    }
  >;
}

/**
 * 资源列表列配置
 */
export interface ResourceColumnConfig extends Omit<VxeGridPropTypes.Column, 'field'> {
  field: string;
  title: string;
  width?: number;
  minWidth?: number;
  fixed?: 'left' | 'right';
  formatter?: string | ((params: any) => string);
  slots?: {
    default?: string;
    header?: string;
    footer?: string;
    edit?: string;
  };
}

/**
 * 资源筛选器配置
 */
export interface ResourceFilterConfig {
  showClusterSelector?: boolean;
  showNamespaceSelector?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  customFilters?: Array<{
    field: string;
    label: string;
    type: 'select' | 'input' | 'date';
    options?: Array<{ label: string; value: any }>;
  }>;
}

/**
 * 资源列表配置
 */
export interface ResourceListConfig<T = any> {
  /** 资源类型标识 */
  resourceType: string;
  /** 资源显示名称 */
  resourceLabel: string;
  /** API 数据获取函数 */
  fetchData: (params: ResourceListParams) => Promise<ResourceListResult<T>>;
  /** 列配置 */
  columns: ResourceColumnConfig[];
  /** 操作配置 */
  actions?: ResourceActionConfig[];
  /** 筛选器配置 */
  filters?: ResourceFilterConfig;
  /** 状态标签配置 */
  statusConfig?: ResourceStatusConfig;
  /** Grid 额外配置 */
  gridOptions?: Record<string, any>;
}

/**
 * 资源列表请求参数
 */
export interface ResourceListParams {
  clusterId?: string;
  namespace?: string;
  page: number;
  pageSize: number;
  keyword?: string;
  [key: string]: any;
}

/**
 * 资源列表响应结果
 */
export interface ResourceListResult<T = any> {
  items: T[];
  total: number;
  metadata?: any;
}

/**
 * 资源分类
 */
export enum ResourceCategory {
  WORKLOAD = 'workload',
  NETWORK = 'network',
  CONFIG = 'config',
  STORAGE = 'storage',
  CLUSTER = 'cluster',
}

/**
 * 资源类型元数据
 */
export interface ResourceTypeMetadata {
  type: string;
  label: string;
  category: ResourceCategory;
  icon: string;
  namespaced: boolean;
  path: string;
}

/**
 * K8s 资源类型常量
 */
export const K8S_RESOURCE_TYPES = {
  // 工作负载
  POD: 'pod',
  DEPLOYMENT: 'deployment',
  STATEFULSET: 'statefulset',
  DAEMONSET: 'daemonset',
  JOB: 'job',
  CRONJOB: 'cronjob',

  // 网络
  SERVICE: 'service',
  INGRESS: 'ingress',

  // 配置
  CONFIGMAP: 'configmap',
  SECRET: 'secret',

  // 存储
  PERSISTENTVOLUME: 'persistentvolume',
  PERSISTENTVOLUMECLAIM: 'persistentvolumeclaim',

  // 集群
  NODE: 'node',
  NAMESPACE: 'namespace',
  CLUSTER: 'cluster',
} as const;

/**
 * 资源类型元数据映射
 */
export const RESOURCE_TYPE_METADATA: Record<string, ResourceTypeMetadata> = {
  [K8S_RESOURCE_TYPES.POD]: {
    type: K8S_RESOURCE_TYPES.POD,
    label: 'Pod',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:box',
    namespaced: true,
    path: '/k8s/workloads/pods',
  },
  [K8S_RESOURCE_TYPES.DEPLOYMENT]: {
    type: K8S_RESOURCE_TYPES.DEPLOYMENT,
    label: 'Deployment',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:rocket',
    namespaced: true,
    path: '/k8s/workloads/deployments',
  },
  [K8S_RESOURCE_TYPES.STATEFULSET]: {
    type: K8S_RESOURCE_TYPES.STATEFULSET,
    label: 'StatefulSet',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:database',
    namespaced: true,
    path: '/k8s/workloads/statefulsets',
  },
  [K8S_RESOURCE_TYPES.DAEMONSET]: {
    type: K8S_RESOURCE_TYPES.DAEMONSET,
    label: 'DaemonSet',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:layers',
    namespaced: true,
    path: '/k8s/workloads/daemonsets',
  },
  [K8S_RESOURCE_TYPES.JOB]: {
    type: K8S_RESOURCE_TYPES.JOB,
    label: 'Job',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:briefcase',
    namespaced: true,
    path: '/k8s/workloads/jobs',
  },
  [K8S_RESOURCE_TYPES.CRONJOB]: {
    type: K8S_RESOURCE_TYPES.CRONJOB,
    label: 'CronJob',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:clock',
    namespaced: true,
    path: '/k8s/workloads/cronjobs',
  },
  [K8S_RESOURCE_TYPES.SERVICE]: {
    type: K8S_RESOURCE_TYPES.SERVICE,
    label: 'Service',
    category: ResourceCategory.NETWORK,
    icon: 'lucide:network',
    namespaced: true,
    path: '/k8s/network/services',
  },
  [K8S_RESOURCE_TYPES.CONFIGMAP]: {
    type: K8S_RESOURCE_TYPES.CONFIGMAP,
    label: 'ConfigMap',
    category: ResourceCategory.CONFIG,
    icon: 'lucide:file-code',
    namespaced: true,
    path: '/k8s/config/configmaps',
  },
  [K8S_RESOURCE_TYPES.SECRET]: {
    type: K8S_RESOURCE_TYPES.SECRET,
    label: 'Secret',
    category: ResourceCategory.CONFIG,
    icon: 'lucide:key',
    namespaced: true,
    path: '/k8s/config/secrets',
  },
  [K8S_RESOURCE_TYPES.NODE]: {
    type: K8S_RESOURCE_TYPES.NODE,
    label: 'Node',
    category: ResourceCategory.CLUSTER,
    icon: 'lucide:server',
    namespaced: false,
    path: '/k8s/cluster/nodes',
  },
  [K8S_RESOURCE_TYPES.NAMESPACE]: {
    type: K8S_RESOURCE_TYPES.NAMESPACE,
    label: 'Namespace',
    category: ResourceCategory.CLUSTER,
    icon: 'lucide:folder',
    namespaced: false,
    path: '/k8s/cluster/namespaces',
  },
  [K8S_RESOURCE_TYPES.CLUSTER]: {
    type: K8S_RESOURCE_TYPES.CLUSTER,
    label: 'Cluster',
    category: ResourceCategory.CLUSTER,
    icon: 'lucide:server',
    namespaced: false,
    path: '/k8s/cluster/clusters',
  },
};
