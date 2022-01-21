<template>
  <div
    class="navigator-card-item"
    :class="{ expanded, 'extra-info': showExtendedInfo }"
    :style="{ '--nesting-index': item.depth }"
  >
    <div class="head-wrapper" :class="{ active: isActive }">
      <button
        v-if="item.childUIDs.length"
        class="tree-toggle"
        @click.prevent="toggleTree"
      >
        <InlineChevronRightIcon class="icon-inline chevron" :class="{ rotate: expanded }" />
      </button>
      <NavigatorLeafIcon :kind="item.kind" />
      <div class="title-container">
        <router-link :to="item.path" class="leaf-link">
          <HighlightMatches
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
  </div>
</template>

<script>
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';
import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';
import HighlightMatches from 'docc-render/components/Navigator/HighlightMatches.vue';

export default {
  name: 'NavigatorCardItem',
  components: {
    HighlightMatches,
    ContentNode,
    NavigatorLeafIcon,
    InlineChevronRightIcon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    showExtendedInfo: {
      type: Boolean,
      default: false,
    },
    filterPattern: {
      type: RegExp,
      default: undefined,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    toggleTree() {
      this.$emit('toggle', this.item);
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.navigator-card-item {
  height: 40px;
  display: flex;
  align-items: center;
  padding-right: 20px;

  &.extra-info {
    height: 60px;
  }
}

.head-wrapper {
  padding: 7.5px 5px 7.5px calc(var(--nesting-index) * 10px + 20px);
  position: relative;
  display: flex;
  align-items: baseline;
  border-radius: $border-radius;
  flex: 1;
  min-width: 0;

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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-toggle {
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
