import { ref, onMounted, computed, watch, resolveComponent, createBlock, openBlock, withCtx, createVNode, normalizeClass, createElementVNode, renderSlot, createElementBlock, createCommentVNode, toDisplayString, Fragment, renderList, resolveDynamicComponent, createTextVNode } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import LayoutHeader from './LayoutHeader.vue.js';
import LayoutTabBar from './LayoutTabBar.vue.js';
import '../../utils/storage.js';
import { getIconComponent } from '../../utils/icons.js';
/* empty css                */
import _export_sfc from '../../_virtual/_plugin-vue_export-helper.js';

const _hoisted_1 = { class: "sider-logo" };
const _hoisted_2 = { class: "logo-content" };
const _hoisted_3 = ["src"];
const _hoisted_4 = {
  key: 1,
  class: "logo-text"
};


const _sfc_main = {
  __name: 'VbenLayout',
  props: {
  // 菜单数据
  menuData: {
    type: Array,
    default: () => []
  },
  // Logo
  logo: {
    type: String,
    default: ''
  },
  // 标题
  title: {
    type: String,
    default: 'Vben Admin'
  },
  // 主题
  theme: {
    type: String,
    default: 'dark',
    validator: (value) => ['dark', 'light'].includes(value)
  },
  // 侧边栏宽度
  siderWidth: {
    type: Number,
    default: 210
  },
  // 折叠宽度
  collapsedWidth: {
    type: Number,
    default: 48
  },
  // 是否显示标签页
  showTabs: {
    type: Boolean,
    default: true
  },
  // 用户名
  userName: {
    type: String,
    default: 'Admin'
  },
  // 用户头像
  userAvatar: {
    type: String,
    default: ''
  },
  // 通知数量
  notificationCount: {
    type: Number,
    default: 0
  },
  // Wujie 事件总线（可选）
  wujieBus: {
    type: Object,
    default: null
  }
},
  emits: [
  'menu-click',
  'user-menu-click',
  'breadcrumb-click',
  'tab-refresh'
],
  setup(__props, { expose: __expose, emit }) {

const props = __props;





const router = useRouter();
const route = useRoute();

console.log('[VbenLayout] Component mounted');
console.log('[VbenLayout] Initial route:', route.path, route.name);
console.log('[VbenLayout] Menu data:', props.menuData);

// 存储子应用的页面信息，用于创建独立的 tab
const subAppPageInfo = ref({});

const siderCollapsed = ref(false);
const selectedKeys = ref([]);
const openKeys = ref([]);
const tabs = ref([]);
const activeTabKey = ref('');

// 在组件挂载时设置 Wujie 事件监听
onMounted(() => {
  if (props.wujieBus) {
    console.log('[VbenLayout] Wujie bus provided, subscribing to events');
    props.wujieBus.$on('sub-app-page-change', handleSubAppPageChange);
    console.log('[VbenLayout] Subscribed to sub-app-page-change event');
  } else {
    console.log('[VbenLayout] No Wujie bus provided');
  }
});

// 处理子应用页面变化
const handleSubAppPageChange = (pageInfo) => {
  console.log('[VbenLayout] Received sub-app page change:', pageInfo);

  // 存储子应用页面信息
  subAppPageInfo.value[pageInfo.path] = pageInfo;

  // 同步更新主应用的 URL（如果与当前路由不同）
  if (route.path !== pageInfo.path) {
    console.log('[VbenLayout] Updating main app URL from:', route.path, 'to:', pageInfo.path);
    router.replace(pageInfo.path).then(() => {
      // 延迟重置标志，确保路由变化已完成
      setTimeout(() => {
      }, 100);
    });
  }

  // 如果需要显示 tabs，查找并更新已有的 tab
  if (props.showTabs) {
    console.log('[VbenLayout] Looking for existing tab to update');

    // 查找是否已经有这个页面的 tab（可能使用了 route.name 作为 key）
    const existingTabByRouteName = tabs.value.find(t => t.key === route.name);
    const existingTabByPath = tabs.value.find(t => t.key === pageInfo.path);

    if (existingTabByRouteName && !existingTabByPath) {
      // 如果找到了用 route.name 作为 key 的 tab，更新它
      console.log('[VbenLayout] Updating existing tab (by route name):', existingTabByRouteName.key, '→', pageInfo.path);
      existingTabByRouteName.key = pageInfo.path;
      existingTabByRouteName.label = pageInfo.title;
      existingTabByRouteName.path = pageInfo.path;
      activeTabKey.value = pageInfo.path;
    } else if (!existingTabByPath) {
      // 如果没有找到任何 tab，创建新的
      console.log('[VbenLayout] Creating new tab for:', pageInfo.title);
      addTab({
        key: pageInfo.path,
        label: pageInfo.title,
        path: pageInfo.path,
        closable: true
      });
    } else {
      // 已经有正确的 tab，只需要激活它
      console.log('[VbenLayout] Tab already exists, activating:', pageInfo.path);
      activeTabKey.value = pageInfo.path;
    }
  }
};

// 面包屑数据
const breadcrumbList = computed(() => {
  // 如果路由元信息有面包屑，直接使用
  if (route.meta?.breadcrumb && route.meta.breadcrumb.length > 0) {
    return route.meta.breadcrumb
  }

  // 否则根据路径和菜单数据生成面包屑
  const breadcrumbs = [];
  const path = route.path;

  // 查找匹配的菜单项
  for (const menu of props.menuData) {
    if (path === menu.key || path.startsWith(menu.key + '/')) {
      // 添加顶层菜单
      breadcrumbs.push({
        label: menu.label,
        path: menu.key,
        icon: menu.icon
      });

      // 如果有子菜单，查找匹配的子菜单
      if (menu.children) {
        const child = menu.children.find(
          c => path === c.key || path.startsWith(c.key + '/')
        );
        if (child) {
          breadcrumbs.push({
            label: child.label,
            path: child.key,
            icon: child.icon
          });
        }
      }
      break
    }
  }

  return breadcrumbs
});

// 更新选中的菜单
const updateSelectedMenu = (path) => {
  console.log('[VbenLayout] updateSelectedMenu called with path:', path);
  console.log('[VbenLayout] menuData:', JSON.stringify(props.menuData, null, 2));

  // 查找匹配的菜单
  let matchedMenu = null;
  let parentKey = null;

  for (const menu of props.menuData) {
    // 检查顶层菜单
    if (path === menu.key || path.startsWith(menu.key + '/')) {
      // 如果有子菜单，继续在子菜单中查找更精确的匹配
      if (menu.children) {
        const child = menu.children.find(
          c => path === c.key || path.startsWith(c.key + '/')
        );
        if (child) {
          matchedMenu = child;
          parentKey = menu.key;
          console.log('[VbenLayout] Matched child menu:', child.key, 'parent:', parentKey);
          break
        }
      }
      // 如果没有子菜单或子菜单中没有匹配，则匹配顶层菜单
      if (!matchedMenu) {
        matchedMenu = menu;
        console.log('[VbenLayout] Matched top-level menu:', menu.key);
        break
      }
    }
  }

  if (matchedMenu) {
    selectedKeys.value = [matchedMenu.key];
    if (parentKey) {
      openKeys.value = [parentKey];
    }
    console.log('[VbenLayout] Updated selectedKeys:', selectedKeys.value, 'openKeys:', openKeys.value);
  } else {
    console.log('[VbenLayout] No menu matched for path:', path);
  }
};

// 添加标签页
const addTab = (tab) => {
  const existingTab = tabs.value.find(t => t.key === tab.key);
  if (!existingTab) {
    tabs.value.push(tab);
  } else {
    // 更新已存在标签的所有属性
    existingTab.path = tab.path;
    existingTab.label = tab.label;
    existingTab.icon = tab.icon;
  }
  activeTabKey.value = tab.key;
};

// 移除标签页
const removeTab = (tab) => {
  const index = tabs.value.findIndex(t => t.key === tab.key);
  if (index === -1) return

  const newTabs = tabs.value.filter(t => t.key !== tab.key);

  if (activeTabKey.value === tab.key && newTabs.length > 0) {
    const newActiveTab = newTabs[Math.max(0, index - 1)];
    activeTabKey.value = newActiveTab.key;
    router.push(newActiveTab.path);
  }

  tabs.value = newTabs;
};

// 根据路径从菜单中查找标题
const getTabLabelFromMenu = (path) => {
  for (const menu of props.menuData) {
    if (path === menu.key || path.startsWith(menu.key + '/')) {
      // 如果有子菜单，查找更精确的匹配
      if (menu.children) {
        const child = menu.children.find(
          c => path === c.key || path.startsWith(c.key + '/')
        );
        if (child) {
          return child.label
        }
      }
      // 没有子菜单或子菜单中没有匹配，返回顶层菜单标题
      return menu.label
    }
  }
  return null
};

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    console.log('[VbenLayout] Route changed to:', newPath);
    console.log('[VbenLayout] Route name:', route.name);
    console.log('[VbenLayout] Route meta:', route.meta);

    // 更新选中的菜单
    updateSelectedMenu(newPath);

    // 添加标签页
    if (!route.meta?.noTab && props.showTabs) {
      // 检查是否有子应用的页面信息
      const subPageInfo = subAppPageInfo.value[newPath];

      if (subPageInfo) {
        // 使用子应用提供的页面信息创建 tab
        console.log('[VbenLayout] Creating tab from sub-app info:', subPageInfo.title);
        addTab({
          key: subPageInfo.path,
          label: subPageInfo.title,
          path: subPageInfo.path,
          closable: true
        });
      } else {
        // 使用默认逻辑创建 tab
        const tabKey = route.name || newPath;
        const tabLabel = route.meta?.title || getTabLabelFromMenu(newPath) || '未命名';

        console.log('[VbenLayout] Creating tab with key:', tabKey, 'label:', tabLabel);
        addTab({
          key: tabKey,
          label: tabLabel,
          path: newPath,
          icon: route.meta?.icon,
          affix: route.meta?.affix === true,
          closable: route.meta?.affix !== true
        });
      }
    } else {
      console.log('[VbenLayout] Tab not created - noTab:', route.meta?.noTab, 'showTabs:', props.showTabs);
    }
  },
  { immediate: true }
);

