export default [
  {
    path: '/',
    redirect: '/builds'
  },
  {
    path: '/builds',
    name: 'ImageBuildList',
    component: () => import('@/views/ImageBuildList.vue'),
    meta: {
      title: '构建列表',
      affix: true, // 固定标签，不可关闭
      breadcrumb: [
        { label: '镜像构建', path: '/builds' },
        { label: '构建列表', path: '/builds' }
      ]
    }
  },
  {
    path: '/builds/:id',
    name: 'ImageBuildDetail',
    component: () => import('@/views/ImageBuildDetail.vue'),
    meta: {
      title: '构建详情',
      breadcrumb: [
        { label: '镜像构建', path: '/builds' },
        { label: '构建列表', path: '/builds' },
        { label: '构建详情' }
      ]
    }
  },
  {
    path: '/templates',
    name: 'BuildTemplateList',
    component: () => import('@/views/BuildTemplateList.vue'),
    meta: {
      title: '构建模板',
      breadcrumb: [
        { label: '镜像构建', path: '/builds' },
        { label: '构建模板', path: '/templates' }
      ]
    }
  },
  {
    path: '/images',
    name: 'ImageList',
    component: () => import('@/views/ImageList.vue'),
    meta: {
      title: '镜像列表',
      breadcrumb: [
        { label: '镜像构建', path: '/builds' },
        { label: '镜像列表', path: '/images' }
      ]
    }
  }
]
