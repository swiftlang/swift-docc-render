<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="navigator-card-item"
    :role="isGroupMarker ? null : 'link'"
    :tabindex="isFocused ? '0' : '-1'"
    :class="{ expanded }"
    :style="{ '--nesting-index': item.depth }"
    :aria-hidden="isRendered ? null : 'true'"
    :aria-expanded="expanded ? 'true': 'false'"
    :aria-describedby="ariaDescribedBy"
    :id="`container-${item.uid}`"
    @keydown.left.prevent="toggleTree"
    @keydown.right.prevent="toggleTree"
    @keydown.enter.prevent="clickReference"
  >
    <div class="head-wrapper" :class="{ active: isActive, 'is-group': isGroupMarker }">
      <span
        hidden
        :id="usageLabel"
      >
        To navigate the symbols, press Up Arrow, Down Arrow, Left Arrow or Right Arrow
      </span>
      <div class="depth-spacer">
        <button
          v-if="isParent"
          class="tree-toggle"
          tabindex="-1"
          @click.exact.prevent="toggleTree"
          @click.alt.prevent="toggleEntireTree"
          @click.meta.prevent="toggleSiblings"
        >
          <InlineChevronRightIcon class="icon-inline chevron" :class="{ rotate: expanded }" />
        </button>
      </div>
      <NavigatorLeafIcon
        v-if="!isGroupMarker && !apiChange"
        :type="item.type"
        class="navigator-icon"
      />
      <span
        v-else-if="apiChange"
        class="navigator-icon"
        :class="{ [`changed changed-${apiChange}`]: apiChange }"
      />
      <div class="title-container">
        <span
          v-if="isParent"
          hidden
          :id="parentLabel"
        >, containing {{ item.childUIDs.length }} symbols</span>
        <span
          :id="siblingsLabel"
          hidden
        >
          {{ item.index + 1 }} of {{ item.siblingsCount }} symbols inside
        </span>
        <Reference
          :id="item.uid"
          :url="item.path || ''"
          :isActive="!isGroupMarker"
          :class="{ bolded: isBold }"
          class="leaf-link"
          tabindex="-1"
          ref="reference"
          @click.native="$emit('navigate', item.uid)"
        >
          <HighlightMatches
            :text="item.title"
            :matcher="filterPattern"
          />
        </Reference>
        <Badge v-if="isDeprecated" variant="deprecated" />
      </div>
    </div>
  </div>
</template>

<script>
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';
import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import HighlightMatches from 'docc-render/components/Navigator/HighlightMatches.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import Badge from 'docc-render/components/Badge.vue';
import { TopicTypes } from 'docc-render/constants/TopicTypes';
import { ChangeTypesOrder } from 'docc-render/constants/Changes';

export default {
  name: 'NavigatorCardItem',
  components: {
    HighlightMatches,
    NavigatorLeafIcon,
    InlineChevronRightIcon,
    Reference,
    Badge,
  },
  props: {
    isRendered: {
      type: Boolean,
      default: false,
    },
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
    apiChange: {
      type: String,
      default: null,
      validator: v => ChangeTypesOrder.includes(v),
    },
    isFocused: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    isGroupMarker: ({ item: { type } }) => type === TopicTypes.groupMarker,
    isParent: ({ item }) => !!item.childUIDs.length,
    parentLabel: ({ item }) => `label-parent-${item.uid}`,
    siblingsLabel: ({ item }) => `label-${item.uid}`,
    usageLabel: ({ item }) => `usage-${item.uid}`,
    ariaDescribedBy({
      item, siblingsLabel, parentLabel, isParent, usageLabel,
    }) {
      const baseLabel = `${siblingsLabel} ${item.parent}`;
      if (!isParent) return `${baseLabel} ${usageLabel}`;
      return `${baseLabel} ${parentLabel} ${usageLabel}`;
    },
    isDeprecated: ({ item: { deprecated } }) => !!deprecated,
  },
  methods: {
    toggleTree() {
      this.$emit('toggle', this.item);
    },
    toggleEntireTree() {
      this.$emit('toggle-full', this.item);
    },
    toggleSiblings() {
      this.$emit('toggle-siblings', this.item);
    },
    clickReference() {
      this.$refs.reference.$el.click();
    },
    selfFocus() {
      this.$el.focus();
    },
  },
  watch: {
    isFocused(newVal) {
      if (newVal) {
        this.selfFocus();
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

$item-height: 32px;
$chevron-width: $card-horizontal-spacing;
$tree-toggle-padding: $card-horizontal-spacing-small;
$depth-spacer-base-spacing: (
  $card-horizontal-spacing + $chevron-width + $tree-toggle-padding
);
$nesting-spacing: $card-horizontal-spacing + $card-horizontal-spacing-small;

.navigator-card-item {
  height: $item-height;
  display: flex;
  align-items: center;

  @include on-keyboard-focus {
    margin: $card-horizontal-spacing-small;
    height: $item-height - 10px;

    .depth-spacer {
      margin-left: -$card-horizontal-spacing-small;
    }
  }
}

.depth-spacer {
  width: calc(var(--nesting-index) * #{$nesting-spacing} + #{$depth-spacer-base-spacing});
  height: $item-height;
  position: relative;
  flex: 0 0 auto;
  @include on-keyboard-focus {
    margin: 0 -$card-horizontal-spacing-small;
  }
}

.head-wrapper {
  padding: 0 $card-horizontal-spacing;
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  height: 100%;

  &.active {
    background: var(--color-fill-gray-quaternary);
  }

  &.is-group {
    .leaf-link {
      color: var(--color-figure-gray-secondary);
      font-weight: $font-weight-semibold;
    }
  }

  .hover &:not(.is-group) {
    background: var(--color-navigator-item-hover);
  }

  .navigator-icon {
    display: flex;
    flex: 0 0 auto;

    &.changed {
      border: none;
      width: rem(16px);
      height: rem(16px);
      margin-right: 6px;

      &:after {
        width: 100%;
        height: 100%;
        background-image: $modified-rounded-svg;

        @include prefers-dark {
          background-image: $modified-dark-rounded-svg;
        }
        margin: 0;
      }

      &-added::after {
        background-image: $added-rounded-svg;

        @include prefers-dark {
          background-image: $added-dark-rounded-svg;
        }
      }

      &-deprecated::after {
        background-image: $deprecated-rounded-svg;

        @include prefers-dark {
          background-image: $deprecated-dark-rounded-svg;
        }
      }
    }
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

    &:hover {
      text-decoration: none;
    }

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
  position: absolute;
  width: 100%;
  height: 100%;
  padding-right: $tree-toggle-padding;
  box-sizing: border-box;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.title-container {
  min-width: 0;
  display: flex;
  align-items: center;
}

.chevron {
  width: $chevron-width;
  transition: transform 0.15s ease-in;

  &.rotate {
    transform: rotate(90deg);
  }
}
</style>
