import { TastingNote } from '@/models';
import useTastingNotes from '@/use/tasting-notes';
import useTastingNotesAPI from '@/use/tasting-notes-api';
import useTastingNotesDatabase from '@/use/tasting-notes-database';
import useTeaCategories from '@/use/tea-categories';

const sync = async (): Promise<void> => {
  const { getAll, reset } = useTastingNotesDatabase();
  const { remove, save } = useTastingNotesAPI();
  const { load: loadTastingNotes } = useTastingNotes();
  const { load: loadTeaCategories } = useTeaCategories();

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

  await loadTeaCategories();
  await loadTastingNotes();
};

export default () => sync;
