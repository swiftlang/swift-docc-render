<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="navigator-card-item"
    :class="{ expanded }"
    :style="{ '--nesting-index': item.depth }"
  >
    <div class="head-wrapper" :class="{ active: isActive, 'is-group': isGroupMarker }">
      <button
        v-if="item.childUIDs.length"
        class="tree-toggle"
        @click.exact.prevent="toggleTree"
        @click.alt.prevent="toggleEntireTree"
      >
        <InlineChevronRightIcon class="icon-inline chevron" :class="{ rotate: expanded }" />
      </button>
      <NavigatorLeafIcon v-if="!isGroupMarker" :kind="item.kind" class="navigator-icon" />
      <div class="title-container">
        <Reference
          :url="item.path"
          :isActive="!isGroupMarker"
          :class="{ bolded: isBold }"
          class="leaf-link"
        >
          <HighlightMatches
            :text="item.title"
            :matcher="filterPattern"
          />
        </Reference>
      </div>
    </div>
  </div>
</template>

<script>
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';
import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import HighlightMatches from 'docc-render/components/Navigator/HighlightMatches.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import { TopicKind } from 'docc-render/constants/kinds';

export default {
  name: 'NavigatorCardItem',
  components: {
    HighlightMatches,
    NavigatorLeafIcon,
    InlineChevronRightIcon,
    Reference,
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
    filterPattern: {
      type: RegExp,
      default: undefined,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isBold: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isGroupMarker: ({ item: { kind } }) => kind === TopicKind.groupMarker,
  },
  methods: {
    toggleTree() {
      this.$emit('toggle', this.item);
    },
    toggleEntireTree() {
      this.$emit('toggle-full', this.item);
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.navigator-card-item {
  height: 32px;
  display: flex;
  align-items: center;
  padding-right: var(--card-horizontal-spacing);
}

.head-wrapper {
  padding: 5.5px 5px 5.5px calc(var(--nesting-index) * 14px + 26px);
  position: relative;
  display: flex;
  align-items: baseline;
  border-radius: $border-radius;
  flex: 1;
  min-width: 0;

  &.active {
    background: var(--color-fill-gray-quaternary);
  }

  &.is-group {
    .leaf-link {
      color: var(--color-figure-gray-secondary);
      font-weight: $font-weight-semibold;
    }

    &:hover {
      background: inherit;
    }
  }

  .hover & {
    background: var(--color-navigator-item-hover);
  }

  .navigator-icon {
    display: flex;
    transform: translateY(3px);
    flex: 0 0 auto;
  }

  .leaf-link {
    color: var(--color-figure-gray);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 100%;
    display: inline;
    vertical-align: middle;
    @include font-styles(body-reduced-tight);

    &.bolded {
      font-weight: $font-weight-semibold;
    }

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
  $size: 15px;
  $margin: 5px;
  position: relative;
  z-index: 1;
  width: $size;
  height: $size;
  margin-left: -$size - $margin;
  margin-right: $margin;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.title-container {
  min-width: 0;
  display: flex;
  flex-flow: column;
}

.chevron {
  width: 0.6em;
  transition: transform 0.15s ease-in;

  &.rotate {
    transform: rotate(90deg);
  }
}
</style>
