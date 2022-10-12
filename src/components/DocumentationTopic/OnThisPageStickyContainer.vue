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
export const ON_THIS_PAGE_CONTENT_BREAKPOINT = 1050;

export default {
  name: 'OnThisPageStickyContainer',
  inject: ['store'],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isHidden: ({ store }) => store.state.contentWidth < ON_THIS_PAGE_CONTENT_BREAKPOINT,
  },
  watch: {
    isHidden: {
      immediate: true,
      handler(v) {
        this.$emit('update:visible', !v);
      },
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.OnThisPageStickyContainer {
  margin-top: $contenttable-spacing-single-side;
  position: sticky;
  top: $nav-height + rem(10px);
  align-self: flex-start;
  flex: 0 0 auto;
  width: $on-this-page-aside-width;
  padding-right: $nav-padding;
  box-sizing: border-box;

  @include breakpoint(small) {
    display: none;
  }

  &.hidden {
    display: none;
  }
}
</style>
