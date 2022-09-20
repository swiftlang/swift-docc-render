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
      :allow-hiding="allowHiding"
      :enableQuickNavigation="enableQuickNavigation"
      :navigator-references="navigatorReferences"
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
 * @property {string} icon - an image reference to override the type icon
 * @property {array} abstract - symbol abstract
 * @property {string} path - path to page, used in navigation
 * @property {number} parent - parent UID
 * @property {number} groupMarkerUID - UID of the groupMarker that labels this
 * @property {number} deprecatedChildrenCount - number of children that are deprecated.
 * Used for filtering
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
    };
  },
  props: {
    flatChildren: {
      type: Array,
      required: true,
    },
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
    navigatorReferences: {
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
    allowHiding: {
      type: Boolean,
      default: true,
    },
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
     * The root item is always a module
     */
    type: () => TopicTypes.module,
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.navigator {
  height: 100%;
  display: flex;
  flex-flow: column;

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
