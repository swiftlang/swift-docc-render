/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import Row from '@/components/ContentNode/Row.vue';
import { shallowMount } from '@vue/test-utils';

const createWrapper = props => shallowMount(Row, {
  slots: {
    default: 'Slot Content',
  },
  ...props,
});

describe('Row', () => {
  it('renders the Row', () => {
    const wrapper = createWrapper();
    expect(wrapper.classes()).toContain('row');
    expect(wrapper.classes()).not.toContain('with-columns');
    expect(wrapper.text()).toContain('Slot Content');
  });

  it('renders with columns in mind', () => {
    const wrapper = createWrapper({
      propsData: {
        columns: 4,
      },
    });
    expect(wrapper.classes()).toContain('with-columns');
    expect(wrapper.vm.style).toHaveProperty('--col-count', 4);
  });

  it('provides a --col-gap', () => {
    const wrapper = createWrapper({
      propsData: {
        gap: 10,
      },
    });
    expect(wrapper.vm.style).toHaveProperty('--col-gap', '10px');
  });
});
