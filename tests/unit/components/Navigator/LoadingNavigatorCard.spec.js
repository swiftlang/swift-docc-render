/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import LoadingNavigatorCard from '@/components/Navigator/LoadingNavigatorCard.vue';
import { shallowMount } from '@vue/test-utils';

const defaultProps = {
  technology: 'Technology',
};

const {
  LoadingNavigatorItem,
  BaseNavigatorCard,
} = LoadingNavigatorCard.components;

let wrapper;

beforeEach(() => {
  wrapper = shallowMount(LoadingNavigatorCard, {
    propsData: {
      ...defaultProps,
    },
    stubs: {
      BaseNavigatorCard,
    },
  });
});

describe('LoadingNavigatorCard', () => {
  it('renders the LoadingNavigatorCard and it emits a `close` event', async () => {
    const baseNavigator = wrapper.find(BaseNavigatorCard);
    baseNavigator.vm.$emit('close');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('renders three loading navigator items, if is loading', () => {
    const items = wrapper.findAll(LoadingNavigatorItem);
    expect(items.length).toBe(3);
  });

  it('hides loading markup from screen readers', () => {
    expect(wrapper.find('.loading-navigator').attributes()).toMatchObject({
      'aria-hidden': 'true',
    });
  });
});
