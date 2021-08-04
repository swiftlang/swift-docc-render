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
import GridRow from 'docc-render/components/GridRow.vue';

describe('GridRow', () => {
  it('renders a div.row', () => {
    expect(shallowMount(GridRow).contains('div.row')).toBe(true);
  });

  it('renders slot content', () => {
    const wrapper = shallowMount(GridRow, {
      slots: { default: '<p class="foo">foo</p>' },
    });
    expect(wrapper.contains('p.foo')).toBe(true);
    expect(wrapper.text()).toBe('foo');
  });
});
