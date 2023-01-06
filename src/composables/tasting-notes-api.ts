import { useBackendAPI } from '@/composables/backend-api';
import { useCompare } from '@/composables/compare';
import { TastingNote } from '@/models';

const { client } = useBackendAPI();

const endpoint = '/user-tasting-notes';

const getAll = async (): Promise<Array<TastingNote>> => {
  const { byBrandAndName } = useCompare();
  const { data } = await client.get(endpoint);
  return data.sort(byBrandAndName);
};

const save = async (note: TastingNote): Promise<TastingNote> => {
  const url = endpoint + (note.id ? `/${note.id}` : '');
  const { data } = await client.post(url, note);
  return data;
};

const remove = async (note: TastingNote): Promise<void> => {
  await client.delete(`${endpoint}/${note.id}`);
};

export const useTastingNotesAPI = () => ({
  getAll,
  save,
  remove,
});
