import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'

/**
 * 单文件预览版走 hash 路由：那个环境没有服务端，
 * 直接访问 /sentences 这种路径会 404。正常部署仍然是 History 路由。
 * 由 vite.standalone.config.ts 用 define 注入。
 */
declare const __THREEBODY_HASH_ROUTER__: boolean | undefined
const useHash =
  typeof __THREEBODY_HASH_ROUTER__ !== 'undefined' && __THREEBODY_HASH_ROUTER__

// 各页按需分块，避免首页加载书摘、留言板等页面代码
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '三体宇宙 · Threebody.space' },
  },
  {
    path: '/sentences',
    name: 'sentences',
    component: () => import('@/views/SentencesView.vue'),
    meta: { title: '书摘 423 条 · Threebody.space' },
  },
  {
    path: '/works',
    name: 'works',
    component: () => import('@/views/WorksView.vue'),
    meta: { title: '我的三体 · Threebody.space' },
  },
  {
    path: '/simulation',
    name: 'simulation',
    component: () => import('@/views/SimulationView.vue'),
    // bare：不套页头页脚，这一页的内容就是整个视口
    meta: { title: '三体运动模拟 · Threebody.space', bare: true },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于 · Threebody.space' },
  },
  {
    path: '/guestbook',
    name: 'guestbook',
    component: () => import('@/views/GuestbookView.vue'),
    meta: { title: '留言板 · Threebody.space' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: useHash ? createWebHashHistory() : createWebHistory(import.meta.env.BASE_URL),
  routes,
  /**
   * html 上开了全局 scroll-behavior: smooth（页内锚点靠它），
   * 但换路由时的滚动必须走 instant：从书摘第 300 条点导航回首页，
   * 平滑滚几千像素要滚好几秒。页内锚点仍然保留平滑。
   */
  scrollBehavior(to, _from, saved) {
    if (saved) return { ...saved, behavior: 'auto' }
    if (to.hash) return { el: to.hash }
    return { top: 0, behavior: 'auto' }
  },
})

router.afterEach((to) => {
  const title = to.meta.title
  if (typeof title === 'string') document.title = title
})
