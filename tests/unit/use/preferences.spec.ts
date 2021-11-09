import usePreferences from '@/use/preferences';
import { Storage } from '@ionic/storage';
import { flushPromises } from '@vue/test-utils';

jest.mock('@ionic/storage');

describe('usePreferences', () => {
  let store: Storage;
  beforeAll(() => {
    store = (Storage as any).mock.instances[0];
  });

  it('creates the storage', () => {
    expect(store.create).toHaveBeenCalledTimes(1);
  });

  describe('prefers dark mode', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('defaults to false', () => {
      const { prefersDarkMode } = usePreferences();
      expect(prefersDarkMode.value).toEqual(false);
    });

    it('is stored on change', async () => {
      const { prefersDarkMode } = usePreferences();
      prefersDarkMode.value = true;
      await flushPromises();
      expect(store.set).toHaveBeenCalledTimes(1);
      expect(store.set).toHaveBeenCalledWith('darkMode', true);
    });

    it('is loaded by load', async () => {
      const { prefersDarkMode, load } = usePreferences();
      prefersDarkMode.value = false;
      (store.get as any).mockResolvedValue(true);
      await load();
      expect(store.get).toHaveBeenCalledTimes(1);
      expect(store.get).toHaveBeenCalledWith('darkMode');
    });

    it('is set by load', async () => {
      const { prefersDarkMode, load } = usePreferences();
      prefersDarkMode.value = false;
      (store.get as any).mockResolvedValue(true);
      await load();
      expect(prefersDarkMode.value).toEqual(true);
    });
  });
});
