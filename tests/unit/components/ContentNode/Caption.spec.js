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
import Caption from 'docc-render/components/ContentNode/Caption.vue';

describe('Caption', () => {
  it('renders a <figcaption> with the title and slot content', () => {
    const propsData = { title: 'Figure 1', tag: 'figcaption' };
    const slots = { default: '<p>Blah</p>' };
    const wrapper = shallowMount(Caption, { propsData, slots });

    expect(wrapper.element.tagName.toLowerCase() === 'figcaption').toBe(true);
    expect(wrapper.text()).toBe('Figure 1\u00a0Blah');
  });

  it('renders a <figcaption> with slot content only', () => {
    const propsData = { tag: 'figcaption' };
    const slots = { default: '<p>Blah</p>' };
    const wrapper = shallowMount(Caption, { propsData, slots });

    expect(wrapper.element.tagName.toLowerCase() === 'figcaption').toBe(true);
    expect(wrapper.text()).toBe('Blah');
    expect(wrapper.text()).not.toBe('\u00a0Blah');
  });

  it('renders a trailing <figcaption>', () => {
    const propsData = { position: 'trailing', tag: 'figcaption' };
    const slots = { default: '<p>Blah</p>' };
    const wrapper = shallowMount(Caption, { slots, propsData });
    expect(wrapper.classes()).toContain('trailing');
  });

  it('renders a <caption>', () => {
    const propsData = { tag: 'caption' };
    const slots = { default: '<p>Blah</p>' };
    const wrapper = shallowMount(Caption, { slots, propsData });
    expect(wrapper.element.tagName.toLowerCase() === 'caption').toBe(true);
  });
});
