import { mount, VueWrapper } from '@vue/test-utils';
import Start from '@/views/Start.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { Router } from 'vue-router';
import useSessionVault from '@/use/session-vault';

jest.mock('@/use/session-vault');
describe('Start.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<typeof Start>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [
        { path: '/', component: Start },
        { path: '/home', component: Start },
        { path: '/login', component: Start },
      ],
    });
    router.push('/');
    await router.isReady();
    router.replace = jest.fn();
    return mount(Start, {
      global: {
        plugins: [router],
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', async () => {
    const wrapper = await mountView();
    expect(wrapper.exists()).toBe(true);
  });

  it('redirects to login if there is something to unlock', async () => {
    const { canUnlock } = useSessionVault();
    canUnlock.mockResolvedValue(true);
    await mountView();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  it('gives the home view a try if no unlocking is required', async () => {
    const { canUnlock } = useSessionVault();
    canUnlock.mockResolvedValue(false);
    await mountView();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/home');
  });
});
