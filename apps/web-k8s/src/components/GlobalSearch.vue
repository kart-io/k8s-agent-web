<script lang="ts" setup>
/**
 * 全局搜索组件
 * 支持跨资源类型搜索，包括名称、标签、注解等
 */
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { SearchOutlined } from '@ant-design/icons-vue';
import { AutoComplete, Input, Tag } from 'ant-design-vue';

import {
  configMapApi,
  deploymentApi,
  namespaceApi,
  nodeApi,
  podApi,
  secretApi,
  serviceApi,
} from '#/api/k8s';

const router = useRouter();

const searchText = ref('');
const searching = ref(false);
const searchResults = ref<any[]>([]);

interface SearchResultItem {
  type: string;
  name: string;
  namespace?: string;
  labels?: Record<string, string>;
  route: string;
  description?: string;
}

/**
 * 执行搜索
 */
async function performSearch(keyword: string) {
  if (!keyword || keyword.length < 2) {
    searchResults.value = [];
    return;
  }

  searching.value = true;
  try {
    const clusterId = 'cluster-production-01';
    const results: SearchResultItem[] = [];

    // 并行搜索所有资源类型 - 调用真实 API
    const [
      pods,
      deployments,
      services,
      nodes,
      namespaces,
      configmaps,
      secrets,
    ] = await Promise.all([
      podApi.list({ clusterId, pageSize: 100 }).catch(() => ({ items: [] })),
      deploymentApi
        .list({ clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
      serviceApi
        .list({ clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
      nodeApi.list(clusterId).catch(() => ({ items: [] })),
      namespaceApi.list(clusterId).catch(() => ({ items: [] })),
      configMapApi
        .list({ clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
      secretApi.list({ clusterId, pageSize: 100 }).catch(() => ({ items: [] })),
    ]);

    const lowerKeyword = keyword.toLowerCase();

    // 搜索 Pods
    pods.items.forEach((pod: any) => {
      if (matchResource(pod, lowerKeyword)) {
        results.push({
          type: 'Pod',
          name: pod.metadata.name,
          namespace: pod.metadata.namespace,
          labels: pod.metadata.labels,
          route: '/k8s/pods',
          description: `状态: ${pod.status || 'Unknown'}`,
        });
      }
    });

    // 搜索 Deployments
    deployments.items.forEach((deployment: any) => {
      if (matchResource(deployment, lowerKeyword)) {
        results.push({
          type: 'Deployment',
          name: deployment.metadata.name,
          namespace: deployment.metadata.namespace,
          labels: deployment.metadata.labels,
          route: '/k8s/deployments',
          description: `副本: ${deployment.spec?.replicas || 0}`,
        });
      }
    });

    // 搜索 Services
    services.items.forEach((service: any) => {
      if (matchResource(service, lowerKeyword)) {
        results.push({
          type: 'Service',
          name: service.metadata.name,
          namespace: service.metadata.namespace,
          labels: service.metadata.labels,
          route: '/k8s/services',
          description: `类型: ${service.spec?.type || 'ClusterIP'}`,
        });
      }
    });

    // 搜索 Nodes
    nodes.items.forEach((node: any) => {
      if (matchResource(node, lowerKeyword)) {
        results.push({
          type: 'Node',
          name: node.metadata.name,
          labels: node.metadata.labels,
          route: '/k8s/nodes',
          description: `状态: ${node.status || 'Unknown'}`,
        });
      }
    });

    // 搜索 Namespaces
    namespaces.items.forEach((ns: any) => {
      if (matchResource(ns, lowerKeyword)) {
        results.push({
          type: 'Namespace',
          name: ns.metadata.name,
          labels: ns.metadata.labels,
          route: '/k8s/namespaces',
          description: `状态: ${ns.status?.phase || 'Active'}`,
        });
      }
    });

    // 搜索 ConfigMaps
    configmaps.items.forEach((cm: any) => {
      if (matchResource(cm, lowerKeyword)) {
        results.push({
          type: 'ConfigMap',
          name: cm.metadata.name,
          namespace: cm.metadata.namespace,
          labels: cm.metadata.labels,
          route: '/k8s/configmaps',
          description: `键数量: ${cm.data ? Object.keys(cm.data).length : 0}`,
        });
      }
    });

    // 搜索 Secrets
    secrets.items.forEach((secret: any) => {
      if (matchResource(secret, lowerKeyword)) {
        results.push({
          type: 'Secret',
          name: secret.metadata.name,
          namespace: secret.metadata.namespace,
          labels: secret.metadata.labels,
          route: '/k8s/secrets',
          description: `类型: ${secret.type || 'Opaque'}`,
        });
      }
    });

    // 限制结果数量
    searchResults.value = results.slice(0, 50);
  } catch (error: any) {
    console.error('搜索失败:', error);
  } finally {
    searching.value = false;
  }
}

/**
 * 匹配资源
 */
function matchResource(resource: any, keyword: string): boolean {
  const metadata = resource.metadata;
  if (!metadata) return false;

  // 匹配名称
  if (metadata.name?.toLowerCase().includes(keyword)) return true;

  // 匹配命名空间
  if (metadata.namespace?.toLowerCase().includes(keyword)) return true;

  // 匹配标签
  if (metadata.labels) {
    for (const [key, value] of Object.entries(metadata.labels)) {
      if (
        key.toLowerCase().includes(keyword) ||
        (value as string).toLowerCase().includes(keyword)
      ) {
        return true;
      }
    }
  }

  // 匹配注解
  if (metadata.annotations) {
    for (const [key, value] of Object.entries(metadata.annotations)) {
      if (
        key.toLowerCase().includes(keyword) ||
        (value as string).toLowerCase().includes(keyword)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * AutoComplete 选项
 */
const options = computed(() => {
  return searchResults.value.map((item) => ({
    value: `${item.type}:${item.name}`,
    label: item.name,
    item,
  }));
});

/**
 * 监听搜索文本变化
 */
watch(searchText, (newValue) => {
  performSearch(newValue);
});

/**
 * 选择搜索结果
 */
function onSelect(value: string, option: any) {
  const item = option.item as SearchResultItem;
  // 跳转到搜索结果页面，带上搜索参数
  router.push({
    path: '/k8s/search',
    query: {
      keyword: searchText.value,
      type: item.type,
    },
  });
}

/**
 * 按下回车
 */
function onPressEnter() {
  if (searchText.value) {
    router.push({
      path: '/k8s/search',
      query: {
        keyword: searchText.value,
      },
    });
  }
}

/**
 * 获取资源类型颜色
 */
function getTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    Pod: 'blue',
    Deployment: 'orange',
    Service: 'purple',
    Node: 'green',
    Namespace: 'cyan',
    ConfigMap: 'geekblue',
    Secret: 'magenta',
  };
  return colorMap[type] || 'default';
}
</script>

<template>
  <div class="global-search">
    <AutoComplete
      v-model:value="searchText"
      :options="options"
      :dropdown-match-select-width="400"
      placeholder="搜索资源 (名称、标签、注解...)"
      style="width: 300px"
      @select="onSelect"
      @press-enter="onPressEnter"
    >
      <template #default>
        <Input
          :prefix="<SearchOutlined />"
          :loading="searching"
          allow-clear
          placeholder="搜索资源 (名称、标签、注解...)"
        />
      </template>
      <template #option="{ item }">
        <div class="search-option">
          <div class="option-header">
            <Tag :color="getTypeColor(item.type)" size="small">
              {{ item.type }}
            </Tag>
            <span class="option-name">{{ item.name }}</span>
          </div>
          <div v-if="item.namespace" class="option-namespace">
            <span class="namespace-label">命名空间:</span>
            <code class="namespace-value">{{ item.namespace }}</code>
          </div>
          <div v-if="item.description" class="option-description">
            {{ item.description }}
          </div>
        </div>
      </template>
    </AutoComplete>
  </div>
</template>

<style scoped>
.global-search {
  display: flex;
  align-items: center;
}

.search-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
}

.option-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--vben-text-color);
}

.option-namespace {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-left: 4px;
}

.namespace-label {
  font-size: 11px;
  color: var(--vben-text-color-secondary);
}

.namespace-value {
  padding: 1px 4px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 11px;
  color: var(--vben-text-color-secondary);
  background-color: rgb(0 0 0 / 3%);
  border-radius: 2px;
}

html[data-theme='dark'] .namespace-value {
  background-color: rgb(255 255 255 / 5%);
}

.option-description {
  margin-left: 4px;
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}
</style>
