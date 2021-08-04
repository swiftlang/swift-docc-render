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
import Section from 'docc-render/components/DocumentationTopic/Summary/Section.vue';

describe('Section', () => {
  let wrapper;

  const slots = { default: '<p>foobar</p>' };

  beforeEach(() => {
    wrapper = shallowMount(Section, { slots });
  });

  it('renders a div.summary-section', () => {
    expect(wrapper.is('div.summary-section')).toBe(true);
  });

  it('renders slot content', () => {
    const content = wrapper.find('p');
    expect(content.html()).toBe(slots.default);
  });
});
