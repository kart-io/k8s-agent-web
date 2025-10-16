<script lang="ts" setup>
/**
 * NetworkPolicy 资源管理页面 - 使用通用页面模板
 */
import { createNetworkPolicyConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/_shared/GenericResourcePage.vue';

defineOptions({ name: 'K8sNetworkPolicies' });
</script>

<template>
  <GenericResourcePage :config-factory="createNetworkPolicyConfig" />
</template>
