<template>
  <li
    class="navigator-tree-leaf"
    :class="{ expanded }"
    :style="{ '--nesting-index': nestingIndex }"
  >
    <div class="head-wrapper" :class="{ active }">
      <button
        v-if="childrenFiltered.length"
        class="directory-toggle"
        @click.prevent="toggleTree"
      >
        <InlineChevronRightIcon class="icon-inline chevron" :class="{ rotate: expanded }" />
      </button>
      <router-link :to="item.path" class="leaf-link">
        <NavigatorLeafIcon :type="item.kind" />
        {{ item.title }}
      </router-link>
    </div>
    <TransitionExpand>
      <NavigatorTree
        v-if="expanded && childrenFiltered.length"
        :children="childrenFiltered"
        :nesting-index="nestingIndex + 1"
        :active-path="activePath"
      />
    </TransitionExpand>
  </li>
</template>

<script>
import InlineChevronRightIcon from 'docc-render/components/Icons/InlineChevronRightIcon.vue';
import TransitionExpand from 'docc-render/components/TransitionExpand.vue';
import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';

export default {
  name: 'NavigatorTreeLeaf',
  components: {
    NavigatorLeafIcon,
    TransitionExpand,
    InlineChevronRightIcon,
    NavigatorTree: () => import('docc-render/components/Navigator/NavigatorTree.vue'),
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    expandedItems: {
      type: Array,
      default: () => ([]),
    },
    nestingIndex: {
      type: Number,
      default: 1,
    },
    activePath: {
      type: String,
      required: true,
    },
  },
  computed: {
    expanded({ expandedItems, item }) {
      return expandedItems.includes(item.path);
    },
    active({ item, activePath }) {
      return item.path === activePath;
    },
    // TODO: move this to the backend
    childrenFiltered({ item }) {
      return item.children ? item.children.filter(child => child.kind !== 'groupMarker') : [];
    },
  },
  methods: {
    toggleTree() {
      this.$emit('toggle', this.item.path);
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.head-wrapper {
  padding: 5px 5px 5px calc(var(--nesting-index) * 10px);
  position: relative;

  &.active {
    background: var(--color-fill-gray-quaternary);
  }

  &:hover {
    background: var(--color-fill-light-blue);
  }

  .leaf-link {
    color: var(--color-figure-gray);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 100%;
    display: inline-block;
    vertical-align: middle;

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}

.directory-toggle {
  position: relative;
  z-index: 1;
  width: 10px;
  margin-left: -15px;
  margin-right: 5px;
}

.chevron {
  width: 0.6em;
  transition: transform 0.15s ease-in;

  &.rotate {
    transform: rotate(90deg);
  }
}
</style>
