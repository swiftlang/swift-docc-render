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
import Vue from 'vue';

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
const baq = {
  identifier: 'topic://foo/bar/baz/baq/',
  title: 'Baq',
  url: '/documentation/foo/bar/baz/baq',
};

const baw = {
  identifier: 'topic://foo/bar/baz/baq/baw/',
  title: 'Baw',
  url: '/documentation/foo/bar/baz/baq/baw',
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
  [baq.identifier]: baq,
  [baw.identifier]: baw,
  [qux.identifier]: qux,
};

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
    references,
    ...propsData,
  },
  stubs: {
    Badge,
  },
  mocks: {
    $route: {
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
        parentTopicIdentifiers: [
          foo.identifier,
          bar.identifier,
        ],
      },
    });

    const list = wrapper.find(NavMenuItems);
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
    expect(currentItem.attributes()).toEqual({
      url: undefined,
    });
    expect(currentItem.text()).toBe(baz.title);

    expect(wrapper.contains(HierarchyCollapsedItems)).toBe(false);
  });

  it('continues working, if a reference is missing', () => {
    const errorSpy = jest.spyOn(console, 'error').mockReturnValue('');
    const wrapper = mountWithProps({
      propsData: {
        currentTopicTitle: baz.title,
        parentTopicIdentifiers: [
          foo.identifier,
          bar.identifier,
        ],
        references: {
          // include only one ref
          [bar.identifier]: foo,
        },
      },
    });

    const list = wrapper.find(NavMenuItems);
    expect(list.exists()).toBe(true);

    const items = list.findAll(HierarchyItem);
    // assert that the invalid item is not rendered
    expect(items.length).toBe(2);
    expect(items.at(0).text()).toBe(foo.title);
    expect(items.at(1).text()).toBe(baz.title);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(`Reference for "${foo.identifier}" is missing`);
  });

  describe('with more than 3 hierarchy items', () => {
    const parentTopicIdentifiers = [
      foo.identifier,
      bar.identifier,
      baz.identifier,
      baq.identifier,
      baw.identifier,
    ];
    let wrapper;
    beforeEach(() => {
      wrapper = mountWithProps({
        propsData: {
          currentTopicTitle: qux.title,
          parentTopicIdentifiers,
        },
        mocks: {
          $route: {
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
        const list = wrapper.find(NavMenuItems);
        expect(list.exists()).toBe(true);

        const items = list.findAll(HierarchyItem);
        // all parentTopicIdentifiers + the last item
        expect(items.length).toBe(parentTopicIdentifiers.length + 1);

        // assert what items are shown
        // assert root item
        expect(items.at(0).attributes('url')).toEqual(references[parentTopicIdentifiers[0]].url);
        expect(items.at(0).attributes('iscollapsed')).toBeFalsy();
        expect(items.at(0).classes()).toContain('root-hierarchy');

        // next assert the collapsible items. Only one, as 3 can live outside at 1200
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[1]].url,
        });
        // assert the items outside of the collapse
        expect(items.at(2).attributes()).toEqual({
          url: references[parentTopicIdentifiers[2]].url,
        });
        expect(items.at(3).attributes()).toEqual({
          url: references[parentTopicIdentifiers[3]].url,
        });
        expect(items.at(4).attributes()).toEqual({
          url: references[parentTopicIdentifiers[4]].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.find(HierarchyCollapsedItems);
        expect(collapsedItems.exists()).toBe(true);
        expect(collapsedItems.props('topics')).toEqual([
          {
            title: bar.title,
            url: bar.url,
          },
        ]);
      });

      it('renders a list with `root + 2 collapsed + max 2 items`, between 1000 and 1200px', () => {
        changeSize(1100);

        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert root item
        expect(items.at(0).attributes('url')).toEqual(references[parentTopicIdentifiers[0]].url);
        expect(items.at(0).classes()).toContain('root-hierarchy');

        // assert the collapsible items. Two collapsed, as 2 can live outside between 1000 - 1200
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[1]].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[2]].url,
        });
        // assert the items outside of the collapse
        expect(items.at(3).attributes()).toEqual({
          url: references[parentTopicIdentifiers[3]].url,
        });
        expect(items.at(4).attributes()).toEqual({
          url: references[parentTopicIdentifiers[4]].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.find(HierarchyCollapsedItems);
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

      it('renders a list with `3 collapsed + max 1 item`, between 800 and 1000px', () => {
        changeSize(900);
        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert there is no root item
        expect(items.at(0).attributes()).toEqual({
          url: references[parentTopicIdentifiers[0]].url,
          iscollapsed: 'true',
        });
        expect(items.at(0).classes()).not.toContain('root-hierarchy');

        // next assert the collapsible items. 3, as 1 can live between 800 and 1000
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[1]].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[2]].url,
        });
        expect(items.at(3).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[3]].url,
        });
        // assert the items outside of the collapse
        expect(items.at(4).attributes()).toEqual({
          url: references[parentTopicIdentifiers[4]].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
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

      it('renders a list with `4 collapsed and no external links`, below 800', () => {
        changeSize(750);
        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert there is no root item
        expect(items.at(0).attributes()).toEqual({
          url: references[parentTopicIdentifiers[0]].url,
          iscollapsed: 'true',
        });
        expect(items.at(0).classes()).not.toContain('root-hierarchy');

        // next assert the collapsible items. 4, as 0 can live outside below 800
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[1]].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[2]].url,
        });
        expect(items.at(3).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[3]].url,
        });
        expect(items.at(4).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[4]].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
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
    });

    describe('with tags', () => {
      it('renders a list with `root + 2 collapsed + max 2 items`, with tags above 1200px', () => {
        changeSize(1250);
        wrapper.setProps({
          isSymbolBeta: true,
        });
        const list = wrapper.find(NavMenuItems);
        expect(list.exists()).toBe(true);

        const items = list.findAll(HierarchyItem);
        // all parentTopicIdentifiers + the last item
        expect(items.length).toBe(parentTopicIdentifiers.length + 1);

        // assert what items are shown
        // assert root item
        expect(items.at(0).attributes('url')).toEqual(references[parentTopicIdentifiers[0]].url);
        expect(items.at(0).attributes('iscollapsed')).toBeFalsy();
        expect(items.at(0).classes()).toContain('root-hierarchy');

        // next assert the collapsible items. Two, as 2 can live outside at 1200 with tags
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[1]].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[2]].url,
        });
        // assert the items outside of the collapse
        expect(items.at(3).attributes()).toEqual({
          url: references[parentTopicIdentifiers[3]].url,
        });
        expect(items.at(4).attributes()).toEqual({
          url: references[parentTopicIdentifiers[4]].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.find(HierarchyCollapsedItems);
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

      it('renders a list with `root + 3 collapsed + max 1 item`, with tags, between 1000 and 1200px', () => {
        changeSize(1200);
        wrapper.setProps({
          isSymbolBeta: true,
        });

        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert root item
        expect(items.at(0).attributes('url')).toEqual(references[parentTopicIdentifiers[0]].url);
        expect(items.at(0).classes()).toContain('root-hierarchy');

        // assert the collapsible items. 3 collapsed, as 1 can live outside between 1000 - 1200
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[1]].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[2]].url,
        });
        expect(items.at(3).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[3]].url,
        });
        // assert the items outside of the collapse
        expect(items.at(4).attributes()).toEqual({
          url: references[parentTopicIdentifiers[4]].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
        const collapsedItems = wrapper.find(HierarchyCollapsedItems);
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

      it('renders a list with `5 collapsed and no external`, with tags, between 800 and 1000px', () => {
        changeSize(900);
        wrapper.setProps({
          isSymbolBeta: true,
        });

        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert there is no root item
        expect(items.at(0).attributes()).toEqual({
          url: references[parentTopicIdentifiers[0]].url,
          iscollapsed: 'true',
        });
        expect(items.at(0).classes()).not.toContain('root-hierarchy');

        // next assert the collapsible items. 3, as 1 can live between 800 and 1000
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[1]].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[2]].url,
        });
        expect(items.at(3).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[3]].url,
        });
        expect(items.at(4).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[4]].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
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

      it('renders a list with `5 collapsed and no external`,with tags below 800', () => {
        changeSize(700);
        wrapper.setProps({
          isSymbolBeta: true,
        });

        const items = wrapper.findAll(HierarchyItem);
        // assert what items are shown
        // assert there is no root item
        expect(items.at(0).attributes()).toEqual({
          url: references[parentTopicIdentifiers[0]].url,
          iscollapsed: 'true',
        });
        expect(items.at(0).classes()).not.toContain('root-hierarchy');

        // next assert the collapsible items. 3, as 1 can live between 800 and 1000
        expect(items.at(1).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[1]].url,
        });
        expect(items.at(2).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[2]].url,
        });
        expect(items.at(3).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[3]].url,
        });
        expect(items.at(4).attributes()).toEqual({
          iscollapsed: 'true',
          url: references[parentTopicIdentifiers[4]].url,
        });
        // assert the last item has no attributes
        expect(items.at(5).attributes()).toEqual({});

        // assert there is a `HierarchyCollapsedItems` rendered, with correct items
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
    });
  });

  it('renders a beta badge', () => {
    const wrapper = mountWithProps({
      propsData: {
        currentTopicTitle: 'Foo',
        parentTopicIdentifiers: [],
        isSymbolBeta: true,
      },
    });
    expect(wrapper.find(Badge).props('variant')).toBe('beta');
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
