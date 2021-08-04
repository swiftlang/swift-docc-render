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
import List from 'docc-render/components/DocumentationTopic/Summary/List.vue';

describe('List', () => {
  let wrapper;

  const slots = { default: '<p>foobar</p>' };

  beforeEach(() => {
    wrapper = shallowMount(List, { slots });
  });

  it('renders a ul and slot content', () => {
    expect(wrapper.is('ul.summary-list')).toBe(true);
  });

  it('renders slot content', () => {
    const content = wrapper.find('p');
    expect(content.html()).toBe(slots.default);
  });
});
