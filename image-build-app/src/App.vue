<template>
  <div class="image-build-app-container">
    <router-view />
  </div>
</template>

<script setup>
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.image-build-app-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
