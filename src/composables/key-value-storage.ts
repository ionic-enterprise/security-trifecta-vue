import { KeyValueStorage } from '@ionic-enterprise/secure-storage';

const storage = new KeyValueStorage();

export const useKeyValueStorage = () => storage;
