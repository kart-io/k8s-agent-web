<script lang="ts" setup>
/**
 * 资源健康状态组件
 * 展示各类资源的健康状态统计
 */
import { onMounted, ref } from 'vue';

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue';
import { Card, message, Progress, Statistic } from 'ant-design-vue';

import { deploymentApi, nodeApi, podApi, serviceApi } from '#/api/k8s';

// Props
const props = defineProps<{
  clusterId: string;
}>();

// 加载状态
const loading = ref(false);

// 资源健康状态统计
interface ResourceHealth {
  name: string;
  healthy: number;
  unhealthy: number;
  warning: number;
  total: number;
}

const resourcesHealth = ref<ResourceHealth[]>([]);

/**
 * 加载资源健康状态
 */
async function loadResourceHealth() {
  loading.value = true;
  try {
    // 并行加载各类资源数据
    const [pods, nodes, deployments, services] = await Promise.all([
      podApi
        .list({ clusterId: props.clusterId, pageSize: 1000 })
        .catch(() => ({ items: [] })),
      nodeApi.list(props.clusterId).catch(() => ({ items: [] })),
      deploymentApi
        .list({ clusterId: props.clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
      serviceApi
        .list({ clusterId: props.clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
    ]);

    // 统计 Pods 健康状态
    const podHealth = calculateHealthStatus(pods.items, (item: any) => {
      if (item.status === 'Running') return 'healthy';
      if (item.status === 'Pending') return 'warning';
      return 'unhealthy';
    });

    // 统计 Nodes 健康状态
    const nodeHealth = calculateHealthStatus(nodes.items, (item: any) => {
      if (item.status === 'Ready') return 'healthy';
      if (item.status === 'NotReady') return 'unhealthy';
      return 'warning';
    });

    // 统计 Deployments 健康状态
    const deploymentHealth = calculateHealthStatus(
      deployments.items,
      (item: any) => {
        if (item.status?.availableReplicas === item.status?.replicas)
          return 'healthy';
        if (item.status?.availableReplicas > 0) return 'warning';
        return 'unhealthy';
      },
    );

    // 统计 Services 健康状态（简化：所有 Service 都认为是健康的）
    const serviceHealth = {
      healthy: services.items.length,
      unhealthy: 0,
      warning: 0,
      total: services.items.length,
    };

    resourcesHealth.value = [
      { name: 'Pods', ...podHealth },
      { name: 'Nodes', ...nodeHealth },
      { name: 'Deployments', ...deploymentHealth },
      { name: 'Services', ...serviceHealth },
    ];
  } catch (error: any) {
    console.error('加载资源健康状态失败:', error);
    message.error(`加载资源健康状态失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
}

/**
 * 计算健康状态统计
 */
function calculateHealthStatus(
  items: any[],
  statusGetter: (item: any) => 'healthy' | 'unhealthy' | 'warning',
) {
  const result = {
    healthy: 0,
    unhealthy: 0,
    warning: 0,
    total: items.length,
  };

  items.forEach((item) => {
    const status = statusGetter(item);
    result[status]++;
  });

  return result;
}

/**
 * 计算健康百分比
 */
function getHealthPercent(health: ResourceHealth): number {
  if (health.total === 0) return 100;
  return Math.round((health.healthy / health.total) * 100);
}

/**
 * 获取健康状态颜色
 */
function getHealthColor(percent: number): string {
  if (percent >= 90) return '#52c41a';
  if (percent >= 70) return '#faad14';
  return '#f5222d';
}

// 组件挂载时加载数据
onMounted(() => {
  loadResourceHealth();
});
</script>

<template>
  <Card
    class="resource-health-card"
    title="资源健康状态"
    :bordered="false"
    :loading="loading"
  >
    <div class="resource-health-content">
      <div
        v-for="resource in resourcesHealth"
        :key="resource.name"
        class="resource-health-item"
      >
        <div class="resource-header">
          <span class="resource-name">{{ resource.name }}</span>
          <span class="resource-total">总计: {{ resource.total }}</span>
        </div>

        <div class="health-progress">
          <Progress
            :percent="getHealthPercent(resource)"
            :stroke-color="getHealthColor(getHealthPercent(resource))"
            :show-info="true"
          />
        </div>

        <div class="health-stats">
          <div class="health-stat healthy">
            <CheckCircleOutlined class="stat-icon" />
            <Statistic
              :value="resource.healthy"
              :value-style="{ fontSize: '14px', color: '#52c41a' }"
              title="健康"
            />
          </div>

          <div v-if="resource.warning > 0" class="health-stat warning">
            <WarningOutlined class="stat-icon" />
            <Statistic
              :value="resource.warning"
              :value-style="{ fontSize: '14px', color: '#faad14' }"
              title="警告"
            />
          </div>

          <div v-if="resource.unhealthy > 0" class="health-stat unhealthy">
            <CloseCircleOutlined class="stat-icon" />
            <Statistic
              :value="resource.unhealthy"
              :value-style="{ fontSize: '14px', color: '#f5222d' }"
              title="异常"
            />
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.resource-health-card {
  height: 100%;
  background-color: var(--vben-background-color);
}

.resource-health-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.resource-health-item {
  padding: 16px;
  background-color: rgb(0 0 0 / 2%);
  border: 1px solid var(--vben-border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

html[data-theme='dark'] .resource-health-item {
  background-color: rgb(255 255 255 / 2%);
}

.resource-health-item:hover {
  border-color: var(--vben-primary-color);
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.resource-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.resource-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.resource-total {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.health-progress {
  margin-bottom: 16px;
}

.health-stats {
  display: flex;
  gap: 16px;
  justify-content: space-around;
}

.health-stat {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  padding: 8px;
  background-color: var(--vben-background-color);
  border-radius: 6px;
}

.stat-icon {
  margin-bottom: 4px;
  font-size: 20px;
}

.health-stat.healthy .stat-icon {
  color: #52c41a;
}

.health-stat.warning .stat-icon {
  color: #faad14;
}

.health-stat.unhealthy .stat-icon {
  color: #f5222d;
}

.health-stat :deep(.ant-statistic-title) {
  margin-bottom: 0;
  font-size: 11px;
}

.health-stat :deep(.ant-statistic-content) {
  font-size: 14px;
}
</style>
