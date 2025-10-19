<script lang="ts" setup>
/**
 * 命名空间存储使用组件
 * 显示各命名空间的存储使用情况
 */
import { computed, onMounted, ref } from 'vue';

import { Progress, Tag, Tooltip } from 'ant-design-vue';

// Mock 命名空间使用数据
const namespaceData = ref<
  Array<{
    color: string;
    name: string;
    pvcCount: number;
    usedBytes: number;
    usedCapacity: string;
  }>
>([
  {
    name: 'production',
    pvcCount: 42,
    usedCapacity: '2.8Ti',
    usedBytes: 2.8 * 1024,
    color: '#f5222d',
  },
  {
    name: 'staging',
    pvcCount: 28,
    usedCapacity: '1.9Ti',
    usedBytes: 1.9 * 1024,
    color: '#fa8c16',
  },
  {
    name: 'development',
    pvcCount: 35,
    usedCapacity: '1.5Ti',
    usedBytes: 1.5 * 1024,
    color: '#1890ff',
  },
  {
    name: 'default',
    pvcCount: 18,
    usedCapacity: '0.6Ti',
    usedBytes: 0.6 * 1024,
    color: '#52c41a',
  },
  {
    name: 'kube-system',
    pvcCount: 12,
    usedCapacity: '0.4Ti',
    usedBytes: 0.4 * 1024,
    color: '#722ed1',
  },
]);

/**
 * 总使用容量（以 GB 为单位）
 */
const totalUsed = computed(() => {
  return namespaceData.value.reduce((sum, item) => sum + item.usedBytes, 0);
});

/**
 * 总 PVC 数量
 */
const totalPVC = computed(() => {
  return namespaceData.value.reduce((sum, item) => sum + item.pvcCount, 0);
});

/**
 * 计算使用百分比
 */
function getPercentage(usedBytes: number): number {
  return Math.round((usedBytes / totalUsed.value) * 100);
}

/**
 * 获取使用状态颜色
 */
function getStatusColor(percentage: number): string {
  if (percentage >= 30) return '#f5222d';
  if (percentage >= 20) return '#fa8c16';
  return '#52c41a';
}

/**
 * 加载命名空间使用数据
 */
async function loadNamespaceUsage() {
  // TODO: 调用 API 获取真实数据
  // 目前使用 Mock 数据
}

onMounted(() => {
  loadNamespaceUsage();
});
</script>

<template>
  <div class="namespace-usage">
    <div class="usage-summary">
      <div class="summary-item">
        <div class="summary-label">命名空间总数</div>
        <div class="summary-value">{{ namespaceData.length }}</div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="summary-label">PVC 总数</div>
        <div class="summary-value primary">{{ totalPVC }}</div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="summary-label">总使用量</div>
        <div class="summary-value success">
          {{ (totalUsed / 1024).toFixed(1) }}Ti
        </div>
      </div>
    </div>

    <div class="usage-list">
      <div v-for="item in namespaceData" :key="item.name" class="usage-item">
        <div class="item-header">
          <div class="item-info">
            <Tag :color="item.color" class="namespace-tag">
              {{ item.name }}
            </Tag>
            <Tooltip :title="`${item.pvcCount} 个 PVC`">
              <span class="pvc-count">{{ item.pvcCount }} PVC</span>
            </Tooltip>
          </div>
          <div class="item-capacity">
            <span class="capacity-value">{{ item.usedCapacity }}</span>
            <span class="capacity-percentage">
              ({{ getPercentage(item.usedBytes) }}%)
            </span>
          </div>
        </div>
        <Progress
          :percent="getPercentage(item.usedBytes)"
          :stroke-color="getStatusColor(getPercentage(item.usedBytes))"
          :show-info="false"
          class="usage-progress"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.namespace-usage {
  width: 100%;
}

.usage-summary {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20px;
  margin-bottom: 24px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.summary-label {
  font-size: 13px;
  color: var(--vben-text-color-secondary);
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.summary-value.primary {
  color: #1890ff;
}

.summary-value.success {
  color: #52c41a;
}

.summary-divider {
  width: 1px;
  height: 40px;
  background-color: var(--vben-border-color);
}

.usage-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.usage-item {
  padding: 16px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.usage-item:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  transform: translateY(-2px);
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.item-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.namespace-tag {
  padding: 4px 12px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.pvc-count {
  font-size: 13px;
  color: var(--vben-text-color-secondary);
}

.item-capacity {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.capacity-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.capacity-percentage {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.usage-progress {
  margin-top: 8px;
}

:deep(.ant-progress-inner) {
  height: 10px !important;
  border-radius: 5px;
}

:deep(.ant-progress-bg) {
  height: 10px !important;
  border-radius: 5px;
}
</style>
