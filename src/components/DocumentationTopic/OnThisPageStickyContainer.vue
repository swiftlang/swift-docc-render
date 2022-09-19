<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
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
// 660px content + (170px aside + 22px padding-right)*2 + 28px*2 gutter
export const ON_THIS_PAGE_CONTENT_BREAKPOINT = 1110;
// 1080 content + (170px aside + 22px padding-right)
export const ON_THIS_PAGE_CONTENT_BREAKPOINT_BIG = 1272;

export default {
  name: 'OnThisPageStickyContainer',
  inject: ['store'],
  computed: {
    isHidden: ({ store }) => {
      let compareTo = ON_THIS_PAGE_CONTENT_BREAKPOINT;
      // when the window is above 1500, the content max-width grows
      if (window.outerWidth >= 1500) {
        compareTo = ON_THIS_PAGE_CONTENT_BREAKPOINT_BIG;
      }
      return store.state.contentWidth < compareTo;
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.OnThisPageStickyContainer {
  $aside-width: rem(170px);
  margin-top: $contenttable-spacing-single-side;
  position: sticky;
  top: $nav-height + rem(10px);
  align-self: flex-start;
  flex: 0 0 auto;
  width: $aside-width;
  margin-left: -($aside-width + $nav-padding);
  padding-right: $nav-padding;

  @include breakpoint(small) {
    display: none;
  }

  &.hidden {
    display: none;
  }
}
</style>
