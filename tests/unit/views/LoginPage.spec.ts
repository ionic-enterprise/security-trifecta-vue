import { useAuth } from '@/composables/auth';
import { useSessionVault } from '@/composables/session-vault';
import { useSync } from '@/composables/sync';
import LoginPage from '@/views/LoginPage.vue';
import { Device } from '@ionic-enterprise/identity-vault';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { Router } from 'vue-router';
import waitForExpect from 'wait-for-expect';

jest.mock('@/composables/auth');
jest.mock('@/composables/session-vault');
jest.mock('@/composables/sync');

describe('LoginPage.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: LoginPage }],
    });
    router.push('/');
    await router.isReady();
    return mount(LoginPage, {
      global: {
        plugins: [router],
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('without a session that can be unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as jest.Mock).mockResolvedValue(false);
    });

    it('displays the login card', async () => {
      const wrapper = await mountView();
      const loginCard = wrapper.findComponent('[data-testid="login-card"]');
      const unlockCard = wrapper.findComponent('[data-testid="unlock-card"]');
      expect(loginCard.exists()).toBe(true);
      expect(unlockCard.exists()).toBe(false);
    });

    describe('on login success', () => {
      it('syncs the database', async () => {
        const sync = useSync();
        const wrapper = await mountView();
        const loginCard = wrapper.findComponent('[data-testid="login-card"]') as VueWrapper;
        loginCard.vm.$emit('success');
        await flushPromises();
        expect(sync).toHaveBeenCalledTimes(1);
      });

      it('redirects to the main route', async () => {
        const wrapper = await mountView();
        const loginCard = wrapper.findComponent('[data-testid="login-card"]') as VueWrapper;
        router.replace = jest.fn();
        loginCard.vm.$emit('success');
        await flushPromises();
        expect(router.replace).toHaveReturnedTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('with a session that can be unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as jest.Mock).mockResolvedValue(true);
    });

    it('displays the unlock card', async () => {
      const wrapper = await mountView();
      const loginCard = wrapper.findComponent('[data-testid="login-card"]');
      const unlockCard = wrapper.findComponent('[data-testid="unlock-card"]');
      expect(loginCard.exists()).toBe(false);
      expect(unlockCard.exists()).toBe(true);
    });

    describe('on unlock', () => {
      it('navigates to the main route', async () => {
        const wrapper = await mountView();
        const unlockCard = wrapper.findComponent('[data-testid="unlock-card"]') as VueWrapper;
        router.replace = jest.fn();
        unlockCard.vm.$emit('unlocked');
        await flushPromises();
        expect(router.replace).toHaveReturnedTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/');
      });
    });

    describe('on vault cleared', () => {
      it('displays the login card', async () => {
        const wrapper = await mountView();
        let unlockCard = wrapper.findComponent('[data-testid="unlock-card"]') as VueWrapper;
        unlockCard.vm.$emit('vault-cleared');
        await flushPromises();
        unlockCard = wrapper.findComponent('[data-testid="unlock-card"]') as VueWrapper;
        const loginCard = wrapper.findComponent('[data-testid="login-card"]');
        expect(loginCard.exists()).toBe(true);
        expect(unlockCard.exists()).toBe(false);
      });
    });
  });
});
