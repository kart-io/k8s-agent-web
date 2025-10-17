<script lang="ts" setup>
/**
 * 通用资源管理页面
 * 通过传入配置工厂函数，自动渲染任何 K8s 资源的完整管理页面
 *
 * 功能：
 * - 自动集成列表、筛选、分页
 * - 自动处理 YAML 编辑
 * - 可选的扩缩容功能
 * - 统一的详情展示
 * - 插槽支持自定义内容
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';

import { computed, ref } from 'vue';

import { message } from 'ant-design-vue';

import ResourceList from './ResourceList.vue';
import YAMLEditorModal from './YAMLEditorModal.vue';
import ScaleModal from './ScaleModal.vue';

interface Props {
  /** 资源配置工厂函数 */
  configFactory: () => ResourceListConfig<any>;
  /** 是否支持扩缩容 */
  scalable?: boolean;
  /** 自定义详情组件（如果不提供，使用简单的 Modal） */
  detailComponent?: any;
}

const props = withDefaults(defineProps<Props>(), {
  scalable: false,
  detailComponent: undefined,
});

// 状态管理
const resourceListRef = ref();
const yamlEditorVisible = ref(false);
const detailDrawerVisible = ref(false);
const scaleModalVisible = ref(false);
const currentResource = ref<any>(null);

// 配置
const config = computed(() => {
  const baseConfig = props.configFactory();

  // 自动覆盖操作处理器
  if (baseConfig.actions) {
    baseConfig.actions = baseConfig.actions.map((action) => {
      // 根据操作类型，绑定对应的处理函数
      switch (action.action) {
        case 'view':
          // 仅当提供了 detailComponent 时才覆盖处理器
          // 否则使用配置中原有的处理器（例如 createViewAction 创建的 Modal）
          return props.detailComponent
            ? { ...action, handler: handleView }
            : action;
        case 'edit':
          return { ...action, handler: handleEdit };
        case 'scale':
          return { ...action, handler: handleScale };
        default:
          // 其他操作保持原有处理器（如 delete, restart 等）
          return action;
      }
    });
  }

  return baseConfig;
});

/**
 * 查看详情
 */
function handleView(resource: any) {
  currentResource.value = resource;
  detailDrawerVisible.value = true;
}

/**
 * 编辑资源（打开 YAML 编辑器）
 */
function handleEdit(resource: any) {
  currentResource.value = resource;
  yamlEditorVisible.value = true;
}

/**
 * 扩缩容
 */
function handleScale(resource: any) {
  if (!props.scalable) {
    message.warning('此资源不支持扩缩容操作');
    return;
  }
  currentResource.value = resource;
  scaleModalVisible.value = true;
}

/**
 * YAML 编辑确认
 */
async function handleYAMLUpdate(updatedResource: any) {
  try {
    // TODO: 调用真实 API 更新资源
    // await updateResource(
    //   config.value.resourceType,
    //   updatedResource.metadata.namespace,
    //   updatedResource.metadata.name,
    //   updatedResource
    // );

    message.success(`${config.value.resourceLabel} "${updatedResource.metadata.name}" 更新成功`);
    yamlEditorVisible.value = false;
    currentResource.value = null;

    // 刷新列表
    resourceListRef.value?.reload();
  } catch (error: any) {
    message.error(`更新失败: ${error.message}`);
  }
}

/**
 * 扩缩容确认
 */
async function handleScaleConfirm(replicas: number) {
  if (!currentResource.value) return;

  try {
    // TODO: 调用真实 API 更新副本数
    // await scaleResource(
    //   config.value.resourceType,
    //   currentResource.value.metadata.namespace,
    //   currentResource.value.metadata.name,
    //   replicas
    // );

    message.success(
      `${config.value.resourceLabel} "${currentResource.value.metadata.name}" 副本数已更新为 ${replicas}`,
    );
    scaleModalVisible.value = false;
    currentResource.value = null;

    // 刷新列表
    resourceListRef.value?.reload();
  } catch (error: any) {
    message.error(`扩缩容失败: ${error.message}`);
  }
}

// 暴露方法给父组件
defineExpose({
  reload: () => resourceListRef.value?.reload(),
});
</script>

<template>
  <div class="generic-resource-page">
    <!-- 资源列表 -->
    <ResourceList ref="resourceListRef" :config="config">
      <!-- 透传所有插槽给 ResourceList -->
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </ResourceList>

    <!-- 详情抽屉（如果提供了自定义组件） -->
    <component
      :is="detailComponent"
      v-if="detailComponent && currentResource"
      v-model:visible="detailDrawerVisible"
      :resource="currentResource"
      :resource-type="config.resourceType"
      :resource-label="config.resourceLabel"
    />

    <!-- YAML 编辑器模态框 -->
    <YAMLEditorModal
      v-if="currentResource"
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
      @confirm="handleScaleConfirm"
    />
  </div>
</template>

<style scoped>
.generic-resource-page {
  width: 100%;
  height: 100%;
}
</style>
