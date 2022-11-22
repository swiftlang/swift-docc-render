<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <ImageAsset
    v-if="shouldUseAsset"
    v-bind="{ variants, loading: null, shouldCalculateOptimalWidth }"
  />
  <SVGIcon v-else :icon-url="iconUrl" :themeId="themeId" />
</template>
<script>
import ImageAsset from 'docc-render/components/ImageAsset.vue';
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'OverridableAsset',
  components: {
    SVGIcon,
    ImageAsset,
  },
  props: {
    imageOverride: {
      type: Object,
      default: null,
    },
    shouldCalculateOptimalWidth: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    variants: ({ imageOverride }) => (imageOverride ? imageOverride.variants : []),
    firstVariant: ({ variants }) => (variants[0]),
    iconUrl: ({ firstVariant }) => firstVariant && firstVariant.url,
    themeId: ({ firstVariant }) => firstVariant && firstVariant.svgID,
    isSameOrigin: ({ iconUrl, sameOrigin }) => sameOrigin(iconUrl),
    shouldUseAsset: ({ isSameOrigin, themeId }) => !isSameOrigin || !themeId,
  },
  methods: {
    sameOrigin(url) {
      if (!url) return false;
      const urlA = new URL(url, window.location);
      const urlB = new URL(window.location);
      return urlA.origin === urlB.origin;
    },
  },
};
</script>
