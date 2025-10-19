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
  | 'create'
  | 'delete'
  | 'edit'
  | 'exec'
  | 'logs'
  | 'restart'
  | 'scale'
  | 'update'
  | 'view';

/**
 * 资源操作配置
 */
export interface ResourceActionConfig {
  action: ResourceAction;
  label: ((row: any) => string) | string;
  icon?: false | string;
  danger?: boolean;
  permission?: string;
  show?: (row: any) => boolean;
  handler: (row: any) => Promise<void> | void;
  /** 在下拉菜单中是否在此操作后显示分隔线 */
  divider?: boolean;
}

/**
 * 资源状态标签配置
 */
export interface ResourceStatusConfig {
  field: string;
  statusMap: Record<
    string,
    {
      color: 'default' | 'error' | 'processing' | 'success' | 'warning';
      label?: string;
    }
  >;
}

/**
 * 资源列表列配置
 */
export interface ResourceColumnConfig
  extends Omit<VxeGridPropTypes.Column, 'field'> {
  field: string;
  title: string;
  width?: number;
  minWidth?: number;
  fixed?: 'left' | 'right';
  formatter?: ((params: any) => string) | string;
  slots?: {
    default?: string;
    edit?: string;
    footer?: string;
    header?: string;
  };
}

/**
 * 表单字段类型
 */
export type FormFieldType =
  | 'array' // 数组（可添加/删除项）
  | 'input' // 文本输入
  | 'labels' // 标签编辑器（键值对）
  | 'number' // 数字输入
  | 'object' // 对象（嵌套表单）
  | 'select' // 下拉选择
  | 'switch' // 开关
  | 'textarea'; // 多行文本

/**
 * 表单字段配置
 */
export interface FormFieldConfig {
  field: string; // 字段名（支持嵌套路径，如 'metadata.name'）
  label: string; // 字段标签
  type: FormFieldType;
  required?: boolean; // 是否必填
  disabled?: ((mode: 'create' | 'edit') => boolean) | boolean; // 是否禁用
  defaultValue?: any; // 默认值
  placeholder?: string;
  help?: string; // 帮助文本
  rules?: any[]; // 验证规则
  options?: Array<{ label: string; value: any }>; // select类型的选项
  children?: FormFieldConfig[]; // object/array类型的子字段
  show?: (formData: any) => boolean; // 动态显示条件
}

/**
 * 表单分组配置
 */
export interface FormGroupConfig {
  title: string;
  fields: FormFieldConfig[];
  collapsible?: boolean; // 是否可折叠
  defaultCollapsed?: boolean; // 默认是否折叠
}

/**
 * 资源表单配置
 */
export interface ResourceFormConfig {
  groups: FormGroupConfig[]; // 表单分组
  initialValues?: any; // 初始值
  createInitialValues?: any; // 创建时的初始值
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
    options?: Array<{ label: string; value: any }>;
    type: 'date' | 'input' | 'select';
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
  /** 表单配置 */
  formConfig?: ResourceFormConfig;
  /** 是否支持创建资源 */
  enableCreate?: boolean;
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
  CLUSTER = 'cluster',
  CONFIG = 'config',
  NETWORK = 'network',
  STORAGE = 'storage',
  WORKLOAD = 'workload',
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
  STORAGECLASS: 'storageclass',

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
    path: '/k8s/pods',
  },
  [K8S_RESOURCE_TYPES.DEPLOYMENT]: {
    type: K8S_RESOURCE_TYPES.DEPLOYMENT,
    label: 'Deployment',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:rocket',
    namespaced: true,
    path: '/k8s/deployments',
  },
  [K8S_RESOURCE_TYPES.STATEFULSET]: {
    type: K8S_RESOURCE_TYPES.STATEFULSET,
    label: 'StatefulSet',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:database',
    namespaced: true,
    path: '/k8s/statefulsets',
  },
  [K8S_RESOURCE_TYPES.DAEMONSET]: {
    type: K8S_RESOURCE_TYPES.DAEMONSET,
    label: 'DaemonSet',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:layers',
    namespaced: true,
    path: '/k8s/daemonsets',
  },
  [K8S_RESOURCE_TYPES.JOB]: {
    type: K8S_RESOURCE_TYPES.JOB,
    label: 'Job',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:briefcase',
    namespaced: true,
    path: '/k8s/jobs',
  },
  [K8S_RESOURCE_TYPES.CRONJOB]: {
    type: K8S_RESOURCE_TYPES.CRONJOB,
    label: 'CronJob',
    category: ResourceCategory.WORKLOAD,
    icon: 'lucide:clock',
    namespaced: true,
    path: '/k8s/cronjobs',
  },
  [K8S_RESOURCE_TYPES.SERVICE]: {
    type: K8S_RESOURCE_TYPES.SERVICE,
    label: 'Service',
    category: ResourceCategory.NETWORK,
    icon: 'lucide:network',
    namespaced: true,
    path: '/k8s/services',
  },
  [K8S_RESOURCE_TYPES.CONFIGMAP]: {
    type: K8S_RESOURCE_TYPES.CONFIGMAP,
    label: 'ConfigMap',
    category: ResourceCategory.CONFIG,
    icon: 'lucide:file-code',
    namespaced: true,
    path: '/k8s/configmaps',
  },
  [K8S_RESOURCE_TYPES.SECRET]: {
    type: K8S_RESOURCE_TYPES.SECRET,
    label: 'Secret',
    category: ResourceCategory.CONFIG,
    icon: 'lucide:key',
    namespaced: true,
    path: '/k8s/secrets',
  },
  [K8S_RESOURCE_TYPES.PERSISTENTVOLUME]: {
    type: K8S_RESOURCE_TYPES.PERSISTENTVOLUME,
    label: 'PersistentVolume',
    category: ResourceCategory.STORAGE,
    icon: 'lucide:hard-drive',
    namespaced: false,
    path: '/k8s/persistent-volumes',
  },
  [K8S_RESOURCE_TYPES.PERSISTENTVOLUMECLAIM]: {
    type: K8S_RESOURCE_TYPES.PERSISTENTVOLUMECLAIM,
    label: 'PersistentVolumeClaim',
    category: ResourceCategory.STORAGE,
    icon: 'lucide:file-box',
    namespaced: true,
    path: '/k8s/persistent-volume-claims',
  },
  [K8S_RESOURCE_TYPES.STORAGECLASS]: {
    type: K8S_RESOURCE_TYPES.STORAGECLASS,
    label: 'StorageClass',
    category: ResourceCategory.STORAGE,
    icon: 'lucide:database',
    namespaced: false,
    path: '/k8s/storage-classes',
  },
  [K8S_RESOURCE_TYPES.NODE]: {
    type: K8S_RESOURCE_TYPES.NODE,
    label: 'Node',
    category: ResourceCategory.CLUSTER,
    icon: 'lucide:server',
    namespaced: false,
    path: '/k8s/nodes',
  },
  [K8S_RESOURCE_TYPES.NAMESPACE]: {
    type: K8S_RESOURCE_TYPES.NAMESPACE,
    label: 'Namespace',
    category: ResourceCategory.CLUSTER,
    icon: 'lucide:folder',
    namespaced: false,
    path: '/k8s/namespaces',
  },
  [K8S_RESOURCE_TYPES.CLUSTER]: {
    type: K8S_RESOURCE_TYPES.CLUSTER,
    label: 'Cluster',
    category: ResourceCategory.CLUSTER,
    icon: 'lucide:server',
    namespaced: false,
    path: '/k8s/clusters',
  },
};