const getIcon = (iconName) => {
  if (!iconName) return null
  return getIconComponent(iconName)
};

const handleMenuClick = ({ key }) => {
  router.push(key);
  emit('menu-click', key);
};

const handleUserMenuClick = (key) => {
  emit('user-menu-click', key);
};

const handleBreadcrumbClick = (item) => {
  emit('breadcrumb-click', item);
};

const handleTabClick = (tab) => {
  if (tab.path) {
    router.push(tab.path);
  }
};

const handleTabClose = (tab) => {
  removeTab(tab);
};

const handleTabRefresh = () => {
  emit('tab-refresh');
};

const handleCloseLeft = () => {
  const currentIndex = tabs.value.findIndex(t => t.key === activeTabKey.value);
  tabs.value = tabs.value.filter((t, i) => i >= currentIndex || t.affix);
};

const handleCloseRight = () => {
  const currentIndex = tabs.value.findIndex(t => t.key === activeTabKey.value);
  tabs.value = tabs.value.filter((t, i) => i <= currentIndex || t.affix);
};

const handleCloseOther = () => {
  tabs.value = tabs.value.filter(t => t.key === activeTabKey.value || t.affix);
};

const handleCloseAll = () => {
  tabs.value = tabs.value.filter(t => t.affix);
  if (tabs.value.length > 0) {
    const firstTab = tabs.value[0];
    activeTabKey.value = firstTab.key;
    router.push(firstTab.path);
  }
};

