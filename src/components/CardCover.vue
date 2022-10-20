<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="card-cover-wrap" :class="{ rounded }">
    <slot classes="card-cover">
      <ImageAsset :variants="variants" class="card-cover" />
    </slot>
  </div>
</template>

<script>
import ImageAsset from 'docc-render/components/ImageAsset.vue';

export default {
  name: 'CardCover',
  components: { ImageAsset },
  props: {
    variants: {
      type: Array,
      required: true,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.card-cover-wrap {
  &.rounded {
    border-radius: $big-border-radius;
    overflow: hidden;
  }
}

.card-cover {
  background-color: var(--color-card-background);
  display: block;
  // default height for a card, if no size is specified
  height: var(--card-cover-height, 180px);

  &.fallback, /deep/ img {
    width: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    margin: 0;
  }
  // make sure we dont override the height for the fallback
  /deep/ img {
    height: 100%;
  }
}
</style>
