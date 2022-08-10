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
  it('renders the Column', () => {
    const wrapper = createWrapper();
    expect(wrapper.classes()).toContain('column');
    expect(wrapper.text()).toBe('Default Content');
    expect(wrapper.vm.style).toHaveProperty('--col-span', null);
    wrapper.setProps({
      span: 5,
    });
    expect(wrapper.vm.style).toHaveProperty('--col-span', 5);
  });
});
