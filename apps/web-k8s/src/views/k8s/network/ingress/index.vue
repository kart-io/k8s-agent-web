<script lang="ts" setup>
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue';
/**
 * Ingress 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~102 行减少到 ~35 行
 */
import { Tag } from 'ant-design-vue';

import { createIngressConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sIngress' });
</script>

<template>
  <GenericResourcePage :config-factory="createIngressConfig">
    <!-- 自定义插槽：主机/域名列表显示 -->
    <template #hosts-slot="{ row }">
      <span>
        {{
          row.spec?.rules
            ?.map((r) => r.host)
            .filter(Boolean)
            .join(', ') || '-'
        }}
      </span>
    </template>

    <!-- 自定义插槽：TLS 状态显示 -->
    <template #tls-slot="{ row }">
      <Tag v-if="row.spec?.tls && row.spec.tls.length > 0" color="success">
        <CheckCircleOutlined />
      </Tag>
      <Tag v-else color="default">
        <CloseCircleOutlined />
      </Tag>
    </template>

    <!-- 自定义插槽：LoadBalancer IP/Hostname 显示 -->
    <template #lb-slot="{ row }">
      <span>
        {{
          row.status?.loadBalancer?.ingress?.[0]?.ip ||
          row.status?.loadBalancer?.ingress?.[0]?.hostname ||
          '-'
        }}
      </span>
    </template>
  </GenericResourcePage>
</template>
