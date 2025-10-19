import { ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { namespaceApi } from '#/api/k8s';

import { clusterStore } from './clusterStore';

/**
 * Namespace 选项的全局状态管理
 * 使用单例模式确保全局只有一个实例
 */
class NamespaceStore {
  loading = ref(false);
  namespaceOptions = ref<Array<{ label: string; value: string }>>([]);
  selectedNamespace = ref<string | undefined>(undefined);
  private currentClusterId = '';

  constructor() {
    // 监听集群切换，自动加载对应的 namespace 列表
    watch(
      clusterStore.selectedClusterId,
      async (newClusterId) => {
        if (newClusterId && newClusterId !== this.currentClusterId) {
          this.currentClusterId = newClusterId;
          await this.loadNamespaceOptions(newClusterId);
        }
      },
      { immediate: true }, // 立即执行一次，如果集群已经选中
    );
  }

  /**
   * 加载 namespace 选项
   */
  async loadNamespaceOptions(clusterId: string) {
    if (!clusterId) {
      this.namespaceOptions.value = [];
      this.selectedNamespace.value = undefined;
      return;
    }

    this.loading.value = true;
    try {
      const options = await namespaceApi.options(clusterId);

      // 添加"全部命名空间"选项
      this.namespaceOptions.value = [
        { label: '全部命名空间', value: '' },
        ...options,
      ];

      // 设置默认选中"全部命名空间"
      if (!this.selectedNamespace.value) {
        this.selectedNamespace.value = '';
      }

      // 如果当前选中的 namespace 不在新列表中，重置为"全部"
      if (
        this.selectedNamespace.value &&
        !options.find((opt) => opt.value === this.selectedNamespace.value)
      ) {
        this.selectedNamespace.value = '';
      }
    } catch (error: any) {
      console.error('获取命名空间列表失败:', error);
      message.error(`获取命名空间列表失败: ${error.message || '未知错误'}`);
      this.namespaceOptions.value = [{ label: '全部命名空间', value: '' }];
      this.selectedNamespace.value = '';
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * 刷新 namespace 选项
   */
  async refresh() {
    if (this.currentClusterId) {
      await this.loadNamespaceOptions(this.currentClusterId);
    }
  }

  /**
   * 设置选中的 namespace
   */
  setSelectedNamespace(namespace: string | undefined) {
    this.selectedNamespace.value = namespace;
  }
}

// 创建单例实例
const namespaceStore = new NamespaceStore();

/**
 * 使用 namespace 选项的 composable
 */
export function useNamespaceOptions() {
  return {
    namespaceOptions: namespaceStore.namespaceOptions,
    selectedNamespace: namespaceStore.selectedNamespace,
    loading: namespaceStore.loading,
    loadNamespaceOptions: (clusterId: string) =>
      namespaceStore.loadNamespaceOptions(clusterId),
    refresh: () => namespaceStore.refresh(),
    setSelectedNamespace: (namespace: string | undefined) =>
      namespaceStore.setSelectedNamespace(namespace),
  };
}

/**
 * 导出 store 实例供直接使用
 */
export { namespaceStore };
