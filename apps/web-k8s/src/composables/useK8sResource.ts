/**
 * K8s 资源管理通用 Composable
 * 处理资源列表的数据获取、筛选、搜索、分页等通用逻辑
 */

import type {
  ResourceFilterConfig,
  ResourceListParams,
  ResourceListResult,
} from '#/types/k8s-resource-base';

import { onBeforeUnmount, ref, watch } from 'vue';

import { useDebounceFn } from '@vueuse/core';

import { useClusterOptions } from '#/stores/clusterStore';
import { useNamespaceOptions } from '#/stores/namespaceStore';

export interface UseK8sResourceOptions {
  /** 数据获取函数 */
  fetchData: (params: ResourceListParams) => Promise<ResourceListResult>;
  /** 筛选器配置 */
  filters?: ResourceFilterConfig;
  /** 防抖延迟（毫秒） */
  debounceDelay?: number;
  /** 模拟延迟（毫秒），开发环境可用，生产环境自动设为 0 */
  mockDelay?: number;
}

export function useK8sResource(options: UseK8sResourceOptions) {
  const { fetchData, filters = {}, debounceDelay = 300, mockDelay } = options;

  // 使用全局集群状态
  const { clusterOptions, selectedClusterId } = useClusterOptions();

  // 使用全局 namespace 状态
  const { namespaceOptions, selectedNamespace } = useNamespaceOptions();

  // 根据环境自动设置模拟延迟
  const effectiveMockDelay = import.meta.env.DEV ? (mockDelay ?? 100) : 0;

  const {
    showClusterSelector = true,
    showNamespaceSelector = true,
    showSearch = true,
    searchPlaceholder = '搜索资源名称',
    customFilters = [],
  } = filters;

  // 筛选器状态
  const searchKeyword = ref('');
  const customFilterValues = ref<Record<string, any>>({});

  // 加载状态
  const loading = ref(false);

  // AbortController 用于取消请求
  let abortController: AbortController | null = null;

  /**
   * 组件卸载时清理资源
   */
  onBeforeUnmount(() => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  });

  /**
   * 获取资源数据
   */
  async function fetchResourceData(params: {
    page: { currentPage: number; pageSize: number };
  }): Promise<ResourceListResult> {
    // 如果需要集群选择器但没有选中集群,返回空结果
    if (showClusterSelector && !selectedClusterId.value) {
      return { items: [], total: 0 };
    }

    // 取消之前的请求
    if (abortController) {
      abortController.abort();
    }

    // 创建新的 AbortController
    abortController = new AbortController();

    try {
      loading.value = true;

      // 模拟 API 延迟（仅在配置了延迟时才执行）
      if (effectiveMockDelay > 0) {
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(resolve, effectiveMockDelay);
          if (abortController) {
            abortController.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              reject(new Error('Request aborted'));
            });
          }
        });
      }

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
      abortController = null; // 请求完成后清理引用
    }
  }

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
    selectedNamespace.value = '';
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

  /**
   * 监听集群切换，自动刷新数据
   */
  watch(selectedClusterId, (newId) => {
    if (newId) {
      reload();
    }
  });

  /**
   * 监听 namespace 切换，自动刷新数据
   */
  watch(selectedNamespace, () => {
    reload();
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
