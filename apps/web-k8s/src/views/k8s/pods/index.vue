<script setup lang="ts">
import { Card, Empty } from 'ant-design-vue';
</script>

<template>
  <div class="p-5">
    <Card title="Pod 管理">
      <Empty description="Pod 管理页面开发中...">
        <template #image>
          <div style="font-size: 48px">🐳</div>
        </template>
      </Empty>
    </Card>
  </div>
</template>

<style scoped>
.p-5 {
  padding: 20px;
}
</style>
