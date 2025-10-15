<script lang="ts" setup>
/**
 * PersistentVolume 列表页面
 */
import type { PersistentVolume } from '#/api/k8s/types';

import { ref } from 'vue';

import { message, Tag } from 'ant-design-vue';

import { checkPVBeforeDelete, mockDeletePV } from '#/api/k8s/mock';
import { createPVConfig } from '#/config/k8s-resources';
import DeleteConfirmModal from '#/views/k8s/_shared/DeleteConfirmModal.vue';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

import DetailDrawer from './DetailDrawer.vue';

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedPV = ref<null | PersistentVolume>(null);

// 删除确认对话框状态
const deleteModalVisible = ref(false);
const pvToDelete = ref<null | PersistentVolume>(null);
const deleteWarnings = ref<string[]>([]);
const isDeleting = ref(false);

// ResourceList 引用
const resourceListRef = ref();

/**
 * 打开详情抽屉
 */
function openDetailDrawer(pv: PersistentVolume) {
  selectedPV.value = pv;
  detailDrawerVisible.value = true;
}

/**
 * 关闭详情抽屉
 */
function closeDetailDrawer() {
  detailDrawerVisible.value = false;
  selectedPV.value = null;
}

/**
 * 打开删除确认对话框
 */
function openDeleteModal(pv: PersistentVolume) {
  pvToDelete.value = pv;

  // 执行删除前检查
  const checkResult = checkPVBeforeDelete('cluster-prod-01', pv.metadata.name);

  if (!checkResult.canDelete) {
    message.error(checkResult.warnings[0] || '无法删除此 PV');
    return;
  }

  deleteWarnings.value = checkResult.warnings;
  deleteModalVisible.value = true;
}

/**
 * 确认删除 PV
 */
async function confirmDelete() {
  if (!pvToDelete.value) return;

  isDeleting.value = true;

  try {
    const result = await mockDeletePV(
      'cluster-prod-01',
      pvToDelete.value.metadata.name,
    );

    if (result.success) {
      message.success(result.message);
      deleteModalVisible.value = false;
      pvToDelete.value = null;
      deleteWarnings.value = [];

      // 刷新列表
      if (resourceListRef.value) {
        resourceListRef.value.refresh();
      }
    } else {
      message.error(result.message);
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning) => {
          message.warning(warning);
        });
      }
    }
  } catch (error: any) {
    message.error(error.message || '删除失败');
  } finally {
    isDeleting.value = false;
  }
}

/**
 * 取消删除
 */
function cancelDelete() {
  deleteModalVisible.value = false;
  pvToDelete.value = null;
  deleteWarnings.value = [];
}

// 获取 PV 资源配置
const config = createPVConfig();

// 覆盖操作的 handler
if (config.actions && config.actions.length > 0) {
  const viewAction = config.actions.find((action) => action.action === 'view');
  if (viewAction) {
    viewAction.handler = openDetailDrawer;
  }

  const deleteAction = config.actions.find(
    (action) => action.action === 'delete',
  );
  if (deleteAction) {
    deleteAction.handler = openDeleteModal;
  }
}
</script>

<template>
  <div class="persistent-volumes-page">
    <ResourceList ref="resourceListRef" :config="config">
      <!-- 访问模式插槽 -->
      <template #access-modes-slot="{ row }">
        <Tag
          v-for="mode in row.spec.accessModes"
          :key="mode"
          color="blue"
          size="small"
        >
          {{
            mode === 'ReadWriteOnce'
              ? 'RWO'
              : mode === 'ReadOnlyMany'
                ? 'ROX'
                : mode === 'ReadWriteMany'
                  ? 'RWX'
                  : 'RWOP'
          }}
        </Tag>
      </template>

      <!-- 绑定的 PVC 插槽 -->
      <template #claim-slot="{ row }">
        <span v-if="row.spec.claimRef">
          {{ row.spec.claimRef.namespace }}/{{ row.spec.claimRef.name }}
        </span>
        <span v-else class="text-gray-400">未绑定</span>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :pv="selectedPV"
      @close="closeDetailDrawer"
    />

    <!-- 删除确认对话框 -->
    <DeleteConfirmModal
      v-model:visible="deleteModalVisible"
      resource-type="PersistentVolume"
      :resource-name="pvToDelete?.metadata.name || ''"
      :warnings="deleteWarnings"
      :require-confirm-text="true"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.persistent-volumes-page {
  height: 100%;
}
</style>
