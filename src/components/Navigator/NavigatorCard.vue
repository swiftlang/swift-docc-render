<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="navigator-card">
    <div class="navigator-card-full-height">
      <div class="navigator-card-inner">
        <div class="head-wrapper">
          <button class="close-card-mobile" @click="$emit('close')">
            <SidenavIcon class="icon-inline close-icon" />
          </button>
          <Reference :url="technologyPath" class="navigator-head" :id="INDEX_ROOT_KEY">
            <div class="card-link">
              {{ technology }}
            </div>
          </Reference>
        </div>
        <slot name="post-head" />
        <div
          class="card-body"
          @keydown.alt.up.capture.prevent="focusFirst"
          @keydown.alt.down.capture.prevent="focusLast"
          @keydown.up.exact.capture.prevent="focusPrev"
          @keydown.down.exact.capture.prevent="focusNext"
        >
          <RecycleScroller
            v-show="hasNodes"
            :id="scrollLockID"
            ref="scroller"
            class="scroller"
            aria-label="Sidebar Tree Navigator"
            :items="nodesToRender"
            :item-size="itemSize"
            :buffer="1000"
            emit-update
            key-field="uid"
            v-slot="{ item, active, index }"
            @focusin.native="handleFocusIn"
            @focusout.native="handleFocusOut"
            @update="handleScrollerUpdate"
          >
            <NavigatorCardItem
              :item="item"
              :isRendered="active"
              :filter-pattern="filterPattern"
              :is-active="item.uid === activeUID"
              :is-bold="activePathMap[item.uid]"
              :expanded="openNodes[item.uid]"
              :api-change="apiChangesObject[item.path]"
              :isFocused="focusedIndex === index"
              :enableSelfFocus="!externalFocusChange"
              @toggle="toggle"
              @toggle-full="toggleFullTree"
              @toggle-siblings="toggleSiblings"
              @navigate="setActiveUID"
            />
          </RecycleScroller>
          <div aria-live="polite" class="visuallyhidden">
            {{ politeAriaLive }}
          </div>
          <div aria-live="assertive" class="no-items-wrapper">
            {{ assertiveAriaLive }}
          </div>
        </div>
      </div>
    </div>
    <div class="filter-wrapper" v-if="!errorFetching">
      <div class="navigator-filter">
        <div class="input-wrapper">
          <FilterInput
            v-model="filter"
            :tags="availableTags"
            :selected-tags.sync="selectedTagsModelValue"
            :placeholder="`Filter in ${technology}`"
            :should-keep-open-on-blur="false"
            :position-reversed="isLargeBreakpoint"
            :clear-filter-on-tag-select="false"
            class="filter-component"
            @clear="clearFilters"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import { clone } from 'docc-render/utils/data';
import { waitFrames, waitFor } from 'docc-render/utils/loading';
import debounce from 'docc-render/utils/debounce';
import { sessionStorage } from 'docc-render/utils/storage';
import { INDEX_ROOT_KEY, SIDEBAR_ITEM_SIZE } from 'docc-render/constants/sidebar';
import { safeHighlightPattern } from 'docc-render/utils/search-utils';
import NavigatorCardItem from 'docc-render/components/Navigator/NavigatorCardItem.vue';
import SidenavIcon from 'theme/components/Icons/SidenavIcon.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import { TopicTypes } from 'docc-render/constants/TopicTypes';
import FilterInput from 'docc-render/components/Filter/FilterInput.vue';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import keyboardNavigation from 'docc-render/mixins/keyboardNavigation';
import { last } from 'docc-render/utils/arrays';

const STORAGE_KEYS = {
  filter: 'navigator.filter',
  technology: 'navigator.technology',
  openNodes: 'navigator.openNodes',
  nodesToRender: 'navigator.nodesToRender',
  selectedTags: 'navigator.selectedTags',
  apiChanges: 'navigator.apiChanges',
  activeUID: 'navigator.activeUID',
};

const NO_RESULTS = 'No results matching your filter';
const NO_CHILDREN = 'No data available';
const ERROR_FETCHING = 'There was an error fetching the data';
const ITEMS_FOUND = 'items were found. Tab back to navigate through them.';

