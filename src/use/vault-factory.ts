import { isPlatform } from '@ionic/vue';
import { BrowserVault, IdentityVaultConfig, Vault } from '@ionic-enterprise/identity-vault';

export default (): any => {
  const createVault = (config: IdentityVaultConfig): Vault | BrowserVault =>
    isPlatform('hybrid') ? new Vault(config) : new BrowserVault(config);

  return { createVault };
};
