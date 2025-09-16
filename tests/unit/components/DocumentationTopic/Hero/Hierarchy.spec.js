/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Hierarchy from 'docc-render/components/DocumentationTopic/Hero/Hierarchy.vue';
import Badge from 'docc-render/components/Badge.vue';
import Vue from 'vue';

const {
  HierarchyCollapsedItems,
  HierarchyItem,
  NavMenuItems,
} = Hierarchy.components;

const foo = {
  title: 'Foo',
  url: '/documentation/foo',
};
const bar = {
  title: 'Bar',
  url: '/documentation/foo/bar',
};
const baz = {
  title: 'Baz',
  url: '/documentation/foo/bar/baz',
};
const baq = {
  title: 'Baq',
  url: '/documentation/foo/bar/baz/baq',
};

const baw = {
  title: 'Baw',
  url: '/documentation/foo/bar/baz/baq/baw',
};

const qux = {
  title: 'Qux',
  url: '/documentation/foo/bar/baz/qux',
};

const currentPath = '/foo';

const store = Vue.observable({
  state: {
    contentWidth: 1800,
  },
});

function changeSize(size) {
  store.state.contentWidth = size;
}

const mountWithProps = ({ propsData, ...others } = {}) => shallowMount(Hierarchy, {
  propsData: {
    ...propsData,
  },
  stubs: {
    Badge,
  },
  mocks: {
    $route: {
      name: 'foo',
      path: '/foo',
      query: { language: 'objc' },
    },
  },
  provide: {
    store,
  },
  ...others,
});

// Currently (as of `@vue/test-utils ^1.0.0-beta.20`), the `.props()` function
// does not work with functional components like `HierarchyItem` wrappers.
// The `.attributes()` function is used as a workaround here, although it
// returns downcased attribute names for the props. This may change and require
// updates in the future with newer versions of the test utils library.

