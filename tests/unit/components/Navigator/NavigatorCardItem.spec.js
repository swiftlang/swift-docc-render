/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NavigatorCardItem from '@/components/Navigator/NavigatorCardItem.vue';
import { RouterLinkStub, shallowMount } from '@vue/test-utils';
import { TopicTypes } from '@/constants/TopicTypes';
import NavigatorLeafIcon from '@/components/Navigator/NavigatorLeafIcon.vue';
import HighlightMatches from '@/components/Navigator/HighlightMatches.vue';
import Reference from '@/components/ContentNode/Reference.vue';

const {
  Badge,
} = NavigatorCardItem.components;

const defaultProps = {
  item: {
    depth: 2,
    type: TopicTypes.func,
    childUIDs: [1, 2, 3],
    path: '/path/to/foo',
    title: 'Foo Item',
    abstract: [{ type: 'text', text: 'abstract' }],
    uid: 1,
    siblingsCount: 5,
    parent: 'Foo',
    deprecated: false,
  },
  expanded: false,
  filterPattern: /foo/gi,
  isActive: false,
  isRendered: true,
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
    expect(wrapper.find(NavigatorLeafIcon).props('type')).toBe(defaultProps.item.type);
    const leafLink = wrapper.find('.leaf-link');
    expect(leafLink.is(Reference)).toBe(true);
    expect(leafLink.props('url')).toEqual(defaultProps.item.path);
    expect(leafLink.attributes('id')).toBe(`${defaultProps.item.uid}`);
    expect(wrapper.find(HighlightMatches).props()).toEqual({
      text: defaultProps.item.title,
      matcher: defaultProps.filterPattern,
    });
    expect(wrapper.find('.navigator-card-item').attributes('id'))
      .toBe(`container-${defaultProps.item.uid}`);
  });

  it('renders a deprecated badge when item is deprecated', () => {
    let wrapper;
    wrapper = createWrapper();
    expect(wrapper.contains(Badge)).toBe(false);
    wrapper = createWrapper({
      propsData: {
        item: {
          ...defaultProps.item,
          deprecated: true,
        },
      },
    });
    expect(wrapper.find(Badge).attributes('variant')).toBe('deprecated');
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

  it('renders the API change icon instead of the leaf icon', () => {
    const wrapper = createWrapper({
      propsData: {
        apiChange: 'modified',
      },
    });

    expect(wrapper.find(NavigatorLeafIcon).exists()).toBe(false);
    expect(wrapper.find('.navigator-icon').classes())
      .toEqual(expect.arrayContaining(['changed', 'changed-modified']));
  });

  it('emits an event, when clicking on the leaf-link', () => {
    const wrapper = createWrapper();
    wrapper.find('.leaf-link').trigger('click');
    expect(wrapper.emitted('navigate')).toEqual([[defaultProps.item.uid]]);
  });

  describe('AX', () => {
    it('applies aria-hidden to NavigatorCardItem if isRendered is false', () => {
      const wrapper = createWrapper({
        propsData: {
          isRendered: false,
        },
      });
      expect(wrapper.find('.navigator-card-item').attributes('aria-hidden')).toBe('true');
    });

    it('does not apply aria-hidden to NavigatorCardItem if isRendered is true', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.navigator-card-item').attributes('aria-hidden')).toBeFalsy();
    });

    it('renders a hidden span telling the number of symbols to be expanded', () => {
      const wrapper = createWrapper();
      const label = wrapper.find(`#button-parent-${defaultProps.item.uid}`);
      expect(label.attributes('hidden')).toBe('hidden');
      expect(label.text()).toBe(`${defaultProps.item.childUIDs.length} symbols to be expanded`);
    });

    it('renders a hidden span telling the number of symbols to be collapsed', () => {
      const wrapper = createWrapper({
        propsData: {
          expanded: true,
        },
      });
      const label = wrapper.find(`#button-parent-${defaultProps.item.uid}`);
      expect(label.attributes('hidden')).toBe('hidden');
      expect(label.text()).toBe(`${defaultProps.item.childUIDs.length} symbols to be collapsed`);
    });

    it('renders aria tags to describe button', () => {
      const wrapper = createWrapper();
      const button = wrapper.find('.tree-toggle');
      expect(button.attributes('aria-label')).toBe(`Toggle ${defaultProps.item.title}`);
      expect(button.attributes('aria-controls')).toBe(`container-${defaultProps.item.uid}`);
      expect(button.attributes('aria-expanded')).toBe('false');
      expect(button.attributes('tabindex')).toBeFalsy();
      expect(button.attributes('aria-describedby')).toBe(`button-parent-${defaultProps.item.uid}`);
    });

    it('renders tabindex -1 in button when component is not rendered', () => {
      const wrapper = createWrapper({
        propsData: {
          isRendered: false,
        },
      });
      expect(wrapper.find('.tree-toggle').attributes('tabindex')).toBe('-1');
    });

    it('renders aria-expanded true in button when component is expanded', () => {
      const wrapper = createWrapper({
        propsData: {
          expanded: true,
        },
      });
      expect(wrapper.find('.tree-toggle').attributes('aria-expanded')).toBe('true');
    });

    it('renders a hidden span telling the user the position of a symbol', () => {
      const wrapper = createWrapper();
      const label = wrapper.find(`#label-${defaultProps.item.uid}`);
      expect(label.attributes('hidden')).toBe('hidden');
      expect(label.text())
        .toBe(`${defaultProps.item.index + 1} of ${defaultProps.item.siblingsCount} symbols inside`);
    });

    it('renders a hidden span telling the containing number of symbols', () => {
      const wrapper = createWrapper();
      const label = wrapper.find(`#label-parent-${defaultProps.item.uid}`);
      expect(label.attributes('hidden')).toBe('hidden');
      expect(label.text()).toBe(`, containing ${defaultProps.item.childUIDs.length} symbols`);
    });

    it('renders a aria-describedby in the leaf-link', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            ...defaultProps.item,
            childUIDs: [],
          },
        },
      });
      expect(wrapper.find('.leaf-link').attributes('aria-describedby'))
        .toBe(`label-${defaultProps.item.uid} ${defaultProps.item.parent}`);
    });

    it('renders a aria-describedby in the leaf-link including the parent label if is parent', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.leaf-link').attributes('aria-describedby'))
        .toBe(`label-${defaultProps.item.uid} ${defaultProps.item.parent} label-parent-${defaultProps.item.uid}`);
    });
  });
});
