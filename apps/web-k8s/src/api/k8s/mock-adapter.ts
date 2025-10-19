/**
 * API Mock 模式适配器 (重构版)
 *
 * 统一使用 backend-mock 服务，不再使用前端内置 Mock
 * 根据环境变量控制 API 路由：
 * - Mock 模式: 请求发送到 backend-mock (通过 Vite 代理)
 * - 真实模式: 请求发送到真实后端服务
 */

import { useCoreMock, useK8sMock } from '#/utils/env';

/**
 * 获取 API 基础路径
 * @param apiType API 类型 ('k8s' | 'core')
 * @returns API 基础路径
 */
export function getApiBasePath(apiType: 'core' | 'k8s' = 'k8s'): string {
  const useMock = apiType === 'k8s' ? useK8sMock() : useCoreMock();

  // 获取配置的 API 路径
  const configuredPath = import.meta.env.VITE_GLOB_API_URL || '/api';

  if (useMock) {
    // Mock 模式：使用 /api (通过 Vite 代理到 backend-mock)
    console.warn(`[${apiType.toUpperCase()} Mock] Using backend-mock service`);
    return '/api';
  }

  // 真实模式：使用配置的路径
  console.warn(
    `[${apiType.toUpperCase()} Real] Using real API: ${configuredPath}`,
  );
  return configuredPath;
}

/**
 * 创建支持 Mock 切换的 API 函数
 *
 * 支持两种 Mock 模式：
 * 1. 前端内置 Mock: VITE_USE_K8S_MOCK=true，使用前端提供的 mockApiFn
 * 2. Backend Mock: VITE_USE_K8S_MOCK=false + VITE_NITRO_MOCK=true，路由到 backend-mock
 *
 * @param realApiFn 真实 API 函数
 * @param mockApiFn 前端 Mock API 函数（可选）
 * @returns API 函数
 */
export function createMockableApi<T extends (...args: any[]) => any>(
  realApiFn: T,
  _mockApiFn?: T,
): T {
  // 检查是否使用前端内置 Mock
  if (_mockApiFn && useK8sMock()) {
    console.warn('[K8s Mock] Using frontend inline mock');
    return _mockApiFn;
  }

  // 否则使用真实 API（会被 requestClient 路由到 backend-mock 或真实后端）
  return realApiFn;
}

/**
 * 创建支持 Mock 切换的 API 对象
 *
 * @param realApi 真实 API 对象
 * @param mockApi Mock API 对象（已废弃，不再使用）
 * @returns 真实 API 对象（Mock 由 backend-mock 处理）
 */
export function createMockableApiObject<T extends Record<string, any>>(
  realApi: T,
  _mockApi?: Partial<T>, // 可选参数，用于向后兼容
): T {
  // 直接返回真实 API，Mock 切换由 backend-mock 和请求路由处理
  return realApi;
}
