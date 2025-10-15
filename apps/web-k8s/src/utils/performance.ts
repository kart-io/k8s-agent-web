/**
 * 性能监控工具
 * 用于监控和分析应用性能
 */

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 操作名称 */
  name: string;
  /** 开始时间 */
  startTime: number;
  /** 结束时间 */
  endTime?: number;
  /** 耗时（毫秒） */
  duration?: number;
  /** 附加信息 */
  metadata?: Record<string, any>;
}

/**
 * 性能监控器
 */
class PerformanceMonitor {
  private completedMetrics: PerformanceMetrics[] = [];
  private enabled: boolean = true;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  /**
   * 清空指标
   */
  clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
  }

  /**
   * 结束监控
   */
  end(name: string, additionalMetadata?: Record<string, any>): null | number {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    this.metrics.delete(name);
    this.completedMetrics.push(metric);

    // 在开发环境输出性能信息
    if (import.meta.env.DEV) {
      this.logMetric(metric);
    }

    return metric.duration;
  }

  /**
   * 导出性能报告
   */
  exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.completedMetrics,
      stats: {} as Record<string, any>,
    };

    // 为每个操作生成统计信息
    const uniqueNames = [...new Set(this.completedMetrics.map((m) => m.name))];
    for (const name of uniqueNames) {
      report.stats[name] = this.getStats(name);
    }

    return JSON.stringify(report, null, 2);
  }

  /**
   * 获取特定操作的平均耗时
   */
  getAverageDuration(name: string): null | number {
    const matchedMetrics = this.completedMetrics.filter(
      (m) => m.name === name && m.duration !== undefined,
    );

    if (matchedMetrics.length === 0) return null;

    const total = matchedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / matchedMetrics.length;
  }

  /**
   * 获取所有完成的指标
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.completedMetrics];
  }

  /**
   * 获取性能统计
   */
  getStats(name?: string): null | {
    avgDuration: number;
    count: number;
    maxDuration: number;
    minDuration: number;
    totalDuration: number;
  } {
    const metrics = name
      ? this.completedMetrics.filter((m) => m.name === name)
      : this.completedMetrics;

    if (metrics.length === 0) return null;

    const durations = metrics
      .map((m) => m.duration)
      .filter((d): d is number => d !== undefined);

    return {
      count: metrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalDuration: durations.reduce((a, b) => a + b, 0),
    };
  }

  /**
   * 测量异步操作性能
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>,
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name, { success: true });
      return result;
    } catch (error) {
      this.end(name, { success: false, error: String(error) });
      throw error;
    }
  }

  /**
   * 测量同步操作性能
   */
  measureSync<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.start(name, metadata);
    try {
      const result = fn();
      this.end(name, { success: true });
      return result;
    } catch (error) {
      this.end(name, { success: false, error: String(error) });
      throw error;
    }
  }

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 开始监控
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    const metric: PerformanceMetrics = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.metrics.set(name, metric);
  }

  /**
   * 根据耗时返回颜色
   */
  private getColorByDuration(duration?: number): string {
    if (!duration) return 'gray';
    if (duration < 100) return '#52c41a'; // 绿色
    if (duration < 300) return '#faad14'; // 橙色
    if (duration < 1000) return '#ff7a45'; // 深橙
    return '#f5222d'; // 红色
  }

  /**
   * 输出指标到控制台
   */
  private logMetric(metric: PerformanceMetrics): void {
    const duration = metric.duration?.toFixed(2);
    const color = this.getColorByDuration(metric.duration);

    // eslint-disable-next-line no-console
    console.log(
      `%c⏱️ ${metric.name}: ${duration}ms`,
      `color: ${color}; font-weight: bold`,
      metric.metadata || '',
    );
  }
}

// 单例实例
export const performanceMonitor = new PerformanceMonitor();

/**
 * 性能监控装饰器
 * 用于监控类方法性能
 *
 * @example
 * class ApiService {
 *   @Performance('fetchData')
 *   async fetchData() {
 *     return await api.getData();
 *   }
 * }
 */
export function Performance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measure(metricName, () =>
        originalMethod.apply(this, args),
      );
    };

    return descriptor;
  };
}

/**
 * API 性能监控 Hook
 * 用于 Vue 组件
 *
 * @example
 * const { measureAsync } = usePerformance();
 * const data = await measureAsync('loadData', () => api.getData());
 */
export function usePerformance() {
  return {
    start: (name: string, metadata?: Record<string, any>) => {
      performanceMonitor.start(name, metadata);
    },
    end: (name: string, metadata?: Record<string, any>) => {
      return performanceMonitor.end(name, metadata);
    },
    measure: <T>(
      name: string,
      fn: () => Promise<T>,
      metadata?: Record<string, any>,
    ) => {
      return performanceMonitor.measure(name, fn, metadata);
    },
    measureSync: <T>(
      name: string,
      fn: () => T,
      metadata?: Record<string, any>,
    ) => {
      return performanceMonitor.measureSync(name, fn, metadata);
    },
    getStats: (name?: string) => {
      return performanceMonitor.getStats(name);
    },
    clear: () => {
      performanceMonitor.clear();
    },
  };
}

/**
 * 组件加载时间监控
 */
export function measureComponentLoad(componentName: string): {
  onMounted: () => void;
} {
  const startTime = performance.now();

  return {
    onMounted: () => {
      const duration = performance.now() - startTime;
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(
          `%c🎨 Component "${componentName}" loaded in ${duration.toFixed(2)}ms`,
          'color: #1890ff; font-weight: bold',
        );
      }
    },
  };
}

/**
 * API 请求性能监控
 */
export function monitorApiRequest(url: string, method: string = 'GET') {
  const name = `API: ${method} ${url}`;
  performanceMonitor.start(name, { url, method });

  return {
    end: (status?: number, error?: any) => {
      performanceMonitor.end(name, {
        status,
        error: error ? String(error) : undefined,
      });
    },
  };
}

/**
 * 检测慢操作
 */
export function detectSlowOperations(threshold: number = 1000): void {
  const metrics = performanceMonitor.getMetrics();
  const slowOps = metrics.filter((m) => m.duration && m.duration > threshold);

  if (slowOps.length > 0 && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.group('🐌 Slow Operations Detected');
    slowOps.forEach((op) => {
      console.warn(`${op.name}: ${op.duration?.toFixed(2)}ms`, op.metadata);
    });
    // eslint-disable-next-line no-console
    console.groupEnd();
  }
}

// 在开发环境自动检测慢操作
if (import.meta.env.DEV) {
  setInterval(() => detectSlowOperations(1000), 10_000); // 每 10 秒检测一次
}
