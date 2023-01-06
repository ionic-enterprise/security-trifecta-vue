import { useTastingNotes } from '@/composables/tasting-notes';
import { useTastingNotesAPI } from '@/composables/tasting-notes-api';
import { useTastingNotesDatabase } from '@/composables/tasting-notes-database';
import { useTeaCategories } from '@/composables/tea-categories';
import { TastingNote } from '@/models';

const syncTastingNotes = async (): Promise<void> => {
  const { getAll, reset } = useTastingNotesDatabase();
  const { remove, save } = useTastingNotesAPI();
  const { load: loadTastingNotes } = useTastingNotes();

  const notes = await getAll(true);

  const calls: Array<Promise<any>> = [];
  notes.forEach((note: TastingNote) => {
    if (note.syncStatus === 'UPDATE') {
      calls.push(save(note));
    }
    if (note.syncStatus === 'INSERT') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...n } = note;
      calls.push(save(n));
    }
    if (note.syncStatus === 'DELETE') {
      calls.push(remove(note));
    }
  });
  await Promise.all(calls);
  await reset();
  await loadTastingNotes();
};

const syncTeaCategories = async (): Promise<void> => {
  const { load: loadTeaCategories } = useTeaCategories();
  await loadTeaCategories();
};

const sync = async (): Promise<void> => {
  await syncTastingNotes();
  await syncTeaCategories();
};

export const useSync = () => sync;
