/**
 * Token 和用户信息存储工具
 */

const TOKEN_KEY = 'vben_access_token';
const USER_INFO_KEY = 'vben_user_info';

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): null | string {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function setUserInfo(userInfo: any) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

export function getUserInfo(): any | null {
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}

export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
}

export function clearAuth() {
  removeToken();
  removeUserInfo();
}
