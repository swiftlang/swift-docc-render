<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="asset">
    <component :is="assetComponent" v-bind="assetProps" v-on="assetListeners" />
  </div>
</template>

<script>
import ImageAsset from 'docc-render/components/ImageAsset.vue';
import VideoAsset from 'docc-render/components/VideoAsset.vue';
import ReplayableVideoAsset from 'docc-render/components/ReplayableVideoAsset.vue';

const AssetTypes = {
  video: 'video',
  image: 'image',
};

export default {
  name: 'Asset',
  components: {
    ImageAsset,
    VideoAsset,
  },
  constants: {
    AssetTypes,
  },
  inject: ['references'],
  props: {
    identifier: {
      type: String,
      required: true,
    },
    showsReplayButton: {
      type: Boolean,
      default: () => false,
    },
    showsVideoControls: {
      type: Boolean,
      default: () => true,
    },
    videoAutoplays: {
      type: Boolean,
      default: () => true,
    },
    videoMuted: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    rawAsset() {
      return this.references[this.identifier] || {};
    },
    isRawAssetVideo: ({ rawAsset }) => rawAsset.type === AssetTypes.video,
    videoPoster() {
      return this.isRawAssetVideo
        && this.references[this.rawAsset.poster];
    },
    asset() {
      if (this.isRawAssetVideo && this.prefersReducedMotion) {
        return this.videoPoster || this.rawAsset;
      }
      return this.rawAsset;
    },
    assetComponent() {
      switch (this.asset.type) {
      case AssetTypes.image:
        return ImageAsset;
      case AssetTypes.video:
        return this.showsReplayButton ? ReplayableVideoAsset : VideoAsset;
      default:
        return undefined;
      }
    },
    prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion)').matches;
    },
    assetProps() {
      return {
        [AssetTypes.image]: this.imageProps,
        [AssetTypes.video]: this.videoProps,
      }[this.asset.type];
    },
    imageProps() {
      return {
        alt: this.asset.alt,
        variants: this.asset.variants,
      };
    },
    videoProps() {
      return {
        variants: this.asset.variants,
        showsControls: this.showsVideoControls,
        muted: this.videoMuted,
        autoplays: this.prefersReducedMotion ? false : this.videoAutoplays,
        posterVariants: this.videoPoster ? this.videoPoster.variants : [],
      };
    },
    assetListeners() {
      return {
        [AssetTypes.image]: null,
        [AssetTypes.video]: {
          ended: () => this.$emit('videoEnded'),
        },
      }[this.asset.type];
    },
  },
};
</script>

<style scoped lang="scss">

/deep/ img,
/deep/ video {
  display: block;
  margin-left: auto;
  margin-right: auto;
  object-fit: contain;
  max-width: 100%;
}
</style>
