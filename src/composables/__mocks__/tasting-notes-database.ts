import { vi } from 'vitest';

export const useTastingNotesDatabase = vi.fn().mockReturnValue({
  getAll: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
  reset: vi.fn().mockResolvedValue(undefined),
  trim: vi.fn().mockResolvedValue(undefined),
  upsert: vi.fn().mockResolvedValue(undefined),
});
