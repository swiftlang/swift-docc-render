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
import { shallowMount } from '@vue/test-utils';
import { TopicTypes } from '@/constants/TopicTypes';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'intersection-observer';
import { INDEX_ROOT_KEY, SIDEBAR_ITEM_SIZE } from '@/constants/sidebar';
import NavigatorCardItem from '@/components/Navigator/NavigatorCardItem.vue';
import { sessionStorage } from 'docc-render/utils/storage';
import Reference from '@/components/ContentNode/Reference.vue';
import FilterInput from '@/components/Filter/FilterInput.vue';
import { BreakpointName } from '@/utils/breakpoints';
import { flushPromises } from '../../../../test-utils';

jest.mock('docc-render/utils/debounce', () => jest.fn(fn => fn));
jest.mock('docc-render/utils/storage');
jest.mock('docc-render/utils/loading');

sessionStorage.get.mockImplementation((key, def) => def);

const {
  STORAGE_KEYS,
  FILTER_TAGS,
  FILTER_TAGS_TO_LABELS,
  NO_CHILDREN,
  NO_RESULTS,
  ERROR_FETCHING,
  ITEMS_FOUND,
} = NavigatorCard.constants;

const RecycleScrollerStub = {
  props: RecycleScroller.props,
  template: '<div class="vue-recycle-scroller-stub"><template v-for="item in items"><slot :item="item" /></template></div>',
  methods: {
    scrollToItem: jest.fn(),
  },
};
const root0 = {
  type: 'overview',
  path: '/tutorials/fookit',
  title: 'TopLevel',
  uid: 0,
  parent: INDEX_ROOT_KEY,
  depth: 0,
  index: 0,
  childUIDs: [
    1,
    2,
  ],
};

const root0Child0 = {
  type: 'tutorial',
  path: '/tutorials/fookit/first-child-depth-1',
  title: 'First Child, Depth 1',
  uid: 1,
  parent: '0',
  depth: 1,
  index: 0,
  childUIDs: [],
};
const root0Child1 = {
  type: 'tutorial',
  path: '/tutorials/fookit/second-child-depth-1',
  title: 'Second Child, Depth 1',
  uid: 2,
  parent: '0',
  depth: 1,
  index: 1,
  childUIDs: [
    3,
  ],
};
const root0Child1GrandChild0 = {
  type: 'tutorial',
  path: '/tutorials/fookit/second-child-depth-1/first-child-depth-2',
  title: 'First Child, Depth 2',
  uid: 3,
  parent: 2,
  depth: 2,
  index: 0,
  childUIDs: [],
};
const root1 = {
  abstract: [{
    text: 'Create a tutorial.',
    type: 'text',
  }],
  type: 'article',
  path: '/documentation/fookit/gettingstarted',
  title: 'Getting Started',
  uid: 4,
  parent: INDEX_ROOT_KEY,
  depth: 0,
  index: 1,
  childUIDs: [],
};

const children = [
  root0,
  root0Child0,
  root0Child1,
  root0Child1GrandChild0,
  root1,
];

const activePath = [root0.path, root0Child0.path];

const defaultProps = {
  technology: 'TestKit',
  technologyPath: '/path/to/technology',
  children,
  activePath,
  type: TopicTypes.module,
  scrollLockID: 'foo',
  breakpoint: 'large',
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(NavigatorCard, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  stubs: {
    RecycleScroller: RecycleScrollerStub,
  },
  sync: false,
  ...others,
});

