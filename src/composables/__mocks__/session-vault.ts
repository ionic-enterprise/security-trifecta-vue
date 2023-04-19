import { vi } from 'vitest';

let onLockCallback: (() => Promise<void>) | undefined;

export const useSessionVault = vi.fn().mockReturnValue({
  canUnlock: vi.fn().mockResolvedValue(false),
  canUseLocking: vi.fn().mockReturnValue(false),
  clearSession: vi.fn().mockResolvedValue(undefined),
  setSession: vi.fn().mockResolvedValue(undefined),
  getSession: vi.fn().mockResolvedValue(undefined),
  setUnlockMode: vi.fn().mockResolvedValue(undefined),
  onLock: vi.fn().mockImplementation((cb: () => Promise<void>) => (onLockCallback = cb)),
  lock: vi.fn().mockImplementation(() => {
    if (onLockCallback) {
      onLockCallback();
    }
  }),
});
