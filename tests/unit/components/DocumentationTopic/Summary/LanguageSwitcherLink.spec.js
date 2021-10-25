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
import LanguageSwitcherLink from 'docc-render/components/DocumentationTopic/Summary/LanguageSwitcherLink.vue';

describe('LanguageSwitcherLink', () => {
  const slots = { default: 'Foo' };

  it('renders a anchor if provided a url', () => {
    const url = '/foo';
    const wrapper = shallowMount(LanguageSwitcherLink, {
      propsData: { url },
      slots,
    });
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe(url);
    expect(link.text()).toBe(slots.default);
  });

  it('renders a span if not provided a url', () => {
    const wrapper = shallowMount(LanguageSwitcherLink, { slots });
    expect(wrapper.is('span')).toBe(true);
    expect(wrapper.text()).toBe(slots.default);
  });
});
