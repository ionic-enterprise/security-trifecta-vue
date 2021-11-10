import useEncryption from '@/use/encryption';
import useVaultFactory from '@/use/vault-factory';
import { DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import useBackendAPI from '@/use/backend-api';

jest.mock('@/use/backend-api');
jest.mock('@/use/vault-factory');

describe('useEncryption', () => {
  let mockVault: any;

  beforeEach(() => {
    const { createVault } = useVaultFactory();
    mockVault = createVault({
      key: 'com.kensodemann.teatasterkeys',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      unlockVaultOnLoad: false,
    });
    jest.clearAllMocks();
  });

  describe('getDatabaseKey', () => {
    const { client } = useBackendAPI();
    const { getDatabaseKey } = useEncryption();

    beforeEach(() => {
      client.get.mockResolvedValue({ data: { storage: 'fiir99502939kd0-9304' } });
    });

    it('checks the vault', async () => {
      await getDatabaseKey();
      expect(mockVault.getValue).toHaveBeenCalledTimes(1);
      expect(mockVault.getValue).toHaveBeenCalledWith('database-key');
    });

    describe('when the key is in the vault', () => {
      beforeEach(() => {
        mockVault.getValue.mockResolvedValue('4293005940030-3994');
      });

      it('returns the key value', async () => {
        expect(await getDatabaseKey()).toEqual('4293005940030-3994');
      });

      it('does not call the backend API', async () => {
        await getDatabaseKey();
        expect(client.get).not.toHaveBeenCalled();
      });
    });

    describe('when the key is not in the vault', () => {
      beforeEach(() => {
        mockVault.getValue.mockResolvedValue(null);
      });

      it('gets the key from the backend API', async () => {
        await getDatabaseKey();
        expect(client.get).toHaveBeenCalledTimes(1);
        expect(client.get).toHaveBeenCalledWith('/keys');
      });

      it('stores the key', async () => {
        await getDatabaseKey();
        expect(mockVault.setValue).toHaveBeenCalledTimes(1);
        expect(mockVault.setValue).toHaveBeenCalledWith('database-key', 'fiir99502939kd0-9304');
      });

      it('returns the key', async () => {
        expect(await getDatabaseKey()).toEqual('fiir99502939kd0-9304');
      });
    });
  });
});
