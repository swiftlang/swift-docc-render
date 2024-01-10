<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="topictitle">
    <span v-if="eyebrow" class="eyebrow">{{eyebrow}}</span>
    <h1 class="title">
      <slot />
      <slot name="after" />
    </h1>
  </div>
</template>

<script>
export default {
  name: 'Title',
  props: {
    eyebrow: {
      type: String,
      required: false,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.eyebrow {
  @include font-styles(eyebrow-reduced);
  color: var(--color-documentation-intro-eyebrow, dark-color(figure-gray-secondary));
  display: block;
  margin-bottom: rem(20px);

  .documentation-hero--disabled & {
    color: var(--colors-secondary-label, var(--color-secondary-label));
  }
}

.title {
  @include font-styles(headline-reduced);
  color: var(--color-documentation-intro-title, dark-color(figure-gray));
  margin-bottom: rem(12px);

  .documentation-hero--disabled & {
    color: var(--colors-header-text, var(--color-header-text));
  }
}

small {
  @include font-styles(eyebrow);
  padding-left: 10px;

  &::before {
    content: attr(data-tag-name);
  }

  &.Beta {
    color: var(--color-badge-beta);

    .theme-dark & {
      color: var(--color-badge-dark-beta);
    }
  }

  &.Deprecated {
    color: var(--color-badge-deprecated);

    .theme-dark & {
      color: var(--color-badge-dark-deprecated);
    }
  }
}
</style>