const FILTER_TAGS = {
  sampleCode: 'sampleCode',
  tutorials: 'tutorials',
  articles: 'articles',
};

const FILTER_TAGS_TO_LABELS = {
  [FILTER_TAGS.sampleCode]: 'Sample Code',
  [FILTER_TAGS.tutorials]: 'Tutorials',
  [FILTER_TAGS.articles]: 'Articles',
};

const FILTER_LABELS_TO_TAGS = Object.fromEntries(
  Object
    .entries(FILTER_TAGS_TO_LABELS)
    .map(([key, value]) => [value, key]),
);

const TOPIC_TYPE_TO_TAG = {
  [TopicTypes.article]: FILTER_TAGS.articles,
  [TopicTypes.learn]: FILTER_TAGS.tutorials,
  [TopicTypes.overview]: FILTER_TAGS.tutorials,
  [TopicTypes.resources]: FILTER_TAGS.tutorials,
  [TopicTypes.sampleCode]: FILTER_TAGS.sampleCode,
  [TopicTypes.section]: FILTER_TAGS.tutorials,
  [TopicTypes.tutorial]: FILTER_TAGS.tutorials,
  [TopicTypes.project]: FILTER_TAGS.tutorials,
};

/**
 * Renders the card for a technology and it's child symbols, in the navigator.
 * For performance reasons, the component uses watchers over computed, so we can more precisely
 * manage when re-calculations and re-rendering is done.
 */
