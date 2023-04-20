import { createRouter, createWebHistory } from '@ionic/vue-router';
import { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import StartPage from '../views/StartPage.vue';
import { useAuth } from '@/composables/auth';

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
    const { isAuthenticated } = useAuth();
    if (!(await isAuthenticated())) {
      return next('/login');
    }
  }
  next();
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(checkAuthStatus);

export default router;
