<script lang="ts" setup>
/**
 * 集群状态卡片组件
 * 展示所有集群的健康状态和基本信息
 */
import type { Cluster } from '#/api/k8s/types';

import { onMounted, ref } from 'vue';

import { Card, Col, message, Progress, Row, Tag } from 'ant-design-vue';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  ClusterOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
} from '@ant-design/icons-vue';

import { getMockClusterList } from '#/api/k8s/mock';

// 加载状态
const loading = ref(false);

// 集群列表
const clusters = ref<Cluster[]>([]);

/**
 * 加载集群列表
 */
async function loadClusters() {
  loading.value = true;
  try {
    const result = getMockClusterList({ pageSize: 100 });
    clusters.value = result.items;
  } catch (error: any) {
    message.error(`加载集群列表失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
}

/**
 * 获取状态颜色
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'unhealthy':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'default';
  }
}

/**
 * 获取状态图标
 */
function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return CheckCircleOutlined;
    case 'unhealthy':
      return CloseCircleOutlined;
    default:
      return QuestionCircleOutlined;
  }
}

/**
 * 获取状态文本
 */
function getStatusText(status: string): string {
  switch (status) {
    case 'healthy':
      return '健康';
    case 'unhealthy':
      return '异常';
    case 'warning':
      return '警告';
    default:
      return '未知';
  }
}

/**
 * 计算资源使用百分比
 */
function getUsagePercent(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
}

/**
 * 格式化资源值
 */
function formatResource(value: string | number): string {
  return String(value);
}

// 组件挂载时加载数据
onMounted(() => {
  loadClusters();
});
</script>

<template>
  <div class="cluster-status-section">
    <h3 class="section-title">集群状态</h3>
    <Row :gutter="[16, 16]">
      <Col
        v-for="cluster in clusters"
        :key="cluster.metadata.uid"
        :xs="24"
        :sm="12"
        :lg="8"
        :xl="6"
      >
        <Card class="cluster-card" :loading="loading" :bordered="false">
          <!-- 集群头部：名称和状态 -->
          <div class="cluster-header">
            <div class="cluster-name-wrapper">
              <ClusterOutlined class="cluster-icon" />
              <span class="cluster-name">{{ cluster.metadata.name }}</span>
            </div>
            <Tag :color="getStatusColor(cluster.status)">
              <component :is="getStatusIcon(cluster.status)" class="status-icon" />
              {{ getStatusText(cluster.status) }}
            </Tag>
          </div>

          <!-- 集群信息 -->
          <div class="cluster-info">
            <div class="info-item">
              <span class="info-label">版本:</span>
              <code class="info-value">{{ cluster.version }}</code>
            </div>
            <div class="info-item">
              <CloudServerOutlined class="info-icon" />
              <span class="info-label">节点:</span>
              <span class="info-value">{{ cluster.nodeCount }}</span>
            </div>
            <div class="info-item">
              <DatabaseOutlined class="info-icon" />
              <span class="info-label">Pods:</span>
              <span class="info-value">{{ cluster.podCount }}</span>
            </div>
          </div>

          <!-- 资源使用情况 -->
          <div v-if="cluster.resources" class="cluster-resources">
            <div class="resource-item">
              <div class="resource-header">
                <span class="resource-label">CPU</span>
                <span class="resource-usage">
                  {{ formatResource(cluster.resources.cpu.used) }} /
                  {{ formatResource(cluster.resources.cpu.total) }}
                </span>
              </div>
              <Progress
                :percent="getUsagePercent(cluster.resources.cpu.used, cluster.resources.cpu.total)"
                :show-info="false"
                :stroke-color="{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }"
                size="small"
              />
            </div>

            <div class="resource-item">
              <div class="resource-header">
                <span class="resource-label">内存</span>
                <span class="resource-usage">
                  {{ formatResource(cluster.resources.memory.used) }} /
                  {{ formatResource(cluster.resources.memory.total) }}
                </span>
              </div>
              <Progress
                :percent="getUsagePercent(cluster.resources.memory.used, cluster.resources.memory.total)"
                :show-info="false"
                :stroke-color="{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }"
                size="small"
              />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<style scoped>
.cluster-status-section {
  margin-bottom: 16px;
}

.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.cluster-card {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.cluster-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.cluster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vben-border-color);
}

.cluster-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.cluster-icon {
  font-size: 18px;
  color: var(--vben-primary-color);
}

.cluster-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-icon {
  margin-right: 4px;
}

.cluster-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.info-icon {
  font-size: 14px;
  color: var(--vben-text-color-secondary);
}

.info-label {
  color: var(--vben-text-color-secondary);
}

.info-value {
  font-weight: 500;
  color: var(--vben-text-color);
}

.cluster-resources {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resource-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--vben-text-color-secondary);
}

.resource-usage {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 11px;
  color: var(--vben-text-color-secondary);
}
</style>
