/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NavigatorCardItem from '@/components/Navigator/NavigatorCardItem.vue';
import { RouterLinkStub, shallowMount } from '@vue/test-utils';
import { TopicKind } from '@/constants/kinds';
import NavigatorLeafIcon from '@/components/Navigator/NavigatorLeafIcon.vue';
import HighlightMatches from '@/components/Navigator/HighlightMatches.vue';

const defaultProps = {
  item: {
    depth: 2,
    kind: TopicKind.func,
    childUIDs: [1, 2, 3],
    path: '/path/to/foo',
    title: 'Foo Item',
    abstract: [{ type: 'text', text: 'abstract' }],
  },
  expanded: false,
  showExtendedInfo: false,
  filterPattern: /foo/gi,
  isActive: false,
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(NavigatorCardItem, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  stubs: {
    RouterLink: RouterLinkStub,
  },
  ...others,
});

describe('NavigatorCardItem', () => {
  it('renders the NavigatorCardItem', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.navigator-card-item').exists()).toBe(true);
    expect(wrapper.find('button.tree-toggle').exists()).toBe(true);
    expect(wrapper.find(NavigatorLeafIcon).props('kind')).toBe(defaultProps.item.kind);
    expect(wrapper.find('.leaf-link').props('url')).toEqual(defaultProps.item.path);
    expect(wrapper.find(HighlightMatches).props()).toEqual({
      text: defaultProps.item.title,
      matcher: defaultProps.filterPattern,
    });
    expect(wrapper.find('.extended-content').props('content')).toEqual(defaultProps.item.abstract);
  });

  it('does not render the expand button, if has no children', () => {
    const wrapper = createWrapper({
      propsData: {
        item: {
          ...defaultProps.item,
          childUIDs: [],
        },
      },
    });
    expect(wrapper.find('.tree-toggle').exists()).toBe(false);
  });

  it('adds extra classes when expanded', () => {
    const wrapper = createWrapper({
      propsData: {
        expanded: true,
      },
    });
    expect(wrapper.classes()).toContain('expanded');
    expect(wrapper.find('.chevron').classes()).toContain('rotate');
  });

  it('adds extra classes, when `showExtendedInfo == true`', () => {
    const wrapper = createWrapper({
      propsData: {
        showExtendedInfo: true,
      },
    });
    expect(wrapper.classes()).toContain('extra-info');
  });

  it('adds extra classes when active', () => {
    const wrapper = createWrapper({
      propsData: {
        isActive: true,
      },
    });
    expect(wrapper.find('.head-wrapper').classes()).toContain('active');
  });

  it('adds extra classes, when bolded', () => {
    const wrapper = createWrapper({
      propsData: {
        isBold: true,
      },
    });
    expect(wrapper.find('.leaf-link').classes()).toContain('bolded');
  });

  it('does not render the ContentNode, if no abstract', () => {
    const wrapper = createWrapper({
      propsData: {
        item: {
          ...defaultProps.item,
          abstract: null,
        },
      },
    });
    expect(wrapper.find('.extended-content').exists()).toBe(false);
  });

  it('emits an even, when clicking the tree-toggle button', () => {
    const wrapper = createWrapper();
    wrapper.find('.tree-toggle').trigger('click');
    expect(wrapper.emitted('toggle')).toEqual([[defaultProps.item]]);
  });
});
