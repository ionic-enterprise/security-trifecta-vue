import AppLoginCard from '@/components/AppLoginCard.vue';
import { useAuth } from '@/composables/auth';
import { useSessionVault } from '@/composables/session-vault';
import { Device } from '@ionic-enterprise/identity-vault';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import waitForExpect from 'wait-for-expect';

vi.mock('@/composables/auth');
vi.mock('@/composables/session-vault');

describe('AppLoginCard.vue', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = mount(AppLoginCard);
    expect(wrapper.exists()).toBe(true);
  });

  describe('unlock mode', () => {
    describe('if the app cannot use locking', () => {
      beforeEach(() => {
        const { canUseLocking } = useSessionVault();
        (canUseLocking as Mock).mockReturnValue(false);
      });

      it('is not displayed', async () => {
        const wrapper = mount(AppLoginCard);
        await flushPromises();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        expect(select.exists()).toBe(false);
      });
    });

    describe('if the app can use locking', () => {
      beforeEach(() => {
        const { canUseLocking } = useSessionVault();
        (canUseLocking as Mock).mockReturnValue(true);
      });

      it('is displayed', async () => {
        const wrapper = mount(AppLoginCard);
        await flushPromises();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        expect(select.exists()).toBe(true);
      });

      it('displays non-biometric options if biometrics is not enabled', async () => {
        Device.isBiometricsEnabled = vi.fn().mockResolvedValue(false);
        const wrapper = mount(AppLoginCard);
        await flushPromises();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        const opts = select.findAll('ion-select-option');

        expect(opts.length).toEqual(3);
        expect(opts[0].text()).toEqual('Session PIN Unlock');
        expect(opts[1].text()).toEqual('Never Lock Session');
        expect(opts[2].text()).toEqual('Force Login');
      });

      it('displays all options if biometrics is enabled', async () => {
        Device.isBiometricsEnabled = vi.fn().mockResolvedValue(true);
        const wrapper = mount(AppLoginCard);
        await flushPromises();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        const opts = select.findAll('ion-select-option');

        expect(opts.length).toEqual(4);
        expect(opts[0].text()).toEqual('Biometric Unlock');
        expect(opts[1].text()).toEqual('Session PIN Unlock');
        expect(opts[2].text()).toEqual('Never Lock Session');
        expect(opts[3].text()).toEqual('Force Login');
      });
    });
  });

  describe('clicking on the signin button', () => {
    let wrapper: VueWrapper<any>;
    beforeEach(async () => {
      Device.isBiometricsEnabled = vi.fn().mockResolvedValue(false);
      wrapper = mount(AppLoginCard);
      await flushPromises();
    });

    it('performs the login', async () => {
      const { login } = useAuth();
      const button = wrapper.find('[data-testid="signin-button"]');
      await button.trigger('click');
      expect(login).toHaveBeenCalledTimes(1);
    });

    describe('if the login succeeds', () => {
      beforeEach(() => {
        const { login } = useAuth();
        (login as Mock).mockResolvedValue(undefined);
      });

      it('sets the desired unlock mode', async () => {
        const { setUnlockMode } = useSessionVault();
        const button = wrapper.find('[data-testid="signin-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(setUnlockMode).toHaveBeenCalledTimes(1);
        expect(setUnlockMode).toHaveBeenCalledWith('SessionPIN');
      });

      it('emits success', async () => {
        const button = wrapper.find('[data-testid="signin-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(wrapper.emitted('success')).toBeTruthy();
      });
    });

    describe('if the login fails', () => {
      beforeEach(() => {
        const { login } = useAuth();
        (login as Mock).mockRejectedValue(new Error('the login failed'));
      });

      it('does not emit success', async () => {
        const button = wrapper.find('[data-testid="signin-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(wrapper.emitted('success')).toBeFalsy();
      });
    });
  });
});
