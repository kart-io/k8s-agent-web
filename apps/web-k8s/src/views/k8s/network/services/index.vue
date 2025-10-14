<script lang="ts" setup>
/**
 * Service 管理页面
 * 使用资源配置工厂，代码从 304 行减少到 ~45 行
 */
import { computed } from 'vue';

import { Tag } from 'ant-design-vue';

import { createServiceConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

defineOptions({
  name: 'ServicesManagement',
});

const config = computed(() => createServiceConfig());
</script>

<template>
  <ResourceList :config="config">
    <!-- Service 类型标签 -->
    <template #type-slot="{ row }">
      <Tag :color="row.spec.type === 'ClusterIP' ? 'blue' : 'green'">
        {{ row.spec.type }}
      </Tag>
    </template>

    <!-- 端口列表 -->
    <template #ports-slot="{ row }">
      <span>{{ row.spec.ports.map((p) => `${p.port}:${p.targetPort}`).join(', ') }}</span>
    </template>
  </ResourceList>
</template>
