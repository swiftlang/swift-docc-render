<template>
  <div class="navigator" :style="{ '--sticky-top-offset': topOffset }">
    <NavigatorCard
      v-if="!isFetching"
      :technology="technology.title"
      :kind="technology.kind"
      :children="flatChildren"
      :active-path="activePath"
      :show-extended-info="showExtraInfo"
      :filter-pattern="filterPattern"
      @close="$emit('close')"
    >
      <div class="navigator-filter">
        <div class="input-wrapper">
          <FilterIcon class="icon-inline filter-icon" :class="{ colored: filter }" />
          <input
            type="text"
            :value="filter"
            :placeholder="`Filter in ${technology.title}`"
            @input="debounceInput">
          <button
            class="clear-button"
            :class="{ hide: !filter }"
            @click.prevent="filter = ''"
          >
            <ClearRoundedIcon class="icon-inline clear-icon" />
          </button>
        </div>
      </div>
    </NavigatorCard>
    <div v-else>
      Fetching...
    </div>
  </div>
</template>

<script>
import NavigatorCard from 'docc-render/components/Navigator/NavigatorCard.vue';
import debounce from 'docc-render/utils/debounce';
import { safeHighlightPattern } from 'docc-render/utils/search-utils';
import FilterIcon from 'docc-render/components/Icons/FilterIcon.vue';
import throttle from 'docc-render/utils/throttle';
import { INDEX_ROOT_KEY } from 'docc-render/constants/sidebar';
import { baseNavStickyAnchorId } from 'docc-render/constants/nav';
import ClearRoundedIcon from 'theme/components/Icons/ClearRoundedIcon.vue';

/**
 * @typedef NavigatorFlatItem
 * @property {string} uid - generated UID
 * @property {string} title - title of symbol
 * @property {string} kind - symbol kind, used for the icon
 * @property {array} abstract - symbol abstract
 * @property {string} path - path to page, used in navigation
 * @property {string} parent - parent UID
 * @property {number} depth - depth of symbol in original tree
 * @property {number} index - index of item in siblings
 * @property {string[]} childUIDs - array of child UIDs
 */

/**
 * Renders a sidebar navigator component.
 */
export default {
  name: 'Navigator',
  components: {
    ClearRoundedIcon,
    FilterIcon,
    NavigatorCard,
  },
  props: {
    parentTopicIdentifiers: {
      type: Array,
      required: true,
    },
    showExtraInfo: {
      type: Boolean,
      default: false,
    },
    technology: {
      type: Object,
      required: true,
    },
    isFetching: {
      type: Boolean,
      default: false,
    },
  },
  inject: ['references'],
  data() {
    return {
      filter: '',
      topOffset: '0px',
    };
  },
  mounted() {
    this.setupStickyFilterTrack();
  },
  computed: {
    // gets the paths for each parent in the breadcrumbs
    parentTopicReferences({ references, parentTopicIdentifiers }) {
      return parentTopicIdentifiers.map(identifier => references[identifier].url);
    },
    // splits out the top-level technology crumb
    activePath({ parentTopicReferences, $route }) {
      return parentTopicReferences.slice(1).concat($route.path);
    },
    filterPattern: ({ filter }) => (!filter ? undefined : safeHighlightPattern(filter)),
    /**
     * Recomputes the list of flat children.
     * @return NavigatorFlatItem[]
     */
    flatChildren: ({ flattenNestedData, technology: { children = [] } = {} }) => (
      flattenNestedData(children)
    ),
  },
  methods: {
    debounceInput: debounce(function debounceInput({ target: { value } }) {
      this.filter = value;
    }, 500),
    /**
     * @param {{path: string, kind: string, title: string, uid: string}[]} childrenNodes
     * @param {Object} parent
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
        node.uid = `${parentUID}+${node.path}_${depth}_${index}`;
        // store the parent uid
        node.parent = parentUID;
        node.depth = depth;
        node.index = index;
        // store child UIDs
        node.childUIDs = [];
        // push child to parent
        if (parent) {
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
  max-height: calc(100vh - #{$nav-height} - var(--sticky-top-offset));
  height: 100%;
  box-sizing: border-box;
  transition: max-height 0.3s linear;
  border-left: 1px solid var(--color-grid);

  @include breakpoint(small) {
    position: static;
    max-height: 100%;
    border-left: none;
  }
}

.navigator-filter {
  box-sizing: border-box;
  padding: 14px 30px;
  border-top: 1px solid var(--color-grid);

  @include breakpoint(small) {
    border: none;
    padding: 10px 20px;
  }

  .input-wrapper {
    position: relative;
  }

  .filter-icon {
    width: 1em;
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translate(0%, -50%);
    color: var(--color-figure-gray-secondary);

    &.colored {
      color: var(--color-link);
    }
  }

  .clear-button {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    border-radius: 100%;

    &:focus {
      @include focus-shadow;
    }

    &.hide {
      display: none;
    }
  }

  .clear-icon {
    width: 0.8em;
    color: var(--color-figure-gray-secondary);
  }

  input {
    border: 1px solid var(--color-grid);
    padding: 10px 25px 10px 40px;
    width: 100%;
    box-sizing: border-box;
    border-radius: $tiny-border-radius;

    &:focus {
      outline: none;
      @include focus-shadow-form-element();
    }
  }
}
</style>
