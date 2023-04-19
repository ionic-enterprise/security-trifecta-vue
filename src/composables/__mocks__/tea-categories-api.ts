import { vi } from 'vitest';

export const useTeaCategoriesAPI = vi.fn().mockReturnValue({
  getAll: vi.fn().mockResolvedValue([]),
});
