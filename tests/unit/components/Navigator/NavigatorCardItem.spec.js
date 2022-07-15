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
import { waitFrames } from 'docc-render/utils/loading';
import { flushPromises } from '../../../../test-utils';

jest.mock('docc-render/utils/loading');

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
  beforeEach(() => {
    jest.clearAllMocks();
    if (document.activeElement) document.activeElement.blur();
  });
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

  it('renders a beta badge when item is beta', () => {
    let wrapper;
    wrapper = createWrapper();
    expect(wrapper.contains(Badge)).toBe(false);
    wrapper = createWrapper({
      propsData: {
        item: {
          ...defaultProps.item,
          beta: true,
        },
      },
    });
    expect(wrapper.find(Badge).attributes('variant')).toBe('beta');
  });

  it('only renders a deprecated badge when item is both deprecated and beta', () => {
    let wrapper;
    wrapper = createWrapper();
    expect(wrapper.contains(Badge)).toBe(false);
    wrapper = createWrapper({
      propsData: {
        item: {
          ...defaultProps.item,
          beta: true,
          deprecated: true,
        },
      },
    });
    expect(wrapper.find(Badge).attributes('variant')).toBe('deprecated');
    expect(wrapper.findAll(Badge).length).toBe(1);
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

  it('emits a `toggle` event, when clicking the tree-toggle button', () => {
    const wrapper = createWrapper();
    wrapper.find('.tree-toggle').trigger('click');
    expect(wrapper.emitted()).toEqual({ toggle: [[defaultProps.item]] });
  });

  it('emits a `toggle-full` event, when alt + clicking the tree-toggle button', () => {
    const wrapper = createWrapper();
    wrapper.find('.tree-toggle').trigger('click', {
      altKey: true,
    });
    expect(wrapper.emitted()).toEqual({ 'toggle-full': [[defaultProps.item]] });
  });

  it('emits a `toggle-full` event, when @keydown.right + alt/option the tree-toggle button', () => {
    const wrapper = createWrapper();
    wrapper.find('.tree-toggle').trigger('keydown.right', {
      altKey: true,
    });
    expect(wrapper.emitted()).toEqual({ 'toggle-full': [[defaultProps.item]] });
  });

  it('emits a `toggle-siblings` event, when cmd + clicking the tree-toggle button', () => {
    const wrapper = createWrapper();
    wrapper.find('.tree-toggle').trigger('click', {
      metaKey: true,
    });
    expect(wrapper.emitted()).toEqual({ 'toggle-siblings': [[defaultProps.item]] });
  });

  it('adds a temporary `animating` class, on `@toggle`', async () => {
    const wrapper = createWrapper();
    wrapper.find('.tree-toggle').trigger('click');
    expect(wrapper.emitted('toggle')).toEqual([[defaultProps.item]]);
    // assert it adds the animating class
    expect(wrapper.find('.icon-inline').classes()).toContain('animating');
    wrapper.setProps({
      expanded: true,
    });
    expect(wrapper.find('.icon-inline').classes()).toContain('animating');
    await flushPromises();
    // assert we have waited a few frames
    expect(waitFrames).toHaveBeenCalledTimes(1);
    expect(waitFrames).toHaveBeenCalledWith(9);
    expect(wrapper.find('.icon-inline').classes()).not.toContain('animating');
  });

  it('adds a temporary `animating` class, on `@toggle-full` when @keydown.right + alt/option the tree-toggle button', async () => {
    const wrapper = createWrapper();
    wrapper.find('.tree-toggle').trigger('keydown.right', { altKey: true });
    expect(wrapper.emitted('toggle-full')).toEqual([[defaultProps.item]]);
    // assert it adds the animating class
    expect(wrapper.find('.icon-inline').classes()).toContain('animating');
    wrapper.setProps({
      expanded: true,
    });
    expect(wrapper.find('.icon-inline').classes()).toContain('animating');
    await flushPromises();
    // assert we have waited a few frames
    expect(waitFrames).toHaveBeenCalledTimes(1);
    expect(waitFrames).toHaveBeenCalledWith(9);
    expect(wrapper.find('.icon-inline').classes()).not.toContain('animating');
  });

  it('adds a temporary `animating` class, on `@toggle-full` with alt + rightkey', async () => {
    const wrapper = createWrapper();
    wrapper.find('.tree-toggle').trigger('click', { altKey: true });
    expect(wrapper.emitted('toggle-full')).toEqual([[defaultProps.item]]);
    // assert it adds the animating class
    expect(wrapper.find('.icon-inline').classes()).toContain('animating');
    wrapper.setProps({
      expanded: true,
    });
    expect(wrapper.find('.icon-inline').classes()).toContain('animating');
    await flushPromises();
    // assert we have waited a few frames
    expect(waitFrames).toHaveBeenCalledTimes(1);
    expect(waitFrames).toHaveBeenCalledWith(9);
    expect(wrapper.find('.icon-inline').classes()).not.toContain('animating');
  });

  it('adds a temporary `animating` class, on `@toggle-siblings`', async () => {
    const wrapper = createWrapper();
    wrapper.find('.tree-toggle').trigger('click', { metaKey: true });
    expect(wrapper.emitted('toggle-siblings')).toEqual([[defaultProps.item]]);
    // assert it adds the animating class
    expect(wrapper.find('.icon-inline').classes()).toContain('animating');
    wrapper.setProps({ expanded: true });
    expect(wrapper.find('.icon-inline').classes()).toContain('animating');
    await flushPromises();
    // assert we have waited a few frames
    expect(wrapper.find('.icon-inline').classes()).not.toContain('animating');
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

  it('emits a `toggle-full` event, when alt + clicking on the leaf-link', () => {
    const wrapper = createWrapper();
    wrapper.find('.leaf-link').trigger('click', {
      altKey: true,
    });
    expect(wrapper.emitted('toggle-full')).toEqual([[defaultProps.item]]);
  });

  describe('keyboard navigation', () => {
    it('clicks the reference link on `@keydown.enter`', () => {
      const wrapper = createWrapper();
      const spy = jest.spyOn(wrapper.find(Reference).vm.$el, 'click');
      wrapper.trigger('keydown.enter');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('opens children on `@keydown.right`', () => {
      const wrapper = createWrapper();
      wrapper.trigger('keydown.right');
      expect(wrapper.emitted('toggle')).toEqual([[defaultProps.item]]);
    });

    it('does nothing if already open on `@keydown.right`', () => {
      const wrapper = createWrapper({
        propsData: {
          expanded: true,
        },
      });
      wrapper.trigger('keydown.right');
      expect(wrapper.emitted('toggle')).toBeFalsy();
    });

    it('does nothing if has no children, on `@keydown.right`', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            ...defaultProps.item,
            childUIDs: [],
          },
        },
      });
      wrapper.trigger('keydown.right');
      expect(wrapper.emitted('toggle')).toBeFalsy();
    });

    it('closes, on `@keydown.left`, if open', () => {
      const wrapper = createWrapper({
        propsData: {
          expanded: true,
        },
      });
      wrapper.trigger('keydown.left');
      expect(wrapper.emitted('toggle')).toEqual([[defaultProps.item]]);
    });

    it('focuses its parent, on `@keydown.left` if not open', () => {
      const wrapper = createWrapper();
      wrapper.trigger('keydown.left');
      expect(wrapper.emitted('toggle')).toBeFalsy();
      expect(wrapper.emitted('focus-parent')).toEqual([[defaultProps.item]]);
    });
  });

  describe('AX', () => {
    it('applies aria-hidden if isRendered is false', () => {
      const wrapper = createWrapper({
        propsData: {
          isRendered: false,
        },
      });
      expect(wrapper.attributes('aria-hidden')).toBe('true');
    });

    it('does not emit a `navigate` event, if is a groupMarker', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            ...defaultProps.item,
            type: TopicTypes.groupMarker,
          },
        },
      });
      wrapper.find('.leaf-link').trigger('click');
      expect(wrapper.emitted('navigate')).toBeFalsy();
    });

    it('renders a h3 if it is a groupMaker', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            ...defaultProps.item,
            type: TopicTypes.groupMarker,
          },
        },
      });
      expect(wrapper.find('.leaf-link').is('h3')).toBe(true);
    });

    it('does not apply aria-hidden to NavigatorCardItem if isRendered is true', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.navigator-card-item').attributes('aria-hidden')).toBeFalsy();
    });

    it('renders a hidden span telling how to use the key arrows', () => {
      const wrapper = createWrapper();
      const label = wrapper.find(`#usage-${defaultProps.item.uid}`);
      expect(label.attributes('hidden')).toBe('hidden');
      expect(label.text())
        .toBe('To navigate the symbols, press Up Arrow, Down Arrow, Left Arrow or Right Arrow');
    });

    it('renders tabindex 0 on link when element is focused', () => {
      const wrapper = createWrapper({
        propsData: {
          isFocused: true,
        },
      });
      expect(wrapper.find('.leaf-link').attributes('tabindex')).toBe('0');
    });

    it('renders tabindex -1 in button and reference', () => {
      const wrapper = createWrapper();
      const button = wrapper.find('.tree-toggle');
      expect(button.attributes('tabindex')).toBe('-1');
      const link = wrapper.find('.leaf-link');
      expect(link.attributes('tabindex')).toBe('-1');
    });

    it('renders aria tags in button', () => {
      const wrapper = createWrapper();
      const btn = wrapper.find('.tree-toggle');
      expect(btn.attributes('tabindex')).toBe('-1');
      expect(btn.attributes('aria-expanded')).toBe('false');
      expect(btn.attributes('tabindex')).toBe('-1');
      expect(btn.attributes('aria-labelledby')).toBe(`${defaultProps.item.uid}`);
      expect(btn.attributes('aria-describedby'))
        .toBe(`label-${defaultProps.item.uid} Foo label-parent-${defaultProps.item.uid}`);
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

    it('renders a aria-describedby without parent label if it is not a parent', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            ...defaultProps.item,
            childUIDs: [],
          },
        },
      });
      expect(wrapper.find('.leaf-link').attributes('aria-describedby'))
        .toBe(`label-${defaultProps.item.uid} Foo usage-${defaultProps.item.uid}`);
    });

    it('focuses its link, if `isFocused`, `isRendered` and `enableFocus` is `true`', async () => {
      const wrapper = createWrapper({
        propsData: {
          isFocused: false,
          isRendered: true,
          enableFocus: false,
        },
      });
      await flushPromises();
      expect(document.activeElement).not.toEqual(wrapper.element);
      wrapper.setProps({
        isFocused: true,
        enableFocus: true,
      });
      await flushPromises();
      expect(waitFrames).toHaveBeenCalledTimes(1);
      expect(waitFrames).toHaveBeenCalledWith(8);
      const leafLink = wrapper.find('.leaf-link');
      expect(document.activeElement).toEqual(leafLink.element);
    });

    it('does not focus itself, if `isRendered` or `enableFocus` are `false`', async () => {
      const wrapper = createWrapper({
        propsData: {
          isFocused: false,
          isRendered: true,
          enableFocus: false,
        },
      });
      await flushPromises();
      expect(document.activeElement).not.toEqual(wrapper.element);
      wrapper.setProps({ isFocused: true });
      await flushPromises();
      expect(waitFrames).toHaveBeenCalledTimes(1);
      expect(waitFrames).toHaveBeenCalledWith(8);
      expect(document.activeElement).not.toEqual(wrapper.element);
    });
  });
});
