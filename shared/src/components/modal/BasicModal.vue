<template>
  <a-modal
    v-model:open="visible"
    :title="title"
    :width="width"
    :footer="footer"
    :mask-closable="maskClosable"
    :destroy-on-close="destroyOnClose"
    :confirm-loading="confirmLoading"
    v-bind="$attrs"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <!-- 默认内容插槽 -->
    <slot />

    <!-- 自定义底部 -->
    <template v-if="!footer && showFooter" #footer>
      <slot name="footer" :ok="handleOk" :cancel="handleCancel">
        <a-space>
          <a-button @click="handleCancel">{{ cancelText }}</a-button>
          <a-button type="primary" :loading="confirmLoading" @click="handleOk">
            {{ okText }}
          </a-button>
        </a-space>
      </slot>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // 是否显示
  open: {
    type: Boolean,
    default: false
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 宽度
  width: {
    type: [String, Number],
    default: 520
  },
  // 底部内容
  footer: {
    type: [Object, Boolean],
    default: null
  },
  // 是否显示底部
  showFooter: {
    type: Boolean,
    default: true
  },
  // 点击蒙层是否允许关闭
  maskClosable: {
    type: Boolean,
    default: false
  },
  // 关闭时销毁子元素
  destroyOnClose: {
    type: Boolean,
    default: true
  },
  // 确定按钮 loading
  confirmLoading: {
    type: Boolean,
    default: false
  },
  // 确定按钮文字
  okText: {
    type: String,
    default: '确定'
  },
  // 取消按钮文字
  cancelText: {
    type: String,
    default: '取消'
  }
})

const emit = defineEmits(['update:open', 'ok', 'cancel', 'register'])

// 内部可见状态
const visible = ref(props.open)

// 监听 prop 变化
watch(() => props.open, (val) => {
  visible.value = val
})

// 监听内部状态变化
watch(visible, (val) => {
  emit('update:open', val)
})

// 确定
const handleOk = () => {
  emit('ok')
}

// 取消
const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

// 打开
const open = () => {
  visible.value = true
}

// 关闭
const close = () => {
  visible.value = false
}

// 暴露方法
defineExpose({
  open,
  close
})

// 注册实例
emit('register', {
  open,
  close
})
</script>
