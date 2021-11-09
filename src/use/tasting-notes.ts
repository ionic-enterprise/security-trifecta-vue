import useBackendAPI from '@/use/backend-api';
import { TastingNote } from '@/models';
import { ref } from 'vue';

const { client } = useBackendAPI();

const endpoint = '/user-tasting-notes';

const notes = ref<Array<TastingNote>>([]);

const refresh = async (): Promise<void> => {
  notes.value = await client.get(endpoint).then((res: { data?: any }) => res.data);
};

const find = async (id: number): Promise<TastingNote | undefined> => {
  if (!notes.value.length) {
    await refresh();
  }
  return notes.value.find((n) => n.id === id);
};

const merge = async (note: TastingNote): Promise<TastingNote> => {
  const url = endpoint + (note.id ? `/${note.id}` : '');
  const { data } = await client.post(url, note);
  const idx = notes.value.findIndex((n) => n.id === data.id);
  if (idx > -1) {
    notes.value[idx] = data;
  } else {
    notes.value.push(data);
  }
  return data;
};

const remove = async (note: TastingNote): Promise<void> => {
  await client.delete(`${endpoint}/${note.id}`);
  const idx = notes.value.findIndex((n) => n.id === note.id);
  notes.value.splice(idx, 1);
};

export default (): any => ({
  notes,
  find,
  merge,
  refresh,
  remove,
});