describe('Hierarchy', () => {
  it('renders a list of uncollapsed `HierarchyItem`s, with the first one having an explicit class', () => {
    const wrapper = mountWithProps({
      propsData: {
        currentTopicTitle: baz.title,
        parentTopics: [
          foo,
          bar,
        ],
      },
    });

    const list = wrapper.findComponent(NavMenuItems);
    expect(list.exists()).toBe(true);

    const items = list.findAll(HierarchyItem);
    expect(items.length).toBe(3);

    const fooItem = items.at(0);
    expect(fooItem.attributes('url')).toEqual(`${foo.url}?language=objc`);
    expect(fooItem.classes()).toContain('root-hierarchy');
    expect(fooItem.text()).toBe(foo.title);

    const barItem = items.at(1);
    expect(barItem.attributes('url')).toEqual(`${bar.url}?language=objc`);
    expect(barItem.classes()).not.toContain('root-hierarchy');
    expect(barItem.text()).toBe(bar.title);

    const currentItem = items.at(items.length - 1);
    expect(currentItem.attributes()).toEqual({});
    expect(currentItem.text()).toBe(baz.title);

    expect(wrapper.findComponent(HierarchyCollapsedItems).exists()).toBe(false);
  });

  describe('with more than 3 hierarchy items', () => {
    const parentTopics = [
      foo,
      bar,
      baz,
      baq,
      baw,
    ];
    let wrapper;
    beforeEach(() => {
      wrapper = mountWithProps({
        propsData: {
          currentTopicTitle: qux.title,
          parentTopics,
        },
        mocks: {
          $route: {
            name: 'foo',
            path: currentPath,
            query: {},
          },
        },
      });
    });
    afterEach(() => {
      wrapper.destroy();
    });

    describe('without tags', () => {
      it('renders a list with `root + 1 collapsed + max 3 items`, above 1200px', () => {
        const list = wrapper.findComponent(NavMenuItems);
        expect(list.exists()).toBe(true);

        const items = list.findAll(HierarchyItem);
        // all parentTopicIdentifiers + the last item
        expect(items.length).toBe(parentTopics.length + 1);

        // assert what items are shown
        // assert root item
        expect(items.at(0).attributes('url')).toEqual(parentTopics[0].url);
        expect(items.at(0).attributes('iscollapsed')).toBeFalsy();
        expect(items.at(0).classes()).toContain('root-hierarchy');

        // next assert the collapsible items. Only one, as 3 can live outside at 1200
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[1].url,
        });
        // assert the items outside of the collapse
        expect(items.at(2).attributes()).toEqual({
          url: parentTopics[2].url,
        });
        expect(items.at(3).attributes()).toEqual({
          url: parentTopics[3].url,
        });
        expect(items.at(4).attributes()).toEqual({
          url: parentTopics[4].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.findComponent(HierarchyCollapsedItems);
        expect(collapsedItems.exists()).toBe(true);
        expect(collapsedItems.props('topics')).toEqual([
          {
            title: bar.title,
            url: bar.url,
          },
        ]);
      });

      it('renders a list with `root + 2 collapsed + max 2 items`, between 1000 and 1200px', async () => {
        changeSize(1100);
        await wrapper.vm.$nextTick();
        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert root item
        expect(items.at(0).attributes('url')).toEqual(parentTopics[0].url);
        expect(items.at(0).classes()).toContain('root-hierarchy');

        // assert the collapsible items. Two collapsed, as 2 can live outside between 1000 - 1200
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[1].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[2].url,
        });
        // assert the items outside of the collapse
        expect(items.at(3).attributes()).toEqual({
          url: parentTopics[3].url,
        });
        expect(items.at(4).attributes()).toEqual({
          url: parentTopics[4].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.findComponent(HierarchyCollapsedItems);
        expect(collapsedItems.exists()).toBe(true);
        expect(collapsedItems.props('topics')).toEqual([
          {
            title: bar.title,
            url: bar.url,
          },
          {
            title: baz.title,
            url: baz.url,
          },
        ]);
      });

      it('renders a list with `3 collapsed + max 1 item`, between 735 and 1000px', async () => {
        changeSize(900);
        await wrapper.vm.$nextTick();
        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert there is no root item
        expect(items.at(0).attributes()).toEqual({
          class: 'root-hierarchy',
          url: parentTopics[0].url,
        });

        // next assert the collapsible items. 3, as 1 can live between 735 and 1000
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[1].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[2].url,
        });
        expect(items.at(3).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[3].url,
        });
        // assert the items outside of the collapse
        expect(items.at(4).attributes()).toEqual({
          url: parentTopics[4].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.findComponent(HierarchyCollapsedItems);
        expect(collapsedItems.exists()).toBe(true);
        expect(collapsedItems.props('topics')).toEqual([
          {
            title: bar.title,
            url: bar.url,
          },
          {
            title: baz.title,
            url: baz.url,
          },
          {
            title: baq.title,
            url: baq.url,
          },
        ]);
      });

      it('renders a list with `5 collapsed and no external links`, below 735', async () => {
        changeSize(720);
        await wrapper.vm.$nextTick();
        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert there is no root item
        expect(items.at(0).attributes()).toEqual({
          class: 'root-hierarchy',
          url: parentTopics[0].url,
        });

        // next assert the collapsible items. 5, as 0 can live outside below 735
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[1].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[2].url,
        });
        expect(items.at(3).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[3].url,
        });
        expect(items.at(4).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[4].url,
        });
        expect(items.at(5).attributes()).toEqual({
          iscollapsed: 'true',
          url: currentPath,
        });

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.findComponent(HierarchyCollapsedItems);
        expect(collapsedItems.exists()).toBe(true);
        expect(collapsedItems.props('topics')).toEqual([
          {
            title: bar.title,
            url: bar.url,
          },
          {
            title: baz.title,
            url: baz.url,
          },
          {
            title: baq.title,
            url: baq.url,
          },
          {
            title: baw.title,
            url: baw.url,
          },
          {
            title: qux.title,
            url: currentPath,
          },
        ]);
      });
    });

    describe('with tags', () => {
      it('renders a list with `root + 2 collapsed + max 2 items`, with tags above 1200px', async () => {
        changeSize(1250);
        await wrapper.setProps({
          isSymbolBeta: true,
        });
        const list = wrapper.findComponent(NavMenuItems);
        expect(list.exists()).toBe(true);

        const items = list.findAll(HierarchyItem);
        // all parentTopicIdentifiers + the last item
        expect(items.length).toBe(parentTopics.length + 1);

        // assert what items are shown
        // assert root item
        expect(items.at(0).attributes('url')).toEqual(parentTopics[0].url);
        expect(items.at(0).attributes('iscollapsed')).toBeFalsy();
        expect(items.at(0).classes()).toContain('root-hierarchy');

        // next assert the collapsible items. Two, as 2 can live outside at 1200 with tags
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[1].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[2].url,
        });
        // assert the items outside of the collapse
        expect(items.at(3).attributes()).toEqual({
          url: parentTopics[3].url,
        });
        expect(items.at(4).attributes()).toEqual({
          url: parentTopics[4].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.findComponent(HierarchyCollapsedItems);
        expect(collapsedItems.exists()).toBe(true);
        expect(collapsedItems.props('topics')).toEqual([
          {
            title: bar.title,
            url: bar.url,
          },
          {
            title: baz.title,
            url: baz.url,
          },
        ]);
      });

      it('renders a list with `root + 3 collapsed + max 1 item`, with tags, between 1000 and 1200px', async () => {
        changeSize(1200);
        await wrapper.setProps({
          isSymbolBeta: true,
        });

        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert root item
        expect(items.at(0).attributes('url')).toEqual(parentTopics[0].url);
        expect(items.at(0).classes()).toContain('root-hierarchy');

        // assert the collapsible items. 3 collapsed, as 1 can live outside between 1000 - 1200
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[1].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[2].url,
        });
        expect(items.at(3).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[3].url,
        });
        // assert the items outside of the collapse
        expect(items.at(4).attributes()).toEqual({
          url: parentTopics[4].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.findComponent(HierarchyCollapsedItems);
        expect(collapsedItems.exists()).toBe(true);
        expect(collapsedItems.props('topics')).toEqual([
          {
            title: bar.title,
            url: bar.url,
          },
          {
            title: baz.title,
            url: baz.url,
          },
          {
            title: baq.title,
            url: baq.url,
          },
        ]);
      });

      it('renders a list with `5 collapsed and no external`, with tags, between 735 and 1000px', async () => {
        changeSize(900);
        await wrapper.setProps({
          isSymbolBeta: true,
        });

        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert there is no root item
        expect(items.at(0).attributes()).toEqual({
          class: 'root-hierarchy',
          url: parentTopics[0].url,
        });
        // next assert the collapsible items. 3, as 1 can live between 735 and 1000
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[1].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[2].url,
        });
        expect(items.at(3).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[3].url,
        });
        expect(items.at(4).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[4].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.findComponent(HierarchyCollapsedItems);
        expect(collapsedItems.exists()).toBe(true);
        expect(collapsedItems.props('topics')).toEqual([
          {
            title: bar.title,
            url: bar.url,
          },
          {
            title: baz.title,
            url: baz.url,
          },
          {
            title: baq.title,
            url: baq.url,
          },
          {
            title: baw.title,
            url: baw.url,
          },
        ]);
      });

      it('renders a list with `5 collapsed and no external`,with tags below 735', async () => {
        changeSize(700);
        await wrapper.setProps({
          isSymbolBeta: true,
        });

        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert there is no root item
        expect(items.at(0).attributes()).toEqual({
          class: 'root-hierarchy',
          url: parentTopics[0].url,
        });

        // next assert the collapsible items. 3, as 1 can live between 735 and 1000
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[1].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[2].url,
        });
        expect(items.at(3).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[3].url,
        });
        expect(items.at(4).attributes()).toEqual({
          iscollapsed: 'true',
          url: parentTopics[4].url,
        });
        expect(items.at(5).attributes()).toEqual({
          iscollapsed: 'true',
          url: currentPath,
        });

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.findComponent(HierarchyCollapsedItems);
        expect(collapsedItems.exists()).toBe(true);
        expect(collapsedItems.props('topics')).toEqual([
          {
            title: bar.title,
            url: bar.url,
          },
          {
            title: baz.title,
            url: baz.url,
          },
          {
            title: baq.title,
            url: baq.url,
          },
          {
            title: baw.title,
            url: baw.url,
          },
          {
            title: qux.title,
            url: currentPath,
          },
        ]);
      });
    });
  });

  it('renders a beta badge', () => {
    changeSize(1250);
    const wrapper = mountWithProps({
      propsData: {
        currentTopicTitle: 'Foo',
        parentTopicIdentifiers: [],
        isSymbolBeta: true,
      },
      stubs: {
        HierarchyItem,
      },
    });
    expect(wrapper.findComponent(Badge).props('variant')).toBe('beta');
  });

  it('renders tags in the last HierarchyItem', () => {
    const wrapper = mountWithProps({
      propsData: {
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
      },
      stubs: {
        HierarchyItem,
        Badge,
      },
    });

    const HierarchyItems = wrapper.findAll(HierarchyItem);
    // The badges are rendered inside the last HierarchyItem slot
    const badges = HierarchyItems.at(HierarchyItems.length - 1).findAll(Badge);
    expect(badges).toHaveLength(3);
    expect(badges.at(0).props('variant')).toBe('deprecated');
    expect(badges.at(0).text()).toBe('aside-kind.deprecated');
    expect(badges.at(1).props('variant')).toBe('foo');
    expect(badges.at(1).text()).toBe('Foo');
    expect(badges.at(2).props('variant')).toBe('custom');
    expect(badges.at(2).text()).toBe('');
  });
});
