import { vi } from 'vitest';

export const useTeaCategoriesDatabase = vi.fn().mockReturnValue({
  getAll: vi.fn().mockResolvedValue([]),
  trim: vi.fn().mockResolvedValue(undefined),
  upsert: vi.fn().mockResolvedValue(undefined),
});
