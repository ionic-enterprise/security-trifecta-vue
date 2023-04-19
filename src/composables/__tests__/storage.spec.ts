import { useEncryption } from '@/composables/encryption';
import { useStorage } from '@/composables/storage';
import { KeyValueStorage } from '@ionic-enterprise/secure-storage';
import { isPlatform } from '@ionic/vue';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeyValueStorage } from '@/composables/key-value-storage';

vi.mock('@ionic/vue', async () => {
  const actual = (await vi.importActual('@ionic/vue')) as any;
  return { ...actual, isPlatform: vi.fn().mockReturnValue(true) };
});
vi.mock('@/composables/encryption');
vi.mock('@/composables/key-value-storage');
vi.mock('@/composables/vault-factory');

describe('useStorage', () => {
  let store: KeyValueStorage;
  beforeAll(() => {
    useStorage();
    store = useKeyValueStorage();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (isPlatform as Mock).mockImplementation((key: string) => key === 'web');
  });

  it('creates the storage on the first call', async () => {
    const { setValue } = useStorage();
    const { getDatabaseKey } = useEncryption();
    (getDatabaseKey as Mock).mockResolvedValue('foo-bar-key');
    (isPlatform as Mock).mockImplementation((key: string) => key === 'hybrid');
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
      (store.get as Mock).mockResolvedValue(427349);
      expect(await getValue('some-key')).toEqual(427349);
    });
  });
});
