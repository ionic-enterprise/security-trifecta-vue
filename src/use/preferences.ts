import { ref, watch } from 'vue';
import { Storage } from '@ionic/storage';

const store = new Storage();
const ready = store.create();

const prefersDarkMode = ref(false);

watch(prefersDarkMode, async (value) => {
  await ready;
  await store.set('darkMode', value);
  document.body.classList.toggle('dark', value);
});

const load = async () => {
  await ready;
  prefersDarkMode.value = !!(await store.get('darkMode'));
};

export default () => ({
  load,
  prefersDarkMode,
});
