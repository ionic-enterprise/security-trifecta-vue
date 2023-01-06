import { mount, VueWrapper } from '@vue/test-utils';
import StartPage from '@/views/StartPage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { Router } from 'vue-router';
import { useSessionVault } from '@/composables/session-vault';

jest.mock('@/composables/session-vault');
describe('StartPage.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [
        { path: '/', component: StartPage },
        { path: '/home', component: StartPage },
        { path: '/login', component: StartPage },
      ],
    });
    router.push('/');
    await router.isReady();
    router.replace = jest.fn();
    return mount(StartPage, {
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
    (canUnlock as jest.Mock).mockResolvedValue(true);
    await mountView();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  it('gives the home view a try if no unlocking is required', async () => {
    const { canUnlock } = useSessionVault();
    (canUnlock as jest.Mock).mockResolvedValue(false);
    await mountView();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/home');
  });
});
