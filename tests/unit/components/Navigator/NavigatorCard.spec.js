/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NavigatorCard from '@/components/Navigator/NavigatorCard.vue';
import BaseNavigatorCard from '@/components/Navigator/BaseNavigatorCard.vue';
import { shallowMount } from '@vue/test-utils';
import { TopicTypes } from '@/constants/TopicTypes';
import { DynamicScroller } from 'vue-virtual-scroller';
import 'intersection-observer';
import { INDEX_ROOT_KEY, SIDEBAR_ITEM_SIZE } from '@/constants/sidebar';
import NavigatorCardItem from '@/components/Navigator/NavigatorCardItem.vue';
import { sessionStorage } from 'docc-render/utils/storage';
import FilterInput from '@/components/Filter/FilterInput.vue';
import { waitFor } from '@/utils/loading';
import { ChangeNames, ChangeTypes } from 'docc-render/constants/Changes';
import { flushPromises } from '../../../../test-utils';

jest.mock('docc-render/utils/debounce', () => jest.fn(fn => fn));
jest.mock('docc-render/utils/storage');
jest.mock('docc-render/utils/loading');

sessionStorage.get.mockImplementation((key, def) => def);

const {
  STORAGE_KEY,
  FILTER_TAGS,
  FILTER_TAGS_TO_LABELS,
  NO_CHILDREN,
  NO_RESULTS,
  ERROR_FETCHING,
  ITEMS_FOUND,
  HIDE_DEPRECATED_TAG,
} = NavigatorCard.constants;

const DynamicScrollerStub = {
  props: DynamicScroller.props,
  template: '<div class="vue-recycle-scroller-stub"><template v-for="(item, index) in items"><slot v-bind="{ item, index, active: false }" /></template></div>',
  methods: {
    scrollToItem: jest.fn(),
  },
};
const root0 = {
  type: TopicTypes.collection,
  path: '/documentation/testkit',
  title: 'TopLevel',
  uid: 1,
  parent: INDEX_ROOT_KEY,
  depth: 0,
  index: 0,
  childUIDs: [
    2,
    3,
  ],
};

const root0Child0 = {
  type: TopicTypes.struct,
  path: '/documentation/testkit/first-child-depth-1',
  title: 'First Child, Depth 1',
  uid: 2,
  parent: root0.uid,
  depth: 1,
  index: 0,
  childUIDs: [],
};

const root0Child1 = {
  type: TopicTypes.func,
  path: '/documentation/testkit/second-child-depth-1',
  title: 'Second Child, Depth 1',
  uid: 3,
  parent: root0.uid,
  depth: 1,
  index: 1,
  childUIDs: [
    4,
  ],
};

const root0Child1GrandChild0 = {
  type: TopicTypes.article,
  path: '/documentation/testkit/second-child-depth-1/first-child-depth-2',
  title: 'First Child, Depth 2',
  uid: 4,
  parent: root0Child1.uid,
  depth: 2,
  index: 0,
  childUIDs: [],
};

const root1 = {
  abstract: [{
    text: 'Create a tutorial.',
    type: 'text',
  }],
  type: TopicTypes.project,
  path: '/tutorials/testkit/gettingstarted',
  title: 'Getting Started',
  uid: 5,
  parent: INDEX_ROOT_KEY,
  depth: 0,
  index: 1,
  childUIDs: [],
};

const groupMarker = {
  type: TopicTypes.groupMarker,
  title: 'First Child Group Marker',
  uid: 22,
  parent: root0.uid,
  depth: 1,
  index: 4,
  childUIDs: [root0Child0.uid, root0Child1.uid],
  deprecatedChildrenCount: 0,
};

const root0WithGroupMarker = {
  ...root0,
  childUIDs: [groupMarker.uid].concat(root0.childUIDs),
};

const children = [
  root0,
  root0Child0,
  root0Child1,
  root0Child1GrandChild0,
  root1,
];

const childrenWithGroupMarker = [
  root0WithGroupMarker,
  groupMarker,
  root0Child0,
  root0Child1,
  root0Child1GrandChild0,
  root1,
];

const activePath = [root0.path, root0Child0.path];
const navigatorReferences = {
  foo: {},
};
const defaultProps = {
  technology: 'TestKit',
  technologyPath: '/documentation/testkit',
  children,
  activePath,
  type: TopicTypes.module,
  scrollLockID: 'foo',
  renderFilterOnTop: false,
  navigatorReferences,
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(NavigatorCard, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  stubs: {
    DynamicScroller: DynamicScrollerStub,
    NavigatorCardItem: {
      props: NavigatorCardItem.props,
      template: '<div><button></button></div>',
    },
    BaseNavigatorCard,
  },
  sync: false,
  ...others,
});

const clearPersistedStateSpy = jest.spyOn(NavigatorCard.methods, 'clearPersistedState');
let getChildPositionInScroller;

const DEFAULT_STORED_STATE = {
  [defaultProps.technologyPath]: {
    technology: defaultProps.technology,
    openNodes: [root0.uid, root0Child0.uid],
    nodesToRender: [root0.uid, root0Child0.uid, root0Child1.uid, root1.uid],
    hasApiChanges: false,
    activeUID: root0Child0.uid,
    filter: '',
    selectedTags: [],
    path: activePath[1],
  },
};

function mergeSessionState(state) {
  return {
    [defaultProps.technologyPath]: {
      ...DEFAULT_STORED_STATE[defaultProps.technologyPath],
      ...state,
    },
  };
}

function setOffsetParent(element, value) {
  Object.defineProperty(element, 'offsetParent', {
    value,
    writable: true,
  });
}

function attachDivWithID(id) {
  if (document.getElementById(id)) return;
  const div = document.createElement('DIV');
  div.id = id;
  document.body.appendChild(div);
}

