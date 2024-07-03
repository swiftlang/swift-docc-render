<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section class="contenttable alt-light">
    <div :class="['container', { 'minimized-container': enableMinimized }]">
      <LinkableHeading class="title" :anchor="anchor">{{ title }}</LinkableHeading>
      <slot />
    </div>
  </section>
</template>

<script>
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';

export default {
  name: 'ContentTable',
  components: { LinkableHeading },
  props: {
    anchor: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    enableMinimized: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.container:not(.minimized-container) {
  @include dynamic-content-container;
}

.container {
  --section-spacing-single-side: #{$section-spacing-single-side};
  &.minimized-container {
    --section-spacing-single-side: 1.5em;

    .contenttable-section {
      padding-top: var(--section-spacing-single-side);
    }
  }
  padding-bottom: var(--section-spacing-single-side);
}

.title {
  @include font-styles(heading-2-reduced);
  padding-top: var(--section-spacing-single-side);
  border-top-color: var(--color-grid);
  border-top-style: solid;
  border-top-width: var(--content-table-title-border-width, 1px);
}
</style>
