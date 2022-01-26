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
      <slot />
    </div>
  </div>
</template>

<script>
import { clone } from 'docc-render/utils/data';
import { waitFrames } from 'docc-render/utils/loading';
import { INDEX_ROOT_KEY, LEAF_SIZES } from 'docc-render/constants/sidebar';
import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import NavigatorCardItem from 'docc-render/components/Navigator/NavigatorCardItem.vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import InlineCloseIcon from 'theme/components/Icons/InlineCloseIcon.vue';

/**
 * Renders the card for a technology and it's child symbols, in the navigator.
 * For performance reasons, the component uses watchers over computed, so we can more precisely
 * manage when re-calculations and re-rendering is done.
 */
export default {
  name: 'NavigatorCard',
  components: {
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
    filterPattern: {
      type: RegExp,
      default: undefined,
    },
    kind: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      /** @type {Object.<string, boolean>} */
      openNodes: {},
      /** @type {NavigatorFlatItem[]} */
      nodesToRender: [],
    };
  },
  computed: {
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
    nodeChangeDeps: ({ filteredChildren, activePathChildren }) => ([
      filteredChildren,
      activePathChildren,
    ]),
  },
  watch: {
    nodeChangeDeps: {
      immediate: true,
      handler: 'trackOpenNodes',
    },
  },
  methods: {
    /**
     * Finds which nodes need to be opened.
     * Initiates a watcher, that reacts to filtering and page navigation.
     */
    trackOpenNodes(
      [filteredChildren, activePathChildren],
      [, activePathChildrenBefore] = [],
    ) {
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
      // check if we want to scroll to the element
      if (!scrollToElement) return;
      // wait a frame, so the scroller is ready, `nextTick` is not enough.
      await waitFrames(1);
      // if we are filtering, it makes more sense to scroll to top of list
      const index = filterPattern
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

.scroller {
  height: 100%;
}
</style>
