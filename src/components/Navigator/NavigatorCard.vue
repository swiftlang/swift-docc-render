<template>
  <div class="navigator-card">
    <div class="head-wrapper" :class="{ 'extra-info': showExtendedInfo }">
      <button class="close-card-mobile" @click="$emit('close')">
        <InlineCloseIcon class="icon-inline close-icon" />
      </button>
      <NavigatorLeafIcon :kind="kind" class="card-icon" />
      <span class="card-link">
        {{ technology }}
      </span>
    </div>
    <div class="card-body">
      <RecycleScroller
        v-show="nodesToRender.length"
        ref="scroller"
        class="scroller"
        :items="nodesToRender"
        :item-size="itemSize"
        key-field="uid"
        v-slot="{ item }"
      >
        <NavigatorCardItem
          :item="item"
          :filter-pattern="filterPattern"
          :show-extended-info="showExtendedInfo"
          :is-active="item.uid === activeUID"
          :is-bold="activePathMap[item.uid]"
          :expanded="openNodes[item.uid]"
          @toggle="toggle"
          @toggle-full="toggleFullTree"
        />
      </RecycleScroller>
      <div class="no-items-wrapper" v-if="!nodesToRender.length">
        <template v-if="filterPattern">
          No results matching your filter
        </template>
        <template v-else>
          Technology has no children
        </template>
      </div>
    </div>
    <div class="card-slot">
      <div class="navigator-filter">
        <div class="input-wrapper">
          <FilterIcon class="icon-inline filter-icon" :class="{ colored: filter }" />
          <input
            type="text"
            :value="filter"
            :placeholder="`Filter in ${technology}`"
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
    </div>
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import { clone } from 'docc-render/utils/data';
import { waitFrames } from 'docc-render/utils/loading';
import debounce from 'docc-render/utils/debounce';
import { sessionStorage } from 'docc-render/utils/storage';
import { INDEX_ROOT_KEY, LEAF_SIZES } from 'docc-render/constants/sidebar';
import { safeHighlightPattern } from 'docc-render/utils/search-utils';
import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import NavigatorCardItem from 'docc-render/components/Navigator/NavigatorCardItem.vue';
import InlineCloseIcon from 'theme/components/Icons/InlineCloseIcon.vue';
import FilterIcon from 'theme/components/Icons/FilterIcon.vue';
import ClearRoundedIcon from 'theme/components/Icons/ClearRoundedIcon.vue';

export const STORAGE_KEYS = {
  filter: 'navigator.filter',
  technology: 'navigator.technology',
  openNodes: 'navigator.openNodes',
  nodesToRender: 'navigator.nodesToRender',
};

/**
 * Renders the card for a technology and it's child symbols, in the navigator.
 * For performance reasons, the component uses watchers over computed, so we can more precisely
 * manage when re-calculations and re-rendering is done.
 */
