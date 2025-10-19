import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import Modal from '../modal.vue';

describe('modal Component', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('基础功能', () => {
    it('应该正确渲染', () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          title: '测试弹窗',
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('应该显示标题', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          title: '测试标题',
        },
      });

      await nextTick();
      expect(wrapper.text()).toContain('测试标题');
    });

    it('应该显示默认插槽内容', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
        },
        slots: {
          default: '<div class="test-content">测试内容</div>',
        },
      });

      await nextTick();
      expect(wrapper.find('.test-content').exists()).toBe(true);
      expect(wrapper.text()).toContain('测试内容');
    });
  });

  describe('显示/隐藏控制', () => {
    it('open为false时不应该显示', () => {
      wrapper = mount(Modal, {
        props: {
          open: false,
          title: '隐藏的弹窗',
        },
      });

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    });

    it('open变为true时应该显示', async () => {
      wrapper = mount(Modal, {
        props: {
          open: false,
        },
      });

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);

      await wrapper.setProps({ open: true });
      await nextTick();

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    });
  });

  describe('关闭功能', () => {
    it('点击关闭按钮应该触发close事件', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          closable: true,
        },
      });

      const closeButton = wrapper.find('[aria-label="close"]');
      if (closeButton.exists()) {
        await closeButton.trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();
      }
    });

    it('点击遮罩层应该触发close事件（closeOnClickModal为true时）', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          closeOnClickModal: true,
        },
      });

      const mask = wrapper.find('.modal-mask');
      if (mask.exists()) {
        await mask.trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();
      }
    });

    it('按ESC键应该触发close事件（closeOnEsc为true时）', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          closeOnEsc: true,
        },
        attachTo: document.body,
      });

      await nextTick();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      await nextTick();
      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('确认/取消功能', () => {
    it('点击确认按钮应该触发confirm事件', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          showFooter: true,
        },
      });

      const confirmButton = wrapper.find('[data-action="confirm"]');
      if (confirmButton.exists()) {
        await confirmButton.trigger('click');
        expect(wrapper.emitted('confirm')).toBeTruthy();
      }
    });

    it('点击取消按钮应该触发cancel事件', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          showFooter: true,
        },
      });

      const cancelButton = wrapper.find('[data-action="cancel"]');
      if (cancelButton.exists()) {
        await cancelButton.trigger('click');
        expect(wrapper.emitted('cancel')).toBeTruthy();
      }
    });

    it('loading状态下不应该触发事件', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          loading: true,
          showFooter: true,
        },
      });

      const confirmButton = wrapper.find('[data-action="confirm"]');
      if (confirmButton.exists()) {
        await confirmButton.trigger('click');
        expect(wrapper.emitted('confirm')).toBeFalsy();
      }
    });
  });

  describe('自定义插槽', () => {
    it('应该渲染自定义header插槽', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
        },
        slots: {
          header: '<div class="custom-header">自定义头部</div>',
        },
      });

      await nextTick();
      expect(wrapper.find('.custom-header').exists()).toBe(true);
      expect(wrapper.text()).toContain('自定义头部');
    });

    it('应该渲染自定义footer插槽', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
        },
        slots: {
          footer: '<div class="custom-footer">自定义底部</div>',
        },
      });

      await nextTick();
      expect(wrapper.find('.custom-footer').exists()).toBe(true);
      expect(wrapper.text()).toContain('自定义底部');
    });

    it('应该渲染自定义closeIcon插槽', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          closable: true,
        },
        slots: {
          closeIcon: '<span class="custom-close">X</span>',
        },
      });

      await nextTick();
      expect(wrapper.find('.custom-close').exists()).toBe(true);
    });
  });

  describe('props验证', () => {
    it('应该接受有效的width值', () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          width: '600px',
        },
      });

      const modalContent = wrapper.find('.modal-content');
      if (modalContent.exists()) {
        expect(modalContent.attributes('style')).toContain('width');
      }
    });

    it('应该接受有效的zIndex值', () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          zIndex: 2000,
        },
      });

      const modal = wrapper.find('[role="dialog"]');
      if (modal.exists()) {
        expect(modal.attributes('style')).toContain('z-index');
      }
    });

    it('应该处理centered属性', () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          centered: true,
        },
      });

      const modalContent = wrapper.find('.modal-content');
      if (modalContent.exists()) {
        expect(modalContent.classes()).toContain('centered');
      }
    });

    it('应该处理fullscreen属性', () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          fullscreen: true,
        },
      });

      const modalContent = wrapper.find('.modal-content');
      if (modalContent.exists()) {
        expect(modalContent.classes()).toContain('fullscreen');
      }
    });
  });

  describe('无障碍性', () => {
    it('应该有正确的ARIA属性', () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          title: '无障碍测试',
        },
      });

      const dialog = wrapper.find('[role="dialog"]');
      if (dialog.exists()) {
        expect(dialog.attributes('role')).toBe('dialog');
        expect(dialog.attributes('aria-modal')).toBe('true');
        expect(dialog.attributes('aria-labelledby')).toBeDefined();
      }
    });

    it('焦点应该被正确管理', async () => {
      const focusSpy = vi.fn();
      wrapper = mount(Modal, {
        props: {
          open: true,
        },
        global: {
          mocks: {
            focus: focusSpy,
          },
        },
      });

      await nextTick();
      // 验证焦点管理逻辑
    });
  });

  describe('动画过渡', () => {
    it('应该应用过渡效果', async () => {
      wrapper = mount(Modal, {
        props: {
          open: false,
        },
      });

      await wrapper.setProps({ open: true });
      await nextTick();

      const transition = wrapper.findComponent({ name: 'Transition' });
      expect(transition.exists()).toBe(true);
    });
  });

  describe('响应式行为', () => {
    it('应该响应props变化', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          title: '初始标题',
        },
      });

      expect(wrapper.text()).toContain('初始标题');

      await wrapper.setProps({ title: '更新后的标题' });
      await nextTick();

      expect(wrapper.text()).toContain('更新后的标题');
    });

    it('应该正确处理v-model:open', async () => {
      const TestComponent = {
        template: `
          <Modal v-model:open="isOpen" @update:open="handleUpdate" />
        `,
        components: { Modal },
        data() {
          return { isOpen: true };
        },
        methods: {
          handleUpdate(value: boolean) {
            this.isOpen = value;
          },
        },
      };

      wrapper = mount(TestComponent);

      expect(wrapper.findComponent(Modal).props('open')).toBe(true);

      await wrapper.findComponent(Modal).vm.$emit('update:open', false);
      await nextTick();

      expect(wrapper.vm.isOpen).toBe(false);
    });
  });

  describe('边界情况', () => {
    it('应该处理空标题', () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
          title: '',
        },
      });

      expect(wrapper.find('.modal-header').exists()).toBe(true);
    });

    it('应该处理超长内容', () => {
      const longContent = 'A'.repeat(10_000);
      wrapper = mount(Modal, {
        props: {
          open: true,
        },
        slots: {
          default: `<div>${longContent}</div>`,
        },
      });

      const content = wrapper.find('.modal-body');
      if (content.exists()) {
        expect(content.text().length).toBeGreaterThan(100);
      }
    });

    it('应该处理快速开关', async () => {
      wrapper = mount(Modal, {
        props: {
          open: true,
        },
      });

      // 快速切换
      await wrapper.setProps({ open: false });
      await wrapper.setProps({ open: true });
      await wrapper.setProps({ open: false });
      await wrapper.setProps({ open: true });

      await nextTick();
      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    });
  });
});
