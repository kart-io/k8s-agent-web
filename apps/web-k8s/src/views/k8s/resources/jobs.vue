<script lang="ts" setup>
/**
 * Job 资源管理页面
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';
import type { Job } from '#/api/k8s/types';

import { computed } from 'vue';

import { Tag } from 'ant-design-vue';

import { createJobConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

defineOptions({ name: 'K8sJobs' });

// 使用配置工厂创建资源配置
const config = computed<ResourceListConfig<Job>>(() => createJobConfig());
</script>

<template>
  <ResourceList :config="config">
    <!-- 运行中状态插槽 -->
    <template #active-slot="{ row }">
      <Tag v-if="row.status?.active && row.status.active > 0" color="processing">
        {{ row.status.active }} 运行中
      </Tag>
      <Tag v-else-if="row.status?.succeeded && row.status.succeeded >= (row.spec.completions ?? 1)" color="success">
        已完成
      </Tag>
      <Tag v-else-if="row.status?.failed && row.status.failed > 0" color="error">
        已失败
      </Tag>
      <Tag v-else color="default">
        等待中
      </Tag>
    </template>
  </ResourceList>
</template>
