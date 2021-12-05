import useBackendAPI from '@/use/backend-api';
import { TastingNote } from '@/models';

const { client } = useBackendAPI();

const endpoint = '/tea-categories';

const getAll = async (): Promise<Array<TastingNote>> => {
  const { data } = await client.get(endpoint);
  return data;
};

export default (): any => ({
  getAll,
});
