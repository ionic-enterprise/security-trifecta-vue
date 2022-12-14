import useAuth from '@/composables/auth';
import useSessionVault from '@/composables/session-vault';
import useSync from '@/composables/sync';
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
    const { canUseLocking } = useSessionVault();
    (canUseLocking as jest.Mock).mockReturnValue(true);
  });

  describe('without a session that can be unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as jest.Mock).mockResolvedValue(false);
    });

    it('displays the title', async () => {
      const wrapper = await mountView();
      const titles = wrapper.findAll('ion-title');
      expect(titles).toHaveLength(1);
      expect(titles[0].text()).toBe('Login');
    });

    it('displays the "Sign In" button', async () => {
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="signin-button"]');
      expect(button.text()).toBe('Sign In');
    });

    it('displays the username/password inputs', async () => {
      const wrapper = await mountView();
      const email = wrapper.find('[data-testid="email-input"]');
      const password = wrapper.find('[data-testid="password-input"]');
      expect(email.exists()).toBe(true);
      expect(password.exists()).toBe(true);
    });

    describe('unlock mode', () => {
      it('is displayed', async () => {
        const wrapper = await mountView();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        expect(select.exists()).toBe(true);
      });

      it('is not displayed if the app cannot use locking', async () => {
        const { canUseLocking } = useSessionVault();
        (canUseLocking as jest.Mock).mockReturnValue(false);
        const wrapper = await mountView();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        expect(select.exists()).toBe(false);
      });

      it('displays non-biometric options if biometrics is not enabled', async () => {
        Device.isBiometricsEnabled = jest.fn().mockResolvedValue(false);
        const wrapper = await mountView();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        const opts = select.findAll('ion-select-option');

        expect(opts.length).toEqual(3);
        expect(opts[0].text()).toEqual('Session PIN Unlock');
        expect(opts[1].text()).toEqual('Never Lock Session');
        expect(opts[2].text()).toEqual('Force Login');
      });

      it('displays all options if biometrics is enabled', async () => {
        Device.isBiometricsEnabled = jest.fn().mockResolvedValue(true);
        const wrapper = await mountView();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        const opts = select.findAll('ion-select-option');

        expect(opts.length).toEqual(4);
        expect(opts[0].text()).toEqual('Biometric Unlock');
        expect(opts[1].text()).toEqual('Session PIN Unlock');
        expect(opts[2].text()).toEqual('Never Lock Session');
        expect(opts[3].text()).toEqual('Force Login');
      });
    });

    it('displays messages as the user enters invalid data', async () => {
      const wrapper = await mountView();
      const email = wrapper.findComponent('[data-testid="email-input"]');
      const password = wrapper.findComponent('[data-testid="password-input"]');
      const msg = wrapper.find('[data-testid="message-area"]');

      expect(msg.text()).toBe('');

      await email.setValue('foobar');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe('Email Address must be a valid email'));

      await email.setValue('');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe('Email Address is a required field'));

      await email.setValue('foobar@baz.com');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe(''));

      await password.setValue('mypassword');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe(''));

      await password.setValue('');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe('Password is a required field'));

      await password.setValue('mypassword');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe(''));
    });

    it('has a disabled signin button until valid data is entered', async () => {
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="signin-button"]');
      const email = wrapper.findComponent('[data-testid="email-input"]');
      const password = wrapper.findComponent('[data-testid="password-input"]');

      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await email.setValue('foobar');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await password.setValue('mypassword');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await email.setValue('foobar@baz.com');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
    });

    it('does not display the unlock button', async () => {
      const wrapper = await mountView();
      await flushPromises();
      const unlock = wrapper.find('[data-testid="unlock-button"]');
      expect(unlock.exists()).toBe(false);
    });

    describe('clicking on the signin button', () => {
      let wrapper: VueWrapper<any>;
      beforeEach(async () => {
        Device.isBiometricsEnabled = jest.fn().mockResolvedValue(false);
        wrapper = await mountView();
        const email = wrapper.findComponent('[data-testid="email-input"]');
        const password = wrapper.findComponent('[data-testid="password-input"]');
        await email.setValue('test@test.com');
        await password.setValue('test');
      });

      it('performs the login', async () => {
        const { login } = useAuth();
        const button = wrapper.find('[data-testid="signin-button"]');
        await button.trigger('click');
        expect(login).toHaveBeenCalledTimes(1);
        expect(login).toHaveBeenCalledWith('test@test.com', 'test');
      });

      describe('if the login succeeds', () => {
        beforeEach(() => {
          const { login } = useAuth();
          (login as jest.Mock).mockResolvedValue(true);
        });

        it('does not show an error', async () => {
          const button = wrapper.find('[data-testid="signin-button"]');
          const msg = wrapper.find('[data-testid="message-area"]');
          await button.trigger('click');
          await flushPromises();
          expect(msg.text()).toBe('');
        });

        it('syncs with the database', async () => {
          const sync = useSync();
          const button = wrapper.find('[data-testid="signin-button"]');
          await button.trigger('click');
          await flushPromises();
          expect(sync).toHaveBeenCalledTimes(1);
        });

        it('sets the desired unlock mode', async () => {
          const { setUnlockMode } = useSessionVault();
          const button = wrapper.find('[data-testid="signin-button"]');
          await button.trigger('click');
          await flushPromises();
          expect(setUnlockMode).toHaveBeenCalledTimes(1);
          expect(setUnlockMode).toHaveBeenCalledWith('SessionPIN');
        });

        it('navigates to the start page', async () => {
          const button = wrapper.find('[data-testid="signin-button"]');
          router.replace = jest.fn();
          await button.trigger('click');
          await flushPromises();
          expect(router.replace).toHaveBeenCalledTimes(1);
          expect(router.replace).toHaveBeenCalledWith('/');
        });
      });

      describe('if the login fails', () => {
        beforeEach(() => {
          const { login } = useAuth();
          (login as jest.Mock).mockResolvedValue(false);
        });

        it('does not show an error', async () => {
          const button = wrapper.find('[data-testid="signin-button"]');
          const msg = wrapper.find('[data-testid="message-area"]');
          button.trigger('click');
          await flushPromises();
          expect(msg.text()).toBe('Invalid email and/or password');
        });

        it('does not sync the database', async () => {
          const sync = useSync();
          const button = wrapper.find('[data-testid="signin-button"]');
          await button.trigger('click');
          expect(sync).not.toHaveBeenCalled();
        });

        it('does not navigate', async () => {
          const button = wrapper.find('[data-testid="signin-button"]');
          router.replace = jest.fn();
          button.trigger('click');
          await flushPromises();
          expect(router.replace).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('with a session that can be unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as jest.Mock).mockResolvedValue(true);
    });

    it('displays the title', async () => {
      const wrapper = await mountView();
      const titles = wrapper.findAll('ion-title');
      expect(titles).toHaveLength(1);
      expect(titles[0].text()).toBe('Unlock');
    });

    it('displays the "Redo Sign In" button', async () => {
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="signin-button"]');
      expect(button.text()).toBe('Redo Sign In');
    });

    it('hides the username/password inputs and unlock mode', async () => {
      const wrapper = await mountView();
      const email = wrapper.find('[data-testid="email-input"]');
      const password = wrapper.find('[data-testid="password-input"]');
      const select = wrapper.find('[data-testid="unlock-opt-select"]');
      expect(email.exists()).toBe(false);
      expect(password.exists()).toBe(false);
      expect(select.exists()).toBe(false);
    });

    it('unlock button is displayed', async () => {
      const wrapper = await mountView();
      const unlock = wrapper.find('[data-testid="unlock-button"]');
      expect(unlock.exists()).toBe(true);
    });

    it('clicking the signin button flips the mode to "sign in"', async () => {
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="signin-button"]');
      await button.trigger('click');
      const unlock = wrapper.find('[data-testid="unlock-button"]');
      const email = wrapper.find('[data-testid="email-input"]');
      const password = wrapper.find('[data-testid="password-input"]');
      expect(unlock.exists()).toBe(false);
      expect(email.exists()).toBe(true);
      expect(password.exists()).toBe(true);
    });

    describe('unlock clicked', () => {
      it('unlocks the vault', async () => {
        const { getSession } = useSessionVault();
        const wrapper = await mountView();
        router.replace = jest.fn();
        const unlock = wrapper.find('[data-testid="unlock-button"]');
        await unlock.trigger('click');
        await flushPromises();
        expect(getSession).toHaveBeenCalledTimes(1);
      });

      it('routes to the start page', async () => {
        const wrapper = await mountView();
        const unlock = wrapper.find('[data-testid="unlock-button"]');
        router.replace = jest.fn();
        await unlock.trigger('click');
        await flushPromises();
        expect(router.replace).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/');
      });
    });
  });
});
