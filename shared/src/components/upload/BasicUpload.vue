<template>
  <a-upload
    v-model:file-list="fileList"
    :action="action"
    :headers="headers"
    :data="data"
    :accept="accept"
    :multiple="multiple"
    :max-count="maxCount"
    :before-upload="handleBeforeUpload"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :on-change="handleChange"
    :list-type="listType"
    :disabled="disabled"
    :show-upload-list="showUploadList"
  >
    <slot>
      <a-button v-if="listType !== 'picture-card'" :disabled="disabled">
        <template #icon><UploadOutlined /></template>
        {{ buttonText }}
      </a-button>
      <div v-else>
        <plus-outlined />
        <div class="ant-upload-text">{{ buttonText }}</div>
      </div>
    </slot>
  </a-upload>

  <!-- 图片预览弹窗 -->
  <a-modal
    v-model:open="previewVisible"
    :footer="null"
    :title="previewTitle"
  >
    <img :src="previewImage" alt="preview" style="width: 100%" />
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined, PlusOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  action: {
    type: String,
    required: true
  },
  headers: {
    type: Object,
    default: () => ({})
  },
  data: {
    type: Object,
    default: () => ({})
  },
  accept: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  maxCount: {
    type: Number
  },
  maxSize: {
    type: Number,
    default: 5 // MB
  },
  listType: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'picture', 'picture-card'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: '上传文件'
  },
  showUploadList: {
    type: [Boolean, Object],
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'preview', 'remove'])

const fileList = ref([])
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')

watch(
  () => props.modelValue,
  (val) => {
    fileList.value = val || []
  },
  { immediate: true }
)

const handleBeforeUpload = (file) => {
  // 检查文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    message.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  // 检查文件类型
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(type => type.trim())
    const fileType = file.type
    const fileName = file.name
    const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()

    const isAccepted = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExt === type.toLowerCase()
      }
      return fileType.includes(type.replace('*', ''))
    })

    if (!isAccepted) {
      message.error('文件格式不支持')
      return false
    }
  }

  return true
}

const handleChange = ({ fileList: newFileList }) => {
  fileList.value = newFileList
  emit('update:modelValue', newFileList)
  emit('change', newFileList)
}

const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj)
  }
  previewImage.value = file.url || file.preview
  previewVisible.value = true
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
  emit('preview', file)
}

const handleRemove = (file) => {
  emit('remove', file)
}

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}
</script>
