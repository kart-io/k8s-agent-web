<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button, Result } from 'ant-design-vue';

const router = useRouter();

function goHome() {
  router.push('/');
}
</script>

<template>
  <div style="display: flex; align-items: center; justify-content: center; min-height: 80vh">
    <Result
      status="404"
      title="404"
      sub-title="抱歉，您访问的页面不存在"
    >
      <template #extra>
        <Button type="primary" @click="goHome">返回首页</Button>
      </template>
    </Result>
  </div>
</template>
