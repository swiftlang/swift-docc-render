<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2026 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <article class="overviewcard">
    <header v-if="$slots.head" class="overviewcard-head">
      <slot name="head" />
    </header>
    <div class="overviewcard-content">
      <slot />
    </div>
  </article>
</template>

<script>
export default {
  name: 'OverviewCard',
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.overviewcard {
  --overviewcard-border-radius: #{$border-radius};
  --overviewcard-border-style: solid;
  --overviewcard-border-width: 1px;
  --overviewcard-color-border: var(--color-fill);
  --overviewcard-color-content: var(--color-fill-secondary);
  --overviewcard-color-head: var(--color-fill-tertiary);

  background: var(--overviewcard-color-content);
  border:
    var(--overviewcard-border-width)
    var(--overviewcard-border-style)
    var(--overviewcard-color-border);
  border-radius: var(--overviewcard-border-radius);

  @include space-out-between-siblings(var(--spacing-stacked-margin-xlarge));

  & > * {
    padding: 20px;
  }

  &-head {
    background: var(--overviewcard-color-head);
    border-start-start-radius: inherit;
    border-start-end-radius: inherit;
  }
}
</style>
