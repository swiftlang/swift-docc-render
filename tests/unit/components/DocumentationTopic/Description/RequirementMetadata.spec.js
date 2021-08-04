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
import RequirementMetadata from 'docc-render/components/DocumentationTopic/Description/RequirementMetadata.vue';

describe('RequirementMetadata', () => {
  it('renders "Required." with <p><strong>', () => {
    const wrapper = shallowMount(RequirementMetadata);
    expect(wrapper.is('p.requirement-metadata')).toBe(true);

    const strong = wrapper.find('strong');
    expect(strong.exists()).toBe(true);
    expect(strong.text()).toBe('Required.');

    expect(wrapper.text()).toBe('Required.');
  });

  it('adds "Default implementation provided." text with a default implementation', () => {
    const wrapper = shallowMount(RequirementMetadata, {
      context: {
        props: {
          defaultImplementationsCount: 1,
        },
      },
    });
    expect(wrapper.text().startsWith('Required.')).toBe(true);
    expect(wrapper.text().endsWith('Default implementation provided.')).toBe(true);
  });

  it('adds "Default implementations provided." text with multiple default implementations', () => {
    const wrapper = shallowMount(RequirementMetadata, {
      context: {
        props: {
          defaultImplementationsCount: 2,
        },
      },
    });
    expect(wrapper.text().startsWith('Required.')).toBe(true);
    expect(wrapper.text().endsWith('Default implementations provided.')).toBe(true);
  });
});
