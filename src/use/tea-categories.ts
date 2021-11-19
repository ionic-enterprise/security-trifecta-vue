import { ref } from 'vue';
import { TeaCategory } from '@/models';
import useBackendAPI from './backend-api';
import useDatabase from './database';
import { isPlatform } from '@ionic/vue';

const { client } = useBackendAPI();
const categories = ref<Array<TeaCategory>>([]);
const endpoint = '/tea-categories';

const load = async (): Promise<void> => {
  if (isPlatform('hybrid')) {
    const { mergeTeaCategory } = useDatabase();

    const cats = (await client.get(endpoint).then((res: { data?: any }) => res.data)) as Array<TeaCategory>;
    cats.forEach((cat) => mergeTeaCategory(cat));
  }
};

const refresh = async (): Promise<void> => {
  const res = await client.get(endpoint);
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
  load,
  refresh,
});
