import useBackendAPI from '@/composables/backend-api';
import useTeaCategoriesAPI from '@/composables/tea-categories-api';
import { TeaCategory } from '@/models';

jest.mock('@/composables/backend-api');

describe('useTeaCategories', () => {
  const { client } = useBackendAPI();
  let teaCategories: Array<TeaCategory>;

  const initializeTestData = () => {
    teaCategories = [
      {
        id: 1,
        name: 'Green',
        description: 'Green tea description.',
      },
      {
        id: 2,
        name: 'Black',
        description: 'Black tea description.',
      },
      {
        id: 3,
        name: 'Herbal',
        description: 'Herbal Infusion description.',
      },
      {
        id: 4,
        name: 'Oolong',
        description: 'Oolong tea description.',
      },
      {
        id: 5,
        name: 'Dark',
        description: 'Dark tea description.',
      },
      {
        id: 6,
        name: 'Puer',
        description: 'Puer tea description.',
      },
      {
        id: 7,
        name: 'White',
        description: 'White tea description.',
      },
      {
        id: 8,
        name: 'Yellow',
        description: 'Yellow tea description.',
      },
    ];
  };

  beforeEach(() => {
    initializeTestData();
    jest.clearAllMocks();
    (client.get as jest.Mock).mockResolvedValue({ data: teaCategories });
  });

  describe('getAll', () => {
    it('gets the tea categories', async () => {
      const { getAll } = useTeaCategoriesAPI();
      await getAll();
      expect(client.get).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith('/tea-categories');
    });

    it('resolves the tea categories', async () => {
      const { getAll } = useTeaCategoriesAPI();
      expect(await getAll()).toEqual(teaCategories);
    });
  });
});
