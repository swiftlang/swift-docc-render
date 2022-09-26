<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="navigator-card" :class="{ 'filter-on-top': renderFilterOnTop }">
    <div class="navigator-card-full-height">
      <NavigatorCardInner>
        <div class="head-wrapper">
          <div class="head-inner">
            <button
              aria-label="Close documentation navigator"
              :id="SIDEBAR_HIDE_BUTTON_ID"
              class="close-card"
              :class="{ 'hide-on-large': !allowHiding }"
              @click="handleHideClick"
            >
              <SidenavIcon class="icon-inline close-icon" />
            </button>
            <Reference
              class="navigator-head"
              :url="technologyPath"
              :id="INDEX_ROOT_KEY"
              @click.alt.native.prevent="toggleAllNodes"
            >
              <h2 class="card-link">
                {{ technology }}
              </h2>
              <Badge v-if="isTechnologyBeta" variant="beta" />
            </Reference>
          </div>
        </div>
        <slot name="post-head" />
        <div
          class="card-body"
          @keydown.alt.up.capture.prevent="focusFirst"
          @keydown.alt.down.capture.prevent="focusLast"
          @keydown.up.exact.capture.prevent="focusPrev"
          @keydown.down.exact.capture.prevent="focusNext"
        >
          <DynamicScroller
            v-show="hasNodes"
            :id="scrollLockID"
            ref="scroller"
            class="scroller"
            aria-label="Documentation Navigator"
            :items="nodesToRender"
            :min-item-size="itemSize"
            emit-update
            key-field="uid"
            v-slot="{ item, active, index }"
            @focusin.native="handleFocusIn"
            @focusout.native="handleFocusOut"
            @update="handleScrollerUpdate"
          >
            <DynamicScrollerItem v-bind="{ active, item, dataIndex: index }">
              <NavigatorCardItem
                :item="item"
                :isRendered="active"
                :filter-pattern="filterPattern"
                :is-active="item.uid === activeUID"
                :is-bold="activePathMap[item.uid]"
                :expanded="openNodes[item.uid]"
                :api-change="apiChangesObject[item.path]"
                :isFocused="focusedIndex === index"
                :enableFocus="!externalFocusChange"
                :navigator-references="navigatorReferences"
                @toggle="toggle"
                @toggle-full="toggleFullTree"
                @toggle-siblings="toggleSiblings"
                @navigate="handleNavigationChange"
                @focus-parent="focusNodeParent"
              />
            </DynamicScrollerItem>
          </DynamicScroller>
          <div aria-live="polite" class="visuallyhidden">
            {{ politeAriaLive }}
          </div>
          <div aria-live="assertive" class="no-items-wrapper">
            <p class="no-items">
              {{ assertiveAriaLive }}
            </p>
          </div>
        </div>
        <div class="filter-wrapper" v-if="!errorFetching">
          <div class="navigator-filter">
            <div class="input-wrapper">
              <FilterInput
                v-model="filter"
                :tags="availableTags"
                :selected-tags.sync="selectedTagsModelValue"
                placeholder="Filter"
                :should-keep-open-on-blur="false"
                :position-reversed="!renderFilterOnTop"
                :clear-filter-on-tag-select="false"
                class="filter-component"
                @clear="clearFilters"
              />
            </div>
            <div
              class="magnifier-icon"
              @click="store.toggleShowQuickNavigationModal()"
              v-if="enableQuickNavigation"
            >
              <MagnifierIcon />
            </div>
          </div>
        </div>
      </NavigatorCardInner>
    </div>
  </div>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { clone } from 'docc-render/utils/data';
