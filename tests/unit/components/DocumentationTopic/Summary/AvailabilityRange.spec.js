/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
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
    expect(wrapper.element.matches('span[role="text"]')).toBe(true);
  });

  it('renders the range in text form', async () => {
    expect(wrapper.text()).toBe('fooOS 1.0+');

    await wrapper.setProps({ deprecatedAt });
    expect(wrapper.text()).toBe('fooOS 1.0\u20132.0');

    await wrapper.setProps({
      ...propsData,
      deprecatedAt: null,
      introducedAt: null,
    });
    expect(wrapper.text()).toBe('fooOS');
  });

  it('renders a descriptive title attribute', async () => {
    expect(wrapper.attributes('title'))
      .toBe('availability.available-on-platform-version fooOS 1.0');

    await wrapper.setProps({ deprecatedAt });
    expect(wrapper.attributes('title'))
      .toBe('availability.introduced-and-deprecated fooOS 1.0 2.0');

    await wrapper.setProps({
      ...propsData,
      deprecatedAt: null,
      introducedAt: null,
    });
    expect(wrapper.attributes('title')).toBe('availability.available-on-platform fooOS');
  });

  it('renders an aria label with the description (prepended with short text)', async () => {
    expect(wrapper.attributes('aria-label'))
      .toBe('fooOS 1.0+, availability.available-on-platform-version fooOS 1.0');

    await wrapper.setProps({ deprecatedAt });
    expect(wrapper.attributes('aria-label'))
      .toBe('fooOS 1.0\u20132.0, change-type.deprecated, availability.introduced-and-deprecated fooOS 1.0 2.0');

    await wrapper.setProps({
      ...propsData,
      deprecatedAt: null,
      introducedAt: null,
    });
    expect(wrapper.attributes('aria-label'))
      .toBe('fooOS, availability.available-on-platform fooOS');
  });
});
