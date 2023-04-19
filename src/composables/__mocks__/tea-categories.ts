import { ref } from 'vue';
import { TeaCategory } from '@/models';
import { vi } from 'vitest';

export const useTeaCategories = vi.fn().mockReturnValue({
  categories: ref<Array<TeaCategory>>([]),
  find: vi.fn().mockResolvedValue(undefined),
  load: vi.fn().mockResolvedValue(undefined),
  rate: vi.fn().mockResolvedValue(undefined),
  refresh: vi.fn().mockResolvedValue(undefined),
});
