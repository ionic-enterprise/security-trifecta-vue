import useBackendAPI from '@/use/backend-api';
import useTastingNotes from '@/use/tasting-notes';
import { TastingNote } from '@/models';

jest.mock('@/use/backend-api');

describe('TastingNotesService', () => {
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
    (client.get as any).mockResolvedValue({ data: tastingNotes });
  });

  describe('refresh', () => {
    it('gets the tea categories', async () => {
      const { refresh } = useTastingNotes();
      await refresh();
      expect(client.get).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith('/user-tasting-notes');
    });

    it('populates the notes data', async () => {
      const { refresh, notes } = useTastingNotes();
      await refresh();
      expect(notes.value).toEqual(tastingNotes);
    });
  });

  describe('find', () => {
    const { client } = useBackendAPI();
    const { find, refresh, notes } = useTastingNotes();

    beforeEach(() => {
      notes.value = [];
    });

    it('refreshes the tasting notes data if it has not been loaded yet', async () => {
      const t = await find(3);
      expect(notes.value.length).toEqual(3);
      expect(t).toEqual({
        id: 3,
        brand: 'Rishi',
        name: 'Puer Tuo Cha',
        notes: 'Earthy with a bold a full flavor',
        rating: 5,
        teaCategoryId: 6,
      });
    });

    it('finds the tasting notes from the existing tasting notes', async () => {
      await refresh();
      jest.clearAllMocks();
      const t = await find(3);
      expect(t).toEqual({
        id: 3,
        brand: 'Rishi',
        name: 'Puer Tuo Cha',
        notes: 'Earthy with a bold a full flavor',
        rating: 5,
        teaCategoryId: 6,
      });
      expect(client.get).not.toHaveBeenCalled();
    });

    it('return undefined if the tasting note does not exist', async () => {
      expect(await find(73)).toBeUndefined();
    });
  });

  describe('merge', () => {
    const { notes, merge, refresh } = useTastingNotes();
    beforeEach(async () => await refresh());

    describe('a new note', () => {
      const note: TastingNote = {
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      };

      beforeEach(() => {
        (client.post as any).mockResolvedValue({ data: { id: 73, ...note } });
      });

      it('posts the new note', async () => {
        await merge(note);
        expect(client.post).toHaveBeenCalledTimes(1);
        expect(client.post).toHaveBeenCalledWith('/user-tasting-notes', note);
      });

      it('resolves the saved note', async () => {
        expect(await merge(note)).toEqual({ id: 73, ...note });
      });

      it('adds the note to the notes list', async () => {
        await merge(note);
        expect(notes.value.length).toEqual(4);
        expect(notes.value[3]).toEqual({ id: 73, ...note });
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
        (client.post as any).mockResolvedValue({ data: note });
      });

      it('posts the existing note', async () => {
        await merge(note);
        expect(client.post).toHaveBeenCalledTimes(1);
        expect(client.post).toHaveBeenCalledWith('/user-tasting-notes/1', note);
      });

      it('resolves the saved note', async () => {
        expect(await merge(note)).toEqual(note);
      });

      it('updates the note in the notes list', async () => {
        await merge(note);
        expect(notes.value.length).toEqual(3);
        expect(notes.value[0]).toEqual(note);
      });
    });
  });

  describe('remove', () => {
    const { notes, remove, refresh } = useTastingNotes();
    beforeEach(async () => await refresh());

    it('deletes the existing note', async () => {
      await remove(tastingNotes[1]);
      expect(client.delete).toHaveBeenCalledTimes(1);
      expect(client.delete).toHaveBeenCalledWith('/user-tasting-notes/3');
    });

    it('removes the note from the notes', async () => {
      await remove(tastingNotes[1]);
      expect(notes.value.length).toEqual(2);
      expect(notes.value[0].id).toEqual(1);
      expect(notes.value[1].id).toEqual(42);
    });
  });
});
