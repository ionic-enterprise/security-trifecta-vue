import { TastingNote } from '@/models';
import useBackendAPI from '@/composables/backend-api';
import useCompare from '@/composables/compare';

const { client } = useBackendAPI();

const endpoint = '/tea-categories';

const getAll = async (): Promise<Array<TastingNote>> => {
  const { byName } = useCompare();
  const { data } = await client.get(endpoint);
  return data.sort(byName);
};

export default (): any => ({
  getAll,
});
