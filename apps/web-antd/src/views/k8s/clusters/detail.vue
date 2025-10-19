<script lang="ts" setup>
import type { Cluster, ClusterMetrics } from '#/api/k8s/types';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import {
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  message,
  Row,
  Spin,
  Statistic,
  Tag,
} from 'ant-design-vue';

import { getClusterDetail, getClusterMetrics } from '#/api/k8s';

const route = useRoute();
const loading = ref(false);
const cluster = ref<Cluster | null>(null);
const metrics = ref<ClusterMetrics | null>(null);

// 获取集群详情
async function fetchClusterDetail() {
  const clusterId = route.params.id as string;
  if (!clusterId) {
    return;
  }

  loading.value = true;
  try {
    const [clusterData, metricsData] = await Promise.all([
      getClusterDetail(clusterId),
      getClusterMetrics(clusterId),
    ]);
    cluster.value = clusterData;
    metrics.value = metricsData;
  } catch (error: any) {
    message.error(error.message || '获取集群详情失败');
  } finally {
    loading.value = false;
  }
}

// 获取状态标签颜色
function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    healthy: 'success',
    unhealthy: 'error',
    unknown: 'default',
  };
  return colorMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    healthy: '健康',
    unhealthy: '异常',
    unknown: '未知',
  };
  return textMap[status] || status;
}

// 初始化
onMounted(() => {
  fetchClusterDetail();
});
</script>

<template>
  <div class="p-5">
    <Spin :spinning="loading">
      <!-- 基本信息 -->
      <Card v-if="cluster" class="mb-4" title="基本信息">
        <Descriptions :column="2" bordered>
          <DescriptionsItem label="集群名称">
            {{ cluster.name }}
          </DescriptionsItem>
          <DescriptionsItem label="状态">
            <Tag :color="getStatusColor(cluster.status)">
              {{ getStatusText(cluster.status) }}
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem label="API Server">
            {{ cluster.apiServer }}
          </DescriptionsItem>
          <DescriptionsItem label="版本">
            {{ cluster.version }}
          </DescriptionsItem>
          <DescriptionsItem label="创建时间">
            {{ cluster.createdAt }}
          </DescriptionsItem>
          <DescriptionsItem label="更新时间">
            {{ cluster.updatedAt }}
          </DescriptionsItem>
          <DescriptionsItem :span="2" label="描述">
            {{ cluster.description || '-' }}
          </DescriptionsItem>
        </Descriptions>
      </Card>

      <!-- 资源统计 -->
      <Card v-if="metrics" class="mb-4" title="资源统计">
        <Row :gutter="16">
          <Col :span="6">
            <Card>
              <Statistic
                title="CPU 使用率"
                :value="metrics.cpuUsage"
                suffix="%"
                :value-style="{
                  color: metrics.cpuUsage > 80 ? '#cf1322' : '#3f8600',
                }"
              />
            </Card>
          </Col>
          <Col :span="6">
            <Card>
              <Statistic
                title="内存使用率"
                :value="metrics.memoryUsage"
                suffix="%"
                :value-style="{
                  color: metrics.memoryUsage > 80 ? '#cf1322' : '#3f8600',
                }"
              />
            </Card>
          </Col>
          <Col :span="6">
            <Card>
              <Statistic
                title="磁盘使用率"
                :value="metrics.diskUsage"
                suffix="%"
                :value-style="{
                  color: metrics.diskUsage > 80 ? '#cf1322' : '#3f8600',
                }"
              />
            </Card>
          </Col>
          <Col :span="6">
            <Card>
              <Statistic
                title="Pod 数量"
                :value="metrics.podCount"
                :value-style="{ color: '#1890ff' }"
              />
            </Card>
          </Col>
        </Row>
        <Row :gutter="16" class="mt-4">
          <Col :span="8">
            <Card>
              <Statistic
                title="Node 数量"
                :value="metrics.nodeCount"
                :value-style="{ color: '#1890ff' }"
              />
            </Card>
          </Col>
          <Col :span="8">
            <Card>
              <Statistic
                title="Namespace 数量"
                :value="metrics.namespaceCount"
                :value-style="{ color: '#1890ff' }"
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </Spin>
  </div>
</template>
