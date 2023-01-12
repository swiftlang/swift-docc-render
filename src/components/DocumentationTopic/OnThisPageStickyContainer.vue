<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div class="OnThisPageStickyContainer">
    <slot />
  </div>
</template>

<script>

export default {
  name: 'OnThisPageStickyContainer',
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.OnThisPageStickyContainer {
  $top: $nav-height + rem(10px);
  margin-top: $contenttable-spacing-single-side;
  position: sticky;
  top: $top;
  align-self: flex-start;
  flex: 0 0 auto;
  width: $on-this-page-aside-width;
  padding-right: $nav-padding;
  box-sizing: border-box;
  padding-bottom: $stacked-margin-small;
  max-height: calc(100vh - #{$top});
  overflow: auto;

  @media print {
    display: none;
  }

  @include breakpoint(small) {
    display: none;
  }
}
</style>
