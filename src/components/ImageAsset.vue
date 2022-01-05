<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <img v-if="fallbackImageSrcSet" class="fallback" :alt="alt" :srcset="fallbackImageSrcSet" />
  <picture v-else>
    <!--
      if "Auto" is selected, provide an alternate dark variant if available
      using the appropriate media query
    -->
    <source
      v-if="prefersAuto && darkVariantAttributes"
      media="(prefers-color-scheme: dark)"
      :srcset="darkVariantAttributes.srcSet"
    >
    <!-- if "Dark" is selected and a dark variant exists, use it directly -->
    <img
      v-if="prefersDark && darkVariantAttributes"
      v-bind="darkVariantAttributes"
      :alt="alt"
      @error="handleImageLoadError"
    >
    <!--
      otherwise use the default variant (light preferred over dark if both available)
    -->
    <img
      v-else
      v-bind="defaultAttributes"
      :alt="alt"
      @error="handleImageLoadError"
    >
  </picture>
</template>

<script>
// Creates image attributes given variants of the same image.
import imageAsset from 'docc-render/mixins/imageAsset';
import AppStore from 'docc-render/stores/AppStore';
import ColorScheme from 'docc-render/constants/ColorScheme';
import noImage from 'theme/assets/img/no-image@2x.png';
import { normalizeAssetUrl } from 'docc-render/utils/assets';

function constructAttributes(sources) {
  if (!sources.length) {
    return null;
  }
  const srcSet = sources.map(s => `${normalizeAssetUrl(s.src)} ${s.density}`).join(', ');
  const defaultSource = sources[0];

  const attrs = {
    srcSet,
    src: normalizeAssetUrl(defaultSource.src),
  };

  // All the variants should have the same size, so use the size of the first
  // variant.
  const { width } = defaultSource.size || { width: null };

  if (width) {
    attrs.width = width;
    attrs.height = 'auto';
  }

  return attrs;
}

export default {
  name: 'ImageAsset',
  mixins: [imageAsset],
  data: () => ({
    appState: AppStore.state,
    fallbackImageSrcSet: null,
  }),
  computed: {
    defaultAttributes: ({
      lightVariantAttributes,
      darkVariantAttributes,
    }) => lightVariantAttributes || darkVariantAttributes,
    darkVariantAttributes: ({ darkVariants }) => constructAttributes(darkVariants),
    lightVariantAttributes: ({ lightVariants }) => constructAttributes(lightVariants),
    preferredColorScheme: ({ appState }) => appState.preferredColorScheme,
    prefersAuto: ({ preferredColorScheme }) => preferredColorScheme === ColorScheme.auto.value,
    prefersDark: ({ preferredColorScheme }) => preferredColorScheme === ColorScheme.dark.value,
  },
  props: {
    alt: {
      type: String,
      default: '',
    },
    variants: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleImageLoadError() {
      // fall back to a default DocC-Render provided image if the specificed
      // image fails to load for any reason
      this.fallbackImageSrcSet = `${noImage} 2x`;
    },
  },
};
</script>
