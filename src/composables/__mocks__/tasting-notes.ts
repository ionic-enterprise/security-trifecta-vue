import { ref } from 'vue';
import { TastingNote } from '@/models';
import { vi } from 'vitest';

export const useTastingNotes = vi.fn().mockReturnValue({
  notes: ref<Array<TastingNote>>([]),
  find: vi.fn().mockResolvedValue(undefined),
  load: vi.fn().mockResolvedValue(undefined),
  refresh: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
});
