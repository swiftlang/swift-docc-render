<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    v-bind="$attrs"
    class="navigator-card-item"
  >
    <div class="head-wrapper">
      <div class="depth-spacer">
        <slot name="depth-spacer" />
      </div>
      <slot name="navigator-icon" className="navigator-icon" />
      <div class="title-container">
        <slot name="title-container" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseNavigatorCardItem',
  inheritAttrs: false,
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

  @include on-keyboard-focus-within() {
    margin: $card-horizontal-spacing-small;
    height: $item-height - 10px;
    @include focus-outline();

    .depth-spacer {
      margin-left: -$card-horizontal-spacing-small;
    }
  }
}

.depth-spacer {
  --nesting-index: 0;
  width: calc(var(--nesting-index) * #{$nesting-spacing} + #{$depth-spacer-base-spacing});
  height: $item-height;
  position: relative;
  flex: 0 0 auto;
  @include on-keyboard-focus {
    margin: 0 -$card-horizontal-spacing-small;
  }
}

.head-wrapper {
  padding: 0 $card-horizontal-spacing-large 0 $card-horizontal-spacing;
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  height: 100%;

  @include safe-area-left-set(padding-left, $card-horizontal-spacing);
  @include safe-area-right-set(padding-right, $card-horizontal-spacing-large);
}
</style>
