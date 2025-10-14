/**
 * K8s 资源配置工厂
 * 提供快速创建资源列表配置的工具函数
 */

import type {
  ConfigMap,
  CronJob,
  DaemonSet,
  Deployment,
  Job,
  Namespace,
  Pod,
  Secret,
  Service,
  StatefulSet,
} from '#/api/k8s/types';
import type {
  ResourceActionConfig,
  ResourceColumnConfig,
  ResourceListConfig,
} from '#/types/k8s-resource-base';

import { message, Modal } from 'ant-design-vue';

import {
  getMockConfigMapList,
  getMockCronJobList,
  getMockDaemonSetList,
  getMockDeploymentList,
  getMockJobList,
  getMockNamespaceList,
  getMockPodList,
  getMockSecretList,
  getMockServiceList,
  getMockStatefulSetList,
} from '#/api/k8s/mock';

/**
 * 创建通用的查看操作
 */
export function createViewAction(
  resourceLabel: string,
  contentGenerator: (row: any) => string,
): ResourceActionConfig {
  return {
    action: 'view',
    label: '详情',
    handler: (row: any) => {
      Modal.info({
        title: `${resourceLabel} 详情`,
        width: 700,
        content: contentGenerator(row),
      });
    },
  };
}

/**
 * 创建通用的删除操作
 */
