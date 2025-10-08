<template>
  <div class="monitor-app-container">
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </router-view>
  </div>
</template>

<script setup>
</script>

<style scoped>
.monitor-app-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
