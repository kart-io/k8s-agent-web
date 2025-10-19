/**
 * 应用性能优化集成
 * 统一管理所有性能优化功能的初始化
 */

import type { App } from 'vue';
import type { Router } from 'vue-router';

import { createRoutePreloader } from './route-preloader';

/**
 * 性能优化选项
 */
export interface PerformanceOptions {
  /** 是否启用路由预加载 */
  enableRoutePreload?: boolean;
  /** 路由预加载优先级列表 */
  priorityRoutes?: string[];
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean;
}

/**
 * 初始化性能优化
 */
export function setupPerformance(
  app: App,
  router: Router,
  options: PerformanceOptions = {},
) {
  const {
    enableRoutePreload = true,
    priorityRoutes = [
      '/k8s/dashboard',
      '/k8s/pods',
      '/k8s/deployments',
      '/k8s/services',
      '/k8s/nodes',
    ],
    enablePerformanceMonitoring = import.meta.env.DEV,
  } = options;

  // 1. 路由预加载
  if (enableRoutePreload) {
    const preloader = createRoutePreloader(router, {
      hoverDelay: 100,
      enableIdlePreload: true,
      idleThreshold: 2000,
      priorityRoutes,
    });

    // 在开发环境输出统计信息
    if (import.meta.env.DEV) {
      router.afterEach(() => {
        setTimeout(() => {
          const stats = preloader.getStats();
          // eslint-disable-next-line no-console
          console.log('[Performance] Route preload stats:', stats);
        }, 1000);
      });
    }

    // 应用销毁时清理
    app.unmount = new Proxy(app.unmount, {
      apply(target, thisArg, args) {
        preloader.destroy();
        return Reflect.apply(target, thisArg, args);
      },
    });
  }

  // 2. 性能监控
  if (enablePerformanceMonitoring) {
    setupPerformanceMonitoring(router);
  }

  // 3. 资源提示（预连接、DNS 预解析等）
  setupResourceHints();

  // eslint-disable-next-line no-console
  console.log('[Performance] Performance optimizations initialized');
}

/**
 * 设置性能监控
 */
function setupPerformanceMonitoring(router: Router) {
  // 监控路由切换性能
  router.beforeEach((to, from, next) => {
    performance.mark(`route-start-${to.path}`);
    next();
  });

  router.afterEach((to) => {
    performance.mark(`route-end-${to.path}`);
    try {
      performance.measure(
        `route-${to.path}`,
        `route-start-${to.path}`,
        `route-end-${to.path}`,
      );

      const measure = performance.getEntriesByName(`route-${to.path}`)[0];
      if (measure && import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(
          `[Performance] Route ${to.path} loaded in ${measure.duration.toFixed(2)}ms`,
        );
      }

      // 清理标记
      performance.clearMarks(`route-start-${to.path}`);
      performance.clearMarks(`route-end-${to.path}`);
      performance.clearMeasures(`route-${to.path}`);
    } catch {
      // 忽略测量错误
    }
  });

  // 监控页面性能指标
  if ('PerformanceObserver' in window) {
    // 监控 LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // eslint-disable-next-line no-console
        console.log('[Performance] LCP:', entry);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // 监控 FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // eslint-disable-next-line no-console
        console.log('[Performance] FID:', entry);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // 监控 CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // eslint-disable-next-line no-console
        console.log('[Performance] CLS:', entry);
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
}

/**
 * 设置资源提示
 */
function setupResourceHints() {
  // DNS 预解析
  const dnsUrls = [
    // 添加需要预解析的域名
    // 'https://api.example.com',
  ];

  dnsUrls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.append(link);
  });

  // 预连接到关键域名
  const preconnectUrls = [
    // 添加需要预连接的域名
    // 'https://api.example.com',
  ];

  preconnectUrls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.append(link);
  });
}

/**
 * 获取性能报告
 */
export function getPerformanceReport() {
  const navigation = performance.getEntriesByType(
    'navigation',
  )[0] as PerformanceNavigationTiming;

  if (!navigation) {
    return null;
  }

  return {
    // DNS 查询时间
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    // TCP 连接时间
    tcp: navigation.connectEnd - navigation.connectStart,
    // 请求响应时间
    request: navigation.responseEnd - navigation.requestStart,
    // DOM 解析时间
    domParse: navigation.domInteractive - navigation.responseEnd,
    // DOM 内容加载完成时间
    domContentLoaded:
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart,
    // 资源加载时间
    resourceLoad:
      navigation.loadEventStart - navigation.domContentLoadedEventEnd,
    // 总加载时间
    total: navigation.loadEventEnd - navigation.fetchStart,
  };
}
