import AppTastingNoteEditor from '@/components/AppTastingNoteEditor.vue';
import { useTastingNotes } from '@/composables/tasting-notes';
import { useTeaCategories } from '@/composables/tea-categories';
import { modalController } from '@ionic/vue';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import waitForExpect from 'wait-for-expect';

jest.mock('@/composables/tasting-notes');
jest.mock('@/composables/tea-categories');

describe('AppTastingNoteEditor.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    const { categories } = useTeaCategories();
    categories.value = [
      {
        id: 1,
        name: 'Green',
        image: 'assets/img/green.jpg',
        description: 'Green tea description.',
        rating: 3,
      },
      {
        id: 2,
        name: 'Black',
        image: 'assets/img/black.jpg',
        description: 'Black tea description.',
        rating: 0,
      },
      {
        id: 3,
        name: 'Herbal',
        image: 'assets/img/herbal.jpg',
        description: 'Herbal Infusion description.',
        rating: 0,
      },
    ];
    wrapper = mount(AppTastingNoteEditor);
    jest.clearAllMocks();
  });

  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('binds the teas in the select', () => {
    const select = wrapper.find('[data-testid="tea-type-select"]');
    const opts = select.findAll('ion-select-option');
    expect(opts.length).toBe(3);
    expect(opts[0].text()).toBe('Green');
    expect(opts[1].text()).toBe('Black');
    expect(opts[2].text()).toBe('Herbal');
  });

  it('displays messages as the user enters invalid data', async () => {
    const brand = wrapper.findComponent('[data-testid="brand-input"]');
    const name = wrapper.findComponent('[data-testid="name-input"]');
    const notes = wrapper.findComponent('[data-testid="notes-textbox"]');
    const msg = wrapper.find('[data-testid="message-area"]');

    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await brand.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await brand.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Brand is a required field'));

    await brand.setValue('Lipton');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await name.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await name.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Name is a required field'));

    await name.setValue('Yellow Label');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await notes.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await notes.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Notes is a required field'));

    await notes.setValue('Not very good');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));
  });

  it('displays an appropriate title', async () => {
    const title = wrapper.find('ion-title');
    expect(title.text()).toBe('Add New Tasting Note');
    await wrapper.setProps({ noteId: 42 });
    expect(title.text()).toBe('Tasting Note');
  });

  it('populates the data when editing a note', async () => {
    const { find } = useTastingNotes();
    (find as jest.Mock).mockResolvedValue({
      id: 73,
      brand: 'Rishi',
      name: 'Puer Cake',
      teaCategoryId: 6,
      rating: 5,
      notes: 'Smooth and peaty, the king of puer teas',
    });
    const modal = mount(AppTastingNoteEditor, {
      props: {
        noteId: 73,
      },
    });
    await flushPromises();
    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenCalledWith(73);
    const brand = modal.findComponent('[data-testid="brand-input"]');
    const name = modal.findComponent('[data-testid="name-input"]');
    const rating = modal.findComponent('[data-testid="rating-input"]');
    const notes = modal.findComponent('[data-testid="notes-textbox"]');
    const teaCategory = modal.findComponent('[data-testid="tea-type-select"]');
    expect((brand.element as HTMLInputElement).value).toEqual('Rishi');
    expect((name.element as HTMLInputElement).value).toEqual('Puer Cake');
    expect((teaCategory.element as HTMLSelectElement).value).toEqual(6);
    expect((notes.element as HTMLInputElement).value).toEqual('Smooth and peaty, the king of puer teas');
    expect((rating as VueWrapper).props().modelValue).toEqual(5);
  });

  describe('submit button', () => {
    beforeEach(() => {
      modalController.dismiss = jest.fn().mockResolvedValue(undefined);
    });

    it('displays an appropriate title', async () => {
      const button = wrapper.find('[data-testid="submit-button"]');
      expect(button.text()).toBe('Add');
      await wrapper.setProps({ noteId: 42 });
      expect(button.text()).toBe('Update');
    });

    it('is disabled until valid data is entered', async () => {
      const brand = wrapper.findComponent('[data-testid="brand-input"]');
      const name = wrapper.findComponent('[data-testid="name-input"]');
      const teaType = wrapper.findComponent('[data-testid="tea-type-select"]');
      const rating = wrapper.findComponent('[data-testid="rating-input"]');
      const notes = wrapper.findComponent('[data-testid="notes-textbox"]');

      const button = wrapper.find('[data-testid="submit-button"]');

      await flushPromises();
      waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await brand.setValue('foobar');
      await flushPromises();
      waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await name.setValue('mytea');
      await flushPromises();
      waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await teaType.setValue(3);
      await flushPromises();
      waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await rating.setValue(2);
      await flushPromises();
      waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await notes.setValue('Meh. It is ok.');
      await flushPromises();
      waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
    });

    describe('on click', () => {
      beforeEach(async () => {
        const brand = wrapper.findComponent('[data-testid="brand-input"]');
        const name = wrapper.findComponent('[data-testid="name-input"]');
        const teaType = wrapper.findComponent('[data-testid="tea-type-select"]');
        const rating = wrapper.findComponent('[data-testid="rating-input"]');
        const notes = wrapper.findComponent('[data-testid="notes-textbox"]');

        await brand.setValue('foobar');
        await name.setValue('mytea');
        await teaType.setValue(3);
        await rating.setValue(2);
        await notes.setValue('Meh. It is ok.');
      });

      it('saves the tasting note', async () => {
        const { save } = useTastingNotes();
        const button = wrapper.find('[data-testid="submit-button"]');
        await button.trigger('click');

        expect(save).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledWith({
          brand: 'foobar',
          name: 'mytea',
          rating: 2,
          teaCategoryId: 3,
          notes: 'Meh. It is ok.',
        });
      });

      it('includes the ID if it set', async () => {
        const { save } = useTastingNotes();
        const button = wrapper.find('[data-testid="submit-button"]');
        await wrapper.setProps({ noteId: 4273 });
        await button.trigger('click');

        expect(save).toHaveBeenCalledWith({
          id: 4273,
          brand: 'foobar',
          name: 'mytea',
          rating: 2,
          teaCategoryId: 3,
          notes: 'Meh. It is ok.',
        });
      });

      it('closes the modal', async () => {
        const button = wrapper.find('[data-testid="submit-button"]');
        expect(modalController.dismiss).not.toHaveBeenCalled();
        await button.trigger('click');
        expect(modalController.dismiss).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('cancel button', () => {
    it('does not save', async () => {
      const { save } = useTastingNotes();
      const button = wrapper.find('[data-testid="cancel-button"]');
      await button.trigger('click');
      expect(save).not.toHaveBeenCalled();
    });

    it('closes the modal', async () => {
      const button = wrapper.find('[data-testid="cancel-button"]');

      expect(modalController.dismiss).not.toHaveBeenCalled();
      await button.trigger('click');
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });
});
