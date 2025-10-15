<script lang="ts" setup>
/**
 * CronJob 管理页面
 * 使用资源配置工厂
 */
import type { CronJob } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { message, Modal, Tag } from 'ant-design-vue';

import { createCronJobConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

import DetailDrawer from './DetailDrawer.vue';

defineOptions({
  name: 'CronJobsManagement',
});

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedCronJob = ref<CronJob | null>(null);

// 列表引用（用于刷新）
const resourceListRef = ref();

/**
 * 打开详情抽屉
 */
function openDetailDrawer(cronJob: CronJob) {
  selectedCronJob.value = cronJob;
  detailDrawerVisible.value = true;
}

/**
 * 处理 CronJob 暂停/启用切换
 * 通过切换 spec.suspend 字段实现
 */
function handleToggleSuspend(cronJob: CronJob) {
  const action = cronJob.spec.suspend ? '启用' : '暂停';
  const newSuspend = !cronJob.spec.suspend;

  Modal.confirm({
    title: `确认${action}`,
    content: `确定要${action} CronJob "${cronJob.metadata.name}" 吗？${
      newSuspend ? '暂停后将不再按计划创建新的 Job。' : '启用后将恢复按计划创建 Job。'
    }`,
    onOk: async () => {
      try {
        // TODO: 调用真实 API 更新 suspend 字段
        // 实际的 API 调用应该是：
        // await patchCronJob(
        //   cronJob.metadata.namespace,
        //   cronJob.metadata.name,
        //   {
        //     spec: {
        //       suspend: newSuspend
        //     }
        //   }
        // );

        message.success(`CronJob "${cronJob.metadata.name}" 已${action}`);

        // 刷新列表
        resourceListRef.value?.refresh();
      } catch (error: any) {
        message.error(`${action}失败: ${error.message}`);
      }
    },
  });
}

const config = computed(() => {
  const baseConfig = createCronJobConfig();

  // 覆盖 view 操作，使用详情抽屉
  // 覆盖 edit 操作（暂停/启用），使用自定义逻辑
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

    const editActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'edit',
    );
    if (editActionIndex !== -1) {
      baseConfig.actions[editActionIndex] = {
        action: 'edit',
        label: (row: CronJob) => (row.spec.suspend ? '启用' : '暂停'),
        handler: (row: CronJob) => {
          handleToggleSuspend(row);
        },
      };
    }
  }

  return baseConfig;
});
</script>

<template>
  <div>
    <ResourceList ref="resourceListRef" :config="config">
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
