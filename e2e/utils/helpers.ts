import type { Page, Locator } from '@playwright/test';

/**
 * 页面助手类
 */
export class PageHelper {
  constructor(private page: Page) {}

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 等待元素可见并返回
   */
  async waitForElement(selector: string): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    return element;
  }

  /**
   * 安全点击元素
   */
  async safeClick(selector: string) {
    const element = await this.waitForElement(selector);
    await element.click();
  }

  /**
   * 安全填充输入框
   */
  async safeFill(selector: string, value: string) {
    const element = await this.waitForElement(selector);
    await element.fill(value);
  }

  /**
   * 获取元素文本
   */
  async getText(selector: string): Promise<string> {
    const element = await this.waitForElement(selector);
    return element.textContent() ?? '';
  }

  /**
   * 检查元素是否存在
   */
  async elementExists(selector: string): Promise<boolean> {
    return (await this.page.locator(selector).count()) > 0;
  }

  /**
   * 截图
   */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * 等待网络请求完成
   */
  async waitForRequest(urlPattern: string | RegExp) {
    return this.page.waitForRequest(urlPattern);
  }

  /**
   * 等待响应
   */
  async waitForResponse(urlPattern: string | RegExp) {
    return this.page.waitForResponse(urlPattern);
  }

  /**
   * 模拟网络条件
   */
  async simulateNetwork(preset: 'Fast 3G' | 'Slow 3G' | 'Offline') {
    const conditions = {
      'Fast 3G': {
        offline: false,
        downloadThroughput: ((1.6 * 1024 * 1024) / 8),
        uploadThroughput: ((750 * 1024) / 8),
        latency: 150,
      },
      'Slow 3G': {
        offline: false,
        downloadThroughput: ((500 * 1024) / 8),
        uploadThroughput: ((500 * 1024) / 8),
        latency: 400,
      },
      'Offline': {
        offline: true,
        downloadThroughput: 0,
        uploadThroughput: 0,
        latency: 0,
      },
    };

    const context = this.page.context();
    await context.route('**/*', (route) => {
      route.continue();
    });
  }

  /**
   * 清理本地存储
   */
  async clearStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * 设置本地存储
   */
  async setLocalStorage(key: string, value: any) {
    await this.page.evaluate(([k, v]) => {
      localStorage.setItem(k, JSON.stringify(v));
    }, [key, value] as const);
  }

  /**
   * 获取本地存储
   */
  async getLocalStorage(key: string) {
    return this.page.evaluate((k) => {
      const value = localStorage.getItem(k);
      return value ? JSON.parse(value) : null;
    }, key);
  }

  /**
   * 等待导航
   */
  async waitForNavigation(url?: string | RegExp) {
    if (url) {
      await this.page.waitForURL(url);
    } else {
      await this.page.waitForNavigation();
    }
  }

  /**
   * 获取所有控制台消息
   */
  getConsoleMessages() {
    const messages: string[] = [];
    this.page.on('console', (msg) => {
      messages.push(`${msg.type()}: ${msg.text()}`);
    });
    return messages;
  }

  /**
   * 检查控制台错误
   */
  async checkConsoleErrors() {
    const messages = this.getConsoleMessages();
    const errors = messages.filter((msg) => msg.startsWith('error:'));
    return errors;
  }
}

/**
 * 创建页面助手
 */
export function createPageHelper(page: Page): PageHelper {
  return new PageHelper(page);
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成随机字符串
 */
export function randomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成随机邮箱
 */
export function randomEmail(): string {
  return `test-${randomString(8)}@example.com`;
}

/**
 * 格式化日期
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 获取当前时间戳
 */
export function timestamp(): number {
  return Date.now();
}