<script lang="ts" setup>
/**
 * 编辑 Node 污点对话框组件
 * 支持添加、修改、删除污点
 */
import type { Node } from '#/api/k8s/types';

import { ref, watch } from 'vue';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import { updateNodeTaints } from '#/api/k8s';

interface EditTaintsModalProps {
  visible?: boolean;
  node?: Node | null;
  clusterId?: string;
}

const props = withDefaults(defineProps<EditTaintsModalProps>(), {
  visible: false,
  node: null,
  clusterId: 'cluster-prod-01',
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

/**
 * 污点接口
 */
interface Taint {
  key: string;
  value?: string;
  effect: 'NoExecute' | 'NoSchedule' | 'PreferNoSchedule';
  isNew?: boolean;
}

// 污点列表
const taints = ref<Taint[]>([]);

// 新污点输入
const newTaintKey = ref('');
const newTaintValue = ref('');
const newTaintEffect = ref<Taint['effect']>('NoSchedule');

/**
 * 污点效果选项
 */
const effectOptions = [
  {
    label: 'NoSchedule - 不调度新 Pod',
    value: 'NoSchedule',
  },
  {
    label: 'PreferNoSchedule - 尽量不调度',
    value: 'PreferNoSchedule',
  },
  {
    label: 'NoExecute - 不调度且驱逐现有 Pod',
    value: 'NoExecute',
  },
];

/**
 * 污点效果颜色映射
 */
const effectColorMap: Record<Taint['effect'], string> = {
  NoSchedule: 'orange',
  PreferNoSchedule: 'warning',
  NoExecute: 'error',
};

/**
 * 表格列定义
 */
const columns = [
  {
    title: '键 (Key)',
    dataIndex: 'key',
    key: 'key',
    width: '30%',
  },
  {
    title: '值 (Value)',
    dataIndex: 'value',
    key: 'value',
    width: '25%',
  },
  {
    title: '效果 (Effect)',
    dataIndex: 'effect',
    key: 'effect',
    width: '25%',
  },
  {
    title: '操作',
    key: 'action',
    width: '20%',
  },
];

/**
 * 初始化污点列表
 */
function initTaints() {
  if (!props.node?.spec?.taints || props.node.spec.taints.length === 0) {
    taints.value = [];
    return;
  }

  taints.value = props.node.spec.taints.map((taint) => ({
    key: taint.key,
    value: taint.value,
    effect: taint.effect as Taint['effect'],
  }));
}

/**
 * 监听对话框打开
 */
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      initTaints();
      newTaintKey.value = '';
      newTaintValue.value = '';
      newTaintEffect.value = 'NoSchedule';
    }
  },
);

/**
 * 添加新污点
 */
function handleAddTaint() {
  const key = newTaintKey.value.trim();
  const value = newTaintValue.value.trim();
  const effect = newTaintEffect.value;

  if (!key) {
    message.warning('请输入污点键');
    return;
  }

  // 检查是否已存在相同的 key 和 effect 组合
  if (
    taints.value.some((taint) => taint.key === key && taint.effect === effect)
  ) {
    message.warning('相同键和效果的污点已存在');
    return;
  }

  // 验证键格式
  const keyPattern = /^[a-z0-9](?:[\w.-]*[a-z0-9])?$/i;
  const parts = key.split('/');
  const taintKey = parts.length === 2 ? parts[1] : parts[0];

  if (!keyPattern.test(taintKey)) {
    message.warning('污点键格式不正确，只能包含字母、数字、点、下划线和连字符');
    return;
  }

  taints.value.push({
    key,
    value: value || undefined,
    effect,
    isNew: true,
  });

  newTaintKey.value = '';
  newTaintValue.value = '';
  newTaintEffect.value = 'NoSchedule';
  message.success('污点已添加到待保存列表');
}

/**
 * 删除污点
 */
function handleDeleteTaint(record: Taint) {
  taints.value = taints.value.filter(
    (taint) => !(taint.key === record.key && taint.effect === record.effect),
  );
  message.success('污点已从列表中移除');
}

/**
 * 更新污点值
 */
function handleUpdateValue(record: Taint, newValue: string) {
  const taint = taints.value.find(
    (t) => t.key === record.key && t.effect === record.effect,
  );
  if (taint) {
    taint.value = newValue || undefined;
  }
}

/**
 * 保存污点
 */
