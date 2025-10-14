<script lang="ts" setup>
/**
 * CronJob 管理页面
 * 使用资源配置工厂
 */
import type { CronJob } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { Tag } from 'ant-design-vue';

import { createCronJobConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

import DetailDrawer from './DetailDrawer.vue';

defineOptions({
  name: 'CronJobsManagement',
});

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedCronJob = ref<CronJob | null>(null);

/**
 * 打开详情抽屉
 */
function openDetailDrawer(cronJob: CronJob) {
  selectedCronJob.value = cronJob;
  detailDrawerVisible.value = true;
}

const config = computed(() => {
  const baseConfig = createCronJobConfig();

  // 覆盖 view 操作，使用详情抽屉
  if (baseConfig.actions) {
    const viewActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'view',
    );
    if (viewActionIndex !== -1) {
      baseConfig.actions[viewActionIndex] = {
        action: 'view',
        label: '详情',
        handler: (row: CronJob) => {
          openDetailDrawer(row);
        },
      };
    }
  }

  return baseConfig;
});
</script>

<template>
  <div>
    <ResourceList :config="config">
      <!-- 暂停状态 -->
      <template #suspend-slot="{ row }">
        <Tag :color="row.spec.suspend ? 'default' : 'success'">
          {{ row.spec.suspend ? '已暂停' : '运行中' }}
        </Tag>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :cron-job="selectedCronJob"
    />
  </div>
</template>
