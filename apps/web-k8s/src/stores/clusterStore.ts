import { ref } from 'vue';

import { message } from 'ant-design-vue';

import { clusterApi } from '#/api/k8s';

/**
 * 集群选项的全局状态管理
 * 使用单例模式确保全局只有一个实例
 */
class ClusterStore {
  clusterOptions = ref<Array<{ label: string; value: string }>>([]);
  loading = ref(false);
  selectedClusterId = ref('');
  private initialized = false;

  /**
   * 初始化（仅在首次调用时加载）
   */
  async init() {
    if (!this.initialized) {
      await this.loadClusterOptions();
    }
  }

  /**
   * 加载集群选项
   */
  async loadClusterOptions() {
    this.loading.value = true;
    try {
      const options = await clusterApi.options();
      this.clusterOptions.value = options;

      // 设置第一个集群为默认选中（仅在未选中任何集群时）
      if (options.length > 0 && !this.selectedClusterId.value) {
        this.selectedClusterId.value = options[0].value;
      }

      // 如果当前选中的集群已被删除，重置为第一个
      if (
        this.selectedClusterId.value &&
        !options.find((opt) => opt.value === this.selectedClusterId.value)
      ) {
        this.selectedClusterId.value =
          options.length > 0 ? options[0].value : '';
      }

      this.initialized = true;
    } catch (error: any) {
      console.error('获取集群列表失败:', error);
      message.error(`获取集群列表失败: ${error.message || '未知错误'}`);
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * 刷新集群选项（用于集群管理页面添加/删除集群后）
   */
  async refresh() {
    await this.loadClusterOptions();
  }

  /**
   * 设置选中的集群
   */
  setSelectedCluster(clusterId: string) {
    this.selectedClusterId.value = clusterId;
  }
}

// 创建单例实例
const clusterStore = new ClusterStore();

/**
 * 使用集群选项的 composable
 */
export function useClusterOptions() {
  return {
    clusterOptions: clusterStore.clusterOptions,
    selectedClusterId: clusterStore.selectedClusterId,
    loading: clusterStore.loading,
    loadClusterOptions: () => clusterStore.loadClusterOptions(),
    refresh: () => clusterStore.refresh(),
    init: () => clusterStore.init(),
    setSelectedCluster: (id: string) => clusterStore.setSelectedCluster(id),
  };
}

/**
 * 导出 store 实例供直接使用
 */
export { clusterStore };
