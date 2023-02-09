<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="navigator-card-item">
    <div class="head-wrapper">
      <div class="depth-spacer">
        <slot name="depth-spacer" />
      </div>
      <div
        v-if="!hideNavigatorIcon"
        class="navigator-icon-wrapper"
      >
        <slot
          name="navigator-icon"
          className="navigator-icon"
        />
      </div>
      <div class="title-container">
        <slot name="title-container" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseNavigatorCardItem',
  props: {
    hideNavigatorIcon: {
      type: Boolean,
      default: () => false,
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

$item-height: 32px;
$chevron-width: $nav-card-horizontal-spacing;
$tree-toggle-padding: $nav-card-horizontal-spacing-small;
$depth-spacer-base-spacing: (
  $nav-card-horizontal-spacing + $chevron-width + $tree-toggle-padding
);
$nesting-spacing: $nav-card-horizontal-spacing + $nav-card-horizontal-spacing-small;

.navigator-card-item {
  --nav-head-wrapper-left-space: #{$nav-card-horizontal-spacing};
  --nav-head-wrapper-right-space: #{$nav-card-horizontal-spacing-large};
  --head-wrapper-vertical-space: 5px;
  --nav-depth-spacer: #{$depth-spacer-base-spacing};
  --nesting-index: 0;

  display: flex;
  align-items: stretch;
  min-height: $item-height;
  box-sizing: border-box;

  @include on-keyboard-focus-within() {
    @include focus-outline(-4px);
  }

  &.active {
    background: var(--color-fill-gray-quaternary);
  }

  &:not(.is-group) {
    .hover & {
      background: var(--color-navigator-item-hover);
    }
  }
}

.depth-spacer {
  width: calc(var(--nesting-index) * #{$nesting-spacing} + var(--nav-depth-spacer));
  height: 100%;
  position: relative;
  flex: 0 0 auto;
}

.title-container {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
}

.navigator-icon-wrapper {
  margin-right: 7px;
}

.head-wrapper {
  padding: var(--head-wrapper-vertical-space)
  var(--nav-head-wrapper-right-space)
  var(--head-wrapper-vertical-space)
  var(--nav-head-wrapper-left-space);
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;

  @include safe-area-left-set(padding-left, var(--nav-head-wrapper-left-space));
  @include safe-area-right-set(padding-right, var(--nav-head-wrapper-right-space));
}
</style>
