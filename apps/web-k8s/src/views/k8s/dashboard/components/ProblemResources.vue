<script lang="ts" setup>
/**
 * 问题资源快速访问组件
 * 展示当前有问题的资源，提供快速跳转
 */
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue';
import { Badge, Button, Card, Empty, List, Tag } from 'ant-design-vue';

import { deploymentApi, nodeApi, podApi, serviceApi } from '#/api/k8s';

interface Props {
  clusterId: string;
}

const props = defineProps<Props>();
const router = useRouter();

const loading = ref(false);

interface ProblemResource {
  type: 'Deployment' | 'Node' | 'Pod' | 'Service';
  name: string;
  namespace?: string;
  severity: 'critical' | 'warning';
  issue: string;
  route?: string;
}

const problemResources = ref<ProblemResource[]>([]);

/**
 * 加载问题资源
 */
async function loadProblemResources() {
  loading.value = true;
  try {
    const [pods, nodes, deployments, services] = await Promise.all([
      podApi
        .list({ clusterId: props.clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
      nodeApi.list(props.clusterId).catch(() => ({ items: [] })),
      deploymentApi
        .list({ clusterId: props.clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
      serviceApi
        .list({ clusterId: props.clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
    ]);

    const problems: ProblemResource[] = [];

    // 检查 Pods 问题
    pods.items.forEach((pod: any) => {
      if (pod.status === 'Failed') {
        problems.push({
          type: 'Pod',
          name: pod.metadata.name,
          namespace: pod.metadata.namespace,
          severity: 'critical',
          issue: 'Pod 运行失败',
          route: '/k8s/pods',
        });
      } else if (pod.status === 'Pending') {
        problems.push({
          type: 'Pod',
          name: pod.metadata.name,
          namespace: pod.metadata.namespace,
          severity: 'warning',
          issue: 'Pod 处于等待状态',
          route: '/k8s/pods',
        });
      }
    });

    // 检查 Nodes 问题
    nodes.items.forEach((node: any) => {
      if (node.status === 'NotReady') {
        problems.push({
          type: 'Node',
          name: node.metadata.name,
          severity: 'critical',
          issue: '节点不可用',
          route: '/k8s/nodes',
        });
      } else if (node.status === 'Unknown') {
        problems.push({
          type: 'Node',
          name: node.metadata.name,
          severity: 'warning',
          issue: '节点状态未知',
          route: '/k8s/nodes',
        });
      }
    });

    // 检查 Deployments 问题
    deployments.items.forEach((deployment: any) => {
      const { availableReplicas = 0, replicas = 0 } = deployment.status || {};

      if (availableReplicas === 0 && replicas > 0) {
        problems.push({
          type: 'Deployment',
          name: deployment.metadata.name,
          namespace: deployment.metadata.namespace,
          severity: 'critical',
          issue: '所有副本不可用',
          route: '/k8s/deployments',
        });
      } else if (availableReplicas < replicas) {
        problems.push({
          type: 'Deployment',
          name: deployment.metadata.name,
          namespace: deployment.metadata.namespace,
          severity: 'warning',
          issue: `部分副本不可用 (${availableReplicas}/${replicas})`,
          route: '/k8s/deployments',
        });
      }
    });

    // 按严重程度排序（critical 在前）
    problems.sort((a, b) => {
      if (a.severity === 'critical' && b.severity === 'warning') return -1;
      if (a.severity === 'warning' && b.severity === 'critical') return 1;
      return 0;
    });

    // 最多显示 10 个问题
    problemResources.value = problems.slice(0, 10);
  } catch (error: any) {
    console.error('加载问题资源失败:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 获取严重程度图标
 */
function getSeverityIcon(severity: string) {
  return severity === 'critical' ? CloseCircleOutlined : WarningOutlined;
}

/**
 * 获取严重程度颜色
 */
function getSeverityColor(severity: string): string {
  return severity === 'critical' ? 'error' : 'warning';
}

/**
 * 获取资源类型颜色
 */
function getTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    Pod: 'blue',
    Node: 'green',
    Deployment: 'orange',
    Service: 'purple',
  };
  return colorMap[type] || 'default';
}

/**
 * 跳转到资源页面
 */
function navigateToResource(resource: ProblemResource) {
  if (resource.route) {
    router.push(resource.route);
  }
}

/**
 * 是否有问题资源
 */
const hasProblems = computed(() => problemResources.value.length > 0);

/**
 * 统计数量
 */
const criticalCount = computed(
  () => problemResources.value.filter((r) => r.severity === 'critical').length,
);

const warningCount = computed(
  () => problemResources.value.filter((r) => r.severity === 'warning').length,
);

// 组件挂载时加载数据
onMounted(() => {
  loadProblemResources();
});
</script>

<template>
  <Card class="problem-resources-card" :bordered="false" :loading="loading">
    <template #title>
      <div class="card-title">
        <span>问题资源</span>
        <div v-if="hasProblems" class="problem-badges">
          <Badge
            v-if="criticalCount > 0"
            :count="criticalCount"
            :number-style="{ backgroundColor: '#f5222d' }"
          >
            <Tag color="error">严重</Tag>
          </Badge>
          <Badge
            v-if="warningCount > 0"
            :count="warningCount"
            :number-style="{ backgroundColor: '#faad14' }"
          >
            <Tag color="warning">警告</Tag>
          </Badge>
        </div>
      </div>
    </template>

    <div v-if="hasProblems" class="problems-content">
      <List :data-source="problemResources" :split="true" size="small">
        <template #renderItem="{ item }">
          <List.Item class="problem-item">
            <div class="problem-content">
              <div class="problem-header">
                <component
                  :is="getSeverityIcon(item.severity)"
                  :style="{
                    color: item.severity === 'critical' ? '#f5222d' : '#faad14',
                  }"
                  class="severity-icon"
                />
                <div class="problem-info">
                  <div class="resource-name-row">
                    <Tag :color="getTypeColor(item.type)" size="small">
                      {{ item.type }}
                    </Tag>
                    <code class="resource-name">{{ item.name }}</code>
                  </div>
                  <div v-if="item.namespace" class="namespace-row">
                    <span class="namespace-label">命名空间:</span>
                    <code class="namespace-value">{{ item.namespace }}</code>
                  </div>
                  <div class="issue-row">
                    <ExclamationCircleOutlined class="issue-icon" />
                    <span class="issue-text">{{ item.issue }}</span>
                  </div>
                </div>
              </div>
            </div>
            <template #actions>
              <Button
                type="link"
                size="small"
                @click="navigateToResource(item)"
              >
                查看 <RightOutlined />
              </Button>
            </template>
          </List.Item>
        </template>
      </List>
    </div>

    <Empty
      v-else
      description="太棒了！当前没有发现问题资源"
      :image="Empty.PRESENTED_IMAGE_SIMPLE"
    >
      <template #image>
        <div class="success-state">
          <CheckCircleOutlined style="font-size: 64px; color: #52c41a" />
        </div>
      </template>
    </Empty>
  </Card>
</template>

<style scoped>
.problem-resources-card {
  height: 100%;
  background-color: var(--vben-background-color);
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.problem-badges {
  display: flex;
  gap: 12px;
  align-items: center;
}

.problems-content {
  max-height: 500px;
  overflow-y: auto;
}

.problem-item {
  padding: 12px 0;
  transition: background-color 0.3s ease;
}

.problem-item:hover {
  background-color: rgb(0 0 0 / 2%);
}

html[data-theme='dark'] .problem-item:hover {
  background-color: rgb(255 255 255 / 2%);
}

.problem-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.problem-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.severity-icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 20px;
}

.problem-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}

.resource-name-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.resource-name {
  padding: 2px 6px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  color: var(--vben-text-color);
  background-color: rgb(0 0 0 / 4%);
  border-radius: 3px;
}

html[data-theme='dark'] .resource-name {
  background-color: rgb(255 255 255 / 8%);
}

.namespace-row {
  display: flex;
  gap: 6px;
  align-items: center;
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

.issue-row {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  background-color: rgb(250 140 22 / 5%);
  border-left: 3px solid var(--vben-warning-color);
  border-radius: 4px;
}

.issue-icon {
  font-size: 14px;
  color: var(--vben-warning-color);
}

.issue-text {
  font-size: 13px;
  color: var(--vben-text-color);
}

.success-state {
  padding: 20px;
}

/* 滚动条样式 */
.problems-content::-webkit-scrollbar {
  width: 6px;
}

.problems-content::-webkit-scrollbar-track {
  background: var(--vben-background-color);
}

.problems-content::-webkit-scrollbar-thumb {
  background: var(--vben-border-color);
  border-radius: 3px;
}

.problems-content::-webkit-scrollbar-thumb:hover {
  background: var(--vben-text-color-secondary);
}
</style>
