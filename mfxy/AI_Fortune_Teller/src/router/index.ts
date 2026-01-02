import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/tarot',
    name: 'Tarot',
    component: () => import('@/views/Tarot.vue')
  },
  {
    path: '/horoscope',
    name: 'Horoscope',
    component: () => import('@/views/Horoscope.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
