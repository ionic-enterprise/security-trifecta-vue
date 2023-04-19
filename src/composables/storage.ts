import { useEncryption } from '@/composables/encryption';
import { isPlatform } from '@ionic/vue';
import { useKeyValueStorage } from './key-value-storage';

const storage = useKeyValueStorage();
let isReady: Promise<void>;

const createDatabase = async (): Promise<void> => {
  const { getDatabaseKey } = useEncryption();
  const key = isPlatform('hybrid') ? await getDatabaseKey() : '';
  await storage.create(key || '');
};

const initialize = async (): Promise<void> => {
  if (!isReady) {
    isReady = createDatabase();
  }
  return isReady;
};

const getValue = async (key: string): Promise<any> => {
  await initialize();
  return storage.get(key);
};

const setValue = async (key: string, value: any): Promise<void> => {
  await initialize();
  await storage.set(key, value);
};

export const useStorage = () => ({
  getValue,
  setValue,
});
