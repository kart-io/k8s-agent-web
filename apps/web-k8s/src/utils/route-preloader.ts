/**
 * 路由预加载工具
 * 根据用户行为智能预加载可能访问的路由组件
 *
 * 策略：
 * 1. 鼠标悬停在导航链接上时预加载
 * 2. 用户空闲时预加载常用路由
 * 3. 基于访问历史预测并预加载
 */

import type { Router } from 'vue-router';

interface PreloadOptions {
  /** 鼠标悬停延迟（毫秒） */
  hoverDelay?: number;
  /** 是否启用空闲预加载 */
  enableIdlePreload?: boolean;
  /** 空闲时间阈值（毫秒） */
  idleThreshold?: number;
  /** 预加载优先级路由 */
  priorityRoutes?: string[];
}

export class RoutePreloader {
  private router: Router;
  private options: Required<PreloadOptions>;
  private preloadedRoutes: Set<string>;
  private hoverTimers: Map<string, NodeJS.Timeout>;
  private idleTimer: NodeJS.Timeout | null = null;
  private lastActivityTime: number = Date.now();

  constructor(router: Router, options: PreloadOptions = {}) {
    this.router = router;
    this.options = {
      hoverDelay: options.hoverDelay ?? 100,
      enableIdlePreload: options.enableIdlePreload ?? true,
      idleThreshold: options.idleThreshold ?? 2000,
      priorityRoutes: options.priorityRoutes ?? [],
    };
    this.preloadedRoutes = new Set();
    this.hoverTimers = new Map();
  }

  /**
   * 初始化预加载器
   */
  init() {
    this.setupHoverPreload();
    if (this.options.enableIdlePreload) {
      this.setupIdlePreload();
    }
    // 预加载优先级路由
    this.preloadPriorityRoutes();
  }

  /**
   * 设置悬停预加载
   */
  private setupHoverPreload() {
    // 使用事件委托监听所有导航链接
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/"]') as HTMLAnchorElement;

      if (link && link.href) {
        const path = new URL(link.href).pathname;
        this.schedulePreload(path);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/"]') as HTMLAnchorElement;

      if (link && link.href) {
        const path = new URL(link.href).pathname;
        this.cancelPreload(path);
      }
    });
  }

  /**
   * 设置空闲预加载
   */
  private setupIdlePreload() {
    // 监听用户活动
    const resetIdleTimer = () => {
      this.lastActivityTime = Date.now();
      if (this.idleTimer) {
        clearTimeout(this.idleTimer);
      }

      this.idleTimer = setTimeout(() => {
        this.preloadCommonRoutes();
      }, this.options.idleThreshold);
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
      (event) => {
        document.addEventListener(event, resetIdleTimer, { passive: true });
      },
    );

    // 初始设置
    resetIdleTimer();
  }

  /**
   * 调度预加载
   */
  private schedulePreload(path: string) {
    // 如果已经预加载过，跳过
    if (this.preloadedRoutes.has(path)) {
      return;
    }

    // 设置延迟预加载
    const timer = setTimeout(() => {
      this.preloadRoute(path);
      this.hoverTimers.delete(path);
    }, this.options.hoverDelay);

    this.hoverTimers.set(path, timer);
  }

  /**
   * 取消预加载
   */
  private cancelPreload(path: string) {
    const timer = this.hoverTimers.get(path);
    if (timer) {
      clearTimeout(timer);
      this.hoverTimers.delete(path);
    }
  }

  /**
   * 预加载路由
   */
  private async preloadRoute(path: string) {
    if (this.preloadedRoutes.has(path)) {
      return;
    }

    try {
      const route = this.router.resolve(path);
      if (route.matched.length > 0) {
        // 预加载路由组件
        const promises = route.matched.map((record) => {
          if (typeof record.components?.default === 'function') {
            return (record.components.default as any)();
          }
          return Promise.resolve();
        });

        await Promise.all(promises);
        this.preloadedRoutes.add(path);

        // 在开发环境输出日志
        if (import.meta.env.DEV) {
          console.log(`[RoutePreloader] Preloaded: ${path}`);
        }
      }
    } catch (error) {
      console.warn(`[RoutePreloader] Failed to preload: ${path}`, error);
    }
  }

  /**
   * 预加载优先级路由
   */
  private async preloadPriorityRoutes() {
    // 使用 requestIdleCallback 在浏览器空闲时预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(
        () => {
          this.options.priorityRoutes.forEach((path) => {
            this.preloadRoute(path);
          });
        },
        { timeout: 2000 },
      );
    } else {
      // 降级：使用 setTimeout
      setTimeout(() => {
        this.options.priorityRoutes.forEach((path) => {
          this.preloadRoute(path);
        });
      }, 1000);
    }
  }

  /**
   * 预加载常用路由
   */
  private async preloadCommonRoutes() {
    // 基于当前路由预测可能访问的路由
    const currentPath = this.router.currentRoute.value.path;

    // K8s 资源相关的常用导航路径
    const predictions: string[] = [];

    if (currentPath.startsWith('/k8s')) {
      // 在 K8s 页面时，预加载常用资源页面
      predictions.push(
        '/k8s/dashboard',
        '/k8s/pods',
        '/k8s/deployments',
        '/k8s/services',
      );
    }

    // 去除已预加载的路由
    const routesToPreload = predictions.filter(
      (path) => !this.preloadedRoutes.has(path),
    );

    // 逐个预加载，避免一次性加载过多
    for (const path of routesToPreload.slice(0, 3)) {
      await this.preloadRoute(path);
      // 每个路由之间间隔 500ms
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  /**
   * 销毁预加载器
   */
  destroy() {
    // 清理所有定时器
    this.hoverTimers.forEach((timer) => clearTimeout(timer));
    this.hoverTimers.clear();

    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
  }

  /**
   * 获取预加载统计
   */
  getStats() {
    return {
      preloadedCount: this.preloadedRoutes.size,
      preloadedRoutes: Array.from(this.preloadedRoutes),
    };
  }
}

/**
 * 创建路由预加载器
 */
export function createRoutePreloader(
  router: Router,
  options?: PreloadOptions,
) {
  const preloader = new RoutePreloader(router, options);
  preloader.init();
  return preloader;
}
