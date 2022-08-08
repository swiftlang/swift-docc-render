<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <component
   :id="anchor"
   :is="tag"
   class="section-title"
  >
    <a
      :href="`#${anchor}`"
      class="header-anchor"
      aria-label="hidden"
    >#</a>
    <slot />
  </component>
</template>

<script>
export default {
  name: 'SectionTitle',
  props: {
    anchor: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: () => 'h2',
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.section-title {
  scroll-margin-top: $nav-height + 1rem;

  @include breakpoint(small, $scope: nav) {
    scroll-margin-top: $nav-height-small + 1rem;
  }
}

.section-title:hover {
  .header-anchor {
    opacity: 1;
  }
}

.header-anchor {
  margin-left: -0.73em;
  padding-right: 0.23em;
  transition: opacity .25s;
  opacity: 0;
  text-decoration: none;

  &:hover {
    opacity: 1;
  }
}
</style>
