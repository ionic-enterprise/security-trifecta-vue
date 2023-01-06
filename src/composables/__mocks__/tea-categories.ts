import { ref } from 'vue';
import { TeaCategory } from '@/models';

export const useTeaCategories = jest.fn().mockReturnValue({
  categories: ref<Array<TeaCategory>>([]),
  find: jest.fn().mockResolvedValue(undefined),
  load: jest.fn().mockResolvedValue(undefined),
  rate: jest.fn().mockResolvedValue(undefined),
  refresh: jest.fn().mockResolvedValue(undefined),
});
