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
import Title from 'docc-render/components/DocumentationTopic/Summary/Title.vue';

describe('Title', () => {
  let wrapper;

  const slots = { default: '<span>Foo</span>' };

  beforeEach(() => {
    wrapper = shallowMount(Title, { slots });
  });

  it('renders a p.title', () => {
    expect(wrapper.is('p.title')).toBe(true);
  });

  it('renders slot content', () => {
    const content = wrapper.find('span');
    expect(content.html()).toBe(slots.default);
  });
});
