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
import GridColumn from 'docc-render/components/GridColumn.vue';

describe('GridColumn', () => {
  it('renders a div.col', () => {
    expect(shallowMount(GridColumn).contains('div.col')).toBe(true);
  });

  it('renders slot content', () => {
    const wrapper = shallowMount(GridColumn, {
      slots: { default: '<p class="foo">foo</p>' },
    });
    expect(wrapper.contains('p.foo')).toBe(true);
    expect(wrapper.text()).toBe('foo');
  });

  it('has a default colspan for the large breakpoint', () => {
    expect(shallowMount(GridColumn).props('span')).toEqual({ large: 12 });
  });

  it('renders the appropriate colspan classes', () => {
    const classes = shallowMount(GridColumn, {
      propsData: {
        span: {
          large: 10,
          medium: 11,
          small: 12,
        },
      },
    }).classes();

    expect(classes).toContain('col');

    expect(classes).toContain('large-10');
    expect(classes).toContain('medium-11');
    expect(classes).toContain('small-12');
  });

  it('renders the appropriate flag classes', () => {
    const classes = shallowMount(GridColumn, {
      propsData: {
        isCentered: {
          large: true,
          medium: true,
          small: true,
        },
        isUnCentered: {
          large: true,
          medium: true,
          small: true,
        },
      },
    }).classes();

    expect(classes).toContain('col');

    expect(classes).toContain('large-centered');
    expect(classes).toContain('medium-centered');
    expect(classes).toContain('small-centered');

    expect(classes).toContain('large-uncentered');
    expect(classes).toContain('medium-uncentered');
    expect(classes).toContain('small-uncentered');
  });
});
