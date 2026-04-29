/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import OverviewCard from 'docc-render/components/ContentNode/OverviewCard.vue';

describe('OverviewCard', () => {
  it('renders slot content', () => {
    const wrapper = shallowMount(OverviewCard, {
      slots: {
        head: '<h3>foobar</h3>',
        default: '<p>qux</p>',
      },
    });
    expect(wrapper.classes('overviewcard')).toBe(true);

    const head = wrapper.find('.overviewcard-head');
    expect(head.exists()).toBe(true);
    expect(head.text()).toBe('foobar');

    const content = wrapper.find('.overviewcard-content');
    expect(content.exists()).toBe(true);
    expect(content.text()).toBe('qux');
  });

  it('does not render header if no head slot is provided', () => {
    const wrapper = shallowMount(OverviewCard, {
      slots: {
        default: '<p>foobar</p>',
      },
    });
    expect(wrapper.find('.overviewcard-head').exists()).toBe(false);
  });
});
