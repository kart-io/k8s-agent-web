<script lang="ts" setup>
/**
 * NetworkPolicy 资源管理页面 - 使用通用页面模板
 */

import { Descriptions } from 'ant-design-vue';

import { createNetworkPolicyConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/_shared/GenericResourcePage.vue';
import GenericDetailDrawer from '#/views/k8s/resources/detail/GenericDetailDrawer.vue';

defineOptions({ name: 'K8sNetworkPolicies' });
</script>

<template>
  <GenericResourcePage
    :config-factory="createNetworkPolicyConfig"
    :detail-component="GenericDetailDrawer"
  >
    <!-- 详情抽屉：资源特定字段 -->
    <template #resource-specific="{ resource }">
      <Descriptions.Item label="策略类型" :span="2">
        {{ resource.spec?.policyTypes?.join(', ') || '-' }}
      </Descriptions.Item>
      <Descriptions.Item label="Ingress 规则" :span="2">
        {{
          resource.spec?.ingress && resource.spec.ingress.length > 0
            ? `${resource.spec.ingress.length} 条`
            : '无'
        }}
      </Descriptions.Item>
      <Descriptions.Item label="Egress 规则" :span="2">
        {{
          resource.spec?.egress && resource.spec.egress.length > 0
            ? `${resource.spec.egress.length} 条`
            : '无'
        }}
      </Descriptions.Item>
    </template>
  </GenericResourcePage>
</template>
