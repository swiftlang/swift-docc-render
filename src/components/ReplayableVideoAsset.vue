<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="video-replay-container" :class="{ 'integrated-button': integratedButtonStyle }">
    <VideoAsset
      ref="asset"
      :variants="variants"
      :autoplays="autoplays"
      :showsControls="showsControls"
      :muted="muted"
      :posterVariants="posterVariants"
      @pause="onPause"
      @playing="onVideoPlaying"
      @ended="onVideoEnd"
    />
    <a
      class="replay-button"
      href="#"
      :class="{ visible: this.showsReplayButton }"
      :title="text"
      @click.prevent="replay"
    >
      {{ integratedButtonStyle ? '' : text }}
      <InlineReplayIcon v-if="played" class="action-icon icon-inline" />
      <PlayIcon v-else class="action-icon icon-inline" />
    </a>
  </div>
</template>

<script>
import VideoAsset from 'docc-render/components/VideoAsset.vue';
import InlineReplayIcon from 'theme/components/Icons/InlineReplayIcon.vue';
import PlayIcon from 'theme/components/Icons/PlayIcon.vue';

export default {
  name: 'ReplayableVideoAsset',
  components: {
    PlayIcon,
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
    muted: {
      type: Boolean,
      default: true,
    },
    posterVariants: {
      type: Array,
      default: () => [],
    },
    integratedButtonStyle: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    text: ({
      played,
      integratedButtonStyle,
    }) => (played ? 'Replay' : 'Play').concat(integratedButtonStyle ? ' Video' : ''),
  },
  data() {
    return {
      showsReplayButton: !(this.autoplays && this.muted),
      played: false,
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
      this.played = true;
    },
    onVideoPlaying() {
      this.showsReplayButton = false;
    },
    onPause() {
      // if the video pauses, and we are hiding the controls, show the replay button
      if (!this.showsControls && !this.showsReplayButton) {
        this.showsReplayButton = true;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.video-replay-container {
  position: relative;
}

.replay-button {
  display: flex;
  visibility: hidden;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  margin-top: $stacked-margin-small;

  &.visible {
    visibility: visible;
  }

  .integrated-button & {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: none;
    visibility: visible;
    color: light-color(fill);
    background: change-color(dark-color(fill), $alpha: 0.2);
    transition: background linear 0.15s;
    margin: 0;

    &:hover {
      text-shadow: 0 0 2px light-color(text);
      background: change-color(dark-color(fill), $alpha: 0.32);

      .action-icon {
        transform: scale(1.05)
      }
    }

    &.visible {
      display: flex;
    }
  }

  svg.action-icon {
    --action-icon-size: 12px;
    height: var(--action-icon-size);
    width: var(--action-icon-size);
    margin-left: .3em;

    .integrated-button & {
      --action-icon-size: 118px;
      margin: 0;
      transition: transform linear 0.15s;
    }
  }
}
</style>
