<template>
  <div class="system-app-container">
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route.fullPath" />
    </router-view>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

watch(() => route.fullPath, (newPath) => {
  console.log('[System App] Route changed to:', newPath)
  console.log('[System App] Current route name:', route.name)
  console.log('[System App] Current route path:', route.path)
}, { immediate: true })
</script>

<style scoped>
.system-app-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