import { waitFrames, waitFor } from 'docc-render/utils/loading';
import debounce from 'docc-render/utils/debounce';
import { sessionStorage } from 'docc-render/utils/storage';
import {
  INDEX_ROOT_KEY,
  SIDEBAR_HIDE_BUTTON_ID,
  SIDEBAR_ITEM_SIZE,
} from 'docc-render/constants/sidebar';
import { safeHighlightPattern } from 'docc-render/utils/search-utils';
import NavigatorCardInner from 'docc-render/components/Navigator/NavigatorCardInner.vue';
import NavigatorCardItem from 'docc-render/components/Navigator/NavigatorCardItem.vue';
import SidenavIcon from 'theme/components/Icons/SidenavIcon.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import { TopicTypes } from 'docc-render/constants/TopicTypes';
import FilterInput from 'docc-render/components/Filter/FilterInput.vue';
import keyboardNavigation from 'docc-render/mixins/keyboardNavigation';
import { isEqual, last } from 'docc-render/utils/arrays';
import { ChangeNames, ChangeNameToType } from 'docc-render/constants/Changes';
import Badge from 'docc-render/components/Badge.vue';
import MagnifierIcon from 'docc-render/components/Icons/MagnifierIcon.vue';
import QuickNavigationStore from 'docc-render/stores/QuickNavigationStore';
import { baseNavOpenSidenavButtonId } from 'docc-render/constants/nav';

const STORAGE_KEY = 'navigator.state';

const NO_RESULTS = 'No results found.';
const NO_CHILDREN = 'No data available.';
const ERROR_FETCHING = 'There was an error fetching the data.';
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

const HIDE_DEPRECATED_TAG = 'Hide Deprecated';

/**
 * Renders the card for a technology and it's child symbols, in the navigator.
 * For performance reasons, the component uses watchers over computed, so we can more precisely
 * manage when re-calculations and re-rendering is done.
 */
