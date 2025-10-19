import type { Recordable } from '@vben/types';

import axios from 'axios';

import { getToken } from '../utils/storage';

const apiUrl = import.meta.env.VITE_GLOB_API_URL;

const client = axios.create({
  baseURL: apiUrl,
  timeout: 10_000,
});

// 请求拦截器：自动添加 Authorization 头
client.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器：处理401错误
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，不需要清除 token，因为可能是首次加载页面没有 token
      console.warn('Unauthorized request, token may be missing or invalid');
    }
    return Promise.reject(error);
  },
);

/**
 * 登录接口
 */
export async function loginApi(data: Recordable<any>) {
  return client.post('/auth/login', data).then((res) => res.data.data);
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return client.get('/user/info').then((res) => res.data.data);
}

/**
 * 获取访问权限代码
 */
export async function getAccessCodesApi() {
  return client.get('/auth/codes').then((res) => res.data.data || []);
}
