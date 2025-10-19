<script lang="ts" setup>
/**
 * 删除确认对话框组件
 * 支持安全检查和警告提示
 */
import { computed, ref } from 'vue';

import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Alert, Checkbox, Input, Modal } from 'ant-design-vue';

interface DeleteConfirmModalProps {
  visible?: boolean;
  resourceType: string;
  resourceName: string;
  warnings?: string[];
  requireConfirmText?: boolean;
  confirmText?: string;
  danger?: boolean;
}

const props = withDefaults(defineProps<DeleteConfirmModalProps>(), {
  visible: false,
  requireConfirmText: true,
  confirmText: '',
  danger: true,
  warnings: () => [],
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

// 用户输入的确认文本
const inputConfirmText = ref('');

// 确认复选框
const confirmCheckbox = ref(false);

/**
 * 是否可以确认删除
 */
const canConfirm = computed(() => {
  if (props.requireConfirmText) {
    const expectedText = props.confirmText || props.resourceName;
    return inputConfirmText.value === expectedText && confirmCheckbox.value;
  }
  return confirmCheckbox.value;
});

/**
 * 对话框标题
 */
const title = computed(() => {
  return `删除 ${props.resourceType}`;
});

/**
 * 警告类型
 */
const warningType = computed(() => {
  return props.danger ? 'error' : 'warning';
});

/**
 * 处理确认
 */
function handleConfirm() {
  if (canConfirm.value) {
    emit('confirm');
    handleClose();
  }
}

/**
 * 处理取消
 */
function handleCancel() {
  emit('cancel');
  handleClose();
}

/**
 * 关闭对话框
 */
function handleClose() {
  emit('update:visible', false);
  // 重置状态
  inputConfirmText.value = '';
  confirmCheckbox.value = false;
}
</script>

<template>
  <Modal
    :open="visible"
    :title="title"
    ok-text="确认删除"
    cancel-text="取消"
    :ok-button-props="{ danger, disabled: !canConfirm }"
    width="600px"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="delete-confirm-content">
      <!-- 警告图标 -->
      <div class="warning-icon">
        <ExclamationCircleOutlined
          :style="{ fontSize: '48px', color: danger ? '#ff4d4f' : '#faad14' }"
        />
      </div>

      <!-- 主要提示信息 -->
      <div class="main-message">
        <p class="message-text">
          <!-- eslint-disable-next-line vue/html-closing-bracket-newline -->
          您即将删除 <strong>{{ resourceType }}</strong
          >:
        </p>
        <p class="resource-name">{{ resourceName }}</p>
        <p class="warning-text">
          此操作<strong>无法撤销</strong>，删除后数据将永久丢失。
        </p>
      </div>

      <!-- 警告列表 -->
      <Alert
        v-if="warnings.length > 0"
        :type="warningType"
        message="删除前请注意以下事项："
        show-icon
        class="warnings-alert"
      >
        <template #description>
          <ul class="warnings-list">
            <li v-for="(warning, index) in warnings" :key="index">
              {{ warning }}
            </li>
          </ul>
        </template>
      </Alert>

      <!-- 确认文本输入 -->
      <div v-if="requireConfirmText" class="confirm-input-section">
        <p class="input-label">
          请输入
          <code class="confirm-code">{{ confirmText || resourceName }}</code>
          以确认删除：
        </p>
        <Input
          v-model:value="inputConfirmText"
          placeholder="请输入资源名称"
          :status="
            inputConfirmText &&
            inputConfirmText !== (confirmText || resourceName)
              ? 'error'
              : ''
          "
          @press-enter="handleConfirm"
        />
      </div>

      <!-- 确认复选框 -->
      <div class="confirm-checkbox-section">
        <Checkbox v-model:checked="confirmCheckbox">
          我已了解此操作的风险，确认删除该资源
        </Checkbox>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.delete-confirm-content {
  padding: 16px 0;
}

.warning-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.main-message {
  margin-bottom: 24px;
  text-align: center;
}

.message-text {
  margin-bottom: 12px;
  font-size: 15px;
  color: var(--vben-text-color);
}

.resource-name {
  padding: 8px 16px;
  margin: 12px 0;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 16px;
  font-weight: 600;
  color: #ff4d4f;
  background-color: rgb(255 77 79 / 5%);
  border: 1px solid rgb(255 77 79 / 20%);
  border-radius: 4px;
}

.warning-text {
  margin-top: 12px;
  font-size: 14px;
  color: var(--vben-text-color-secondary);
}

.warning-text strong {
  color: #ff4d4f;
}

.warnings-alert {
  margin-bottom: 24px;
}

.warnings-list {
  padding-left: 20px;
  margin: 8px 0 0;
}

.warnings-list li {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.6;
}

.confirm-input-section {
  margin-bottom: 20px;
}

.input-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--vben-text-color);
}

.confirm-code {
  padding: 2px 8px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #ff4d4f;
  background-color: rgb(255 77 79 / 10%);
  border: 1px solid rgb(255 77 79 / 20%);
  border-radius: 3px;
}

.confirm-checkbox-section {
  padding: 16px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

:deep(.ant-checkbox-wrapper) {
  font-size: 14px;
}
</style>
