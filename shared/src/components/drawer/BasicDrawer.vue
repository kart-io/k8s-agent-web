<template>
  <a-drawer
    v-model:open="visible"
    :title="title"
    :width="width"
    :height="height"
    :placement="placement"
    :closable="closable"
    :mask-closable="maskClosable"
    :destroy-on-close="destroyOnClose"
    :get-container="getContainer"
    :footer-style="footerStyle"
    @close="handleClose"
  >
    <template v-if="$slots.extra" #extra>
      <slot name="extra" />
    </template>

    <div class="drawer-content">
      <slot />
    </div>

    <template v-if="showFooter" #footer>
      <slot name="footer">
        <div class="drawer-footer">
          <a-space>
            <a-button @click="handleCancel">{{ cancelText }}</a-button>
            <a-button
              type="primary"
              :loading="confirmLoading"
              @click="handleOk"
            >
              {{ okText }}
            </a-button>
          </a-space>
        </div>
      </slot>
    </template>
  </a-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: 378
  },
  height: {
    type: [String, Number],
    default: 378
  },
  placement: {
    type: String,
    default: 'right',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  okText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmLoading: {
    type: Boolean,
    default: false
  },
  getContainer: {
    type: [String, Function],
    default: 'body'
  },
  footerStyle: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:open', 'ok', 'cancel', 'close'])

const visible = ref(props.open)

watch(() => props.open, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:open', val)
})

const handleOk = () => {
  emit('ok')
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const handleClose = () => {
  visible.value = false
  emit('close')
}
</script>

<style scoped lang="scss">
.drawer-content {
  padding: 16px 0;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
