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
import AvailabilityRange from 'docc-render/components/DocumentationTopic/Summary/AvailabilityRange.vue';

describe('AvailabilityRange', () => {
  let wrapper;

  const propsData = {
    introducedAt: '1.0',
    platformName: 'fooOS',
  };

  const deprecatedAt = '2.0';

  beforeEach(() => {
    wrapper = shallowMount(AvailabilityRange, { propsData });
  });

  it('renders a span[role="text"]', () => {
    expect(wrapper.is('span[role="text"]')).toBe(true);
  });

  it('renders the range in text form', () => {
    expect(wrapper.text()).toBe('fooOS 1.0+');

    wrapper.setProps({ deprecatedAt });
    expect(wrapper.text()).toBe('fooOS 1.0\u20132.0');
  });

  it('renders a descriptive title attribute', () => {
    expect(wrapper.attributes('title')).toBe('Available on fooOS 1.0 and later');

    wrapper.setProps({ deprecatedAt });
    expect(wrapper.attributes('title')).toBe('Introduced in fooOS 1.0 and deprecated in fooOS 2.0');
  });

  it('renders an aria label with the description (prepended with short text)', () => {
    expect(wrapper.attributes('aria-label')).toBe('fooOS 1.0+, Available on fooOS 1.0 and later');

    wrapper.setProps({ deprecatedAt });
    expect(wrapper.attributes('aria-label'))
      .toBe('fooOS 1.0\u20132.0, Deprecated, Introduced in fooOS 1.0 and deprecated in fooOS 2.0');
  });
});
