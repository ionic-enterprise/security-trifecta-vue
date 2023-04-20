import AppPinDialog from '@/components/AppPinDialog.vue';
import { useVaultFactory } from '@/composables/vault-factory';
import router from '@/router';
import { AuthResult } from '@ionic-enterprise/auth';
import { BiometricPermissionState, Device, DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import { isPlatform, modalController } from '@ionic/vue';

export type UnlockMode = 'Device' | 'SessionPIN' | 'NeverLock' | 'ForceLogin';

const key = 'session';
let session: AuthResult | null | undefined;

const { createVault } = useVaultFactory();
const vault = createVault({
  key: 'io.ionic.csdemosecurestorage',
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

const getSession = async (): Promise<AuthResult | null | undefined> => {
  if (!session) {
    session = await vault.getValue(key);
  }
  return session;
};

const setSession = async (s: AuthResult): Promise<void> => {
  session = s;
  return vault.setValue(key, s);
};

const canUnlock = async (): Promise<boolean> => {
  return isPlatform('hybrid') && !(await vault.isEmpty()) && (await vault.isLocked());
};

const canUseLocking = (): boolean => isPlatform('hybrid');

const getVaultType = async (): Promise<VaultType | undefined> => {
  const exists = !(await vault.isEmpty());
  if (exists) {
    return vault.config.type;
  }
};

const provision = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Authenticate to continue' });
  }
};

const setUnlockMode = async (unlockMode: UnlockMode): Promise<void> => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType;

  switch (unlockMode) {
    case 'Device':
      await provision();
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
  await vault.clear();
  await setUnlockMode('NeverLock');
};

export const useSessionVault = () => {
  return {
    canUnlock,
    canUseLocking,
    clearSession,
    getSession,
    setSession,
    setUnlockMode,
    getVaultType,
  };
};