export function createDeleteAction(resourceLabel: string): ResourceActionConfig {
  return {
    action: 'delete',
    label: '删除',
    danger: true,
    handler: (row: any) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除 ${resourceLabel} "${row.metadata.name}" 吗？此操作不可恢复。`,
        onOk() {
          message.success(`${resourceLabel} "${row.metadata.name}" 删除成功`);
        },
      });
    },
  };
}

/**
 * 创建通用的编辑操作
 */
export function createEditAction(resourceLabel: string): ResourceActionConfig {
  return {
    action: 'edit',
    label: '编辑',
    handler: (row: any) => {
      message.info(`编辑 ${resourceLabel} "${row.metadata.name}" (功能开发中)`);
    },
  };
}

/**
 * Pod 资源配置
 */
export function createPodConfig(): ResourceListConfig<Pod> {
  return {
    resourceType: 'pod',
    resourceLabel: 'Pod',
    fetchData: async (params) => {
      const result = getMockPodList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'Pod 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'status.phase',
        title: '状态',
        width: 120,
        slots: { default: 'status-slot' },
      },
      { field: 'status.podIP', title: 'Pod IP', width: 150 },
      { field: 'spec.nodeName', title: '节点', width: 150 },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('Pod', (row: Pod) => {
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          状态: ${row.status.phase}
          Pod IP: ${row.status.podIP}
          节点: ${row.spec.nodeName}
          容器数量: ${row.spec.containers.length}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      {
        action: 'logs',
        label: '日志',
        handler: (row: Pod) => {
          message.info(`查看 Pod "${row.metadata.name}" 日志 (功能开发中)`);
        },
      },
      createDeleteAction('Pod'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 Pod 名称',
    },
    statusConfig: {
      field: 'status.phase',
      statusMap: {
        Running: { color: 'success', label: 'Running' },
        Pending: { color: 'warning', label: 'Pending' },
        Failed: { color: 'error', label: 'Failed' },
        Succeeded: { color: 'success', label: 'Succeeded' },
      },
    },
  };
}

/**
 * Deployment 资源配置
 */
export function createDeploymentConfig(): ResourceListConfig<Deployment> {
  return {
    resourceType: 'deployment',
    resourceLabel: 'Deployment',
    fetchData: async (params) => {
      const result = getMockDeploymentList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'Deployment 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      { field: 'spec.replicas', title: '副本数', width: 100 },
      {
        field: 'status.readyReplicas',
        title: '就绪副本',
        width: 120,
        slots: { default: 'ready-slot' },
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('Deployment', (row: Deployment) => {
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          副本数: ${row.spec.replicas}
          就绪副本: ${row.status?.readyReplicas ?? 0}
          可用副本: ${row.status?.availableReplicas ?? 0}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      {
        action: 'scale',
        label: '扩缩容',
        handler: (row: Deployment) => {
          message.info(`扩缩容 Deployment "${row.metadata.name}" (功能开发中)`);
        },
      },
      {
        action: 'restart',
        label: '重启',
        handler: (row: Deployment) => {
          Modal.confirm({
            title: '确认重启',
            content: `确定要重启 Deployment "${row.metadata.name}" 吗？`,
            onOk() {
              message.success(`Deployment "${row.metadata.name}" 重启成功`);
            },
          });
        },
      },
      createEditAction('Deployment'),
      createDeleteAction('Deployment'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 Deployment 名称',
    },
  };
}

/**
 * Service 资源配置
 */
export function createServiceConfig(): ResourceListConfig<Service> {
  return {
    resourceType: 'service',
    resourceLabel: 'Service',
    fetchData: async (params) => {
      const result = getMockServiceList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'Service 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'spec.type',
        title: '类型',
        width: 150,
        slots: { default: 'type-slot' },
      },
      { field: 'spec.clusterIP', title: 'Cluster IP', width: 150 },
      {
        field: 'spec.ports',
        title: '端口',
        width: 150,
        slots: { default: 'ports-slot' },
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('Service', (row: Service) => {
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          类型: ${row.spec.type}
          Cluster IP: ${row.spec.clusterIP}
          端口: ${row.spec.ports.map((p) => `${p.port}:${p.targetPort}`).join(', ')}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createEditAction('Service'),
      createDeleteAction('Service'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 Service 名称',
    },
    statusConfig: {
      field: 'spec.type',
      statusMap: {
        ClusterIP: { color: 'blue' },
        NodePort: { color: 'green' },
        LoadBalancer: { color: 'green' },
      },
    },
  };
}

/**
 * ConfigMap 资源配置
 */
export function createConfigMapConfig(): ResourceListConfig<ConfigMap> {
  return {
    resourceType: 'configmap',
    resourceLabel: 'ConfigMap',
    fetchData: async (params) => {
      const result = getMockConfigMapList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'ConfigMap 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'data',
        title: '键数量',
        width: 120,
        slots: { default: 'keys-slot' },
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('ConfigMap', (row: ConfigMap) => {
        const dataKeys = row.data ? Object.keys(row.data) : [];
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          键数量: ${dataKeys.length}
          键列表: ${dataKeys.join(', ')}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createEditAction('ConfigMap'),
      createDeleteAction('ConfigMap'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 ConfigMap 名称',
    },
  };
}

/**
 * CronJob 资源配置
 */
export function createCronJobConfig(): ResourceListConfig<CronJob> {
  return {
    resourceType: 'cronjob',
    resourceLabel: 'CronJob',
    fetchData: async (params) => {
      const result = getMockCronJobList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'CronJob 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      { field: 'spec.schedule', title: '调度规则', width: 150 },
      {
        field: 'spec.suspend',
        title: '状态',
        width: 100,
        slots: { default: 'suspend-slot' },
      },
      {
        field: 'status.lastScheduleTime',
        title: '上次调度时间',
        width: 180,
        formatter: 'formatDateTime',
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('CronJob', (row: CronJob) => {
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          调度规则: ${row.spec.schedule}
          状态: ${row.spec.suspend ? '已暂停' : '运行中'}
          上次调度时间: ${row.status?.lastScheduleTime || '无'}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      {
        action: 'edit',
        label: row => (row.spec.suspend ? '启用' : '暂停'),
        handler: (row: CronJob) => {
          const action = row.spec.suspend ? '启用' : '暂停';
          message.info(`${action} CronJob "${row.metadata.name}" (功能开发中)`);
        },
      },
      createDeleteAction('CronJob'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 CronJob 名称',
    },
  };
}

/**
 * Secret 资源配置
 */
export function createSecretConfig(): ResourceListConfig<Secret> {
  return {
    resourceType: 'secret',
    resourceLabel: 'Secret',
    fetchData: async (params) => {
      const result = getMockSecretList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'Secret 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      { field: 'type', title: '类型', width: 250 },
      {
        field: 'data',
        title: '键数量',
        width: 120,
        slots: { default: 'keys-slot' },
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('Secret', (row: Secret) => {
        const dataKeys = row.data ? Object.keys(row.data) : [];
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          类型: ${row.type}
          键数量: ${dataKeys.length}
          键列表: ${dataKeys.join(', ')}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createEditAction('Secret'),
      createDeleteAction('Secret'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 Secret 名称',
    },
  };
}

/**
 * Namespace 资源配置
 */
export function createNamespaceConfig(): ResourceListConfig<Namespace> {
  return {
    resourceType: 'namespace',
    resourceLabel: 'Namespace',
    fetchData: async (params) => {
      const result = getMockNamespaceList({
        clusterId: params.clusterId || 'cluster-prod-01',
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'Namespace 名称', minWidth: 200 },
      {
        field: 'status.phase',
        title: '状态',
        width: 120,
        slots: { default: 'status-slot' },
      },
      {
        field: 'metadata.labels',
        title: '环境',
        width: 150,
        formatter: ({ cellValue }: any) => {
          return cellValue?.environment || '-';
        },
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('Namespace', (row: Namespace) => {
        return `
          名称: ${row.metadata.name}
          状态: ${row.status.phase}
          环境: ${row.metadata.labels?.environment || '-'}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createEditAction('Namespace'),
      createDeleteAction('Namespace'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: false,
      showSearch: true,
      searchPlaceholder: '搜索 Namespace 名称',
    },
    statusConfig: {
      field: 'status.phase',
      statusMap: {
        Active: { color: 'success', label: 'Active' },
        Terminating: { color: 'error', label: 'Terminating' },
      },
    },
  };
}

