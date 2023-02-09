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
import BaseNavigatorCardItem from 'docc-render/components/Navigator/BaseNavigatorCardItem.vue';

const propsData = {
  hideNavigatorIcon: false,
};

const createWrapper = others => shallowMount(BaseNavigatorCardItem, {
  propsData: {
    ...propsData,
  },
  ...others,
});

let wrapper;

describe('BaseNavigatorCardItem', () => {
  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('renders a navigator-card-item as wrapper', () => {
    expect(wrapper.is('div.navigator-card-item')).toBe(true);
  });

  it('renders a slot for depth-spacer', () => {
    wrapper = shallowMount(BaseNavigatorCardItem, {
      slots: {
        'depth-spacer': '<div class="depth-spacer-slot"></div>',
      },
    });

    expect(wrapper.find('.depth-spacer').exists()).toBe(true);
    expect(wrapper.find('.depth-spacer-slot').exists()).toBe(true);
  });

  it('renders a slot for navigator-icon', () => {
    wrapper = shallowMount(BaseNavigatorCardItem, {
      slots: {
        'navigator-icon': '<div class="navigator-icon-slot"></div>',
      },
    });

    expect(wrapper.find('.navigator-icon-wrapper').exists()).toBe(true);
    expect(wrapper.find('.navigator-icon-slot').exists()).toBe(true);
  });

  it('does not renders a slot for navigator-icon if hideNavigatorIcon is true', () => {
    wrapper = shallowMount(BaseNavigatorCardItem, {
      propsData: {
        hideNavigatorIcon: true,
      },
      slots: {
        'navigator-icon': '<div class="navigator-icon-slot"></div>',
      },
    });

    expect(wrapper.find('.navigator-icon-wrapper').exists()).toBe(false);
    expect(wrapper.find('.navigator-icon-slot').exists()).toBe(false);
  });

  it('renders a slot for title-container', () => {
    wrapper = shallowMount(BaseNavigatorCardItem, {
      slots: {
        'title-container': '<div class="title-container-slot"></div>',
      },
    });

    expect(wrapper.find('.title-container').exists()).toBe(true);
    expect(wrapper.find('.title-container-slot').exists()).toBe(true);
  });
});
