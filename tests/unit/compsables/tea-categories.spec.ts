import { useTeaCategories } from '@/composables/tea-categories';
import { useTeaCategoriesAPI } from '@/composables/tea-categories-api';
import { useTeaCategoriesDatabase } from '@/composables/tea-categories-database';
import { TeaCategory } from '@/models';
import { isPlatform } from '@ionic/vue';

jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn() };
});
jest.mock('@/composables/tea-categories-api');
jest.mock('@/composables/tea-categories-database');

describe('useTeaCategories', () => {
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
    const { getAll: getAllFromAPI } = useTeaCategoriesAPI();
    const { getAll: getAllFromDatabase } = useTeaCategoriesDatabase();
    initializeTestData();
    jest.clearAllMocks();
    (getAllFromAPI as jest.Mock).mockResolvedValue(teaCategories);
    (getAllFromDatabase as jest.Mock).mockResolvedValue(teaCategories);
    (isPlatform as jest.Mock).mockImplementation((key: string) => key === 'web');
  });

  describe('load', () => {
    describe('on mobile', () => {
      beforeEach(() => {
        (isPlatform as jest.Mock).mockImplementation((key: string) => key === 'hybrid');
      });

      it('gets the tea categories', async () => {
        const { getAll } = useTeaCategoriesAPI();
        const { load } = useTeaCategories();
        await load();
        expect(getAll).toHaveBeenCalledTimes(1);
      });

      it('trims the tea categories in the database', async () => {
        const { trim } = useTeaCategoriesDatabase();
        const { load } = useTeaCategories();
        await load();
        expect(trim).toHaveBeenCalledTimes(1);
        expect(trim).toHaveBeenCalledWith(teaCategories.map((x) => x.id as number));
      });

      it('upserts each of the tea categories', async () => {
        const { upsert } = useTeaCategoriesDatabase();
        const { load } = useTeaCategories();
        await load();
        expect(upsert).toHaveBeenCalledTimes(teaCategories.length);
        teaCategories.forEach((cat) => expect(upsert).toHaveBeenCalledWith(cat));
      });
    });

    describe('on web', () => {
      it('does not load the tea categories', async () => {
        const { getAll } = useTeaCategoriesAPI();
        const { trim, upsert } = useTeaCategoriesDatabase();
        const { load } = useTeaCategories();
        await load();
        expect(getAll).not.toHaveBeenCalled();
        expect(trim).not.toHaveBeenCalled();
        expect(upsert).not.toHaveBeenCalled();
      });
    });
  });

  describe('refresh', () => {
    describe('on mobile', () => {
      beforeEach(() => {
        (isPlatform as jest.Mock).mockImplementation((key: string) => key === 'hybrid');
      });

      it('gets the tea categories from the database', async () => {
        const { refresh } = useTeaCategories();
        const { getAll } = useTeaCategoriesDatabase();
        await refresh();
        expect(getAll).toHaveBeenCalledTimes(1);
      });

      it('populates the tea categories data', async () => {
        const { refresh, categories } = useTeaCategories();
        await refresh();
        expect(categories.value).toEqual(teaCategories);
      });
    });

    describe('on web', () => {
      it('gets the tea categories', async () => {
        const { refresh } = useTeaCategories();
        const { getAll } = useTeaCategoriesAPI();
        await refresh();
        expect(getAll).toHaveBeenCalledTimes(1);
      });

      it('populates the tea categories data', async () => {
        const { refresh, categories } = useTeaCategories();
        await refresh();
        expect(categories.value).toEqual(teaCategories);
      });
    });
  });

  describe('find', () => {
    const { find, refresh, categories } = useTeaCategories();

    beforeEach(() => {
      categories.value = [];
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
      const { getAll } = useTeaCategoriesAPI();
      await refresh();
      jest.clearAllMocks();
      const t = await find(4);
      expect(t).toEqual({
        id: 4,
        name: 'Oolong',
        description: 'Oolong tea description.',
      });
      expect(getAll).not.toHaveBeenCalled();
    });

    it('return undefined if the tea does not exist', async () => {
      expect(await find(42)).toBeUndefined();
    });
  });
});
