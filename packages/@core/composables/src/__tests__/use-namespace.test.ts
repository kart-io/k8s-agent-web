import { describe, it, expect } from 'vitest';
import { useNamespace } from '../use-namespace';

describe('useNamespace', () => {
  const ns = useNamespace('button');

  describe('BEM命名规范', () => {
    it('应该生成正确的块(Block)名称', () => {
      expect(ns.b()).toBe('vben-button');
    });

    it('应该生成正确的块修饰符(Block Modifier)名称', () => {
      expect(ns.b('primary')).toBe('vben-button--primary');
    });

    it('应该生成正确的元素(Element)名称', () => {
      expect(ns.e('icon')).toBe('vben-button__icon');
    });

    it('应该生成正确的元素修饰符(Element Modifier)名称', () => {
      expect(ns.em('icon', 'large')).toBe('vben-button__icon--large');
    });

    it('应该生成正确的修饰符(Modifier)名称', () => {
      expect(ns.m('disabled')).toBe('vben-button--disabled');
    });

    it('应该生成正确的块元素(Block Element)名称', () => {
      expect(ns.be('group', 'item')).toBe('vben-button__group-item');
    });

    it('应该生成正确的块元素修饰符(Block Element Modifier)名称', () => {
      expect(ns.bem('group', 'item', 'active')).toBe('vben-button__group-item--active');
    });
  });

  describe('状态类名', () => {
    it('应该生成正确的is状态类名', () => {
      expect(ns.is('active')).toBe('is-active');
      expect(ns.is('disabled')).toBe('is-disabled');
      expect(ns.is('loading')).toBe('is-loading');
    });

    it('应该根据条件生成is状态类名', () => {
      expect(ns.is('active', true)).toBe('is-active');
      expect(ns.is('active', false)).toBe('');
    });

    it('应该处理多个状态', () => {
      const states = [
        ns.is('active', true),
        ns.is('disabled', false),
        ns.is('loading', true),
      ].filter(Boolean).join(' ');

      expect(states).toBe('is-active is-loading');
    });
  });

  describe('CSS变量', () => {
    it('应该生成正确的CSS变量名', () => {
      expect(ns.cssVar('color')).toBe('--vben-button-color');
      expect(ns.cssVar('background-color')).toBe('--vben-button-background-color');
      expect(ns.cssVar('border-radius')).toBe('--vben-button-border-radius');
    });

    it('应该生成带值的CSS变量对象', () => {
      const vars = ns.cssVarObject({
        'color': '#fff',
        'background': '#007bff',
        'padding': '10px',
      });

      expect(vars).toEqual({
        '--vben-button-color': '#fff',
        '--vben-button-background': '#007bff',
        '--vben-button-padding': '10px',
      });
    });
  });

  describe('复杂场景', () => {
    it('应该处理嵌套的命名空间', () => {
      const formNs = useNamespace('form');
      const itemNs = useNamespace('form-item');

      expect(formNs.b()).toBe('vben-form');
      expect(itemNs.b()).toBe('vben-form-item');
      expect(formNs.e('field')).toBe('vben-form__field');
      expect(itemNs.e('label')).toBe('vben-form-item__label');
    });

    it('应该生成组合类名', () => {
      const classes = [
        ns.b(),
        ns.m('primary'),
        ns.is('active', true),
        ns.is('disabled', false),
      ].filter(Boolean).join(' ');

      expect(classes).toBe('vben-button vben-button--primary is-active');
    });

    it('应该处理空值和特殊字符', () => {
      expect(ns.b('')).toBe('vben-button');
      expect(ns.e('')).toBe('vben-button__');
      expect(ns.m('')).toBe('vben-button--');

      // 处理特殊字符
      expect(ns.e('test-element')).toBe('vben-button__test-element');
      expect(ns.m('test-modifier')).toBe('vben-button--test-modifier');
    });
  });

  describe('不同命名空间', () => {
    it('应该为不同组件生成不同的命名空间', () => {
      const buttonNs = useNamespace('button');
      const inputNs = useNamespace('input');
      const selectNs = useNamespace('select');

      expect(buttonNs.b()).toBe('vben-button');
      expect(inputNs.b()).toBe('vben-input');
      expect(selectNs.b()).toBe('vben-select');

      expect(buttonNs.e('text')).toBe('vben-button__text');
      expect(inputNs.e('wrapper')).toBe('vben-input__wrapper');
      expect(selectNs.e('dropdown')).toBe('vben-select__dropdown');
    });
  });

  describe('实际使用案例', () => {
    it('按钮组件的类名生成', () => {
      const buttonNs = useNamespace('button');

      // 基础按钮
      expect(buttonNs.b()).toBe('vben-button');

      // 主要按钮
      expect(buttonNs.m('primary')).toBe('vben-button--primary');

      // 大号按钮
      expect(buttonNs.m('large')).toBe('vben-button--large');

      // 按钮图标
      expect(buttonNs.e('icon')).toBe('vben-button__icon');

      // 加载状态
      expect(buttonNs.is('loading')).toBe('is-loading');

      // 禁用状态
      expect(buttonNs.is('disabled')).toBe('is-disabled');
    });

    it('表单组件的类名生成', () => {
      const formNs = useNamespace('form');

      // 表单容器
      expect(formNs.b()).toBe('vben-form');

      // 表单项
      expect(formNs.e('item')).toBe('vben-form__item');

      // 标签
      expect(formNs.e('label')).toBe('vben-form__label');

      // 错误信息
      expect(formNs.e('error')).toBe('vben-form__error');

      // 内联表单
      expect(formNs.m('inline')).toBe('vben-form--inline');

      // 必填项
      expect(formNs.em('label', 'required')).toBe('vben-form__label--required');
    });
  });

  describe('性能相关', () => {
    it('应该缓存生成的类名', () => {
      const ns1 = useNamespace('cached');
      const ns2 = useNamespace('cached');

      // 相同的命名空间应该返回相同的结果
      expect(ns1.b()).toBe(ns2.b());
      expect(ns1.e('element')).toBe(ns2.e('element'));
      expect(ns1.m('modifier')).toBe(ns2.m('modifier'));
    });

    it('应该快速生成大量类名', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        ns.b();
        ns.e(`element-${i}`);
        ns.m(`modifier-${i}`);
        ns.is(`state-${i}`, i % 2 === 0);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 性能测试：1000次操作应该在50ms内完成
      expect(duration).toBeLessThan(50);
    });
  });
});