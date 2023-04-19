import { useSync } from '@/composables/sync';
import { useTastingNotes } from '@/composables/tasting-notes';
import { useTastingNotesAPI } from '@/composables/tasting-notes-api';
import { useTastingNotesDatabase } from '@/composables/tasting-notes-database';
import { useTeaCategories } from '@/composables/tea-categories';
import { TastingNote } from '@/models';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@ionic/vue', async () => {
  const actual = (await vi.importActual('@ionic/vue')) as any;
  return { ...actual, isPlatform: vi.fn() };
});
vi.mock('@/composables/database');
vi.mock('@/composables/tasting-notes');
vi.mock('@/composables/tasting-notes-api');
vi.mock('@/composables/tasting-notes-database');
vi.mock('@/composables/tea-categories');

describe('useSync', () => {
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
  };

  beforeEach(() => {
    const { getAll } = useTastingNotesDatabase();
    initializeTestData();
    vi.clearAllMocks();
    (getAll as Mock).mockResolvedValue(tastingNotes);
  });

  it('gets the notes for the current user from the database, including deleted notes', async () => {
    const { getAll } = useTastingNotesDatabase();
    const sync = useSync();
    await sync();
    expect(getAll).toHaveBeenCalledTimes(1);
    expect(getAll).toHaveBeenCalledWith(true);
  });

  it('saves the INSERT and UPDATE items to the API', async () => {
    const { save } = useTastingNotesAPI();
    const sync = useSync();
    await sync();
    expect(save).toHaveBeenCalledTimes(5);
  });

  it('removes the ID for the INSERT items', async () => {
    const { save } = useTastingNotesAPI();
    const sync = useSync();
    await sync();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...note } = tastingNotes[0];
    expect(save).toHaveBeenCalledWith(note);
  });

  it('does not remove the ID for the UPDATE items', async () => {
    const { save } = useTastingNotesAPI();
    const sync = useSync();
    await sync();
    expect(save).toHaveBeenCalledWith(tastingNotes[1]);
  });

  it('calls the backend API to remove the DELETE items', async () => {
    const { remove } = useTastingNotesAPI();
    const sync = useSync();
    await sync();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith(tastingNotes[3]);
  });

  it('resets the cached tasting notes data', async () => {
    const { reset } = useTastingNotesDatabase();
    const sync = useSync();
    await sync();
    expect(reset).toHaveBeenCalledTimes(1);
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
