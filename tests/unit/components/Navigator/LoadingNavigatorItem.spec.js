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
import LoadingNavigatorItem from 'docc-render/components/Navigator/LoadingNavigatorItem.vue';

const { BaseNavigatorCardItem } = LoadingNavigatorItem.components;

const propsData = {
  index: 1,
  width: '40%',
  hideNavigatorIcon: false,
};

const createWrapper = others => shallowMount(LoadingNavigatorItem, {
  propsData: {
    ...propsData,
  },
  stubs: {
    BaseNavigatorCardItem,
  },
  ...others,
});

const wrapper = createWrapper();

describe('LoadingNavigatorItem', () => {
  it('renders a BaseNavigatorCardItem', () => {
    expect(wrapper.is('.loading-navigator-item')).toBe(true);
    expect(wrapper.classes()).toContain('loading-navigator-item');
  });

  it('renders an empty BaseNavigatorCardItem', () => {
    const component = wrapper.find(BaseNavigatorCardItem);
    expect(component.props()).toEqual({
      hideNavigatorIcon: propsData.hideNavigatorIcon,
    });
    expect(component.classes('loading-navigator-item')).toBe(true);
  });

  it('renders a loader with a width given by prop', () => {
    expect(wrapper.find('.loader').exists()).toBe(true);
  });
});
