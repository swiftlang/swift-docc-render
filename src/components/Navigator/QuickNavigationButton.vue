<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <button
    :aria-label="$t('quicknav.button.label')"
    class="quick-navigation-open"
    :title="$t('quicknav.button.title')"
    v-on="$listeners"
  >
    /
  </button>
</template>

<script>
export default { name: 'QuickNavigationButton' };
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.quick-navigation-open {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $icon-size-default;
  border: 1px solid var(--color-grid);
  height: 100%;
  border-radius: $border-radius;
  transition: background-color .15s;
  box-sizing: border-box;

  &:hover {
    background-color: var(--color-fill-tertiary);
  }

  @include breakpoint(medium, nav) {
    display: none;
  }

  @include on-keyboard-focus() {
    @include focus-shadow-form-element();
  }
}
</style>
