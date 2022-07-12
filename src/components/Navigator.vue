<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <nav
    :aria-labelledby="INDEX_ROOT_KEY"
    class="navigator"
  >
    <NavigatorCard
      v-if="!isFetching"
      :technology="technology.title"
      :is-technology-beta="technology.beta"
      :technology-path="technology.path || technology.url"
      :type="type"
      :children="flatChildren"
      :active-path="activePath"
      :scrollLockID="scrollLockID"
      :error-fetching="errorFetching"
      :breakpoint="breakpoint"
      :api-changes="apiChanges"
      @close="$emit('close')"
    />
    <NavigatorCardInner v-else class="loading-placeholder">
      <transition name="delay-visibility" appear>
        <SpinnerIcon class="loading-spinner" />
      </transition>
    </NavigatorCardInner>
    <div aria-live="polite" class="visuallyhidden">
      Navigator is {{ isFetching ? 'loading' : 'ready' }}
    </div>
  </nav>
</template>

<script>
import QuickNavigationStore from 'docc-render/stores/QuickNavigationStore';
import NavigatorCard from 'theme/components/Navigator/NavigatorCard.vue';
import SpinnerIcon from 'theme/components/Icons/SpinnerIcon.vue';
import NavigatorCardInner from 'docc-render/components/Navigator/NavigatorCardInner.vue';
import { INDEX_ROOT_KEY } from 'docc-render/constants/sidebar';
import { TopicTypes } from 'docc-render/constants/TopicTypes';
import { BreakpointName } from 'docc-render/utils/breakpoints';

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
    NavigatorCardInner,
    SpinnerIcon,
  },
  data() {
    return {
      INDEX_ROOT_KEY,
      store: QuickNavigationStore,
    };
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
    errorFetching: {
      type: Boolean,
      default: false,
    },
    breakpoint: {
      type: String,
      default: BreakpointName.large,
    },
    apiChanges: {
      type: Object,
      default: null,
    },
  },
  provide() {
    return { store: this.store };
  },
  computed: {
    // gets the paths for each parent in the breadcrumbs
    parentTopicReferences({ references, parentTopicIdentifiers }) {
      return parentTopicIdentifiers
        .reduce((all, identifier) => {
          const reference = references[identifier];
          if (reference) return all.concat(reference);
          console.error(`Reference for "${identifier}" is missing`);
          return all;
        }, []);
    },
    // splits out the top-level technology crumb
    activePath({ parentTopicReferences, $route: { path } }) {
      // Ensure the path does not have a trailing slash
      // eslint-disable-next-line no-param-reassign
      path = path.replace(/\/$/, '').toLowerCase();
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
    flatChildren: ({ flattenNestedData, technology = {}, store }) => {
      const flatIndex = flattenNestedData(technology.children || [], null, 0, technology.beta);
      store.setFlattenIndex(flatIndex);
      return flatIndex;
    },
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
     * @param {Boolean} parentBetaStatus
     * @return {NavigatorFlatItem[]}
     */
    flattenNestedData(childrenNodes, parent = null, depth = 0, parentBetaStatus = false) {
      let items = [];
      const len = childrenNodes.length;
      let index;
      for (index = 0; index < len; index += 1) {
        // get the children
        const { children, ...node } = childrenNodes[index];
        // generate the extra properties
        const { uid: parentUID = INDEX_ROOT_KEY } = parent || {};
        // generate a uid to track by
        node.uid = this.hashCode(`${parentUID}+${node.path}_${depth}_${index}`);
        // store the parent uid
        node.parent = parentUID;
        // store which item it is
        node.index = index;
        // store how many siblings it has
        node.siblingsCount = len;
        // store the depth
        node.depth = depth;
        // store child UIDs
        node.childUIDs = [];
        // if the parent is not the root, push to its childUIDs the current node uid
        if (parent) {
          // push child to parent
          parent.childUIDs.push(node.uid);
        }
        // if the parent or the entire technology are marked as `Beta`,
        // child elements do not get marked as `Beta`.
        if (node.beta && parentBetaStatus) {
          node.beta = false;
        }

        items.push(node);
        if (children) {
          // return the children to the parent
          items = items.concat(this.flattenNestedData(
            children, node, depth + 1, parentBetaStatus || node.beta,
          ));
        }
      }
      return items;
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.navigator {
  --nav-height: #{$nav-height};
  height: 100%;
  display: flex;
  flex-flow: column;

  @include breakpoints-from(xlarge) {
    border-left: 1px solid var(--color-grid);
  }

  @include breakpoint(medium, nav) {
    position: static;
    transition: none;
  }
}

.loading-placeholder {
  align-items: center;
  color: var(--color-figure-gray-secondary);
  justify-content: center;
}

.loading-spinner {
  --spinner-size: 40px; // used for both width and height
  --spinner-delay: 1s; // don't show spinner until this much time has passed

  height: var(--spinner-size);
  width: var(--spinner-size);

  &.delay-visibility-enter-active {
    transition: visibility var(--spinner-delay);
    visibility: hidden;
  }
}
</style>
