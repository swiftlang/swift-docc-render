<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="video-replay-container"
    role="group"
    :aria-roledescription="$t('video.title')"
    :aria-labelledby="!showsDefaultControls ? ariaLabelledByContainer : null"
  >
    <span
      id="custom-controls"
      hidden
    >
      {{ $t('video.custom-controls') }}
    </span>
    <VideoAsset
      ref="asset"
      :variants="variants"
      :autoplays="autoplays"
      :showsDefaultControls="showsDefaultControls"
      :muted="muted"
      :posterVariants="posterVariants"
      :deviceFrame="deviceFrame"
      :alt="alt"
      :id="id"
      @pause="onPause"
      @playing="onVideoPlaying"
      @ended="onVideoEnd"
    />
    <a
      v-if="!showsDefaultControls"
      class="control-button"
      href="#"
      :aria-controls="id"
      @click.prevent="togglePlayStatus"
    >
      {{ text }}
      <InlineReplayIcon v-if="videoEnded" class="control-icon icon-inline" />
      <PauseIcon v-else-if="isPlaying" class="control-icon icon-inline"></PauseIcon>
      <PlayIcon v-else class="control-icon icon-inline" />
    </a>
  </div>
</template>

<script>
import VideoAsset from 'docc-render/components/VideoAsset.vue';
import InlineReplayIcon from 'theme/components/Icons/InlineReplayIcon.vue';
import PlayIcon from 'theme/components/Icons/PlayIcon.vue';
import PauseIcon from 'theme/components/Icons/PauseIcon.vue';

export default {
  name: 'ReplayableVideoAsset',
  components: {
    PauseIcon,
    PlayIcon,
    InlineReplayIcon,
    VideoAsset,
  },
  props: {
    variants: {
      type: Array,
      required: true,
    },
    alt: {
      type: String,
      required: false,
    },
    id: {
      type: String,
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
    muted: {
      type: Boolean,
      default: false,
    },
    posterVariants: {
      type: Array,
      default: () => [],
    },
    deviceFrame: {
      type: String,
      required: false,
    },
  },
  computed: {
    text() {
      if (this.videoEnded) return this.$t('video.replay');
      return this.isPlaying ? this.$t('video.pause') : this.$t('video.play');
    },
    ariaLabelledByContainer: ({ id }) => `custom-controls ${id}-alt`,
  },
  data() {
    return {
      isPlaying: false,
      videoEnded: false,
    };
  },
  methods: {
    async togglePlayStatus() {
      const videoPlayer = this.$refs.asset.$refs.video;
      if (!videoPlayer) return;
      if (this.isPlaying && !this.videoEnded) {
        await videoPlayer.pause();
      } else {
        await videoPlayer.play();
      }
    },
    onVideoEnd() {
      this.isPlaying = false;
      this.videoEnded = true;
    },
    onVideoPlaying() {
      const { video } = this.$refs.asset.$refs;
      this.isPlaying = !video.paused;
      this.videoEnded = video.ended;
    },
    onPause() {
      const { video } = this.$refs.asset.$refs;
      // if the video pauses, and we are hiding the controls, show the replay button
      if (!this.showsDefaultControls && this.isPlaying) {
        this.isPlaying = false;
      }
      this.videoEnded = video.ended;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.video-replay-container .control-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: .5rem;
  -webkit-tap-highlight-color: transparent;

  svg.control-icon {
    height: 12px;
    width: 12px;
    margin-left: .3em;
  }
}
</style>
