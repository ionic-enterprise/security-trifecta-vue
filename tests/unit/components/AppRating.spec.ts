import { mount, VueWrapper } from '@vue/test-utils';
import AppRating from '@/components/AppRating.vue';
import { star, starOutline } from 'ionicons/icons';

describe('AppRating.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    wrapper = mount(AppRating);
  });

  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders five empty stars', () => {
    const icons = wrapper.findAllComponents({ name: 'ion-icon' });
    expect(icons.length).toBe(5);
    icons.forEach((icon) => expect(icon.vm.icon).toEqual(starOutline));
  });

  it('fills in the first 3 stars', async () => {
    const icons = wrapper.findAllComponents({ name: 'ion-icon' });
    await wrapper.setProps({ modelValue: 3 });
    expect(icons.length).toBe(5);
    icons.forEach((icon, idx) => expect(icon.vm.icon).toEqual(idx < 3 ? star : starOutline));
  });

  it('emits the model value update event on clicks', () => {
    const icons = wrapper.findAll('ion-icon');
    icons[2].trigger('click');
    const updateModelValueCalls = wrapper.emitted('update:modelValue');
    expect(updateModelValueCalls?.length).toBe(1);
    expect(updateModelValueCalls && updateModelValueCalls[0]).toEqual([3]);
  });
});
