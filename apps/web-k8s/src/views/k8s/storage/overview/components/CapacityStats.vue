<script lang="ts" setup>
/**
 * 存储容量统计组件
 * 显示存储容量、PV/PVC 统计信息
 */
import { computed, h, onMounted, ref } from 'vue';

import { Card, Col, Progress, Row, Statistic } from 'ant-design-vue';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue';

// Mock 统计数据
const stats = ref({
  // 容量统计
  totalCapacity: '10Ti',
  usedCapacity: '7.2Ti',
  availableCapacity: '2.8Ti',
  usagePercent: 72,

  // PV 统计
  pvCount: 150,
  pvBoundCount: 108,
  pvAvailableCount: 35,
  pvReleasedCount: 5,
  pvFailedCount: 2,

  // PVC 统计
  pvcCount: 200,
  pvcBoundCount: 108,
  pvcPendingCount: 85,
  pvcLostCount: 7,
});

/**
 * 使用率状态
 */
const usageStatus = computed(() => {
  const percent = stats.value.usagePercent;
  if (percent >= 90) return 'exception';
  if (percent >= 80) return 'normal';
  return 'success';
});

/**
 * 使用率颜色
 */
const usageColor = computed(() => {
  const percent = stats.value.usagePercent;
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 80) return '#faad14';
  return '#52c41a';
});

/**
 * 使用率图标
 */
const UsageIcon = computed(() => {
  const percent = stats.value.usagePercent;
  if (percent >= 90) return WarningOutlined;
  if (percent >= 80) return ClockCircleOutlined;
  return CheckCircleOutlined;
});

/**
 * 加载统计数据
 */
async function loadStats() {
  // TODO: 调用 API 获取真实数据
  // 目前使用 Mock 数据
}

onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="capacity-stats">
    <!-- 容量统计卡片 -->
    <Row :gutter="16" class="stats-row">
      <Col :xs="24" :sm="12" :md="6">
        <Card class="stat-card">
          <Statistic
            title="总容量"
            :value="stats.totalCapacity"
            :prefix="h(DatabaseOutlined)"
            :value-style="{ color: '#1890ff' }"
          />
        </Card>
      </Col>
      <Col :xs="24" :sm="12" :md="6">
        <Card class="stat-card">
          <Statistic
            title="已用容量"
            :value="stats.usedCapacity"
            :prefix="h(DatabaseOutlined)"
            :value-style="{ color: '#faad14' }"
          />
        </Card>
      </Col>
      <Col :xs="24" :sm="12" :md="6">
        <Card class="stat-card">
          <Statistic
            title="可用容量"
            :value="stats.availableCapacity"
            :prefix="h(DatabaseOutlined)"
            :value-style="{ color: '#52c41a' }"
          />
        </Card>
      </Col>
      <Col :xs="24" :sm="12" :md="6">
        <Card class="stat-card usage-card">
          <Statistic
            title="使用率"
            :value="stats.usagePercent"
            suffix="%"
            :prefix="h(UsageIcon)"
            :value-style="{ color: usageColor }"
          />
          <Progress
            :percent="stats.usagePercent"
            :status="usageStatus"
            :stroke-color="usageColor"
            class="usage-progress"
          />
        </Card>
      </Col>
    </Row>

    <!-- PV 和 PVC 统计 -->
    <Row :gutter="16" class="stats-row">
      <Col :xs="24" :md="12">
        <Card title="PersistentVolume 统计" class="detail-card">
          <Row :gutter="16">
            <Col :span="12">
              <Statistic
                title="总数"
                :value="stats.pvCount"
                :value-style="{ fontSize: '20px' }"
              />
            </Col>
            <Col :span="12">
              <Statistic
                title="已绑定"
                :value="stats.pvBoundCount"
                :value-style="{ fontSize: '20px', color: '#52c41a' }"
              />
            </Col>
          </Row>
          <Row :gutter="16" style="margin-top: 16px">
            <Col :span="12">
              <Statistic
                title="可用"
                :value="stats.pvAvailableCount"
                :value-style="{ fontSize: '20px', color: '#1890ff' }"
              />
            </Col>
            <Col :span="12">
              <Statistic
                title="失败"
                :value="stats.pvFailedCount"
                :value-style="{ fontSize: '20px', color: '#ff4d4f' }"
              />
            </Col>
          </Row>
        </Card>
      </Col>

      <Col :xs="24" :md="12">
        <Card title="PersistentVolumeClaim 统计" class="detail-card">
          <Row :gutter="16">
            <Col :span="12">
              <Statistic
                title="总数"
                :value="stats.pvcCount"
                :value-style="{ fontSize: '20px' }"
              />
            </Col>
            <Col :span="12">
              <Statistic
                title="已绑定"
                :value="stats.pvcBoundCount"
                :value-style="{ fontSize: '20px', color: '#52c41a' }"
              />
            </Col>
          </Row>
          <Row :gutter="16" style="margin-top: 16px">
            <Col :span="12">
              <Statistic
                title="等待中"
                :value="stats.pvcPendingCount"
                :value-style="{ fontSize: '20px', color: '#faad14' }"
              />
            </Col>
            <Col :span="12">
              <Statistic
                title="丢失"
                :value="stats.pvcLostCount"
                :value-style="{ fontSize: '20px', color: '#ff4d4f' }"
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>

    <!-- 使用率告警 -->
    <a-alert
      v-if="stats.usagePercent >= 80"
      :type="stats.usagePercent >= 90 ? 'error' : 'warning'"
      :message="
        stats.usagePercent >= 90
          ? '存储使用率过高！'
          : '存储使用率较高，请注意监控'
      "
      :description="
        `当前使用率为 ${stats.usagePercent}%，${stats.usagePercent >= 90 ? '建议立即清理或扩容' : '建议及时清理不必要的数据'}`
      "
      show-icon
      class="usage-alert"
    />
  </div>
</template>

<style scoped>
.capacity-stats {
  width: 100%;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  height: 100%;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  transform: translateY(-2px);
}

.usage-card {
  position: relative;
}

.usage-progress {
  margin-top: 12px;
}

.detail-card {
  height: 100%;
}

.detail-card :deep(.ant-card-body) {
  padding: 20px;
}

.usage-alert {
  margin-top: 16px;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--vben-text-color-secondary);
}

:deep(.ant-statistic-content) {
  font-size: 24px;
  font-weight: 600;
}
</style>
