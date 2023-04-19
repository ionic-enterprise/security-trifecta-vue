import { vi } from 'vitest';

export const useEncryption = vi.fn().mockReturnValue({
  getDatabaseKey: vi.fn().mockResolvedValue(undefined),
});
