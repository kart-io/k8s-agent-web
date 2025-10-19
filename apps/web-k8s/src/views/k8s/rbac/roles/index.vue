<script lang="ts" setup>
import { createRoleConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sRoles' });
</script>

<template>
  <div>
    <GenericResourcePage :config-factory="createRoleConfig" />
  </div>
</template>

<style scoped></style>
