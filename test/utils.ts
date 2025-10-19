/**
 * 测试工具函数
 */

import type { ComponentMountingOptions } from '@vue/test-utils';
import type { Component } from 'vue';

import { mount } from '@vue/test-utils';

/**
 * 增强的组件挂载函数
 */
export function mountComponent<T extends Component>(
  component: T,
  options?: ComponentMountingOptions<T>,
) {
  return mount(component, {
    ...options,
    global: {
      ...options?.global,
      stubs: {
        teleport: true,
        ...options?.global?.stubs,
      },
    },
  });
}

/**
 * 创建响应式数据 Mock
 */
export function createMockStore(initialState: Record<string, any> = {}) {
  return {
    state: initialState,
    getters: {},
    actions: {},
    mutations: {},
  };
}

/**
 * 等待 DOM 更新
 */
export async function waitForDomUpdate(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * 触发输入事件
 */
export async function triggerInput(
  wrapper: any,
  selector: string,
  value: string,
) {
  const input = wrapper.find((element: any) => element.matches(selector));
  await input.setValue(value);
  await input.trigger('input');
  await input.trigger('change');
  return input;
}

/**
 * 模拟文件上传
 */
export function createFileMock(
  name = 'test.txt',
  size = 1024,
  type = 'text/plain',
): File {
  const content = Array.from({ length: size }, () => 'a').join('');
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

/**
 * 模拟拖放事件
 */
export function createDragEvent(type: string, files: File[] = []): DragEvent {
  const _dataTransfer = {
    files,
    items: files.map((file) => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
    })),
    types: ['Files'],
    dropEffect: 'copy',
    effectAllowed: 'all',
    setData: () => {},
    getData: () => '',
    clearData: () => {},
    setDragImage: () => {},
  };

  return new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as DragEvent;
}

/**
 * 模拟 API 响应
 */
export function mockApiResponse<T>(
  data: T,
  delay = 100,
  success = true,
): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(data);
      } else {
        reject(new Error('API Error'));
      }
    }, delay);
  });
}

/**
 * 断言元素可见性
 */
export function assertElementVisible(wrapper: any, selector: string) {
  const element = wrapper.find((el: any) => el.matches(selector));
  expect(element.exists()).toBe(true);
  expect(element.isVisible()).toBe(true);
}

/**
 * 断言元素文本内容
 */
export function assertElementText(
  wrapper: any,
  selector: string,
  expectedText: string,
) {
  const element = wrapper.find((el: any) => el.matches(selector));
  expect(element.exists()).toBe(true);
  expect(element.text()).toBe(expectedText);
}

/**
 * 断言元素属性
 */
export function assertElementAttribute(
  wrapper: any,
  selector: string,
  attribute: string,
  expectedValue: string,
) {
  const element = wrapper.find((el: any) => el.matches(selector));
  expect(element.exists()).toBe(true);
  expect(element.attributes(attribute)).toBe(expectedValue);
}

/**
 * 创建测试用的 Props
 */
export function createTestProps<T extends Record<string, any>>(
  defaultProps: T,
  overrides?: Partial<T>,
): T {
  return {
    ...defaultProps,
    ...overrides,
  };
}
