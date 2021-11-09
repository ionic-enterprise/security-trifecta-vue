import useBackendAPI from '@/use/backend-api';
import useTeaCategories from '@/use/tea-categories';
import { TeaCategory } from '@/models';

jest.mock('@/use/backend-api');

describe('useTea', () => {
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
  });

  describe('refresh', () => {
    const { client } = useBackendAPI();

    it('gets the tea categories', async () => {
      const { refresh } = useTeaCategories();
      await refresh();
      expect(client.get).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith('/tea-categories');
    });

    it('extracts the tea categories', async () => {
      const { refresh, categories } = useTeaCategories();
      (client.get as any).mockResolvedValue({ data: teaCategories });
      await refresh();
      expect(categories.value).toEqual(teaCategories);
    });
  });

  describe('find', () => {
    const { client } = useBackendAPI();
    const { find, refresh, categories } = useTeaCategories();

    beforeEach(() => {
      categories.value = [];
      (client.get as any).mockResolvedValue({ data: teaCategories });
    });

    it('refreshes the tea data if it has not been loaded yet', async () => {
      const t = await find(6);
      expect(categories.value.length).toEqual(8);
      expect(t).toEqual({
        id: 6,
        name: 'Puer',
        description: 'Puer tea description.',
      });
    });

    it('finds the tea from the existing teas', async () => {
      await refresh();
      jest.clearAllMocks();
      const t = await find(4);
      expect(t).toEqual({
        id: 4,
        name: 'Oolong',
        description: 'Oolong tea description.',
      });
      expect(client.get).not.toHaveBeenCalled();
    });

    it('return undefined if the tea does not exist', async () => {
      expect(await find(42)).toBeUndefined();
    });
  });
});
