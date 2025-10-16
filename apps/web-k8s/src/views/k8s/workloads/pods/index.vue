<script lang="ts" setup>
/**
 * Pod 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~180 行减少到 ~30 行
 *
 * 性能优化:
 * - LogDrawer 懒加载，仅在用户打开日志时才加载组件
 */
import { defineAsyncComponent, ref } from 'vue';

import { Tag } from 'ant-design-vue';

import { createPodConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

// 懒加载 LogDrawer 组件
const LogDrawer = defineAsyncComponent(() => import('./LogDrawer.vue'));

defineOptions({ name: 'K8sPods' });

// 日志抽屉状态
const logDrawerVisible = ref(false);
const selectedPod = ref<any>(null);
const currentClusterId = ref('cluster-prod-01');

/**
 * 打开日志抽屉
 */
function openLogDrawer(pod: any) {
  selectedPod.value = pod;
  logDrawerVisible.value = true;
}

// 修改配置工厂，添加日志操作
function createPodConfigWithLogs() {
  const config = createPodConfig();

  // 在 view 操作之后插入 logs 操作
  const viewIndex = config.actions?.findIndex(a => a.action === 'view') ?? -1;
  if (viewIndex >= 0 && config.actions) {
    config.actions.splice(viewIndex + 1, 0, {
      action: 'logs',
      label: '日志',
      handler: (pod: any) => {
        currentClusterId.value = 'cluster-prod-01'; // TODO: 从上下文获取
        openLogDrawer(pod);
      },
    });
  }

  return config;
}
</script>

<template>
  <div>
    <GenericResourcePage :config-factory="createPodConfigWithLogs">
      <!-- 自定义插槽：状态显示 -->
      <template #status-slot="{ row }">
        <Tag :color="row.status?.phase === 'Running' ? 'success' : row.status?.phase === 'Pending' ? 'warning' : row.status?.phase === 'Failed' ? 'error' : 'default'">
          {{ row.status?.phase || 'Unknown' }}
        </Tag>
      </template>
    </GenericResourcePage>

    <!-- 日志抽屉 -->
    <LogDrawer
      v-model:visible="logDrawerVisible"
      :pod="selectedPod"
      :cluster-id="currentClusterId"
    />
  </div>
</template>
