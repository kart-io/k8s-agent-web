<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, markRaw } from 'vue';
import { useRoute } from 'vue-router';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { message } from 'ant-design-vue';

import { loginApi, getUserInfoApi } from '../api/auth';
import { setToken, setUserInfo } from '../utils/storage';

defineOptions({ name: 'Login' });

const route = useRoute();
const loading = computed(() => false);

const MOCK_USER_OPTIONS: BasicOption[] = [
  {
    label: 'Super - vben',
    value: 'vben',
  },
  {
    label: 'Admin - admin',
    value: 'admin',
  },
  {
    label: 'User - jack',
    value: 'jack',
  },
];

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenSelect',
      componentProps: {
        options: MOCK_USER_OPTIONS,
        placeholder: '请选择账户',
      },
      fieldName: 'selectAccount',
      label: '选择账户',
      rules: z
        .string()
        .min(1, { message: '请选择账户' })
        .optional()
        .default('vben'),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入用户名',
      },
      dependencies: {
        trigger(values, form) {
          if (values.selectAccount) {
            const findUser = MOCK_USER_OPTIONS.find(
              (item) => item.value === values.selectAccount,
            );
            if (findUser) {
              form.setValues({
                password: '123456',
                username: findUser.value,
              });
            }
          }
        },
        triggerFields: ['selectAccount'],
      },
      fieldName: 'username',
      label: '用户名',
      rules: z.string().min(1, { message: '请输入用户名' }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
      rules: z.string().min(1, { message: '请输入密码' }),
    },
    {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: '请完成滑块验证',
      }),
    },
  ];
});

async function handleSubmit(values: Record<string, any>) {
  try {
    // 调用登录 API
    const { accessToken } = await loginApi({
      username: values.username,
      password: values.password,
    });

    if (accessToken) {
      // 存储 Token
      setToken(accessToken);

      // 获取用户信息
      const userInfo = await getUserInfoApi();
      setUserInfo(userInfo);

      message.success(`登录成功！欢迎 ${userInfo.realName || userInfo.username}`);

      // 获取重定向 URL
      const redirectUrl = route.query.redirect as string;

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        if (redirectUrl) {
          // 带 Token 跳转回原应用
          const separator = redirectUrl.includes('?') ? '&' : '?';
          window.location.href = `${redirectUrl}${separator}token=${accessToken}`;
        } else {
          // 默认跳转到主应用
          const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:5666';
          window.location.href = `${mainAppUrl}?token=${accessToken}`;
        }
      }, 500);
    }
  } catch (error: any) {
    message.error(error.message || '登录失败，请检查用户名和密码');
    throw error;
  }
}
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="loading"
    @submit="handleSubmit"
  />
</template>
