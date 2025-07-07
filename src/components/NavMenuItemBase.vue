<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <li
    class="nav-menu-item"
    :class="{ 'nav-menu-item--animated': animate }"
  >
    <slot />
  </li>
</template>

<script>
export default {
  name: 'NavMenuItemBase',
  props: {
    /**
     * Adds the animated css class to a menu item.
     * Works when nested inside the NavMenuItems component.
     */
    animate: {
      type: Boolean,
      default: true,
    },
  },
};
</script>
<style lang='scss' scoped>
@import "docc-render/styles/_core.scss";

.nav-menu-item {
  margin-inline-start: $nav-menu-item-left-margin;
  list-style: none;
  min-width: 0;

  @include nav-in-breakpoint {
    margin-inline-start: 0;
    width: 100%;
    min-height: rem(42px);
    // remove the first border of the first element
    &:first-child {
      :deep(.nav-menu-link) {
        border-top: 0;
      }
    }
  }
}

// To see the animation, a `NavMenuItemBase` component
// must have the `animated` prop as well,
// as be used inside a `NavMenuItems` component.
.nav-menu-item--animated {
  @include nav-in-breakpoint {
    opacity: 0;
    transform: $nav-menu-item-displacement;
    transition: 0.5s ease;
    transition-property: transform, opacity;

    // add expanded styles
    @include nav-is-open($nested: true) {
      opacity: 1;
      transform: translate3d(0, 0, 0);
      transition-delay: $nav-menu-item-stagger-delay;
    }
  }
}
</style>
