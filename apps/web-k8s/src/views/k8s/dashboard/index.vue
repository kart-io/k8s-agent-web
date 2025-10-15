<script lang="ts" setup>
/**
 * Kubernetes Dashboard 总览页面
 * 展示集群的整体状态和快速访问入口
 */
import { onMounted, ref } from 'vue';

import { Card, Col, message, Row, Statistic } from 'ant-design-vue';
import {
  ApiOutlined,
  ClusterOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  FolderOutlined,
  RocketOutlined,
} from '@ant-design/icons-vue';

import {
  getMockClusterList,
  getMockDeploymentList,
  getMockNamespaceList,
  getMockNodeList,
  getMockPodList,
  getMockServiceList,
} from '#/api/k8s/mock';

import ClusterStatusCards from './components/ClusterStatusCards.vue';
import RecentEvents from './components/RecentEvents.vue';
import ResourceHealthStatus from './components/ResourceHealthStatus.vue';

// 当前选中的集群ID
const currentClusterId = ref('cluster-production-01');

// 加载状态
const loading = ref(false);

// 统计数据
const stats = ref({
  clusters: 0,
  nodes: 0,
  namespaces: 0,
  pods: 0,
  deployments: 0,
  services: 0,
});

/**
 * 加载统计数据
 */
async function loadStats() {
  loading.value = true;
  try {
    // 并行加载各类资源数据
    const [clusters, nodes, namespaces, pods, deployments, services] = await Promise.all([
      Promise.resolve(getMockClusterList({ pageSize: 1 })),
      Promise.resolve(getMockNodeList({ clusterId: currentClusterId.value, pageSize: 1 })),
      Promise.resolve(getMockNamespaceList({ clusterId: currentClusterId.value, pageSize: 1 })),
      Promise.resolve(getMockPodList({ clusterId: currentClusterId.value, pageSize: 1 })),
      Promise.resolve(
        getMockDeploymentList({ clusterId: currentClusterId.value, pageSize: 1 }),
      ),
      Promise.resolve(
        getMockServiceList({ clusterId: currentClusterId.value, pageSize: 1 }),
      ),
    ]);

    stats.value = {
      clusters: clusters.total,
      nodes: nodes.total,
      namespaces: namespaces.total,
      pods: pods.total,
      deployments: deployments.total,
      services: services.total,
    };
  } catch (error: any) {
    message.error(`加载统计数据失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <Row :gutter="[16, 16]">
        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic
              title="集群总数"
              :value="stats.clusters"
            >
              <template #prefix>
                <ClusterOutlined style="color: #1890ff;" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic
              title="节点总数"
              :value="stats.nodes"
            >
              <template #prefix>
                <CloudServerOutlined style="color: #52c41a;" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic
              title="命名空间"
              :value="stats.namespaces"
            >
              <template #prefix>
                <FolderOutlined style="color: #722ed1;" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic
              title="Pod 总数"
              :value="stats.pods"
            >
              <template #prefix>
                <DatabaseOutlined style="color: #13c2c2;" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic
              title="Deployments"
              :value="stats.deployments"
            >
              <template #prefix>
                <RocketOutlined style="color: #fa8c16;" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic
              title="Services"
              :value="stats.services"
            >
              <template #prefix>
                <ApiOutlined style="color: #eb2f96;" />
              </template>
            </Statistic>
          </Card>
        </Col>
      </Row>
    </div>

    <!-- 集群状态卡片 -->
    <ClusterStatusCards />

    <!-- 资源健康状态和最近事件 -->
    <Row :gutter="[16, 16]" class="content-section">
      <Col :xs="24" :lg="12">
        <ResourceHealthStatus :cluster-id="currentClusterId" />
      </Col>
      <Col :xs="24" :lg="12">
        <RecentEvents :cluster-id="currentClusterId" />
      </Col>
    </Row>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.stats-section {
  width: 100%;
}

.stat-card {
  height: 100%;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.content-section {
  width: 100%;
}
</style>