describe('NavigatorCard', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    // mock the position helper function, as its too difficult to mock the boundingClientRects
    getChildPositionInScroller = jest.spyOn(NavigatorCard.methods, 'getChildPositionInScroller')
      .mockReturnValue(0);
  });

  it('renders the NavigatorCard', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    // assert scroller
    const scroller = wrapper.find(DynamicScroller);
    expect(wrapper.vm.activePathChildren).toHaveLength(2);
    expect(scroller.props()).toMatchObject({
      items: [
        root0,
        root0Child0,
        root0Child1, // we skip the grandchild, its parent is not open
        root1,
      ],
      minItemSize: SIDEBAR_ITEM_SIZE,
      keyField: 'uid',
    });
    expect(wrapper.find(DynamicScroller).attributes('aria-label')).toBe('Documentation Navigator');
    expect(scroller.attributes('id')).toEqual(defaultProps.scrollLockID);
    // assert CardItem
    const items = wrapper.findAll(NavigatorCardItem);
    expect(items).toHaveLength(4);
    expect(items.at(0).props()).toEqual({
      expanded: true,
      isActive: false,
      isRendered: false,
      filterPattern: null,
      isFocused: false,
      isBold: true,
      item: root0,
      apiChange: null,
      enableFocus: false,
      navigatorReferences,
    });
    // assert no-items-wrapper
    expect(wrapper.find('.no-items-wrapper').exists()).toBe(true);
    // assert filter
    const filter = wrapper.find(FilterInput);
    expect(filter.props()).toEqual({
      disabled: false,
      focusInputWhenCreated: false,
      focusInputWhenEmpty: false,
      placeholder: 'Filter',
      positionReversed: true,
      preventedBlur: false,
      selectedTags: [],
      shouldTruncateTags: false,
      tags: [
        // Sample Code is missing, because no sample code in test data
        'Articles',
        'Tutorials',
      ],
      value: '',
      clearFilterOnTagSelect: false,
    });
  });

  it('exposes a #post-head slot', () => {
    const wrapper = createWrapper({
      scopedSlots: {
        'post-head': '<div class="post-head">CustomPostHead</div>',
      },
    });
    expect(wrapper.find('.post-head').text()).toBe('CustomPostHead');
  });

  it('focuses the current page', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.vm.focusedIndex).toBe(1);
  });

  it('focus the first item if there is no active item', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.vm.focusedIndex).toBe(1);

    wrapper.setProps({
      activePath: [],
    });
    await flushPromises();
    expect(wrapper.vm.focusedIndex).toBe(0);
  });

  it('allows the user to navigate through arrow keys', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.vm.focusedIndex).toBe(1);
    const items = wrapper.findAll(NavigatorCardItem);
    expect(items.at(0).props('enableFocus')).toBe(false);
    items.at(0).trigger('keydown.down');
    await flushPromises();
    expect(wrapper.vm.focusedIndex).toBe(2);
    expect(items.at(0).props('enableFocus')).toBe(true);

    items.at(1).trigger('keydown.up');
    await flushPromises();
    expect(wrapper.vm.focusedIndex).toBe(1);
    expect(items.at(0).props('enableFocus')).toBe(true);
  });

  it('sets the `enableFocus` back to false, upon filtering', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    let items = wrapper.findAll(NavigatorCardItem);
    expect(wrapper.vm.focusedIndex).toBe(1);
    expect(items.at(1).props()).toMatchObject({
      enableFocus: false,
      isFocused: true,
    });
    items.at(1).trigger('keydown.down');
    await flushPromises();
    expect(wrapper.vm.focusedIndex).toBe(2);
    expect(items.at(2).props()).toMatchObject({
      enableFocus: true,
      isFocused: true,
    });

    // now to do a search, so the position of the focused item changes.
    wrapper.find(FilterInput).vm.$emit('input', root0.title);
    await flushPromises();
    // re-fetch the items
    items = wrapper.findAll(NavigatorCardItem);
    expect(items.at(0).props()).toMatchObject({
      item: root0,
      enableFocus: false, // self focus is disabled now
      isFocused: true, // isFocused is true, because it changed to the first item
    });
    // assert that the focusIndex was set to the first item
    expect(wrapper.vm.focusedIndex).toBe(0);
    // remove any filters
    wrapper.find(FilterInput).vm.$emit('input', '');
    await flushPromises();
    // assert that the focusIndex was set to the activeUID
    expect(wrapper.vm.focusedIndex).toBe(1);
  });

  it('allows the user to navigate to the last item on the list when pressing alt + down key', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    wrapper.findAll(NavigatorCardItem).at(0).trigger('keydown', {
      key: 'ArrowDown',
      altKey: true,
    });
    // assert that focusedIndex is restore
    expect(wrapper.vm.focusedIndex).toBe(null);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.focusedIndex).toBe(wrapper.findAll(NavigatorCardItem).length - 1);
  });

  it('allows expand/collapse all symbols when clicking on framework name + while pressing alt', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    // assert initial items are rendered
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(4);

    const navHead = wrapper.find('.navigator-head');

    // open all children symbols
    navHead.trigger('click', { altKey: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(children.length);

    // close all children symbols
    navHead.trigger('click', { altKey: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(2);

    // open all children symbols
    navHead.trigger('click', { altKey: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(children.length);
  });

  it('allows the user to navigate to the first item on the list when pressing alt + up key', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    wrapper.findAll(NavigatorCardItem).at(3).trigger('keydown', {
      key: 'ArrowUp',
      altKey: true,
    });
    await flushPromises();
    expect(wrapper.vm.focusedIndex).toBe(0);
  });

  it('reverses the FilterInput, on mobile', async () => {
    const wrapper = createWrapper({
      propsData: {
        renderFilterOnTop: true,
      },
    });
    expect(wrapper.classes()).toContain('filter-on-top');
    expect(wrapper.find(FilterInput).props('positionReversed')).toBe(false);
    wrapper.setProps({
      renderFilterOnTop: false,
    });
    await flushPromises();
    expect(wrapper.classes()).not.toContain('filter-on-top');
    expect(wrapper.find(FilterInput).props('positionReversed')).toBe(true);
  });

  it('renders aria-live regions for polite and assertive notifications', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true);
    expect(wrapper.find('[aria-live="assertive"]').exists()).toBe(true);
  });

  it('hides the DynamicScroller, if no items to show', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const scroller = wrapper.find(DynamicScroller);
    expect(scroller.isVisible()).toBe(true);
    wrapper.find(FilterInput).vm.$emit('input', 'bad-query');
    await wrapper.vm.$nextTick();
    expect(scroller.isVisible()).toBe(false);
  });

  it('renders a message updating aria-live, if no items found when filtering', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const scroller = wrapper.find(DynamicScroller);
    expect(scroller.isVisible()).toBe(true);
    wrapper.find(FilterInput).vm.$emit('input', 'bad-query');
    await wrapper.vm.$nextTick();
    expect(scroller.props('items')).toEqual([]);
    expect(scroller.isVisible()).toBe(false);
    expect(wrapper.find('[aria-live="assertive"].no-items-wrapper').text()).toBe(NO_RESULTS);
  });

  it('renders a message updating aria-live, if no children', async () => {
    const wrapper = createWrapper({
      propsData: {
        children: [],
      },
    });
    await flushPromises();
    const scroller = wrapper.find(DynamicScroller);
    expect(scroller.isVisible()).toBe(false);
    expect(wrapper.find('[aria-live="assertive"].no-items-wrapper').text()).toBe(NO_CHILDREN);
  });

  it('renders an error message updating aria-live, when there is an error in fetching', async () => {
    const wrapper = createWrapper({
      propsData: {
        children: [],
        errorFetching: true,
      },
    });
    await flushPromises();
    expect(wrapper.find('[aria-live="assertive"].no-items-wrapper').text()).toBe(ERROR_FETCHING);
    expect(wrapper.find('.filter-wrapper').exists()).toBe(false);
  });

  it('renders an hidden message updating aria-live, notifying how many items were found', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const unopenedItem = wrapper.findAll(NavigatorCardItem).at(2);
    unopenedItem.vm.$emit('toggle', root0Child1);
    await wrapper.vm.$nextTick();
    let message = [children.length, ITEMS_FOUND].join(' ');
    expect(wrapper.find('[aria-live="polite"].visuallyhidden').text()).toBe(message);

    wrapper.find(FilterInput).vm.$emit('input', root0.title);
    await wrapper.vm.$nextTick();
    message = [1, ITEMS_FOUND].join(' ');
    expect(wrapper.find('[aria-live="polite"].visuallyhidden').text()).toBe(message);
  });

  describe('toggles a child, on @toggle', () => {
    it('opens an item, on @toggle', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      const item = root0Child1;
      let all = wrapper.findAll(NavigatorCardItem);
      const unopenedItem = all.at(2);
      expect(unopenedItem.props()).toEqual({
        expanded: false,
        isActive: false,
        isBold: false,
        isFocused: false,
        item,
        filterPattern: null,
        isRendered: false,
        apiChange: null,
        enableFocus: false,
        navigatorReferences,
      });
      unopenedItem.vm.$emit('toggle', item);
      await wrapper.vm.$nextTick();
      expect(unopenedItem.props('expanded')).toBe(true);
      all = wrapper.findAll(NavigatorCardItem);
      // assert all items are now visible
      expect(all).toHaveLength(children.length);
      // assert the grandchild item is now visible
      expect(all.at(3).props('item')).toEqual(root0Child1GrandChild0);
    });

    it('closes an item and all of its children, on @toggle', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      const item = root0;
      let all = wrapper.findAll(NavigatorCardItem);
      expect(all).toHaveLength(4);
      const openItem = all.at(0);
      openItem.vm.$emit('toggle', item);
      await wrapper.vm.$nextTick();
      all = wrapper.findAll(NavigatorCardItem);
      // only the two top items are visible
      expect(all).toHaveLength(2);
    });

    it('keeps filtered items, when toggling items', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      // assert initial items are rendered
      let all = wrapper.findAll(NavigatorCardItem);
      expect(all).toHaveLength(4);
      // do a filter
      wrapper.find(FilterInput).vm.$emit('input', root0Child1.title);
      await flushPromises();

      // assert filtered items
      all = wrapper.findAll(NavigatorCardItem);
      expect(all).toHaveLength(2);

      // close all items
      all.at(0).vm.$emit('toggle', root0);
      await wrapper.vm.$nextTick();
      all = wrapper.findAll(NavigatorCardItem);
      // assert only the top level item is visible
      expect(all).toHaveLength(1);
      // now toggle it back open
      all.at(0).vm.$emit('toggle', root0);
      await flushPromises();
      // re-fetch items
      all = wrapper.findAll(NavigatorCardItem);
      // assert only filtered children are visible
      expect(all).toHaveLength(2);
      expect(all.at(1).props('item')).toEqual(root0Child1);
      // open the child now
      all.at(1).vm.$emit('toggle', root0Child1);
      await flushPromises();
      all = wrapper.findAll(NavigatorCardItem);
      // assert grandchild is visible, even though its not fitting the filter
      expect(all).toHaveLength(3);
      expect(all.at(2).props('item')).toEqual(root0Child1GrandChild0);
    });
  });

  describe('toggles all children items on @toggle-full', () => {
    it('opens an item, and all of its children, on @toggle-full', async () => {
      const wrapper = createWrapper({
        propsData: {
          // make sure no items are open
          activePath: [],
        },
      });
      await flushPromises();
      const item = root0;
      let all = wrapper.findAll(NavigatorCardItem);
      expect(all).toHaveLength(2);
      const openItem = all.at(0);
      openItem.vm.$emit('toggle-full', item);
      await flushPromises();
      all = wrapper.findAll(NavigatorCardItem);
      // only the two top items are visible
      expect(all).toHaveLength(children.length);
      openItem.vm.$emit('toggle-full', item);
      await flushPromises();
      expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(2);
    });

    it('opens an item, and all of its children, obeying applied filters', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      // assert initial items are rendered
      let all = wrapper.findAll(NavigatorCardItem);
      expect(all).toHaveLength(4);
      // do a filter
      wrapper.find(FilterInput).vm.$emit('input', root0Child1.title);
      await flushPromises();

      // assert filtered items
      all = wrapper.findAll(NavigatorCardItem);
      expect(all).toHaveLength(2);

      // close all items
      all.at(0).vm.$emit('toggle-full', root0);
      await wrapper.vm.$nextTick();
      all = wrapper.findAll(NavigatorCardItem);
      // assert only the top level item is visible
      expect(all).toHaveLength(1);
      // now toggle it back open
      all.at(0).vm.$emit('toggle-full', root0);
      await flushPromises();
      // re-fetch items
      all = wrapper.findAll(NavigatorCardItem);
      // assert only filtered children are visible
      expect(all).toHaveLength(3);
      expect(all.at(1).props('item')).toEqual(root0Child1);
      expect(all.at(2).props('item')).toEqual(root0Child1GrandChild0);
    });

    it('keeps groupMarkers in mind, when `@toggle-full` is handled', async () => {
      const wrapper = createWrapper({
        propsData: {
          // make sure no items are open
          activePath: [],
          children: childrenWithGroupMarker,
        },
      });
      await flushPromises();
      wrapper.find(NavigatorCardItem).vm.$emit('toggle-full', root0);
      await flushPromises();
      expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(6);
      wrapper.find(NavigatorCardItem).vm.$emit('toggle-full', root0);
      await flushPromises();
      expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(2);
    });
  });

  describe('toggles all siblings on @toggle-siblings', () => {
    const root0Child0WithChildrenGrandChild0 = {
      type: 'article',
      path: '/tutorials/fookit/first-child-depth-1/first-child-depth-1',
      title: 'Zero Child, Depth 2',
      uid: 6,
      parent: root0Child0.uid,
      depth: 2,
      index: 0,
      childUIDs: [],
    };
    const root0Child0WithChildren = {
      ...root0Child0,
      childUIDs: [root0Child0WithChildrenGrandChild0.uid],
    };
    const root1Child0 = {
      type: 'article',
      path: '/documentation/fookit/gettingstarted/first-child-depth-1',
      title: 'First Child, Depth 1',
      uid: 7,
      parent: root1.uid,
      depth: 1,
      index: 0,
      childUIDs: [],
    };
    const root1WithChildren = {
      ...root1,
      childUIDs: [root1Child0.uid],
    };
    const complexChildren = [
      root0,
      root0Child0WithChildren,
      root0Child0WithChildrenGrandChild0,
      root0Child1,
      root0Child1GrandChild0,
      root1WithChildren,
      root1Child0,
    ];

    it('of a closed item', async () => {
      const wrapper = createWrapper({
        propsData: {
          children: complexChildren,
          activePath: [
            root0.path,
          ],
        },
      });
      await flushPromises();
      let allItems = wrapper.findAll(NavigatorCardItem);
      // assert all items are as we expect them to be
      expect(allItems).toHaveLength(4);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root0Child0WithChildren);
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(3).props('item')).toEqual(root1WithChildren);
      // trigger `@toggle-siblings` on `root0Child0WithChildren`
      allItems.at(1).vm.$emit('toggle-siblings', root0Child0WithChildren);
      await flushPromises();
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(6);
      // assert grand children are visible
      expect(allItems.at(1).props()).toMatchObject({
        item: root0Child0WithChildren,
        expanded: true,
      });
      expect(allItems.at(2).props('item')).toEqual(root0Child0WithChildrenGrandChild0);
      expect(allItems.at(3).props()).toMatchObject({
        item: root0Child1,
        expanded: true,
      });
      expect(allItems.at(4).props('item')).toEqual(root0Child1GrandChild0);
      // close all siblings
      allItems.at(1).vm.$emit('toggle-siblings', root0Child0WithChildren);
      await flushPromises();
      // assert items are closed
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(4);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root0Child0WithChildren);
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(3).props('item')).toEqual(root1WithChildren);
    });

    it('without duplication if some are already open', async () => {
      const wrapper = createWrapper({
        propsData: {
          children: complexChildren,
          activePath: [
            root0.path,
          ],
        },
      });
      await flushPromises();
      let allItems = wrapper.findAll(NavigatorCardItem);
      // assert all items are as we expect them to be
      expect(allItems).toHaveLength(4);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root0Child0WithChildren);
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(3).props('item')).toEqual(root1WithChildren);
      // trigger `@toggle` on `root0Child1`, so one item is open
      allItems.at(2).vm.$emit('toggle', root0Child1);
      await flushPromises();
      // assert its open and its children are visible
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(5);
      // assert parent is open
      expect(allItems.at(2).props()).toMatchObject({
        item: root0Child1,
        expanded: true,
      });
      // assert child is visible
      expect(allItems.at(3).props()).toMatchObject({
        item: root0Child1GrandChild0,
      });
      // now toggle the other sibling using `toggle-siblings`
      allItems.at(1).vm.$emit('toggle-siblings', root0Child0WithChildren);
      await flushPromises();
      allItems = wrapper.findAll(NavigatorCardItem);
      // assert grand children are visible, without duplication
      expect(allItems).toHaveLength(6);
      expect(allItems.at(1).props()).toMatchObject({
        item: root0Child0WithChildren,
        expanded: true,
      });
      expect(allItems.at(2).props('item')).toEqual(root0Child0WithChildrenGrandChild0);
      expect(allItems.at(3).props()).toMatchObject({
        item: root0Child1,
        expanded: true,
      });
      expect(allItems.at(4).props('item')).toEqual(root0Child1GrandChild0);
      // close all siblings
      allItems.at(1).vm.$emit('toggle-siblings', root0Child0WithChildren);
      await flushPromises();
      // assert items are closed
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(4);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root0Child0WithChildren);
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(3).props('item')).toEqual(root1WithChildren);
    });

    it('closes open children of siblings', async () => {
      const wrapper = createWrapper({
        propsData: {
          children: complexChildren,
          activePath: [
            root0.path,
            root0Child0WithChildren.path,
            root0Child0WithChildrenGrandChild0.path,
          ],
        },
      });
      await flushPromises();
      let allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(5);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root0Child0WithChildren);
      expect(allItems.at(2).props('item')).toEqual(root0Child0WithChildrenGrandChild0);
      expect(allItems.at(3).props('item')).toEqual(root0Child1);
      expect(allItems.at(4).props('item')).toEqual(root1WithChildren);
      // toggle the siblings of `root0`
      allItems.at(0).vm.$emit('toggle-siblings', root0);
      await flushPromises();
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(2);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root1WithChildren);
      // assert all open items are closed, even deeply nested child ones
      expect(wrapper.vm.openNodes).toEqual({});
    });

    it('even if they are top-level, children of <root>', async () => {
      const wrapper = createWrapper({
        propsData: {
          children: complexChildren,
          activePath: [],
        },
      });
      await flushPromises();
      let allItems = wrapper.findAll(NavigatorCardItem);
      // assert all items are as we expect them to be
      expect(allItems).toHaveLength(2);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root1WithChildren);

      // toggle the items
      allItems.at(0).vm.$emit('toggle-siblings', root0);
      await flushPromises();
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(5);
      expect(allItems.at(0).props()).toMatchObject({
        item: root0,
        expanded: true,
      });
      expect(allItems.at(1).props('item')).toEqual(root0Child0WithChildren);
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(3).props()).toMatchObject({
        item: root1WithChildren,
        expanded: true,
      });
      expect(allItems.at(4).props('item')).toEqual(root1Child0);
      // close the second list of items
      allItems.at(2).vm.$emit('toggle', root1WithChildren);
      await flushPromises();
      // assert items are closed
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(4);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root0Child0WithChildren);
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(3).props('item')).toEqual(root1WithChildren);
      // now close the rest with toggle-siblings again
      allItems.at(0).vm.$emit('toggle-siblings', root0);
      await flushPromises();
      // assert only 2 items are visible
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(2);
    });

    it('obeying applied filters', async () => {
      const wrapper = createWrapper({
        propsData: {
          children: complexChildren,
          activePath: [],
        },
      });
      await flushPromises();
      let allItems = wrapper.findAll(NavigatorCardItem);
      // assert all items are as we expect them to be
      expect(allItems).toHaveLength(2);
      // apply a broad filter across items
      wrapper.find(FilterInput).vm.$emit('input', 'First Child');
      await flushPromises();
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(6);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root0Child0WithChildren);
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(3).props('item')).toEqual(root0Child1GrandChild0);
      expect(allItems.at(4).props('item')).toEqual(root1WithChildren);
      expect(allItems.at(5).props('item')).toEqual(root1Child0);

      // toggle the items
      allItems.at(0).vm.$emit('toggle-siblings', root0);
      await flushPromises();
      // toggle the items closed
      allItems = wrapper.findAll(NavigatorCardItem);
      // assert items
      expect(allItems).toHaveLength(2);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root1WithChildren);
      // toggle the items open again
      allItems.at(0).vm.$emit('toggle-siblings', root0);
      await flushPromises();
      // assert the items are filtered
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(5);
      expect(allItems.at(0).props('item')).toEqual(root0);
      expect(allItems.at(1).props('item')).toEqual(root0Child0WithChildren);
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(3).props('item')).toEqual(root1WithChildren);
      expect(allItems.at(4).props('item')).toEqual(root1Child0);
    });

    it('toggles siblings properly, even when there are groupMarkers', async () => {
      const wrapper = createWrapper({
        propsData: {
          children: [
            root0WithGroupMarker,
            groupMarker,
            root0Child0WithChildren,
            root0Child0WithChildrenGrandChild0,
            root0Child1,
            root0Child1GrandChild0,
            root1WithChildren,
            root1Child0,
          ],
          activePath: [root0WithGroupMarker.path],
        },
      });
      await flushPromises();
      // assert we have 3 items rendered
      expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(5);
      // open the item and it's siblings
      wrapper.find(NavigatorCardItem).vm.$emit('toggle-siblings', root0Child1);
      await flushPromises();
      // assert we have one extra item visible
      let allItems = wrapper.findAll(NavigatorCardItem);
      // assert all items are as we expect them to be
      expect(allItems).toHaveLength(7);
      expect(allItems.at(0).props('item')).toEqual(root0WithGroupMarker);
      expect(allItems.at(1).props('item')).toEqual(groupMarker);
      expect(allItems.at(2).props('item')).toEqual(root0Child0WithChildren);
      expect(allItems.at(3).props('item')).toEqual(root0Child0WithChildrenGrandChild0);
      expect(allItems.at(4).props('item')).toEqual(root0Child1);
      expect(allItems.at(5).props('item')).toEqual(root0Child1GrandChild0);
      expect(allItems.at(6).props('item')).toEqual(root1WithChildren);

      // toggle the items
      allItems.at(0).vm.$emit('toggle-siblings', root0Child1);
      await flushPromises();
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(5);
      expect(allItems.at(0).props()).toMatchObject({
        item: root0WithGroupMarker,
        expanded: true,
      });
      expect(allItems.at(1).props('item')).toEqual(groupMarker);
      expect(allItems.at(2).props())
        .toMatchObject({ item: root0Child0WithChildren, expanded: false });
      expect(allItems.at(3).props()).toMatchObject({ item: root0Child1, expanded: false });
      expect(allItems.at(4).props()).toMatchObject({ item: root1WithChildren, expanded: false });
    });
  });

  describe('on @focus-parent', () => {
    it('focuses parent', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      const items = wrapper.findAll(NavigatorCardItem);
      expect(items.at(0).props('isFocused')).toBe(false);
      expect(items.at(1).props('isFocused')).toBe(true);
      items.at(1).vm.$emit('focus-parent', root0Child0);
      await flushPromises();
      expect(items.at(0).props('isFocused')).toBe(true);
      expect(items.at(1).props('isFocused')).toBe(false);
    });

    it('does nothing, if parent is root', async () => {
      const wrapper = createWrapper({
        propsData: {
          activePath: [root1.path],
        },
      });
      await flushPromises();
      const items = wrapper.findAll(NavigatorCardItem);
      expect(items.at(1).props('isFocused')).toBe(true);
      items.at(1).vm.$emit('focus-parent', root1);
      await flushPromises();
      expect(items.at(1).props('isFocused')).toBe(true);
    });
  });

  it('highlights the current page, and expands all of its parents', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(4); // assert all are rendered, except the grandchild
    expect(all.at(0).props()).toMatchObject({
      item: root0, // the first item
      isBold: true,
      isActive: false,
      expanded: true,
    });
    expect(all.at(1).props()).toMatchObject({
      item: root0Child0,
      isBold: true,
      isActive: true,
    });
  });

  it('keeps the open/closed state when navigating while filtering, except when the current page not visible, in which case we open those items', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    // apply a generic filter with lots of hits
    wrapper.find(FilterInput).vm.$emit('input', 'Child');
    await flushPromises();
    // assert the items rendered
    let all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(4);
    // assert the inner most child is rendered
    expect(all.at(3).props('item')).toEqual(root0Child1GrandChild0);
    // toggle to close a few items
    all.at(1).vm.$emit('toggle', root0Child1);
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    // assert only 3 items are now visible
    expect(all).toHaveLength(3);
    // simulate we go to the root
    wrapper.setProps({
      activePath: [root0.path],
    });
    await flushPromises();
    // assert there is no change to the open/closed state
    all = wrapper.findAll(NavigatorCardItem);
    // assert only 3 items are now visible
    expect(all).toHaveLength(3);
    expect(all.at(0).props()).toMatchObject({
      item: root0,
      isActive: true,
      isBold: true,
    });
    // simulate we go to a visible sibling
    wrapper.setProps({
      activePath: [root0.path, root0Child0.path],
    });
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    // assert only 3 items are still visible
    expect(all).toHaveLength(3);
    expect(all.at(1).props()).toMatchObject({
      item: root0Child0,
      isActive: true,
      isBold: true,
    });
    // now navigate to the grandChild, and assert it's parent auto opens
    wrapper.setProps({
      activePath: [root0.path, root0Child1.path, root0Child1GrandChild0.path],
    });
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    // assert only 3 items are still visible
    expect(all).toHaveLength(4);
    expect(all.at(1).props()).toMatchObject({
      item: root0Child0,
      isActive: false,
      isBold: false,
    });
    expect(all.at(2).props()).toMatchObject({
      item: root0Child1,
      isActive: false,
      isBold: true,
      expanded: true,
    });
    expect(all.at(3).props()).toMatchObject({
      item: root0Child1GrandChild0,
      isActive: true,
      isBold: true,
    });
  });

  it('allows filtering the items, opening all items, that have matches in children', async () => {
    attachDivWithID(root0Child0.uid);
    const wrapper = createWrapper();
    await flushPromises();
    // item is not scrolled to
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(0);
    const filter = wrapper.find(FilterInput);
    filter.vm.$emit('input', root0Child1GrandChild0.title);
    await flushPromises();
    // assert list is scrolled to the top
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledWith(0);
    // assert only the parens of the match are visible
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child1);
    expect(all.at(2).props('item')).toEqual(root0Child1GrandChild0);
  });

  it('filters items, keeping only direct matches, removing siblings, even if parent is a direct match', async () => {
    const root0Updated = {
      ...root0,
      title: `Second ${root0}`,
    };
    const newChildren = [
      root0Updated,
      root0Child0,
      root0Child1,
      root0Child1GrandChild0,
      root1,
    ];
    attachDivWithID(root0Child0.uid);

    const wrapper = createWrapper({
      propsData: {
        children: newChildren,
      },
    });
    const filter = wrapper.find(FilterInput);
    await flushPromises();
    // make sure we match at both the top item as well as one of its children
    filter.vm.$emit('input', 'Second');
    await flushPromises();
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledWith(0);
    // assert only the parens of the match are visible
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(2);
    expect(all.at(0).props('item')).toEqual(root0Updated);
    expect(all.at(1).props('item')).toEqual(root0Child1);
  });

  it('renders all the children of a directly matched parent', async () => {
    attachDivWithID(root0Child0.uid);
    const wrapper = createWrapper();
    const filter = wrapper.find(FilterInput);
    await flushPromises();
    filter.vm.$emit('input', root0.title);
    await flushPromises();
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledWith(0);
    // assert only the parens of the match are visible
    let all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(1);
    expect(all.at(0).props('item')).toEqual(root0);
    // open the item
    all.at(0).vm.$emit('toggle', root0);
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(1).props('item')).toEqual(root0Child0);
    expect(all.at(2).props('item')).toEqual(root0Child1);
    // open last child
    all.at(2).vm.$emit('toggle', root0Child1);
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(4);
    expect(all.at(3).props('item')).toEqual(root0Child1GrandChild0);
  });

  it('allows filtering the items using Tags, opening all items, that have matches in children', async () => {
    attachDivWithID(root0Child0.uid);
    const wrapper = createWrapper();
    await flushPromises();
    const filter = wrapper.find(FilterInput);
    filter.vm.$emit('update:selectedTags', [FILTER_TAGS_TO_LABELS.articles]);
    await flushPromises();
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenLastCalledWith(0);
    // assert only the parens of the match are visible
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child1);
    expect(all.at(2).props('item')).toEqual(root0Child1GrandChild0);
    // assert we reset the scroll to the top
  });

  it('aliases `project` to `tutorial`, when filtering using tags', async () => {
    attachDivWithID(root0Child0.uid);
    const wrapper = createWrapper();
    const filter = wrapper.find(FilterInput);
    await flushPromises();
    filter.vm.$emit('update:selectedTags', [FILTER_TAGS_TO_LABELS.tutorials]);
    await flushPromises();
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledWith(0);
    // assert only the parens of the match are visible
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(1);
    expect(all.at(0).props('item')).toEqual(root1);
  });

  it('allows filtering the items with filter and Tags, opening all items, that have matches in children', async () => {
    attachDivWithID(root0Child0.uid);
    const wrapper = createWrapper();
    const filter = wrapper.find(FilterInput);
    await flushPromises();
    filter.vm.$emit('update:selectedTags', [FILTER_TAGS_TO_LABELS.articles]);
    await flushPromises();
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
    expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledWith(0);
    // assert only the parens of the match are visible
    let all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child1);
    expect(all.at(2).props('item')).toEqual(root0Child1GrandChild0);
    // add filtering on top
    filter.vm.$emit('input', root0Child1GrandChild0.title);
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child1);
    expect(all.at(2).props('item')).toEqual(root0Child1GrandChild0);
  });

  it('allows opening an item, that has a filter match', async () => {
    const wrapper = createWrapper();
    const filter = wrapper.find(FilterInput);
    await flushPromises();
    filter.vm.$emit('input', root0Child1.title);
    await flushPromises();
    // assert match and all if it's parents are visible
    let all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(2);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child1);
    // open the last match
    all.at(1).vm.$emit('toggle', root0Child1);
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    // assert the last match child is visible
    expect(all).toHaveLength(3);
    expect(all.at(2).props('item')).toEqual(root0Child1GrandChild0);
    // close the match
    all.at(1).vm.$emit('toggle', root0Child1);
    await flushPromises();
    // assert there are again only 2 matches
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(2);
  });

  it('removes duplicate items, when multiple items with the same parent match the filter', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const filter = wrapper.find(FilterInput);
    // make sure both child elements match
    filter.vm.$emit('input', 'Child');
    await flushPromises();
    // assert only the parens of the match are visible
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(4);
    // the root is rendered only once, even though multiple children match
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child0);
    expect(all.at(2).props('item')).toEqual(root0Child1);
    expect(all.at(3).props('item')).toEqual(root0Child1GrandChild0);
  });

  it('renders only direct matches or parents, when apiChanges are provided', async () => {
    const apiChanges = {
      [root0Child0.path]: 'modified',
      [root0Child1.path]: 'modified',
    };
    const wrapper = createWrapper({
      propsData: {
        apiChanges,
      },
    });
    await flushPromises();
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child0);
    expect(all.at(2).props('item')).toEqual(root0Child1);
  });

  it('allows filtering while API changes are ON', async () => {
    const apiChanges = {
      [root0Child0.path]: ChangeTypes.modified,
      [root0Child1.path]: ChangeTypes.modified,
    };
    const wrapper = createWrapper({
      propsData: {
        apiChanges,
      },
    });
    await flushPromises();
    let all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child0);
    expect(all.at(2).props('item')).toEqual(root0Child1);
    // filter
    wrapper.find(FilterInput).vm.$emit('input', root0Child0.title);
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(2);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child0);
  });

  it('allows filtering by change type via tags, while API changes are ON', async () => {
    const apiChanges = {
      [root0Child0.path]: ChangeTypes.modified,
      [root0Child1.path]: ChangeTypes.added,
    };
    const wrapper = createWrapper({
      propsData: {
        apiChanges,
      },
    });
    await flushPromises();
    let all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child0);
    expect(all.at(2).props('item')).toEqual(root0Child1);
    // filter
    wrapper.find(FilterInput).vm.$emit('update:selectedTags', [ChangeNames.added]);
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(2);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child1);
  });

  it('removes any previously selected API changes tags, if API changes goes OFF', async () => {
    const apiChanges = {
      [root0Child0.path]: ChangeTypes.modified,
      [root0Child1.path]: ChangeTypes.added,
    };
    const wrapper = createWrapper({
      propsData: {
        apiChanges,
      },
    });
    await flushPromises();
    let all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    // filter
    const filter = wrapper.find(FilterInput);
    filter.vm.$emit('update:selectedTags', [ChangeNames.added]);
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(2);
    wrapper.setProps({ apiChanges: null });
    await flushPromises();

    // assert all items are again visible
    all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(4);
    expect(filter.props()).toHaveProperty('selectedTags', []);
  });

  it('clears previously open items, when filtering and clearing the filter', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    wrapper.find(FilterInput).vm.$emit('input', 'First Child, Depth 2');
    await flushPromises();
    let all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(2).props('item')).toEqual(root0Child1GrandChild0);
    wrapper.find(FilterInput).vm.$emit('input', '');
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(4);
    // assert that the previously open child is no longer visible
    expect(all.at(2).props('item')).toEqual(root0Child1);
    expect(all.at(3).props('item')).toEqual(root1);
  });

  it('persists the filtered state, per technology path', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    // called to reset the state initially, then called to store the changed state
    expect(sessionStorage.set).toHaveBeenCalledTimes(2);
    expect(clearPersistedStateSpy).toHaveBeenCalledTimes(1);
    expect(sessionStorage.set)
      .toHaveBeenCalledWith(STORAGE_KEY, DEFAULT_STORED_STATE);
    await flushPromises();
    wrapper.find(FilterInput).vm.$emit('input', root0Child1GrandChild0.title);
    wrapper.find(FilterInput).vm.$emit('update:selectedTags', [FILTER_TAGS_TO_LABELS.articles]);
    await flushPromises();
    expect(sessionStorage.set).toHaveBeenCalledTimes(3);
    expect(sessionStorage.set)
      .toHaveBeenCalledWith(STORAGE_KEY, mergeSessionState({
        selectedTags: [FILTER_TAGS.articles],
        openNodes: [root0.uid, root0Child1.uid],
        nodesToRender: [root0.uid, root0Child1.uid, root0Child1GrandChild0.uid],
        filter: root0Child1GrandChild0.title,
      }));
  });

  it('restores the persisted state, from sessionStorage', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      filter: root0.title,
      nodesToRender: [root0.uid],
      openNodes: [root0.uid],
      selectedTags: [FILTER_TAGS.tutorials],
      activeUID: root0.uid,
      path: activePath[0],
    }));

    const wrapper = createWrapper({
      propsData: {
        activePath: [root0.path],
      },
    });
    await flushPromises();
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(1);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(wrapper.find(FilterInput).props('selectedTags'))
      .toEqual([FILTER_TAGS_TO_LABELS.tutorials]);
    expect(clearPersistedStateSpy).toHaveBeenCalledTimes(0);
  });

  it('does not restore state, if path is different', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      path: '/documentation/other/path',
      nodesToRender: [root0.uid],
    }));
    const wrapper = createWrapper();
    await flushPromises();
    // assert we are render more than just the single item in the store
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(4);
    expect(clearPersistedStateSpy).toHaveBeenCalledTimes(1);
  });

  it('does not restore the state, if the technology is different', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      technology: 'some-other',
      nodesToRender: [root0.uid],
    }));
    const wrapper = createWrapper();
    await flushPromises();
    // assert we are render more than just the single item in the store
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(4);
    expect(clearPersistedStateSpy).toHaveBeenCalledTimes(1);
  });

  it('does not restore the state, if the activeUID is not in the rendered items', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      activeUID: root0Child1GrandChild0.uid,
    }));
    const wrapper = createWrapper();
    await flushPromises();
    // assert we are render more than just the single item in the store
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(4);
    expect(all.at(3).props('item')).not.toEqual(root0Child1GrandChild0);
    expect(clearPersistedStateSpy).toHaveBeenCalledTimes(1);
  });

  it('does not restore the state, if the activeUID path does not match the current last path', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      activeUID: root0.uid,
      nodesToRender: [root0.uid],
    }));

    const wrapper = createWrapper({
      propsData: {
        activePath: [root0.path, root0Child0.path],
      },
    });
    await flushPromises();
    // assert we are render more than just the single item in the store
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(4);
    expect(all.at(3).props('item')).not.toEqual(root0Child1GrandChild0);
    expect(clearPersistedStateSpy).toHaveBeenCalledTimes(1);
  });

  it('restores the state, if the activeUID is not in the rendered items, but there is a filter', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      filter: root0Child1.title,
      nodesToRender: [root0.uid, root0Child0.uid, root0Child1.uid],
      openNodes: [root0.uid, root0Child1.uid],
      activeUID: root0Child1GrandChild0.uid,
      path: root0Child1GrandChild0.path,
    }));
    const wrapper = createWrapper({
      propsData: {
        activePath: [root0.path, root0Child1.path, root0Child1GrandChild0.path],
      },
    });
    await flushPromises();
    // assert we are render more than just the single item in the store
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(2).props('item')).toEqual(root0Child1);
    expect(clearPersistedStateSpy).toHaveBeenCalledTimes(0);
  });

  it('does not restore the state, if the nodesToRender do not match what we have', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      nodesToRender: [root0.uid, 'something-different'],
    }));
    const wrapper = createWrapper();
    await flushPromises();
    // assert we are render more than just the single item in the store
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(4);
  });

  it('does not restore the state, if the nodesToRender and filter are empty', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      nodesToRender: [],
      filter: '',
    }));
    const wrapper = createWrapper();
    await flushPromises();
    // assert we are render more than just the single item in the store
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(4);
    expect(clearPersistedStateSpy).toHaveBeenCalledTimes(1);
  });

  it('restores the state, if the nodesToRender and filter are empty, but there are selectedTags', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      nodesToRender: [],
      selectedTags: [FILTER_TAGS.tutorials],
      openNodes: [],
      activeUID: root0Child0.uid,
    }));
    const wrapper = createWrapper();
    await flushPromises();
    // assert we are render more than just the single item in the store
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(0);
    expect(clearPersistedStateSpy).toHaveBeenCalledTimes(0);
  });

  it('does not restore the state, if the API changes mismatch', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      // simulate we have collapsed all, but the top item
      nodesToRender: [root0.uid],
      openNodes: [root0.uid],
      apiChanges: true,
    }));
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(4);
  });

  it('does not restore the state, if `activeUID` is null, but there are activePath items', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      // simulate we have collapses all, but the top item
      nodesToRender: [root0.uid],
      openNodes: [root0.uid],
      selectedTags: [],
      apiChanges: false,
      activeUID: null,
    }));
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(4);
  });

  it('keeps the open state, if there are API changes', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      // simulate we have collapses all, but the top item
      nodesToRender: [root0.uid, root0Child0.uid, root0Child1.uid],
      openNodes: [root0.uid],
      selectedTags: [],
      apiChanges: true,
    }));
    const wrapper = createWrapper({
      propsData: {
        apiChanges: {
          [root0Child0.path]: ChangeTypes.modified,
          [root0Child1.path]: ChangeTypes.modified,
        },
      },
    });
    await flushPromises();
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(3);
  });

  it('keeps the open state, even if there is a title filter', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      filter: root0Child1GrandChild0.title,
      // simulate we have collapses all, but the top item
      nodesToRender: [root0.uid, root0Child1.uid],
      openNodes: [root0.uid],
      activeUID: root0.uid,
      path: root0.path,
    }));
    const wrapper = createWrapper({
      propsData: {
        activePath: [root0.path],
      },
    });
    await flushPromises();
    // assert we are render more than just whats in the store,
    // so the filter does not trigger re-calculations
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(2);
  });

  it('keeps the open state, even if there is a Tag filter applied', async () => {
    sessionStorage.get.mockImplementation(() => mergeSessionState({
      nodesToRender: [root0.uid, root0Child1.uid],
      openNodes: [root0.uid],
      selectedTags: [FILTER_TAGS.tutorials],
      activeUID: root0.uid,
      path: root0.path,
    }));
    const wrapper = createWrapper({
      propsData: {
        activePath: [root0.path],
      },
    });
    await flushPromises();
    // assert we are render more than just whats in the store,
    // so the filter does not trigger re-calculations
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(2);
  });

  it('removes other tag suggestions, when picking one', async () => {
    sessionStorage.get.mockImplementation((key, def) => def);
    const wrapper = createWrapper();
    await flushPromises();
    const filter = wrapper.find(FilterInput);
    expect(filter.props('tags')).toHaveLength(2);
    filter.vm.$emit('update:selectedTags', [FILTER_TAGS_TO_LABELS.articles]);
    await flushPromises();
    expect(filter.props('tags')).toEqual([]);
  });

  it('shows only tags, that have matching children', async () => {
    sessionStorage.get.mockImplementation((key, def) => def);
    const sampleCode = {
      type: 'sampleCode',
      path: '/documentation/fookit/sample-code',
      title: 'Sample Code',
      uid: 6,
      parent: INDEX_ROOT_KEY,
      depth: 0,
      index: 1,
      childUIDs: [],
    };
    const apiChanges = {
      [sampleCode.path]: ChangeTypes.modified,
      [root0Child0.path]: ChangeTypes.added,
    };
    const wrapper = createWrapper({
      propsData: {
        children: [root0, root0Child0, root1, sampleCode],
        activePath: [root0.path],
      },
    });
    await flushPromises();
    const filter = wrapper.find(FilterInput);
    // assert there are no Articles for example
    expect(filter.props('tags')).toEqual(['Tutorials', 'Sample Code']);
    // apply a filter
    filter.vm.$emit('input', sampleCode.title);
    await flushPromises();
    expect(filter.props('tags')).toEqual(['Sample Code']);
    wrapper.setProps({ apiChanges });
    await flushPromises();
    expect(filter.props('tags')).toEqual(['Sample Code', ChangeNames.modified]);
  });

  describe('with groupMarker', () => {
    it('shows "Hide Deprecated" tag, if there are deprecated items', async () => {
      const updatedChild = {
        ...root0Child0,
        deprecated: true,
      };

      const wrapper = createWrapper({
        propsData: {
          children: [
            root0WithGroupMarker, groupMarker, updatedChild, root0Child1, root0Child1GrandChild0,
            root1,
          ],
          activePath: [root0.path],
        },
      });
      await flushPromises();
      const filter = wrapper.find(FilterInput);
      // assert there are no Articles for example
      expect(filter.props('tags')).toEqual(['Articles', 'Tutorials', HIDE_DEPRECATED_TAG]);
      // apply a filter
      filter.vm.$emit('update:selectedTags', [HIDE_DEPRECATED_TAG]);
      await flushPromises();
      // assert no other tags are shown now
      expect(filter.props('tags')).toEqual([]);
      let allItems = wrapper.findAll(NavigatorCardItem);
      // assert the deprecated item is filtered out
      expect(allItems).toHaveLength(4);
      // assert root is rendered
      expect(allItems.at(0).props('item')).toEqual(root0WithGroupMarker);
      // assert the group marker is rendered
      expect(allItems.at(1).props('item')).toEqual(groupMarker);
      // assert the none-deprecated child is rendered, but its not expanded
      expect(allItems.at(2).props()).toMatchObject({
        item: root0Child1,
        expanded: false,
      });
      expect(allItems.at(3).props('item')).toEqual(root1);
      // Ensure all first children should show up
      filter.vm.$emit('input', 'First Child');
      await flushPromises();
      allItems = wrapper.findAll(NavigatorCardItem);
      // assert that filtering opens everything as usual, showing groupMarkers as well
      expect(allItems).toHaveLength(4);
      expect(allItems.at(0).props('item')).toEqual(root0WithGroupMarker);
      expect(allItems.at(1).props('item')).toEqual(groupMarker);
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(3).props('item')).toEqual(root0Child1GrandChild0);
    });

    it('matches groupMarkers in results, showing children that match if any or all if none', async () => {
      const wrapper = createWrapper({
        propsData: {
          children: [
            root0WithGroupMarker, groupMarker, root0Child0, root0Child1, root0Child1GrandChild0,
            root1,
          ],
          activePath: [root0.path],
        },
      });
      await flushPromises();
      const input = wrapper.find(FilterInput);
      input.vm.$emit('input', groupMarker.title);
      await flushPromises();
      let items = wrapper.findAll(NavigatorCardItem);
      // parent + group and 2 siblings
      expect(items).toHaveLength(4);
      expect(items.at(0).props('item')).toEqual(root0WithGroupMarker);
      expect(items.at(1).props('item')).toEqual(groupMarker);
      expect(items.at(2).props('item')).toEqual(root0Child0);
      expect(items.at(3).props('item')).toEqual(root0Child1);
      // assert that toggling children shows items as normal
      items.at(3).vm.$emit('toggle', root0Child1);
      await flushPromises();
      items = wrapper.findAll(NavigatorCardItem);
      expect(items).toHaveLength(5);
      expect(items.at(4).props('item')).toEqual(root0Child1GrandChild0);
      // assert that partial matches of group and children show only those that match
      input.vm.$emit('input', 'First Child');
      await flushPromises();
      items = wrapper.findAll(NavigatorCardItem);
      expect(items).toHaveLength(5);
      expect(items.at(0).props('item')).toEqual(root0WithGroupMarker);
      expect(items.at(1).props('item')).toEqual(groupMarker);
      expect(items.at(2).props('item')).toEqual(root0Child0);
      expect(items.at(3).props('item')).toEqual(root0Child1);
      expect(items.at(4).props('item')).toEqual(root0Child1GrandChild0);
    });

    it('renders the `groupMarker`, that is connected to a search result', async () => {
      const root0Child0Clone = { ...root0Child0, groupMarkerUID: groupMarker.uid };
      const root0Child1Clone = { ...root0Child1, groupMarkerUID: groupMarker.uid };
      const wrapper = createWrapper({
        propsData: {
          children: [
            root0WithGroupMarker, groupMarker, root0Child0Clone,
            root0Child1Clone, root0Child1GrandChild0, root1,
          ],
          activePath: [root0.path],
        },
      });
      await flushPromises();
      const filter = wrapper.find(FilterInput);
      // apply a filter that matches an element
      filter.vm.$emit('input', root0Child1Clone.title);
      await flushPromises();
      const items = wrapper.findAll(NavigatorCardItem);
      // parent + group and 1 item
      expect(items).toHaveLength(3);
      expect(items.at(0).props('item')).toEqual(root0WithGroupMarker);
      expect(items.at(1).props('item')).toEqual(groupMarker);
      expect(items.at(2).props('item')).toEqual(root0Child1Clone);
    });

    it('does not render a `groupMarker`, if all of its children are deprecated, and `HideDeprecated` is ON', async () => {
      const root0Child0Clone = {
        ...root0Child0,
        groupMarkerUID: groupMarker.uid,
        deprecated: true,
      };
      const root0Child1Clone = {
        ...root0Child1,
        groupMarkerUID: groupMarker.uid,
        deprecated: true,
        childUIDs: [],
      };
      const groupMarkerClone = { ...groupMarker, deprecatedChildrenCount: 2 };
      const root0Clone = { ...root0WithGroupMarker, deprecated: true };
      const wrapper = createWrapper({
        propsData: {
          children: [
            root0Clone, groupMarkerClone, root0Child0Clone,
            root0Child1Clone, root1,
          ],
          activePath: [root0Clone.path],
        },
      });
      await flushPromises();
      const filter = wrapper.find(FilterInput);
      // apply a filter that matches an element
      filter.vm.$emit('update:selectedTags', [HIDE_DEPRECATED_TAG]);
      await flushPromises();
      const items = wrapper.findAll(NavigatorCardItem);
      // parent
      expect(items).toHaveLength(1);
      expect(items.at(0).props('item')).toEqual(root1);
    });
  });

  it('Does not show "Hide Deprecated" tag, if API changes are ON', async () => {
    const updatedChild = {
      ...root0Child0,
      deprecated: true,
    };
    const root0Updated = {
      ...root0,
      childUIDs: root0.childUIDs.concat(groupMarker.uid),
    };
    const apiChanges = {
      [updatedChild.path]: ChangeTypes.added,
    };
    const wrapper = createWrapper({
      propsData: {
        children: [
          root0Updated, updatedChild, groupMarker, root0Child1, root0Child1GrandChild0, root1,
        ],
        activePath: [root0.path],
        apiChanges,
      },
    });
    await flushPromises();
    const filter = wrapper.find(FilterInput);
    // assert there is no 'Hide Deprecated' tag
    expect(filter.props('tags')).not.toContain(HIDE_DEPRECATED_TAG);
  });

  describe('navigating', () => {
    it('changes the open item, when navigating across pages, keeping the previously open items', async () => {
      // simulate navigating to the bottom most item.
      attachDivWithID(root0Child0.uid);
      const wrapper = createWrapper();
      await flushPromises();
      // item is in viewport, no need to scroll to it
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(0);
      // simulate the new item is below the fold
      getChildPositionInScroller.mockReturnValueOnce(1);
      attachDivWithID(root0Child1GrandChild0.uid);
      wrapper.setProps({
        activePath: [
          root0.path,
          root0Child1.path,
          root0Child1GrandChild0.path,
        ],
      });
      await flushPromises();
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenLastCalledWith(3);
      // assert all are open
      const all = wrapper.findAll(NavigatorCardItem);
      expect(all).toHaveLength(5);
      // assert it auto opens
      expect(all.at(0).props()).toMatchObject({
        expanded: true,
        isActive: false,
        isBold: true,
        item: root0,
      });
      expect(all.at(1).props()).toMatchObject({
        expanded: true,
        isActive: false,
        isBold: false,
        item: root0Child0,
      });
      expect(all.at(2).props()).toMatchObject({
        expanded: true,
        isActive: false,
        isBold: true,
        item: root0Child1,
      });
      expect(all.at(3).props()).toMatchObject({
        expanded: true,
        isActive: true,
        isBold: true,
        item: root0Child1GrandChild0,
      });
      // simulate the new item is above the scrollarea
      getChildPositionInScroller.mockReturnValueOnce(-1);
      // navigate to the top level sibling
      attachDivWithID(root1.uid);
      wrapper.setProps({
        activePath: [
          root1.path,
        ],
      });
      await flushPromises();
      // assert it scrolls to the item
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(2);
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenLastCalledWith(4);
      // assert items are still open
      expect(all.at(0).props()).toMatchObject({
        expanded: true,
        isActive: false,
        isBold: false,
        item: root0,
      });
      expect(all.at(1).props()).toMatchObject({
        expanded: true,
        isActive: false,
        isBold: false,
        item: root0Child0,
      });
      expect(all.at(2).props()).toMatchObject({
        expanded: true,
        isActive: false,
        isBold: false,
        item: root0Child1,
      });
      expect(all.at(3).props()).toMatchObject({
        expanded: true,
        isActive: false,
        isBold: false,
        item: root0Child1GrandChild0,
      });
      expect(all.at(4).props()).toMatchObject({
        expanded: true,
        isActive: true,
        isBold: true,
        item: root1,
      });
    });

    it('tracks current open item, from clicking child items, handling duplicate router changes on the way', async () => {
      attachDivWithID(root0Child0.uid);
      const wrapper = createWrapper();
      await flushPromises();
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(0);
      let allItems = wrapper.findAll(NavigatorCardItem);
      const targetChild = allItems.at(2);
      expect(targetChild.props('item')).toEqual(root0Child1);
      // simulate the new item is below the fold
      getChildPositionInScroller.mockReturnValueOnce(1);
      // add an element with the same ID as the one we are navigating to,
      // otherwise we won't scroll to it
      attachDivWithID(root0Child1.uid);
      // trigger a navigation
      targetChild.vm.$emit('navigate', root0Child1.uid);
      await wrapper.vm.$nextTick();
      expect(sessionStorage.set)
        .toHaveBeenLastCalledWith(STORAGE_KEY, mergeSessionState({
          activeUID: root0Child1.uid,
          openNodes: [root0.uid, root0Child0.uid, root0Child1.uid],
          nodesToRender: [
            root0.uid, root0Child0.uid, root0Child1.uid, root0Child1GrandChild0.uid, root1.uid,
          ],
          path: root0Child1.path,
        }));
      // assert all items are still there, even the new one is open
      expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(5);
      // assert the target child is active
      expect(targetChild.props()).toEqual({
        apiChange: null,
        expanded: true,
        filterPattern: null,
        isActive: true,
        isBold: true,
        isFocused: true,
        isRendered: false, // this is not passed in the mock
        item: root0Child1,
        enableFocus: false,
        navigatorReferences,
      });
      // assert item is scrolled to once
      expect(getChildPositionInScroller).toHaveBeenCalledTimes(2);
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenLastCalledWith(2); // 3-rd item
      // now simulate the router change
      wrapper.setProps({ activePath: [root0.path, root0Child1.path] });
      await flushPromises();
      // assert its not called again
      expect(getChildPositionInScroller).toHaveBeenCalledTimes(2);
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
      // assert items have not changed
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(5);
      expect(allItems.at(2).props()).toEqual({
        apiChange: null,
        expanded: true,
        filterPattern: null,
        isActive: true,
        isBold: true,
        isFocused: true,
        isRendered: false, // this is not passed in the mock
        item: root0Child1,
        enableFocus: false,
        navigatorReferences,
      });
    });

    it('allows going back/forward, relative to last opened item, ignoring foreign trees', async () => {
      const duplicatedTree = {
        type: 'article',
        path: '/documentation/duplicated',
        title: 'Duplicated Tree',
        uid: 5,
        parent: INDEX_ROOT_KEY,
        depth: 0,
        index: 2,
        // this makes sure we have a duplicate tree segment
        childUIDs: [root0Child1],
      };
      const wrapper = createWrapper({
        propsData: {
          children: [
            ...children,
            duplicatedTree,
          ],
        },
      });
      await flushPromises();
      let allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems).toHaveLength(5);
      expect(allItems.at(1).props('item')).toEqual(root0Child0);
      expect(allItems.at(1).props('isActive')).toEqual(true);
      // navigate to the second child
      wrapper.setProps({
        activePath: [
          root0.path,
          root0Child1.path,
        ],
      });
      await wrapper.vm.$nextTick();
      // re-fetch the items
      allItems = wrapper.findAll(NavigatorCardItem);
      // assert old item is no longer active
      expect(allItems.at(1).props('item')).toEqual(root0Child0);
      expect(allItems.at(1).props('isActive')).toEqual(false);
      // assert new active item
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(2).props('isActive')).toEqual(true);
      // navigate to the grand child
      wrapper.setProps({
        activePath: [
          root0.path,
          root0Child1.path,
          root0Child1GrandChild0.path,
        ],
      });
      await wrapper.vm.$nextTick();
      // re-fetch the items
      allItems = wrapper.findAll(NavigatorCardItem);
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(2).props('isActive')).toEqual(false);
      // assert grandchild is active
      expect(allItems.at(3).props('item')).toEqual(root0Child1GrandChild0);
      expect(allItems.at(3).props('isActive')).toEqual(true);
      // navigate to the second child
      wrapper.setProps({
        activePath: [
          root0.path,
          root0Child1.path,
        ],
      });
      await wrapper.vm.$nextTick();
      // re-fetch the items
      allItems = wrapper.findAll(NavigatorCardItem);
      // assert old item is no longer active
      expect(allItems.at(3).props('item')).toEqual(root0Child1GrandChild0);
      expect(allItems.at(3).props('isActive')).toEqual(false);
      // assert new active item
      expect(allItems.at(2).props('item')).toEqual(root0Child1);
      expect(allItems.at(2).props('isActive')).toEqual(true);
    });

    it('does not break, if the children change, while we already have an activeUID', async () => {
      const root0Dupe = {
        ...root0,
        uid: root0.uid + 10,
        childUIDs: [
          root0Child0.uid + 10,
          root0Child1.uid + 10,
        ],
      };
      const root0Child0Dupe = {
        ...root0Child0,
        uid: root0Child0.uid + 10,
        parent: root0Dupe.uid,
      };
      const root0Child1Dupe = {
        ...root0Child1,
        uid: root0Child1.uid + 10,
        parent: root0Dupe.uid,
        childUIDs: [],
      };
      // mount with the root item being active
      const wrapper = createWrapper({
        propsData: {
          children: [root1],
          activePath: [
            root1.path,
          ],
        },
      });
      await flushPromises();
      expect(wrapper.findAll(NavigatorCardItem).at(0).props()).toMatchObject({
        item: root1,
        isActive: true,
        isBold: true,
      });
      // change children
      wrapper.setProps({
        children: [
          root0Dupe,
          root0Child0Dupe,
          root0Child1Dupe,
        ],
      });

      // simulate its taking time to fetch the items
      await flushPromises();
      // change the activePath later
      wrapper.setProps({
        activePath: [
          root0Dupe.path,
          root0Child0Dupe.path,
        ],
      });
      await flushPromises();
      // assert no errors
      const all = wrapper.findAll(NavigatorCardItem);
      expect(all).toHaveLength(3);
      expect(all.at(0).props('item')).toEqual(root0Dupe);
      expect(all.at(1).props('item')).toEqual(root0Child0Dupe);
    });

    it('does not store the activeUID of clicked items, with different path than the `technologyPath`', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      const allItems = wrapper.findAll(NavigatorCardItem);
      const target = allItems.at(3);
      expect(target.props('item')).toEqual(root1);
      // trigger a navigation
      target.vm.$emit('navigate', root1.uid);
      expect(sessionStorage.set).toHaveBeenCalledTimes(2);
      await wrapper.vm.$nextTick();
      expect(sessionStorage.set).toHaveBeenCalledTimes(2);
    });
  });

  describe('scroll to item', () => {
    it('resets the scroll position, if initiating a filter', async () => {
      attachDivWithID(root0Child0.uid);
      // simulate item is above the scrollarea
      getChildPositionInScroller.mockReturnValueOnce(1);
      const wrapper = createWrapper();
      await flushPromises();
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenLastCalledWith(1);
      // initiate a filter
      wrapper.find(FilterInput).vm.$emit('input', root0Child1.title);
      await wrapper.vm.$nextTick();
      // assert filter is applied
      expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(2);
      // assert scroller has been reset
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(2);
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenLastCalledWith(0);
    });

    it('scrolls to item, if HIDE_DEPRECATED_TAG is picked', async () => {
      attachDivWithID(root0Child0.uid);
      // simulate item is in viewport
      getChildPositionInScroller.mockReturnValueOnce(0);
      const wrapper = createWrapper();
      await flushPromises();
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(0);
      // simulate item is below the viewport
      getChildPositionInScroller.mockReturnValueOnce(1);
      // add the "Hide Deprecated" tag
      wrapper.find(FilterInput).vm.$emit('update:selectedTags', [HIDE_DEPRECATED_TAG]);
      await flushPromises();
      // assert current active item is still scrolled to
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenLastCalledWith(1);
    });

    it('keeps the scroll position, if the item is already in the viewport, on navigation', async () => {
      attachDivWithID(root0Child0.uid);
      const wrapper = createWrapper();
      await flushPromises();
      // assert scrollToItem is not called, because its "in view"
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(0);
      attachDivWithID(root0Child1.uid);
      wrapper.findAll(NavigatorCardItem).at(2).vm.$emit('navigate', root0Child1.uid);
      await flushPromises();
      // make sure scrollToItem is not called again, because active item is still in the viewport
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(0);
      // simulate item is below the fold and assert navigating to new place scrolls the item
      getChildPositionInScroller.mockReturnValueOnce(1);
      // prepare
      attachDivWithID(root0Child1GrandChild0.uid);
      // navigate
      wrapper.findAll(NavigatorCardItem).at(2).vm.$emit('navigate', root0Child1GrandChild0.uid);
      await flushPromises();
      // assert scrollToItem is called, because item was under the fold
      expect(DynamicScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
      expect(DynamicScrollerStub.methods.scrollToItem)
        .toHaveBeenLastCalledWith(3);
    });

    it('scrolls to the focused item, if not visible, as with the size of its closes parent', async () => {
      const wrapper = createWrapper();
      const scrollBySpy = jest.fn();
      wrapper.find({ ref: 'scroller' }).element.scrollBy = scrollBySpy;
      await flushPromises();
      expect(scrollBySpy).toHaveBeenCalledTimes(0);
      // simulate item is not visible
      getChildPositionInScroller.mockReturnValueOnce(1);
      const items = wrapper.findAll(NavigatorCardItem);

      const fourthItem = items.at(3);
      setOffsetParent(fourthItem.element, { offsetHeight: SIDEBAR_ITEM_SIZE });
      fourthItem.trigger('focusin');
      await flushPromises();
      expect(scrollBySpy).toHaveBeenCalledTimes(1);
      expect(scrollBySpy).toHaveBeenCalledWith({
        top: SIDEBAR_ITEM_SIZE,
        left: 0,
      });
      // simulate item is above the visible area
      getChildPositionInScroller.mockReturnValueOnce(-1);
      const firstItem = items.at(0);
      setOffsetParent(firstItem.element, { offsetHeight: SIDEBAR_ITEM_SIZE + 50 });
      firstItem.trigger('focusin');
      await flushPromises();
      expect(scrollBySpy).toHaveBeenCalledTimes(2);
      expect(scrollBySpy).toHaveBeenCalledWith({
        top: -1 * (SIDEBAR_ITEM_SIZE + 50),
        left: 0,
      });
    });
  });

  describe('handles focus/blur state issues with the DynamicScroller', () => {
    it('keeps track of the currently focused item', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      const button = wrapper.find(NavigatorCardItem).find('button');
      // should be focus, but jsdom does not propagate that
      button.trigger('focusin');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.lastFocusTarget).toEqual(button.element);
    });

    it('resets the `lastFocusTarget`, if the related target is outside the scroller', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      const button = wrapper.find(NavigatorCardItem).find('button');
      // should be focus, but jsdom does not propagate that
      button.trigger('focusin');
      await wrapper.vm.$nextTick();
      button.trigger('focusout', {
        relatedTarget: document.body,
      });
      expect(wrapper.vm.lastFocusTarget).toEqual(null);
    });

    it('does not do anything, if there is no `relatedTarget`, if no relatedTarget', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      const button = wrapper.find(NavigatorCardItem).find('button');
      // should be focus, but jsdom does not propagate that
      button.trigger('focusin');
      await wrapper.vm.$nextTick();
      button.trigger('focusout', {
        relatedTarget: null,
      });
      // assert we are still focusing the button
      expect(wrapper.vm.lastFocusTarget).toEqual(button.element);
    });

    it('on DynamicScroller@update, does nothing, if there is no focusTarget', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      wrapper.find(DynamicScroller).vm.$emit('update');
      await flushPromises();
      expect(waitFor).toHaveBeenLastCalledWith(300);
      expect(wrapper.vm.lastFocusTarget).toEqual(null);
    });

    it('on DynamicScroller@update, does nothing, if focusTarget is outside scroller', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      // Set the focus item to be something outside the scroller.
      // This might happen if it deletes an item, that was in focus
      const button = wrapper.find(NavigatorCardItem).find('button');
      // should be focus, but jsdom does not propagate that
      button.trigger('focusin');
      const focusSpy = jest.spyOn(button.element, 'focus');
      await flushPromises();
      // now make the component go away
      wrapper.setData({
        nodesToRender: [],
      });
      await flushPromises();
      // trigger an update
      wrapper.find(DynamicScroller).vm.$emit('update');
      await flushPromises();
      expect(waitFor).toHaveBeenLastCalledWith(300);
      // we may still have the lastFocusTarget, as it did not emit a focusOut
      expect(wrapper.vm.lastFocusTarget).not.toEqual(null);
      // but the spy will not be called, because its no longer in the DOM
      expect(focusSpy).toHaveBeenCalledTimes(0);
    });

    it('on DynamicScroller@update, does nothing, if `lastFocusTarget === activeElement`', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      // Set the focus item to be something outside the scroller.
      // This might happen if it deletes an item, that was in focus
      const button = wrapper.find(NavigatorCardItem).find('button');
      // should be focus, but jsdom does not propagate that
      button.trigger('focusin');
      button.element.focus();
      // move the spy below the manual focus, so we dont count it
      const focusSpy = jest.spyOn(button.element, 'focus');
      await flushPromises();
      expect(document.activeElement).toEqual(button.element);
      // trigger an update
      wrapper.find(DynamicScroller).vm.$emit('update');
      await flushPromises();
      expect(wrapper.vm.lastFocusTarget).toEqual(button.element);
      expect(focusSpy).toHaveBeenCalledTimes(0);
    });

    it('on DynamicScroller@update, re-focuses the `lastFocusTarget` if not the current focus item', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      // Set the focus item to be something outside the scroller.
      // This might happen if it deletes an item, that was in focus
      const button = wrapper.find(NavigatorCardItem).find('button');
      const focusSpy = jest.spyOn(button.element, 'focus');
      button.trigger('focusin');
      await flushPromises();
      // trigger an update
      wrapper.find(DynamicScroller).vm.$emit('update');
      await flushPromises();
      expect(wrapper.vm.lastFocusTarget).toEqual(button.element);
      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('clears the focusTarget on filter', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      // Set the focus item to be something outside the scroller.
      // This might happen if it deletes an item, that was in focus
      const button = wrapper.find(NavigatorCardItem).find('button');
      // should be focus, but jsdom does not propagate that
      button.trigger('focusin');
      const focusSpy = jest.spyOn(button.element, 'focus');
      await flushPromises();
      // initiate a filter
      wrapper.find(FilterInput).vm.$emit('input', 'Child');
      await flushPromises();
      // trigger an update
      wrapper.find(DynamicScroller).vm.$emit('update');
      await flushPromises();
      expect(wrapper.vm.lastFocusTarget).toEqual(null);
      expect(focusSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('getChildPositionInScroller', () => {
    it('returns -1 if item is above the scrollarea', () => {
      getChildPositionInScroller.mockRestore();
      const wrapper = createWrapper();
      jest.spyOn(wrapper.find({ ref: 'scroller' }).element, 'getBoundingClientRect')
        .mockReturnValueOnce({
          y: 50,
          height: 1000,
        });
      const element = {
        getBoundingClientRect: () => ({
          y: 25,
        }),
        offsetParent: {
          offsetHeight: SIDEBAR_ITEM_SIZE,
        },
      };
      expect(wrapper.vm.getChildPositionInScroller(element)).toBe(-1);
    });

    it('returns 1 if items is below the scrollarea', () => {
      getChildPositionInScroller.mockRestore();
      const wrapper = createWrapper();
      jest.spyOn(wrapper.find({ ref: 'scroller' }).element, 'getBoundingClientRect')
        .mockReturnValueOnce({
          y: 50,
          height: 1000,
        });
      const element = {
        getBoundingClientRect: () => ({
          y: 1050,
        }),
        offsetParent: {
          offsetHeight: SIDEBAR_ITEM_SIZE,
        },
      };
      expect(wrapper.vm.getChildPositionInScroller(element)).toBe(1);
    });

    it('takes into consideration the padding offsets', () => {
      getChildPositionInScroller.mockRestore();
      const wrapper = createWrapper();
      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        paddingTop: '10px',
        paddingBottom: '20px',
      });
      jest.spyOn(wrapper.find({ ref: 'scroller' }).element, 'getBoundingClientRect')
        .mockReturnValue({
          y: 50,
          height: 1000,
        });
      expect(wrapper.vm.getChildPositionInScroller({
        getBoundingClientRect: () => ({
          y: 55, // visible, but not, when considering the offset
        }),
        offsetParent: {
          offsetHeight: SIDEBAR_ITEM_SIZE,
        },
      })).toBe(-1);
      expect(wrapper.vm.getChildPositionInScroller({
        getBoundingClientRect: () => ({
          y: 1010, // visible, but not, when considering the offset
        }),
        offsetParent: {
          offsetHeight: SIDEBAR_ITEM_SIZE,
        },
      })).toBe(1);
    });

    it('returns 0 if the item is in the scrollarea', () => {
      getChildPositionInScroller.mockRestore();
      const wrapper = createWrapper();
      jest.spyOn(wrapper.find({ ref: 'scroller' }).element, 'getBoundingClientRect')
        .mockReturnValueOnce({
          y: 50,
          height: 1000,
        });
      const element = {
        getBoundingClientRect: () => ({
          y: 250,
        }),
        offsetParent: {
          offsetHeight: SIDEBAR_ITEM_SIZE,
        },
      };
      expect(wrapper.vm.getChildPositionInScroller(element)).toBe(0);
    });
  });
});
