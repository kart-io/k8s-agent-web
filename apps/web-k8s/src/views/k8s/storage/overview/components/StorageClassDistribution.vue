<script lang="ts" setup>
/**
 * 存储类分布组件
 * 按存储类显示 PV 的分布情况
 */
import { computed, h, onMounted, ref } from 'vue';

import { DatabaseOutlined } from '@ant-design/icons-vue';
import { Progress, Statistic, Tag, Tooltip } from 'ant-design-vue';

// Mock 存储类分布数据
const storageClassData = ref<
  Array<{
    capacity: string;
    color: string;
    count: number;
    name: string;
  }>
>([
  {
    name: 'standard',
    count: 45,
    capacity: '2.5Ti',
    color: '#1890ff',
  },
  {
    name: 'fast-ssd',
    count: 38,
    capacity: '3.8Ti',
    color: '#52c41a',
  },
  {
    name: 'slow-hdd',
    count: 30,
    capacity: '2.1Ti',
    color: '#faad14',
  },
  {
    name: 'nfs-storage',
    count: 22,
    capacity: '1.2Ti',
    color: '#13c2c2',
  },
  {
    name: 'local-storage',
    count: 15,
    capacity: '0.4Ti',
    color: '#722ed1',
  },
]);

/**
 * 总 PV 数量
 */
const totalCount = computed(() => {
  return storageClassData.value.reduce((sum, item) => sum + item.count, 0);
});

/**
 * 计算百分比
 */
function getPercentage(count: number): number {
  return Math.round((count / totalCount.value) * 100);
}

/**
 * 加载分布数据
 */
async function loadDistribution() {
  // TODO: 调用 API 获取真实数据
  // 目前使用 Mock 数据
}

onMounted(() => {
  loadDistribution();
});
</script>

<template>
  <div class="storage-class-distribution">
    <div class="distribution-header">
      <Statistic
        title="存储类总数"
        :value="storageClassData.length"
        :prefix="h(DatabaseOutlined)"
        :value-style="{ fontSize: '20px' }"
      />
      <Statistic
        title="PV 总数"
        :value="totalCount"
        :value-style="{ fontSize: '20px', color: '#1890ff' }"
      />
    </div>

    <div class="distribution-list">
      <div
        v-for="item in storageClassData"
        :key="item.name"
        class="distribution-item"
      >
        <div class="item-header">
          <div class="item-info">
            <Tag :color="item.color" class="item-name">
              {{ item.name }}
            </Tag>
            <span class="item-capacity">{{ item.capacity }}</span>
          </div>
          <Tooltip
            :title="`${item.count} 个 PV (${getPercentage(item.count)}%)`"
          >
            <span class="item-count">{{ item.count }}</span>
          </Tooltip>
        </div>
        <Progress
          :percent="getPercentage(item.count)"
          :stroke-color="item.color"
          :show-info="false"
          class="item-progress"
        />
        <div class="item-percentage">{{ getPercentage(item.count) }}%</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.storage-class-distribution {
  width: 100%;
}

.distribution-header {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  margin-bottom: 24px;
  background-color: var(--vben-background-color);
  border-bottom: 1px solid var(--vben-border-color);
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.distribution-item {
  padding: 16px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.distribution-item:hover {
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

.item-name {
  padding: 4px 12px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.item-capacity {
  font-size: 13px;
  color: var(--vben-text-color-secondary);
}

.item-count {
  font-size: 18px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.item-progress {
  margin-bottom: 8px;
}

.item-percentage {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
  text-align: right;
}

:deep(.ant-progress-inner) {
  height: 12px !important;
  border-radius: 6px;
}

:deep(.ant-progress-bg) {
  height: 12px !important;
  border-radius: 6px;
}
</style>
