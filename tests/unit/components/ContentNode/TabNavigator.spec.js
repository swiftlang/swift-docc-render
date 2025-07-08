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

const titles = ['Long tab title', 'A Longer tab title', 'The Longest tab title'];
const longerTitles = titles.concat('added title');
const changedTitles = ['changed first tab',
  'changed middle tab', 'changed last tab'];

const scopedSlots = {
  [titles[0]]: '<div>First</div>',
  [titles[1]]: '<div>Second</div>',
  [titles[2]]: '<div>Third</div>',
  [longerTitles[3]]: '<div>Fourth</div>',
  [changedTitles[0]]: '<div>First</div>',
  [changedTitles[1]]: '<div>Middle</div>',
  [changedTitles[2]]: '<div>Last</div>',
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
    expect(wrapper.findComponent(Tabnav).props()).toEqual({
      position: 'start',
      vertical: false,
      value: titles[0],
    });
    expect(wrapper.findAll(TabnavItem)).toHaveLength(3);
    const tabs = wrapper.findAll('.tab-container');
    expect(tabs).toHaveLength(3);
    expect(tabs.at(0).classes()).toContain('active');
    expect(tabs.at(0).isVisible()).toBe(true);
    expect(tabs.at(1).classes()).not.toContain('active');
    expect(tabs.at(1).isVisible()).toBe(false);
    expect(tabs.at(0).text()).toEqual('First');
  });

  it('sets the TabNavigator in `vertical` mode', async () => {
    const wrapper = createWrapper({
      propsData: {
        vertical: true,
      },
    });
    await flushPromises();
    expect(wrapper.classes()).toContain('tabs--vertical');
    expect(wrapper.findComponent(Tabnav).props('vertical')).toBe(true);
  });

  it('changes the content, based on the picked tab', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const tabnav = wrapper.findComponent(Tabnav);
    tabnav.vm.$emit('input', titles[1]);
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('Second');
    expect(tabnav.props('value')).toEqual(titles[1]);
  });

  it('selects the added tab when adding a tab', async () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('First');

    await wrapper.setProps({ titles: longerTitles });
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('Fourth');
    const tabnav = wrapper.findComponent(Tabnav);
    expect(tabnav.props('value')).toEqual(longerTitles[3]);
  });

  it('selects first tab when deleting current tab', async () => {
    const wrapper = createWrapper();
    await wrapper.setProps({ titles: longerTitles });
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('Fourth');

    await wrapper.setProps({ titles });
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('First');
    const tabnav = wrapper.findComponent(Tabnav);
    expect(tabnav.props('value')).toEqual(titles[0]);
  });

  it('keep currently selected tab when deleting a tab', async () => {
    const wrapper = createWrapper();
    await wrapper.setProps({ titles: longerTitles });
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('Fourth'); // Current tab

    const removedTitles = ['Long tab title',
      'A Longer tab title', 'added title'];
    await wrapper.setProps({ titles: removedTitles });
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('Fourth'); // Keeps current tab
    const tabnav = wrapper.findComponent(Tabnav);
    expect(tabnav.props('value')).toEqual(longerTitles[3]);
  });

  it('selects correct tab when changing a tab', async () => {
    const changedLastTab = ['Long tab title',
      'A Longer tab title', 'changed last tab'];
    const wrapper = createWrapper();
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('First');
    await wrapper.setProps({ titles: changedLastTab });
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('Last');
    let tabnav = wrapper.findComponent(Tabnav);
    expect(tabnav.props('value')).toEqual(changedLastTab[2]);

    const changedFirstTab = ['changed first tab',
      'A Longer tab title', 'changed last tab'];
    await wrapper.setProps({ titles: changedFirstTab });
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('First');
    tabnav = wrapper.findComponent(Tabnav);
    expect(tabnav.props('value')).toEqual(changedFirstTab[0]);

    const changedMidTab = ['changed first tab',
      'changed middle tab', 'changed last tab'];
    await wrapper.setProps({ titles: changedMidTab });
    expect(wrapper.findComponent('.tab-container.active').text()).toBe('Middle');
    tabnav = wrapper.findComponent(Tabnav);
    expect(tabnav.props('value')).toEqual(changedMidTab[1]);
  });
});
