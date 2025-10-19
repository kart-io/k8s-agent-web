<script lang="ts" setup>
/**
 * 存储容量统计组件
 * 显示存储容量、PV/PVC 统计信息
 */
import { computed, h, onMounted, ref } from 'vue';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue';
import { Alert, Card, Col, Progress, Row, Statistic } from 'ant-design-vue';

import { pvApi, pvcApi } from '#/api/k8s';

// 统计数据
const stats = ref({
  // 容量统计
  totalCapacity: '0Ti',
  usedCapacity: '0Ti',
  availableCapacity: '0Ti',
  usagePercent: 0,

  // PV 统计
  pvCount: 0,
  pvBoundCount: 0,
  pvAvailableCount: 0,
  pvReleasedCount: 0,
  pvFailedCount: 0,

  // PVC 统计
  pvcCount: 0,
  pvcBoundCount: 0,
  pvcPendingCount: 0,
  pvcLostCount: 0,
});

const loading = ref(false);

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
 * 格式化容量
 */
function formatCapacity(bytes: number): string {
  const units = ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(1)}${units[unitIndex]}`;
}

/**
 * 加载统计数据
 */
async function loadStats() {
  loading.value = true;

  try {
    // 使用默认集群 ID，实际应用中应从 store 或 URL 参数获取
    const clusterId = 'cluster-prod-01';

    // 并行获取 PV 和 PVC 列表
    const [pvResult, pvcResult] = await Promise.all([
      pvApi
        .list({ clusterId, pageSize: 1000 })
        .catch(() => ({ items: [], total: 0 })),
      pvcApi
        .list({ clusterId, pageSize: 1000 })
        .catch(() => ({ items: [], total: 0 })),
    ]);

    const pvList = pvResult.items || [];
    const pvcList = pvcResult.items || [];

    // 计算 PV 统计
    stats.value.pvCount = pvList.length;
    stats.value.pvBoundCount = pvList.filter(
      (pv: any) => pv.status?.phase === 'Bound',
    ).length;
    stats.value.pvAvailableCount = pvList.filter(
      (pv: any) => pv.status?.phase === 'Available',
    ).length;
    stats.value.pvReleasedCount = pvList.filter(
      (pv: any) => pv.status?.phase === 'Released',
    ).length;
    stats.value.pvFailedCount = pvList.filter(
      (pv: any) => pv.status?.phase === 'Failed',
    ).length;

    // 计算 PVC 统计
    stats.value.pvcCount = pvcList.length;
    stats.value.pvcBoundCount = pvcList.filter(
      (pvc: any) => pvc.status?.phase === 'Bound',
    ).length;
    stats.value.pvcPendingCount = pvcList.filter(
      (pvc: any) => pvc.status?.phase === 'Pending',
    ).length;
    stats.value.pvcLostCount = pvcList.filter(
      (pvc: any) => pvc.status?.phase === 'Lost',
    ).length;

    // 计算容量统计
    let totalCapacityBytes = 0;
    let usedCapacityBytes = 0;

    pvList.forEach((pv: any) => {
      const capacity = pv.spec?.capacity?.storage;
      if (capacity) {
        const bytes = parseCapacity(capacity);
        totalCapacityBytes += bytes;
        if (pv.status?.phase === 'Bound') {
          usedCapacityBytes += bytes;
        }
      }
    });

    stats.value.totalCapacity = formatCapacity(totalCapacityBytes);
    stats.value.usedCapacity = formatCapacity(usedCapacityBytes);
    stats.value.availableCapacity = formatCapacity(
      totalCapacityBytes - usedCapacityBytes,
    );
    stats.value.usagePercent =
      totalCapacityBytes > 0
        ? Math.round((usedCapacityBytes / totalCapacityBytes) * 100)
        : 0;
  } catch (error) {
    console.error('Failed to load storage stats:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 解析 K8s 容量字符串（如 "10Gi", "500Mi"）为字节数
 */
function parseCapacity(capacity: string): number {
  const match = capacity.match(/^(\d+(?:\.\d+)?)(.*)?$/);
  if (!match) return 0;

  const value = Number.parseFloat(match[1]);
  const unit = match[2] || '';

  const units: Record<string, number> = {
    '': 1,
    Ki: 1024,
    Mi: 1024 ** 2,
    Gi: 1024 ** 3,
    Ti: 1024 ** 4,
    Pi: 1024 ** 5,
    K: 1000,
    M: 1000 ** 2,
    G: 1000 ** 3,
    T: 1000 ** 4,
    P: 1000 ** 5,
  };

  return value * (units[unit] || 1);
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
    <Alert
      v-if="stats.usagePercent >= 80"
      :type="stats.usagePercent >= 90 ? 'error' : 'warning'"
      :message="
        stats.usagePercent >= 90
          ? '存储使用率过高！'
          : '存储使用率较高，请注意监控'
      "
      :description="`当前使用率为 ${stats.usagePercent}%，${stats.usagePercent >= 90 ? '建议立即清理或扩容' : '建议及时清理不必要的数据'}`"
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
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--vben-text-color-secondary);
}

:deep(.ant-statistic-content) {
  font-size: 24px;
  font-weight: 600;
}
</style>
