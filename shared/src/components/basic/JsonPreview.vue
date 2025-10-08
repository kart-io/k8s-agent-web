<template>
  <div class="json-preview">
    <div v-if="showToolbar" class="json-toolbar">
      <a-space>
        <a-button size="small" @click="handleCopy">
          <template #icon><CopyOutlined /></template>
          复制
        </a-button>
        <a-button size="small" @click="handleExpand">
          <template #icon><ExpandOutlined v-if="!expanded" /><ShrinkOutlined v-else /></template>
          {{ expanded ? '折叠' : '展开' }}
        </a-button>
        <a-button v-if="showDownload" size="small" @click="handleDownload">
          <template #icon><DownloadOutlined /></template>
          下载
        </a-button>
      </a-space>
    </div>
    <div class="json-content" :class="{ expanded }">
      <pre><code>{{ formattedJson }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  CopyOutlined,
  ExpandOutlined,
  ShrinkOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  data: {
    type: [Object, Array, String],
    required: true
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  showDownload: {
    type: Boolean,
    default: true
  },
  indent: {
    type: Number,
    default: 2
  },
  fileName: {
    type: String,
    default: 'data.json'
  }
})

const expanded = ref(true)

const formattedJson = computed(() => {
  try {
    const data = typeof props.data === 'string' ? JSON.parse(props.data) : props.data
    return JSON.stringify(data, null, props.indent)
  } catch (error) {
    console.error('Failed to format JSON:', error)
    return String(props.data)
  }
})

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    message.success('复制成功')
  } catch (error) {
    console.error('Failed to copy:', error)
    message.error('复制失败')
  }
}

const handleExpand = () => {
  expanded.value = !expanded.value
}

const handleDownload = () => {
  try {
    const blob = new Blob([formattedJson.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = props.fileName
    link.click()
    URL.revokeObjectURL(url)
    message.success('下载成功')
  } catch (error) {
    console.error('Failed to download:', error)
    message.error('下载失败')
  }
}
</script>

<style scoped lang="scss">
.json-preview {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.json-toolbar {
  padding: 8px 12px;
  background-color: #fafafa;
  border-bottom: 1px solid #d9d9d9;
}

.json-content {
  max-height: 400px;
  overflow: auto;
  background-color: #fff;

  &.expanded {
    max-height: none;
  }

  pre {
    margin: 0;
    padding: 12px;

    code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #333;
    }
  }

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
