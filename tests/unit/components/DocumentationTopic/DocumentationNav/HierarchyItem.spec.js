/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { RouterLinkStub, shallowMount } from '@vue/test-utils';
import HierarchyItem
  from 'docc-render/components/DocumentationTopic/DocumentationNav/HierarchyItem.vue';
import NavMenuItemBase from 'docc-render/components/NavMenuItemBase.vue';

const mountWithProps = props => shallowMount(HierarchyItem, {
  context: {
    children: ['Foobar'],
    props,
  },
  stubs: { 'router-link': RouterLinkStub },
});

describe('HierarchyItem', () => {
  it('renders an `NavMenuItemBase` with .collapsed class modifier when appropriate', () => {
    const propsData = { url: 'foo.bar' };

    let wrapper = mountWithProps(propsData);
    expect(wrapper.is(NavMenuItemBase));
    expect(wrapper.classes('collapsed')).toBe(false);

    wrapper = mountWithProps({ ...propsData, isCollapsed: true });
    expect(wrapper.classes('collapsed')).toBe(true);
  });

  it('renders a slash instead of an icon', () => {
    const wrapper = mountWithProps({ url: 'foo.bar' });

    expect(wrapper.find('.hierarchy-item-icon').text()).toBe('/');
  });

  it('renders a .parent.item link if the URL exists', () => {
    const wrapper = mountWithProps({ url: 'foo.bar' });
    const item = wrapper.find('.item');
    expect(item.classes('parent')).toBe(true);
    expect(item.is(RouterLinkStub)).toBe(true);
    expect(item.props('to')).toBe('foo.bar');
    expect(item.text()).toBe('Foobar');
  });

  it('renders a .current.item span if there is no URL', () => {
    const wrapper = mountWithProps();
    const item = wrapper.find('.item');
    expect(item.classes('current')).toBe(true);
    expect(item.is('span')).toBe(true);
    expect(item.text()).toBe('Foobar');
  });

  it('exposes a `tags` slot, only when no `url` is passed', () => {
    const wrapper = shallowMount(HierarchyItem, {
      slots: {
        tags: 'Post Current Item Content',
      },
      stubs: { 'router-link': RouterLinkStub },
    });
    expect(wrapper.text()).toContain('Post Current Item Content');
  });
});