/**
 * StatefulSet 资源配置
 */
export function createStatefulSetConfig(): ResourceListConfig<StatefulSet> {
  return {
    resourceType: 'statefulset',
    resourceLabel: 'StatefulSet',
    fetchData: async (params) => {
      const result = getMockStatefulSetList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'StatefulSet 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      { field: 'spec.replicas', title: '副本数', width: 100 },
      {
        field: 'status.readyReplicas',
        title: '就绪副本',
        width: 120,
        slots: { default: 'ready-slot' },
      },
      {
        field: 'spec.serviceName',
        title: '服务名称',
        width: 150,
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('StatefulSet', (row: StatefulSet) => {
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          副本数: ${row.spec.replicas}
          就绪副本: ${row.status?.readyReplicas ?? 0}
          当前副本: ${row.status?.currentReplicas ?? 0}
          服务名称: ${row.spec.serviceName}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      {
        action: 'scale',
        label: '扩缩容',
        handler: (row: StatefulSet) => {
          message.info(`扩缩容 StatefulSet "${row.metadata.name}" (功能开发中)`);
        },
      },
      createEditAction('StatefulSet'),
      createDeleteAction('StatefulSet'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 StatefulSet 名称',
    },
  };
}

/**
 * DaemonSet 资源配置
 */
export function createDaemonSetConfig(): ResourceListConfig<DaemonSet> {
  return {
    resourceType: 'daemonset',
    resourceLabel: 'DaemonSet',
    fetchData: async (params) => {
      const result = getMockDaemonSetList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'DaemonSet 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'status.desiredNumberScheduled',
        title: '期望节点数',
        width: 120,
      },
      {
        field: 'status.numberReady',
        title: '就绪节点数',
        width: 120,
        slots: { default: 'ready-slot' },
      },
      {
        field: 'status.numberAvailable',
        title: '可用节点数',
        width: 120,
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('DaemonSet', (row: DaemonSet) => {
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          期望节点数: ${row.status.desiredNumberScheduled}
          当前调度数: ${row.status.currentNumberScheduled}
          就绪节点数: ${row.status.numberReady}
          可用节点数: ${row.status.numberAvailable ?? 0}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createEditAction('DaemonSet'),
      createDeleteAction('DaemonSet'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 DaemonSet 名称',
    },
  };
}

/**
 * Job 资源配置
 */
export function createJobConfig(): ResourceListConfig<Job> {
  return {
    resourceType: 'job',
    resourceLabel: 'Job',
    fetchData: async (params) => {
      const result = getMockJobList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'Job 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'spec.completions',
        title: '完成数',
        width: 100,
      },
      {
        field: 'status.succeeded',
        title: '成功',
        width: 80,
      },
      {
        field: 'status.failed',
        title: '失败',
        width: 80,
      },
      {
        field: 'status.active',
        title: '运行中',
        width: 100,
        slots: { default: 'active-slot' },
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('Job', (row: Job) => {
        const statusType =
          (row.status?.succeeded ?? 0) >= (row.spec.completions ?? 0)
            ? '已完成'
            : (row.status?.failed ?? 0) > 0
              ? '失败'
              : '运行中';

        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          状态: ${statusType}
          完成数: ${row.spec.completions ?? 1}
          并行数: ${row.spec.parallelism ?? 1}
          成功: ${row.status?.succeeded ?? 0}
          失败: ${row.status?.failed ?? 0}
          运行中: ${row.status?.active ?? 0}
          开始时间: ${row.status?.startTime || '未开始'}
          完成时间: ${row.status?.completionTime || '未完成'}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      {
        action: 'logs',
        label: '日志',
        handler: (row: Job) => {
          message.info(`查看 Job "${row.metadata.name}" 日志 (功能开发中)`);
        },
      },
      createDeleteAction('Job'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 Job 名称',
    },
  };
}
