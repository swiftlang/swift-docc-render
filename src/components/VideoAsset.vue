<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ConditionalWrapper
    ref="wrapper"
    :tag="DeviceFrameComponent"
    :should-wrap="!!deviceFrame"
    :device="deviceFrame"
  >
    <div>
      <video
        ref="video"
        :key="videoAttributes.url"
        :id="id"
        :controls="showsDefaultControls"
        :data-orientation="orientation"
        :autoplay="autoplays"
        :poster="normalisedPosterPath"
        :muted="muted"
        :width="optimalWidth"
        :aria-roledescription="$t('video.title')"
        :aria-label="!showsDefaultControls ? $t('video.custom-controls') : null"
        :aria-describedby="alt ? altTextId : null"
        playsinline
        @loadedmetadata="setOrientation"
        @playing="$emit('playing')"
        @pause="$emit('pause')"
        @ended="$emit('ended')"
      >
        <!--
          Many browsers do not support the `media` attribute for `<source>` tags
          within a video specifically, so this implementation for dark theme assets
          is handled with JavaScript media query listeners unlike the `<source>`
          based implementation being used for image assets.
        -->
        <source :src="normalizePath(videoAttributes.url)">
      </video>
      <span
        v-if="alt"
        :id="altTextId"
        class="visuallyhidden"
      >
        {{ $t('video.description', { alt }) }}
      </span>
    </div>
  </ConditionalWrapper>
</template>

<script>
import {
  separateVariantsByAppearance,
  normalizePath,
  getIntrinsicDimensions,
  getOrientation,
  extractDensities,
} from 'docc-render/utils/assets';
import AppStore from 'docc-render/stores/AppStore';
import ColorScheme from 'docc-render/constants/ColorScheme';
import ConditionalWrapper from 'docc-render/components/ConditionalWrapper.vue';
import DeviceFrame from 'docc-render/components/ContentNode/DeviceFrame.vue';

export default {
  name: 'VideoAsset',
  components: { ConditionalWrapper },
  props: {
    variants: {
      type: Array,
      required: true,
    },
    showsDefaultControls: {
      type: Boolean,
      default: () => false,
    },
    autoplays: {
      type: Boolean,
      default: () => false,
    },
    posterVariants: {
      type: Array,
      required: false,
      default: () => [],
    },
    muted: {
      type: Boolean,
      default: false,
    },
    deviceFrame: {
      type: String,
      required: false,
    },
    alt: {
      type: String,
      required: false,
    },
    id: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    appState: AppStore.state,
    optimalWidth: null,
    orientation: null,
  }),
  computed: {
    DeviceFrameComponent: () => DeviceFrame,
    preferredColorScheme: ({ appState }) => appState.preferredColorScheme,
    systemColorScheme: ({ appState }) => appState.systemColorScheme,
    altTextId: ({ id }) => `${id}-alt`,
    userPrefersDark: ({
      preferredColorScheme,
      systemColorScheme,
    }) => preferredColorScheme === ColorScheme.dark || (
      preferredColorScheme === ColorScheme.auto
      && systemColorScheme === ColorScheme.dark
    ),
    shouldShowDarkVariant: ({
      darkVideoVariantAttributes,
      userPrefersDark,
    }) => darkVideoVariantAttributes && userPrefersDark,
    /**
     * Returns the light video if available, fallback to dark variant
     * @returns {Object}
     */
    defaultVideoAttributes() {
      return this.videoVariantsGroupedByAppearance.light[0]
        || this.darkVideoVariantAttributes
        || {};
    },
    darkVideoVariantAttributes() {
      return this.videoVariantsGroupedByAppearance.dark[0];
    },
    /**
     * Video variants for each style
     * @returns {{ light: [], dark: [] }}
     */
    videoVariantsGroupedByAppearance() {
      return separateVariantsByAppearance(this.variants);
    },
    /**
     * Return grouped poster variants per style
     * @returns {{ light: [], dark: [] }}
     */
    posterVariantsGroupedByAppearance() {
      const { light, dark } = separateVariantsByAppearance(this.posterVariants);
      return {
        light: extractDensities(light),
        dark: extractDensities(dark),
      };
    },
    /**
     * Returns dark poster variant if available and applicable
     * Returns light variant or empty object otherwise.
     * @returns {Object}
     */
    defaultPosterAttributes: ({
      posterVariantsGroupedByAppearance: variants,
      userPrefersDark,
    }) => (userPrefersDark && variants.dark.length
      ? variants.dark[0]
      : variants.light[0] || {}
    ),
    normalisedPosterPath: ({ defaultPosterAttributes }) => (
      normalizePath(defaultPosterAttributes.src)
    ),
    videoAttributes: ({
      darkVideoVariantAttributes,
      defaultVideoAttributes,
      shouldShowDarkVariant,
    }) => (shouldShowDarkVariant
      ? darkVideoVariantAttributes
      : defaultVideoAttributes
    ),
  },
  watch: {
    normalisedPosterPath: {
      immediate: true,
      handler: 'getPosterDimensions',
    },
  },
  methods: {
    normalizePath,
    async getPosterDimensions(path) {
      if (!path) {
        this.optimalWidth = null;
        return;
      }
      const { density } = this.defaultPosterAttributes;
      const currentVariantDensity = parseInt(density.match(/\d+/)[0], 10);
      const { width } = await getIntrinsicDimensions(path);
      this.optimalWidth = width / currentVariantDensity;
    },
    setOrientation() {
      const { videoWidth: width, videoHeight: height } = this.$refs.video;
      this.orientation = getOrientation(width, height);
    },
  },
};
</script>
