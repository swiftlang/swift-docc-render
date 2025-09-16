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
import Headline from 'docc-render/components/Headline.vue';

const { Heading } = Headline.components;

describe('Heading', () => {
  const mountHeadingWithLevel = (level, opts = {}) => shallowMount(Heading, {
    propsData: { level },
    ...opts,
  });

  it('renders a dynamic <h[n]> for 1 <= n <= 6', () => {
    expect(mountHeadingWithLevel(1).element.tagName.toLowerCase() === 'h1').toBe(true);
    expect(mountHeadingWithLevel(2).element.tagName.toLowerCase() === 'h2').toBe(true);
    expect(mountHeadingWithLevel(3).element.tagName.toLowerCase() === 'h3').toBe(true);
    expect(mountHeadingWithLevel(4).element.tagName.toLowerCase() === 'h4').toBe(true);
    expect(mountHeadingWithLevel(5).element.tagName.toLowerCase() === 'h5').toBe(true);
    expect(mountHeadingWithLevel(6).element.tagName.toLowerCase() === 'h6').toBe(true);
  });

  it('renders slot content', () => {
    const wrapper = mountHeadingWithLevel(1, {
      slots: {
        default: 'Fooing the <strong>Bar</strong>',
      },
    });
    expect(wrapper.text()).toBe('Fooing the Bar');
    expect(wrapper.findComponent('strong').text()).toBe('Bar');
  });
});

describe('Headline', () => {
  const mountHeadlineWithLevel = (level, opts = {}) => shallowMount(Headline, {
    propsData: { level },
    ...opts,
  });

  it('renders a `Heading` with slot content', () => {
    const wrapper = mountHeadlineWithLevel(2, {
      slots: {
        default: '<span class="test">Test Title</span>',
      },
    });

    expect(wrapper.findComponent(Heading).exists());
    expect(wrapper.classes()).toContain('headline');
    expect(wrapper.props('level')).toBe(2);

    expect(wrapper.findComponent('.test').text()).toBe('Test Title');

    expect(wrapper.find('.eyebrow').exists()).toBe(false);
  });

  it('renders a `Heading` with slot and eyebrow content', () => {
    const wrapper = mountHeadlineWithLevel(1, {
      slots: {
        default: '<span class="test-title">Test Title</span>',
        eyebrow: '<span class="test-eyebrow">Test Eyebrow</span>',
      },
    });

    expect(wrapper.findComponent(Heading).exists());
    expect(wrapper.classes()).toContain('headline');
    expect(wrapper.props('level')).toBe(1);

    expect(wrapper.findComponent('.test-title').text()).toBe('Test Title');

    const eyebrow = wrapper.findComponent('.eyebrow');
    expect(eyebrow.exists()).toBe(true);
    expect(eyebrow.find('.test-eyebrow').text()).toBe('Test Eyebrow');
  });
});
