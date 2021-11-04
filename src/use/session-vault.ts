import { Session } from '@/models';
import useVaultFactory from '@/use/vault-factory';
import { DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import router from '@/router';
import { modalController } from '@ionic/vue';
import AppPinDialog from '@/components/AppPinDialog.vue';

export type UnlockMode = 'Device' | 'SessionPIN' | 'NeverLock' | 'ForceLogin';

const key = 'session';
let session: Session | null | undefined;

const { createVault } = useVaultFactory();
const vault = createVault({
  key: 'com.kensodemann.teataster',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 5000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
});

vault.onLock(() => {
  session = undefined;
  router.replace('/login');
});

vault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) => {
  const dlg = await modalController.create({
    backdropDismiss: false,
    component: AppPinDialog,
    componentProps: {
      setPasscodeMode: isPasscodeSetRequest,
    },
  });
  dlg.present();
  const { data } = await dlg.onDidDismiss();
  vault.setCustomPasscode(data || '');
});

const getSession = async (): Promise<Session | null | undefined> => {
  if (!session) {
    session = await vault.getValue(key);
  }
  return session;
};

const setSession = async (s: Session): Promise<void> => {
  session = s;
  return vault.setValue(key, s);
};

const canUnlock = async (): Promise<boolean> => {
  return (await vault.doesVaultExist()) && (await vault.isLocked());
};

const getVaultType = async (): Promise<VaultType | undefined> => {
  const exists = await vault.doesVaultExist();
  if (exists) {
    return vault.config.type;
  }
};

const setUnlockMode = async (unlockMode: UnlockMode): Promise<void> => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType;

  switch (unlockMode) {
    case 'Device':
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.Both;
      break;

    case 'SessionPIN':
      type = VaultType.CustomPasscode;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'ForceLogin':
      type = VaultType.InMemory;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'NeverLock':
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    default:
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
  }

  await vault.updateConfig({
    ...vault.config,
    type,
    deviceSecurityType,
  });
};

const clearSession = async (): Promise<void> => {
  session = undefined;
  await setUnlockMode('NeverLock');
  await vault.clear();
};

export default (): any => {
  return {
    canUnlock,
    clearSession,
    getSession,
    setSession,
    setUnlockMode,
    getVaultType,
  };
};
