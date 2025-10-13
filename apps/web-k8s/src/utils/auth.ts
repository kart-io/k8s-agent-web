/**
 * 认证工具函数
 * 用于与主应用共享认证状态
 */

// 使用与 web-auth 统一的 Token Key，确保跨应用共享认证状态
const TOKEN_KEY = 'vben_access_token';
const USER_INFO_KEY = 'vben_user_info';

/**
 * 从 localStorage 获取 Token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 设置 Token 到 localStorage
 */
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 清除 Token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 从 URL 参数获取 Token
 */
export function getTokenFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

/**
 * 获取用户信息
 */
export function getUserInfo(): any | null {
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * 设置用户信息
 */
export function setUserInfo(userInfo: any) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * 清除用户信息
 */
export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * 跳转到认证中心登录页
 */
export function redirectToLogin() {
  // 使用独立的认证中心
  const authAppUrl = import.meta.env.VITE_AUTH_APP_URL || 'http://localhost:5665';
  const currentUrl = window.location.href;

  // 跳转到认证中心登录页，并带上回调 URL
  window.location.href = `${authAppUrl}/#/login?redirect=${encodeURIComponent(currentUrl)}`;
}

/**
 * 从主应用跳转回来时，处理 Token
 */
export function handleAuthCallback(): boolean {
  // 1. 检查 URL 参数中是否有 token
  const tokenFromUrl = getTokenFromUrl();
  if (tokenFromUrl) {
    setToken(tokenFromUrl);

    // 清除 URL 中的 token 参数
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', url.toString());

    return true;
  }

  // 2. 检查 localStorage 中是否有 token（可能是从主应用共享的）
  return isAuthenticated();
}

/**
 * 清除所有认证信息
 */
export function clearAuth() {
  removeToken();
  removeUserInfo();
}
