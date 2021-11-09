import { ref } from 'vue';
import { TastingNote } from '@/models';

export default jest.fn().mockReturnValue({
  notes: ref<Array<TastingNote>>([]),
  find: jest.fn().mockResolvedValue(undefined),
  merge: jest.fn().mockResolvedValue(undefined),
  refresh: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
});
