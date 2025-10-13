import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * 自定义 Fixtures
 */
export interface TestFixtures {
  /**
   * 已认证的页面
   */
  authenticatedPage: Page;

  /**
   * 测试数据
   */
  testData: {
    user: {
      username: string;
      password: string;
      email: string;
    };
    urls: {
      home: string;
      login: string;
      dashboard: string;
    };
  };
}

/**
 * 扩展的测试基类
 */
export const test = base.extend<TestFixtures>({
  // 认证页面
  authenticatedPage: async ({ page }, use) => {
    // 执行登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'vben');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // 等待登录完成
    await page.waitForURL('**/dashboard');

    // 使用认证后的页面
    await use(page);

    // 清理
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  },

  // 测试数据
  testData: async ({}, use) => {
    await use({
      user: {
        username: 'vben',
        password: '123456',
        email: 'vben@example.com',
      },
      urls: {
        home: '/',
        login: '/login',
        dashboard: '/dashboard',
      },
    });
  },
});

export { expect } from '@playwright/test';