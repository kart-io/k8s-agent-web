/**
 * Vitest 测试环境配置
 */

import process from 'node:process';

import { vi } from 'vitest';

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia - return a proper MediaQueryList object
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn((callback: (event: MediaQueryListEvent) => void) => {
        listeners.push(callback);
      }),
      removeListener: vi.fn(
        (callback: (event: MediaQueryListEvent) => void) => {
          const index = listeners.indexOf(callback);
          if (index !== -1) {
            listeners.splice(index, 1);
          }
        },
      ),
      addEventListener: vi.fn(
        (type: string, callback: (event: MediaQueryListEvent) => void) => {
          if (type === 'change') {
            listeners.push(callback);
          }
        },
      ),
      removeEventListener: vi.fn(
        (type: string, callback: (event: MediaQueryListEvent) => void) => {
          if (type === 'change') {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
              listeners.splice(index, 1);
            }
          }
        },
      ),
      dispatchEvent: vi.fn(() => true),
    } as MediaQueryList;
  },
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage with real implementation
const createStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
  writable: true,
});

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 全局测试工具函数
export function nextTick(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// 清理函数
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
