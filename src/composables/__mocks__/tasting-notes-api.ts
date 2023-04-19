import { vi } from 'vitest';

export const useTastingNotesAPI = vi.fn().mockReturnValue({
  getAll: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
});
