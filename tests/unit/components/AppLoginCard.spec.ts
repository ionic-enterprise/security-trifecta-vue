import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import AppLoginCard from '@/components/AppLoginCard.vue';
import { useSessionVault } from '@/composables/session-vault';
import { Device } from '@ionic-enterprise/identity-vault';
import waitForExpect from 'wait-for-expect';
import { useAuth } from '@/composables/auth';

jest.mock('@/composables/auth');
jest.mock('@/composables/session-vault');

describe('AppLoginCard.vue', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = mount(AppLoginCard);
    expect(wrapper.exists()).toBe(true);
  });

  describe('unlock mode', () => {
    describe('if the app cannot use locking', () => {
      beforeEach(() => {
        const { canUseLocking } = useSessionVault();
        (canUseLocking as jest.Mock).mockReturnValue(false);
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
        (canUseLocking as jest.Mock).mockReturnValue(true);
      });

      it('is displayed', async () => {
        const wrapper = mount(AppLoginCard);
        await flushPromises();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        expect(select.exists()).toBe(true);
      });

      it('displays non-biometric options if biometrics is not enabled', async () => {
        Device.isBiometricsEnabled = jest.fn().mockResolvedValue(false);
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
        Device.isBiometricsEnabled = jest.fn().mockResolvedValue(true);
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

  it('displays messages as the user enters invalid data', async () => {
    const wrapper = mount(AppLoginCard);
    await flushPromises();
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
    const wrapper = mount(AppLoginCard);
    await flushPromises();
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

  describe('clicking on the signin button', () => {
    let wrapper: VueWrapper<any>;
    beforeEach(async () => {
      Device.isBiometricsEnabled = jest.fn().mockResolvedValue(false);
      wrapper = mount(AppLoginCard);
      await flushPromises();
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
        (login as jest.Mock).mockResolvedValue(false);
      });

      it('does not show an error', async () => {
        const button = wrapper.find('[data-testid="signin-button"]');
        const msg = wrapper.find('[data-testid="message-area"]');
        button.trigger('click');
        await flushPromises();
        expect(msg.text()).toBe('Invalid email and/or password');
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
