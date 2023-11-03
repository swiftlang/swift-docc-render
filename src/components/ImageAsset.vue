<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <img
    v-if="fallbackImageSrcSet"
    class="fallback"
    :title="$t('error.image')"
    decoding="async"
    :alt="alt"
    :srcset="fallbackImageSrcSet"
  />
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
      ref="img"
      decoding="async"
      :data-orientation="orientation"
      :loading="loading"
      :alt="alt"
      :width="darkVariantAttributes.width || optimalWidth"
      :height="(darkVariantAttributes.width || optimalWidth) ? 'auto' : null"
      @error="handleImageLoadError"
    >
    <!--
      otherwise use the default variant (light preferred over dark if both available)
    -->
    <img
      v-else
      v-bind="defaultAttributes"
      ref="img"
      decoding="async"
      :data-orientation="orientation"
      :loading="loading"
      :alt="alt"
      :width="defaultAttributes.width || optimalWidth"
      :height="(defaultAttributes.width || optimalWidth) ? 'auto' : null"
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
import {
  Orientation,
  getIntrinsicDimensions,
  normalizePath,
} from 'docc-render/utils/assets';

const RADIX_DECIMAL = 10;

function constructAttributes(sources) {
  if (!sources.length) {
    return null;
  }
  const srcSet = sources.map(s => `${normalizePath(s.src)} ${s.density}`).join(', ');
  const defaultSource = sources[0];

  const attrs = {
    srcSet,
    src: normalizePath(defaultSource.src),
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
  inject: {
    imageLoadingStrategy: {
      default: null,
    },
  },
  data: () => ({
    appState: AppStore.state,
    fallbackImageSrcSet: null,
    optimalWidth: null,
    optimalHeight: null,
  }),
  computed: {
    allVariants: ({
      lightVariants = [],
      darkVariants = [],
    }) => lightVariants.concat(darkVariants),
    defaultAttributes: ({
      lightVariantAttributes,
      darkVariantAttributes,
    }) => lightVariantAttributes || darkVariantAttributes,
    darkVariantAttributes: ({ darkVariants }) => constructAttributes(darkVariants),
    lightVariantAttributes: ({ lightVariants }) => constructAttributes(lightVariants),
    loading: ({ appState, imageLoadingStrategy }) => (
      // use an image loading strategy, injected by a parent component, or the default app one
      imageLoadingStrategy || appState.imageLoadingStrategy
    ),
    preferredColorScheme: ({ appState }) => appState.preferredColorScheme,
    prefersAuto: ({ preferredColorScheme }) => preferredColorScheme === ColorScheme.auto,
    prefersDark: ({ preferredColorScheme }) => preferredColorScheme === ColorScheme.dark,
    orientation: ({
      optimalWidth,
      optimalHeight,
    }) => {
      if (!optimalWidth || !optimalHeight) {
        return null;
      }
      if (optimalWidth > optimalHeight) {
        return Orientation.landscape;
      }
      if (optimalWidth < optimalHeight) {
        return Orientation.portrait;
      }
      return Orientation.square;
    },
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
    shouldCalculateOptimalWidth: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    handleImageLoadError() {
      // fall back to a default DocC-Render provided image if the specificed
      // image fails to load for any reason
      this.fallbackImageSrcSet = `${noImage} 2x`;
    },
    async calculateOptimalDimensions() {
      // Find the URL for the image currently being displayed, which may vary
      // depending on the color scheme and pixel density of the display device,
      // and calculate its optimal width for HTML/CSS rendering purposes.
      // The `naturalWidth` property could be used for this ideally, but there
      // is an issue with Chrome trying to optimize this value depending on
      // whether or not the filename contains "2x". Instead, the image is
      // loaded in the background to retrieve its intrinsic dimensions and the
      // intrinsic width is adjusted by its pixel density trait.
      const {
        $refs: {
          img: { currentSrc },
        },
        allVariants,
      } = this;

      // Find the intended density ratio for the image currently being
      // displayed, which might differ from the density of the actual display
      const { density } = allVariants.find(({ src }) => currentSrc.endsWith(src));
      const currentVariantDensity = parseInt(density.match(/\d+/)[0], RADIX_DECIMAL);

      // Find the intrinsic dimensions of the image currently being displayed.
      // For a 2x image, the actual image size would be twice as large as how
      // it will be displayed in CSS pixels.
      const intrinsicDimensions = await getIntrinsicDimensions(currentSrc);

      // Divide the source width of the currently displayed image by the pixel
      // density of that image to obtain the optimal width in CSS pixels for
      // display purposes so that a `width` can be assigned to the `img` tag to
      // ensure that the image looks the same size for all devices
      const optimalWidth = intrinsicDimensions.width / currentVariantDensity;
      const optimalHeight = intrinsicDimensions.height / currentVariantDensity;

      return { width: optimalWidth, height: optimalHeight };
    },
    // If the JSON data vended by the server already contains an optimal display
    // size for this image, no additional work needs to be done.
    //
    // Otherwise, since we don't know the intended display size for the image,
    // we need to calculate that once the image has first loaded.
    //
    // This is especially important if a 2x image is being used on a 1x device
    // with no 1x version of the same image so that we can size the 2x image
    // using the same dimensions for both 1x and 2x devices.
    async optimizeImageSize() {
      // Exit early if image size data already exists—nothing further needs to
      // be calculated in that scenario, or the img tag is no longer in the DOM for some reason.
      if (this.defaultAttributes.width || !this.$refs.img) {
        return;
      }

      try {
        const dimensions = await this.calculateOptimalDimensions();
        this.optimalWidth = dimensions.width;
        this.optimalHeight = dimensions.height;
      } catch {
        console.error('Unable to calculate optimal image width');
      }
    },
  },
  mounted() {
    if (!this.shouldCalculateOptimalWidth) return;
    this.$refs.img.addEventListener('load', this.optimizeImageSize);
  },
};
</script>
