import AuthActionCompletePage from '@/views/AuthActionCompletePage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { VueWrapper, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { Router } from 'vue-router';

// Required by AppPreferences
vi.mock('@/composables/vault-factory');
vi.mock('@/router', () => ({
  default: {
    replace: vi.fn(),
  },
}));

describe('TastingNotesPage.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: AuthActionCompletePage }],
    });
    router.push('/');
    await router.isReady();
    return mount(AuthActionCompletePage, {
      global: {
        plugins: [router],
      },
    });
  };

  it('renders', async () => {
    const wrapper = await mountView();
    expect(wrapper.exists()).toBe(true);
  });
});
