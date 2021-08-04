/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Summary from 'docc-render/components/DocumentationTopic/Summary.vue';

describe('Summary', () => {
  it('renders a `.summary` class at the root', () => {
    const wrapper = shallowMount(Summary);

    expect(wrapper.classes('summary')).toBe(true);
  });

  it('renders slot content', () => {
    const wrapper = shallowMount(Summary, {
      slots: { default: '<p>foobar</p>' },
    });

    expect(wrapper.contains('p')).toBe(true);
    expect(wrapper.text()).toBe('foobar');
  });
});
