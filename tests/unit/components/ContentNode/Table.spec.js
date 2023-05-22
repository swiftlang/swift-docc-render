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
import Table from 'docc-render/components/ContentNode/Table.vue';

describe('Table', () => {
  it('renders a wrapper and table with slot content', () => {
    const wrapper = shallowMount(Table, {
      slots: { default: '<tbody><tr><td>foo</td></tr></tbody>' },
    });
    expect(wrapper.is('.table-wrapper')).toBe(true);
    const table = wrapper.find('table');
    expect(table.exists()).toBe(true);
    expect(table.contains('tbody tr td')).toBe(true);
  });

  it('renders a table with `spanned` class', () => {
    const wrapper = shallowMount(Table, {
      slots: { default: '<tbody><tr><td>foo</td></tr></tbody>' },
      propsData: {
        spanned: true,
      },
    });
    const table = wrapper.find('table');
    expect(table.classes('spanned')).toBe(true);
  });
});
