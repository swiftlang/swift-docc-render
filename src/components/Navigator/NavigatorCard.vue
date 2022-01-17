<template>
  <div class="navigator-card">
    <div class="head-wrapper" :class="{ 'extra-info': showExtendedInfo }">
      <NavigatorLeafIcon :kind="kind" class="card-icon" />
      <span class="card-link">
        {{ technology }}
      </span>
    </div>
    <div class="card-body">
      <RecycleScroller
        v-if="nodesToRender.length"
        ref="scroller"
        class="scroller"
        :items="nodesToRender"
        :item-size="leafSize"
        key-field="uid"
        v-slot="{ item }"
      >
        <NavigatorCardItem
          :item="item"
          :filter-pattern="filterPattern"
          :show-extended-info="showExtendedInfo"
          :is-active="item.uid === activeUID"
          :expanded="openNodes[item.uid]"
          @toggle="toggle"
        />
      </RecycleScroller>
      <div class="no-items-wrapper" v-else>
        <template v-if="filterPattern">
          No results matching your filter
        </template>
        <template v-else>
          Technology has no children
        </template>
      </div>
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
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

/**
 * Renders the card for a technology and it's child symbols, in the navigator.
 * For performance reasons, the component uses watchers over computed, so we can more precisely
 * manage when re-calculations and re-rendering is done.
 */
export default {
  name: 'NavigatorCard',
  components: {
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
     * Return the leaf size for the Scroller element
     */
    leafSize: ({ showExtendedInfo }) => (showExtendedInfo ? LEAF_SIZES.max : LEAF_SIZES.min),
    /**
     * Generates an object with the uid as the key.
     * @return {Object.<string, NavigatorFlatItem>}
     */
    childrenMap({ children }) {
      return Object.fromEntries(children.map(child => [child.uid, child]));
    },
    /**
     * Returns an array of UIDs, for the current page hierarchy
     * @return string[]
     */
    activePathUIDs() {
      return this.activePath.map(path => (
        // TODO: Might need to find a better way to find, as the path is not unique per uid
        (this.children.find(child => path === child.path) || {}).uid
      )).filter(Boolean);
    },
    /**
     * Returns the current page uid
     * @return string
     */
    activeUID({ activePathUIDs }) {
      return activePathUIDs[activePathUIDs.length - 1];
    },
    /**
     * Returns a list of the child nodes, that match the filter pattern.
     * @returns NavigatorFlatItem[]
     */
    filteredChildren({ children, filterPattern }) {
      if (!filterPattern) return [];
      const matches = children.filter(({ title }) => filterPattern.test(title));
      // remove duplicate UIDs
      return [...new Set(matches.flatMap(({ uid }) => this.getParents(uid)))];
    },
  },
  mounted() {
    this.initPageChangeWatcher();
  },
  methods: {
    /**
     * Finds which nodes need to be opened.
     * Initiates a watcher, that reacts to filtering and page navigation.
     */
    initPageChangeWatcher() {
      // watch as option, does not support watching multiple sources
      const unwatch = this.$watch(vm => [vm.filteredChildren, vm.activePathUIDs],
        function mountedWatcher() {
          let nodes;
          if (!this.filterPattern) {
            nodes = Object.fromEntries(this.activePathUIDs
              .map(uid => [uid, true]));
          } else {
            nodes = Object.fromEntries(this.filteredChildren
              .map(({ uid }) => [uid, true]));
          }
          this.openNodes = nodes;
          this.generateNodesToRender({ scrollToElement: true });
        }, { immediate: true });
      this.$once('hook:beforeDestroy', unwatch);
    },
    /**
     * Toggle a node open/close
     */
    toggle(node) {
      const isOpen = this.openNodes[node.uid];
      if (isOpen) {
        // clone the open nodes
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
     * Get all the parents of a node
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
        // add it's uid
        arr.unshift(obj);
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
      // if for some reason we cant find the active page, bail
      if (index !== -1) {
        // call the scroll method on the `scroller` component.
        this.$refs.scroller.scrollToItem(index);
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.navigator-card {
  overflow: hidden auto;
  height: 100%;
  display: flex;
  flex-direction: column;

  .head-wrapper {
    padding: 10px 20px;
    border-bottom: 1px solid var(--color-grid);
    display: flex;
    align-items: center;
  }

  .card-icon {
    color: var(--color-figure-blue);
  }
}

.no-items-wrapper {
  color: var(--color-figure-gray-tertiary);
  @include font-styles(body-reduced);
}

.card-body {
  padding: 10px 20px;
  // right padding is added by the items, so visually the scroller is stuck to the side
  padding-right: 0;
  flex: 1 1 auto;
  min-height: 0;
}

.card-link {
  color: var(--color-text);
  @include font-styles(body-tight);
  font-weight: $font-weight-semibold;
}

.scroller {
  height: 100%;
}
</style>
