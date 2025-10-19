<script lang="ts" setup>
/**
 * 集群健康度评分组件
 * 综合评估集群的健康状况并给出评分
 */
import { computed, onMounted, ref } from 'vue';

import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons-vue';
import { Card, Descriptions, Progress, Tag, Tooltip } from 'ant-design-vue';

import { deploymentApi, eventApi, nodeApi, podApi } from '#/api/k8s';

interface Props {
  clusterId: string;
}

const props = defineProps<Props>();

const loading = ref(false);

interface HealthMetric {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  status: 'excellent' | 'fair' | 'good' | 'poor';
}

const healthMetrics = ref<HealthMetric[]>([]);
const totalScore = ref(0);
const maxTotalScore = ref(100);

/**
 * 加载健康度数据
 */
async function loadHealthScore() {
  loading.value = true;
  try {
    const [pods, nodes, deployments, events] = await Promise.all([
      podApi
        .list({ clusterId: props.clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
      nodeApi.list(props.clusterId).catch(() => ({ items: [] })),
      deploymentApi
        .list({ clusterId: props.clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
      eventApi
        .list({ clusterId: props.clusterId, pageSize: 100 })
        .catch(() => ({ items: [] })),
    ]);

    const metrics: HealthMetric[] = [];

    // 1. 节点健康度 (30分)
    const readyNodes = nodes.items.filter(
      (n: any) => n.status === 'Ready',
    ).length;
    const nodeHealthScore = Math.round((readyNodes / nodes.items.length) * 30);
    metrics.push({
      name: '节点健康度',
      score: nodeHealthScore,
      maxScore: 30,
      description: `${readyNodes}/${nodes.items.length} 节点就绪`,
      status: getMetricStatus(nodeHealthScore, 30),
    });

    // 2. Pod 健康度 (25分)
    const runningPods = pods.items.filter(
      (p: any) => p.status === 'Running',
    ).length;
    const podHealthScore = Math.round((runningPods / pods.items.length) * 25);
    metrics.push({
      name: 'Pod 健康度',
      score: podHealthScore,
      maxScore: 25,
      description: `${runningPods}/${pods.items.length} Pod 运行中`,
      status: getMetricStatus(podHealthScore, 25),
    });

    // 3. Deployment 可用性 (25分)
    const healthyDeployments = deployments.items.filter(
      (d: any) => d.status?.availableReplicas === d.status?.replicas,
    ).length;
    const deploymentScore = Math.round(
      (healthyDeployments / deployments.items.length) * 25,
    );
    metrics.push({
      name: 'Deployment 可用性',
      score: deploymentScore,
      maxScore: 25,
      description: `${healthyDeployments}/${deployments.items.length} Deployment 健康`,
      status: getMetricStatus(deploymentScore, 25),
    });

    // 4. 事件稳定性 (20分)
    const warningEvents = events.items.filter(
      (e: any) => e.type === 'Warning',
    ).length;
    const eventStabilityScore = Math.max(0, 20 - Math.min(warningEvents, 20));
    metrics.push({
      name: '事件稳定性',
      score: eventStabilityScore,
      maxScore: 20,
      description: `最近 ${warningEvents} 个警告事件`,
      status: getMetricStatus(eventStabilityScore, 20),
    });

    healthMetrics.value = metrics;
    totalScore.value = metrics.reduce((sum, m) => sum + m.score, 0);
  } catch (error: any) {
    console.error('加载健康度评分失败:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 获取指标状态
 */
function getMetricStatus(
  score: number,
  maxScore: number,
): 'excellent' | 'fair' | 'good' | 'poor' {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 75) return 'good';
  if (percentage >= 60) return 'fair';
  return 'poor';
}

/**
 * 获取状态颜色
 */
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    excellent: 'success',
    good: 'processing',
    fair: 'warning',
    poor: 'error',
  };
  return colorMap[status] || 'default';
}

/**
 * 获取状态文本
 */
function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    excellent: '优秀',
    good: '良好',
    fair: '一般',
    poor: '较差',
  };
  return textMap[status] || '未知';
}

/**
 * 总评分百分比
 */
const scorePercentage = computed(() => {
  return Math.round((totalScore.value / maxTotalScore.value) * 100);
});

/**
 * 总体健康等级
 */
const overallGrade = computed(() => {
  const percentage = scorePercentage.value;
  if (percentage >= 90) return { grade: 'A', color: '#52c41a', text: '优秀' };
  if (percentage >= 80) return { grade: 'B', color: '#1890ff', text: '良好' };
  if (percentage >= 70) return { grade: 'C', color: '#faad14', text: '一般' };
  if (percentage >= 60) return { grade: 'D', color: '#fa8c16', text: '及格' };
  return { grade: 'F', color: '#f5222d', text: '较差' };
});

/**
 * 进度条颜色
 */
const progressColor = computed(() => {
  return overallGrade.value.color;
});

// 组件挂载时加载数据
onMounted(() => {
  loadHealthScore();
});
</script>

<template>
  <Card
    class="health-score-card"
    title="集群健康度评分"
    :bordered="false"
    :loading="loading"
  >
    <template #extra>
      <Tooltip title="基于节点、Pod、Deployment 和事件的综合评估">
        <InfoCircleOutlined style="color: var(--vben-text-color-secondary)" />
      </Tooltip>
    </template>

    <div class="health-score-content">
      <!-- 总评分 -->
      <div class="overall-score">
        <div class="score-display">
          <TrophyOutlined
            class="trophy-icon"
            :style="{ color: overallGrade.color }"
          />
          <div class="score-info">
            <div class="score-value" :style="{ color: overallGrade.color }">
              {{ totalScore }} / {{ maxTotalScore }}
            </div>
            <div class="score-grade">
              <Tag :color="getStatusColor(overallGrade.grade)" size="large">
                等级 {{ overallGrade.grade }}
              </Tag>
              <span class="grade-text">{{ overallGrade.text }}</span>
            </div>
          </div>
        </div>

        <div class="score-progress">
          <Progress
            :percent="scorePercentage"
            :stroke-color="progressColor"
            :stroke-width="12"
            :show-info="true"
          />
        </div>
      </div>

      <!-- 详细指标 -->
      <div class="metrics-detail">
        <Descriptions :column="1" size="small" bordered>
          <Descriptions.Item
            v-for="metric in healthMetrics"
            :key="metric.name"
            :label="metric.name"
          >
            <div class="metric-content">
              <div class="metric-score">
                <Tag :color="getStatusColor(metric.status)">
                  {{ getStatusText(metric.status) }}
                </Tag>
                <span class="score-text">
                  {{ metric.score }} / {{ metric.maxScore }}
                </span>
              </div>
              <div class="metric-description">
                {{ metric.description }}
              </div>
              <Progress
                :percent="Math.round((metric.score / metric.maxScore) * 100)"
                :stroke-color="
                  getStatusColor(metric.status) === 'success'
                    ? '#52c41a'
                    : getStatusColor(metric.status) === 'error'
                      ? '#f5222d'
                      : '#faad14'
                "
                :show-info="false"
                size="small"
              />
            </div>
          </Descriptions.Item>
        </Descriptions>
      </div>

      <!-- 健康建议 -->
      <div v-if="scorePercentage < 90" class="health-suggestions">
        <div class="suggestions-title">
          <CheckCircleOutlined style="color: #1890ff" />
          <span>改进建议</span>
        </div>
        <ul class="suggestions-list">
          <li v-if="healthMetrics[0]?.score < healthMetrics[0]?.maxScore * 0.9">
            检查并修复不健康的节点，确保所有节点处于 Ready 状态
          </li>
          <li v-if="healthMetrics[1]?.score < healthMetrics[1]?.maxScore * 0.9">
            排查 Pod 失败原因，检查镜像、资源限制和配置
          </li>
          <li v-if="healthMetrics[2]?.score < healthMetrics[2]?.maxScore * 0.9">
            确保 Deployment 的所有副本都可用，检查滚动更新配置
          </li>
          <li v-if="healthMetrics[3]?.score < healthMetrics[3]?.maxScore * 0.9">
            关注最近的警告事件，及时处理潜在问题
          </li>
        </ul>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.health-score-card {
  height: 100%;
  background-color: var(--vben-background-color);
}

.health-score-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overall-score {
  padding: 20px;
  background: linear-gradient(
    135deg,
    rgb(24 144 255 / 5%) 0%,
    rgb(82 196 26 / 5%) 100%
  );
  border: 2px solid var(--vben-border-color);
  border-radius: 8px;
}

.score-display {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 16px;
}

.trophy-icon {
  font-size: 48px;
}

.score-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.score-grade {
  display: flex;
  gap: 8px;
  align-items: center;
}

.grade-text {
  font-size: 14px;
  color: var(--vben-text-color-secondary);
}

.score-progress {
  margin-top: 12px;
}

.metrics-detail {
  margin-top: 8px;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.metric-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.score-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.metric-description {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.health-suggestions {
  padding: 16px;
  background-color: rgb(24 144 255 / 3%);
  border: 1px dashed var(--vben-border-color);
  border-radius: 6px;
}

.suggestions-title {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.suggestions-list {
  padding-left: 24px;
  margin: 0;
  list-style-type: disc;
}

.suggestions-list li {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vben-text-color-secondary);
}

.suggestions-list li:last-child {
  margin-bottom: 0;
}
</style>
