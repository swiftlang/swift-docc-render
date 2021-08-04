<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="steps">
    <div class="content-container">
      <component
        v-for="(node, index) in contentNodes"
        :class="contentClass(index)"
        v-bind="node.props"
        :is="node.component"
        :key="index"
        :currentIndex="activeStep"
        ref="contentNodes"
      />
    </div>
    <!-- the asset-container is only for medium and large breakpoints -->
    <BackgroundTheme
      class="asset-container"
      :class="assetContainerClasses"
      v-if="!isBreakpointSmall"
    >
      <transition name="fade">
        <div
          :class="['asset-wrapper', { ide: isTargetIDE }]"
          :key="visibleAsset.media"
          v-if="visibleAsset.media"
        >
          <Asset
            class="step-asset"
            :identifier="visibleAsset.media"
            showsReplayButton
            :showsVideoControls="false"
            ref="asset"
          />
        </div>
        <CodePreview
          v-if="visibleAsset.code"
          :code="visibleAsset.code"
          :preview="visibleAsset.runtimePreview"
          :isRuntimePreviewVisible="isRuntimePreviewVisible"
          @runtime-preview-toggle="onRuntimePreviewToggle"
        >
          <transition name="fade" v-if="visibleAsset.runtimePreview">
            <Asset
              :identifier="visibleAsset.runtimePreview"
              :key="visibleAsset.runtimePreview"
            />
          </transition>
        </CodePreview>
      </transition>
    </BackgroundTheme>
  </div>
</template>

<script>
import ContentNode from 'docc-render/components/ContentNode.vue';
import Asset from 'docc-render/components/Asset.vue';
import CodePreview from 'docc-render/components/Tutorial/CodePreview.vue';
import { waitFrames } from 'docc-render/utils/loading';
import onIntersect from 'docc-render/mixins/onIntersect';
import BreakpointEmitter from 'docc-render/components/BreakpointEmitter.vue';
import BackgroundTheme from './BackgroundTheme.vue';
import Step from './Step.vue';

const { BreakpointName } = BreakpointEmitter.constants;
const { IntersectionDirections } = onIntersect.constants;

const IntersectionMargins = '-35% 0% -65% 0%';