export default {
  name: 'NavigatorCard',
  components: {
    ClearRoundedIcon,
    FilterIcon,
    InlineCloseIcon,
    NavigatorCardItem,
    NavigatorLeafIcon,
    RecycleScroller,
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
    showExtendedInfo: {
      type: Boolean,
      default: false,
    },
    kind: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      filter: '',
      /** @type {Object.<string, boolean>} */
      openNodes: {},
      /** @type {NavigatorFlatItem[]} */
      nodesToRender: [],
    };
  },
  computed: {
    filterPattern: ({ filter }) => (!filter ? undefined : safeHighlightPattern(filter)),
    /**
     * Return the item size for the Scroller element. Its higher when we show extra info.
     */
    itemSize: ({ showExtendedInfo }) => (showExtendedInfo ? LEAF_SIZES.max : LEAF_SIZES.min),
    /**
     * Generates a map of the children, with the uid as the key.
     * @return {Object.<string, NavigatorFlatItem>}
     */
    childrenMap({ children }) {
      return Object.fromEntries(children.map(child => [child.uid, child]));
    },
    /**
     * Returns an array of {NavigatorFlatItem}, for the current page hierarchy
     * @return NavigatorFlatItem[]
     */
    activePathChildren() {
      // get the stack to iterate
      const stack = this.activePath.slice(0).reverse();
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
    activePathMap: ({ activePathChildren }) => (
      Object.fromEntries(activePathChildren.map(({ uid }) => [uid, true]))
    ),
    /**
     * Returns the current page uid
     * @return string
     */
    activeUID({ activePathChildren }) {
      return (activePathChildren[activePathChildren.length - 1] || {}).uid;
    },
    /**
     * Returns a list of the child nodes, that match the filter pattern.
     * @returns NavigatorFlatItem[]
     */
    filteredChildren({ children, filterPattern }) {
      if (!filterPattern) return [];
      // match each child's title, against the `filterPattern`
      const matches = children.filter(({ title }) => filterPattern.test(title));
      // remove duplicate UIDs
      return [...new Set(
        // find all the parents
        matches.flatMap(({ uid }) => this.getParents(uid)),
      )];
    },
    /**
     * Creates a computed for the two items, that the openNodes calc depends on
     */
    nodeChangeDeps: ({ filteredChildren, activePathChildren, filter }) => ([
      filteredChildren,
      activePathChildren,
      filter,
    ]),
  },
  created() {
    this.restorePersistedState();
  },
  watch: {
    nodeChangeDeps: 'trackOpenNodes',
    filter(value) {
      sessionStorage.set(STORAGE_KEYS.filter, value);
    },
  },
  methods: {
    debounceInput: debounce(function debounceInput({ target: { value } }) {
      this.filter = value;
    }, 500),
    /**
     * Finds which nodes need to be opened.
     * Initiates a watcher, that reacts to filtering and page navigation.
     */
    trackOpenNodes(
      [filteredChildren, activePathChildren, filter],
      [, activePathChildrenBefore, filterBefore] = [],
    ) {
      // skip in case this is a first mount and we are syncing the `filter`.
      if (filter !== filterBefore && !filterBefore && sessionStorage.get(STORAGE_KEYS.filter)) {
        return;
      }
      // decide which items to filter
      const nodes = !this.filterPattern
        ? activePathChildren
        : filteredChildren;
      // if the activePath items change, we navigated to another page
      const pageChange = activePathChildrenBefore !== activePathChildren;

      // create a map to track open items - `{ [UID]: true }`
      const newOpenNodes = Object.fromEntries(nodes
        .map(({ uid }) => [uid, true]));
      // if we navigate across pages, persist the previously open nodes
      this.openNodes = Object.assign(pageChange ? this.openNodes : {}, newOpenNodes);
      this.generateNodesToRender({ scrollToElement: true });
    },
    /**
     * Toggle a node open/close
     */
    toggle(node) {
      // check if the item is open
      const isOpen = this.openNodes[node.uid];
      // if open, we need to close it
      if (isOpen) {
        // clone the open nodes map
        const openNodes = clone(this.openNodes);
        // remove current node and all of it's children, from the open list
        this.getAllChildren(node.uid).forEach(({ uid }) => {
          delete openNodes[uid];
        });
        // set the new open nodes. Should be faster than iterating each and calling `this.$delete`.
        this.openNodes = openNodes;
      } else {
        this.$set(this.openNodes, node.uid, true);
      }
      this.generateNodesToRender({ scrollToElement: false });
    },
    /**
     * Handle toggling the entire tree open/close, using alt + click
     */
    toggleFullTree(node) {
      const isOpen = this.openNodes[node.uid];
      const openNodes = clone(this.openNodes);
      const allChildren = this.getAllChildren(node.uid);
      allChildren.forEach(({ uid }) => {
        if (isOpen) {
          delete openNodes[uid];
        } else {
          openNodes[uid] = true;
        }
      });
      this.openNodes = openNodes;
      this.generateNodesToRender({ scrollToElement: false });
    },
    /**
     * Get all children of a node recursively
     * @param {string} uid - the UID of the node
     * @return {NavigatorFlatItem[]}
     */
    getAllChildren(uid) {
      const arr = [];
      const stack = [uid];
      let current = null;

      // loop over the stack
      while (stack.length) {
        // get the top item
        current = stack.pop();
        // find the object
        const obj = this.childrenMap[current];
        // add it's uid
        arr.push(obj);
        // add all if it's children to the stack
        stack.push(...obj.childUIDs);
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
     * Stores all the nodes we should render at this point.
     * This gets called everytime you open/close a node,
     * or when you start filtering.
     * @param {Boolean} scrollToElement - should we scroll to the active or not, like when toggling
     * @return void
     */
    async generateNodesToRender({ scrollToElement = false }) {
      const {
        children, filteredChildren, filterPattern, openNodes,
      } = this;
      // get the nodes to render
      this.nodesToRender = (filterPattern ? filteredChildren : children)
        .filter(child => (
          // if parent is the root
          child.parent === INDEX_ROOT_KEY
          // if the parent is open
          || openNodes[child.parent]
        ));
      this.persistState();
      // check if we want to scroll to the element
      if (!scrollToElement) return;
      // wait a frame, so the scroller is ready, `nextTick` is not enough.
      this.scrollToElement();
    },
    /**
     * Persists the current state, so its not lost if you refresh or navigate away
     */
    persistState() {
      sessionStorage.set(STORAGE_KEYS.technology, this.technology);
      // store the keys of the openNodes map, converting to number, to reduce space
      sessionStorage.set(STORAGE_KEYS.openNodes, Object.keys(this.openNodes).map(Number));
      // we need only the UIDs
      sessionStorage.set(STORAGE_KEYS.nodesToRender, this.nodesToRender.map(({ uid }) => uid));
    },
    /**
     * Restores the persisted state from sessionStorage. Called on `create` hook.
     */
    restorePersistedState() {
      const technology = sessionStorage.get(STORAGE_KEYS.technology);
      // if the technology does not match, do not use the persisted values
      if (technology !== this.technology) {
        this.trackOpenNodes(this.nodeChangeDeps);
        return;
      }
      // get all open nodes
      const openNodes = sessionStorage.get(STORAGE_KEYS.openNodes, []);
      // create the openNodes map
      this.openNodes = Object.fromEntries(openNodes.map(n => [n, true]));
      // get all the nodes to render
      const nodesToRender = sessionStorage.get(STORAGE_KEYS.nodesToRender, []);
      // generate the array of flat children objects to render
      this.nodesToRender = nodesToRender.map(uid => this.childrenMap[uid]);
      // finally fetch any previously assigned filters
      this.filter = sessionStorage.get(STORAGE_KEYS.filter, '');
      // scroll to the active element
      this.scrollToElement();
    },
    async scrollToElement() {
      await waitFrames(1);
      // if we are filtering, it makes more sense to scroll to top of list
      const index = this.filterPattern
        ? 0
        // find the index of the current active UID in the newly added nodes
        : this.nodesToRender.findIndex(child => child.uid === this.activeUID);
      // if for some reason we cant find the active page, bail.
      // make sure the scroller is visible
      if (index !== -1 && this.$refs.scroller) {
        // call the scroll method on the `scroller` component.
        this.$refs.scroller.scrollToItem(index);
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';
@import '~vue-virtual-scroller/dist/vue-virtual-scroller.css';

.navigator-card {
  overflow: hidden auto;
  height: 100%;
  display: flex;
  flex-direction: column;

  .head-wrapper {
    padding: 10px 36px;
    border-bottom: 1px solid var(--color-grid);
    display: flex;
    align-items: baseline;
    position: relative;

    @include breakpoint(small) {
      justify-content: center;
    }
  }

  .card-icon {
    width: 19px;
    height: 19px;
    color: var(--color-figure-blue);
  }

  @include breakpoint(small) {
    .card-slot {
      order: 2;
    }
    .card-body {
      order: 3;
    }
  }
}

.no-items-wrapper {
  color: var(--color-figure-gray-tertiary);
  @include font-styles(body-reduced);
}

.close-card-mobile {
  display: none;
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-link);

  @include breakpoint(small) {
    display: flex;
  }

  .close-icon {
    width: 1em;
  }
}

.card-body {
  --card-horizontal-spacing: 32px;
  padding: 18px var(--card-horizontal-spacing);
  // right padding is added by the items, so visually the scroller is stuck to the side
  padding-right: 0;
  flex: 1 1 auto;
  min-height: 0;
  @include breakpoint(small) {
    --card-horizontal-spacing: 20px;
    padding-top: 0;
  }
}

.card-link {
  color: var(--color-text);
  @include font-styles(body-reduced);
  font-weight: $font-weight-semibold;
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

.scroller {
  height: 100%;
}
</style>
