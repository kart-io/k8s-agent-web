import type { Recordable } from '@vben/types';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_GLOB_API_URL;

const client = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

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
