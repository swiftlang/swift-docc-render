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
import HierarchyCollapsedItems
  from 'docc-render/components/DocumentationTopic/DocumentationNav/HierarchyCollapsedItems.vue';
import EllipsisIcon from 'theme/components/Icons/EllipsisIcon.vue';

const mocks = { $route: {} };

const propsData = {
  topics: [
    {
      title: 'Foo',
      url: '/documentation/foo',
    },
    {
      title: 'Bar',
      url: '/documentation/foo/bar',
    },
  ],
};

const stubs = { 'router-link': RouterLinkStub };

describe('HierarchyCollapsedItems', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(HierarchyCollapsedItems, {
      mocks,
      propsData,
      stubs,
    });
  });

  it('renders an list item with `.hierarchy-collapsed-items` class', () => {
    expect(wrapper.is('li.hierarchy-collapsed-items')).toBe(true);
  });

  it('renders a slash instead of an icon', () => {
    expect(wrapper.find('.hierarchy-item-icon').text()).toBe('/');
  });

  it('renders a non-focused button', () => {
    const btn = wrapper.find('button.toggle');
    expect(btn.exists()).toBe(true);
    expect(btn.classes('focused')).toBe(false);
    expect(btn.find('.indicator .icon-inline').is(EllipsisIcon)).toBe(true);
  });

  it('renders a collapsed dropdown', () => {
    const dropdown = wrapper.find('ul.dropdown');
    expect(dropdown.exists()).toBe(true);
    expect(dropdown.classes('collapsed')).toBe(true);

    const items = dropdown.findAll('li.dropdown-item');
    propsData.topics.forEach((topic, i) => {
      const link = items.at(i).find(RouterLinkStub);
      expect(link.exists()).toBe(true);
      expect(link.props('to')).toBe(topic.url);
      expect(link.text()).toBe(topic.title);
    });
  });

  describe('when the toggle is clicked', () => {
    let toggle;

    beforeEach(() => {
      toggle = wrapper.find('.toggle');
      toggle.trigger('click');
    });

    it('focuses the toggle', () => {
      expect(toggle.classes('focused')).toBe(true);
    });

    it('uncollapses the dropdown when the toggle is clicked', () => {
      expect(wrapper.find('.dropdown').classes('collapsed')).toBe(false);
    });
  });

  it('includes query params in urls', () => {
    const wrapper2 = shallowMount(HierarchyCollapsedItems, {
      mocks: {
        $route: {
          query: { language: 'objc' },
        },
      },
      propsData,
      stubs,
    });
    const link = wrapper2.find(RouterLinkStub);
    expect(link.exists()).toBe(true);
    expect(link.props('to')).toBe('/documentation/foo?language=objc');
    expect(link.classes()).toContain('nav-menu-link');
  });
});
