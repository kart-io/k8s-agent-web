<script lang="ts" setup>
/**
 * Namespace 资源管理页面 - 使用通用页面模板
 */
import { Descriptions } from 'ant-design-vue';

import { createNamespaceConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/_shared/GenericResourcePage.vue';
import GenericDetailDrawer from '#/views/k8s/resources/detail/GenericDetailDrawer.vue';

defineOptions({ name: 'K8sNamespaces' });
</script>

<template>
  <GenericResourcePage :config-factory="createNamespaceConfig" :detail-component="GenericDetailDrawer">
    <!-- 详情抽屉：资源特定字段 -->
    <template #resource-specific="{ resource }">
      <Descriptions.Item label="环境" :span="2">
        {{ resource.metadata?.labels?.environment || '-' }}
      </Descriptions.Item>
    </template>
  </GenericResourcePage>
</template>
