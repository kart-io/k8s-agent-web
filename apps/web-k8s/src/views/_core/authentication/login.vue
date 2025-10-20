<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, markRaw, nextTick, ref } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const loginFormRef = ref();
const captchaKey = ref(0); // 用于强制重新渲染 captcha

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: markRaw(SliderCaptcha),
      componentProps: {
        key: captchaKey.value, // 通过 key 强制重新渲染
      },
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    },
  ];
});

// 处理登录提交，失败后重置滑动验证
async function handleLogin(values: Record<string, any>) {
  try {
    await authStore.authLogin(values);
    // 登录成功，不做任何处理
  } catch {
    // 登录失败，重置滑动验证
    await resetCaptcha();
    // 不重新抛出错误，auth store 已经显示了错误提示
  }
}

// 重置滑动验证 - 通过改变 key 强制重新渲染组件
async function resetCaptcha() {
  // 改变 key，强制重新创建 captcha 组件
  captchaKey.value += 1;

  // 等待 DOM 更新
  await nextTick();

  // 重置表单字段值为初始状态
  const formApi = loginFormRef.value?.getFormApi?.();
  if (formApi) {
    formApi.setFieldValue('captcha', false);
  }
}
</script>

<template>
  <AuthenticationLogin
    ref="loginFormRef"
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="handleLogin"
  />
</template>
