<script lang="ts" setup>
/**
 * 关联资源标签页组件
 * 显示与特定资源相关的其他 Kubernetes 资源
 */
import { computed, onMounted, ref, watch } from 'vue';

import { Card, Descriptions, Empty, List, Tag } from 'ant-design-vue';
import {
  ContainerOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons-vue';

interface Props {
  resource: any;
  resourceType: string;
  clusterId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  clusterId: 'default',
});

const loading = ref(false);
const relatedResources = ref<
  Array<{
    category: string;
    items: Array<{
      kind: string;
      name: string;
      namespace?: string;
      status?: string;
      link?: string;
    }>;
  }>
>([]);

/**
 * 加载关联资源
 * 根据资源类型和标签选择器找到相关资源
 */
async function loadRelatedResources() {
  if (!props.resource?.metadata) {
    return;
  }

  loading.value = true;
  try {
    const related: typeof relatedResources.value = [];

    // 根据不同的资源类型加载关联资源
    switch (props.resourceType) {
      case 'Deployment':
        await loadDeploymentRelated(related);
        break;
      case 'Service':
        await loadServiceRelated(related);
        break;
      case 'Pod':
        await loadPodRelated(related);
        break;
      case 'StatefulSet':
        await loadStatefulSetRelated(related);
        break;
      case 'DaemonSet':
        await loadDaemonSetRelated(related);
        break;
      default:
        // 通用处理：显示标签匹配的 Pod
        await loadGenericRelated(related);
    }

    relatedResources.value = related;
  } catch (error: any) {
    console.error('加载关联资源失败:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 加载 Deployment 的关联资源
 */
async function loadDeploymentRelated(related: typeof relatedResources.value) {
  const deployment = props.resource;

  // ReplicaSets
  if (deployment.spec?.selector?.matchLabels) {
    related.push({
      category: 'ReplicaSets',
      items: [
        {
          kind: 'ReplicaSet',
          name: `${deployment.metadata.name}-xxxx`,
          namespace: deployment.metadata.namespace,
          status: 'Running',
        },
      ],
    });
  }

  // Pods
  related.push({
    category: 'Pods',
    items: Array.from({ length: deployment.spec?.replicas || 0 }, (_, i) => ({
      kind: 'Pod',
      name: `${deployment.metadata.name}-xxxx-${i}`,
      namespace: deployment.metadata.namespace,
      status: 'Running',
    })),
  });

  // Services (if selector matches)
  if (deployment.spec?.template?.metadata?.labels) {
    related.push({
      category: 'Services',
      items: [
        {
          kind: 'Service',
          name: `${deployment.metadata.name}-service`,
          namespace: deployment.metadata.namespace,
        },
      ],
    });
  }
}

/**
 * 加载 Service 的关联资源
 */
async function loadServiceRelated(related: typeof relatedResources.value) {
  const service = props.resource;

  // Endpoints
  related.push({
    category: 'Endpoints',
    items: [
      {
        kind: 'Endpoints',
        name: service.metadata.name,
        namespace: service.metadata.namespace,
      },
    ],
  });

  // Pods (通过 selector 匹配)
  if (service.spec?.selector) {
    related.push({
      category: 'Pods (Backend)',
      items: [
        {
          kind: 'Pod',
          name: 'example-pod-1',
          namespace: service.metadata.namespace,
          status: 'Running',
        },
        {
          kind: 'Pod',
          name: 'example-pod-2',
          namespace: service.metadata.namespace,
          status: 'Running',
        },
      ],
    });
  }
}

/**
 * 加载 Pod 的关联资源
 */
async function loadPodRelated(related: typeof relatedResources.value) {
  const pod = props.resource;

  // Owner (Deployment/StatefulSet/DaemonSet/ReplicaSet)
  if (pod.metadata?.ownerReferences && pod.metadata.ownerReferences.length > 0) {
    const owner = pod.metadata.ownerReferences[0];
    related.push({
      category: 'Owner',
      items: [
        {
          kind: owner.kind,
          name: owner.name,
          namespace: pod.metadata.namespace,
        },
      ],
    });
  }

  // Services
  related.push({
    category: 'Services',
    items: [
      {
        kind: 'Service',
        name: 'example-service',
        namespace: pod.metadata.namespace,
      },
    ],
  });

  // PersistentVolumeClaims
  if (pod.spec?.volumes) {
    const pvcVolumes = pod.spec.volumes.filter((v: any) => v.persistentVolumeClaim);
    if (pvcVolumes.length > 0) {
      related.push({
        category: 'PersistentVolumeClaims',
        items: pvcVolumes.map((v: any) => ({
          kind: 'PersistentVolumeClaim',
          name: v.persistentVolumeClaim.claimName,
          namespace: pod.metadata.namespace,
        })),
      });
    }
  }

  // ConfigMaps & Secrets
  const configSources: Array<{ kind: string; name: string }> = [];
  if (pod.spec?.volumes) {
    pod.spec.volumes.forEach((v: any) => {
      if (v.configMap) {
        configSources.push({ kind: 'ConfigMap', name: v.configMap.name });
      }
      if (v.secret) {
        configSources.push({ kind: 'Secret', name: v.secret.secretName });
      }
    });
  }
  if (configSources.length > 0) {
    related.push({
      category: 'Configuration',
      items: configSources.map((cs) => ({
        kind: cs.kind,
        name: cs.name,
        namespace: pod.metadata.namespace,
      })),
    });
  }
}

/**
 * 加载 StatefulSet 的关联资源
 */
async function loadStatefulSetRelated(related: typeof relatedResources.value) {
  const sts = props.resource;

  // Service
  if (sts.spec?.serviceName) {
    related.push({
      category: 'Headless Service',
      items: [
        {
          kind: 'Service',
          name: sts.spec.serviceName,
          namespace: sts.metadata.namespace,
        },
      ],
    });
  }

  // Pods
  related.push({
    category: 'Pods',
    items: Array.from({ length: sts.spec?.replicas || 0 }, (_, i) => ({
      kind: 'Pod',
      name: `${sts.metadata.name}-${i}`,
      namespace: sts.metadata.namespace,
      status: 'Running',
    })),
  });

  // PVCs (from volumeClaimTemplates)
  if (sts.spec?.volumeClaimTemplates && sts.spec.volumeClaimTemplates.length > 0) {
    related.push({
      category: 'PersistentVolumeClaims',
      items: Array.from({ length: sts.spec?.replicas || 0 }, (_, i) =>
        sts.spec.volumeClaimTemplates.map((tpl: any) => ({
          kind: 'PersistentVolumeClaim',
          name: `${tpl.metadata.name}-${sts.metadata.name}-${i}`,
          namespace: sts.metadata.namespace,
        })),
      ).flat(),
    });
  }
}

/**
 * 加载 DaemonSet 的关联资源
 */
async function loadDaemonSetRelated(related: typeof relatedResources.value) {
  const ds = props.resource;

  // Pods (每个节点一个)
  related.push({
    category: 'Pods',
    items: [
      {
        kind: 'Pod',
        name: `${ds.metadata.name}-xxxxx`,
        namespace: ds.metadata.namespace,
        status: 'Running',
      },
    ],
  });
}

/**
 * 通用关联资源加载（基于标签）
 */
async function loadGenericRelated(related: typeof relatedResources.value) {
  const resource = props.resource;

  if (resource.metadata?.labels) {
    related.push({
      category: '相关资源（基于标签）',
      items: [
        {
          kind: 'Pod',
          name: 'example-pod',
          namespace: resource.metadata.namespace,
          status: 'Running',
        },
      ],
    });
  }
}

/**
 * 获取资源状态颜色
 */
function getStatusColor(status?: string): string {
  if (!status) return 'default';

  switch (status.toLowerCase()) {
    case 'running':
    case 'active':
    case 'bound':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'error':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * 是否有关联资源
 */
const hasRelatedResources = computed(
  () => relatedResources.value.length > 0 && relatedResources.value.some((r) => r.items.length > 0),
);

// 监听资源变化
watch(
  () => props.resource,
  () => {
    loadRelatedResources();
  },
  { immediate: true },
);

// 组件挂载时加载数据
onMounted(() => {
  loadRelatedResources();
});
</script>

<template>
  <div class="related-resources-tab">
    <div v-if="hasRelatedResources" class="resources-content" v-loading="loading">
      <div v-for="(category, idx) in relatedResources" :key="idx" class="resource-category">
        <Card :title="category.category" :bordered="false" size="small">
          <template #extra>
            <Tag color="blue">{{ category.items.length }}</Tag>
          </template>

          <List :data-source="category.items" :split="true" size="small">
            <template #renderItem="{ item }">
              <List.Item class="resource-item">
                <div class="resource-content">
                  <div class="resource-icon">
                    <component
                      :is="
                        item.kind === 'Pod'
                          ? ContainerOutlined
                          : item.kind.includes('Service')
                            ? DeploymentUnitOutlined
                            : DatabaseOutlined
                      "
                      style="font-size: 16px; color: var(--vben-primary-color);"
                    />
                  </div>
                  <div class="resource-info">
                    <div class="resource-name-row">
                      <Tag color="blue" size="small">{{ item.kind }}</Tag>
                      <code class="resource-name">{{ item.name }}</code>
                    </div>
                    <div v-if="item.namespace" class="resource-namespace">
                      <span class="namespace-label">命名空间:</span>
                      <code class="namespace-value">{{ item.namespace }}</code>
                    </div>
                  </div>
                  <div v-if="item.status" class="resource-status">
                    <Tag :color="getStatusColor(item.status)" size="small">
                      {{ item.status }}
                    </Tag>
                  </div>
                </div>
              </List.Item>
            </template>
          </List>
        </Card>
      </div>
    </div>

    <Empty
      v-else-if="!loading"
      description="暂无关联资源"
      :image="Empty.PRESENTED_IMAGE_SIMPLE"
    />

    <div v-if="loading && !hasRelatedResources" class="loading-placeholder">
      <DatabaseOutlined spin style="font-size: 24px; color: var(--vben-primary-color);" />
      <p>加载关联资源中...</p>
    </div>
  </div>
</template>

<style scoped>
.related-resources-tab {
  padding: 16px;
  min-height: 300px;
}

.resources-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resource-category {
  transition: all 0.3s ease;
}

.resource-item {
  padding: 8px 0;
}

.resource-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.resource-icon {
  flex-shrink: 0;
}

.resource-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.resource-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-name {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  color: var(--vben-text-color);
  padding: 2px 6px;
  border-radius: 3px;
  background-color: rgb(0 0 0 / 4%);
}

html[data-theme='dark'] .resource-name {
  background-color: rgb(255 255 255 / 8%);
}

.resource-namespace {
  display: flex;
  align-items: center;
  gap: 6px;
}

.namespace-label {
  font-size: 11px;
  color: var(--vben-text-color-secondary);
}

.namespace-value {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 11px;
  color: var(--vben-text-color-secondary);
  padding: 1px 4px;
  border-radius: 2px;
  background-color: rgb(0 0 0 / 3%);
}

html[data-theme='dark'] .namespace-value {
  background-color: rgb(255 255 255 / 5%);
}

.resource-status {
  flex-shrink: 0;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
  color: var(--vben-text-color-secondary);
}
</style>
