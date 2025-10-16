/**
 * K8s 资源配置工厂
 * 提供快速创建资源列表配置的工具函数
 */

import type {
  ConfigMap,
  CronJob,
  DaemonSet,
  Deployment,
  Endpoints,
  EndpointSlice,
  HorizontalPodAutoscaler,
  Ingress,
  Job,
  Namespace,
  NetworkPolicy,
  PersistentVolume,
  PersistentVolumeClaim,
  Pod,
  PriorityClass,
  ReplicaSet,
  Secret,
  Service,
  StatefulSet,
  StorageClass,
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
  getMockEndpointsList,
  getMockEndpointSliceList,
  getMockHPAList,
  getMockIngressList,
  getMockJobList,
  getMockNamespaceList,
  getMockNetworkPolicyList,
  getMockPodList,
  getMockPriorityClassList,
  getMockPVCList,
  getMockPVList,
  getMockReplicaSetList,
  getMockSecretList,
  getMockServiceList,
  getMockStatefulSetList,
  getMockStorageClassList,
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
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 Deployment 名称',
              rules: [
                { required: true, message: '请输入 Deployment 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
            {
              field: 'spec.replicas',
              label: '副本数',
              type: 'number',
              required: true,
              min: 0,
              defaultValue: 1,
              rules: [
                { required: true, message: '请输入副本数' },
                { type: 'number', min: 0, message: '最小值为 0' },
              ],
            },
          ],
        },
        {
          title: 'Pod 选择器',
          fields: [
            {
              field: 'spec.selector.matchLabels',
              label: 'Pod 标签',
              type: 'labels',
              help: '用于选择要管理的 Pod',
            },
          ],
        },
        {
          title: '容器配置',
          fields: [
            {
              field: 'spec.template.spec.containers[0].name',
              label: '容器名称',
              type: 'input',
              required: true,
              placeholder: '请输入容器名称',
              rules: [{ required: true, message: '请输入容器名称' }],
            },
            {
              field: 'spec.template.spec.containers[0].image',
              label: '镜像',
              type: 'input',
              required: true,
              placeholder: '例如: nginx:1.21',
              rules: [{ required: true, message: '请输入镜像' }],
            },
            {
              field: 'spec.template.spec.containers[0].ports[0].containerPort',
              label: '容器端口',
              type: 'number',
              min: 1,
              max: 65535,
              placeholder: '例如: 80',
              help: '容器暴露的端口号',
            },
          ],
          collapsible: true,
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {},
          },
          template: {
            metadata: {
              labels: {},
            },
            spec: {
              containers: [
                {
                  name: '',
                  image: '',
                  ports: [
                    {
                      containerPort: 80,
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
    enableCreate: true,
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
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 Service 名称',
              rules: [
                { required: true, message: '请输入 Service 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
            {
              field: 'spec.type',
              label: '服务类型',
              type: 'select',
              required: true,
              options: [
                { label: 'ClusterIP（集群内部访问）', value: 'ClusterIP' },
                { label: 'NodePort（节点端口访问）', value: 'NodePort' },
                { label: 'LoadBalancer（负载均衡器）', value: 'LoadBalancer' },
              ],
              rules: [{ required: true, message: '请选择服务类型' }],
            },
          ],
        },
        {
          title: 'Pod 选择器',
          fields: [
            {
              field: 'spec.selector',
              label: 'Pod 标签',
              type: 'labels',
              help: '选择要代理的 Pod',
            },
          ],
        },
        {
          title: '端口配置',
          fields: [
            {
              field: 'spec.ports[0].port',
              label: '服务端口',
              type: 'number',
              required: true,
              min: 1,
              max: 65535,
              placeholder: '例如: 80',
              rules: [
                { required: true, message: '请输入服务端口' },
                { type: 'number', min: 1, max: 65535, message: '端口范围 1-65535' },
              ],
            },
            {
              field: 'spec.ports[0].targetPort',
              label: '目标端口',
              type: 'number',
              required: true,
              min: 1,
              max: 65535,
              placeholder: '例如: 8080',
              rules: [
                { required: true, message: '请输入目标端口' },
                { type: 'number', min: 1, max: 65535, message: '端口范围 1-65535' },
              ],
              help: '容器的端口号',
            },
            {
              field: 'spec.ports[0].protocol',
              label: '协议',
              type: 'select',
              options: [
                { label: 'TCP', value: 'TCP' },
                { label: 'UDP', value: 'UDP' },
              ],
            },
          ],
          collapsible: true,
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          type: 'ClusterIP',
          selector: {},
          ports: [
            {
              port: 80,
              targetPort: 8080,
              protocol: 'TCP',
            },
          ],
        },
      },
    },
    enableCreate: true,
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
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 ConfigMap 名称',
              rules: [
                { required: true, message: '请输入 ConfigMap 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
          ],
        },
        {
          title: '配置数据',
          fields: [
            {
              field: 'data',
              label: '数据',
              type: 'labels',
              help: '配置数据的键值对',
            },
          ],
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        data: {},
      },
    },
    enableCreate: true,
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
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 CronJob 名称',
              rules: [
                { required: true, message: '请输入 CronJob 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
            {
              field: 'spec.schedule',
              label: '调度规则',
              type: 'input',
              required: true,
              placeholder: '例如: 0 */6 * * *',
              rules: [{ required: true, message: '请输入 Cron 表达式' }],
              help: 'Cron 表达式，例如 "0 */6 * * *" 表示每 6 小时执行一次',
            },
            {
              field: 'spec.suspend',
              label: '暂停任务',
              type: 'switch',
              help: '是否暂停定时任务',
            },
          ],
        },
        {
          title: '容器配置',
          fields: [
            {
              field: 'spec.jobTemplate.spec.template.spec.containers[0].name',
              label: '容器名称',
              type: 'input',
              required: true,
              placeholder: '请输入容器名称',
              rules: [{ required: true, message: '请输入容器名称' }],
            },
            {
              field: 'spec.jobTemplate.spec.template.spec.containers[0].image',
              label: '镜像',
              type: 'input',
              required: true,
              placeholder: '例如: busybox:1.28',
              rules: [{ required: true, message: '请输入镜像' }],
            },
          ],
          collapsible: true,
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'batch/v1',
        kind: 'CronJob',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          schedule: '0 */6 * * *',
          suspend: false,
          jobTemplate: {
            spec: {
              template: {
                spec: {
                  containers: [
                    {
                      name: '',
                      image: '',
                    },
                  ],
                  restartPolicy: 'OnFailure',
                },
              },
            },
          },
        },
      },
    },
    enableCreate: true,
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
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 Secret 名称',
              rules: [
                { required: true, message: '请输入 Secret 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
            {
              field: 'type',
              label: '类型',
              type: 'select',
              required: true,
              options: [
                { label: 'Opaque（通用）', value: 'Opaque' },
                { label: 'kubernetes.io/tls（TLS 证书）', value: 'kubernetes.io/tls' },
                { label: 'kubernetes.io/dockerconfigjson（Docker 配置）', value: 'kubernetes.io/dockerconfigjson' },
                { label: 'kubernetes.io/basic-auth（基本认证）', value: 'kubernetes.io/basic-auth' },
                { label: 'kubernetes.io/ssh-auth（SSH 认证）', value: 'kubernetes.io/ssh-auth' },
              ],
              rules: [{ required: true, message: '请选择 Secret 类型' }],
            },
          ],
        },
        {
          title: '密钥数据',
          fields: [
            {
              field: 'data',
              label: '数据',
              type: 'labels',
              help: '密钥数据的键值对（值将自动进行 Base64 编码）',
            },
          ],
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        type: 'Opaque',
        data: {},
      },
    },
    enableCreate: true,
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
    // 表单配置
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 Namespace 名称',
              help: '名称必须是唯一的，且符合 DNS-1123 规范',
              rules: [
                { required: true, message: '请输入 Namespace 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
          ],
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: '',
          labels: {},
          annotations: {},
        },
        status: {
          phase: 'Active',
        },
      },
    },
    // 启用创建功能
    enableCreate: true,
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
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 StatefulSet 名称',
              rules: [
                { required: true, message: '请输入 StatefulSet 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
            {
              field: 'spec.serviceName',
              label: '服务名称',
              type: 'input',
              required: true,
              placeholder: '请输入关联的 Headless Service 名称',
              rules: [{ required: true, message: '请输入服务名称' }],
              help: 'StatefulSet 需要关联一个 Headless Service',
            },
            {
              field: 'spec.replicas',
              label: '副本数',
              type: 'number',
              required: true,
              min: 0,
              defaultValue: 1,
              rules: [
                { required: true, message: '请输入副本数' },
                { type: 'number', min: 0, message: '最小值为 0' },
              ],
            },
          ],
        },
        {
          title: 'Pod 选择器',
          fields: [
            {
              field: 'spec.selector.matchLabels',
              label: 'Pod 标签',
              type: 'labels',
              help: '用于选择要管理的 Pod',
            },
          ],
        },
        {
          title: '容器配置',
          fields: [
            {
              field: 'spec.template.spec.containers[0].name',
              label: '容器名称',
              type: 'input',
              required: true,
              placeholder: '请输入容器名称',
              rules: [{ required: true, message: '请输入容器名称' }],
            },
            {
              field: 'spec.template.spec.containers[0].image',
              label: '镜像',
              type: 'input',
              required: true,
              placeholder: '例如: mysql:8.0',
              rules: [{ required: true, message: '请输入镜像' }],
            },
            {
              field: 'spec.template.spec.containers[0].ports[0].containerPort',
              label: '容器端口',
              type: 'number',
              min: 1,
              max: 65535,
              placeholder: '例如: 3306',
              help: '容器暴露的端口号',
            },
          ],
          collapsible: true,
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'apps/v1',
        kind: 'StatefulSet',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          serviceName: '',
          replicas: 1,
          selector: {
            matchLabels: {},
          },
          template: {
            metadata: {
              labels: {},
            },
            spec: {
              containers: [
                {
                  name: '',
                  image: '',
                  ports: [
                    {
                      containerPort: 80,
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
    enableCreate: true,
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
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 DaemonSet 名称',
              rules: [
                { required: true, message: '请输入 DaemonSet 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
          ],
        },
        {
          title: 'Pod 选择器',
          fields: [
            {
              field: 'spec.selector.matchLabels',
              label: 'Pod 标签',
              type: 'labels',
              help: '用于选择要管理的 Pod',
            },
          ],
        },
        {
          title: '容器配置',
          fields: [
            {
              field: 'spec.template.spec.containers[0].name',
              label: '容器名称',
              type: 'input',
              required: true,
              placeholder: '请输入容器名称',
              rules: [{ required: true, message: '请输入容器名称' }],
            },
            {
              field: 'spec.template.spec.containers[0].image',
              label: '镜像',
              type: 'input',
              required: true,
              placeholder: '例如: fluentd:v1.14',
              rules: [{ required: true, message: '请输入镜像' }],
            },
          ],
          collapsible: true,
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'apps/v1',
        kind: 'DaemonSet',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          selector: {
            matchLabels: {},
          },
          template: {
            metadata: {
              labels: {},
            },
            spec: {
              containers: [
                {
                  name: '',
                  image: '',
                },
              ],
            },
          },
        },
      },
    },
    enableCreate: true,
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
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 Job 名称',
              rules: [
                { required: true, message: '请输入 Job 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
          ],
        },
        {
          title: '任务设置',
          fields: [
            {
              field: 'spec.completions',
              label: '完成次数',
              type: 'number',
              min: 1,
              defaultValue: 1,
              help: '任务需要成功完成的次数',
            },
            {
              field: 'spec.parallelism',
              label: '并行数',
              type: 'number',
              min: 1,
              defaultValue: 1,
              help: '并行执行的 Pod 数量',
            },
          ],
        },
        {
          title: '容器配置',
          fields: [
            {
              field: 'spec.template.spec.containers[0].name',
              label: '容器名称',
              type: 'input',
              required: true,
              placeholder: '请输入容器名称',
              rules: [{ required: true, message: '请输入容器名称' }],
            },
            {
              field: 'spec.template.spec.containers[0].image',
              label: '镜像',
              type: 'input',
              required: true,
              placeholder: '例如: perl:5.34',
              rules: [{ required: true, message: '请输入镜像' }],
            },
          ],
          collapsible: true,
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          completions: 1,
          parallelism: 1,
          template: {
            spec: {
              containers: [
                {
                  name: '',
                  image: '',
                },
              ],
              restartPolicy: 'OnFailure',
            },
          },
        },
      },
    },
    enableCreate: true,
  };
}

// ==================== 存储资源配置 ====================

/**
 * PersistentVolume 资源配置
 */
export function createPVConfig(): ResourceListConfig<PersistentVolume> {
  return {
    resourceType: 'persistentvolume',
    resourceLabel: 'PersistentVolume',
    fetchData: async (params) => {
      const result = getMockPVList({
        clusterId: params.clusterId || 'cluster-prod-01',
        storageClass: params.storageClass,
        status: params.status,
        accessMode: params.accessMode,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'PV 名称', minWidth: 200 },
      {
        field: 'status.phase',
        title: '状态',
        width: 120,
        slots: { default: 'status-slot' },
      },
      {
        field: 'spec.capacity.storage',
        title: '容量',
        width: 100,
      },
      {
        field: 'spec.storageClassName',
        title: '存储类',
        width: 150,
      },
      {
        field: 'spec.accessModes',
        title: '访问模式',
        width: 180,
        formatter: ({ cellValue }: any) => {
          return cellValue?.join(', ') || '-';
        },
      },
      {
        field: 'spec.persistentVolumeReclaimPolicy',
        title: '回收策略',
        width: 120,
      },
      {
        field: 'spec.claimRef',
        title: '绑定的 PVC',
        minWidth: 200,
        formatter: ({ cellValue }: any) => {
          return cellValue ? `${cellValue.namespace}/${cellValue.name}` : '未绑定';
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
      createViewAction('PersistentVolume', (row: PersistentVolume) => {
        const backendType = row.spec.nfs
          ? 'NFS'
          : row.spec.hostPath
            ? 'HostPath'
            : row.spec.csi
              ? 'CSI'
              : row.spec.awsElasticBlockStore
                ? 'AWS EBS'
                : '其他';

        return `
          名称: ${row.metadata.name}
          状态: ${row.status?.phase}
          容量: ${row.spec.capacity.storage}
          存储类: ${row.spec.storageClassName || '-'}
          访问模式: ${row.spec.accessModes.join(', ')}
          回收策略: ${row.spec.persistentVolumeReclaimPolicy}
          存储后端: ${backendType}
          绑定的 PVC: ${row.spec.claimRef ? `${row.spec.claimRef.namespace}/${row.spec.claimRef.name}` : '未绑定'}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createDeleteAction('PersistentVolume'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: false,
      showSearch: true,
      searchPlaceholder: '搜索 PV 名称',
      customFilters: [
        {
          field: 'storageClass',
          label: '存储类',
          type: 'select',
          options: [
            { label: '全部', value: '' },
            { label: 'standard', value: 'standard' },
            { label: 'fast-ssd', value: 'fast-ssd' },
            { label: 'slow-hdd', value: 'slow-hdd' },
            { label: 'nfs-storage', value: 'nfs-storage' },
            { label: 'local-storage', value: 'local-storage' },
          ],
        },
        {
          field: 'status',
          label: '状态',
          type: 'select',
          options: [
            { label: '全部', value: '' },
            { label: 'Available', value: 'Available' },
            { label: 'Bound', value: 'Bound' },
            { label: 'Released', value: 'Released' },
            { label: 'Failed', value: 'Failed' },
            { label: 'Pending', value: 'Pending' },
          ],
        },
        {
          field: 'accessMode',
          label: '访问模式',
          type: 'select',
          options: [
            { label: '全部', value: '' },
            { label: 'ReadWriteOnce', value: 'ReadWriteOnce' },
            { label: 'ReadOnlyMany', value: 'ReadOnlyMany' },
            { label: 'ReadWriteMany', value: 'ReadWriteMany' },
          ],
        },
      ],
    },
    statusConfig: {
      field: 'status.phase',
      statusMap: {
        Available: { color: 'success', label: 'Available' },
        Bound: { color: 'processing', label: 'Bound' },
        Released: { color: 'warning', label: 'Released' },
        Failed: { color: 'error', label: 'Failed' },
        Pending: { color: 'default', label: 'Pending' },
      },
    },
  };
}

/**
 * PersistentVolumeClaim 资源配置
 */
export function createPVCConfig(): ResourceListConfig<PersistentVolumeClaim> {
  return {
    resourceType: 'persistentvolumeclaim',
    resourceLabel: 'PersistentVolumeClaim',
    fetchData: async (params) => {
      const result = getMockPVCList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        storageClass: params.storageClass,
        status: params.status,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'PVC 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'status.phase',
        title: '状态',
        width: 120,
        slots: { default: 'status-slot' },
      },
      {
        field: 'spec.volumeName',
        title: '绑定的 PV',
        minWidth: 200,
      },
      {
        field: 'spec.resources.requests.storage',
        title: '请求容量',
        width: 120,
      },
      {
        field: 'status.capacity.storage',
        title: '实际容量',
        width: 120,
      },
      {
        field: 'spec.storageClassName',
        title: '存储类',
        width: 150,
      },
      {
        field: 'spec.accessModes',
        title: '访问模式',
        width: 180,
        formatter: ({ cellValue }: any) => {
          return cellValue?.join(', ') || '-';
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
      createViewAction('PersistentVolumeClaim', (row: PersistentVolumeClaim) => {
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          状态: ${row.status?.phase}
          绑定的 PV: ${row.spec.volumeName || '未绑定'}
          请求容量: ${row.spec.resources.requests.storage}
          实际容量: ${row.status?.capacity?.storage || '-'}
          存储类: ${row.spec.storageClassName || '-'}
          访问模式: ${row.spec.accessModes.join(', ')}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createDeleteAction('PersistentVolumeClaim'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 PVC 名称',
      customFilters: [
        {
          field: 'storageClass',
          label: '存储类',
          type: 'select',
          options: [
            { label: '全部', value: '' },
            { label: 'standard', value: 'standard' },
            { label: 'fast-ssd', value: 'fast-ssd' },
            { label: 'slow-hdd', value: 'slow-hdd' },
            { label: 'nfs-storage', value: 'nfs-storage' },
            { label: 'local-storage', value: 'local-storage' },
          ],
        },
        {
          field: 'status',
          label: '状态',
          type: 'select',
          options: [
            { label: '全部', value: '' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Bound', value: 'Bound' },
            { label: 'Lost', value: 'Lost' },
          ],
        },
      ],
    },
    statusConfig: {
      field: 'status.phase',
      statusMap: {
        Pending: { color: 'warning', label: 'Pending' },
        Bound: { color: 'success', label: 'Bound' },
        Lost: { color: 'error', label: 'Lost' },
      },
    },
  };
}

/**
 * StorageClass 资源配置
 */
export function createStorageClassConfig(): ResourceListConfig<StorageClass> {
  return {
    resourceType: 'storageclass',
    resourceLabel: 'StorageClass',
    fetchData: async (params) => {
      const result = getMockStorageClassList({
        clusterId: params.clusterId || 'cluster-prod-01',
        provisioner: params.provisioner,
        reclaimPolicy: params.reclaimPolicy,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: '存储类名称', minWidth: 200 },
      {
        field: 'provisioner',
        title: 'Provisioner',
        minWidth: 250,
      },
      {
        field: 'reclaimPolicy',
        title: '回收策略',
        width: 120,
      },
      {
        field: 'volumeBindingMode',
        title: '绑定模式',
        width: 180,
      },
      {
        field: 'allowVolumeExpansion',
        title: '允许扩容',
        width: 120,
        formatter: ({ cellValue }: any) => {
          return cellValue ? '是' : '否';
        },
      },
      {
        field: 'parameters',
        title: '参数数量',
        width: 120,
        formatter: ({ cellValue }: any) => {
          return cellValue ? Object.keys(cellValue).length : 0;
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
      createViewAction('StorageClass', (row: StorageClass) => {
        const isDefault = row.metadata.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true';
        const paramsCount = row.parameters ? Object.keys(row.parameters).length : 0;
        const mountOptionsCount = row.mountOptions ? row.mountOptions.length : 0;

        return `
          名称: ${row.metadata.name}
          Provisioner: ${row.provisioner}
          回收策略: ${row.reclaimPolicy || 'Delete'}
          绑定模式: ${row.volumeBindingMode || 'Immediate'}
          允许扩容: ${row.allowVolumeExpansion ? '是' : '否'}
          默认存储类: ${isDefault ? '是' : '否'}
          参数数量: ${paramsCount}
          挂载选项数量: ${mountOptionsCount}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: false,
      showSearch: true,
      searchPlaceholder: '搜索存储类名称',
      customFilters: [
        {
          field: 'provisioner',
          label: 'Provisioner',
          type: 'select',
          options: [
            { label: '全部', value: '' },
            { label: 'AWS EBS', value: 'kubernetes.io/aws-ebs' },
            { label: 'GCE PD', value: 'kubernetes.io/gce-pd' },
            { label: 'Azure Disk', value: 'kubernetes.io/azure-disk' },
            { label: 'NFS CSI', value: 'nfs.csi.k8s.io' },
            { label: 'CSI Example', value: 'csi.example.com' },
            { label: 'Local Storage', value: 'kubernetes.io/no-provisioner' },
          ],
        },
        {
          field: 'reclaimPolicy',
          label: '回收策略',
          type: 'select',
          options: [
            { label: '全部', value: '' },
            { label: 'Delete', value: 'Delete' },
            { label: 'Retain', value: 'Retain' },
          ],
        },
      ],
    },
  };
}

// ==================== 新增资源配置 ====================

/**
 * NetworkPolicy 资源配置
 */
export function createNetworkPolicyConfig(): ResourceListConfig<NetworkPolicy> {
  return {
    resourceType: 'networkpolicy',
    resourceLabel: 'NetworkPolicy',
    fetchData: async (params) => {
      const result = getMockNetworkPolicyList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'NetworkPolicy 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'spec.policyTypes',
        title: '策略类型',
        width: 150,
        formatter: ({ cellValue }: any) => {
          return cellValue?.join(', ') || '-';
        },
      },
      {
        field: 'spec.podSelector.matchLabels',
        title: 'Pod 选择器',
        minWidth: 200,
        formatter: ({ cellValue }: any) => {
          if (!cellValue) return '全部 Pod';
          return Object.entries(cellValue).map(([k, v]) => `${k}=${v}`).join(', ');
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
      createViewAction('NetworkPolicy', (row: NetworkPolicy) => {
        const policyTypes = row.spec.policyTypes?.join(', ') || '-';
        const hasIngress = row.spec.ingress && row.spec.ingress.length > 0;
        const hasEgress = row.spec.egress && row.spec.egress.length > 0;

        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          策略类型: ${policyTypes}
          Ingress 规则: ${hasIngress ? row.spec.ingress!.length + ' 条' : '无'}
          Egress 规则: ${hasEgress ? row.spec.egress!.length + ' 条' : '无'}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createDeleteAction('NetworkPolicy'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 NetworkPolicy 名称',
    },
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 NetworkPolicy 名称',
              rules: [
                { required: true, message: '请输入 NetworkPolicy 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
          ],
        },
        {
          title: 'Pod 选择器',
          fields: [
            {
              field: 'spec.podSelector.matchLabels',
              label: 'Pod 标签',
              type: 'labels',
              help: '选择应用此策略的 Pod（留空表示选择所有 Pod）',
            },
          ],
        },
        {
          title: '策略类型',
          fields: [
            {
              field: 'spec.policyTypes',
              label: '策略类型',
              type: 'select',
              mode: 'multiple',
              options: [
                { label: 'Ingress（入站）', value: 'Ingress' },
                { label: 'Egress（出站）', value: 'Egress' },
              ],
              help: '选择入站或出站规则类型',
            },
          ],
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'NetworkPolicy',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          podSelector: {
            matchLabels: {},
          },
          policyTypes: ['Ingress'],
          ingress: [],
          egress: [],
        },
      },
    },
    enableCreate: true,
  };
}

/**
 * HorizontalPodAutoscaler (HPA) 资源配置
 */
export function createHPAConfig(): ResourceListConfig<HorizontalPodAutoscaler> {
  return {
    resourceType: 'hpa',
    resourceLabel: 'HPA',
    fetchData: async (params) => {
      const result = getMockHPAList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'HPA 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'spec.scaleTargetRef',
        title: '目标资源',
        minWidth: 200,
        formatter: ({ cellValue }: any) => {
          return `${cellValue.kind}/${cellValue.name}`;
        },
      },
      {
        field: 'spec.minReplicas',
        title: '最小副本',
        width: 100,
      },
      {
        field: 'spec.maxReplicas',
        title: '最大副本',
        width: 100,
      },
      {
        field: 'status.currentReplicas',
        title: '当前副本',
        width: 100,
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('HPA', (row: HorizontalPodAutoscaler) => {
        const targetRef = row.spec.scaleTargetRef;
        const metricsCount = row.spec.metrics?.length || 0;

        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          目标资源: ${targetRef.kind}/${targetRef.name}
          最小副本: ${row.spec.minReplicas || 1}
          最大副本: ${row.spec.maxReplicas}
          当前副本: ${row.status?.currentReplicas}
          期望副本: ${row.status?.desiredReplicas}
          指标数量: ${metricsCount}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createEditAction('HPA'),
      createDeleteAction('HPA'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 HPA 名称',
    },
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 HPA 名称',
              rules: [
                { required: true, message: '请输入 HPA 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
          ],
        },
        {
          title: '扩缩容目标',
          fields: [
            {
              field: 'spec.scaleTargetRef.kind',
              label: '资源类型',
              type: 'select',
              required: true,
              options: [
                { label: 'Deployment', value: 'Deployment' },
                { label: 'StatefulSet', value: 'StatefulSet' },
                { label: 'ReplicaSet', value: 'ReplicaSet' },
              ],
              rules: [{ required: true, message: '请选择资源类型' }],
            },
            {
              field: 'spec.scaleTargetRef.name',
              label: '资源名称',
              type: 'input',
              required: true,
              placeholder: '请输入目标资源名称',
              rules: [{ required: true, message: '请输入资源名称' }],
            },
          ],
        },
        {
          title: '副本数设置',
          fields: [
            {
              field: 'spec.minReplicas',
              label: '最小副本数',
              type: 'number',
              min: 1,
              defaultValue: 1,
              help: '最小保持的副本数量',
            },
            {
              field: 'spec.maxReplicas',
              label: '最大副本数',
              type: 'number',
              required: true,
              min: 1,
              rules: [
                { required: true, message: '请输入最大副本数' },
                { type: 'number', min: 1, message: '最小值为 1' },
              ],
              help: '最大扩展的副本数量',
            },
          ],
        },
        {
          title: '目标指标',
          fields: [
            {
              field: 'spec.targetCPUUtilizationPercentage',
              label: 'CPU 目标使用率 (%)',
              type: 'number',
              min: 1,
              max: 100,
              help: 'CPU 使用率达到此值时触发扩缩容',
            },
          ],
          collapsible: true,
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'autoscaling/v2',
        kind: 'HorizontalPodAutoscaler',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          scaleTargetRef: {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            name: '',
          },
          minReplicas: 1,
          maxReplicas: 10,
          targetCPUUtilizationPercentage: 80,
        },
      },
    },
    enableCreate: true,
  };
}

/**
 * PriorityClass 资源配置
 */
export function createPriorityClassConfig(): ResourceListConfig<PriorityClass> {
  return {
    resourceType: 'priorityclass',
    resourceLabel: 'PriorityClass',
    fetchData: async (params) => {
      const result = getMockPriorityClassList({
        clusterId: params.clusterId || 'cluster-prod-01',
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'PriorityClass 名称', minWidth: 200 },
      {
        field: 'value',
        title: '优先级值',
        width: 120,
      },
      {
        field: 'globalDefault',
        title: '全局默认',
        width: 120,
        slots: { default: 'default-slot' },
      },
      {
        field: 'preemptionPolicy',
        title: '抢占策略',
        width: 180,
      },
      {
        field: 'description',
        title: '描述',
        minWidth: 200,
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('PriorityClass', (row: PriorityClass) => {
        return `
          名称: ${row.metadata.name}
          优先级值: ${row.value}
          全局默认: ${row.globalDefault ? '是' : '否'}
          抢占策略: ${row.preemptionPolicy || 'PreemptLowerPriority'}
          描述: ${row.description || '-'}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createDeleteAction('PriorityClass'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: false,
      showSearch: true,
      searchPlaceholder: '搜索 PriorityClass 名称',
    },
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 PriorityClass 名称',
              rules: [
                { required: true, message: '请输入 PriorityClass 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'value',
              label: '优先级值',
              type: 'number',
              required: true,
              rules: [
                { required: true, message: '请输入优先级值' },
                { type: 'number', message: '必须是数字' },
              ],
              help: '整数值，数值越大优先级越高',
            },
            {
              field: 'description',
              label: '描述',
              type: 'textarea',
              placeholder: '请输入描述信息',
              help: '描述此优先级类的用途',
            },
          ],
        },
        {
          title: '策略设置',
          fields: [
            {
              field: 'globalDefault',
              label: '全局默认',
              type: 'switch',
              help: '是否作为未指定 PriorityClass 的 Pod 的默认优先级',
            },
            {
              field: 'preemptionPolicy',
              label: '抢占策略',
              type: 'select',
              options: [
                { label: 'PreemptLowerPriority（抢占低优先级）', value: 'PreemptLowerPriority' },
                { label: 'Never（不抢占）', value: 'Never' },
              ],
              help: '定义该优先级是否可以抢占其他 Pod',
            },
          ],
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'scheduling.k8s.io/v1',
        kind: 'PriorityClass',
        metadata: {
          name: '',
          labels: {},
          annotations: {},
        },
        value: 1000,
        globalDefault: false,
        preemptionPolicy: 'PreemptLowerPriority',
        description: '',
      },
    },
    enableCreate: true,
  };
}

/**
 * ReplicaSet 资源配置
 */
export function createReplicaSetConfig(): ResourceListConfig<ReplicaSet> {
  return {
    resourceType: 'replicaset',
    resourceLabel: 'ReplicaSet',
    fetchData: async (params) => {
      const result = getMockReplicaSetList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'ReplicaSet 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      { field: 'spec.replicas', title: '副本数', width: 100 },
      {
        field: 'status.readyReplicas',
        title: '就绪副本',
        width: 120,
        slots: { default: 'ready-slot' },
      },
      {
        field: 'status.availableReplicas',
        title: '可用副本',
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
      createViewAction('ReplicaSet', (row: ReplicaSet) => {
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          副本数: ${row.spec.replicas}
          就绪副本: ${row.status?.readyReplicas ?? 0}
          可用副本: ${row.status?.availableReplicas ?? 0}
          完全标记副本: ${row.status?.fullyLabeledReplicas ?? 0}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      {
        action: 'scale',
        label: '扩缩容',
        handler: (row: ReplicaSet) => {
          message.info(`扩缩容 ReplicaSet "${row.metadata.name}" (功能开发中)`);
        },
      },
      createEditAction('ReplicaSet'),
      createDeleteAction('ReplicaSet'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 ReplicaSet 名称',
    },
    formConfig: {
      groups: [
        {
          title: '基本信息',
          fields: [
            {
              field: 'metadata.name',
              label: '名称',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入 ReplicaSet 名称',
              rules: [
                { required: true, message: '请输入 ReplicaSet 名称' },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: '名称只能包含小写字母、数字和连字符',
                },
              ],
            },
            {
              field: 'metadata.namespace',
              label: '命名空间',
              type: 'input',
              required: true,
              disabled: (mode) => mode === 'edit',
              placeholder: '请输入命名空间',
              rules: [{ required: true, message: '请输入命名空间' }],
            },
            {
              field: 'spec.replicas',
              label: '副本数',
              type: 'number',
              required: true,
              min: 0,
              defaultValue: 1,
              rules: [
                { required: true, message: '请输入副本数' },
                { type: 'number', min: 0, message: '最小值为 0' },
              ],
            },
          ],
        },
        {
          title: 'Pod 选择器',
          fields: [
            {
              field: 'spec.selector.matchLabels',
              label: 'Pod 标签',
              type: 'labels',
              help: '用于选择要管理的 Pod',
            },
          ],
        },
        {
          title: '容器配置',
          fields: [
            {
              field: 'spec.template.spec.containers[0].name',
              label: '容器名称',
              type: 'input',
              required: true,
              placeholder: '请输入容器名称',
              rules: [{ required: true, message: '请输入容器名称' }],
            },
            {
              field: 'spec.template.spec.containers[0].image',
              label: '镜像',
              type: 'input',
              required: true,
              placeholder: '例如: nginx:1.21',
              rules: [{ required: true, message: '请输入镜像' }],
            },
            {
              field: 'spec.template.spec.containers[0].ports[0].containerPort',
              label: '容器端口',
              type: 'number',
              min: 1,
              max: 65535,
              placeholder: '例如: 80',
              help: '容器暴露的端口号',
            },
          ],
          collapsible: true,
        },
        {
          title: '标签',
          fields: [
            {
              field: 'metadata.labels',
              label: '标签',
              type: 'labels',
              help: '用于组织和选择资源的键值对',
            },
          ],
          collapsible: true,
        },
        {
          title: '注解',
          fields: [
            {
              field: 'metadata.annotations',
              label: '注解',
              type: 'labels',
              help: '用于附加任意元数据',
            },
          ],
          collapsible: true,
          defaultCollapsed: true,
        },
      ],
      createInitialValues: {
        apiVersion: 'apps/v1',
        kind: 'ReplicaSet',
        metadata: {
          name: '',
          namespace: '',
          labels: {},
          annotations: {},
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {},
          },
          template: {
            metadata: {
              labels: {},
            },
            spec: {
              containers: [
                {
                  name: '',
                  image: '',
                  ports: [
                    {
                      containerPort: 80,
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
    enableCreate: true,
  };
}

/**
 * Endpoints 资源配置
 */
export function createEndpointsConfig(): ResourceListConfig<Endpoints> {
  return {
    resourceType: 'endpoints',
    resourceLabel: 'Endpoints',
    fetchData: async (params) => {
      const result = getMockEndpointsList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'Endpoints 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'subsets',
        title: '地址数量',
        width: 120,
        formatter: ({ cellValue }: any) => {
          if (!cellValue || cellValue.length === 0) return 0;
          return cellValue.reduce((sum: number, subset: any) =>
            sum + (subset.addresses?.length || 0), 0);
        },
      },
      {
        field: 'subsets',
        title: '端口数量',
        width: 120,
        formatter: ({ cellValue }: any) => {
          if (!cellValue || cellValue.length === 0) return 0;
          return cellValue[0]?.ports?.length || 0;
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
      createViewAction('Endpoints', (row: Endpoints) => {
        const addressCount = row.subsets?.reduce((sum, subset) =>
          sum + (subset.addresses?.length || 0), 0) || 0;
        const portCount = row.subsets?.[0]?.ports?.length || 0;

        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          地址数量: ${addressCount}
          端口数量: ${portCount}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createDeleteAction('Endpoints'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 Endpoints 名称',
    },
  };
}

/**
 * EndpointSlice 资源配置
 */
export function createEndpointSliceConfig(): ResourceListConfig<EndpointSlice> {
  return {
    resourceType: 'endpointslice',
    resourceLabel: 'EndpointSlice',
    fetchData: async (params) => {
      const result = getMockEndpointSliceList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'EndpointSlice 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'addressType',
        title: '地址类型',
        width: 120,
      },
      {
        field: 'endpoints',
        title: '端点数量',
        width: 120,
        formatter: ({ cellValue }: any) => {
          return cellValue?.length || 0;
        },
      },
      {
        field: 'ports',
        title: '端口数量',
        width: 120,
        formatter: ({ cellValue }: any) => {
          return cellValue?.length || 0;
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
      createViewAction('EndpointSlice', (row: EndpointSlice) => {
        const endpointCount = row.endpoints?.length || 0;
        const portCount = row.ports?.length || 0;
        const readyCount = row.endpoints?.filter(ep => ep.conditions?.ready).length || 0;

        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          地址类型: ${row.addressType}
          端点数量: ${endpointCount}
          就绪端点: ${readyCount}
          端口数量: ${portCount}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createDeleteAction('EndpointSlice'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 EndpointSlice 名称',
    },
  };
}

// ==================== 网络资源配置 ====================

/**
 * Ingress 资源配置
 */
export function createIngressConfig(): ResourceListConfig<Ingress> {
  return {
    resourceType: 'ingress',
    resourceLabel: 'Ingress',
    fetchData: async (params) => {
      const result = getMockIngressList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        ingressClass: params.ingressClass,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'Ingress 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      {
        field: 'spec.ingressClassName',
        title: 'Ingress Class',
        width: 150,
      },
      {
        field: 'spec.rules',
        title: '主机/域名',
        minWidth: 200,
        slots: { default: 'hosts-slot' },
      },
      {
        field: 'spec.tls',
        title: 'TLS',
        width: 80,
        slots: { default: 'tls-slot' },
      },
      {
        field: 'status.loadBalancer',
        title: 'LoadBalancer',
        minWidth: 180,
        slots: { default: 'lb-slot' },
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('Ingress', (row: Ingress) => {
        const hosts = row.spec.rules?.map(r => r.host).filter(Boolean).join(', ') || '-';
        const hasTLS = row.spec.tls && row.spec.tls.length > 0;
        const tlsHosts = hasTLS ? row.spec.tls![0].hosts.join(', ') : '-';
        const ruleCount = row.spec.rules?.length || 0;
        const pathCount = row.spec.rules?.reduce((sum, rule) => sum + (rule.http?.paths.length || 0), 0) || 0;
        const lbIP = row.status?.loadBalancer?.ingress?.[0]?.ip ||
                     row.status?.loadBalancer?.ingress?.[0]?.hostname || '-';

        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          Ingress Class: ${row.spec.ingressClassName || '-'}
          主机/域名: ${hosts}
          规则数量: ${ruleCount}
          路径数量: ${pathCount}
          TLS: ${hasTLS ? '已配置' : '未配置'}
          TLS 域名: ${tlsHosts}
          LoadBalancer: ${lbIP}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createDeleteAction('Ingress'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 Ingress 名称',
      customFilters: [
        {
          field: 'ingressClass',
          label: 'Ingress Class',
          type: 'select',
          options: [
            { label: '全部', value: '' },
            { label: 'nginx', value: 'nginx' },
            { label: 'traefik', value: 'traefik' },
            { label: 'kong', value: 'kong' },
            { label: 'haproxy', value: 'haproxy' },
          ],
        },
      ],
    },
  };
}
