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
import FigureCaption from 'docc-render/components/ContentNode/FigureCaption.vue';

describe('FigureCaption', () => {
  it('renders a <figcaption> with the title and slot content', () => {
    const propsData = { title: 'Figure 1' };
    const slots = { default: '<p>Blah</p>' };
    const wrapper = shallowMount(FigureCaption, { propsData, slots });

    expect(wrapper.is('figcaption')).toBe(true);
    expect(wrapper.text()).toMatch(/Figure 1\sBlah/);
  });
  it('renders a <figcaption> with slot content only', () => {
    const slots = { default: '<p>Blah</p>' };
    const wrapper = shallowMount(FigureCaption, { slots });

    expect(wrapper.is('figcaption')).toBe(true);
    expect(wrapper.text()).toBe('Blah');
  });

  it('renders a <figcaption> centered', () => {
    const slots = { default: '<p>Blah</p>' };
    const wrapper = shallowMount(FigureCaption, { slots, propsData: { centered: true } });
    expect(wrapper.classes()).toContain('centered');
  });
});
