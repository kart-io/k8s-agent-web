<script lang="ts" setup>
/**
 * PriorityClass 资源管理页面 - 使用通用页面模板
 */
import { Tag } from 'ant-design-vue';

import { createPriorityClassConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/_shared/GenericResourcePage.vue';

defineOptions({ name: 'K8sPriorityClasses' });
</script>

<template>
  <GenericResourcePage :config-factory="createPriorityClassConfig">
    <!-- 自定义插槽：默认标记显示 -->
    <template #default-slot="{ row }">
      <Tag :color="row.globalDefault ? 'green' : 'default'">
        {{ row.globalDefault ? '是' : '否' }}
      </Tag>
    </template>
  </GenericResourcePage>
</template>
