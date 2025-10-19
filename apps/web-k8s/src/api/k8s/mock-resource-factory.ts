/**
 * Mock 资源 API 工厂
 *
 * 支持两种 Mock 模式：
 * 1. 前端内置 Mock: VITE_USE_K8S_MOCK=true，为每个资源创建前端 Mock API
 * 2. Backend Mock: VITE_USE_K8S_MOCK=false，所有请求路由到 backend-mock 服务
 */

import type { ResourceApi } from './resource-api-factory';

import { useK8sMock } from '#/utils/env';

/**
 * 创建支持 Mock 的资源 API
 *
 * @param realApi 真实 API 对象
 * @param resourceType 资源类型（如 'pod', 'deployment', 'secret'）
 * @returns 资源 API 对象
 */
export function createMockableResourceApi<T>(
  realApi: ResourceApi<T>,
  resourceType: string,
): ResourceApi<T> {
  const useMock = useK8sMock();

  if (useMock) {
    // 前端内置 Mock 模式：为 list 操作包装 Mock 数据
    console.warn(`[K8s API] Registered ${resourceType} API with frontend mock`);

    return {
      ...realApi,
      list: async (params: any) => {
        console.warn(
          `[K8s Mock] Fetching ${resourceType} list with frontend mock`,
        );
        // 动态导入对应的 Mock 数据生成函数
        try {
          const mockModule = await import('./mock');
          const mockFunctionName = `getMock${capitalize(resourceType)}List`;

          if (typeof mockModule[mockFunctionName] === 'function') {
            return mockModule[mockFunctionName](params);
          }

          console.warn(
            `[K8s Mock] No mock function found for ${resourceType}, falling back to real API`,
          );
          return realApi.list(params);
        } catch (error) {
          console.error(
            `[K8s Mock] Error loading mock for ${resourceType}:`,
            error,
          );
          return realApi.list(params);
        }
      },
    };
  }

  // Backend Mock 或真实 API 模式
  console.warn(
    `[K8s API] Registered ${resourceType} API (routing handled by config)`,
  );
  return realApi;
}

/**
 * 首字母大写
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
