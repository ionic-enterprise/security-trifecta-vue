import useBackendAPI from '@/use/backend-api';
import useTastingNotesAPI from '@/use/tasting-notes-api';
import { TastingNote } from '@/models';

jest.mock('@/use/backend-api');

describe('useTastingNotes', () => {
  const { client } = useBackendAPI();
  let tastingNotes: Array<TastingNote>;

  const initializeTestData = () => {
    tastingNotes = [
      {
        id: 1,
        brand: 'Lipton',
        name: 'Green',
        notes: 'Bland and dull, but better than their standard tea',
        rating: 2,
        teaCategoryId: 1,
      },
      {
        id: 3,
        brand: 'Rishi',
        name: 'Puer Tuo Cha',
        notes: 'Earthy with a bold a full flavor',
        rating: 5,
        teaCategoryId: 6,
      },
      {
        id: 42,
        brand: 'Rishi',
        name: 'Elderberry Healer',
        notes: 'Elderberry and ginger. Strong and healthy.',
        rating: 4,
        teaCategoryId: 7,
      },
    ];
  };

  beforeEach(() => {
    initializeTestData();
    jest.clearAllMocks();
    (client.get as jest.Mock).mockResolvedValue({ data: tastingNotes });
  });

  describe('get all', () => {
    it('gets the tasting notes', async () => {
      const { getAll } = useTastingNotesAPI();
      await getAll();
      expect(client.get).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith('/user-tasting-notes');
    });

    it('resolves the tasting notes data', async () => {
      const { getAll } = useTastingNotesAPI();
      expect(await getAll()).toEqual(tastingNotes);
    });
  });

  describe('save', () => {
    const { save } = useTastingNotesAPI();

    describe('a new note', () => {
      const note: TastingNote = {
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      };

      beforeEach(() => {
        (client.post as jest.Mock).mockResolvedValue({ data: { id: 73, ...note } });
      });

      it('posts the new note', async () => {
        await save(note);
        expect(client.post).toHaveBeenCalledTimes(1);
        expect(client.post).toHaveBeenCalledWith('/user-tasting-notes', note);
      });

      it('resolves the saved note', async () => {
        expect(await save(note)).toEqual({ id: 73, ...note });
      });
    });

    describe('an existing note', () => {
      const note: TastingNote = {
        id: 1,
        brand: 'Lipton',
        name: 'Green Tea',
        notes: 'Kinda like Lite beer. Dull, but well executed.',
        rating: 3,
        teaCategoryId: 1,
      };

      beforeEach(() => {
        (client.post as jest.Mock).mockResolvedValue({ data: note });
      });

      it('posts the existing note', async () => {
        await save(note);
        expect(client.post).toHaveBeenCalledTimes(1);
        expect(client.post).toHaveBeenCalledWith('/user-tasting-notes/1', note);
      });

      it('resolves the saved note', async () => {
        expect(await save(note)).toEqual(note);
      });
    });
  });

  describe('remove', () => {
    const { remove } = useTastingNotesAPI();

    it('deletes the existing note', async () => {
      await remove(tastingNotes[1]);
      expect(client.delete).toHaveBeenCalledTimes(1);
      expect(client.delete).toHaveBeenCalledWith('/user-tasting-notes/3');
    });
  });
});
