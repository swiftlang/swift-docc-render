<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ul
    class="nav-menu-items"
    :data-previous-menu-children-count="previousSiblingChildren"
  >
    <slot />
  </ul>
</template>

<script>
export default {
  name: 'NavMenuItems',
  props: {
    /**
     * Defined the amount of children the previous sibling has.
     * Used to help with staggering effects on children.
     * @see NavMenuItem
     */
    previousSiblingChildren: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style lang='scss' scoped>
@import "docc-render/styles/_core.scss";

$vertical-padding: $nav-height-small - $nav-padding-small;
.nav-menu-items {
  display: flex;
  justify-content: flex-end;

  // adds a subtle fade-in animation effect on mobile
  @include nav-in-breakpoint {
    display: block;
    opacity: 0;
    padding: rem(17px) $vertical-padding rem(28px) $vertical-padding;
    transform: $nav-menu-items-displacement;
    transition: transform 1s $nav-items-timingfunction 0.5s,
    opacity 0.7s $nav-items-timingfunction 0.2s;

    @include nav-is-open($nested: true) {
      opacity: 1;
      transform: translate3d(0, 0, 0);
      transition-delay: 0.2s, 0.4s;
    }
    &:not(:only-child) {
      // for multiple menu-items, remove the extra padding between them.
      &:not(:last-child) {
        padding-bottom: 0;
      }
      &:last-child {
        padding-top: 0;
      }
    }
  }
}
</style>
