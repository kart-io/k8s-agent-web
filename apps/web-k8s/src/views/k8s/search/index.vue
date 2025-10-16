<script lang="ts" setup>
/**
 * 全局搜索结果页面
 * 展示跨资源类型的搜索结果
 */
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Input,
  List,
  Row,
  Space,
  Spin,
  Tag,
} from 'ant-design-vue';
import { RightOutlined, SearchOutlined } from '@ant-design/icons-vue';

import {
  getMockConfigMapList,
  getMockDeploymentList,
  getMockNamespaceList,
  getMockNodeList,
  getMockPodList,
  getMockSecretList,
  getMockServiceList,
} from '#/api/k8s/mock';

const route = useRoute();
const router = useRouter();

const searchKeyword = ref('');
const searching = ref(false);
const searchResults = ref<any[]>([]);

// 资源类型过滤
const resourceTypes = [
  { label: 'Pod', value: 'Pod', count: 0 },
  { label: 'Deployment', value: 'Deployment', count: 0 },
  { label: 'Service', value: 'Service', count: 0 },
  { label: 'Node', value: 'Node', count: 0 },
  { label: 'Namespace', value: 'Namespace', count: 0 },
  { label: 'ConfigMap', value: 'ConfigMap', count: 0 },
  { label: 'Secret', value: 'Secret', count: 0 },
];

const selectedTypes = ref<string[]>([]);

interface SearchResult {
  type: string;
  name: string;
  namespace?: string;
  labels?: Record<string, string>;
  route: string;
  description?: string;
  matchedFields: string[];
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
    const results: SearchResult[] = [];

    // 并行搜索所有资源类型
    const [pods, deployments, services, nodes, namespaces, configmaps, secrets] =
      await Promise.all([
        Promise.resolve(getMockPodList({ clusterId, pageSize: 100 })),
        Promise.resolve(getMockDeploymentList({ clusterId, pageSize: 100 })),
        Promise.resolve(getMockServiceList({ clusterId, pageSize: 100 })),
        Promise.resolve(getMockNodeList({ clusterId, pageSize: 100 })),
        Promise.resolve(getMockNamespaceList({ clusterId, pageSize: 100 })),
        Promise.resolve(getMockConfigMapList({ clusterId, pageSize: 100 })),
        Promise.resolve(getMockSecretList({ clusterId, pageSize: 100 })),
      ]);

    const lowerKeyword = keyword.toLowerCase();

    // 搜索各类资源
    searchInResources(pods.items, 'Pod', '/k8s/pods', lowerKeyword, results);
    searchInResources(
      deployments.items,
      'Deployment',
      '/k8s/deployments',
      lowerKeyword,
      results,
    );
    searchInResources(services.items, 'Service', '/k8s/services', lowerKeyword, results);
    searchInResources(nodes.items, 'Node', '/k8s/nodes', lowerKeyword, results);
    searchInResources(
      namespaces.items,
      'Namespace',
      '/k8s/namespaces',
      lowerKeyword,
      results,
    );
    searchInResources(
      configmaps.items,
      'ConfigMap',
      '/k8s/configmaps',
      lowerKeyword,
      results,
    );
    searchInResources(secrets.items, 'Secret', '/k8s/secrets', lowerKeyword, results);

    searchResults.value = results;

    // 更新资源类型计数
    updateTypeCounts();
  } catch (error: any) {
    console.error('搜索失败:', error);
  } finally {
    searching.value = false;
  }
}

/**
 * 在资源列表中搜索
 */
function searchInResources(
  items: any[],
  type: string,
  route: string,
  keyword: string,
  results: SearchResult[],
) {
  items.forEach((item: any) => {
    const matchResult = matchResource(item, keyword);
    if (matchResult.matched) {
      results.push({
        type,
        name: item.metadata.name,
        namespace: item.metadata.namespace,
        labels: item.metadata.labels,
        route,
        description: getResourceDescription(item, type),
        matchedFields: matchResult.matchedFields,
      });
    }
  });
}

/**
 * 匹配资源
 */
function matchResource(
  resource: any,
  keyword: string,
): { matched: boolean; matchedFields: string[] } {
  const metadata = resource.metadata;
  if (!metadata) return { matched: false, matchedFields: [] };

  const matchedFields: string[] = [];

  // 匹配名称
  if (metadata.name?.toLowerCase().includes(keyword)) {
    matchedFields.push(`名称: ${metadata.name}`);
  }

  // 匹配命名空间
  if (metadata.namespace?.toLowerCase().includes(keyword)) {
    matchedFields.push(`命名空间: ${metadata.namespace}`);
  }

  // 匹配标签
  if (metadata.labels) {
    for (const [key, value] of Object.entries(metadata.labels)) {
      if (
        key.toLowerCase().includes(keyword) ||
        (value as string).toLowerCase().includes(keyword)
      ) {
        matchedFields.push(`标签: ${key}=${value}`);
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
        matchedFields.push(`注解: ${key}`);
      }
    }
  }

  return {
    matched: matchedFields.length > 0,
    matchedFields: matchedFields.slice(0, 3), // 最多显示 3 个匹配字段
  };
}

/**
 * 获取资源描述
 */
function getResourceDescription(resource: any, type: string): string {
  switch (type) {
    case 'Pod':
      return `状态: ${resource.status || 'Unknown'}`;
    case 'Deployment':
      return `副本: ${resource.spec?.replicas || 0}`;
    case 'Service':
      return `类型: ${resource.spec?.type || 'ClusterIP'}`;
    case 'Node':
      return `状态: ${resource.status || 'Unknown'}`;
    case 'Namespace':
      return `状态: ${resource.status?.phase || 'Active'}`;
    case 'ConfigMap':
      return `键数量: ${resource.data ? Object.keys(resource.data).length : 0}`;
    case 'Secret':
      return `类型: ${resource.type || 'Opaque'}`;
    default:
      return '';
  }
}

