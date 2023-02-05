import { flushPromises, mount } from '@vue/test-utils';
import AppUnlockCard from '@/components/AppUnlockCard.vue';
import { useSessionVault } from '@/composables/session-vault';

jest.mock('@/composables/session-vault');

describe('AppUnlockCard.vue', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = mount(AppUnlockCard);
    expect(wrapper.exists()).toBe(true);
  });

  describe('clicking the signin button', () => {
    it('clears the vault', async () => {
      const { clearSession } = useSessionVault();
      const wrapper = mount(AppUnlockCard);
      const button = wrapper.find('[data-testid="signin-button"]');
      await button.trigger('click');
      await flushPromises();
      expect(clearSession).toHaveBeenCalledTimes(1);
    });

    it('emits vault-cleared', async () => {
      const wrapper = mount(AppUnlockCard);
      const button = wrapper.find('[data-testid="signin-button"]');
      await button.trigger('click');
      expect(wrapper.emitted('vault-cleared')).toBeTruthy();
    });
  });

  describe('clicking the unlock button', () => {
    it('unlocks the vault', async () => {
      const { getSession } = useSessionVault();
      const wrapper = mount(AppUnlockCard);
      const button = wrapper.find('[data-testid="unlock-button"]');
      await button.trigger('click');
      await flushPromises();
      expect(getSession).toHaveBeenCalledTimes(1);
    });

    it('emits unlocked', async () => {
      const wrapper = mount(AppUnlockCard);
      const button = wrapper.find('[data-testid="unlock-button"]');
      await button.trigger('click');
      await flushPromises();
      expect(wrapper.emitted('unlocked')).toBeTruthy();
    });
  });
});