// 暴露方法
__expose({
  addTab,
  removeTab,
  tabs,
  activeTabKey
});

return (_ctx, _cache) => {
  const _component_a_menu_item = resolveComponent("a-menu-item");
  const _component_a_sub_menu = resolveComponent("a-sub-menu");
  const _component_a_menu = resolveComponent("a-menu");
  const _component_a_layout_sider = resolveComponent("a-layout-sider");
  const _component_a_layout_content = resolveComponent("a-layout-content");
  const _component_a_layout = resolveComponent("a-layout");

  return (openBlock(), createBlock(_component_a_layout, { class: "vben-layout" }, {
    default: withCtx(() => [
      createVNode(_component_a_layout_sider, {
        collapsed: siderCollapsed.value,
        "onUpdate:collapsed": _cache[2] || (_cache[2] = $event => ((siderCollapsed).value = $event)),
        width: __props.siderWidth,
        "collapsed-width": __props.collapsedWidth,
        trigger: null,
        collapsible: "",
        class: normalizeClass(["layout-sider", { 'sider-dark': __props.theme === 'dark', 'sider-light': __props.theme === 'light' }])
      }, {
        default: withCtx(() => [
          createElementVNode("div", _hoisted_1, [
            renderSlot(_ctx.$slots, "logo", {}, () => [
              createElementVNode("div", _hoisted_2, [
                (__props.logo)
                  ? (openBlock(), createElementBlock("img", {
                      key: 0,
                      src: __props.logo,
                      alt: "logo",
                      class: "logo-img"
                    }, null, 8, _hoisted_3))
                  : createCommentVNode("", true),
                (!siderCollapsed.value)
                  ? (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString(__props.title), 1))
                  : createCommentVNode("", true)
              ])
            ], true)
          ]),
          createVNode(_component_a_menu, {
            selectedKeys: selectedKeys.value,
            "onUpdate:selectedKeys": _cache[0] || (_cache[0] = $event => ((selectedKeys).value = $event)),
            openKeys: openKeys.value,
            "onUpdate:openKeys": _cache[1] || (_cache[1] = $event => ((openKeys).value = $event)),
            mode: "inline",
            theme: __props.theme,
            class: "sider-menu",
            onClick: handleMenuClick
          }, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.menuData, (item) => {
                return (openBlock(), createElementBlock(Fragment, {
                  key: item.key
                }, [
                  (!item.children)
                    ? (openBlock(), createBlock(_component_a_menu_item, {
                        key: item.key
                      }, {
                        icon: withCtx(() => [
                          (item.icon)
                            ? (openBlock(), createBlock(resolveDynamicComponent(getIcon(item.icon)), { key: 0 }))
                            : createCommentVNode("", true)
                        ]),
                        default: withCtx(() => [
                          createElementVNode("span", null, toDisplayString(item.label), 1)
                        ]),
                        _: 2
                      }, 1024))
                    : (openBlock(), createBlock(_component_a_sub_menu, {
                        key: item.key
                      }, {
                        icon: withCtx(() => [
                          (item.icon)
                            ? (openBlock(), createBlock(resolveDynamicComponent(getIcon(item.icon)), { key: 0 }))
                            : createCommentVNode("", true)
                        ]),
                        title: withCtx(() => [
                          createTextVNode(toDisplayString(item.label), 1)
                        ]),
                        default: withCtx(() => [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(item.children, (child) => {
                            return (openBlock(), createBlock(_component_a_menu_item, {
                              key: child.key
                            }, {
                              icon: withCtx(() => [
                                (child.icon)
                                  ? (openBlock(), createBlock(resolveDynamicComponent(getIcon(child.icon)), { key: 0 }))
                                  : createCommentVNode("", true)
                              ]),
                              default: withCtx(() => [
                                createElementVNode("span", null, toDisplayString(child.label), 1)
                              ]),
                              _: 2
                            }, 1024))
                          }), 128))
                        ]),
                        _: 2
                      }, 1024))
                ], 64))
              }), 128))
            ]),
            _: 1
          }, 8, ["selectedKeys", "openKeys", "theme"])
        ]),
        _: 3
      }, 8, ["collapsed", "width", "collapsed-width", "class"]),
      createVNode(_component_a_layout, { class: "layout-main" }, {
        default: withCtx(() => [
          createVNode(LayoutHeader, {
            collapsed: siderCollapsed.value,
            "onUpdate:collapsed": _cache[3] || (_cache[3] = $event => ((siderCollapsed).value = $event)),
            "show-logo": false,
            "logo-text": __props.title,
            "user-name": __props.userName,
            "user-avatar": __props.userAvatar,
            "breadcrumb-list": breadcrumbList.value,
            "notification-count": __props.notificationCount,
            onUserMenuClick: handleUserMenuClick,
            onBreadcrumbClick: handleBreadcrumbClick
          }, {
            actions: withCtx(() => [
              renderSlot(_ctx.$slots, "header-actions", {}, undefined, true)
            ]),
            _: 3
          }, 8, ["collapsed", "logo-text", "user-name", "user-avatar", "breadcrumb-list", "notification-count"]),
          (__props.showTabs)
            ? (openBlock(), createBlock(LayoutTabBar, {
                key: 0,
                tabs: tabs.value,
                "active-key": activeTabKey.value,
                onTabClick: handleTabClick,
                onTabClose: handleTabClose,
                onTabRefresh: handleTabRefresh,
                onCloseLeft: handleCloseLeft,
                onCloseRight: handleCloseRight,
                onCloseOther: handleCloseOther,
                onCloseAll: handleCloseAll
              }, null, 8, ["tabs", "active-key"]))
            : createCommentVNode("", true),
          createVNode(_component_a_layout_content, { class: "layout-content" }, {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, "default", {}, undefined, true)
            ]),
            _: 3
          })
        ]),
        _: 3
      })
    ]),
    _: 3
  }))
}
}

};
const VbenLayout = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-12e8a3cd"]]);

export { VbenLayout as default };
//# sourceMappingURL=VbenLayout.vue.js.map
