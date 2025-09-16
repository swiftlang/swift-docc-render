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
import RequirementMetadata from 'docc-render/components/DocumentationTopic/Description/RequirementMetadata.vue';

describe('RequirementMetadata', () => {
  it('renders "Required." with <p><strong>', () => {
    const wrapper = shallowMount(RequirementMetadata);
    expect(wrapper.is('p.requirement-metadata')).toBe(true);

    const strong = wrapper.findComponent('strong');
    expect(strong.exists()).toBe(true);
    expect(strong.text()).toBe('required');

    expect(wrapper.text()).toBe('required');
  });

  it('adds "Default implementation provided." text with a default implementation', () => {
    const wrapper = shallowMount(RequirementMetadata, {
      context: {
        props: {
          defaultImplementationsCount: 1,
        },
      },
    });
    expect(wrapper.text().startsWith('required')).toBe(true);
    expect(wrapper.text().endsWith('metadata.default-implementation')).toBe(true);
  });

  it('adds "Default implementations provided." text with multiple default implementations', () => {
    const wrapper = shallowMount(RequirementMetadata, {
      context: {
        props: {
          defaultImplementationsCount: 2,
        },
      },
    });
    expect(wrapper.text().startsWith('required')).toBe(true);
    expect(wrapper.text().endsWith('metadata.default-implementation')).toBe(true);
  });
});
