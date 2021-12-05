import { ref } from 'vue';
import { TeaCategory } from '@/models';
import useTeaCategoriesAPI from './tea-categories-api';
import useTeaCategoriesDatabase from './tea-categories-database';
import { isPlatform } from '@ionic/vue';

const categories = ref<Array<TeaCategory>>([]);

const load = async (): Promise<void> => {
  if (isPlatform('hybrid')) {
    const { getAll } = useTeaCategoriesAPI();
    const { trim, upsert } = useTeaCategoriesDatabase();
    const cats = await getAll();
    trim(cats.map((cat: TeaCategory) => cat.id));
    cats.forEach((cat: TeaCategory) => upsert(cat));
  }
};

const refresh = async (): Promise<void> => {
  const { getAll } = isPlatform('hybrid') ? useTeaCategoriesDatabase() : useTeaCategoriesAPI();
  categories.value = await getAll();
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
