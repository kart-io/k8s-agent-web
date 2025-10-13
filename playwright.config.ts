import type { PlaywrightTestConfig } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

/**
 * 全局 E2E 测试配置
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<PlaywrightTestConfig>({
  // 测试目录
  testDir: './e2e',

  // 测试匹配模式
  testMatch: ['**/*.{test,spec}.{js,ts}'],

  // 并行执行
  fullyParallel: true,

  // CI 环境下禁止 test.only
  forbidOnly: !!process.env.CI,

  // 重试次数
  retries: process.env.CI ? 2 : 0,

  // 工作进程数
  workers: process.env.CI ? 1 : undefined,

  // 报告器配置
  reporter: [
    ['list'],
    ['html', { outputFolder: './test-results/e2e', open: 'never' }],
    process.env.CI ? ['github'] : null,
  ].filter(Boolean) as any[],

  // 全局配置
  use: {
    // 基础URL
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',

    // 追踪配置
    trace: 'on-first-retry',

    // 截图配置
    screenshot: 'only-on-failure',

    // 视频配置
    video: 'retain-on-failure',

    // 浏览器配置
    headless: !!process.env.CI,

    // 视口大小
    viewport: { width: 1280, height: 720 },

    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,

    // 操作超时
    actionTimeout: 10000,

    // 导航超时
    navigationTimeout: 30000,
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 移动端测试
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Edge浏览器
    {
      name: 'microsoft-edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
  ],

  // 期望配置
  expect: {
    // 期望超时
    timeout: 5000,

    // 截图配置
    toMatchSnapshot: {
      maxDiffPixels: 100,
    },
  },

  // 输出目录
  outputDir: './test-results/e2e-artifacts',

  // Web服务器配置
  webServer: {
    command: process.env.CI ? 'pnpm build && pnpm preview' : 'pnpm dev',
    port: process.env.CI ? 4173 : 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});