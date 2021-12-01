import useBackendAPI from '@/use/backend-api';
import useDatabase from '@/use/database';
import useSessionVault from '@/use/session-vault';
import useTastingNotes from '@/use/tasting-notes';
import { TastingNote } from '@/models';
import { isPlatform } from '@ionic/vue';

jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn() };
});
jest.mock('@/use/backend-api');
jest.mock('@/use/database');
jest.mock('@/use/session-vault');

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
    const { getSession } = useSessionVault();
    const { getTastingNotes } = useDatabase();
    initializeTestData();
    jest.clearAllMocks();
    (client.get as any).mockResolvedValue({ data: tastingNotes });
    (getTastingNotes as any).mockResolvedValue(tastingNotes);
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

      it('gets the tasting notes', async () => {
        const { load } = useTastingNotes();
        await load();
        expect(client.get).toHaveBeenCalledTimes(1);
        expect(client.get).toHaveBeenCalledWith('/user-tasting-notes');
      });

      it('trims the notes in the database', async () => {
        const { trimTastingNotes } = useDatabase();
        const { load } = useTastingNotes();
        await load();
        expect(trimTastingNotes).toHaveBeenCalledTimes(1);
        expect(trimTastingNotes).toHaveBeenCalledWith(
          tastingNotes.map((x) => x.id as number),
          {
            id: 314159,
            firstName: 'Testy',
            lastName: 'McTest',
            email: 'test@test.com',
          }
        );
      });

      it('merges each of the tasting notes', async () => {
        const { mergeTastingNote } = useDatabase();
        const { load } = useTastingNotes();
        await load();
        expect(mergeTastingNote).toHaveBeenCalledTimes(tastingNotes.length);
        tastingNotes.forEach((n) =>
          expect(mergeTastingNote).toHaveBeenCalledWith(n, {
            id: 314159,
            firstName: 'Testy',
            lastName: 'McTest',
            email: 'test@test.com',
          })
        );
      });
    });

    describe('on web', () => {
      it('does not load the tasting notes', async () => {
        const { load } = useTastingNotes();
        await load();
        expect(client.get).not.toHaveBeenCalled();
      });

      it('does not merge the tasting notes', async () => {
        const { mergeTastingNote } = useDatabase();
        const { load } = useTastingNotes();
        await load();
        expect(mergeTastingNote).not.toHaveBeenCalled();
      });

      it('populates the notes data', async () => {
        const { refresh, notes } = useTastingNotes();
        await refresh();
        expect(notes.value).toEqual(tastingNotes);
      });
    });
  });

  describe('refresh', () => {
    describe('on mobile', () => {
      beforeEach(() => {
        (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
      });

      it('gets the tasting notes from the database', async () => {
        const { getTastingNotes } = useDatabase();
        const { refresh } = useTastingNotes();
        await refresh();
        expect(getTastingNotes).toHaveBeenCalledTimes(1);
        expect(getTastingNotes).toHaveBeenCalledWith({
          id: 314159,
          firstName: 'Testy',
          lastName: 'McTest',
          email: 'test@test.com',
        });
      });
    });

    describe('on the web', () => {
      it('gets the tasting notes', async () => {
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

      describe('on mobile', () => {
        beforeEach(() => {
          const { addTastingNote } = useDatabase();
          (addTastingNote as any).mockResolvedValue({ id: 73, syncStatus: 'INSERT' as 'INSERT', ...note });
          (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
        });

        it('adds the note to the database', async () => {
          const { addTastingNote } = useDatabase();
          await merge(note);
          expect(addTastingNote).toHaveBeenCalledTimes(1);
          expect(addTastingNote).toHaveBeenCalledWith(note, {
            id: 314159,
            firstName: 'Testy',
            lastName: 'McTest',
            email: 'test@test.com',
          });
          expect(client.post).not.toHaveBeenCalled();
        });

        it('resolves the saved note', async () => {
          expect(await merge(note)).toEqual({ id: 73, syncStatus: 'INSERT' as 'INSERT', ...note });
        });

        it('adds the note to the notes list', async () => {
          await merge(note);
          expect(notes.value.length).toEqual(4);
          expect(notes.value[3]).toEqual({ id: 73, syncStatus: 'INSERT' as 'INSERT', ...note });
        });
      });

      describe('on the web', () => {
        beforeEach(() => {
          (client.post as any).mockResolvedValue({ data: { id: 73, ...note } });
        });

        it('posts the new note', async () => {
          const { addTastingNote } = useDatabase();
          await merge(note);
          expect(client.post).toHaveBeenCalledTimes(1);
          expect(client.post).toHaveBeenCalledWith('/user-tasting-notes', note);
          expect(addTastingNote).not.toHaveBeenCalled();
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
        beforeEach(() => {
          const { updateTastingNote } = useDatabase();
          (updateTastingNote as any).mockResolvedValue({ syncStatus: 'UPDATE' as 'UPDATE', ...note });
          (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
        });

        it('update the note in the database', async () => {
          const { updateTastingNote } = useDatabase();
          await merge(note);
          expect(updateTastingNote).toHaveBeenCalledTimes(1);
          expect(updateTastingNote).toHaveBeenCalledWith(note, {
            id: 314159,
            firstName: 'Testy',
            lastName: 'McTest',
            email: 'test@test.com',
          });
          expect(client.post).not.toHaveBeenCalled();
        });

        it('resolves the saved note', async () => {
          expect(await merge(note)).toEqual({ syncStatus: 'UPDATE' as 'UPDATE', ...note });
        });

        it('update the note to the notes list', async () => {
          await merge(note);
          expect(notes.value.length).toEqual(3);
          expect(notes.value[0]).toEqual({ syncStatus: 'UPDATE' as 'UPDATE', ...note });
        });
      });

      describe('on the web', () => {
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
  });

  describe('force posting', () => {
    const { merge, refresh } = useTastingNotes();
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
        beforeEach(() => {
          (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
        });

        it('posts the new note', async () => {
          await merge(note, true);
          expect(client.post).toHaveBeenCalledTimes(1);
          expect(client.post).toHaveBeenCalledWith('/user-tasting-notes', note);
        });
      });

      describe('on the web', () => {
        beforeEach(() => {
          (client.post as any).mockResolvedValue({ data: { id: 73, ...note } });
        });

        it('posts the new note', async () => {
          await merge(note, true);
          expect(client.post).toHaveBeenCalledTimes(1);
          expect(client.post).toHaveBeenCalledWith('/user-tasting-notes', note);
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
        beforeEach(() => {
          (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
        });

        it('posts the existing note', async () => {
          await merge(note, true);
          expect(client.post).toHaveBeenCalledTimes(1);
          expect(client.post).toHaveBeenCalledWith('/user-tasting-notes/1', note);
        });
      });

      describe('on the web', () => {
        beforeEach(() => {
          (client.post as any).mockResolvedValue({ data: note });
        });

        it('posts the existing note', async () => {
          await merge(note, true);
          expect(client.post).toHaveBeenCalledTimes(1);
          expect(client.post).toHaveBeenCalledWith('/user-tasting-notes/1', note);
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
        const { markTastingNoteForDelete } = useDatabase();
        await remove(tastingNotes[1]);
        expect(markTastingNoteForDelete).toHaveBeenCalledTimes(1);
        expect(markTastingNoteForDelete).toHaveBeenCalledWith(note, {
          id: 314159,
          firstName: 'Testy',
          lastName: 'McTest',
          email: 'test@test.com',
        });
      });

      it('removes the note from the notes', async () => {
        await remove(tastingNotes[1]);
        expect(notes.value.length).toEqual(2);
        expect(notes.value[0].id).toEqual(1);
        expect(notes.value[1].id).toEqual(42);
      });

      describe('when forcing the API call', () => {
        it('deletes the existing note', async () => {
          await remove(tastingNotes[1], true);
          expect(client.delete).toHaveBeenCalledTimes(1);
          expect(client.delete).toHaveBeenCalledWith('/user-tasting-notes/3');
        });

        it('removes the note from the notes', async () => {
          await remove(tastingNotes[1], true);
          expect(notes.value.length).toEqual(2);
          expect(notes.value[0].id).toEqual(1);
          expect(notes.value[1].id).toEqual(42);
        });
      });
    });

    describe('on the web', () => {
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
});
