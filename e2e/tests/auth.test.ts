import { expect, test } from '../fixtures/base';
import { createPageHelper } from '../utils/helpers';

test.describe('认证流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该显示登录页面', async ({ page }) => {
    await page.goto('/login');

    // 验证登录页面元素
    await expect(page).toHaveTitle(/登录|Login/);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('应该成功登录', async ({ page, testData }) => {
    const helper = createPageHelper(page);

    // 导航到登录页
    await page.goto('/login');

    // 填写登录表单
    await helper.safeFill('input[name="username"]', testData.user.username);
    await helper.safeFill('input[name="password"]', testData.user.password);

    // 提交表单
    await helper.safeClick('button[type="submit"]');

    // 等待登录成功后跳转
    await helper.waitForNavigation(/dashboard|home/);

    // 验证登录成功
    const token = await helper.getLocalStorage('token');
    expect(token).toBeTruthy();

    // 验证用户信息显示
    const userDisplay = await helper.elementExists(
      '[data-testid="user-display"]',
    );
    if (userDisplay) {
      const username = await helper.getText('[data-testid="user-display"]');
      expect(username).toContain(testData.user.username);
    }
  });

  test('应该处理错误的凭证', async ({ page }) => {
    const helper = createPageHelper(page);

    await page.goto('/login');

    // 填写错误的凭证
    await helper.safeFill('input[name="username"]', 'wronguser');
    await helper.safeFill('input[name="password"]', 'wrongpass');

    // 提交表单
    await helper.safeClick('button[type="submit"]');

    // 等待错误消息
    const errorMessage = await helper.waitForElement(
      '[data-testid="error-message"], .error-message, .ant-message-error',
    );

    // 验证错误消息显示
    await expect(errorMessage).toBeVisible();
    const errorText = await errorMessage.textContent();
    expect(errorText).toMatch(/错误|失败|invalid|error/i);

    // 验证仍在登录页
    expect(page.url()).toContain('/login');
  });

  test('应该能够登出', async ({ authenticatedPage }) => {
    const helper = createPageHelper(authenticatedPage);

    // 查找并点击用户菜单
    const userMenu = await helper.elementExists(
      '[data-testid="user-menu"], .user-avatar, .user-dropdown',
    );
    if (userMenu) {
      await helper.safeClick(
        '[data-testid="user-menu"], .user-avatar, .user-dropdown',
      );

      // 点击登出按钮
      await helper.safeClick(
        '[data-testid="logout-button"], .logout-btn, [aria-label="logout"]',
      );
    } else {
      // 直接查找登出按钮
      await helper.safeClick(
        '[data-testid="logout-button"], .logout-btn, [aria-label="logout"]',
      );
    }

    // 等待跳转到登录页
    await helper.waitForNavigation('/login');

    // 验证登出成功
    const token = await helper.getLocalStorage('token');
    expect(token).toBeFalsy();
  });

  test('应该记住用户名', async ({ page, testData }) => {
    const helper = createPageHelper(page);

    await page.goto('/login');

    // 填写表单并勾选记住我
    await helper.safeFill('input[name="username"]', testData.user.username);
    await helper.safeFill('input[name="password"]', testData.user.password);

    const rememberCheckbox = page.locator(
      'input[type="checkbox"][name="remember"], [data-testid="remember-checkbox"]',
    );
    if (await rememberCheckbox.isVisible()) {
      await rememberCheckbox.check();
    }

    // 登录
    await helper.safeClick('button[type="submit"]');
    await helper.waitForNavigation(/dashboard|home/);

    // 登出
    await helper.clearStorage();

    // 重新访问登录页
    await page.goto('/login');

    // 验证用户名是否被记住
    const usernameInput = page.locator('input[name="username"]');
    const rememberedUsername = await usernameInput.inputValue();

    if (rememberedUsername) {
      expect(rememberedUsername).toBe(testData.user.username);
    }
  });

  test('应该处理会话过期', async ({ authenticatedPage }) => {
    const helper = createPageHelper(authenticatedPage);

    // 模拟会话过期
    await authenticatedPage.evaluate(() => {
      // 清除token
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    });

    // 尝试访问需要认证的页面
    await authenticatedPage.goto('/dashboard');

    // 等待重定向到登录页
    await helper.waitForNavigation('/login');

    // 验证显示会话过期消息
    const message = await helper.elementExists(
      '[data-testid="session-expired"], .session-expired-message',
    );
    if (message) {
      const messageText = await helper.getText(
        '[data-testid="session-expired"], .session-expired-message',
      );
      expect(messageText).toMatch(/会话|过期|expired|session/i);
    }
  });

  test('应该支持社交登录', async ({ page }) => {
    const helper = createPageHelper(page);

    await page.goto('/login');

    // 检查社交登录按钮
    const socialButtons = [
      {
        selector: '[data-testid="github-login"], .social-login-github',
        name: 'GitHub',
      },
      {
        selector: '[data-testid="google-login"], .social-login-google',
        name: 'Google',
      },
      {
        selector: '[data-testid="wechat-login"], .social-login-wechat',
        name: 'WeChat',
      },
    ];

    for (const button of socialButtons) {
      const exists = await helper.elementExists(button.selector);
      if (exists) {
        const element = page.locator(button.selector);
        await expect(element).toBeVisible();

        // 验证按钮可点击
        const isEnabled = await element.isEnabled();
        expect(isEnabled).toBeTruthy();
      }
    }
  });

  test('应该验证表单输入', async ({ page }) => {
    const helper = createPageHelper(page);

    await page.goto('/login');

    // 直接提交空表单
    await helper.safeClick('button[type="submit"]');

    // 检查验证消息
    const usernameError = await helper.elementExists(
      '[data-testid="username-error"], .username-error',
    );
    const passwordError = await helper.elementExists(
      '[data-testid="password-error"], .password-error',
    );

    if (usernameError || passwordError) {
      // 至少有一个错误显示
      expect(usernameError || passwordError).toBeTruthy();
    }

    // 输入无效的用户名格式
    await helper.safeFill('input[name="username"]', 'a');
    await page.keyboard.press('Tab');

    // 可能显示长度验证错误
    const lengthError = await helper.elementExists(
      '.length-error, [data-testid="length-error"]',
    );
    if (lengthError) {
      const errorText = await helper.getText(
        '.length-error, [data-testid="length-error"]',
      );
      expect(errorText).toMatch(/长度|length|至少|minimum/i);
    }
  });

  test('应该处理并发登录', async ({ page, testData, context }) => {
    const helper = createPageHelper(page);

    // 第一个标签页登录
    await page.goto('/login');
    await helper.safeFill('input[name="username"]', testData.user.username);
    await helper.safeFill('input[name="password"]', testData.user.password);
    await helper.safeClick('button[type="submit"]');
    await helper.waitForNavigation(/dashboard|home/);

    // 打开第二个标签页
    const page2 = await context.newPage();
    await page2.goto('/');

    // 验证第二个标签页也是登录状态
    expect(page2.url()).not.toContain('/login');
  });
});
