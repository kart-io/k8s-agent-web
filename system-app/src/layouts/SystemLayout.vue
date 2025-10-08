<template>
  <div class="system-layout">
    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
      <a-tab-pane key="/users" tab="用户管理" />
      <a-tab-pane key="/roles" tab="角色管理" />
      <a-tab-pane key="/permissions" tab="权限管理" />
    </a-tabs>

    <div class="system-content">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeTab = ref(route.path)

watch(() => route.path, (newPath) => {
  activeTab.value = newPath
}, { immediate: true })

const handleTabChange = (key) => {
  router.push(key)
}
</script>

<style scoped>
.system-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.system-content {
  flex: 1;
  overflow: auto;
  margin-top: 16px;
}
</style>
