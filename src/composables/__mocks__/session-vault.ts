let onLockCallback: (() => Promise<void>) | undefined;

export const useSessionVault = jest.fn().mockReturnValue({
  canUnlock: jest.fn().mockResolvedValue(false),
  canUseLocking: jest.fn().mockReturnValue(false),
  clearSession: jest.fn().mockResolvedValue(undefined),
  setSession: jest.fn().mockResolvedValue(undefined),
  getSession: jest.fn().mockResolvedValue(undefined),
  setUnlockMode: jest.fn().mockResolvedValue(undefined),
  onLock: jest.fn().mockImplementation((cb: () => Promise<void>) => (onLockCallback = cb)),
  lock: jest.fn().mockImplementation(() => {
    if (onLockCallback) {
      onLockCallback();
    }
  }),
});
