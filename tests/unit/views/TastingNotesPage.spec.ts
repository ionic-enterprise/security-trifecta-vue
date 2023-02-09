import { useAuth } from '@/composables/auth';
import { usePreferences } from '@/composables/preferences';
import { useTastingNotes } from '@/composables/tasting-notes';
import TastingNotesPage from '@/views/TastingNotesPage.vue';
import { modalController } from '@ionic/vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { mount, VueWrapper } from '@vue/test-utils';
import { Router } from 'vue-router';

jest.mock('@/composables/auth');
jest.mock('@/composables/preferences');
jest.mock('@/composables/sync');
jest.mock('@/composables/tasting-notes');
jest.mock('@/composables/vault-factory');

describe('TastingNotesPage.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: TastingNotesPage }],
    });
    router.push('/');
    await router.isReady();
    return mount(TastingNotesPage, {
      global: {
        plugins: [router],
      },
    });
  };

  beforeEach(() => {
    const { notes } = useTastingNotes();
    notes.value = [
      {
        id: 42,
        brand: 'Lipton',
        name: 'Green Tea',
        teaCategoryId: 3,
        rating: 3,
        notes: 'A basic green tea, very passable but nothing special',
      },
      {
        id: 314159,
        brand: 'Lipton',
        name: 'Yellow Label',
        teaCategoryId: 2,
        rating: 1,
        notes: 'Very acidic, even as dark teas go, OK for iced tea, horrible for any other application',
      },
      {
        id: 73,
        brand: 'Rishi',
        name: 'Puer Cake',
        teaCategoryId: 6,
        rating: 5,
        notes: 'Smooth and peaty, the king of puer teas',
      },
    ];
    jest.clearAllMocks();
  });

  it('displays the titles', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAll('ion-title');
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Tasting Notes');
    expect(titles[1].text()).toBe('Tasting Notes');
  });

  it('refreshes the tea data', async () => {
    const { refresh } = useTastingNotes();
    await mountView();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('loads the preferences', async () => {
    const { load } = usePreferences();
    await mountView();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('displays the notes', async () => {
    const wrapper = await mountView();
    const list = wrapper.find('[data-testid="notes-list"]');
    const items = list.findAll('ion-item');
    expect(items.length).toBe(3);
    expect(items[0].text()).toContain('Lipton');
    expect(items[0].text()).toContain('Green Tea');
    expect(items[1].text()).toContain('Lipton');
    expect(items[1].text()).toContain('Yellow Label');
    expect(items[2].text()).toContain('Rishi');
    expect(items[2].text()).toContain('Puer Cake');
  });

  describe('adding a new note', () => {
    let modal: { present: () => Promise<void> };
    beforeEach(() => {
      modal = {
        present: jest.fn().mockResolvedValue(undefined),
      };
      modalController.create = jest.fn().mockResolvedValue(modal);
    });

    it('displays the modal', async () => {
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="add-note-button"]');
      await button.trigger('click');
      expect(modal.present).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout clicked', () => {
    it('performs a logout', async () => {
      const { logout } = useAuth();
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="logout-button"]');
      router.replace = jest.fn();
      await button.trigger('click');
      expect(logout).toHaveBeenCalledTimes(1);
    });

    it('navigates to the login after the logout action is complete', async () => {
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="logout-button"]');
      router.replace = jest.fn();
      await button.trigger('click');
      expect(router.replace).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith('/login');
    });
  });
});
