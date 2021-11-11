import useStorage from '@/use/storage';
import { Storage } from '@ionic/storage';
import { isPlatform } from '@ionic/vue';

jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn() };
});
jest.mock('@/use/vault-factory');
jest.mock('@ionic/storage');

describe('useStorage', () => {
  let store: Storage;
  beforeAll(() => {
    useStorage();
    store = (Storage as any).mock.instances[0];
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (isPlatform as any).mockImplementation((key: string) => key === 'web');
  });

  it('creates the storage on the first call', async () => {
    const { setValue } = useStorage();
    expect(store.create).not.toHaveBeenCalled();
    await setValue('some-key', false);
    expect(store.create).toHaveBeenCalledTimes(1);
    await setValue('some-key', true);
    expect(store.create).toHaveBeenCalledTimes(1);
  });

  describe('set value', () => {
    it('sets the value', async () => {
      const { setValue } = useStorage();
      await setValue('some-key', false);
      expect(store.set).toHaveBeenCalledTimes(1);
      expect(store.set).toHaveBeenCalledWith('some-key', false);
    });
  });

  describe('get value', () => {
    it('gets the value', async () => {
      const { getValue } = useStorage();
      await getValue('some-key');
      expect(store.get).toHaveBeenCalledTimes(1);
      expect(store.get).toHaveBeenCalledWith('some-key');
    });

    it('returns the value', async () => {
      const { getValue } = useStorage();
      (store.get as any).mockResolvedValue(427349);
      expect(await getValue('some-key')).toEqual(427349);
    });
  });
});
