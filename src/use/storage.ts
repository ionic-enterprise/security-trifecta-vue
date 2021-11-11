import useEncryption from '@/use/encryption';
import IonicSecureStorageDriver from '@ionic-enterprise/secure-storage/driver';
import { Drivers, Storage } from '@ionic/storage';
import { isPlatform } from '@ionic/vue';

const storage = new Storage({
  driverOrder: [Drivers.SecureStorage, Drivers.IndexedDB, Drivers.LocalStorage],
});
let initialized = false;

const isReadyForInitialization = async (): Promise<boolean> => {
  if (isPlatform('hybrid')) {
    const { getDatabaseKey } = useEncryption();
    const key = await getDatabaseKey();
    if (!key) {
      return false;
    }
    await storage.defineDriver(IonicSecureStorageDriver);
    storage.setEncryptionKey(key);
  }
  return true;
};

const isReady = async (): Promise<boolean> => {
  if (!initialized) {
    if (await isReadyForInitialization()) {
      await storage.create();
      initialized = true;
    }
  }
  return initialized;
};

const getValue = async (key: string): Promise<any> => {
  if (await isReady()) {
    return storage.get(key);
  }
};

const setValue = async (key: string, value: any): Promise<void> => {
  if (await isReady()) {
    await storage.set(key, value);
  }
};

export default () => ({
  getValue,
  setValue,
});
