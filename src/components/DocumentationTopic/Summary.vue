<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="summary">
    <slot />
  </div>
</template>

<script>

export default {
  name: 'Summary',
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.summary {
  color: var(--colors-secondary-label, var(--color-secondary-label));
  font-size: rem(16px);
  margin-bottom: $section-spacing-single-side;
  padding: 5px 0 0 4em;

  @include breakpoint(medium) {
    padding-left: 2em;
  }

  @include breakpoint(small) {
    padding-left: 0;
    margin-bottom: rem(40px);
    display: grid;
    grid-gap: rem(16px);
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  }
}
</style>
