import { ref } from 'vue';
import { TeaCategory } from '@/models';
import useBackendAPI from './backend-api';

const { client } = useBackendAPI();
const categories = ref<Array<TeaCategory>>([]);

const refresh = async (): Promise<void> => {
  const res = await client.get('/tea-categories');
  categories.value = res.data;
};

const find = async (id: number): Promise<TeaCategory | undefined> => {
  if (!categories.value.length) {
    await refresh();
  }
  return categories.value.find((t) => t.id === id);
};

export default (): any => ({
  categories,
  find,
  refresh,
});
