/**
 * K8s 资源 API 工厂函数
 * 用于生成标准的 CRUD API 接口，减少重复代码
 */

import type { requestClient } from '../request';

/**
 * 资源 API 配置
 */
export interface ResourceApiConfig {
  /** 资源类型（单数形式，如 'pod', 'service'） */
  resourceType: string;
  /** 资源类型复数形式（如 'pods', 'services'），默认为 resourceType + 's' */
  resourceTypePlural?: string;
  /** 是否需要命名空间（默认为 true） */
  namespaced?: boolean;
  /** 自定义列表端点 */
  listEndpoint?: string;
  /** 自定义详情端点 */
  detailEndpoint?: string;
  /** 自定义创建端点 */
  createEndpoint?: string;
  /** 自定义更新端点 */
  updateEndpoint?: string;
  /** 自定义删除端点 */
  deleteEndpoint?: string;
}

/**
 * 资源列表参数
 */
export interface ResourceListParams {
  clusterId: string;
  namespace?: string;
  labelSelector?: string;
  fieldSelector?: string;
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

/**
 * 资源 API 接口
 */
export interface ResourceApi<T> {
  list: (params: ResourceListParams) => Promise<any>;
  detail: (
    clusterId: string,
    namespace: string | undefined,
    name: string,
  ) => Promise<T>;
  create: (
    clusterId: string,
    namespace: string | undefined,
    data: T,
  ) => Promise<T>;
  update: (
    clusterId: string,
    namespace: string | undefined,
    name: string,
    data: T,
  ) => Promise<T>;
  delete: (
    clusterId: string,
    namespace: string | undefined,
    name: string,
  ) => Promise<void>;
}

/**
 * 创建标准的资源 API
 * @param client HTTP 请求客户端
 * @param config 资源配置
 * @returns 资源 API 对象
 *
 * @example
 * // 创建命名空间级别资源 API
 * const podApi = createResourceApi(requestClient, {
 *   resourceType: 'pod',
 *   namespaced: true,
 * });
 *
 * // 创建集群级别资源 API
 * const nodeApi = createResourceApi(requestClient, {
 *   resourceType: 'node',
 *   namespaced: false,
 * });
 */
export function createResourceApi<T>(
  client: typeof requestClient,
  config: ResourceApiConfig,
): ResourceApi<T> {
  const {
    resourceType,
    resourceTypePlural = `${resourceType}s`,
    namespaced = true,
    listEndpoint,
    detailEndpoint,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
  } = config;

  /**
   * 构建资源路径
   */
  function buildResourcePath(
    clusterId: string,
    namespace?: string,
    name?: string,
  ): string {
    let path = `/k8s/clusters/${clusterId}`;

    // 如果是命名空间级别资源且提供了命名空间
    if (namespaced && namespace) {
      path += `/namespaces/${namespace}`;
    }

    path += `/${resourceTypePlural}`;

    // 如果提供了资源名称
    if (name) {
      path += `/${name}`;
    }

    return path;
  }

  return {
    /**
     * 获取资源列表
     */
    list: async (params: ResourceListParams) => {
      const endpoint = listEndpoint || `/k8s/${resourceTypePlural}`;
      return client.get(endpoint, { params });
    },

    /**
     * 获取资源详情
     */
    detail: async (
      clusterId: string,
      namespace: string | undefined,
      name: string,
    ) => {
      const endpoint =
        detailEndpoint || buildResourcePath(clusterId, namespace, name);
      return client.get(endpoint);
    },

    /**
     * 创建资源
     */
    create: async (
      clusterId: string,
      namespace: string | undefined,
      data: T,
    ) => {
      const endpoint =
        createEndpoint || buildResourcePath(clusterId, namespace);
      return client.post(endpoint, data);
    },

    /**
     * 更新资源
     */
    update: async (
      clusterId: string,
      namespace: string | undefined,
      name: string,
      data: T,
    ) => {
      const endpoint =
        updateEndpoint || buildResourcePath(clusterId, namespace, name);
      return client.put(endpoint, data);
    },

    /**
     * 删除资源
     */
    delete: async (
      clusterId: string,
      namespace: string | undefined,
      name: string,
    ) => {
      const endpoint =
        deleteEndpoint || buildResourcePath(clusterId, namespace, name);
      return client.delete(endpoint);
    },
  };
}

/**
 * 创建带有额外操作的资源 API
 * @param client HTTP 请求客户端
 * @param config 资源配置
 * @param extraOperations 额外的操作函数
 * @returns 扩展的资源 API 对象
 *
 * @example
 * const deploymentApi = createResourceApiWithExtras(requestClient, {
 *   resourceType: 'deployment',
 * }, {
 *   scale: (clusterId, namespace, name, replicas) => {
 *     return requestClient.post(
 *       `/k8s/clusters/${clusterId}/namespaces/${namespace}/deployments/${name}/scale`,
 *       { replicas }
 *     );
 *   },
 * });
 */
export function createResourceApiWithExtras<T, E extends Record<string, any>>(
  client: typeof requestClient,
  config: ResourceApiConfig,
  extraOperations: E,
): E & ResourceApi<T> {
  const baseApi = createResourceApi<T>(client, config);
  return {
    ...baseApi,
    ...extraOperations,
  };
}
