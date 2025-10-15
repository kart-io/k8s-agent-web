<script lang="ts" setup>
/**
 * 存储概览页面
 * 显示存储资源的统计信息和图表
 */
import { onMounted, ref } from 'vue';

import { Card, Col, Row, Spin } from 'ant-design-vue';

import CapacityStats from './components/CapacityStats.vue';
import NamespaceUsage from './components/NamespaceUsage.vue';
import RecentBindings from './components/RecentBindings.vue';
import StorageClassDistribution from './components/StorageClassDistribution.vue';

// 加载状态
const loading = ref(true);

/**
 * 加载概览数据
 */
async function loadOverviewData() {
  loading.value = true;
  try {
    // TODO: 调用 API 获取存储统计数据
    // 目前使用 Mock 数据
    await new Promise((resolve) => setTimeout(resolve, 500));
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadOverviewData();
});
</script>

<template>
  <div class="storage-overview-page">
    <Spin :spinning="loading">
      <div class="overview-content">
        <!-- 容量统计卡片 -->
        <Card title="存储容量统计" class="overview-section">
          <CapacityStats />
        </Card>

        <!-- 分布图表区域 -->
        <Row :gutter="16" class="overview-section">
          <Col :xs="24" :lg="12">
            <Card title="按存储类分布" class="chart-card">
              <StorageClassDistribution />
            </Card>
          </Col>
          <Col :xs="24" :lg="12">
            <Card title="按命名空间使用情况" class="chart-card">
              <NamespaceUsage />
            </Card>
          </Col>
        </Row>

        <!-- 最近绑定列表 -->
        <Card title="最近绑定的 PV/PVC" class="overview-section">
          <RecentBindings />
        </Card>
      </div>
    </Spin>
  </div>
</template>

<style scoped>
.storage-overview-page {
  height: 100%;
  padding: 16px;
}

.overview-content {
  max-width: 1600px;
  margin: 0 auto;
}

.overview-section {
  margin-bottom: 16px;
}

.chart-card {
  height: 100%;
  min-height: 500px;
}

.chart-card :deep(.ant-card-body) {
  height: calc(100% - 57px);
  overflow-y: auto;
}
</style>
