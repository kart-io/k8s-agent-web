<script lang="ts" setup>
/**
 * CronJob 管理页面
 * 使用资源配置工厂
 */
import { computed } from 'vue';

import { Tag } from 'ant-design-vue';

import { createCronJobConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

defineOptions({
  name: 'CronJobsManagement',
});

const config = computed(() => createCronJobConfig());
</script>

<template>
  <ResourceList :config="config">
    <!-- 暂停状态 -->
    <template #suspend-slot="{ row }">
      <Tag :color="row.spec.suspend ? 'default' : 'success'">
        {{ row.spec.suspend ? '已暂停' : '运行中' }}
      </Tag>
    </template>
  </ResourceList>
</template>
