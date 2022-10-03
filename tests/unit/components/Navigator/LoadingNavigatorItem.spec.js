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

let wrapper;

describe('LoadingNavigatorItem', () => {
  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('renders an empty BaseNavigatorCardItem with navigator-icon', () => {
    const baseComponent = wrapper.find(BaseNavigatorCardItem);
    expect(baseComponent.props()).toEqual({
      hideNavigatorIcon: propsData.hideNavigatorIcon,
    });
    expect(baseComponent.classes('loading-navigator-item')).toBe(true);
    expect(baseComponent.find('.navigator-icon').exists()).toBe(true);
  });

  it('does not render a navigator-icon slot if hideNavigatorIcon is true', () => {
    wrapper = createWrapper({ propsData: { hideNavigatorIcon: true } });
    expect(wrapper.find('.navigator-icon').exists()).toBe(false);
  });

  it('renders a loader with a width given by prop', () => {
    const loader = wrapper.find('.loader');
    expect(loader.exists()).toBe(true);
    expect(loader.element.style.width).toEqual(propsData.width);
  });
});
