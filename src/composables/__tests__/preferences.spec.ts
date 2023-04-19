import { usePreferences } from '@/composables/preferences';
import { useStorage } from '@/composables/storage';
import { flushPromises } from '@vue/test-utils';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/composables/storage');

describe('usePreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('prefers dark mode', () => {
    it('defaults to false', () => {
      const { prefersDarkMode } = usePreferences();
      expect(prefersDarkMode.value).toEqual(false);
    });

    it('is stored on change', async () => {
      const { setValue } = useStorage();
      const { prefersDarkMode } = usePreferences();
      prefersDarkMode.value = true;
      await flushPromises();
      expect(setValue).toHaveBeenCalledTimes(1);
      expect(setValue).toHaveBeenCalledWith('darkMode', true);
    });

    it('is loaded by load', async () => {
      const { getValue } = useStorage();
      const { prefersDarkMode, load } = usePreferences();
      prefersDarkMode.value = false;
      (getValue as Mock).mockResolvedValue(true);
      await load();
      expect(getValue).toHaveBeenCalledTimes(1);
      expect(getValue).toHaveBeenCalledWith('darkMode');
    });

    it('is set by load', async () => {
      const { getValue } = useStorage();
      const { prefersDarkMode, load } = usePreferences();
      prefersDarkMode.value = false;
      (getValue as Mock).mockResolvedValue(true);
      await load();
      expect(prefersDarkMode.value).toEqual(true);
    });
  });
});
