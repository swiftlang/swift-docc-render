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
  @include font-styles(body-reduced);
  color: var(--colors-secondary-label, var(--color-secondary-label));
  padding: 11px 0;
  background-color: var(--color-fill-gray-quaternary);
  display: flex;
  align-items: center;
  justify-content: center;

  @include breakpoint(medium) {
    padding-left: 2em;
  }

  @include breakpoint(small) {
    flex-direction: column;
    padding-left: 0;
    margin-bottom: rem(40px);
    grid-gap: rem(16px);
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  }
}
</style>
