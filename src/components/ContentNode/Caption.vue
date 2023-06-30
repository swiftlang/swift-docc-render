<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <component class="caption" :class="{ trailing }" :is="tag">
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

const CaptionPosition = {
  leading: 'leading', // before element and left aligned
  trailing: 'trailing', // after element and center aligned
};

export default {
  name: 'Caption',
  constants: {
    CaptionPosition,
    CaptionTag,
  },
  props: {
    title: {
      type: String,
      required: false,
    },
    tag: {
      type: String,
      required: true,
      validator: v => Object.hasOwnProperty.call(CaptionTag, v),
    },
    position: {
      type: String,
      default: () => CaptionPosition.leading,
      validator: v => Object.hasOwnProperty.call(CaptionPosition, v),
    },
  },
  computed: {
    trailing: ({ position }) => position === CaptionPosition.trailing,
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.caption {
  @include font-styles(documentation-caption);
  margin: 0 0 var(--spacing-stacked-margin-large) 0;

  &.trailing {
    margin: var(--spacing-stacked-margin-large) 0 0 0;
    text-align: center;
  }
}

// for <caption> specifically since it must be the first element in a <table>
// even when displayed at the bottom using this property
caption.trailing {
  caption-side: bottom;
}

/deep/ p {
  display: inline-block;
}
</style>
