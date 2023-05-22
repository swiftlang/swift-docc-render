/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import TabnavItem from 'docc-render/components/TabnavItem.vue';
import { shallowMount } from '@vue/test-utils';

const createWrapper = ({ propsData, ...other } = {}) => {
  const config = {
    propsData: {
      value: 'bar',
      ...propsData,
    },
    provide: {
      tabnavData: {
        activeTab: 'foo',
        selectTab: jest.fn(),
      },
    },
    slots: {
      default: '<div>The Title</div>',
    },
    ...other,
  };
  const wrapper = shallowMount(TabnavItem, config);
  return {
    config,
    wrapper,
  };
};

describe('TabnavItem', () => {
  it('renders the TabnavItem', () => {
    const { wrapper } = createWrapper();
    expect(wrapper.text()).toEqual('The Title');
    expect(wrapper.classes()).toContain('tabnav-item');
  });

  it('renders a link', () => {
    const { wrapper } = createWrapper();
    expect(wrapper.find('a.tabnav-link').exists()).toBe(true);
  });

  it('updates the active link on link click', () => {
    const { wrapper, config } = createWrapper();
    wrapper.find('a.tabnav-link').trigger('click');
    expect(config.provide.tabnavData.selectTab).toHaveBeenCalledTimes(1);
    expect(config.provide.tabnavData.selectTab).toHaveBeenCalledWith(config.propsData.value);
  });

  it('adds the `active` class if a tab is selected', () => {
    const { wrapper, config } = createWrapper();
    const link = wrapper.find('a.tabnav-link');
    expect(link.classes()).not.toContain('active');
    expect(link.attributes('aria-current')).toBe('false');
    wrapper.setProps({
      value: config.provide.tabnavData.activeTab,
    });
    expect(link.classes()).toContain('active');
    expect(link.attributes('aria-current')).toBe('true');
  });
});