describe('NavigatorCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders the NavigatorCard', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.card-icon').props('type')).toEqual(defaultProps.type);
    // assert link
    expect(wrapper.find(Reference).props('url')).toEqual(defaultProps.technologyPath);
    expect(wrapper.find('.card-link').text()).toBe(defaultProps.technology);
    // assert scroller
    const scroller = wrapper.find(RecycleScroller);
    expect(scroller.props()).toMatchObject({
      items: [
        root0,
        root0Child0,
        root0Child1, // we skip the grandchild, its parent is not open
        root1,
      ],
      itemSize: SIDEBAR_ITEM_SIZE,
      keyField: 'uid',
    });
    expect(wrapper.find(RecycleScroller).attributes('aria-label')).toBe('Sidebar Tree Navigator');
    expect(scroller.attributes('id')).toEqual(defaultProps.scrollLockID);
    // assert CardItem
    const items = wrapper.findAll(NavigatorCardItem);
    expect(items).toHaveLength(4);
    expect(items.at(0).props()).toEqual({
      expanded: true,
      isActive: false,
      isRendered: false,
      filterPattern: null,
      isBold: true,
      item: root0,
    });
    // assert no-items-wrapper
    expect(wrapper.find('.no-items-wrapper').exists()).toBe(true);
    // assert filter
    const filter = wrapper.find(FilterInput);
    expect(filter.props()).toEqual({
      disabled: false,
      focusInputWhenCreated: false,
      placeholder: 'Filter in TestKit',
      positionReversed: true,
      preventedBlur: false,
      shouldKeepOpenOnBlur: false,
      selectedTags: [],
      shouldTruncateTags: false,
      tags: [
        'Sample Code',
        'Tutorials',
        'Articles',
      ],
      value: '',
    });
  });

  it('reverses the FilterInput, on mobile', () => {
    const wrapper = createWrapper({
      propsData: {
        breakpoint: BreakpointName.medium,
      },
    });
    expect(wrapper.find(FilterInput).props('positionReversed')).toBe(false);
  });

  it('renders aria-live regions for polite and assertive notifications', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true);
    expect(wrapper.find('[aria-live="assertive"]').exists()).toBe(true);
  });

  it('hides the RecycleScroller, if no items to show', async () => {
    const wrapper = createWrapper();
    const scroller = wrapper.find(RecycleScroller);
    expect(scroller.isVisible()).toBe(true);
    wrapper.find(FilterInput).vm.$emit('input', 'bad-query');
    await wrapper.vm.$nextTick();
    expect(scroller.isVisible()).toBe(false);
  });

  it('renders a message updating aria-live, if no items found when filtering', async () => {
    const wrapper = createWrapper();
    const scroller = wrapper.find(RecycleScroller);
    expect(scroller.isVisible()).toBe(true);
    wrapper.find(FilterInput).vm.$emit('input', 'bad-query');
    await wrapper.vm.$nextTick();
    expect(scroller.props('items')).toEqual([]);
    expect(scroller.isVisible()).toBe(false);
    expect(wrapper.find('[aria-live="assertive"].no-items-wrapper').text()).toBe(NO_RESULTS);
  });

  it('renders a message updating aria-live, if no children', () => {
    const wrapper = createWrapper({
      propsData: {
        children: [],
      },
    });
    const scroller = wrapper.find(RecycleScroller);
    expect(scroller.isVisible()).toBe(false);
    expect(wrapper.find('[aria-live="assertive"].no-items-wrapper').text()).toBe(NO_CHILDREN);
  });

  it('renders an error message updating aria-live, when there is an error in fetching', () => {
    const wrapper = createWrapper({
      propsData: {
        children: [],
        errorFetching: true,
      },
    });
    expect(wrapper.find('[aria-live="assertive"].no-items-wrapper').text()).toBe(ERROR_FETCHING);
    expect(wrapper.find('.filter-wrapper').exists()).toBe(false);
  });

  it('renders an hidden message updating aria-live, notifying how many items were found', async () => {
    const wrapper = createWrapper();
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

  it('opens an item, on @toggle', async () => {
    const wrapper = createWrapper();
    const item = root0Child1;
    let all = wrapper.findAll(NavigatorCardItem);
    const unopenedItem = all.at(2);
    expect(unopenedItem.props()).toEqual({
      expanded: false,
      isActive: false,
      isBold: false,
      item,
      filterPattern: null,
      isRendered: false,
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

  it('opens an item, and all of its children, on @toggle-full', async () => {
    const wrapper = createWrapper({
      propsData: {
        // make sure no items are open
        activePath: [],
      },
    });
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

  it('highlights the current page, and expands all of its parents', () => {
    const wrapper = createWrapper();
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

  it('allows filtering the items, opening all items, that have matches in children', async () => {
    const wrapper = createWrapper();
    const filter = wrapper.find(FilterInput);
    await flushPromises();
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
    filter.vm.$emit('input', root0Child1GrandChild0.title);
    await flushPromises();
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(2);
    // assert only the parens of the match are visible
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(3);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child1);
    expect(all.at(2).props('item')).toEqual(root0Child1GrandChild0);
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledWith(0);
  });

  it('allows filtering the items using Tags, opening all items, that have matches in children', async () => {
    const wrapper = createWrapper();
    const filter = wrapper.find(FilterInput);
    await flushPromises();
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
    filter.vm.$emit('update:selectedTags', [FILTER_TAGS_TO_LABELS.articles]);
    await flushPromises();
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(2);
    // assert only the parens of the match are visible
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(1);
    expect(all.at(0).props('item')).toEqual(root1);
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledWith(0);
  });

  it('aliases `project` to `tutorial`, when filtering using tags', async () => {
    const wrapper = createWrapper();
    const filter = wrapper.find(FilterInput);
    await flushPromises();
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
    filter.vm.$emit('update:selectedTags', [FILTER_TAGS_TO_LABELS.tutorials]);
    await flushPromises();
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(2);
    // assert only the parens of the match are visible
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(4);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child0);
    expect(all.at(2).props('item')).toEqual(root0Child1);
    expect(all.at(3).props('item')).toEqual(root0Child1GrandChild0);
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledWith(0);
  });

  it('allows filtering the items with filter and Tags, opening all items, that have matches in children', async () => {
    const wrapper = createWrapper();
    const filter = wrapper.find(FilterInput);
    await flushPromises();
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(1);
    filter.vm.$emit('update:selectedTags', [FILTER_TAGS_TO_LABELS.tutorials]);
    await flushPromises();
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledTimes(2);
    // assert only the parens of the match are visible
    let all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(4);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child0);
    expect(all.at(2).props('item')).toEqual(root0Child1);
    expect(all.at(3).props('item')).toEqual(root0Child1GrandChild0);
    // add filtering in top
    filter.vm.$emit('input', root0Child0.title);
    await flushPromises();
    all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(2);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(all.at(1).props('item')).toEqual(root0Child0);
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenCalledWith(0);
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

  it('changes the open item, when navigating across pages, keeping the previously open items', async () => {
    // simulate navigating to the bottom most item
    const wrapper = createWrapper();
    wrapper.setProps({
      activePath: [
        root0.path,
        root0Child1.path,
        root0Child1GrandChild0.path,
      ],
    });
    await flushPromises();
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenLastCalledWith(3);
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
    // navigate to the top level sibling
    wrapper.setProps({
      activePath: [
        root1.path,
      ],
    });
    await flushPromises();
    // assert it scrolls to the item
    expect(RecycleScrollerStub.methods.scrollToItem).toHaveBeenLastCalledWith(4);
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

  it('emits a `close` event', async () => {
    const wrapper = createWrapper();
    wrapper.find('.close-card-mobile').trigger('click');
    await flushPromises();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('persists the filtered state', async () => {
    const wrapper = createWrapper();
    // called for the initial 3 things
    expect(sessionStorage.set).toHaveBeenCalledTimes(3);
    expect(sessionStorage.set)
      .toHaveBeenCalledWith(STORAGE_KEYS.technology, defaultProps.technology);
    expect(sessionStorage.set)
      .toHaveBeenCalledWith(STORAGE_KEYS.openNodes, [0, 1]);
    expect(sessionStorage.set)
      .toHaveBeenCalledWith(STORAGE_KEYS.nodesToRender, [0, 1, 2, 4]);
    await flushPromises();
    wrapper.find(FilterInput).vm.$emit('input', root0Child1GrandChild0.title);
    wrapper.find(FilterInput).vm.$emit('update:selectedTags', [FILTER_TAGS_TO_LABELS.tutorials]);
    await flushPromises();
    expect(sessionStorage.set).toHaveBeenCalledTimes(8);
    expect(sessionStorage.set)
      .toHaveBeenCalledWith(STORAGE_KEYS.filter, root0Child1GrandChild0.title);
    expect(sessionStorage.set)
      .toHaveBeenCalledWith(STORAGE_KEYS.selectedTags, [FILTER_TAGS.tutorials]);
    expect(sessionStorage.set)
      .toHaveBeenCalledWith(STORAGE_KEYS.openNodes, [0, 1]);
    expect(sessionStorage.set)
      .toHaveBeenCalledWith(STORAGE_KEYS.nodesToRender, [0, 2, 3]);
  });

  it('restores the persisted state, from sessionStorage', () => {
    sessionStorage.get.mockImplementation((key) => {
      if (key === STORAGE_KEYS.filter) return root0.title;
      if (key === STORAGE_KEYS.technology) return defaultProps.technology;
      if (key === STORAGE_KEYS.nodesToRender) return [root0.uid];
      if (key === STORAGE_KEYS.openNodes) return [root0.uid];
      if (key === STORAGE_KEYS.selectedTags) return [FILTER_TAGS.tutorials];
      return '';
    });

    const wrapper = createWrapper();
    const all = wrapper.findAll(NavigatorCardItem);
    expect(all).toHaveLength(1);
    expect(all.at(0).props('item')).toEqual(root0);
    expect(wrapper.find(FilterInput).props('selectedTags'))
      .toEqual([FILTER_TAGS_TO_LABELS.tutorials]);
  });

  it('does not restore the state, if the technology is different', () => {
    sessionStorage.get.mockImplementation((key) => {
      if (key === STORAGE_KEYS.technology) return 'some-other';
      if (key === STORAGE_KEYS.nodesToRender) return [root0.uid];
      return '';
    });
    const wrapper = createWrapper();
    // assert we are render more than just the single item in the store
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(4);
  });

  it('does not restore the state, if the nodesToRender do not match what we have', () => {
    sessionStorage.get.mockImplementation((key) => {
      if (key === STORAGE_KEYS.technology) return defaultProps.technology;
      if (key === STORAGE_KEYS.nodesToRender) return [root0.uid, 'something-different'];
      return '';
    });
    const wrapper = createWrapper();
    // assert we are render more than just the single item in the store
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(4);
  });

  it('does not restore the state, if the nodesToRender and filter are empty', () => {
    sessionStorage.get.mockImplementation((key) => {
      if (key === STORAGE_KEYS.technology) return defaultProps.technology;
      if (key === STORAGE_KEYS.nodesToRender) return [];
      if (key === STORAGE_KEYS.filter) return '';
      return '';
    });
    const wrapper = createWrapper();
    // assert we are render more than just the single item in the store
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(4);
  });

  it('keeps the open state, even if there is a title filter', async () => {
    sessionStorage.get.mockImplementation((key) => {
      if (key === STORAGE_KEYS.filter) return root0Child1GrandChild0.title;
      if (key === STORAGE_KEYS.technology) return defaultProps.technology;
      // simulate we have collapses all, but the top item
      if (key === STORAGE_KEYS.nodesToRender) return [root0.uid, root0Child1.uid];
      if (key === STORAGE_KEYS.openNodes) return [root0.uid];
      if (key === STORAGE_KEYS.selectedTags) return [];
      return '';
    });
    const wrapper = createWrapper();
    await flushPromises();
    // assert we are render more than just whats in the store,
    // so the filter does not trigger re-calculations
    expect(wrapper.findAll(NavigatorCardItem)).toHaveLength(2);
  });

  it('keeps the open state, even if there is a Tag filter applied', async () => {
    sessionStorage.get.mockImplementation((key) => {
      if (key === STORAGE_KEYS.filter) return '';
      if (key === STORAGE_KEYS.technology) return defaultProps.technology;
      // simulate we have collapses all, but the top item
      if (key === STORAGE_KEYS.nodesToRender) return [root0.uid, root0Child1.uid];
      if (key === STORAGE_KEYS.openNodes) return [root0.uid];
      if (key === STORAGE_KEYS.selectedTags) return [FILTER_TAGS.tutorials];
      return '';
    });
    const wrapper = createWrapper();
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
    expect(filter.props('tags')).toHaveLength(3);
    filter.vm.$emit('update:selectedTags', [FILTER_TAGS_TO_LABELS.articles]);
    await flushPromises();
    expect(filter.props('tags')).toEqual([]);
  });
});
