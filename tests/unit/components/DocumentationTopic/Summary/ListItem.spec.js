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
import ListItem from 'docc-render/components/DocumentationTopic/Summary/ListItem.vue';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';

describe('ListItem', () => {
  let wrapper;

  const slots = { default: '<p>foobar</p>' };

  beforeEach(() => {
    wrapper = shallowMount(ListItem, { slots });
  });

  it('renders a li', () => {
    expect(wrapper.is('li.summary-list-item')).toBe(true);
  });

  it('renders slot content', () => {
    const p = wrapper.find('p');
    expect(p.html()).toBe(slots.default);
  });

  it('applies the `multipleLinesClass` class if `hasMultipleLinesAfterAPIChanges` is true', () => {
    wrapper = shallowMount({
      ...ListItem,
      computed: {
        hasMultipleLinesAfterAPIChanges: () => true,
      },
    });

    expect(wrapper.classes(multipleLinesClass)).toBe(true);
  });
});
