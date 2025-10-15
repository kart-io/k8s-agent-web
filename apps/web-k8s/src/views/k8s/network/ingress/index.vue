<script lang="ts" setup>
/**
 * Ingress 列表页面
 */
import type { Ingress } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { Tag } from 'ant-design-vue';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';

import { createIngressConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

import DetailDrawer from './DetailDrawer.vue';

defineOptions({
  name: 'IngressManagement',
});

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedIngress = ref<null | Ingress>(null);

/**
 * 打开详情抽屉
 */
function openDetailDrawer(ingress: Ingress) {
  selectedIngress.value = ingress;
  detailDrawerVisible.value = true;
}

const config = computed(() => {
  const baseConfig = createIngressConfig();

  // 覆盖 view 操作，使用详情抽屉
  if (baseConfig.actions) {
    const viewActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'view',
    );
    if (viewActionIndex !== -1) {
      baseConfig.actions[viewActionIndex] = {
        action: 'view',
        label: '详情',
        handler: (row: Ingress) => {
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
      <!-- 主机/域名列表 -->
      <template #hosts-slot="{ row }">
        <span>
          {{
            row.spec.rules
              ?.map((r) => r.host)
              .filter(Boolean)
              .join(', ') || '-'
          }}
        </span>
      </template>

      <!-- TLS 状态 -->
      <template #tls-slot="{ row }">
        <Tag
          v-if="row.spec.tls && row.spec.tls.length > 0"
          color="success"
        >
          <CheckCircleOutlined />
        </Tag>
        <Tag v-else color="default">
          <CloseCircleOutlined />
        </Tag>
      </template>

      <!-- LoadBalancer IP/Hostname -->
      <template #lb-slot="{ row }">
        <span>
          {{
            row.status?.loadBalancer?.ingress?.[0]?.ip ||
              row.status?.loadBalancer?.ingress?.[0]?.hostname ||
              '-'
          }}
        </span>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :ingress="selectedIngress"
    />
  </div>
</template>
