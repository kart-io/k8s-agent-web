<script lang="ts" setup>
/**
 * Job 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~165 行减少到 ~40 行
 */
import { defineAsyncComponent, ref } from 'vue';

import { Tag } from 'ant-design-vue';

import { createJobConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sJobs' });

// 懒加载 LogDrawer 组件（复用 Pod 的日志抽屉）
const LogDrawer = defineAsyncComponent(
  () => import('#/views/k8s/workloads/pods/LogDrawer.vue'),
);

// 日志抽屉状态
const logDrawerVisible = ref(false);
const selectedJob = ref<any>(null);
const currentClusterId = ref('cluster-prod-01');

/**
 * 打开日志抽屉
 */
function openLogDrawer(job: any) {
  selectedJob.value = job;
  logDrawerVisible.value = true;
}

// 修改配置工厂，替换日志操作的处理器
function createJobConfigWithLogs() {
  const config = createJobConfig();

  // 找到现有的 logs 操作并替换其处理器
  const logsAction = config.actions?.find((a) => a.action === 'logs');
  if (logsAction) {
    logsAction.handler = (job: any) => {
      currentClusterId.value = 'cluster-prod-01'; // TODO: 从上下文获取
      openLogDrawer(job);
    };
  }

  return config;
}
</script>

<template>
  <div>
    <GenericResourcePage :config-factory="createJobConfigWithLogs">
      <!-- 自定义插槽：运行状态显示 -->
      <template #active-slot="{ row }">
        <Tag
          v-if="row.status?.active && row.status.active > 0"
          color="processing"
        >
          {{ row.status.active }} 运行中
        </Tag>
        <Tag
          v-else-if="
            row.status?.succeeded &&
            row.status.succeeded >= (row.spec.completions ?? 1)
          "
          color="success"
        >
          已完成
        </Tag>
        <Tag
          v-else-if="row.status?.failed && row.status.failed > 0"
          color="error"
        >
          已失败
        </Tag>
        <Tag v-else color="default"> 等待中 </Tag>
      </template>
    </GenericResourcePage>

    <!-- 日志抽屉 -->
    <LogDrawer
      v-model:visible="logDrawerVisible"
      :pod="selectedJob"
      :cluster-id="currentClusterId"
    />
  </div>
</template>
