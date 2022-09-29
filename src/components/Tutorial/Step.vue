<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div :class="['step-container', `step-${stepNumber}`]">
    <div
      ref="step"
      class="step"
      :class="{ focused: isActive }"
      :data-index="index"
    >
      <p class="step-label">Step {{ stepNumber }}</p>
      <ContentNode :content="content" />
      <ContentNode v-if="caption && caption.length > 0" class="caption" :content="caption" />
    </div>
    <!-- the per-step media-container is only for the small breakpoint -->
    <!-- on the web, always render the mobile layout to allow images to preload -->
    <div class="media-container" v-if="isBreakpointSmall || !isTargetIDE">
      <!-- Show video controls on mobile, so that the video can be watched fullscreen. -->

      <!-- On mobile, show video controls instead of replay button. -->
      <Asset
        v-if="media"
        :identifier="media"
        :showsReplayButton="!isClientMobile"
        :showsVideoControls="isClientMobile"
        :videoAutoplays="!isClientMobile"
      />
      <MobileCodePreview v-if="code" :code="code">
        <Asset
          v-if="runtimePreview"
          class="preview"
          :identifier="runtimePreview"
        />
      </MobileCodePreview>
    </div>
  </div>
</template>

<script>
import Asset from 'docc-render/components/Asset.vue';
import ContentNode from 'docc-render/components/ContentNode.vue';
import BreakpointEmitter from 'docc-render/components/BreakpointEmitter.vue';
import MobileCodePreview from './MobileCodePreview.vue';

const { BreakpointName } = BreakpointEmitter.constants;

export default {
  name: 'Step',
  components: {
    Asset,
    MobileCodePreview,
    ContentNode,
  },
  inject: [
    'isTargetIDE',
    'isClientMobile',
    'store',
  ],
  props: {
    code: {
      type: String,
      required: false,
    },
    content: {
      type: Array,
      required: true,
    },
    caption: {
      type: Array,
      required: false,
    },
    media: {
      type: String,
      required: false,
    },
    runtimePreview: {
      type: String,
      required: false,
    },
    sectionNumber: {
      type: Number,
      required: true,
    },
    stepNumber: {
      type: Number,
      required: true,
    },
    numberOfSteps: {
      type: Number,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    currentIndex: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      tutorialState: this.store.state,
    };
  },
  computed: {
    isBreakpointSmall() {
      return this.tutorialState.breakpoint === BreakpointName.small;
    },
    isActive: ({ index, currentIndex }) => index === currentIndex,
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.step-container {
  margin: 0;

  &:not(:last-child) {
    margin-bottom: 100px;

    @include breakpoint(small) {
      margin-bottom: 80px;
    }
  }
}

.step {
  position: relative;
  border-radius: var(--tutorial-step-border-radius, $border-radius);
  padding: 1rem $step-padding-horizontal;
  background-color: var(--color-step-background);
  overflow: hidden;
  // To hide overflow on rounded corner divs in Safari
  -webkit-mask-image: -webkit-radial-gradient(white, black);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    border: 1px solid var(--color-step-focused);
    background-color: var(--color-step-focused);
    height: calc(100% - 2px);
    width: $step-border-width;
    opacity: 0;
    transition: opacity 0.15s ease-in;
  }

  &:focus,
  &.focused {
    outline: none;

    &::before {
      opacity: 1;
    }
  }

  @include breakpoint(small) {
    padding-left: 2rem;

    &::before {
      opacity: 1;
    }
  }
}

.step-label {
  @include font-styles(step-number);
  color: var(--colors-text, var(--color-step-text));
  margin-bottom: $stacked-margin-small;
}

.caption {
  border-top: 1px solid;
  border-color: var(--color-step-caption);
  padding: 1rem 0 0 0;
  margin-top: 1rem;
}

.media-container {
  display: none;
}

@include breakpoint(small) {
  .step {
    margin: 0 rem(10px) rem(20px) rem(10px);

    &:focus,
    &.focused {
      outline: none;
    }
  }

  .media-container {
    display: block;
    position: relative;

    /deep/ img, /deep/ video {
      max-height: 80vh;
    }
  }

  /deep/ .asset {
    padding: 0 20px;
  }
}
</style>
