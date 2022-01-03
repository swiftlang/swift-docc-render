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
import Caption from '@/components/ContentNode/Caption.vue';

describe('Caption', () => {
  it('renders a <caption> with the title and slot content', () => {
    const propsData = { title: 'Figure 1' };
    const slots = { default: '<p>Blah</p>' };
    const wrapper = shallowMount(Caption, { propsData, slots });

    expect(wrapper.is('caption')).toBe(true);
    expect(wrapper.text()).toMatch(/Figure 1\sBlah/);
  });

  it('renders a <figcaption> if tag is `figcaption`', () => {
    const propsData = { title: 'Figure 1', tag: 'figcaption' };
    const wrapper = shallowMount(Caption, { propsData });

    expect(wrapper.is('figcaption')).toBe(true);
  });
});
