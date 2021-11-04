import { mount } from '@vue/test-utils';
import Home from '@/views/Home.vue';

describe('Home.vue', () => {
  it('renders', () => {
    const wrapper = mount(Home);
    expect(wrapper.text()).toMatch('Ready to create an app?');
  });
});
