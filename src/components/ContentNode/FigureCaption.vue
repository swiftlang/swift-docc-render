<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <component class="caption" :class="{ centered }" :is="tag">
    <template v-if="title">
      <strong>{{ title }}</strong>&nbsp;<slot />
    </template>
    <template v-else>
      <slot />
    </template>
  </component>
</template>

<script>
const CaptionTag = {
  caption: 'caption',
  figcaption: 'figcaption',
};

export default {
  name: 'FigureCaption',
  constants: { CaptionTag },
  props: {
    title: {
      type: String,
      required: false,
    },
    centered: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: String,
      required: true,
      validator: v => Object.hasOwnProperty.call(CaptionTag, v),
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.caption {
  @include font-styles(documentation-figcaption);

  &.centered {
    text-align: center;
  }
}

// `space-out-between-siblings` helper would normally be used, but it won't work
// for certain things like <picture> or <thead>/<tbody> with different
// display types, so the spacing is manually done here for both kinds of
// captions
figcaption {
  &:first-child {
    margin: 0 0 var(--spacing-stacked-margin-large) 0;
  }
  &:last-child {
    margin: var(--spacing-stacked-margin-large) 0 0 0;
  }
}
caption {
  margin: 0 0 var(--spacing-stacked-margin-large) 0;

  // `caption-side` must be used for the table version of <caption> to appear
  // underneath the table since the element must always be the first element
  // within the <table> in the DOM according to the spec
  &.centered {
    caption-side: bottom;
    margin: var(--spacing-stacked-margin-large) 0 0 0;
  }
}

/deep/ p {
  display: inline-block;
}
</style>
