/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022-2024 Apple Inc. and the Swift project authors
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
    expect(wrapper.element.matches('div.navigator-card-item')).toBe(true);
  });

  it('renders a slot for depth-spacer', () => {
    wrapper = shallowMount(BaseNavigatorCardItem, {
      slots: {
        'depth-spacer': '<div class="depth-spacer-slot"></div>',
      },
    });

    expect(wrapper.findComponent('.depth-spacer').exists()).toBe(true);
    expect(wrapper.findComponent('.depth-spacer-slot').exists()).toBe(true);
  });

  it('renders a slot for navigator-icon', () => {
    wrapper = shallowMount(BaseNavigatorCardItem, {
      slots: {
        'navigator-icon': '<div class="navigator-icon-slot"></div>',
      },
    });

    expect(wrapper.findComponent('.navigator-icon-wrapper').exists()).toBe(true);
    expect(wrapper.findComponent('.navigator-icon-slot').exists()).toBe(true);
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

    expect(wrapper.findComponent('.navigator-icon-wrapper').exists()).toBe(false);
    expect(wrapper.findComponent('.navigator-icon-slot').exists()).toBe(false);
  });

  it('renders a slot for title-container', () => {
    wrapper = shallowMount(BaseNavigatorCardItem, {
      slots: {
        'title-container': '<div class="title-container-slot"></div>',
      },
    });

    expect(wrapper.findComponent('.title-container').exists()).toBe(true);
    expect(wrapper.findComponent('.title-container-slot').exists()).toBe(true);
  });

  it('renders a slot for content-container', () => {
    wrapper = shallowMount(BaseNavigatorCardItem, {
      slots: {
        'content-container': '<div class="content-container-slot"></div>',
      },
    });

    expect(wrapper.findComponent('.content-container').exists()).toBe(true);
    expect(wrapper.findComponent('.content-container-slot').exists()).toBe(true);
  });
});
