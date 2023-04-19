import AppPinDialog from '@/components/AppPinDialog.vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

describe('AppPinDialog.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    wrapper = mount(AppPinDialog);
  });

  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
