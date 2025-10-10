import { ref, resolveComponent, createElementBlock, openBlock, createElementVNode, createCommentVNode, createBlock, renderSlot, createTextVNode, toDisplayString, withCtx, unref, createVNode, Fragment, renderList, resolveDynamicComponent } from 'vue';
import { useRouter } from 'vue-router';
import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, FullscreenExitOutlined, FullscreenOutlined, BellOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import '../../utils/storage.js';
import { getIconComponent } from '../../utils/icons.js';
/* empty css                  */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "layout-header" };
const _hoisted_2 = { class: "header-left" };
const _hoisted_3 = {
  key: 0,
  class: "logo"
};
const _hoisted_4 = {
  key: 0,
  class: "header-breadcrumb"
};
const _hoisted_5 = ["onClick"];
const _hoisted_6 = { key: 2 };
const _hoisted_7 = { class: "header-actions" };
const _hoisted_8 = { class: "user-dropdown" };
const _hoisted_9 = { class: "user-name" };


const _sfc_main = {
  __name: 'LayoutHeader',
  props: {
  collapsed: {
    type: Boolean,
    default: false
  },
  showLogo: {
    type: Boolean,
    default: true
  },
  showTrigger: {
    type: Boolean,
    default: true
  },
  showBreadcrumb: {
    type: Boolean,
    default: true
  },
  logoText: {
    type: String,
    default: 'Vben Admin'
  },
  userName: {
    type: String,
    default: 'Admin'
  },
  userAvatar: {
    type: String,
    default: ''
  },
  breadcrumbList: {
    type: Array,
    default: () => []
  },
  notificationCount: {
    type: Number,
    default: 0
  }
},
  emits: ['update:collapsed', 'user-menu-click', 'breadcrumb-click'],
  setup(__props, { emit }) {

const props = __props;





const router = useRouter();
const isFullscreen = ref(false);

const toggleCollapsed = () => {
  emit('update:collapsed', !props.collapsed);
};

const getIcon = (iconName) => {
  if (!iconName) return null
  return getIconComponent(iconName)
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullscreen.value = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      isFullscreen.value = false;
    }
  }
};

const handleUserMenuClick = ({ key }) => {
  emit('user-menu-click', key);
};

const handleBreadcrumbClick = (item) => {
  if (item.path) {
    emit('breadcrumb-click', item);
    router.push(item.path);
  }
};

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement;
});

