/**
 * 环境变量工具函数
 */

/**
 * 是否使用 K8s Mock 数据
 * 通过环境变量 VITE_USE_K8S_MOCK 控制
 *
 * 注意: 所有 Mock 数据都由 backend-mock 服务提供
 * - true: K8s API 请求发送到 backend-mock 服务
 * - false: K8s API 请求发送到真实后端服务
 */
export function useK8sMock(): boolean {
  const useMock = import.meta.env.VITE_USE_K8S_MOCK;

  // 支持字符串 'true' / 'false' 和布尔值
  if (typeof useMock === 'string') {
    return useMock.toLowerCase() === 'true';
  }

  return Boolean(useMock);
}

/**
 * 是否使用核心 API Mock (认证、用户信息等)
 * 通过环境变量 VITE_USE_CORE_MOCK 控制
 *
 * 注意: 所有 Mock 数据都由 backend-mock 服务提供
 * - true: 核心 API 请求发送到 backend-mock 服务
 * - false: 核心 API 请求发送到真实后端服务
 */
export function useCoreMock(): boolean {
  const useMock = import.meta.env.VITE_USE_CORE_MOCK;

  // 支持字符串 'true' / 'false' 和布尔值
  if (typeof useMock === 'string') {
    return useMock.toLowerCase() === 'true';
  }

  // 如果没有设置 VITE_USE_CORE_MOCK，则跟随 VITE_NITRO_MOCK 的设置
  // 这样可以保持向后兼容
  if (useMock === undefined) {
    const nitroMock = import.meta.env.VITE_NITRO_MOCK;
    if (typeof nitroMock === 'string') {
      return nitroMock.toLowerCase() === 'true';
    }
    return Boolean(nitroMock);
  }

  return Boolean(useMock);
}

/**
 * 是否启用 Nitro Mock 服务
 * 通过环境变量 VITE_NITRO_MOCK 控制
 *
 * 当启用时，Vite 会将 /api 代理到 backend-mock 服务 (http://localhost:5320)
 */
export function useNitroMock(): boolean {
  const useMock = import.meta.env.VITE_NITRO_MOCK;

  if (typeof useMock === 'string') {
    return useMock.toLowerCase() === 'true';
  }

  return Boolean(useMock);
}

/**
 * 获取环境变量（带类型转换）
 */
export function getEnv(key: string, defaultValue?: string): string {
  return import.meta.env[key] ?? defaultValue ?? '';
}

/**
 * 获取布尔类型环境变量
 */
export function getEnvBoolean(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key];

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return value === undefined ? defaultValue : Boolean(value);
}
