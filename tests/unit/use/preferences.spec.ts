import usePreferences from '@/use/preferences';
import useStorage from '@/use/storage';
import { flushPromises } from '@vue/test-utils';

jest.mock('@/use/storage');

describe('usePreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      (getValue as jest.Mock).mockResolvedValue(true);
      await load();
      expect(getValue).toHaveBeenCalledTimes(1);
      expect(getValue).toHaveBeenCalledWith('darkMode');
    });

    it('is set by load', async () => {
      const { getValue } = useStorage();
      const { prefersDarkMode, load } = usePreferences();
      prefersDarkMode.value = false;
      (getValue as jest.Mock).mockResolvedValue(true);
      await load();
      expect(prefersDarkMode.value).toEqual(true);
    });
  });
});
