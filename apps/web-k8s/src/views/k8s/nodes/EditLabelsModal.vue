<script lang="ts" setup>
/**
 * 编辑 Node 标签对话框组件
 * 支持添加、修改、删除标签
 */
import type { Node } from '#/api/k8s/types';

import { computed, ref, watch } from 'vue';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { Button, Input, message, Modal, Space, Table } from 'ant-design-vue';

import { updateNodeLabels } from '#/api/k8s';

interface EditLabelsModalProps {
  visible: boolean;
  node: Node | null;
  clusterId?: string;
}

const props = withDefaults(defineProps<EditLabelsModalProps>(), {
  visible: false,
  node: null,
  clusterId: 'cluster-prod-01',
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

// 标签列表
const labels = ref<Array<{ key: string; value: string; isNew?: boolean }>>([]);

// 新标签输入
const newLabelKey = ref('');
const newLabelValue = ref('');

/**
 * K8s 系统标签前缀 - 不允许编辑
 */
const systemLabelPrefixes = [
  'kubernetes.io/',
  'k8s.io/',
  'node.kubernetes.io/',
  'node-role.kubernetes.io/',
  'beta.kubernetes.io/',
];

/**
 * 检查是否是系统标签
 */
function isSystemLabel(key: string): boolean {
  return systemLabelPrefixes.some((prefix) => key.startsWith(prefix));
}

/**
 * 表格列定义
 */
const columns = [
  {
    title: '键 (Key)',
    dataIndex: 'key',
    key: 'key',
    width: '40%',
  },
  {
    title: '值 (Value)',
    dataIndex: 'value',
    key: 'value',
    width: '40%',
  },
  {
    title: '操作',
    key: 'action',
    width: '20%',
  },
];

/**
 * 初始化标签列表
 */
function initLabels() {
  if (!props.node?.metadata.labels) {
    labels.value = [];
    return;
  }

  labels.value = Object.entries(props.node.metadata.labels).map(
    ([key, value]) => ({
      key,
      value,
    }),
  );
}

/**
 * 监听对话框打开
 */
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      initLabels();
      newLabelKey.value = '';
      newLabelValue.value = '';
    }
  },
);

/**
 * 添加新标签
 */
function handleAddLabel() {
  const key = newLabelKey.value.trim();
  const value = newLabelValue.value.trim();

  if (!key) {
    message.warning('请输入标签键');
    return;
  }

  // 检查键是否已存在
  if (labels.value.some((label) => label.key === key)) {
    message.warning('标签键已存在');
    return;
  }

  // 检查是否是系统标签
  if (isSystemLabel(key)) {
    message.warning('不能添加系统保留的标签前缀');
    return;
  }

  // 验证键格式 (简化版，完整的 K8s 验证更复杂)
  const keyPattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
  const parts = key.split('/');
  const labelKey = parts.length === 2 ? parts[1] : parts[0];

  if (!keyPattern.test(labelKey)) {
    message.warning('标签键格式不正确，只能包含字母、数字、点、下划线和连字符');
    return;
  }

  labels.value.push({
    key,
    value,
    isNew: true,
  });

  newLabelKey.value = '';
  newLabelValue.value = '';
  message.success('标签已添加到待保存列表');
}

/**
 * 删除标签
 */
function handleDeleteLabel(record: { key: string }) {
  if (isSystemLabel(record.key)) {
    message.warning('不能删除系统标签');
    return;
  }

  labels.value = labels.value.filter((label) => label.key !== record.key);
  message.success('标签已从列表中移除');
}

/**
 * 更新标签值
 */
function handleUpdateValue(record: { key: string }, newValue: string) {
  const label = labels.value.find((l) => l.key === record.key);
  if (label) {
    label.value = newValue;
  }
}

/**
 * 保存标签
 */
async function handleSave() {
  if (!props.node) return;

  try {
    const labelsObject = labels.value.reduce(
      (acc, { key, value }) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );

    await updateNodeLabels(
      props.clusterId,
      props.node.metadata.name,
      labelsObject,
    );

    message.success(`节点 "${props.node.metadata.name}" 的标签已更新`);
    emit('success');
    handleClose();
  } catch (error) {
    message.error('更新标签失败');
    console.error(error);
  }
}

/**
 * 关闭对话框
 */
function handleClose() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :open="visible"
    :title="`编辑节点标签 - ${node?.metadata.name || ''}`"
    width="800px"
    @cancel="handleClose"
  >
    <div class="labels-editor">
      <!-- 添加新标签 -->
      <div class="add-label-section">
        <div class="section-title">添加新标签</div>
        <Space :size="12">
          <Input
            v-model:value="newLabelKey"
            :style="{ width: '280px' }"
            placeholder="键 (例如: app, env, team)"
            @press-enter="handleAddLabel"
          />
          <Input
            v-model:value="newLabelValue"
            :style="{ width: '280px' }"
            placeholder="值 (例如: nginx, production)"
            @press-enter="handleAddLabel"
          />
          <Button type="primary" @click="handleAddLabel">
            <PlusOutlined />
            添加
          </Button>
        </Space>
        <div class="hint">
          提示：系统标签 (kubernetes.io/*, node.kubernetes.io/* 等) 不可编辑
        </div>
      </div>

      <!-- 标签列表 -->
      <div class="labels-list-section">
        <div class="section-title">当前标签</div>
        <Table
          :columns="columns"
          :data-source="labels"
          :pagination="false"
          :row-key="(record) => record.key"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'key'">
              <span :class="{ 'system-label': isSystemLabel(record.key) }">
                {{ record.key }}
              </span>
              <span v-if="record.isNew" class="new-badge">新</span>
            </template>

            <template v-else-if="column.key === 'value'">
              <Input
                v-if="!isSystemLabel(record.key)"
                :value="record.value"
                size="small"
                @change="(e) => handleUpdateValue(record, e.target.value)"
              />
              <span v-else class="system-value">{{ record.value }}</span>
            </template>

            <template v-else-if="column.key === 'action'">
              <Button
                v-if="!isSystemLabel(record.key)"
                size="small"
                type="link"
                danger
                @click="handleDeleteLabel(record)"
              >
                <DeleteOutlined />
                删除
              </Button>
              <span v-else class="system-hint">系统标签</span>
            </template>
          </template>
        </Table>
      </div>
    </div>

    <template #footer>
      <Button @click="handleClose">取消</Button>
      <Button type="primary" @click="handleSave">保存</Button>
    </template>
  </Modal>
</template>

<style scoped>
.labels-editor {
  padding: 16px 0;
}

.add-label-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.labels-list-section {
  margin-top: 24px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.system-label {
  color: var(--vben-text-color-secondary);
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
}

.system-value {
  color: var(--vben-text-color-secondary);
}

.system-hint {
  font-size: 12px;
  color: var(--vben-text-color-secondary);
}

.new-badge {
  margin-left: 8px;
  padding: 2px 6px;
  font-size: 11px;
  color: #fff;
  background-color: #52c41a;
  border-radius: 2px;
}

:deep(.ant-table) {
  font-size: 13px;
}

:deep(.ant-table-thead > tr > th) {
  font-weight: 600;
  background-color: var(--vben-background-color);
}
</style>