return (_ctx, _cache) => {
  const _component_a_button = resolveComponent("a-button");
  const _component_a_breadcrumb_item = resolveComponent("a-breadcrumb-item");
  const _component_a_breadcrumb = resolveComponent("a-breadcrumb");
  const _component_a_tooltip = resolveComponent("a-tooltip");
  const _component_a_badge = resolveComponent("a-badge");
  const _component_a_avatar = resolveComponent("a-avatar");
  const _component_a_menu_item = resolveComponent("a-menu-item");
  const _component_a_menu_divider = resolveComponent("a-menu-divider");
  const _component_a_menu = resolveComponent("a-menu");
  const _component_a_dropdown = resolveComponent("a-dropdown");

  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createElementVNode("div", _hoisted_2, [
      (__props.showLogo)
        ? (openBlock(), createElementBlock("div", _hoisted_3, [
            renderSlot(_ctx.$slots, "logo", {}, () => [
              createTextVNode(toDisplayString(__props.logoText), 1)
            ], true)
          ]))
        : createCommentVNode("", true),
      (__props.showTrigger)
        ? (openBlock(), createBlock(_component_a_button, {
            key: 1,
            type: "text",
            class: "trigger",
            onClick: toggleCollapsed
          }, {
            default: withCtx(() => [
              (!__props.collapsed)
                ? (openBlock(), createBlock(unref(MenuFoldOutlined), { key: 0 }))
                : (openBlock(), createBlock(unref(MenuUnfoldOutlined), { key: 1 }))
            ]),
            _: 1
          }))
        : createCommentVNode("", true)
    ]),
    (__props.showBreadcrumb)
      ? (openBlock(), createElementBlock("div", _hoisted_4, [
          createVNode(_component_a_breadcrumb, null, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.breadcrumbList, (item) => {
                return (openBlock(), createBlock(_component_a_breadcrumb_item, {
                  key: item.path
                }, {
                  default: withCtx(() => [
                    (item.icon)
                      ? (openBlock(), createBlock(resolveDynamicComponent(getIcon(item.icon)), { key: 0 }))
                      : createCommentVNode("", true),
                    (item.path)
                      ? (openBlock(), createElementBlock("span", {
                          key: 1,
                          class: "breadcrumb-link",
                          onClick: $event => (handleBreadcrumbClick(item))
                        }, toDisplayString(item.label), 9, _hoisted_5))
                      : (openBlock(), createElementBlock("span", _hoisted_6, toDisplayString(item.label), 1))
                  ]),
                  _: 2
                }, 1024))
              }), 128))
            ]),
            _: 1
          })
        ]))
      : createCommentVNode("", true),
    createElementVNode("div", _hoisted_7, [
      renderSlot(_ctx.$slots, "actions", {}, () => [
        createVNode(_component_a_tooltip, { title: "搜索" }, {
          default: withCtx(() => [
            createVNode(_component_a_button, {
              type: "text",
              class: "action-btn"
            }, {
              default: withCtx(() => [
                createVNode(unref(SearchOutlined))
              ]),
              _: 1
            })
          ]),
          _: 1
        }),
        createVNode(_component_a_tooltip, {
          title: isFullscreen.value ? '退出全屏' : '全屏'
        }, {
          default: withCtx(() => [
            createVNode(_component_a_button, {
              type: "text",
              class: "action-btn",
              onClick: toggleFullscreen
            }, {
              default: withCtx(() => [
                (isFullscreen.value)
                  ? (openBlock(), createBlock(unref(FullscreenExitOutlined), { key: 0 }))
                  : (openBlock(), createBlock(unref(FullscreenOutlined), { key: 1 }))
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["title"]),
        createVNode(_component_a_badge, {
          count: __props.notificationCount,
          offset: [-5, 5]
        }, {
          default: withCtx(() => [
            createVNode(_component_a_button, {
              type: "text",
              class: "action-btn"
            }, {
              default: withCtx(() => [
                createVNode(unref(BellOutlined))
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["count"]),
        createVNode(_component_a_dropdown, { placement: "bottomRight" }, {
          overlay: withCtx(() => [
            createVNode(_component_a_menu, { onClick: handleUserMenuClick }, {
              default: withCtx(() => [
                createVNode(_component_a_menu_item, { key: "profile" }, {
                  default: withCtx(() => [
                    createVNode(unref(UserOutlined)),
                    createTextVNode(" 个人中心 ")
                  ]),
                  _: 1
                }),
                createVNode(_component_a_menu_item, { key: "settings" }, {
                  default: withCtx(() => [
                    createVNode(unref(SettingOutlined)),
                    createTextVNode(" 系统设置 ")
                  ]),
                  _: 1
                }),
                createVNode(_component_a_menu_divider),
                createVNode(_component_a_menu_item, { key: "logout" }, {
                  default: withCtx(() => [
                    createVNode(unref(LogoutOutlined)),
                    createTextVNode(" 退出登录 ")
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          default: withCtx(() => [
            createElementVNode("div", _hoisted_8, [
              createVNode(_component_a_avatar, {
                size: 32,
                src: __props.userAvatar
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(__props.userName?.[0]), 1)
                ]),
                _: 1
              }, 8, ["src"]),
              createElementVNode("span", _hoisted_9, toDisplayString(__props.userName), 1)
            ])
          ]),
          _: 1
        })
      ], true)
    ])
  ]))
}
}

};
const LayoutHeader = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-e5842184"]]);

export { LayoutHeader as default };
//# sourceMappingURL=LayoutHeader.vue.js.map
