import { ref } from 'vue';
import { TeaCategory } from '@/models';
import useBackendAPI from './backend-api';

const { client } = useBackendAPI();
const teas = ref<Array<TeaCategory>>([]);

const refresh = async (): Promise<void> => {
  const res = await client.get('/tea-categories');
  teas.value = res.data;
};

const find = async (id: number): Promise<TeaCategory | undefined> => {
  if (!teas.value.length) {
    await refresh();
  }
  return teas.value.find((t) => t.id === id);
};

export default (): any => ({
  find,
  refresh,
  teas,
});
