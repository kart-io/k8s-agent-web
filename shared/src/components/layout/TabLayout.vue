<template>
  <div class="tab-layout">
    <a-tabs
      v-model:activeKey="activeKey"
      type="editable-card"
      hide-add
      @edit="onEdit"
      @change="onTabChange"
    >
      <a-tab-pane
        v-for="tab in tabs"
        :key="tab.key"
        :tab="tab.label"
        :closable="tab.closable !== false"
      />
    </a-tabs>
    <div class="tab-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    default: () => []
  },
  defaultActiveKey: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['tab-change', 'tab-close'])

const router = useRouter()
const route = useRoute()

const activeKey = ref(props.defaultActiveKey || (props.tabs[0]?.key || ''))

// 监听路由变化，更新激活的标签
watch(
  () => route.path,
  (newPath) => {
    const tab = props.tabs.find(t => t.path === newPath)
    if (tab) {
      activeKey.value = tab.key
    }
  },
  { immediate: true }
)

const onTabChange = (key) => {
  const tab = props.tabs.find(t => t.key === key)
  if (tab?.path) {
    router.push(tab.path)
  }
  emit('tab-change', key, tab)
}

const onEdit = (targetKey, action) => {
  if (action === 'remove') {
    const tab = props.tabs.find(t => t.key === targetKey)
    emit('tab-close', targetKey, tab)
  }
}
</script>

<style scoped>
.tab-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

:deep(.ant-tabs) {
  margin-bottom: 0;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 0;
  padding: 0 16px;
  background: #fff;
}

:deep(.ant-tabs-content-holder) {
  display: none;
}
</style>
