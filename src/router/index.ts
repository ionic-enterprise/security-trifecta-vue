import { useSessionVault } from '@/composables/session-vault';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import StartPage from '../views/StartPage.vue';

const { getSession } = useSessionVault();

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: StartPage,
  },
  {
    path: '/home',
    component: () => import('@/views/TastingNotesPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue'),
  },
];

const checkAuthStatus = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.matched.some((r) => r.meta.requiresAuth)) {
    const session = await getSession();
    if (!session) {
      return next('/login');
    }
  }
  next();
};

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(checkAuthStatus);

export default router;