export default {
  name: 'NavigatorCard',
  constants: {
    STORAGE_KEY,
    FILTER_TAGS,
    FILTER_TAGS_TO_LABELS,
    FILTER_LABELS_TO_TAGS,
    TOPIC_TYPE_TO_TAG,
    NO_RESULTS,
    NO_CHILDREN,
    ERROR_FETCHING,
    ITEMS_FOUND,
    HIDE_DEPRECATED_TAG,
  },
  components: {
    Badge,
    FilterInput,
    SidenavIcon,
    MagnifierIcon,
    NavigatorCardInner,
    NavigatorCardItem,
    DynamicScroller,
    DynamicScrollerItem,
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
    apiChanges: {
      type: Object,
      default: null,
    },
    isTechnologyBeta: {
      type: Boolean,
      default: false,
    },
    enableQuickNavigation: {
      type: Boolean,
      default: false,
    },
    allowHiding: {
      type: Boolean,
      default: true,
    },
    navigatorReferences: {
      type: Object,
      default: () => {},
    },
    renderFilterOnTop: {
      type: Boolean,
      default: false,
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
      store: QuickNavigationStore,
      lastFocusTarget: null,
      NO_RESULTS,
      NO_CHILDREN,
      ERROR_FETCHING,
      ITEMS_FOUND,
      allNodesToggled: false,
    };
  },
  computed: {
    SIDEBAR_HIDE_BUTTON_ID: () => SIDEBAR_HIDE_BUTTON_ID,
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
    /**
     * Generates an array of tag labels for filtering.
     * Shows only tags, that have children matches.
     */
    availableTags: ({
      selectedTags, renderableChildNodesMap, apiChangesObject,
    }) => {
      const tagLabels = selectedTags.length ? [] : Object.values(FILTER_TAGS_TO_LABELS);
      if (!tagLabels.length) return tagLabels;
      const apiChangesTypesSet = new Set(Object.values(apiChangesObject));

      const tagLabelsSet = new Set(tagLabels);
      const generalTags = new Set([HIDE_DEPRECATED_TAG]);
      // when API changes are available, remove the `HIDE_DEPRECATED_TAG` option
      if (apiChangesTypesSet.size) {
        generalTags.delete(HIDE_DEPRECATED_TAG);
      }
      const availableTags = {
        type: [],
        changes: [],
        other: [],
      };
      const children = Object.values(renderableChildNodesMap);
      const len = children.length;
      let i;
      // iterate over the nodes to render
      for (i = 0; i < len; i += 1) {
        // if there are no more tags to iterate over, end early
        if (!tagLabelsSet.size && !apiChangesTypesSet.size && !generalTags.size) {
          break;
        }
        // extract the type
        const { type, path, deprecated } = children[i];
        // grab the tagLabel
        const tagLabel = FILTER_TAGS_TO_LABELS[TOPIC_TYPE_TO_TAG[type]];
        const changeType = apiChangesObject[path];
        // try to match a tag
        if (tagLabelsSet.has(tagLabel)) {
          // if we have a match, store it
          availableTags.type.push(tagLabel);
          // remove the match, so we can end the filter early
          tagLabelsSet.delete(tagLabel);
        }
        if (changeType && apiChangesTypesSet.has(changeType)) {
          availableTags.changes.push(ChangeNames[changeType]);
          apiChangesTypesSet.delete(changeType);
        }
        if (deprecated && generalTags.has(HIDE_DEPRECATED_TAG)) {
          availableTags.other.push(HIDE_DEPRECATED_TAG);
          generalTags.delete(HIDE_DEPRECATED_TAG);
        }
      }
      return availableTags.type.concat(availableTags.changes, availableTags.other);
    },
    selectedTagsModelValue: {
      get: ({ selectedTags }) => selectedTags.map(tag => (
        FILTER_TAGS_TO_LABELS[tag] || ChangeNames[tag] || tag
      )),
      set(values) {
        // guard against accidental clearings
        if (!this.selectedTags.length && !values.length) return;
        this.selectedTags = values.map(label => (
          FILTER_LABELS_TO_TAGS[label] || ChangeNameToType[label] || label
        ));
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
      return this.convertChildrenArrayToObject(children);
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
      return children.filter(({
        title, path, type, deprecated, deprecatedChildrenCount, childUIDs,
      }) => {
        // groupMarkers know how many children they have and how many are deprecated
        const isDeprecated = deprecated || deprecatedChildrenCount === childUIDs.length;
        // check if `title` matches the pattern, if provided
        const titleMatch = filterPattern ? filterPattern.test(title) : true;
        // check if `type` matches any of the selected tags
        let tagMatch = true;
        if (selectedTags.length) {
          tagMatch = tagsSet.has(TOPIC_TYPE_TO_TAG[type]);
          // if there are API changes and there is no tag match, try to match change types
          if (apiChanges && !tagMatch) {
            tagMatch = tagsSet.has(apiChangesObject[path]);
          }
          if (!isDeprecated && tagsSet.has(HIDE_DEPRECATED_TAG)) {
            tagMatch = true;
          }
        }
        // find items, that have API changes
        const hasAPIChanges = apiChanges ? apiChangesObject[path] : true;
        // make sure groupMarker's dont get matched
        return titleMatch && tagMatch && hasAPIChanges;
      });
    },
    /**
     * Returns a Set of all nodes that match a filter, along with their parents.
     * @returns Set<NavigatorFlatItem>
     */
    filteredChildrenUpToRootSet: ({ filteredChildren, getParents, childrenMap }) => new Set(
      filteredChildren.flatMap(({ uid, groupMarkerUID }) => getParents(uid)
        .concat(childrenMap[groupMarkerUID] || [])),
    ),
    /**
     * This generates a map of all the nodes we are allowed to render at a certain time.
     * This is used on both toggling, as well as on navigation and filtering.
     * @return {Object.<string, NavigatorFlatItem>}
     */
    renderableChildNodesMap({
      filteredChildrenUpToRootSet, childrenMap, hasFilter,
      getAllChildren, convertChildrenArrayToObject, removeDeprecated,
    }) {
      if (!hasFilter) return childrenMap;
      let all = [];
      // create a set of all matches and their parents
      filteredChildrenUpToRootSet.forEach((current) => {
        // if it's a plain end node, just add it
        if (!current.childUIDs.length) {
          all.push(current);
          return;
        }
        // check if none of the child items of this parent are matching
        const noChildrenMatch = !current.childUIDs.some(uid => (
          filteredChildrenUpToRootSet.has(childrenMap[uid])
        ));
        // if no children are matching, add all to the list, otherwise just the current parent
        all = all.concat(noChildrenMatch ? removeDeprecated(getAllChildren(current.uid)) : current);
      });
      return convertChildrenArrayToObject(all);
    },
    /**
     * Creates a computed for the items, that the openNodes calc depends on
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
    /**
     * Determine if "Hide Deprecated" tag is selected.
     * If we enable multiple tags, this should be an include instead.
     * @returns boolean
     */
    deprecatedHidden: ({ selectedTags }) => selectedTags[0] === HIDE_DEPRECATED_TAG,
    apiChangesObject() {
      return this.apiChanges || {};
    },
    hasNodes: ({ nodesToRender }) => !!nodesToRender.length,
    totalItemsToNavigate: ({ nodesToRender }) => nodesToRender.length,
    lastActivePathItem: ({ activePath }) => last(activePath),
  },
  created() {
    this.restorePersistedState();
  },
  watch: {
    filter: 'debounceInput',
    nodeChangeDeps: 'trackOpenNodes',
    activePath: 'handleActivePathChange',
    apiChanges(value) {
      if (value) return;
      // if we remove APIChanges, remove all related tags as well
      this.selectedTags = this.selectedTags.filter(t => !ChangeNames[t]);
    },
  },
  methods: {
    toggleAllNodes() {
      const parentNodes = this.children.filter(child => child.parent === INDEX_ROOT_KEY
        && child.type !== TopicTypes.groupMarker && child.childUIDs.length);
      // make sure all nodes get either open or close
      this.allNodesToggled = !this.allNodesToggled;
      if (this.allNodesToggled) {
        this.openNodes = {};
        this.generateNodesToRender();
      }

      parentNodes.forEach((node) => {
        this.toggleFullTree(node);
      });
    },
    clearFilters() {
      this.filter = '';
      this.debouncedFilter = '';
      this.selectedTags = [];
    },
    scrollToFocus() {
      this.$refs.scroller.scrollToItem(this.focusedIndex);
    },
    debounceInput: debounce(function debounceInput(value) {
      // store the new filter value
      this.debouncedFilter = value;
      // reset the last focus target
      this.lastFocusTarget = null;
    }, 500),
    /**
     * Finds which nodes need to be opened.
     * Initiates a watcher, that reacts to filtering and page navigation.
     */
    trackOpenNodes(
      [filteredChildren, activePathChildren, filter, selectedTags],
      [, activePathChildrenBefore = [], filterBefore = '', selectedTagsBefore = []] = [],
    ) {
      // skip in case this is a first mount and we are syncing the `filter` and `selectedTags`.
      if (
        (filter !== filterBefore && !filterBefore && this.getFromStorage('filter'))
        || (
          !isEqual(selectedTags, selectedTagsBefore)
          && !selectedTagsBefore.length
          && this.getFromStorage('selectedTags', []).length
        )
      ) {
        return;
      }

      // if the activePath items change, we navigated to another page
      const pageChange = !isEqual(activePathChildrenBefore, activePathChildren);
      // decide which items are open
      // if "Hide Deprecated" is picked, there is no filter,
      // or navigate to page while filtering, we open the items leading to the activeUID
      const nodes = (
        (this.deprecatedHidden && !this.debouncedFilter.length)
        || (pageChange && this.hasFilter)
        || !this.hasFilter
      )
        ? activePathChildren
        // get all parents of the current filter match, excluding it in the process
        : filteredChildren.flatMap(({ uid }) => this.getParents(uid).slice(0, -1));
      // create a map to track open items - `{ [UID]: true }`
      const newOpenNodes = Object.fromEntries(nodes
        .map(({ uid }) => [uid, true]));
      // if we navigate across pages, persist the previously open nodes
      const baseNodes = pageChange ? this.openNodes : {};
      // merge in the new open nodes with the base nodes
      this.openNodes = Object.assign(baseNodes, newOpenNodes);
      this.generateNodesToRender();
      // update the focus index, based on the activeUID
      this.updateFocusIndexExternally();
    },
    /**
     * Toggle a node open/close
     * @param {NavigatorFlatItem} node
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
        include = this.getChildren(node.uid)
          .filter(child => this.renderableChildNodesMap[child.uid]);
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
        include = allChildren.slice(1).filter(child => this.renderableChildNodesMap[child.uid]);
      }
      this.openNodes = openNodes;
      this.augmentRenderNodes({ uid: node.uid, exclude, include });
    },
    toggleSiblings(node) {
      const isOpen = this.openNodes[node.uid];
      const openNodes = clone(this.openNodes);
      const siblings = this.getSiblings(node.uid);
      siblings.forEach(({ uid, childUIDs, type }) => {
        // if the item has no children or is a groupMarker, exit early
        if (!childUIDs.length || type === TopicTypes.groupMarker) return;
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
          const children = this.getChildren(uid)
            .filter(child => this.renderableChildNodesMap[child.uid]);
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
      const collection = new Set([]);
      const stack = [uid];
      let current = null;

      // loop over the stack
      while (stack.length) {
        // get the top item
        current = stack.shift();
        // find the object
        const obj = this.childrenMap[current];
        // add it to the collection
        collection.add(obj);
        // add all if it's children to the front of the stack
        stack.unshift(...obj.childUIDs);
      }

      return [...collection];
    },
    /**
     * Get all the parents of a node, up to the root.
     * @param {number} uid
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
     * Removes deprecated items from a list
     * @param {NavigatorFlatItem[]} items
     * @returns {NavigatorFlatItem[]}
     */
    removeDeprecated(items) {
      if (!this.deprecatedHidden) return items;
      return items.filter(({ deprecated }) => !deprecated);
    },
    /**
     * Stores all the nodes we should render at this point.
     * This gets called everytime you open/close a node,
     * or when you start filtering.
     * @return void
     */
    generateNodesToRender() {
      const { children, openNodes, renderableChildNodesMap } = this;

      // create a set of all matches and their parents
      // generate the list of nodes to render
      this.nodesToRender = children
        .filter(child => (
          // make sure the item can be rendered
          renderableChildNodesMap[child.uid]
          // and either its parent is open, or its a root item
          && (child.parent === INDEX_ROOT_KEY || openNodes[child.parent])
        ));
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
     * Get items from PersistedStorage, for the current technology.
     * Can fetch a specific `key` or the entire state.
     * @param {string} [key] - key to fetch
     * @param {*} [fallback] - fallback property, if `key is not found`
     * @return *
     */
    getFromStorage(key, fallback = null) {
      const state = sessionStorage.get(STORAGE_KEY, {});
      const technologyState = state[this.technologyPath];
      if (!technologyState) return fallback;
      if (key) {
        return technologyState[key] || fallback;
      }
      return technologyState;
    },
    /**
     * Persists the current state, so its not lost if you refresh or navigate away
     */
    persistState() {
      // fallback to using the activePath items
      const fallback = { path: this.lastActivePathItem };
      // try to get the `path` for the current activeUID
      const { path } = this.activeUID
        ? (this.childrenMap[this.activeUID] || fallback)
        : fallback;
      const technologyState = {
        technology: this.technology,
        // find the path buy the activeUID, because the lastActivePath wont be updated at this point
        path,
        hasApiChanges: !!this.apiChanges,
        // store the keys of the openNodes map, converting to number, to reduce space
        openNodes: Object.keys(this.openNodes).map(Number),
        // we need only the UIDs
        nodesToRender: this.nodesToRender.map(({ uid }) => uid),
        activeUID: this.activeUID,
        filter: this.filter,
        selectedTags: this.selectedTags,
      };
      const state = {
        ...sessionStorage.get(STORAGE_KEY, {}),
        [this.technologyPath]: technologyState,
      };
      sessionStorage.set(STORAGE_KEY, state);
    },
    clearPersistedState() {
      const state = {
        ...sessionStorage.get(STORAGE_KEY, {}),
        [this.technologyPath]: {},
      };
      sessionStorage.set(STORAGE_KEY, state);
    },
    /**
     * Restores the persisted state from sessionStorage. Called on `create` hook.
     */
    restorePersistedState() {
      // get the entire state for the technology
      const persistedState = this.getFromStorage();
      // if there is no state or it's last path is not the same, clear the storage
      if (!persistedState || persistedState.path !== this.lastActivePathItem) {
        this.clearPersistedState();
        this.handleActivePathChange(this.activePath);
        return;
      }
      const {
        technology,
        nodesToRender = [],
        filter = '',
        hasAPIChanges = false,
        activeUID = null,
        selectedTags = [],
        openNodes,
      } = persistedState;
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
      const activeUIDMatchesCurrentPath = activeUID
        ? ((this.childrenMap[activeUID] || {}).path === this.lastActivePathItem)
        : this.activePath.length === 1;
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
      if (this.hasFilter && !this.deprecatedHidden) {
        this.$refs.scroller.scrollToItem(0);
        return;
      }
      // check if the current element is visible and needs scrolling into
      const element = document.getElementById(this.activeUID);
      // check if there is such an item AND the item is inside scroller area
      if (element && this.getChildPositionInScroller(element) === 0) return;
      // find the index of the current active UID in the nodes to render
      const index = this.nodesToRender.findIndex(child => child.uid === this.activeUID);
      if (index === -1) return;
      // check if the element is visible
      // call the scroll method on the `scroller` component.
      this.$refs.scroller.scrollToItem(index);
    },
    /**
     * Determine where a child element is positioned, inside the scroller container.
     * returns -1, if above the viewport
     * returns 0, if inside the viewport
     * returns 1, if below the viewport
     *
     * @param {HTMLAnchorElement} element - child element
     * @return Number
     */
    getChildPositionInScroller(element) {
      if (!element) return 0;
      const { paddingTop, paddingBottom } = getComputedStyle(this.$refs.scroller.$el);
      // offset for better visibility
      const offset = {
        top: parseInt(paddingTop, 10) || 0,
        bottom: parseInt(paddingBottom, 10) || 0,
      };
      // get the position of the scroller in the screen
      const { y: areaY, height: areaHeight } = this.$refs.scroller.$el.getBoundingClientRect();
      // get the position of the active element
      const { y: elY } = element.getBoundingClientRect();
      const elHeight = element.offsetParent.offsetHeight;
      // calculate where element starts from
      const elementStart = elY - areaY - offset.top;
      // element is above the scrollarea
      if (elementStart < 0) {
        return -1;
      }
      // element ends below the scrollarea
      if ((elementStart + elHeight) >= (areaHeight - offset.bottom)) {
        return 1;
      }
      // element is inside the scrollarea
      return 0;
    },
    isInsideScroller(element) {
      return this.$refs.scroller.$el.contains(element);
    },
    handleFocusIn({ target }) {
      this.lastFocusTarget = target;
      const positionIndex = this.getChildPositionInScroller(target);
      // if multiplier is 0, the item is inside the scrollarea, no need to scroll
      if (positionIndex === 0) return;
      // get the height of the closest positioned item.
      const { offsetHeight } = target.offsetParent;
      // scroll the area, up/down, based on position of child item
      this.$refs.scroller.$el.scrollBy({
        top: offsetHeight * positionIndex,
        left: 0,
      });
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
    },
    /**
     * Handles the `navigate` event from NavigatorCardItem, guarding from selecting an item,
     * that points to another technology.
     */
    handleNavigationChange(uid) {
      // if the path is outside of this technology tree, dont store the uid
      if (this.childrenMap[uid].path.startsWith(this.technologyPath)) {
        this.setActiveUID(uid);
      }
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
    convertChildrenArrayToObject(children) {
      return children.reduce((all, current) => {
        // eslint-disable-next-line no-param-reassign
        all[current.uid] = current;
        return all;
      }, {});
    },
    /**
     * Focuses the parent of a child node.
     * @param {NavigatorFlatItem} item
     */
    focusNodeParent(item) {
      const parent = this.childrenMap[item.parent];
      if (!parent) return;
      const parentIndex = this.nodesToRender.findIndex(c => c.uid === parent.uid);
      if (parentIndex === -1) return;
      // we perform an intentional focus change, so no need to set `externalFocusChange` to `true`
      this.focusIndex(parentIndex);
    },
    async handleHideClick() {
      this.$emit('close');
      await this.$nextTick();
      const trigger = document.getElementById(baseNavOpenSidenavButtonId);
      if (trigger) {
        trigger.focus();
      }
    },
  },
  provide() {
    return { store: this.store };
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';
@import '~vue-virtual-scroller/dist/vue-virtual-scroller.css';

$navigator-card-vertical-spacing: 8px !default;
// unfortunately we need to hard-code the filter height
$filter-height: 73px;
$filter-height-small: 62px;
$navigator-head-background: var(--color-fill) !default;
$navigator-head-background-active: var(--color-fill) !default;
$close-icon-size: 19px;
$close-icon-padding: 5px;

.magnifier-icon {
  height: 20px;
  width: auto;
  margin: auto;
  padding-left: 5px;
}

.navigator-card {
  --card-vertical-spacing: #{$navigator-card-vertical-spacing};
  --card-horizontal-spacing: #{$nav-card-horizontal-spacing-large};
  --nav-filter-horizontal-padding: 30px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: calc(var(--app-height) - var(--nav-height, 0px));
  position: sticky;
  top: var(--nav-height, 0px);

  @include breakpoint(medium, nav) {
    height: 100%;
    position: static;
    background: var(--color-fill);
  }

  &.filter-on-top {
    .filter-wrapper {
      order: 1;
      position: static;
    }

    .card-body {
      order: 2;
    }
  }

  .navigator-card-full-height {
    min-height: 0;
    flex: 1 1 auto;
  }

  .head-inner {
    overflow: hidden;
  }

  .head-wrapper {
    position: relative;
    flex: 1 0 auto;
  }

  .navigator-head {
    --navigator-head-padding-right: calc(var(--card-horizontal-spacing) * 2 + #{$close-icon-size});
    padding: 0 var(--navigator-head-padding-right) 0 var(--card-horizontal-spacing);
    background: $navigator-head-background;
    border-bottom: 1px solid var(--color-grid);
    display: flex;
    align-items: center;
    height: $nav-height;
    white-space: nowrap;

    .badge {
      margin-top: 0;
    }

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

    @include safe-area-left-set(padding-left, var(--card-horizontal-spacing));
    @include safe-area-right-set(padding-right, var(--navigator-head-padding-right));

    @include breakpoint(medium, nav) {
      justify-content: center;
      --navigator-head-padding-right: var(--card-horizontal-spacing);
    }

    @include breakpoint(small, nav) {
      height: $nav-height-small;
      padding: 0 $nav-card-horizontal-spacing-large;
    }
  }

  .card-icon {
    width: 19px;
    height: 19px;
  }
}

.no-items-wrapper {
  overflow: hidden;
  color: var(--color-figure-gray-tertiary);

  .no-items {
    @include font-styles(body-reduced);
    padding: var(--card-vertical-spacing) var(--card-horizontal-spacing);
    // make sure the text does not get weirdly cut
    min-width: 200px;
    box-sizing: border-box;
  }
}

.close-card {
  display: flex;
  position: absolute;
  z-index: 1;
  align-items: center;
  justify-content: center;
  right: $nav-padding - rem($close-icon-padding);
  padding: $close-icon-padding;
  margin-left: -$close-icon-padding;
  top: calc(50% - #{$close-icon-size} + #{$close-icon-padding});
  transition: transform $adjustable-sidebar-hide-transition-duration ease-in 0s, visibility 0s;

  @include breakpoint(medium, nav) {
    right: unset;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0 $nav-padding 0 $nav-card-horizontal-spacing-large;
    height: 100%;
    @include safe-area-left-set(padding-left, $nav-padding);
  }

  @include breakpoint(small, nav) {
    padding-left: $nav-padding-small;
    padding-right: $nav-padding-small;
    @include safe-area-left-set(padding-left, $nav-padding-small);
  }

  .close-icon {
    width: $close-icon-size;
    height: $close-icon-size;
  }

  @include breakpoints-from(large, nav) {
    &.hide-on-large {
      display: none;
    }

    &:hover {
      border-radius: $nano-border-radius;
      background: var(--color-fill-gray-quaternary);
    }
    // when the navigator is closed on desktop,
    // move the button so it looks like its going to the nav
    .sidebar-hidden & {
      transition: transform $adjustable-sidebar-hide-transition-duration ease-in 0s,
      visibility 0s linear $adjustable-sidebar-hide-transition-duration;
      visibility: hidden;
      // 2x the nav padding, 1px border, and the size of the icon
      transform: translateX(rem($close-icon-size + 1px) + $nav-padding * 2);
    }
  }
}

.card-body {
  // right padding is added by the items, so visually the scroller is stuck to the side
  padding-right: 0;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  @include breakpoint(medium, nav) {
    --card-vertical-spacing: 0px;
  }
}

.card-link {
  color: var(--color-text);
  @include font-styles(body-reduced);
  font-weight: $font-weight-semibold;
  overflow: hidden;
  text-overflow: ellipsis;
}

.navigator-filter {
  box-sizing: border-box;
  padding: 15px var(--nav-filter-horizontal-padding);
  border-top: 1px solid var(--color-grid);
  height: $filter-height;
  display: flex;
  align-items: flex-end;

  .filter-on-top & {
    border-top: none;
    align-items: flex-start;
  }

  @include safe-area-left-set(padding-left, var(--nav-filter-horizontal-padding));
  @include safe-area-right-set(padding-right, var(--nav-filter-horizontal-padding));

  @include breakpoint(medium, nav) {
    --nav-filter-horizontal-padding: 20px;
    border: none;
    padding-top: 10px;
    padding-bottom: 10px;
    height: $filter-height-small;
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
  padding-bottom: calc(var(--top-offset, 0px) + var(--card-vertical-spacing));
  transition: padding-bottom ease-in 0.15s;

  @include breakpoint(medium, nav) {
    padding-bottom: $nav-menu-items-ios-bottom-spacing;
  }

  // The VueVirtualScroller scrollbar is not selectable and draggable in Safari,
  // which is most probably caused by the complicated styling of the component.
  // Adding translate3D causes the browser to use hardware acceleration and fixes the issue.
  /deep/ .vue-recycle-scroller__item-wrapper {
    transform: translate3d(0, 0, 0);
  }
}

.filter-wrapper {
  position: sticky;
  bottom: 0;
  background: var(--color-fill);

  .sidebar-transitioning & {
    flex: 1 0 $filter-height;
    overflow: hidden;
  }
}

</style>
