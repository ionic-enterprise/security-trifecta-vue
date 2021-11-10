import useVaultFactory from '@/use/vault-factory';
import { DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import useBackendAPI from '@/use/backend-api';

const { createVault } = useVaultFactory();
const vault = createVault({
  key: 'com.kensodemann.teatasterkeys',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  unlockVaultOnLoad: false,
});

const databaseKey = 'database-key';

const getKeyFromBackendAPI = async (): Promise<string | undefined> => {
  const { client } = useBackendAPI();
  const res = await client.get('/keys');
  return res.data && res.data.storage;
};

const getDatabaseKey = async (): Promise<string | void> => {
  let key = await vault.getValue(databaseKey);
  if (!key) {
    key = await getKeyFromBackendAPI();
    vault.setValue(databaseKey, key);
  }
  return key;
};

export default () => ({
  getDatabaseKey,
});
