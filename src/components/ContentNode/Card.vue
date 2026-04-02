<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2026 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <article class="card">
    <header v-if="$slots.head" class="card-head">
      <slot name="head" />
    </header>
    <div class="card-content">
      <slot />
    </div>
  </article>
</template>

<script>
export default {
  name: 'Card',
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.card {
  --card-border-radius: 4px;
  --card-border-style: solid;
  --card-border-width: 1px;
  --card-color-border: var(--color-fill);
  --card-color-content: var(--color-fill-secondary);
  --card-color-head: var(--color-fill-tertiary);

  background: var(--card-color-content);
  border: var(--card-border-width) var(--card-border-style) var(--card-color-border);
  border-radius: var(--card-border-radius);

  @include space-out-between-siblings(var(--spacing-stacked-margin-xlarge));

  & > * {
    padding: 20px;
  }

  &-head {
    background: var(--card-color-head);
    border-start-start-radius: inherit;
    border-start-end-radius: inherit;
  }
}
</style>