/**
 * 更新资源类型计数
 */
function updateTypeCounts() {
  resourceTypes.forEach((type) => {
    type.count = searchResults.value.filter((r) => r.type === type.value).length;
  });
}

/**
 * 过滤后的结果
 */
const filteredResults = computed(() => {
  if (selectedTypes.value.length === 0) {
    return searchResults.value;
  }
  return searchResults.value.filter((r) => selectedTypes.value.includes(r.type));
});

/**
 * 结果总数
 */
const totalCount = computed(() => searchResults.value.length);

/**
 * 跳转到资源页面
 */
function navigateToResource(result: SearchResult) {
  router.push(result.route);
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

/**
 * 执行新搜索
 */
function handleSearch() {
  if (searchKeyword.value) {
    router.push({
      path: '/k8s/search',
      query: { keyword: searchKeyword.value },
    });
  }
}

// 监听路由变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword) {
      searchKeyword.value = newKeyword as string;
      performSearch(newKeyword as string);
    }
  },
  { immediate: true },
);

// 组件挂载时加载数据
onMounted(() => {
  if (route.query.keyword) {
    searchKeyword.value = route.query.keyword as string;
    performSearch(searchKeyword.value);
  }

  if (route.query.type) {
    selectedTypes.value = [route.query.type as string];
  }
});
</script>

<template>
  <div class="search-results-page">
    <!-- 搜索框 -->
    <Card class="search-card" :bordered="false">
      <Input.Search
        v-model:value="searchKeyword"
        placeholder="搜索资源 (名称、标签、注解...)"
        size="large"
        enter-button="搜索"
        allow-clear
        @search="handleSearch"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </Input.Search>
    </Card>

    <!-- 搜索结果 -->
    <Row :gutter="[16, 16]" class="results-section">
      <!-- 左侧过滤器 -->
      <Col :xs="24" :md="6">
        <Card title="资源类型" size="small" :bordered="false">
          <Checkbox.Group v-model:value="selectedTypes" style="width: 100%">
            <Space direction="vertical" style="width: 100%">
              <Checkbox v-for="type in resourceTypes" :key="type.value" :value="type.value">
                <span class="type-label">{{ type.label }}</span>
                <Tag size="small" style="margin-left: 8px">{{ type.count }}</Tag>
              </Checkbox>
            </Space>
          </Checkbox.Group>
        </Card>
      </Col>

      <!-- 右侧结果列表 -->
      <Col :xs="24" :md="18">
        <Card :bordered="false">
          <template #title>
            <div class="results-header">
              <span>搜索结果</span>
              <Tag color="blue">共 {{ totalCount }} 条结果</Tag>
            </div>
          </template>

          <Spin :spinning="searching">
            <div v-if="filteredResults.length > 0" class="results-list">
              <List :data-source="filteredResults" :split="true">
                <template #renderItem="{ item }">
                  <List.Item class="result-item">
                    <div class="result-content">
                      <div class="result-header">
                        <Tag :color="getTypeColor(item.type)" size="small">
                          {{ item.type }}
                        </Tag>
                        <code class="result-name">{{ item.name }}</code>
                      </div>

                      <div v-if="item.namespace" class="result-namespace">
                        <span class="namespace-label">命名空间:</span>
                        <code class="namespace-value">{{ item.namespace }}</code>
                      </div>

                      <div v-if="item.description" class="result-description">
                        {{ item.description }}
                      </div>

                      <div v-if="item.matchedFields.length > 0" class="matched-fields">
                        <span class="matched-label">匹配字段:</span>
                        <Tag
                          v-for="(field, idx) in item.matchedFields"
                          :key="idx"
                          size="small"
                          color="processing"
                        >
                          {{ field }}
                        </Tag>
                      </div>
                    </div>

                    <template #actions>
                      <Button type="link" size="small" @click="navigateToResource(item)">
                        查看 <RightOutlined />
                      </Button>
                    </template>
                  </List.Item>
                </template>
              </List>
            </div>

            <Empty
              v-else-if="!searching"
              description="未找到匹配的资源"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
            />
          </Spin>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<style scoped>
.search-results-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card {
  background-color: var(--vben-background-color);
}

.results-section {
  width: 100%;
}

.type-label {
  font-size: 13px;
  color: var(--vben-text-color);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.results-list {
  min-height: 400px;
}

.result-item {
  padding: 16px 0;
  transition: background-color 0.3s ease;
}

.result-item:hover {
  background-color: rgb(0 0 0 / 2%);
}

html[data-theme='dark'] .result-item:hover {
  background-color: rgb(255 255 255 / 2%);
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-name {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 14px;
  font-weight: 500;
  color: var(--vben-text-color);
  padding: 2px 6px;
  border-radius: 3px;
  background-color: rgb(0 0 0 / 4%);
}

html[data-theme='dark'] .result-name {
  background-color: rgb(255 255 255 / 8%);
}

.result-namespace {
  display: flex;
  align-items: center;
  gap: 6px;
}

.namespace-label {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.namespace-value {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  color: var(--vben-text-color-secondary);
  padding: 1px 4px;
  border-radius: 2px;
  background-color: rgb(0 0 0 / 3%);
}

html[data-theme='dark'] .namespace-value {
  background-color: rgb(255 255 255 / 5%);
}

.result-description {
  font-size: 13px;
  color: var(--vben-text-color-secondary);
}

.matched-fields {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.matched-label {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}
</style>
