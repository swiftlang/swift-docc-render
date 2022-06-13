<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="video-replay-container">
    <VideoAsset
      ref="asset"
      :variants="variants"
      @ended="onVideoEnd"
      :showsControls="showsControls"
      :autoplays="autoplays"
    />
    <a
      class="replay-button"
      href="#"
      :class="{ visible: this.showsReplayButton }"
      @click.prevent="replay"
    >
      Replay
      <InlineReplayIcon class="replay-icon icon-inline" />
    </a>
  </div>
</template>

<script>
import VideoAsset from 'docc-render/components/VideoAsset.vue';
import InlineReplayIcon from 'theme/components/Icons/InlineReplayIcon.vue';

export default {
  name: 'ReplayableVideoAsset',
  components: {
    InlineReplayIcon,
    VideoAsset,
  },
  props: {
    variants: {
      type: Array,
      required: true,
    },
    showsControls: {
      type: Boolean,
      default: () => true,
    },
    autoplays: {
      type: Boolean,
      default: () => true,
    },
  },
  data() {
    return {
      showsReplayButton: false,
    };
  },
  methods: {
    async replay() {
      const videoPlayer = this.$refs.asset.$el;
      if (videoPlayer) {
        await videoPlayer.play();
        this.showsReplayButton = false;
      }
    },
    onVideoEnd() {
      this.showsReplayButton = true;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.replay-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  visibility: hidden;
  margin-top: .5rem;
  -webkit-tap-highlight-color: transparent;

  &.visible {
    visibility: visible;
  }

  svg.replay-icon {
    height: 12px;
    width: 12px;
    margin-left: .3em;
  }
}
</style>