export default {
  name: 'NavigatorCard',
  constants: {
    STORAGE_KEYS,
    FILTER_TAGS,
    FILTER_TAGS_TO_LABELS,
    FILTER_LABELS_TO_TAGS,
    TOPIC_TYPE_TO_TAG,
    NO_RESULTS,
    NO_CHILDREN,
    ERROR_FETCHING,
    ITEMS_FOUND,
  },
  components: {
    FilterInput,
    SidenavIcon,
    NavigatorCardItem,
    RecycleScroller,
    Reference,
  },
  props: {
    technology: {
      type: String,
      required: true,
    },
    children: {
      type: Array,
      required: true,
    },
    activePath: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    technologyPath: {
      type: String,
      default: '',
    },
    scrollLockID: {
      type: String,
      default: '',
    },
    errorFetching: {
      type: Boolean,
      default: false,
    },
    breakpoint: {
      type: String,
      default: '',
    },
    apiChanges: {
      type: Object,
      default: null,
    },
  },
  mixins: [
    keyboardNavigation,
  ],
  data() {
    return {
      // value to v-model the filter to
      filter: '',
      // debounced filter value, to reduce the computed property computations. Used in filter logic.
      debouncedFilter: '',
      selectedTags: [],
      /** @type {Object.<string, boolean>} */
      openNodes: {},
      /** @type {NavigatorFlatItem[]} */
      nodesToRender: [],
      activeUID: null,
      resetScroll: false,
      lastFocusTarget: null,
      NO_RESULTS,
      NO_CHILDREN,
      ERROR_FETCHING,
      ITEMS_FOUND,
    };
  },
  computed: {
    INDEX_ROOT_KEY: () => INDEX_ROOT_KEY,
    politeAriaLive: ({ hasNodes, nodesToRender }) => {
      if (!hasNodes) return '';
      return [nodesToRender.length, ITEMS_FOUND].join(' ');
    },
    assertiveAriaLive: ({ hasNodes, hasFilter, errorFetching }) => {
      if (hasNodes) return '';
      if (hasFilter) return NO_RESULTS;
      if (errorFetching) return ERROR_FETCHING;
      return NO_CHILDREN;
    },
    availableTags: ({ selectedTags }) => (
      selectedTags.length
        ? []
        : Object.values(FILTER_TAGS_TO_LABELS)
    ),
    selectedTagsModelValue: {
      get: ({ selectedTags }) => selectedTags.map(tag => FILTER_TAGS_TO_LABELS[tag]),
      set(values) {
        this.selectedTags = values.map(label => FILTER_LABELS_TO_TAGS[label]);
        this.resetScroll = true;
      },
    },
    filterPattern: ({ debouncedFilter }) => (!debouncedFilter
      ? null
      // remove the `g` for global, as that causes bugs when matching
      : new RegExp(safeHighlightPattern(debouncedFilter), 'i')),
    /**
     * Return the item size for the Scroller element.
     */
    itemSize: () => SIDEBAR_ITEM_SIZE,
    /**
     * Generates a map of the children, with the uid as the key.
     * @return {Object.<string, NavigatorFlatItem>}
     */
    childrenMap({ children }) {
      return Object.fromEntries(children.map(child => [child.uid, child]));
    },
    /**
     * Returns an array of {NavigatorFlatItem}, from the current active UUID
     * @return NavigatorFlatItem[]
     */
    activePathChildren({ activeUID, childrenMap }) {
      // if we have an activeUID and its not stale by any chance, fetch its parents
      return activeUID && childrenMap[activeUID]
        ? this.getParents(activeUID)
        : [];
    },
    activePathMap: ({ activePathChildren }) => (
      Object.fromEntries(activePathChildren.map(({ uid }) => [uid, true]))
    ),
    activeIndex: ({ activeUID, nodesToRender }) => (
      nodesToRender.findIndex(node => node.uid === activeUID)
    ),
    /**
     * Returns a list of the child nodes, that match the filter pattern.
     * @returns NavigatorFlatItem[]
     */
    filteredChildren({
      hasFilter, children, filterPattern, selectedTags,
      apiChangesObject, apiChanges,
    }) {
      if (!hasFilter) return [];
      const tagsSet = new Set(selectedTags);
      // find children that match current filters
      return children.filter(({ title, path, type }) => {
        // check if `title` matches the pattern, if provided
        const titleMatch = filterPattern ? filterPattern.test(title) : true;
        // check if `type` matches any of the selected tags
        const tagMatch = selectedTags.length
          ? tagsSet.has(TOPIC_TYPE_TO_TAG[type]) : true;
        // find items, that have API changes
        const hasAPIChanges = apiChanges ? apiChangesObject[path] : true;
        // make sure groupMarker's dont get matched
        return titleMatch && tagMatch && hasAPIChanges && type !== TopicTypes.groupMarker;
      });
    },
    /**
     * Creates a computed for the two items, that the openNodes calc depends on
     */
    nodeChangeDeps: ({
      filteredChildren, activePathChildren, debouncedFilter, selectedTags,
    }) => ([
      filteredChildren,
      activePathChildren,
      debouncedFilter,
      selectedTags,
    ]),
    // determine if we should use the filtered items for rendering nodes
    hasFilter({ debouncedFilter, selectedTags, apiChanges }) {
      return Boolean(debouncedFilter.length || selectedTags.length || apiChanges);
    },
    apiChangesObject() {
      return this.apiChanges || {};
    },
    isLargeBreakpoint: ({ breakpoint }) => breakpoint === BreakpointName.large,
    hasNodes: ({ nodesToRender }) => !!nodesToRender.length,
    totalItemsToNavigate: ({ nodesToRender }) => nodesToRender.length,
  },
  created() {
    this.restorePersistedState();
  },
  watch: {
    filter: 'debounceInput',
    nodeChangeDeps: 'trackOpenNodes',
    debouncedFilter(value) {
      sessionStorage.set(STORAGE_KEYS.filter, value);
    },
    selectedTags(value) {
      sessionStorage.set(STORAGE_KEYS.selectedTags, value);
    },
    activePath: 'handleActivePathChange',
  },
  methods: {
    clearFilters() {
      this.filter = '';
      this.debouncedFilter = '';
      this.selectedTags = [];
      this.resetScroll = true;
    },
    scrollToFocus() {
      this.$refs.scroller.scrollToItem(this.focusedIndex);
    },
    debounceInput: debounce(function debounceInput(value) {
      // store the new filter value
      this.debouncedFilter = value;
      // note to the component, that we want to reset the scroll
      this.resetScroll = true;
    }, 500),
    /**
     * Finds which nodes need to be opened.
     * Initiates a watcher, that reacts to filtering and page navigation.
     */
    trackOpenNodes(
      [filteredChildren, activePathChildren, filter, selectedTags],
      [, activePathChildrenBefore = [], filterBefore = '', selectedTagsBefore = []] = [],
    ) {
      // reset the last focus target
      this.lastFocusTarget = null;
      // skip in case this is a first mount and we are syncing the `filter` and `selectedTags`.
      if (
        (filter !== filterBefore && !filterBefore && sessionStorage.get(STORAGE_KEYS.filter))
        || (
          selectedTags.join() !== selectedTagsBefore.join()
          && !selectedTagsBefore.length
          && sessionStorage.get(STORAGE_KEYS.selectedTags, []).length
        )
      ) {
        return;
      }

      // decide which items are open
      const nodes = !this.hasFilter
        ? activePathChildren
        // get all parents of the current match, excluding it in the process
        : filteredChildren.flatMap(({ uid }) => this.getParents(uid).slice(0, -1));
      // if the activePath items change, we navigated to another page
      const pageChange = activePathChildrenBefore.join() !== activePathChildren.join();

      // create a map to track open items - `{ [UID]: true }`
      const newOpenNodes = Object.fromEntries(nodes
        .map(({ uid }) => [uid, true]));
      // if we navigate across pages, persist the previously open nodes
      this.openNodes = Object.assign(pageChange ? this.openNodes : {}, newOpenNodes);
      this.generateNodesToRender();
      // update the focus index, based on the activeUID
      this.updateFocusIndexExternally();
    },
    /**
     * Toggle a node open/close
     */
    toggle(node) {
      // check if the item is open
      const isOpen = this.openNodes[node.uid];
      let include = [];
      let exclude = [];
      // if open, we need to close it
      if (isOpen) {
        // clone the open nodes map
        const openNodes = clone(this.openNodes);
        // remove current node and all of it's children, from the open list
        const allChildren = this.getAllChildren(node.uid);
        allChildren.forEach(({ uid }) => {
          delete openNodes[uid];
        });
        // set the new open nodes. Should be faster than iterating each and calling `this.$delete`.
        this.openNodes = openNodes;
        // exclude all items, but the first
        exclude = allChildren.slice(1);
      } else {
        this.$set(this.openNodes, node.uid, true);
        // include all childUIDs to get opened
        include = node.childUIDs.map(id => this.childrenMap[id]);
      }
      this.augmentRenderNodes({ uid: node.uid, include, exclude });
    },
    /**
     * Handle toggling the entire tree open/close, using alt + click
     */
    toggleFullTree(node) {
      const isOpen = this.openNodes[node.uid];
      const openNodes = clone(this.openNodes);
      const allChildren = this.getAllChildren(node.uid);
      let exclude = [];
      let include = [];
      allChildren.forEach(({ uid }) => {
        if (isOpen) {
          delete openNodes[uid];
        } else {
          openNodes[uid] = true;
        }
      });

      // figure out which items to include and exclude
      if (isOpen) {
        exclude = allChildren.slice(1);
      } else {
        include = allChildren.slice(1);
      }
      this.openNodes = openNodes;
      this.augmentRenderNodes({ uid: node.uid, exclude, include });
    },
    toggleSiblings(node) {
      const isOpen = this.openNodes[node.uid];
      const openNodes = clone(this.openNodes);
      const siblings = this.getSiblings(node.uid);
      siblings.forEach(({ uid, childUIDs }) => {
        if (!childUIDs.length) return;
        if (isOpen) {
          const children = this.getAllChildren(uid);
          // remove all children
          children.forEach((child) => {
            delete openNodes[child.uid];
          });
          // remove the sibling as well
          delete openNodes[uid];
          // augment the nodesToRender
          this.augmentRenderNodes({ uid, exclude: children.slice(1), include: [] });
        } else {
          // add it
          openNodes[uid] = true;
          const children = this.getChildren(uid);
          // augment the nodesToRender
          this.augmentRenderNodes({ uid, exclude: [], include: children });
        }
      });
      this.openNodes = openNodes;
      // persist all the open nodes, as we change the openNodes after the node augment runs
      this.persistState();
    },
    /**
     * Get all children of a node recursively
     * @param {number} uid - the UID of the node
     * @return {NavigatorFlatItem[]}
     */
    getAllChildren(uid) {
      const arr = [];
      const stack = [uid];
      let current = null;

      // loop over the stack
      while (stack.length) {
        // get the top item
        current = stack.shift();
        // find the object
        const obj = this.childrenMap[current];
        // add it's uid
        arr.push(obj);
        // add all if it's children to the front of the stack
        stack.unshift(...obj.childUIDs);
      }

      return arr;
    },
    /**
     * Get all the parents of a node, up to the root.
     * @param {string} uid
     * @return {NavigatorFlatItem[]}
     */
    getParents(uid) {
      const arr = [];
      const stack = [uid];
      let current = null;

      // loop over the stack
      while (stack.length) {
        // get the top item
        current = stack.pop();
        // find the object
        const obj = this.childrenMap[current];
        if (!obj) {
          return [];
        }
        // push the object to the results
        arr.unshift(obj);
        // if the current object has a parent and its not the root, add it to the stack
        if (obj.parent && obj.parent !== INDEX_ROOT_KEY) {
          stack.push(obj.parent);
        }
      }
      return arr;
    },
    /**
     * Get all sibling nodes of a node
     * @return {NavigatorFlatItem[]}
     */
    getSiblings(uid) {
      const item = this.childrenMap[uid];
      if (!item) return [];
      return this.getChildren(item.parent);
    },
    /**
     * Get the direct child nodes of a node.
     * @return {NavigatorFlatItem[]}
     */
    getChildren(uid) {
      if (uid === INDEX_ROOT_KEY) {
        return this.children.filter(node => node.parent === INDEX_ROOT_KEY);
      }
      const item = this.childrenMap[uid];
      if (!item) return [];
      return (item.childUIDs || [])
        .map(child => this.childrenMap[child]);
    },
    /**
     * Stores all the nodes we should render at this point.
     * This gets called everytime you open/close a node,
     * or when you start filtering.
     * @return void
     */
    generateNodesToRender() {
      const {
        children, filteredChildren, hasFilter, openNodes,
      } = this;
      // create a set of all matches and their parents
      const allChildMatchesSet = new Set(filteredChildren
        .flatMap(({ uid }) => this.getParents(uid)));

      // generate the list of nodes to render
      this.nodesToRender = children
        .filter((child) => {
          // if we have no filter pattern, just show open nodes and root nodes
          if (!hasFilter) {
            // if parent is the root or parent is open
            return child.parent === INDEX_ROOT_KEY || openNodes[child.parent];
          }
          // if parent is the root and is in the child match set
          return (child.parent === INDEX_ROOT_KEY && allChildMatchesSet.has(child))
            // if the item itself is a direct match
            || allChildMatchesSet.has(child);
        });
      // persist all the open nodes
      this.persistState();
      // wait a frame, so the scroller is ready, `nextTick` is not enough.
      this.scrollToElement();
    },
    /**
     * Augments the nodesToRender, by injecting or removing items.
     * Used mainly to toggle items on/off
     */
    augmentRenderNodes({ uid, include = [], exclude = [] }) {
      const index = this.nodesToRender.findIndex(n => n.uid === uid);
      // decide if should remove or add
      if (include.length) {
        // remove duplicates
        const duplicatesRemoved = include.filter(i => !this.nodesToRender.includes(i));
        // if add, find where to inject items
        this.nodesToRender.splice(index + 1, 0, ...duplicatesRemoved);
      } else if (exclude.length) {
        // if remove, filter out those items
        const excludeSet = new Set(exclude);
        this.nodesToRender = this.nodesToRender.filter(item => !excludeSet.has(item));
      }
      this.persistState();
    },
    /**
     * Persists the current state, so its not lost if you refresh or navigate away
     */
    persistState() {
      sessionStorage.set(STORAGE_KEYS.technology, this.technology);
      sessionStorage.set(STORAGE_KEYS.apiChanges, !!this.apiChanges);
      // store the keys of the openNodes map, converting to number, to reduce space
      sessionStorage.set(STORAGE_KEYS.openNodes, Object.keys(this.openNodes).map(Number));
      // we need only the UIDs
      sessionStorage.set(STORAGE_KEYS.nodesToRender, this.nodesToRender.map(({ uid }) => uid));
    },
    clearPersistedState() {
      sessionStorage.set(STORAGE_KEYS.technology, '');
      sessionStorage.set(STORAGE_KEYS.apiChanges, false);
      sessionStorage.set(STORAGE_KEYS.openNodes, []);
      sessionStorage.set(STORAGE_KEYS.nodesToRender, []);
      sessionStorage.set(STORAGE_KEYS.activeUID, null);
      sessionStorage.set(STORAGE_KEYS.filter, '');
      sessionStorage.set(STORAGE_KEYS.selectedTags, []);
    },
    /**
     * Restores the persisted state from sessionStorage. Called on `create` hook.
     */
    restorePersistedState() {
      const technology = sessionStorage.get(STORAGE_KEYS.technology);
      const nodesToRender = sessionStorage.get(STORAGE_KEYS.nodesToRender, []);
      const filter = sessionStorage.get(STORAGE_KEYS.filter, '');
      const hasAPIChanges = sessionStorage.get(STORAGE_KEYS.apiChanges);
      const activeUID = sessionStorage.get(STORAGE_KEYS.activeUID, null);
      const selectedTags = sessionStorage.get(STORAGE_KEYS.selectedTags, []);
      // if for some reason there are no nodes and no filter, we can assume its bad cache
      if (!nodesToRender.length && !filter && !selectedTags.length) {
        // clear the sessionStorage before continuing
        this.clearPersistedState();
        this.handleActivePathChange(this.activePath);
        return;
      }
      // make sure all nodes exist in the childrenMap
      const allNodesMatch = nodesToRender.every(uid => this.childrenMap[uid]);
      // check if activeUID node matches the current page path
      const activeUIDMatchesCurrentPath = (activeUID && this.activePath.length)
        ? (this.childrenMap[activeUID] || {}).path === last(this.activePath)
        // if there is no activeUID this check is not relevant
        : true;
      // take a second pass at validating data
      if (
        // if the technology is different
        technology !== this.technology
        // if not all nodes to render match the ones we have
        || !allNodesMatch
        // if API the existence of apiChanges differs
        || (hasAPIChanges !== Boolean(this.apiChanges))
        || !activeUIDMatchesCurrentPath
        // if there is an activeUID and its not in the nodesToRender
        || (activeUID && !filter && !selectedTags.length && !nodesToRender.includes(activeUID))
      ) {
        // clear the sessionStorage before continuing
        this.clearPersistedState();
        this.handleActivePathChange(this.activePath);
        return;
      }
      // get all open nodes
      const openNodes = sessionStorage.get(STORAGE_KEYS.openNodes, []);
      // create the openNodes map
      this.openNodes = Object.fromEntries(openNodes.map(n => [n, true]));
      // get all the nodes to render
      // generate the array of flat children objects to render
      this.nodesToRender = nodesToRender.map(uid => this.childrenMap[uid]);
      // finally fetch any previously assigned filters or tags
      this.selectedTags = selectedTags;
      this.filter = filter;
      this.debouncedFilter = this.filter;
      this.activeUID = activeUID;
      // scroll to the active element
      this.scrollToElement();
    },
    async scrollToElement() {
      await waitFrames(1);
      if (!this.$refs.scroller) return;
      // if we are filtering, it makes more sense to scroll to top of list
      if (this.resetScroll) {
        this.$refs.scroller.scrollToItem(0);
        return;
      }
      // check if the current element is visible and needs scrolling into
      const element = document.getElementById(this.activeUID);
      if (element) {
        // get the position of the scroller in the screen
        const { y: areaY, height: areaHeight } = this.$refs.scroller.$el.getBoundingClientRect();
        // get the position of the active element
        const { y } = element.getBoundingClientRect();
        // calculate where it starts from
        const calculatedY = y - areaY;
        // if the element is within the scroll area, we dont need to scroll to it.
        if (calculatedY >= 0 && calculatedY < areaHeight) return;
      }
      // find the index of the current active UID in the newly added nodes
      const index = this.nodesToRender.findIndex(child => child.uid === this.activeUID);
      // check if the element is visible
      // call the scroll method on the `scroller` component.
      this.$refs.scroller.scrollToItem(index);
    },
    isInsideScroller(element) {
      return this.$refs.scroller.$el.contains(element);
    },
    handleFocusIn(event) {
      this.lastFocusTarget = event.target;
    },
    handleFocusOut(event) {
      if (!event.relatedTarget) return;
      // reset the `lastFocusTarget`, if the focsOut target is not in the scroller
      if (!this.isInsideScroller(event.relatedTarget)) {
        this.lastFocusTarget = null;
      }
    },
    handleScrollerUpdate: debounce(async function handleScrollerUpdate() {
      // wait is long, because the focus change is coming in very late
      await waitFor(300);
      if (
        !this.lastFocusTarget
        // check if the lastFocusTarget is inside the scroller. (can happen if we scroll to fast)
        || !this.isInsideScroller(this.lastFocusTarget)
        // check if the activeElement is identical to the lastFocusTarget
        || document.activeElement === this.lastFocusTarget
      ) {
        return;
      }
      this.lastFocusTarget.focus({
        preventScroll: true,
      });
    }, 50),
    /**
     * Stores the newly clicked item's UID, so we can highlight it
     */
    setActiveUID(uid) {
      this.activeUID = uid;
      this.resetScroll = false;
      sessionStorage.set(STORAGE_KEYS.activeUID, uid);
    },
    /**
     * Returns an array of {NavigatorFlatItem}, from a breadcrumbs list
     * @return NavigatorFlatItem[]
     */
    pathsToFlatChildren(paths) {
      // get the stack to iterate
      const stack = paths.slice(0).reverse();
      // the items to loop over. First iteration is over all items
      let childrenStack = this.children;
      const result = [];
      // loop as long as there are items
      while (stack.length) {
        // get the last item (first parent, as we reversed it)
        const currentPath = stack.pop();
        // find it by path (we dont have the UID yet)
        const currentNode = childrenStack.find(c => c.path === currentPath);
        if (!currentNode) break;
        // push the object to the results
        result.push(currentNode);
        if (stack.length) {
          // get the children, so we search in those
          childrenStack = currentNode.childUIDs.map(c => this.childrenMap[c]);
        }
      }
      return result;
    },
    handleActivePathChange(activePath) {
      // get current active item's node, if any
      const currentActiveItem = this.childrenMap[this.activeUID];
      // get the current path
      const lastActivePathItem = last(activePath);
      // check if there is an active item to start looking from
      if (currentActiveItem) {
        // Return early, if the current path matches the current active node.
        // This will happen on each navigator item click, as the activePath gets updated after
        // the navigation ends and RenderJSON is updated.
        if (lastActivePathItem === currentActiveItem.path) {
          return;
        }
        // Get the surrounding items
        const siblings = this.getSiblings(this.activeUID);
        const children = this.getChildren(this.activeUID);
        const parents = this.getParents(this.activeUID);
        // try to match if any of the `siblings`,`children` or any of the `parents`,
        // match the current open item
        const matchingItem = [...children, ...siblings, ...parents]
          .find(child => child.path === lastActivePathItem);

        // set the match as an active item
        if (matchingItem) {
          this.setActiveUID(matchingItem.uid);
          return;
        }
      }
      // There is no match to base upon, so we need to search
      // across the activePath for the active item.
      const activePathChildren = this.pathsToFlatChildren(activePath);
      // if there are items, set the new active UID
      if (activePathChildren.length) {
        this.setActiveUID(activePathChildren[activePathChildren.length - 1].uid);
        return;
      }
      // if there is an activeUID, unset it, as we probably navigated back to the root
      if (this.activeUID) {
        this.setActiveUID(null);
        return;
      }
      // Just track the open nodes, as setting the activeUID as null wont do anything.
      this.trackOpenNodes(this.nodeChangeDeps);
    },
    /**
     * Updates the current focusIndex, based on where the activeUID is.
     * If not in the rendered items, we set it to 0.
     */
    updateFocusIndexExternally() {
      // specify we changed the focus externally, not by using tabbing or up/down
      this.externalFocusChange = true;
      // if the activeUID is rendered, store it's index
      if (this.activeIndex > 0) {
        this.focusIndex(this.activeIndex);
      } else {
        // if there is no active item, or we cant see it, return the index to 0
        this.focusIndex(0);
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';
@import '~vue-virtual-scroller/dist/vue-virtual-scroller.css';

$navigator-card-vertical-spacing: 8px !default;
// unfortunately we need to hard-code the filter height
$filter-height: 71px;
$navigator-head-background: var(--color-fill-secondary) !default;
$navigator-head-background-active: var(--color-fill-tertiary) !default;

.navigator-card {
  --card-vertical-spacing: #{$navigator-card-vertical-spacing};
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;

  .navigator-card-full-height {
    height: 100%;
  }

  .navigator-card-inner {
    position: sticky;
    top: $nav-height;
    height: calc(100vh - #{$nav-height} - #{$filter-height});
    display: flex;
    flex-flow: column;
    @include breakpoint(medium, nav) {
      position: static;
      height: 100%;
    }
  }

  .head-wrapper {
    position: relative;
  }

  .navigator-head {
    padding: 10px $card-horizontal-spacing-large;
    background: $navigator-head-background;
    border-bottom: 1px solid var(--color-grid);
    display: flex;
    align-items: baseline;

    &.router-link-exact-active {
      background: $navigator-head-background-active;

      .card-link {
        font-weight: $font-weight-bold;
      }
    }

    &:hover {
      background: var(--color-navigator-item-hover);
      text-decoration: none;
    }

    @include breakpoint(medium, nav) {
      justify-content: center;
      padding: 14px $card-horizontal-spacing-large;
    }

    @include breakpoint(small, nav) {
      padding: 12px $card-horizontal-spacing-large;
    }
  }

  .card-icon {
    width: 19px;
    height: 19px;
  }
}

.no-items-wrapper {
  color: var(--color-figure-gray-tertiary);
  @include font-styles(body-reduced);
  padding: var(--card-vertical-spacing) $card-horizontal-spacing-large;
}

.close-card-mobile {
  display: none;
  position: absolute;
  z-index: 1;
  color: var(--color-link);
  align-items: center;
  justify-content: center;

  @include breakpoint(medium, nav) {
    display: flex;
    left: 0;
    height: 100%;
  }

  @include breakpoint(small, nav) {
    padding-left: $nav-padding-small;
    padding-right: $nav-padding-small;
  }

  .close-icon {
    width: 19px;
    height: 19px;
  }
}

.card-body {
  // right padding is added by the items, so visually the scroller is stuck to the side
  padding-right: 0;
  flex: 1 1 auto;
  min-height: 0;
  @include breakpoint(medium, nav) {
    --card-vertical-spacing: 0px;
    padding-top: $filter-height;
  }
}

.card-link {
  color: var(--color-text);
  @include font-styles(body-reduced);
  font-weight: $font-weight-semibold;
}

.navigator-filter {
  box-sizing: border-box;
  padding: 15px 30px;
  border-top: 1px solid var(--color-grid);
  height: $filter-height;
  display: flex;
  align-items: flex-end;

  @include breakpoint(medium, nav) {
    border: none;
    padding: 10px 20px;
    align-items: flex-start;
    height: 62px;
  }

  .input-wrapper {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .filter-component {
    --input-vertical-padding: 10px;
    --input-height: 20px;
    --input-border-color: var(--color-grid);
    --input-text: var(--color-figure-gray-secondary);

    /deep/ .filter__input {
      @include font-styles(body);
    }
  }
}

.scroller {
  height: 100%;
  box-sizing: border-box;
  padding: var(--card-vertical-spacing) 0;

  @include breakpoint(medium, nav) {
    padding-bottom: $nav-menu-items-ios-bottom-spacing;
  }
}

.filter-wrapper {
  position: sticky;
  bottom: 0;
  background: var(--color-fill);
  @include breakpoint(medium, nav) {
    position: absolute;
    top: $nav-height;
    bottom: auto;
    width: 100%;
  }
  @include breakpoint(small, nav) {
    top: $nav-height-small;
  }
}

</style>
