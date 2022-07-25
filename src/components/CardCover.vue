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
      <div class="card-cover card-cover--light" :style="styles.light" />
      <div class="card-cover card-cover--dark" :style="styles.dark" />
    </slot>
  </div>
</template>

<script>
import imageAsset from 'docc-render/mixins/imageAsset';
import { normalizeAssetUrl } from 'docc-render/utils/assets';

const toCSSUrl = url => (url ? `url('${normalizeAssetUrl(url)}')` : undefined);

export default {
  name: 'CardCover',
  mixins: [imageAsset],
  props: {
    rounded: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    backgroundUrls: ({ darkVariants, lightVariants }) => ({
      dark: darkVariants.length ? darkVariants[0].src : null,
      light: lightVariants.length ? lightVariants[0].src : null,
    }),
    styles: ({ backgroundUrls }) => ({
      dark: { backgroundImage: toCSSUrl(backgroundUrls.dark || backgroundUrls.light) },
      light: { backgroundImage: toCSSUrl(backgroundUrls.light) },
    }),
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
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  background-color: var(--color-card-background);
  display: block;
  // default height for a card, if no size is specified
  height: var(--card-cover-height, 180px);

  &--dark {
    display: none;
  }

  @include prefers-dark {
    &--light {
      display: none
    }
    &--dark {
      display: block
    }
  }
}
</style>
