<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div class="OnThisPageStickyContainer" :class="{ hidden: isHidden }">
    <slot />
  </div>
</template>

<script>

export const ON_THIS_PAGE_CONTENT_BREAKPOINT = 1270;
export default {
  name: 'OnThisPageStickyContainer',
  inject: ['store'],
  computed: {
    isHidden: ({ store }) => store.state.contentWidth < ON_THIS_PAGE_CONTENT_BREAKPOINT,
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.OnThisPageStickyContainer {
  $sticky-aside-width: rem(170px);
  margin-top: $contenttable-spacing-single-side;
  position: sticky;
  top: $nav-height;
  align-self: flex-start;
  flex: 0 0 auto;
  width: $sticky-aside-width;
  margin-left: -($sticky-aside-width + $nav-padding);
  padding-right: $nav-padding;

  @include breakpoint(small) {
    display: none;
  }

  &.hidden {
    display: none;
  }

  // if there is a sidebar, and its hidden, OR when we dont have a sidebar at all
  .full-width-container.sidebar-hidden &, .static-width-container {
    // 1080 content + 2x170px(aside) == 1500px. Extra 15px on each side.
    // Anything below it wont fit the floating aside
    @media screen and (max-width: 1500px) {
      display: none;
    }
  }
}
</style>
