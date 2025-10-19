<script lang="ts" setup>
/**
 * 通用资源管理页面
 * 通过传入配置工厂函数，自动渲染任何 K8s 资源的完整管理页面
 *
 * 优势：
 * - 消除重复代码（每个资源页面从 100+ 行减少到 10-20 行）
 * - 统一的操作逻辑和用户体验
 * - 易于维护和扩展
 *
 * 性能优化：
 * - ScaleModal, YAMLEditorModal, GenericDetailDrawer 懒加载
 * - 仅在用户操作时才加载相应组件
 *
 * 使用示例：
 * <GenericResourcePage
 *   :config-factory="createDeploymentConfig"
 *   scalable
 *   :detail-component="DeploymentDetailDrawer"
 * >
 *   <template #ready-slot="{ row }">
 *     <Tag>{{ row.status.readyReplicas }}/{{ row.spec.replicas }}</Tag>
 *   </template>
 * </GenericResourcePage>
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';

import { computed, defineAsyncComponent, ref } from 'vue';

import { message } from 'ant-design-vue';

import AsyncError from '#/components/AsyncError.vue';
import AsyncLoading from '#/components/AsyncLoading.vue';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

const props = withDefaults(defineProps<Props>(), {
  scalable: false,
  enableDetail: true,
  enableYAMLEdit: true,
  detailComponent: undefined,
});

// 懒加载大型组件，减少初始加载时间，并添加加载和错误状态
const ScaleModal = defineAsyncComponent({
  loader: () => import('#/views/k8s/_shared/ScaleModal.vue'),
  loadingComponent: AsyncLoading,
  errorComponent: AsyncError,
  delay: 200, // 200ms 后显示 loading
  timeout: 10_000, // 10 秒超时
});

const YAMLEditorModal = defineAsyncComponent({
  loader: () => import('#/views/k8s/_shared/YAMLEditorModal.vue'),
  loadingComponent: AsyncLoading,
  errorComponent: AsyncError,
  delay: 200,
  timeout: 10_000,
});

const GenericDetailDrawer = defineAsyncComponent({
  loader: () => import('./detail/GenericDetailDrawer.vue'),
  loadingComponent: AsyncLoading,
  errorComponent: AsyncError,
  delay: 200,
  timeout: 10_000,
});

interface Props {
  /** 资源配置工厂函数 */
  configFactory: () => ResourceListConfig<any>;
  /** 是否支持扩缩容 */
  scalable?: boolean;
  /** 自定义详情组件（如不提供，使用通用详情抽屉） */
  detailComponent?: any;
  /** 是否启用详情查看（默认 true） */
  enableDetail?: boolean;
  /** 是否启用 YAML 编辑（默认 true） */
  enableYAMLEdit?: boolean;
}

// ==================== 状态管理 ====================

const resourceListRef = ref();
const yamlEditorVisible = ref(false);
const detailDrawerVisible = ref(false);
const scaleModalVisible = ref(false);
const currentResource = ref<any>(null);

// ==================== 配置 ====================

const config = computed(() => {
  const baseConfig = props.configFactory();

  // 自动覆盖操作处理器，提供统一的行为
  if (baseConfig.actions) {
    baseConfig.actions = baseConfig.actions.map((action) => {
      const newAction = { ...action };

      switch (action.action) {
        case 'edit': {
          if (props.enableYAMLEdit) {
            newAction.handler = openYAMLEditor;
          }
          break;
        }
        case 'scale': {
          if (props.scalable) {
            newAction.handler = openScaleModal;
          }
          break;
        }
        case 'view': {
          if (props.enableDetail) {
            newAction.handler = openDetail;
          }
          break;
        }
        // delete, restart 等其他操作保持原样
        default: {
          break;
        }
      }

      return newAction;
    });
  }

  return baseConfig;
});

// ==================== 操作处理器 ====================

/**
 * 打开详情抽屉
 */
function openDetail(resource: any) {
  currentResource.value = resource;
  detailDrawerVisible.value = true;
}

/**
 * 打开 YAML 编辑器
 */
function openYAMLEditor(resource: any) {
  currentResource.value = resource;
  yamlEditorVisible.value = true;
}

/**
 * 打开扩缩容模态框
 */
function openScaleModal(resource: any) {
  currentResource.value = resource;
  scaleModalVisible.value = true;
}

/**
 * 处理 YAML 编辑确认
 */
async function handleYAMLUpdate(updatedResource: any) {
  try {
    // TODO: 调用真实 API 更新资源
    // await updateK8sResource(
    //   config.value.resourceType,
    //   updatedResource.metadata.namespace,
    //   updatedResource.metadata.name,
    //   updatedResource
    // );

    message.success(
      `${config.value.resourceLabel} "${updatedResource.metadata.name}" 更新成功`,
    );
    yamlEditorVisible.value = false;
    resourceListRef.value?.reload();
  } catch (error: any) {
    message.error(`更新失败: ${error.message}`);
  }
}

/**
 * 处理扩缩容确认
 */
async function handleScale(replicas: number) {
  if (!currentResource.value) return;

  try {
    // TODO: 调用真实 API 更新副本数
    // await scaleK8sResource(
    //   config.value.resourceType,
    //   currentResource.value.metadata.namespace,
    //   currentResource.value.metadata.name,
    //   replicas
    // );

    message.success(
      `${config.value.resourceLabel} "${currentResource.value.metadata.name}" 副本数已更新为 ${replicas}`,
    );
    scaleModalVisible.value = false;
    resourceListRef.value?.reload();
  } catch (error: any) {
    message.error(`扩缩容失败: ${error.message}`);
  }
}

/**
 * 刷新列表
 */
function reload() {
  resourceListRef.value?.reload();
}

// 暴露方法给父组件
defineExpose({
  reload,
  openDetail,
  openYAMLEditor,
  openScaleModal,
});
</script>

<template>
  <div class="generic-resource-page">
    <!-- 资源列表 -->
    <ResourceList ref="resourceListRef" :config="config">
      <!-- 透传所有插槽到 ResourceList -->
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <component
      :is="detailComponent || GenericDetailDrawer"
      v-if="enableDetail && currentResource"
      v-model:visible="detailDrawerVisible"
      :resource="currentResource"
      :resource-type="config.resourceType"
      :resource-label="config.resourceLabel"
    >
      <!-- 透传详情插槽 -->
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </component>

    <!-- YAML 编辑器模态框 -->
    <YAMLEditorModal
      v-if="enableYAMLEdit && currentResource"
      v-model:visible="yamlEditorVisible"
      :resource="currentResource"
      :resource-type="config.resourceType"
      :resource-name="currentResource.metadata?.name"
      @confirm="handleYAMLUpdate"
    />

    <!-- 扩缩容模态框 -->
    <ScaleModal
      v-if="scalable && currentResource"
      v-model:visible="scaleModalVisible"
      :resource-name="currentResource.metadata?.name"
      :resource-type="config.resourceType"
      :current-replicas="currentResource.spec?.replicas"
      :namespace="currentResource.metadata?.namespace"
      @confirm="handleScale"
    />
  </div>
</template>

<style scoped>
.generic-resource-page {
  height: 100%;
}
</style>
