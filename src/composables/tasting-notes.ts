import { useTastingNotesAPI } from '@/composables/tasting-notes-api';
import { useTastingNotesDatabase } from '@/composables/tasting-notes-database';
import { TastingNote } from '@/models';
import { isPlatform } from '@ionic/vue';
import { ref } from 'vue';

const notes = ref<Array<TastingNote>>([]);

const load = async (): Promise<void> => {
  if (isPlatform('hybrid')) {
    const { getAll } = useTastingNotesAPI();
    const { trim, upsert } = useTastingNotesDatabase();

    const notes = await getAll();
    await trim(notes.map((x: TastingNote) => x.id as number));
    const upserts: Array<Promise<any>> = notes.map((note: TastingNote) => upsert(note));
    await Promise.all(upserts);
  }
};

const refresh = async (): Promise<void> => {
  const { getAll } = isPlatform('hybrid') ? useTastingNotesDatabase() : useTastingNotesAPI();
  notes.value = await getAll();
};

const find = async (id: number): Promise<TastingNote | undefined> => {
  if (!notes.value.length) {
    await refresh();
  }
  return notes.value.find((n) => n.id === id);
};

const save = async (note: TastingNote): Promise<TastingNote | undefined> => {
  const { save } = isPlatform('hybrid') ? useTastingNotesDatabase() : useTastingNotesAPI();
  const savedNote = await save(note);

  const idx = notes.value.findIndex((n) => n.id === savedNote.id);
  if (idx > -1) {
    notes.value[idx] = savedNote;
  } else {
    notes.value.push(savedNote);
  }
  return savedNote;
};

const remove = async (note: TastingNote): Promise<void> => {
  const { remove } = isPlatform('hybrid') ? useTastingNotesDatabase() : useTastingNotesAPI();
  await remove(note);
  const idx = notes.value.findIndex((n) => n.id === note.id);
  notes.value.splice(idx, 1);
};

export const useTastingNotes = () => ({
  notes,
  find,
  load,
  refresh,
  remove,
  save,
});
