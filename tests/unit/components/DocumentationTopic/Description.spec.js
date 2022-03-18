/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Description from 'docc-render/components/DocumentationTopic/Description.vue';

describe('Description', () => {
  it('renders `.description` at the root', () => {
    const wrapper = shallowMount(Description);
    expect(wrapper.classes('description')).toBe(true);
  });

  it('renders slot content', () => {
    const wrapper = shallowMount(Description, {
      slots: { default: '<p>foobar</p>' },
    });

    expect(wrapper.contains('.nodocumentation')).toBe(false);
    expect(wrapper.contains('p')).toBe(true);
    expect(wrapper.find('p').text()).toBe('foobar');
  });
});
