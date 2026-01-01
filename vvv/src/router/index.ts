import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/business',
      name: 'business',
      component: () => import('@/views/BusinessList.vue'),
      meta: { title: '业务列表' }
    },
    {
      path: '/business/:id',
      name: 'business-detail',
      component: () => import('@/views/BusinessDetail.vue'),
      meta: { title: '业务详情' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings.vue'),
      meta: { title: '设置' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '政务大厅智能指引系统'} - 政务大厅智能指引系统`
  next()
})

export default router
