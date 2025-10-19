<script lang="ts" setup>
/**
 * PriorityClass 资源管理页面 - 使用通用页面模板
 */
import { Descriptions, Tag } from 'ant-design-vue';

import { createPriorityClassConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/_shared/GenericResourcePage.vue';
import GenericDetailDrawer from '#/views/k8s/resources/detail/GenericDetailDrawer.vue';

defineOptions({ name: 'K8sPriorityClasses' });
</script>

<template>
  <GenericResourcePage
    :config-factory="createPriorityClassConfig"
    :detail-component="GenericDetailDrawer"
  >
    <!-- 自定义插槽：默认标记显示 -->
    <template #default-slot="{ row }">
      <Tag :color="row.globalDefault ? 'green' : 'default'">
        {{ row.globalDefault ? '是' : '否' }}
      </Tag>
    </template>

    <!-- 详情抽屉：资源特定字段 -->
    <template #resource-specific="{ resource }">
      <Descriptions.Item label="优先级值" :span="2">
        {{ resource.value }}
      </Descriptions.Item>
      <Descriptions.Item label="全局默认" :span="2">
        <Tag :color="resource.globalDefault ? 'green' : 'default'">
          {{ resource.globalDefault ? '是' : '否' }}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="抢占策略" :span="2">
        {{ resource.preemptionPolicy || 'PreemptLowerPriority' }}
      </Descriptions.Item>
      <Descriptions.Item label="描述" :span="2">
        {{ resource.description || '-' }}
      </Descriptions.Item>
    </template>
  </GenericResourcePage>
</template>
