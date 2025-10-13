/**
 * K8s 应用的 API 请求配置
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { RequestClient } from '@vben/request';

import { message } from 'ant-design-vue';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  // 请求拦截器 - 添加认证信息
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      // 从 localStorage 获取 token
      const token = localStorage.getItem('k8s_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 添加语言设置
      const locale = localStorage.getItem('app_locale') || 'zh-CN';
      config.headers['Accept-Language'] = locale;

      return config;
    },
  });

  // 响应拦截器 - 处理通用响应格式
  client.addResponseInterceptor({
    fulfilled: (response) => {
      const { data } = response;

      // 统一的响应格式: { code, data, message }
      if (data && typeof data === 'object' && 'code' in data) {
        if (data.code === 0) {
          // 成功响应，返回 data 字段
          return data.data;
        } else {
          // 业务错误
          const errorMessage = data.message || '请求失败';
          message.error(errorMessage);
          return Promise.reject(new Error(errorMessage));
        }
      }

      // 非标准格式，直接返回
      return data;
    },
    rejected: (error) => {
      // 处理HTTP错误
      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            message.error('未授权，请重新登录');
            // 清除 token
            localStorage.removeItem('k8s_access_token');
            // 可以跳转到登录页
            break;
          case 403:
            message.error('没有权限访问该资源');
            break;
          case 404:
            message.error('请求的资源不存在');
            break;
          case 500:
            message.error('服务器错误');
            break;
          default:
            message.error(data?.message || '请求失败');
        }
      } else if (error.request) {
        message.error('网络错误，请检查网络连接');
      } else {
        message.error(error.message || '请求失败');
      }

      return Promise.reject(error);
    },
  });

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
