<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="navigator" :style="{ '--sticky-top-offset': topOffset }">
    <NavigatorCard
      v-if="!isFetching"
      :technology="technology.title"
      :technology-path="technology.path || technology.url"
      :type="type"
      :children="flatChildren"
      :active-path="activePath"
      :scrollLockID="scrollLockID"
      @close="$emit('close')"
    />
    <div v-else class="loading-placeholder">
      Fetching...
    </div>
  </div>
</template>

<script>
import NavigatorCard from 'docc-render/components/Navigator/NavigatorCard.vue';
import throttle from 'docc-render/utils/throttle';
import { INDEX_ROOT_KEY } from 'docc-render/constants/sidebar';
import { baseNavStickyAnchorId } from 'docc-render/constants/nav';
import { TopicTypes } from 'docc-render/constants/TopicTypes';

/**
 * @typedef NavigatorFlatItem
 * @property {number} uid - generated UID
 * @property {string} title - title of symbol
 * @property {string} type - symbol type, used for the icon
 * @property {array} abstract - symbol abstract
 * @property {string} path - path to page, used in navigation
 * @property {number} parent - parent UID
 * @property {number} depth - depth of symbol in original tree
 * @property {number} index - index of item in siblings
 * @property {number} siblingsCount - number of siblings
 * @property {number[]} childUIDs - array of child UIDs
 * @property {boolean} deprecated - symbol is deprecated or is not
 */

/**
 * Renders a sidebar navigator component.
 */
export default {
  name: 'Navigator',
  components: {
    NavigatorCard,
  },
  props: {
    parentTopicIdentifiers: {
      type: Array,
      required: true,
    },
    technology: {
      type: Object,
      required: true,
    },
    isFetching: {
      type: Boolean,
      default: false,
    },
    references: {
      type: Object,
      default: () => {},
    },
    scrollLockID: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      topOffset: '0px',
    };
  },
  mounted() {
    this.setupStickyFilterTrack();
  },
  computed: {
    // gets the paths for each parent in the breadcrumbs
    parentTopicReferences({ references, parentTopicIdentifiers }) {
      return parentTopicIdentifiers.map(identifier => references[identifier]);
    },
    // splits out the top-level technology crumb
    activePath({ parentTopicReferences, $route: { path } }) {
      // route's path is activePath on root
      if (!parentTopicReferences.length) return [path];
      let itemsToSlice = 1;
      // if the first item is a `technology`, slice off it and the technology itself
      if (parentTopicReferences[0].kind === 'technologies') {
        itemsToSlice = 2;
      }
      return parentTopicReferences.slice(itemsToSlice).map(r => r.url).concat(path);
    },
    /**
     * Recomputes the list of flat children.
     * @return NavigatorFlatItem[]
     */
    flatChildren: ({ flattenNestedData, technology: { children = [] } = {} }) => (
      flattenNestedData(children)
    ),
    /**
     * The root item is always a module
     */
    type: () => TopicTypes.module,
  },
  methods: {
    /**
     * Generates a unique hash, from a string, generating a signed number.
     * @returns Number
     */
    hashCode(str) {
      return str.split('').reduce((prevHash, currVal) => (
        // eslint-disable-next-line no-bitwise
        (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0
      ), 0);
    },
    /**
     * @param {{path: string, type: string, title: string, children?: [] }[]} childrenNodes
     * @param {NavigatorFlatItem | null} parent
     * @param {Number} depth
     * @return {NavigatorFlatItem[]}
     */
    flattenNestedData(childrenNodes, parent = null, depth = 0) {
      return childrenNodes.reduce((items, item, index) => {
        // get the children
        const { children, ...node } = item;
        // generate the extra properties
        const { uid: parentUID = INDEX_ROOT_KEY } = parent || {};
        // generate a uid to track by
        node.uid = this.hashCode(`${parentUID}+${node.path}_${depth}_${index}`);
        // store the parent uid
        node.parent = parentUID;
        // store which item it is
        node.index = index;
        // store how many siblings it has
        node.siblingsCount = childrenNodes.length;
        // store the depth
        node.depth = depth;
        // store child UIDs
        node.childUIDs = [];
        // if the parent is not the root, push to its childUIDs the current node uid
        if (parent) {
          // push child to parent
          parent.childUIDs.push(node.uid);
        }
        if (children) {
          // recursively walk the children
          const iteratedChildren = this.flattenNestedData(children, node, depth + 1);
          // push the node to the items stack
          items.push(node);
          // return the children to the parent
          return items.concat(iteratedChildren);
        }
        // return the node
        return items.concat(node);
      }, []);
    },
    /**
     * Moves the sticky filter as you scroll, so it does not get hidden,
     * when you have extra components above the navigation.
     */
    setupStickyFilterTrack() {
      // get the navigation sticky anchor
      const anchor = document.getElementById(baseNavStickyAnchorId);
      // Check if there are more components, above the navigation
      if (anchor.offsetTop === 0) return;
      const cb = throttle(() => {
        // get the top position of the anchor, or 0 if its negative
        const y = Math.max(anchor.getBoundingClientRect().y, 0);
        this.topOffset = `${y}px`;
      }, 150);
      // start listening to scroll events
      window.addEventListener('scroll', cb);
      // fire the callback
      cb();
      // unbind on beforeDestroy
      this.$once('hook:beforeDestroy', () => {
        window.removeEventListener('scroll', cb);
      });
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.navigator {
  position: sticky;
  top: $nav-height;
  height: calc(100vh - #{$nav-height} - var(--sticky-top-offset));
  box-sizing: border-box;
  transition: height 0.3s linear;
  border-left: 1px solid var(--color-grid);

  @include breakpoint(small) {
    position: static;
    height: 100%;
    border-left: none;
    transition: none;
  }
}

.loading-placeholder {
  color: var(--color-figure-gray-secondary);
  padding: 12px;
  @include font-styles(body-reduced);
}
</style>
