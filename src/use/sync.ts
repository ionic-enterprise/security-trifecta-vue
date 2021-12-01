import useDatabase from '@/use/database';
import useSessionVault from '@/use/session-vault';
import useTastingNotes from '@/use/tasting-notes';
import useTeaCategories from '@/use/tea-categories';

const sync = async (): Promise<void> => {
  const { getTastingNotes, resetTastingNotes } = useDatabase();
  const { getSession } = useSessionVault();
  const { load: loadTastingNotes, merge, remove } = useTastingNotes();
  const { load: loadTeaCategories } = useTeaCategories();

  const session = await getSession();
  const notes = await getTastingNotes(session.user, true);

  const merges: Array<Promise<any>> = [];
  notes.forEach((note) => {
    if (note.syncStatus === 'UPDATE') {
      merges.push(merge(note, true));
    }
    if (note.syncStatus === 'INSERT') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...n } = note;
      merges.push(merge(n, true));
    }
    if (note.syncStatus === 'DELETE') {
      merges.push(remove(note, true));
    }
  });
  await Promise.all(merges);

  await resetTastingNotes(session.user);

  await loadTeaCategories();
  await loadTastingNotes();
};

export default () => sync;
