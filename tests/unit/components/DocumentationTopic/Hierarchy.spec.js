/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Hierarchy from 'docc-render/components/DocumentationTopic/DocumentationNav/Hierarchy.vue';
import Badge from 'docc-render/components/Badge.vue';

const {
  HierarchyCollapsedItems,
  HierarchyItem,
  NavMenuItems,
} = Hierarchy.components;

const foo = {
  identifier: 'topic://foo',
  title: 'Foo',
  url: '/documentation/foo',
};
const bar = {
  identifier: 'topic://foo/bar',
  title: 'Bar',
  url: '/documentation/foo/bar',
};
const baz = {
  identifier: 'topic://foo/bar/baz/',
  title: 'Baz',
  url: '/documentation/foo/bar/baz',
};

const qux = {
  identifier: 'topic://foo/bar/baz/qux',
  title: 'Qux',
  url: '/documentation/foo/bar/baz/qux',
};

const references = {
  [foo.identifier]: foo,
  [bar.identifier]: bar,
  [baz.identifier]: baz,
  [qux.identifier]: qux,
};

const mountWithProps = propsData => shallowMount(Hierarchy, {
  propsData: {
    ...propsData,
    references,
  },
  stubs: {
    Badge,
  },
  mocks: {
    $route: {
      query: { language: 'objc' },
    },
  },
});

// Currently (as of `@vue/test-utils ^1.0.0-beta.20`), the `.props()` function
// does not work with functional components like `HierarchyItem` wrappers.
// The `.attributes()` function is used as a workaround here, although it
// returns downcased attribute names for the props. This may change and require
// updates in the future with newer versions of the test utils library.

describe('Hierarchy', () => {
  it('renders a list of uncollapsed `HierarchyItem`s', () => {
    const wrapper = mountWithProps({
      currentTopicTitle: baz.title,
      parentTopicIdentifiers: [
        foo.identifier,
        bar.identifier,
      ],
    });

    const list = wrapper.find(NavMenuItems);
    expect(list.exists()).toBe(true);

    const items = list.findAll(HierarchyItem);
    expect(items.length).toBe(3);

    [foo, bar].forEach((topic, idx) => {
      const item = items.at(idx);
      expect(item.attributes()).toEqual({
        url: `${topic.url}?language=objc`,
      });
      expect(item.text()).toBe(topic.title);
    });

    const currentItem = items.at(items.length - 1);
    expect(currentItem.attributes()).toEqual({
      url: undefined,
    });
    expect(currentItem.text()).toBe(baz.title);

    expect(wrapper.contains(HierarchyCollapsedItems)).toBe(false);
  });

  describe('with more than 3 hierarchy items', () => {
    it('renders a list with all items collapsed except for last 2', () => {
      const wrapper = mountWithProps({
        currentTopicTitle: qux.title,
        parentTopicIdentifiers: [
          foo.identifier,
          bar.identifier,
          baz.identifier,
        ],
      });

      const list = wrapper.find(NavMenuItems);
      expect(list.exists()).toBe(true);

      const items = list.findAll(HierarchyItem);
      expect(items.length).toBe(4);

      [foo, bar].forEach((topic, idx) => {
        const item = items.at(idx);
        expect(item.attributes()).toEqual({
          iscollapsed: 'true',
          url: `${topic.url}?language=objc`,
        });
        expect(item.text()).toBe(topic.title);
      });

      const lastParentItem = items.at(items.length - 2);
      expect(lastParentItem.attributes()).toEqual({
        url: `${baz.url}?language=objc`,
      });
      expect(lastParentItem.text()).toBe(baz.title);

      const currentItem = items.at(items.length - 1);
      expect(currentItem.attributes()).toEqual({
        url: undefined,
      });
      expect(currentItem.text()).toBe(qux.title);

      const collapsedItems = wrapper.find(HierarchyCollapsedItems);
      expect(collapsedItems.exists()).toBe(true);
      expect(collapsedItems.props('topics')).toEqual([
        {
          title: foo.title,
          url: foo.url,
        },
        {
          title: bar.title,
          url: bar.url,
        },
      ]);
    });
  });

  it('renders a beta badge', () => {
    const wrapper = mountWithProps({
      currentTopicTitle: 'Foo',
      parentTopicIdentifiers: [],
      isSymbolBeta: true,
    });
    expect(wrapper.find(Badge).props('variant')).toBe('beta');
  });

  it('renders tags in the last HierarchyItem', () => {
    const wrapper = mountWithProps({
      currentTopicTitle: 'Foo',
      parentTopicIdentifiers: [
        foo.identifier,
        bar.identifier,
      ],
      isSymbolDeprecated: true,
      isSymbolBeta: false,
      currentTopicTags: [{
        type: 'foo',
        text: 'Foo',
      }, {
        type: 'custom',
      }],
    });

    const HierarchyItems = wrapper.findAll(HierarchyItem);
    // The badges are rendered inside the last HierarchyItem slot
    const badges = HierarchyItems.at(HierarchyItems.length - 1).findAll(Badge);
    expect(badges).toHaveLength(3);
    expect(badges.at(0).props('variant')).toBe('deprecated');
    expect(badges.at(0).text()).toBe('Deprecated');
    expect(badges.at(1).props('variant')).toBe('foo');
    expect(badges.at(1).text()).toBe('Foo');
    expect(badges.at(2).props('variant')).toBe('custom');
    expect(badges.at(2).text()).toBe('');
  });
});