async function handleSave() {
  if (!props.node) return;

  try {
    await updateNodeTaints(
      props.clusterId,
      props.node.metadata.name,
      taints.value.map(({ key, value, effect }) => ({
        key,
        value,
        effect,
      })),
    );

    message.success(`节点 "${props.node.metadata.name}" 的污点已更新`);
    emit('success');
    handleClose();
  } catch (error) {
    message.error('更新污点失败');
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
    :title="`编辑节点污点 - ${node?.metadata.name || ''}`"
    width="900px"
    @cancel="handleClose"
  >
    <div class="taints-editor">
      <!-- 污点说明 -->
      <div class="info-section">
        <div class="info-title">什么是污点 (Taints)?</div>
        <ul class="info-list">
          <li>
            <strong>NoSchedule:</strong> 新 Pod 不会被调度到此节点，但现有 Pod
            继续运行
          </li>
          <li>
            <strong>PreferNoSchedule:</strong> 尽量避免调度新 Pod
            到此节点，但不是强制的
          </li>
          <li>
            <strong>NoExecute:</strong> 新 Pod 不会被调度，且会驱逐现有不容忍的
            Pod
          </li>
        </ul>
      </div>

      <!-- 添加新污点 -->
      <div class="add-taint-section">
        <div class="section-title">添加新污点</div>
        <Space :size="12" wrap>
          <Input
            v-model:value="newTaintKey"
            :style="{ width: '220px' }"
            placeholder="键 (例如: dedicated, gpu)"
            @press-enter="handleAddTaint"
          />
          <Input
            v-model:value="newTaintValue"
            :style="{ width: '200px' }"
            placeholder="值 (可选)"
            @press-enter="handleAddTaint"
          />
          <Select
            v-model:value="newTaintEffect"
            :options="effectOptions"
            :style="{ width: '280px' }"
          />
          <Button type="primary" @click="handleAddTaint">
            <PlusOutlined />
            添加
          </Button>
        </Space>
      </div>

      <!-- 污点列表 -->
      <div class="taints-list-section">
        <div class="section-title">
          当前污点
          <span class="count-badge">({{ taints.length }})</span>
        </div>
        <Table
          v-if="taints.length > 0"
          :columns="columns"
          :data-source="taints"
          :pagination="false"
          :row-key="(record) => `${record.key}-${record.effect}`"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'key'">
              <code class="taint-key">{{ record.key }}</code>
              <span v-if="record.isNew" class="new-badge">新</span>
            </template>

            <template v-else-if="column.key === 'value'">
              <Input
                :value="record.value || ''"
                size="small"
                placeholder="无值"
                @change="(e) => handleUpdateValue(record, e.target.value)"
              />
            </template>

            <template v-else-if="column.key === 'effect'">
              <Tag :color="effectColorMap[record.effect]">
                {{ record.effect }}
              </Tag>
            </template>

            <template v-else-if="column.key === 'action'">
              <Button
                size="small"
                type="link"
                danger
                @click="handleDeleteTaint(record)"
              >
                <DeleteOutlined />
                删除
              </Button>
            </template>
          </template>
        </Table>
        <div v-else class="empty-hint">暂无污点</div>
      </div>
    </div>

    <template #footer>
      <Button @click="handleClose">取消</Button>
      <Button type="primary" @click="handleSave">保存</Button>
    </template>
  </Modal>
</template>

<style scoped>
.taints-editor {
  padding: 16px 0;
}

.info-section {
  padding: 12px 16px;
  margin-bottom: 20px;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
}

html[data-theme='dark'] .info-section {
  background-color: rgb(24 144 255 / 10%);
  border-color: rgb(24 144 255 / 30%);
}

.info-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

html[data-theme='dark'] .info-title {
  color: #69c0ff;
}

.info-list {
  padding-left: 20px;
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: var(--vben-text-color);
}

.info-list li {
  margin-bottom: 4px;
}

.add-taint-section {
  padding: 16px;
  margin-bottom: 24px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.taints-list-section {
  margin-top: 24px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.count-badge {
  margin-left: 8px;
  font-size: 13px;
  font-weight: normal;
  color: var(--vben-text-color-secondary);
}

.taint-key {
  padding: 2px 6px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  color: var(--vben-text-color);
  background-color: rgb(0 0 0 / 4%);
  border-radius: 2px;
}

html[data-theme='dark'] .taint-key {
  background-color: rgb(255 255 255 / 8%);
}

.new-badge {
  padding: 2px 6px;
  margin-left: 8px;
  font-size: 11px;
  color: #fff;
  background-color: #52c41a;
  border-radius: 2px;
}

.empty-hint {
  padding: 32px;
  font-size: 14px;
  color: var(--vben-text-color-secondary);
  text-align: center;
  background-color: var(--vben-background-color);
  border: 1px dashed var(--vben-border-color);
  border-radius: 4px;
}

:deep(.ant-table) {
  font-size: 13px;
}

:deep(.ant-table-thead > tr > th) {
  font-weight: 600;
  background-color: var(--vben-background-color);
}
</style>
