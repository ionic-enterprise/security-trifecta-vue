import { IdentityVaultConfig } from '@ionic-enterprise/identity-vault';
let onLockCallback: undefined | (() => Promise<void>);
let onUnlockCallback: undefined | (() => Promise<void>);

const mockVault = {
  config: undefined as IdentityVaultConfig | undefined,
  clear: jest.fn().mockResolvedValue(undefined),
  setValue: jest.fn().mockResolvedValue(undefined),
  getValue: jest.fn().mockResolvedValue(undefined),
  updateConfig: jest.fn().mockResolvedValue(undefined),
  doesVaultExist: jest.fn().mockResolvedValue(false),
  isLocked: jest.fn().mockResolvedValue(false),
  onLock: jest.fn().mockImplementation((cb: () => Promise<void>) => (onLockCallback = cb)),
  onPasscodeRequested: jest.fn().mockResolvedValue(undefined),
  onUnlock: jest.fn().mockImplementation((cb: () => Promise<void>) => (onUnlockCallback = cb)),
  lock: jest.fn().mockImplementation(() => {
    if (onLockCallback) {
      onLockCallback();
    }
  }),
  unlock: jest.fn().mockImplementation(() => {
    if (onUnlockCallback) {
      onUnlockCallback();
    }
  }),
};

export default jest.fn().mockReturnValue({
  createVault: jest.fn().mockImplementation((config: IdentityVaultConfig) => {
    mockVault.config = config;
    return mockVault;
  }),
});
