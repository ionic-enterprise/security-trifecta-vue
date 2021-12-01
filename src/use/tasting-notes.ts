import useBackendAPI from '@/use/backend-api';
import useDatabase from '@/use/database';
import useSessionVault from '@/use/session-vault';
import { TastingNote } from '@/models';
import { ref } from 'vue';
import { isPlatform } from '@ionic/vue';

const { client } = useBackendAPI();

const endpoint = '/user-tasting-notes';

const notes = ref<Array<TastingNote>>([]);

const load = async (): Promise<void> => {
  if (isPlatform('hybrid')) {
    const { mergeTastingNote, trimTastingNotes } = useDatabase();
    const { getSession } = useSessionVault();

    const session = await getSession();
    const notes = (await client.get(endpoint).then((res: { data?: any }) => res.data)) as Array<TastingNote>;
    await trimTastingNotes(
      notes.map((x) => x.id as number),
      session.user
    );
    const merges: Array<Promise<any>> = [];
    notes.forEach((n) => merges.push(mergeTastingNote(n, session.user)));
    await Promise.all(merges);
  }
};

const refresh = async (): Promise<void> => {
  if (isPlatform('hybrid')) {
    const { getTastingNotes } = useDatabase();
    const { getSession } = useSessionVault();
    const session = await getSession();
    notes.value = await getTastingNotes(session.user);
  } else {
    notes.value = await client.get(endpoint).then((res: { data?: any }) => res.data);
  }
};

const find = async (id: number): Promise<TastingNote | undefined> => {
  if (!notes.value.length) {
    await refresh();
  }
  return notes.value.find((n) => n.id === id);
};

const post = async (note: TastingNote): Promise<TastingNote> => {
  const url = endpoint + (note.id ? `/${note.id}` : '');
  const { data } = await client.post(url, note);
  return data;
};

const mergeInDatabase = async (note: TastingNote): Promise<TastingNote> => {
  const { addTastingNote, updateTastingNote } = useDatabase();
  const { getSession } = useSessionVault();
  const session = await getSession();
  return note.id
    ? (await updateTastingNote(note, session.user)) || note
    : (await addTastingNote(note, session.user)) || note;
};

const merge = async (note: TastingNote, forceApiCall = false): Promise<TastingNote | undefined> => {
  let data: TastingNote;

  if (isPlatform('hybrid') && !forceApiCall) {
    data = await mergeInDatabase(note);
  } else {
    data = await post(note);
  }

  const idx = notes.value.findIndex((n) => n.id === data.id);
  if (idx > -1) {
    notes.value[idx] = data;
  } else {
    notes.value.push(data);
  }
  return data;
};

const remove = async (note: TastingNote, forceApiCall = false): Promise<void> => {
  if (isPlatform('hybrid') && !forceApiCall) {
    const { markTastingNoteForDelete } = useDatabase();
    const { getSession } = useSessionVault();
    const session = await getSession();
    markTastingNoteForDelete(note, session.user);
  } else {
    await client.delete(`${endpoint}/${note.id}`);
  }
  const idx = notes.value.findIndex((n) => n.id === note.id);
  notes.value.splice(idx, 1);
};

export default (): any => ({
  notes,
  find,
  load,
  merge,
  refresh,
  remove,
});
