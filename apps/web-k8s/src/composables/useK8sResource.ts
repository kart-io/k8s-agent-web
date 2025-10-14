/**
 * K8s 资源管理通用 Composable
 * 处理资源列表的数据获取、筛选、搜索、分页等通用逻辑
 */

import type {
  ResourceFilterConfig,
  ResourceListParams,
  ResourceListResult,
} from '#/types/k8s-resource-base';

import { ref, watch } from 'vue';

import { useDebounceFn } from '@vueuse/core';

export interface UseK8sResourceOptions {
  /** 数据获取函数 */
  fetchData: (params: ResourceListParams) => Promise<ResourceListResult>;
  /** 筛选器配置 */
  filters?: ResourceFilterConfig;
  /** 默认集群 ID */
  defaultClusterId?: string;
  /** 防抖延迟（毫秒） */
  debounceDelay?: number;
}

export function useK8sResource(options: UseK8sResourceOptions) {
  const {
    fetchData,
    filters = {},
    defaultClusterId = 'cluster-prod-01',
    debounceDelay = 300,
  } = options;

  const {
    showClusterSelector = true,
    showNamespaceSelector = true,
    showSearch = true,
    searchPlaceholder = '搜索资源名称',
    customFilters = [],
  } = filters;

  // 筛选器状态
  const selectedClusterId = ref(defaultClusterId);
  const selectedNamespace = ref<string>();
  const searchKeyword = ref('');
  const customFilterValues = ref<Record<string, any>>({});

  // 加载状态
  const loading = ref(false);

  // AbortController 用于取消请求
  let abortController: AbortController | null = null;

  /**
   * 获取资源数据
   */
  async function fetchResourceData(params: {
    page: { currentPage: number; pageSize: number };
  }): Promise<ResourceListResult> {
    // 取消之前的请求
    if (abortController) {
      abortController.abort();
    }

    // 创建新的 AbortController
    abortController = new AbortController();

    try {
      loading.value = true;

      // 模拟 API 延迟
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, 100);
        abortController!.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Request aborted'));
        });
      });

      const requestParams: ResourceListParams = {
        clusterId: selectedClusterId.value,
        namespace: selectedNamespace.value,
        page: params.page.currentPage,
        pageSize: params.page.pageSize,
        keyword: searchKeyword.value,
        ...customFilterValues.value,
      };

      const result = await fetchData(requestParams);

      return {
        items: result.items,
        total: result.total,
        metadata: result.metadata,
      };
    } catch (error: any) {
      // 如果是取消请求，返回空结果
      if (error.message === 'Request aborted') {
        return { items: [], total: 0 };
      }
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 集群选项
   */
  const clusterOptions = [
    { label: 'Production Cluster', value: 'cluster-prod-01' },
    { label: 'Staging Cluster', value: 'cluster-staging-01' },
    { label: 'Development Cluster', value: 'cluster-dev-01' },
  ];

  /**
   * 命名空间选项
   */
  const namespaceOptions = [
    { label: '全部命名空间', value: undefined },
    { label: 'default', value: 'default' },
    { label: 'kube-system', value: 'kube-system' },
    { label: 'production', value: 'production' },
    { label: 'staging', value: 'staging' },
  ];

  /**
   * 重新加载回调（由外部 Grid 提供）
   */
  let reloadCallback: (() => void) | null = null;

  /**
   * 设置重新加载回调
   */
  function setReloadCallback(callback: () => void) {
    reloadCallback = callback;
  }

  /**
   * 重新加载数据
   */
  function reload() {
    if (reloadCallback) {
      reloadCallback();
    }
  }

  /**
   * 搜索处理
   */
  function handleSearch() {
    reload();
  }

  /**
   * 重置筛选器
   */
  function handleReset() {
    searchKeyword.value = '';
    selectedNamespace.value = undefined;
    customFilterValues.value = {};
    reload();
  }

  /**
   * 防抖搜索
   */
  const debouncedSearch = useDebounceFn(() => {
    reload();
  }, debounceDelay);

  /**
   * 监听关键词变化，自动触发防抖搜索
   */
  watch(searchKeyword, () => {
    debouncedSearch();
  });

  return {
    // 状态
    selectedClusterId,
    selectedNamespace,
    searchKeyword,
    customFilterValues,
    loading,

    // 选项
    clusterOptions,
    namespaceOptions,

    // 配置
    showClusterSelector,
    showNamespaceSelector,
    showSearch,
    searchPlaceholder,
    customFilters,

    // 方法
    fetchResourceData,
    setReloadCallback,
    reload,
    handleSearch,
    handleReset,
  };
}
