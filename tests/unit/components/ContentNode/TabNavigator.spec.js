/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import TabNavigator from '@/components/ContentNode/TabNavigator.vue';
import { mount } from '@vue/test-utils';
import Tabnav from '@/components/Tabnav.vue';
import TabnavItem from '@/components/TabnavItem.vue';
import { flushPromises } from '../../../../test-utils';

const items = [
  {
    title: 'Long tab title',
    content: [
      {
        type: 'text',
        text: 'Foo',
      },
    ],
  },
  {
    title: 'A Longer tab title',
    content: [
      {
        type: 'text',
        text: 'Foo1',
      },
    ],
  },
];

const defaultProps = {
  items,
};

const createWrapper = ({ propsData, ...others } = {}) => mount(TabNavigator, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  ...others,
});

describe('TabNavigator.spec', () => {
  it('renders the TabNavigator.spec', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    // assert vertical mode is not ON
    expect(wrapper.classes()).not.toContain('tabs--vertical');
    expect(wrapper.find(Tabnav).props()).toEqual({
      position: 'start',
      vertical: false,
      value: 0, // first item
    });
    expect(wrapper.findAll(TabnavItem)).toHaveLength(2);
    expect(wrapper.find('.content').text()).toEqual(items[0].content[0].text);
  });

  it('sets the TabNavigator in `vertical` mode', async () => {
    const wrapper = createWrapper({
      propsData: {
        vertical: true,
      },
    });
    await flushPromises();
    expect(wrapper.classes()).toContain('tabs--vertical');
    expect(wrapper.find(Tabnav).props('vertical')).toBe(true);
  });

  it('changes the content, based on the picked tab', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    wrapper.setData({
      current: 1,
    });
    expect(wrapper.find('.content').text()).toBe(items[1].content[0].text);
    expect(wrapper.find(Tabnav).props('value')).toEqual(1);
  });
});
