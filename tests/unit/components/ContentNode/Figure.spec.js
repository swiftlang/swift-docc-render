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
import Figure from 'docc-render/components/ContentNode/Figure.vue';

describe('Figure', () => {
  const propsData = { anchor: 'foo' };
  const slots = { default: '<p>blah</p>' };

  it('renders a <figure> with an id and slot content', () => {
    const wrapper = shallowMount(Figure, { propsData, slots });

    expect(wrapper.is('figure')).toBe(true);
    expect(wrapper.attributes('id')).toBe(propsData.anchor);

    const p = wrapper.find('p');
    expect(p.exists()).toBe(true);
    expect(p.text()).toBe('blah');
  });

  it('renders a <figure> without an id, just slot content', () => {
    const wrapper = shallowMount(Figure, { slots });

    expect(wrapper.is('figure')).toBe(true);
    expect(wrapper.attributes('id')).toBeFalsy();

    const p = wrapper.find('p');
    expect(p.exists()).toBe(true);
    expect(p.text()).toBe('blah');
  });
});
