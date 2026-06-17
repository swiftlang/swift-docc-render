/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import Column from '@/components/ContentNode/Column.vue';
import { shallowMount } from '@vue/test-utils';

const createWrapper = props => shallowMount(Column, {
  slots: {
    default: 'Default Content',
  },
  ...props,
});

describe('Column', () => {
  it('renders the Column', async () => {
    const wrapper = createWrapper();
    expect(wrapper.classes()).toContain('column');
    expect(wrapper.text()).toBe('Default Content');
    expect(wrapper.vm.style).toHaveProperty('--col-span', null);
    await wrapper.setProps({
      span: 5,
    });
    expect(wrapper.vm.style).toHaveProperty('--col-span', 5);
  });

  describe('alignment', () => {
    it('defaults to null when no alignment is set', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.style).toHaveProperty('--col-alignment', null);
    });

    it('applies leading alignment', async () => {
      const wrapper = createWrapper();
      await wrapper.setProps({ alignment: 'leading' });
      expect(wrapper.vm.style).toHaveProperty('--col-alignment', 'flex-start');
    });

    it('applies center alignment', async () => {
      const wrapper = createWrapper();
      await wrapper.setProps({ alignment: 'center' });
      expect(wrapper.vm.style).toHaveProperty('--col-alignment', 'center');
    });

    it('applies trailing alignment', async () => {
      const wrapper = createWrapper();
      await wrapper.setProps({ alignment: 'trailing' });
      expect(wrapper.vm.style).toHaveProperty('--col-alignment', 'flex-end');
    });
  });
});
