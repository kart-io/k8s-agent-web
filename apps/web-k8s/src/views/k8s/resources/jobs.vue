<script lang="ts" setup>
/**
 * Job 资源管理页面
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';
import type { Job, Pod } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { message, Tag } from 'ant-design-vue';

import { createJobConfig } from '#/config/k8s-resources';
import { getMockPodList } from '#/api/k8s/mock';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';
import LogDrawer from '#/views/k8s/workloads/pods/LogDrawer.vue';

import DetailDrawer from './JobDetailDrawer.vue';

defineOptions({ name: 'K8sJobs' });

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedJob = ref<Job | null>(null);

// 日志抽屉状态
const logDrawerVisible = ref(false);
const selectedPod = ref<null | Pod>(null);
const currentClusterId = ref('cluster-prod-01');

// 列表引用（用于刷新）
const resourceListRef = ref();

/**
 * 打开详情抽屉
 */
function openDetailDrawer(job: Job) {
  selectedJob.value = job;
  detailDrawerVisible.value = true;
}

/**
 * 获取 Job 关联的 Pods
 * 在实际应用中，应该通过 API 根据 Job 的 label selector 获取
 */
async function getJobPods(job: Job): Promise<Pod[]> {
  // TODO: 调用真实 API 获取 Job 的 Pods
  // 实际的 API 调用应该是：
  // const response = await listPods({
  //   clusterId: currentClusterId.value,
  //   namespace: job.metadata.namespace,
  //   labelSelector: `job-name=${job.metadata.name}`
  // });
  // return response.items;

  // 模拟：从 Mock 数据中筛选出属于该 Job 的 Pods
  const allPods = getMockPodList({
    clusterId: currentClusterId.value,
    namespace: job.metadata.namespace,
  });

  // 简单的模拟逻辑：假设 Pod 名称包含 Job 名称
  return allPods.items.filter((pod) =>
    pod.metadata.name.startsWith(job.metadata.name),
  );
}

/**
 * 打开 Job 日志查看
 * 获取 Job 的第一个 Pod 并显示其日志
 */
async function handleViewLogs(job: Job) {
  try {
    const pods = await getJobPods(job);

    if (pods.length === 0) {
      message.warning(`Job "${job.metadata.name}" 没有关联的 Pod`);
      return;
    }

    // 使用第一个 Pod 的日志
    // 在实际应用中，如果有多个 Pod，可以显示选择器让用户选择
    selectedPod.value = pods[0];
    logDrawerVisible.value = true;

    if (pods.length > 1) {
      message.info(`该 Job 有 ${pods.length} 个 Pod，当前显示第一个 Pod 的日志`);
    }
  } catch (error: any) {
    message.error(`获取 Job Pods 失败: ${error.message}`);
  }
}

// 使用配置工厂创建资源配置，并覆盖 view 和 logs 操作
const config = computed<ResourceListConfig<Job>>(() => {
  const baseConfig = createJobConfig();

  // 覆盖 view 操作，使用详情抽屉
  // 覆盖 logs 操作
  if (baseConfig.actions) {
    const viewActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'view',
    );
    if (viewActionIndex !== -1) {
      baseConfig.actions[viewActionIndex] = {
        action: 'view',
        label: '详情',
        handler: (row: Job) => {
          openDetailDrawer(row);
        },
      };
    }

    const logsActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'logs',
    );
    if (logsActionIndex !== -1) {
      baseConfig.actions[logsActionIndex] = {
        action: 'logs',
        label: '日志',
        handler: (row: Job) => {
          handleViewLogs(row);
        },
      };
    }
  }

  return baseConfig;
});
</script>

<template>
  <div>
    <ResourceList ref="resourceListRef" :config="config">
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

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :job="selectedJob"
    />

    <!-- 日志抽屉 -->
    <LogDrawer
      v-model:visible="logDrawerVisible"
      :pod="selectedPod"
      :cluster-id="currentClusterId"
    />
  </div>
</template>
