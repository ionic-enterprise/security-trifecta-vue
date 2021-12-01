import { TastingNote, User } from '@/models';
import useDatabase from '@/use/database';
import useSessionVault from '@/use/session-vault';
import useSync from '@/use/sync';
import useTeaCategories from '@/use/tea-categories';
import useTastingNotes from '@/use/tasting-notes';

jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn() };
});
jest.mock('@/use/database');
jest.mock('@/use/session-vault');
jest.mock('@/use/tasting-notes');
jest.mock('@/use/tea-categories');

describe('useSync', () => {
  let tastingNotes: Array<TastingNote>;
  let user: User;

  const initializeTestData = () => {
    tastingNotes = [
      {
        id: 1,
        brand: 'Lipton',
        name: 'Green',
        notes: 'Bland and dull, but better than their standard tea',
        rating: 2,
        teaCategoryId: 1,
        syncStatus: 'INSERT',
      },
      {
        id: 3,
        brand: 'Rishi',
        name: 'Puer Tuo Cha',
        notes: 'Earthy with a bold a full flavor',
        rating: 5,
        teaCategoryId: 6,
        syncStatus: 'UPDATE',
      },
      {
        id: 42,
        brand: 'Rishi',
        name: 'Elderberry Healer',
        notes: 'Elderberry and ginger. Strong and healthy.',
        rating: 4,
        teaCategoryId: 7,
        syncStatus: 'INSERT',
      },
      {
        id: 73,
        brand: 'Tetley',
        name: 'The Regular Stuff',
        notes: 'Who moved my cottage cheese goat head?',
        rating: 2,
        teaCategoryId: 7,
        syncStatus: 'DELETE',
      },
      {
        id: 134,
        brand: 'Red Label',
        name: 'Baz Bell Beans',
        notes: 'Happy cheese and biscuits fromage.',
        rating: 5,
        teaCategoryId: 6,
        syncStatus: null,
      },
      {
        id: 59,
        brand: 'Taj Tea',
        name: 'Masala Spiced Chai',
        notes: 'Blue when the cheese comes out of everybody.',
        rating: 2,
        teaCategoryId: 3,
        syncStatus: null,
      },
      {
        id: 609,
        brand: 'Rishi',
        name: 'Foobar Flub Flub',
        notes: 'Everyone loves rubber cheese blue castello. Squirty cheesy feet.',
        rating: 2,
        teaCategoryId: 3,
        syncStatus: 'UPDATE',
      },
      {
        id: 420,
        brand: 'Rishi',
        name: 'Fairy Dust Fruitcake',
        notes: 'Fromage frais fromage pepper jack.',
        rating: 3,
        teaCategoryId: 1,
        syncStatus: 'INSERT',
      },
      {
        id: 902,
        brand: 'Tea Tree Trunk',
        name: 'Gopher Tree Bark',
        notes: 'Cheesecake smelly cheese cheese strings gouda monterey.  Cheesy grin paneer cheese and wine.',
        rating: 4,
        teaCategoryId: 7,
        syncStatus: null,
      },
    ];

    user = {
      id: 314159,
      firstName: 'Testy',
      lastName: 'McTest',
      email: 'test@test.com',
    };
  };

  beforeEach(() => {
    const { getSession } = useSessionVault();
    const { getTastingNotes } = useDatabase();
    initializeTestData();
    jest.clearAllMocks();
    (getTastingNotes as any).mockResolvedValue(tastingNotes);
    (getSession as any).mockResolvedValue({
      user,
      token: '123456789',
    });
  });

  it('gets the notes for the current user', async () => {
    const { getTastingNotes } = useDatabase();
    const sync = useSync();
    await sync();
    expect(getTastingNotes).toHaveBeenCalledTimes(1);
    expect(getTastingNotes).toHaveBeenCalledWith(
      {
        id: 314159,
        firstName: 'Testy',
        lastName: 'McTest',
        email: 'test@test.com',
      },
      true
    );
  });

  it('merges to the API the INSERT and UPDATE items', async () => {
    const { merge } = useTastingNotes();
    const sync = useSync();
    await sync();
    expect(merge).toHaveBeenCalledTimes(5);
  });

  it('removes the ID for the INSERT items', async () => {
    const { merge } = useTastingNotes();
    const sync = useSync();
    await sync();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...note } = tastingNotes[0];
    expect(merge).toHaveBeenCalledWith(note, true);
  });

  it('does not remove the ID for the UPDATE items', async () => {
    const { merge } = useTastingNotes();
    const sync = useSync();
    await sync();
    expect(merge).toHaveBeenCalledWith(tastingNotes[1], true);
  });

  it('calls the backend API to remove the DELETE items', async () => {
    const { remove } = useTastingNotes();
    const sync = useSync();
    await sync();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith(tastingNotes[3], true);
  });

  it('resets the cached tasting notes data', async () => {
    const { resetTastingNotes } = useDatabase();
    const sync = useSync();
    await sync();
    expect(resetTastingNotes).toHaveBeenCalledTimes(1);
    expect(resetTastingNotes).toHaveBeenCalledWith(user);
  });

  it('loads the tea categories', async () => {
    const { load } = useTeaCategories();
    const sync = useSync();
    await sync();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('loads the tasting notes', async () => {
    const { load } = useTastingNotes();
    const sync = useSync();
    await sync();
    expect(load).toHaveBeenCalledTimes(1);
  });
});
