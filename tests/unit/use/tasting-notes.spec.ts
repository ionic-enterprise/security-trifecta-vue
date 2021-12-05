import useSessionVault from '@/use/session-vault';
import useTastingNotes from '@/use/tasting-notes';
import useTastingNotesAPI from '@/use/tasting-notes-api';
import useTastingNotesDatabase from '@/use/tasting-notes-database';
import { TastingNote } from '@/models';
import { isPlatform } from '@ionic/vue';

jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn() };
});
jest.mock('@/use/session-vault');
jest.mock('@/use/tasting-notes-api');
jest.mock('@/use/tasting-notes-database');

describe('useTastingNotes', () => {
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
    const { getAll: getAllFromAPI } = useTastingNotesAPI();
    const { getAll: getAllFromDatabase } = useTastingNotesDatabase();
    const { getSession } = useSessionVault();
    initializeTestData();
    jest.clearAllMocks();
    (getAllFromAPI as any).mockResolvedValue(tastingNotes);
    (getAllFromDatabase as any).mockResolvedValue(tastingNotes);
    (isPlatform as any).mockImplementation((key: string) => key === 'web');
    (getSession as any).mockResolvedValue({
      user: {
        id: 314159,
        firstName: 'Testy',
        lastName: 'McTest',
        email: 'test@test.com',
      },
      token: '123456789',
    });
  });

  describe('load', () => {
    describe('on mobile', () => {
      beforeEach(() => {
        (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
      });

      it('gets the tasting notes from the backend API', async () => {
        const { getAll } = useTastingNotesAPI();
        const { load } = useTastingNotes();
        await load();
        expect(getAll).toHaveBeenCalledTimes(1);
      });

      it('trims the notes in the database', async () => {
        const { trim } = useTastingNotesDatabase();
        const { load } = useTastingNotes();
        await load();
        expect(trim).toHaveBeenCalledTimes(1);
        expect(trim).toHaveBeenCalledWith(tastingNotes.map((x) => x.id as number));
      });

      it('upserts each of the tasting notes', async () => {
        const { upsert } = useTastingNotesDatabase();
        const { load } = useTastingNotes();
        await load();
        expect(upsert).toHaveBeenCalledTimes(tastingNotes.length);
        tastingNotes.forEach((n) => expect(upsert).toHaveBeenCalledWith(n));
      });
    });

    describe('on web', () => {
      it('does not load the tasting notes', async () => {
        const { getAll } = useTastingNotesAPI();
        const { trim, upsert } = useTastingNotesDatabase();
        const { load } = useTastingNotes();
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
        (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
      });

      it('gets the tasting notes from the database', async () => {
        const { getAll } = useTastingNotesDatabase();
        const { refresh } = useTastingNotes();
        await refresh();
        expect(getAll).toHaveBeenCalledTimes(1);
      });

      it('populates the notes data', async () => {
        const { refresh, notes } = useTastingNotes();
        await refresh();
        expect(notes.value).toEqual(tastingNotes);
      });
    });

    describe('on the web', () => {
      it('gets the tasting notes from the API', async () => {
        const { getAll } = useTastingNotesAPI();
        const { refresh } = useTastingNotes();
        await refresh();
        expect(getAll).toHaveBeenCalledTimes(1);
      });

      it('populates the notes data', async () => {
        const { refresh, notes } = useTastingNotes();
        await refresh();
        expect(notes.value).toEqual(tastingNotes);
      });
    });
  });

  describe('find', () => {
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
      const { getAll } = useTastingNotesAPI();
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
      expect(getAll).not.toHaveBeenCalled();
    });

    it('return undefined if the tasting note does not exist', async () => {
      expect(await find(73)).toBeUndefined();
    });
  });

  describe('save', () => {
    const { notes, save, refresh } = useTastingNotes();
    beforeEach(async () => await refresh());

    describe('a new note', () => {
      const note: TastingNote = {
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      };

      describe('on mobile', () => {
        const { save: saveToDatabase } = useTastingNotesDatabase();

        beforeEach(() => {
          (saveToDatabase as any).mockResolvedValue({ id: 73, syncStatus: 'INSERT' as 'INSERT', ...note });
          (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
        });

        it('saves the note to the database', async () => {
          await save(note);
          expect(saveToDatabase).toHaveBeenCalledTimes(1);
          expect(saveToDatabase).toHaveBeenCalledWith(note);
        });

        it('resolves the saved note', async () => {
          expect(await save(note)).toEqual({ id: 73, syncStatus: 'INSERT' as 'INSERT', ...note });
        });

        it('adds the note to the notes list', async () => {
          await save(note);
          expect(notes.value.length).toEqual(4);
          expect(notes.value[3]).toEqual({ id: 73, syncStatus: 'INSERT' as 'INSERT', ...note });
        });
      });

      describe('on the web', () => {
        const { save: saveToBackend } = useTastingNotesAPI();
        beforeEach(() => {
          (saveToBackend as any).mockResolvedValue({ id: 73, ...note });
        });

        it('posts the new note', async () => {
          await save(note);
          expect(saveToBackend).toHaveBeenCalledTimes(1);
          expect(saveToBackend).toHaveBeenCalledWith(note);
        });

        it('resolves the saved note', async () => {
          expect(await save(note)).toEqual({ id: 73, ...note });
        });

        it('adds the note to the notes list', async () => {
          await save(note);
          expect(notes.value.length).toEqual(4);
          expect(notes.value[3]).toEqual({ id: 73, ...note });
        });
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

      describe('on mobile', () => {
        const { save: saveToDatabase } = useTastingNotesDatabase();

        beforeEach(() => {
          (saveToDatabase as any).mockResolvedValue({ syncStatus: 'UPDATE' as 'UPDATE', ...note });
          (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
        });

        it('save the note in the database', async () => {
          await save(note);
          expect(saveToDatabase).toHaveBeenCalledTimes(1);
          expect(saveToDatabase).toHaveBeenCalledWith(note);
        });

        it('resolves the saved note', async () => {
          expect(await save(note)).toEqual({ syncStatus: 'UPDATE' as 'UPDATE', ...note });
        });

        it('update the note to the notes list', async () => {
          await save(note);
          expect(notes.value.length).toEqual(3);
          expect(notes.value[0]).toEqual({ syncStatus: 'UPDATE' as 'UPDATE', ...note });
        });
      });

      describe('on the web', () => {
        const { save: saveToBackend } = useTastingNotesAPI();
        beforeEach(() => {
          (saveToBackend as any).mockResolvedValue(note);
        });

        it('saves the existing note', async () => {
          await save(note);
          expect(saveToBackend).toHaveBeenCalledTimes(1);
          expect(saveToBackend).toHaveBeenCalledWith(note);
        });

        it('resolves the saved note', async () => {
          expect(await save(note)).toEqual(note);
        });

        it('updates the note in the notes list', async () => {
          await save(note);
          expect(notes.value.length).toEqual(3);
          expect(notes.value[0]).toEqual(note);
        });
      });
    });
  });

  describe('remove', () => {
    const { notes, remove, refresh } = useTastingNotes();
    beforeEach(async () => await refresh());

    describe('on mobile', () => {
      beforeEach(() => {
        (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
      });

      it('marks the note for deletion', async () => {
        const note = { ...tastingNotes[1] };
        const { remove: markTastingNoteForDelete } = useTastingNotesDatabase();
        await remove(tastingNotes[1]);
        expect(markTastingNoteForDelete).toHaveBeenCalledTimes(1);
        expect(markTastingNoteForDelete).toHaveBeenCalledWith(note);
      });

      it('removes the note from the notes', async () => {
        const note = { ...tastingNotes[1] };
        await remove(note);
        expect(notes.value.length).toEqual(2);
        expect(notes.value[0].id).toEqual(1);
        expect(notes.value[1].id).toEqual(42);
      });
    });

    describe('on the web', () => {
      it('deletes the existing note', async () => {
        const note = { ...tastingNotes[1] };
        const { remove: removeUsingAPI } = useTastingNotesAPI();
        await remove(note);
        expect(removeUsingAPI).toHaveBeenCalledTimes(1);
        expect(removeUsingAPI).toHaveBeenCalledWith(note);
      });

      it('removes the note from the notes', async () => {
        const note = { ...tastingNotes[1] };
        await remove(note);
        expect(notes.value.length).toEqual(2);
        expect(notes.value[0].id).toEqual(1);
        expect(notes.value[1].id).toEqual(42);
      });
    });
  });
});
