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

const titles = ['Long tab title', 'A Longer tab title'];
const scopedSlots = {
  [titles[0]]: '<div>First</div>',
  [titles[1]]: '<div>Second</div>',
};
const defaultProps = {
  titles,
};

const createWrapper = ({ propsData, ...others } = {}) => mount(TabNavigator, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  scopedSlots,
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
      value: titles[0],
    });
    expect(wrapper.findAll(TabnavItem)).toHaveLength(2);
    expect(wrapper.find('.tabs-content').text()).toEqual('First');
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
    const tabnav = wrapper.find(Tabnav);
    tabnav.vm.$emit('input', titles[1]);
    expect(wrapper.find('.tabs-content').text()).toBe('Second');
    expect(tabnav.props('value')).toEqual(titles[1]);
  });
});
