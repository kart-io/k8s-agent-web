<script lang="ts" setup>
/**
 * CronJob 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~128 行减少到 ~20 行
 */
import { Tag } from 'ant-design-vue';

import { createCronJobConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sCronJobs' });
</script>

<template>
  <GenericResourcePage :config-factory="createCronJobConfig">
    <!-- 自定义插槽：暂停状态显示 -->
    <template #suspend-slot="{ row }">
      <Tag :color="row.spec.suspend ? 'default' : 'success'">
        {{ row.spec.suspend ? '已暂停' : '运行中' }}
      </Tag>
    </template>
  </GenericResourcePage>
</template>
