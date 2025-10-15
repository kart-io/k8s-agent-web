/**
 * 请求重试工具
 * 提供智能的请求重试机制
 */

/**
 * 重试配置
 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
  /** 是否使用指数退避 */
  exponentialBackoff?: boolean;
  /** 最大延迟时间（毫秒） */
  maxDelay?: number;
  /** 可重试的 HTTP 状态码 */
  retryableStatusCodes?: number[];
  /** 判断是否应该重试的函数 */
  shouldRetry?: (error: any, attempt: number) => boolean;
  /** 重试前的回调 */
  onRetry?: (error: any, attempt: number) => void;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  maxDelay: 10_000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  shouldRetry: () => true,
  onRetry: () => {},
};

/**
 * 计算延迟时间
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  exponential: boolean,
  maxDelay: number,
): number {
  if (!exponential) {
    return baseDelay;
  }

  // 指数退避：delay = baseDelay * (2 ^ attempt) + 随机抖动
  const exponentialDelay = baseDelay * 2 ** attempt;
  const jitter = Math.random() * 100; // 添加随机抖动，避免惊群效应
  const delay = exponentialDelay + jitter;

  return Math.min(delay, maxDelay);
}

/**
 * 判断错误是否可重试
 */
function isRetryableError(error: any, retryableStatusCodes: number[]): boolean {
  // 网络错误
  if (!error.response && error.request) {
    return true;
  }

  // HTTP 错误
  if (error.response) {
    const status = error.response.status;
    return retryableStatusCodes.includes(status);
  }

  // 超时错误
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * 延迟执行
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 带重试的请求执行器
 * @param fn 要执行的异步函数
 * @param config 重试配置
 * @returns Promise<T>
 *
 * @example
 * const data = await withRetry(
 *   () => api.getData(),
 *   { maxRetries: 3, retryDelay: 1000 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: RetryConfig,
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const {
    maxRetries,
    retryDelay,
    exponentialBackoff,
    maxDelay,
    retryableStatusCodes,
    shouldRetry,
    onRetry,
  } = finalConfig;

  let lastError: any;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      attempt++;

      // 检查是否应该重试
      const isRetryable = isRetryableError(error, retryableStatusCodes);
      const shouldContinue = shouldRetry(error, attempt);

      if (attempt > maxRetries || !isRetryable || !shouldContinue) {
        throw error;
      }

      // 计算延迟时间
      const delay = calculateDelay(
        attempt - 1,
        retryDelay,
        exponentialBackoff,
        maxDelay,
      );

      // 调用重试回调
      onRetry(error, attempt);

      // 在开发环境输出重试信息
      if (import.meta.env.DEV) {
        console.warn(
          `🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms`,
          error,
        );
      }

      // 等待后重试
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * 创建带重试的 API 调用函数
 * @param apiFn API 函数
 * @param config 重试配置
 * @returns 包装后的 API 函数
 *
 * @example
 * const getUserWithRetry = createRetryableApi(
 *   (id: string) => api.getUser(id),
 *   { maxRetries: 3 }
 * );
 *
 * const user = await getUserWithRetry('123');
 */
export function createRetryableApi<T extends (...args: any[]) => Promise<any>>(
  apiFn: T,
  config?: RetryConfig,
): T {
  return ((...args: any[]) => {
    return withRetry(() => apiFn(...args), config);
  }) as T;
}

/**
 * 重试装饰器
 * 用于类方法
 *
 * @example
 * class ApiService {
 *   @Retry({ maxRetries: 3 })
 *   async fetchData() {
 *     return await api.getData();
 *   }
 * }
 */
export function Retry(config?: RetryConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRetry(() => originalMethod.apply(this, args), config);
    };

    return descriptor;
  };
}

/**
 * 批量重试
 * 对多个请求进行重试，但不会因为某个请求失败而中断其他请求
 *
 * @example
 * const results = await batchRetry([
 *   () => api.getUser('1'),
 *   () => api.getUser('2'),
 *   () => api.getUser('3'),
 * ], { maxRetries: 2 });
 */
export async function batchRetry<T>(
  fns: Array<() => Promise<T>>,
  config?: RetryConfig,
): Promise<Array<null | T>> {
  const promises = fns.map((fn) =>
    withRetry(fn, config).catch((error) => {
      console.error('Batch retry failed:', error);
      return null;
    }),
  );

  return Promise.all(promises);
}

/**
 * 条件重试
 * 只在满足特定条件时才重试
 *
 * @example
 * const data = await conditionalRetry(
 *   () => api.getData(),
 *   (error) => error.status === 503, // 仅在 503 时重试
 *   { maxRetries: 5 }
 * );
 */
export async function conditionalRetry<T>(
  fn: () => Promise<T>,
  condition: (error: any) => boolean,
  config?: RetryConfig,
): Promise<T> {
  return withRetry(fn, {
    ...config,
    shouldRetry: (error, attempt) => {
      const baseCondition = config?.shouldRetry?.(error, attempt) ?? true;
      return baseCondition && condition(error);
    },
  });
}
