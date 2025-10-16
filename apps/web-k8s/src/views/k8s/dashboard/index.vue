<script lang="ts" setup>
/**
 * Kubernetes Dashboard 总览页面
 * 展示集群的整体状态和快速访问入口
 */
import { onMounted, ref } from 'vue';

import {
  ApiOutlined,
  CloudServerOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  FolderOutlined,
  RocketOutlined,
} from '@ant-design/icons-vue';
import { Card, Col, message, Row, Statistic } from 'ant-design-vue';

import {
  getMockClusterList,
  getMockDeploymentList,
  getMockNamespaceList,
  getMockNodeList,
  getMockPodList,
  getMockServiceList,
} from '#/api/k8s/mock';

import ClusterHealthScore from './components/ClusterHealthScore.vue';
import ClusterStatusCards from './components/ClusterStatusCards.vue';
import ProblemResources from './components/ProblemResources.vue';
import RecentEvents from './components/RecentEvents.vue';
import ResourceHealthStatus from './components/ResourceHealthStatus.vue';
import ResourceTrendChart from './components/ResourceTrendChart.vue';

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
    // 使用 Promise.allSettled 进行错误隔离
    // 即使某些请求失败，其他成功的数据仍然可以显示
    const results = await Promise.allSettled([
      getMockClusterList({ pageSize: 1 }),
      getMockNodeList({ clusterId: currentClusterId.value, pageSize: 1 }),
      getMockNamespaceList({ clusterId: currentClusterId.value, pageSize: 1 }),
      getMockPodList({ clusterId: currentClusterId.value, pageSize: 1 }),
      getMockDeploymentList({ clusterId: currentClusterId.value, pageSize: 1 }),
      getMockServiceList({ clusterId: currentClusterId.value, pageSize: 1 }),
    ]);

    // 提取成功的数据，失败的显示为 0
    stats.value = {
      clusters: results[0].status === 'fulfilled' ? results[0].value.total : 0,
      nodes: results[1].status === 'fulfilled' ? results[1].value.total : 0,
      namespaces:
        results[2].status === 'fulfilled' ? results[2].value.total : 0,
      pods: results[3].status === 'fulfilled' ? results[3].value.total : 0,
      deployments:
        results[4].status === 'fulfilled' ? results[4].value.total : 0,
      services: results[5].status === 'fulfilled' ? results[5].value.total : 0,
    };

    // 记录失败的请求（便于调试）
    const failedRequests = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'rejected');

    if (failedRequests.length > 0) {
      const resourceNames = [
        '集群',
        '节点',
        '命名空间',
        'Pod',
        'Deployment',
        'Service',
      ];
      failedRequests.forEach(({ result, index }) => {
        console.warn(
          `加载 ${resourceNames[index]} 统计数据失败:`,
          result.status === 'rejected' ? result.reason : '',
        );
      });

      // 如果有失败的请求，显示提示信息
      const failedResourceNames = failedRequests.map(
        ({ index }) => resourceNames[index],
      );
      message.warning(
        `部分数据加载失败: ${failedResourceNames.join('、')}，其他数据已正常显示`,
      );
    }
  } catch (error: any) {
    // 这里只会捕获 Promise.allSettled 本身的错误（非常罕见）
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
            <Statistic title="集群总数" :value="stats.clusters">
              <template #prefix>
                <ClusterOutlined style="color: #1890ff" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic title="节点总数" :value="stats.nodes">
              <template #prefix>
                <CloudServerOutlined style="color: #52c41a" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic title="命名空间" :value="stats.namespaces">
              <template #prefix>
                <FolderOutlined style="color: #722ed1" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic title="Pod 总数" :value="stats.pods">
              <template #prefix>
                <DatabaseOutlined style="color: #13c2c2" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic title="Deployments" :value="stats.deployments">
              <template #prefix>
                <RocketOutlined style="color: #fa8c16" />
              </template>
            </Statistic>
          </Card>
        </Col>

        <Col :xs="24" :sm="12" :md="8" :lg="8" :xl="4">
          <Card :loading="loading" class="stat-card">
            <Statistic title="Services" :value="stats.services">
              <template #prefix>
                <ApiOutlined style="color: #eb2f96" />
              </template>
            </Statistic>
          </Card>
        </Col>
      </Row>
    </div>

    <!-- 集群状态卡片 -->
    <ClusterStatusCards />

    <!-- 集群健康度评分和问题资源 -->
    <Row :gutter="[16, 16]" class="content-section">
      <Col :xs="24" :lg="12">
        <ClusterHealthScore :cluster-id="currentClusterId" />
      </Col>
      <Col :xs="24" :lg="12">
        <ProblemResources :cluster-id="currentClusterId" />
      </Col>
    </Row>

    <!-- 资源使用趋势图表 -->
    <Row :gutter="[16, 16]" class="content-section">
      <Col :xs="24">
        <ResourceTrendChart :cluster-id="currentClusterId" />
      </Col>
    </Row>

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
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  transform: translateY(-4px);
}

.content-section {
  width: 100%;
}
</style>
