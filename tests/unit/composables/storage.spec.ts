import { useEncryption } from '@/composables/encryption';
import { useStorage } from '@/composables/storage';
import { KeyValueStorage } from '@ionic-enterprise/secure-storage';
import { isPlatform } from '@ionic/vue';

jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn().mockReturnValue(true) };
});
jest.mock('@/composables/encryption');
jest.mock('@/composables/vault-factory');
jest.mock('@ionic-enterprise/secure-storage', () => {
  const actual = jest.requireActual('@ionic-enterprise/secure-storage');
  const mockKeyValueStorage = {
    create: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue('foo'),
  };
  return {
    ...actual,
    KeyValueStorage: jest.fn(() => mockKeyValueStorage),
  };
});

describe('useStorage', () => {
  let store: KeyValueStorage;
  beforeAll(() => {
    useStorage();
    store = new KeyValueStorage();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (isPlatform as jest.Mock).mockImplementation((key: string) => key === 'web');
  });

  it('creates the storage on the first call', async () => {
    const { setValue } = useStorage();
    const { getDatabaseKey } = useEncryption();
    (getDatabaseKey as jest.Mock).mockResolvedValue('foo-bar-key');
    (isPlatform as jest.Mock).mockImplementation((key: string) => key === 'hybrid');
    expect(store.create).not.toHaveBeenCalled();
    await setValue('some-key', false);
    expect(store.create).toHaveBeenCalledTimes(1);
    expect(store.create).toHaveBeenCalledWith('foo-bar-key');
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
      (store.get as jest.Mock).mockResolvedValue(427349);
      expect(await getValue('some-key')).toEqual(427349);
    });
  });
});
