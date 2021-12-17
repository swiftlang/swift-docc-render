<template>
  <li
    class="navigator-tree-leaf"
    :class="{ expanded, 'extra-info': showExtendedInfo }"
    :style="{ '--nesting-index': nestingIndex }"
  >
    <div class="head-wrapper" :class="{ active: isActive }">
      <button
        v-if="childrenFiltered.length"
        class="directory-toggle"
        @click.prevent="toggleTree"
      >
        <InlineChevronRightIcon class="icon-inline chevron" :class="{ rotate: expanded }" />
      </button>
      <NavigatorLeafIcon :type="item.kind" />
      <div class="title-container">
        <router-link :to="item.path" class="leaf-link">
          <HighlightMatch
            :text="item.title"
            :matcher="filterPattern"
          />
        </router-link>
        <ContentNode
          v-if="item.abstract"
          v-show="showExtendedInfo"
          :content="item.abstract"
          class="extended-content"
        />
      </div>
    </div>
    <TransitionExpand>
      <NavigatorTree
        v-if="expanded && childrenFiltered.length"
        :children="childrenFiltered"
        :nesting-index="nestingIndex + 1"
        :active-path="activePathMinusFirst"
        :show-extended-info="showExtendedInfo"
        :filter-pattern="filterPattern"
      />
    </TransitionExpand>
  </li>
</template>

<script>
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';
import TransitionExpand from 'docc-render/components/TransitionExpand.vue';
import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';
import HighlightMatch from 'docc-render/components/Navigator/HighlightMatches.vue';

export default {
  name: 'NavigatorTreeLeaf',
  components: {
    HighlightMatch,
    ContentNode,
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
  },
  computed: {
    expanded({ expandedItems, item }) {
      return expandedItems.includes(item.path);
    },
    isActive({ item, activePath }) {
      return activePath.length === 1 && item.path === activePath[0];
    },
    activePathMinusFirst: ({ activePath }) => activePath.slice(1),
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
  padding: 7.5px 5px 7.5px calc(var(--nesting-index) * 10px);
  position: relative;
  display: flex;
  align-items: baseline;
  border-radius: $border-radius;

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
    @include font-styles(body-reduced);

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

.extended-content {
  @include font-styles(body-reduced);
  color: var(--color-figure-gray-secondary);
}

.directory-toggle {
  position: relative;
  z-index: 1;
  width: 10px;
  margin-left: -15px;
  margin-right: 5px;
}

.title-container {
  min-width: 0;
}

.chevron {
  width: 0.6em;
  transition: transform 0.15s ease-in;

  &.rotate {
    transform: rotate(90deg);
  }
}
</style>
