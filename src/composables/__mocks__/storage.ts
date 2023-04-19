import { vi } from 'vitest';

export const useStorage = vi.fn().mockReturnValue({
  getValue: vi.fn().mockResolvedValue(undefined),
  setValue: vi.fn().mockResolvedValue(undefined),
});
