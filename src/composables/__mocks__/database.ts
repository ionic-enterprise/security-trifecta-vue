import { vi } from 'vitest';

export const useDatabase = vi.fn().mockReturnValue({
  getHandle: vi.fn().mockResolvedValue(undefined),
});
