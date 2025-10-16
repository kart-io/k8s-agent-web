/**
 * 请求缓存工具
 * 提供基于时间的请求结果缓存，减少重复 API 调用
 *
 * 使用示例:
 * const cache = new RequestCache<Pod[]>({ ttl: 60000 }); // 60秒缓存
 * const result = await cache.get('pods-list', async () => {
 *   return await fetchPodList();
 * });
 */

export interface RequestCacheOptions {
  /** 缓存过期时间（毫秒），默认 30 秒 */
  ttl?: number;
  /** 最大缓存条目数，默认 100 */
  maxSize?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

export class RequestCache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly ttl: number;
  private readonly maxSize: number;

  constructor(options: RequestCacheOptions = {}) {
    this.cache = new Map();
    this.ttl = options.ttl ?? 30_000; // 默认 30 秒
    this.maxSize = options.maxSize ?? 100;
  }

  /**
   * 获取缓存数据或执行请求
   * @param key 缓存键
   * @param fetcher 数据获取函数
   * @param force 强制刷新缓存
   */
  async get(
    key: string,
    fetcher: () => Promise<T>,
    force = false,
  ): Promise<T> {
    // 检查缓存
    if (!force) {
      const cached = this.cache.get(key);
      if (cached) {
        const now = Date.now();
        const age = now - cached.timestamp;

        // 缓存未过期，直接返回
        if (age < this.ttl) {
          return cached.data;
        }

        // 如果有正在进行的请求，等待它完成
        if (cached.promise) {
          return cached.promise;
        }
      }
    }

    // 执行请求
    const promise = fetcher();

    // 存储 promise，防止并发请求
    this.cache.set(key, {
      data: null as any,
      timestamp: Date.now(),
      promise,
    });

    try {
      const data = await promise;

      // 存储结果
      this.set(key, data);

      return data;
    } catch (error) {
      // 请求失败时删除缓存
      this.cache.delete(key);
      throw error;
    }
  }

  /**
   * 手动设置缓存
   */
  set(key: string, data: T): void {
    // 如果超过最大size，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 删除指定缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    return age < this.ttl;
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }
}

/**
 * 全局缓存实例
 * 用于 K8s 资源列表数据缓存
 */
export const k8sResourceCache = new RequestCache({
  ttl: 30_000, // 30 秒
  maxSize: 50, // 最多缓存 50 个不同的资源列表
});

/**
 * 生成缓存键
 */
export function generateCacheKey(
  resourceType: string,
  params: Record<string, any>,
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');

  return `${resourceType}?${sortedParams}`;
}
