import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: () => import('./views/Login.vue'), meta: { noAuth: true } },
  { path: '/register', component: () => import('./views/Register.vue'), meta: { noAuth: true } },
  { path: '/home', component: () => import('./views/Home.vue') },
  { path: '/calendar', component: () => import('./views/Calendar.vue') },
  { path: '/add', component: () => import('./views/AddRecord.vue') },
  { path: '/edit/:id', component: () => import('./views/AddRecord.vue') },
  { path: '/stats', component: () => import('./views/Statistics.vue') },
  { path: '/stats/brand/:id', component: () => import('./views/BrandDetail.vue') },
  { path: '/profile', component: () => import('./views/Profile.vue') },
  { path: '/profile/brands', component: () => import('./views/ManageBrands.vue') },
  { path: '/profile/sweetness', component: () => import('./views/ManageSweetness.vue') },
  { path: '/profile/toppings', component: () => import('./views/ManageToppings.vue') },
  { path: '/profile/fields', component: () => import('./views/ManageFields.vue') },
  { path: '/profile/achievements', component: () => import('./views/Achievements.vue') },
  { path: '/ranking', component: () => import('./views/Ranking.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('naicha_token')
  if (!to.meta.noAuth && !token) {
    next('/login')
  } else if (to.meta.noAuth && token && (to.path === '/login' || to.path === '/register')) {
    next('/home')
  } else {
    next()
  }
})
