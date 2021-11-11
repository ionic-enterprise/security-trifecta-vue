import useAuth from '@/use/auth';
import useSessionVault from '@/use/session-vault';
import Login from '@/views/Login.vue';
import { Device } from '@ionic-enterprise/identity-vault';
import { isPlatform } from '@ionic/vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { Router } from 'vue-router';
import waitForExpect from 'wait-for-expect';

jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn() };
});
jest.mock('@/use/auth');
jest.mock('@/use/session-vault');

describe('Login.vue', () => {
  let currentPlatform = 'hybrid';
  let router: Router;

  const mountView = async (): Promise<VueWrapper<typeof Login>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: Login }],
    });
    router.push('/');
    await router.isReady();
    return mount(Login, {
      global: {
        plugins: [router],
      },
    });
  };

  beforeEach(() => {
    currentPlatform = 'hybrid';
    (isPlatform as any).mockImplementation((key: string) => key === currentPlatform);
    jest.clearAllMocks();
  });

  describe('without a session that can be unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as any).mockResolvedValue(false);
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
      it('is displayed on native', async () => {
        const wrapper = await mountView();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        expect(select.exists()).toBe(true);
      });

      it('is not displayed on the web', async () => {
        currentPlatform = 'web';
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
        expect(wrapper.vm.unlockMode).toEqual('SessionPIN');
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
        expect(wrapper.vm.unlockMode).toEqual('Device');
      });
    });

    it('displays messages as the user enters invalid data', async () => {
      const wrapper = await mountView();
      const email = wrapper.findComponent('[data-testid="email-input"]');
      const password = wrapper.find('[data-testid="password-input"]').findComponent({ name: 'ion-input' });
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
      const email = wrapper.find('[data-testid="email-input"]').findComponent({ name: 'ion-input' });
      const password = wrapper.find('[data-testid="password-input"]').findComponent({ name: 'ion-input' });

      await flushPromises();
      await waitForExpect(() => expect(button.attributes().disabled).toBe('true'));

      await email.setValue('foobar');
      await flushPromises();
      await waitForExpect(() => expect(button.attributes().disabled).toBe('true'));

      await password.setValue('mypassword');
      await flushPromises();
      await waitForExpect(() => expect(button.attributes().disabled).toBe('true'));

      await email.setValue('foobar@baz.com');
      await flushPromises();
      await waitForExpect(() => expect(button.attributes().disabled).toBe('false'));
    });

    it('does not display the unlock button', async () => {
      const wrapper = await mountView();
      await flushPromises();
      const unlock = wrapper.find('[data-testid="unlock-button"]');
      expect(unlock.exists()).toBe(false);
    });

    describe('clicking on the signin button', () => {
      let wrapper: VueWrapper<typeof Login>;
      beforeEach(async () => {
        Device.isBiometricsEnabled = jest.fn().mockResolvedValue(false);
        wrapper = await mountView();
        const email = wrapper.find('[data-testid="email-input"]').findComponent({ name: 'ion-input' });
        const password = wrapper.find('[data-testid="password-input"]').findComponent({ name: 'ion-input' });
        await email.setValue('test@test.com');
        await password.setValue('test');
      });

      it('performs the login', async () => {
        const { login } = useAuth();
        const button = wrapper.find('[data-testid="signin-button"]');
        button.trigger('click');
        expect(login).toHaveBeenCalledTimes(1);
        expect(login).toHaveBeenCalledWith('test@test.com', 'test');
      });

      describe('if the login succeeds', () => {
        beforeEach(() => {
          const { login } = useAuth();
          (login as any).mockResolvedValue(true);
        });

        it('does not show an error', async () => {
          const button = wrapper.find('[data-testid="signin-button"]');
          const msg = wrapper.find('[data-testid="message-area"]');
          button.trigger('click');
          await flushPromises();
          expect(msg.text()).toBe('');
        });

        it('sets the desired unlock mode', async () => {
          const { setUnlockMode } = useSessionVault();
          const button = wrapper.find('[data-testid="signin-button"]');
          await button.trigger('click');
          expect(setUnlockMode).toHaveBeenCalledTimes(1);
          expect(setUnlockMode).toHaveBeenCalledWith('SessionPIN');
        });

        it('navigates to the start page', async () => {
          const button = wrapper.find('[data-testid="signin-button"]');
          router.replace = jest.fn();
          await button.trigger('click');
          expect(router.replace).toHaveBeenCalledTimes(1);
          expect(router.replace).toHaveBeenCalledWith('/');
        });
      });

      describe('if the login fails', () => {
        beforeEach(() => {
          const { login } = useAuth();
          (login as any).mockResolvedValue(false);
        });

        it('does not show an error', async () => {
          const button = wrapper.find('[data-testid="signin-button"]');
          const msg = wrapper.find('[data-testid="message-area"]');
          button.trigger('click');
          await flushPromises();
          expect(msg.text()).toBe('Invalid email and/or password');
        });

        it('navigates to the root page', async () => {
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
      (canUnlock as any).mockResolvedValue(true);
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

  it('is in "sign in" mode on the web, even if we have a session', async () => {
    currentPlatform = 'web';
    const { canUnlock } = useSessionVault();
    (canUnlock as any).mockResolvedValue(true);
    const wrapper = await mountView();
    const unlock = wrapper.find('[data-testid="unlock-button"]');
    const email = wrapper.find('[data-testid="email-input"]');
    const password = wrapper.find('[data-testid="password-input"]');
    expect(unlock.exists()).toBe(false);
    expect(email.exists()).toBe(true);
    expect(password.exists()).toBe(true);
  });
});