export default {
  name: 'SectionSteps',
  components: {
    ContentNode,
    Step,
    Asset,
    CodePreview,
    BackgroundTheme,
  },
  mixins: [onIntersect],
  constants: { IntersectionMargins },
  inject: [
    'isTargetIDE',
    'store',
  ],
  data() {
    const firstStepIndex = this.content.findIndex(this.isStepNode);

    const {
      code,
      media,
      runtimePreview,
    } = this.content[firstStepIndex] || {};

    return {
      tutorialState: this.store.state,
      visibleAsset: {
        media,
        code,
        runtimePreview,
      },
      activeStep: firstStepIndex,
    };
  },
  computed: {
    assetContainerClasses() {
      return {
        'for-step-code': !!this.visibleAsset.code,
        ide: this.isTargetIDE,
      };
    },
    numberOfSteps() {
      return this.content.filter(this.isStepNode).length;
    },
    contentNodes() {
      return this.content.reduce(({ stepCounter, nodes }, node, index) => {
        const { type, ...props } = node;
        const isStep = this.isStepNode(node);
        const stepNumber = isStep ? stepCounter + 1 : stepCounter;
        return isStep ? ({
          stepCounter: stepCounter + 1,
          nodes: nodes.concat({
            component: Step,
            type,
            props: {
              ...props,
              stepNumber,
              index,
              numberOfSteps: this.numberOfSteps,
              sectionNumber: this.sectionNumber,
            },
          }),
        }) : ({
          stepCounter,
          nodes: nodes.concat({
            component: ContentNode,
            type,
            props: { content: [node] },
          }),
        });
      }, { stepCounter: 0, nodes: [] }).nodes;
    },
    isBreakpointSmall() {
      return this.tutorialState.breakpoint === BreakpointName.small;
    },
    stepNodes: ({ contentNodes, isStepNode }) => contentNodes.filter(isStepNode),
    intersectionRootMargin: () => IntersectionMargins,
  },
  async mounted() {
    // Wait for the page to fully load and scroll down, if you navigated back
    // or hit refresh mid page.
    await waitFrames(8);
    // set the nearest step node as active
    this.findClosestStepNode();
  },
  methods: {
    isStepNode({ type }) {
      return type === 'step';
    },
    contentClass(index) {
      return {
        [`interstitial interstitial-${index + 1}`]: !this.isStepNode(this.content[index]),
      };
    },
    onReverseIntoLastStep() {
      const { asset } = this.$refs;
      if (asset) {
        // Restart step videos when scrolling back up to them after leaving a section.
        const video = asset.$el.querySelector('video');
        if (video) {
          video.currentTime = 0;
          video.play()
            .catch(() => {
              // If the video cannot be played, fail silently.
            });
        }
      }
    },
    onFocus(key) {
      const {
        code,
        media,
        runtimePreview,
      } = this.content[key];

      this.activeStep = key;
      this.visibleAsset = {
        code,
        media,
        runtimePreview,
      };
    },
    onRuntimePreviewToggle(value) {
      this.$emit('runtime-preview-toggle', value);
    },
    findClosestStepNode() {
      // get all steps
      // get the point at which we intercept, 1/3 of screen
      const intersectionPoint = window.innerHeight * 0.333;
      // init loop vars
      let nearestIndex = null;
      let nearestElIntersection = 0;
      this.stepNodes.forEach((step) => {
        // get the step index
        const { index } = step.props;
        // get the step element
        const element = this.$refs.contentNodes[index].$refs.step;
        if (!element) return;
        // get the element's position, relative to the breakpoint
        const { top, bottom } = element.getBoundingClientRect();
        // calculate the relative position to the intersection point
        const start = top - intersectionPoint;
        const end = bottom - intersectionPoint;
        const intersectionRatio = Math.abs(start + end);
        // if the element is nearer than the previous one, set it as nearest
        if (nearestElIntersection === 0 || intersectionRatio <= nearestElIntersection) {
          nearestElIntersection = intersectionRatio;
          nearestIndex = index;
        }
      });
      // set the nearest index as active
      if (nearestIndex !== null) {
        this.onFocus(nearestIndex);
      }
    },
    getIntersectionTargets() {
      const { stepNodes, $refs } = this;
      return stepNodes.map(({ props: { index } }) => $refs.contentNodes[index].$refs.step);
    },
    /**
     * Callback for intersection Observer
     * @param {IntersectionObserverEntry} entry
     */
    onIntersect(entry) {
      const {
        target, isIntersecting,
      } = entry;
      if (!isIntersecting) return;
      // get the index for the node
      const index = parseFloat(target.getAttribute('data-index'));
      // if it's intersecting, save the ratio, else nothing.
      // replace the entire object, so vue can track it properly
      if (this.intersectionScrollDirection === IntersectionDirections.down
        && index === this.stepNodes[this.stepNodes.length - 1].props.index) {
        this.onReverseIntoLastStep();
      }
      this.onFocus(index);
    },
  },
  props: {
    content: {
      type: Array,
      required: true,
    },
    isRuntimePreviewVisible: {
      type: Boolean,
      require: true,
    },
    sectionNumber: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$margin-transision-duration: 0.3s;

.steps {
  position: relative;
  @include font-styles(body-reduced);
  display: flex;

  @include breakpoint(small) {
    padding-top: $tutorial-section-spacing-single-side;

    &::before {
      $margin-vertical: rem(40px);
      $margin-horizontal: rem(20px);
      position: absolute;
      top: 0;
      border-top: 1px solid var(--color-fill-gray-tertiary);
      content: "";
      width: calc(100% - (#{$margin-horizontal} * 2));
      margin: 0 $margin-horizontal;
    }
  }

  color: var(--colors-text, var(--color-text));
}

$lhs-col-width: calculate-column-width(4.5);
$lhs-col-margin: calculate-column-width(0.5);

$rhs-center-overlap: calculate-column-width(6) - ($lhs-col-width + $lhs-col-margin);
$rhs-col-width: calc(50vw + #{$rhs-center-overlap});
$rhs-col-width-max: 921px;

.content-container {
  flex: none;
  margin-right: $lhs-col-margin;
  width: $lhs-col-width;
  // 140px is the animTiming in Step.vue
  margin-top: 140px;
  margin-bottom: 94vh;

  @include breakpoint(small) {
    margin-top: 0;
    margin-bottom: 0;
    height: 100%;
    margin-left: 0;
    margin-right: 0;
    position: relative;
    width: 100%;
  }
}

.asset-container {
  $height-ide: 100vh;
  $media-spacing: 40px;

  flex: none;
  height: calc(#{$height-ide} - #{$nav-height});
  background-color: var(--background, var(--color-step-background));
  max-width: $rhs-col-width-max;
  width: $rhs-col-width;
  position: sticky;
  top: $nav-height;
  // use specific top value and height for the switch
  // between medium to small breakpoint
  @include breakpoint(small, $scope: nav) {
    top: $nav-height-small;
    height: calc(#{$height-ide} - #{$nav-height-small});
  }
  transition: margin ($margin-transision-duration / 3) ease-in-out;

  // Let the code preview overflow, and avoid allowing overflow in both 'asset-container' and
  // 'code-preview'. Otherwise, two scroll bars appear.
  &:not(.for-step-code) {
    @include overflow-y;
  }

  &.ide {
    height: $height-ide;
    top: 0;
  }

  @include breakpoints-from(medium) {
    display: grid;

    & > * {
      grid-row: 1;
      grid-column: 1;

      // Explicitly set the height of all children so that they don't shift when
      // the next step has a small height than the previous. Otherwise, the next
      // step's asset will be centered in the previous step's scroll box, which
      // is too large.
      height: calc(#{$height-ide} - #{$nav-height});
    }

    &.ide > * {
      height: $height-ide;
    }
  }

  .step-asset {
    box-sizing: border-box;
    padding: 0;
    padding-left: $media-spacing;

    $asset-min-height: 320px;

    min-height: $asset-min-height;
    height: 100%;

    &, /deep/ picture {
      height: 100%;
      display: flex;
      align-items: center;
    }

    /deep/ .video-replay-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /deep/ img, /deep/ video {
      $asset-width: (100% - $lhs-col-width - $lhs-col-margin) / 100%;
      $content-width-large: map-deep-get($breakpoint-attributes, (default, large, content-width));
      $content-width-medium: map-deep-get($breakpoint-attributes, (default, medium, content-width));

      width: auto;
      max-height: calc(100vh - #{$nav-height} - 2 * #{$media-spacing});
      max-width: calc(#{$content-width-large} * #{$asset-width} - #{$media-spacing});

      @include breakpoint(medium) {
        max-width: calc(#{$content-width-medium} * #{$asset-width} - #{$media-spacing});
      }

      margin: 0;
    }

    /deep/ img {
      min-height: $asset-min-height;
    }

    /deep/ .video-replay-container {
      min-height: $asset-min-height;

      // For videos with replay buttons, decrease the video min-height
      // by 40px to leave space for the replay button.
      video {
        min-height: $asset-min-height - 40px;
      }
    }
  }

  @include breakpoint(small) {
    display: none;
  }
}

.asset-wrapper {
  width: 63.2%;
  align-self: center;
  transition: transform 0.25s ease-out;
  will-change: transform;

  &.ide {
    .step-asset {
      /deep/ img {
        background-color: var(--background, var(--color-step-background));
      }
    }
  }
}

/deep/ .runtime-preview-asset {
  display: grid;

  & > * {
    grid-row: 1;
    grid-column: 1;
  }
}

.interstitial {
  padding: 0 $step-padding-horizontal;

  &:not(:first-child) {
    margin-top: rem(100px);
  }

  &:not(:last-child) {
    margin-bottom: 30px;
  }

  @include breakpoint(small) {
    @include breakpoint-content;
    padding: 0;

    &:not(:first-child) {
      margin-top: 0;
    }
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s ease-in-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
