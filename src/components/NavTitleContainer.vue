<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <router-link class="nav-title-content" :to="to">
    <span class="title"><slot /></span>
    <span class="subhead">&nbsp;<slot name="subhead" /></span>
  </router-link>
</template>

<script>
export default {
  name: 'NavTitleContainer',
  props: {
    to: {
      type: [String, Object],
      required: true,
    },
  },
};
</script>

<style lang='scss' scoped>
@import "docc-render/styles/_core.scss";

// make sure we dont overflow for long titles
.nav-title-content {
  max-width: 100%;
}

.title {
  color: var(--color-nav-root-title, currentColor);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
  vertical-align: top;
  max-width: 296px;
  @include breakpoint(medium, $scope: nav) {
    max-width: 205px;
  }
  @include breakpoint(small, $scope: nav) {
    flex-basis: fill;
    display: initial;
    vertical-align: initial;
    max-width: initial;
  }
}

.subhead {
  color: var(--color-nav-root-subhead);

  @include nav-dark {
    color: var(--color-nav-dark-root-subhead);
  }
}
</style>
