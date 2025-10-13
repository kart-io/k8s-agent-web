import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadScript } from '../resources';

describe('loadScript', () => {
  let originalCreateElement: typeof document.createElement;
  let mockScripts: Map<string, HTMLScriptElement>;

  beforeEach(() => {
    // 清空 head
    document.head.innerHTML = '';
    mockScripts = new Map();

    // Mock document.createElement 来避免 happy-dom 自动加载脚本
    originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName.toLowerCase() === 'script') {
        const script = originalCreateElement('script');
        // 保存原始的 src setter
        const srcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');

        // 定义一个新的 src 属性,阻止真正的网络请求
        Object.defineProperty(script, 'src', {
          get() {
            return script.getAttribute('src') || '';
          },
          set(value: string) {
            script.setAttribute('src', value);
            // 存储 mock script
            mockScripts.set(value, script);
          },
          configurable: true,
        });

        return script;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve when the script loads successfully', async () => {
    const testJsPath = '/test-script.js';
    const promise = loadScript(testJsPath);

    // 等待脚本元素被创建和插入
    await vi.waitFor(() => {
      const script = mockScripts.get(testJsPath);
      expect(script).toBeTruthy();
    });

    const script = mockScripts.get(testJsPath)!;

    // 模拟加载成功
    script.dispatchEvent(new Event('load'));

    // 等待 promise resolve
    await expect(promise).resolves.toBeUndefined();
  });

  it('should not insert duplicate script and resolve immediately if already loaded', async () => {
    // 先手动插入一个相同 src 的 script
    const existing = document.createElement('script');
    existing.src = 'bar.js';
    document.head.append(existing);

    // 再次调用
    const promise = loadScript('bar.js');

    // 立即 resolve
    await expect(promise).resolves.toBeUndefined();

    // head 中只保留一个
    const scripts = document.head.querySelectorAll('script[src="bar.js"]');
    expect(scripts).toHaveLength(1);
  });

  it('should reject when the script fails to load', async () => {
    const promise = loadScript('error.js');

    // 等待脚本元素被创建
    await vi.waitFor(() => {
      const script = mockScripts.get('error.js');
      expect(script).toBeTruthy();
    });

    const script = mockScripts.get('error.js')!;

    // 模拟加载失败
    script.dispatchEvent(new Event('error'));

    await expect(promise).rejects.toThrow('Failed to load script: error.js');
  });

  it('should handle multiple concurrent calls and only insert one script tag', async () => {
    const testJsPath = '/test-script.js';
    const p1 = loadScript(testJsPath);
    const p2 = loadScript(testJsPath);

    // 等待脚本元素被创建
    await vi.waitFor(() => {
      const script = mockScripts.get(testJsPath);
      expect(script).toBeTruthy();
    });

    const script = mockScripts.get(testJsPath)!;

    // 触发一次 load,两个 promise 都应该 resolve
    script.dispatchEvent(new Event('load'));

    await expect(p1).resolves.toBeUndefined();
    await expect(p2).resolves.toBeUndefined();

    // 只插入一次
    const scripts = document.head.querySelectorAll(
      `script[src="${testJsPath}"]`,
    );
    expect(scripts).toHaveLength(1);
  });
});
