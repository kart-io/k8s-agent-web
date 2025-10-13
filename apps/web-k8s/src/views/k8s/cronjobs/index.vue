<script setup lang="ts">
import { Card, Empty } from "ant-design-vue";
</script>

<template>
  <div class="p-5">
    <Card title="开发中">
      <Empty description="页面开发中..." />
    </Card>
  </div>
</template>

<style scoped>
.p-5 { padding: 20px; }
</style>
