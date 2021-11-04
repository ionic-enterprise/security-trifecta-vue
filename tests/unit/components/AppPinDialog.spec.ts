import { mount, VueWrapper } from '@vue/test-utils';
import AppPinDialog from '@/components/AppPinDialog.vue';

describe('AppPinDialog.vue', () => {
  let wrapper: VueWrapper<typeof AppPinDialog>;

  beforeEach(async () => {
    wrapper = mount(AppPinDialog);
  });

  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
