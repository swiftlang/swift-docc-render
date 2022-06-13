<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div :class="['code-preview', { ide: isTargetIDE }]">
    <CodeTheme>
      <CodeListing v-if="code" v-bind="codeProps" showLineNumbers />
    </CodeTheme>
    <div
      class="runtime-preview"
      :class="runtimePreviewClasses"
      :style="previewStyles"
    >
      <div class="runtimve-preview__container">
        <button
          class="header"
          :disabled="!hasRuntimePreview"
          :title="runtimePreviewTitle"
          @click="togglePreview"
        >
        <span
          class="runtime-preview-label"
          :aria-label="textAriaLabel"
        >{{ togglePreviewText }}</span>
          <DiagonalArrowIcon
            :class="[ shouldDisplayHideLabel ? 'preview-hide': 'preview-show' ]"
            class="icon-inline preview-icon"
          />
        </button>
        <transition @leave="handleLeave">
          <div class="runtime-preview-asset" v-show="shouldDisplayHideLabel">
            <slot />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import CodeListing from 'docc-render/components/ContentNode/CodeListing.vue';
import BreakpointEmitter from 'docc-render/components/BreakpointEmitter.vue';
import DiagonalArrowIcon from 'theme/components/Icons/DiagonalArrowIcon.vue';
import CodeTheme from './CodeTheme.vue';

const { BreakpointName } = BreakpointEmitter.constants;

function scaledSize({ width, height }, scale = 1) {
  // For images with a width less than or equal to 400px (e.g., watch),
  // scale less so that the image is not too small
  const smallImageWidth = 400;
  const imageScale = width <= smallImageWidth ? 1.75 : 3;
  return ({
    width: width / (imageScale / scale),
    height: height / (imageScale / scale),
  });
}

export default {
  name: 'CodePreview',
  inject: [
    'references',
    'isTargetIDE',
    'store',
  ],
  components: {
    DiagonalArrowIcon,
    CodeListing,
    CodeTheme,
  },
  props: {
    code: {
      type: String,
      required: true,
    },
    preview: {
      type: String,
      required: false,
    },
    isRuntimePreviewVisible: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      tutorialState: this.store.state,
    };
  },
  computed: {
    currentBreakpoint() {
      return this.tutorialState.breakpoint;
    },
    hasRuntimePreview() {
      return !!this.preview;
    },
    previewAssetSize() {
      // All the variants should have the same size, so use the size of the first
      // variant. (same method in ImageAsset.vue)
      const asset = this.hasRuntimePreview ? this.references[this.preview] : {};
      const variants = (asset.variants || [{}])[0] || {};
      // In case variants don't have a size, it will fallback to a default size.
      const fallbackSize = {
        /**
         * The value of this fallback size is necessary since
         * videos are not provided with size attributes.
         * The width result ends up being 300px
         * because all sizes bigger than 400 get scaled down by 3 on the `scaledSize` function.
         */
        width: 900,
      };

      let assetSize = variants.size || {};
      if (!assetSize.width && !assetSize.height) {
        assetSize = fallbackSize;
      }

      // Scale down images by 80% for medium breakpoint
      const scale = this.currentBreakpoint === BreakpointName.medium ? 0.8 : 1;
      return scaledSize(assetSize, scale);
    },
    previewSize() {
      const collapsedPreviewSize = {
        width: 102,
      };
      return (this.shouldDisplayHideLabel && this.previewAssetSize) ? ({
        width: this.previewAssetSize.width,
      }) : (
        collapsedPreviewSize
      );
    },
    previewStyles() {
      const {
        width,
      } = this.previewSize;
      return {
        width: `${width}px`,
      };
    },
    codeProps() {
      return this.references[this.code];
    },
    runtimePreviewClasses() {
      return {
        collapsed: !this.shouldDisplayHideLabel,
        disabled: !this.hasRuntimePreview,
        'runtime-preview-ide': this.isTargetIDE,
      };
    },
    shouldDisplayHideLabel() {
      return this.hasRuntimePreview && this.isRuntimePreviewVisible;
    },
    runtimePreviewTitle() {
      return this.hasRuntimePreview ? null : 'No preview available for this step.';
    },
    togglePreviewText() {
      return this.hasRuntimePreview ? 'Preview' : 'No Preview';
    },
    textAriaLabel: ({ shouldDisplayHideLabel, togglePreviewText }) => (
      `${togglePreviewText}, ${shouldDisplayHideLabel ? 'Hide' : 'Show'}`
    ),
  },
  methods: {
    /**
     * Delay the hiding of the asset by 200ms.
     * This is in sync with the preview transition.
     * Its better to rely on the prop changing,
     * than on the browser transition event to fire.
     * Invisible elements do not fire transition events.
     * @param {HTMLElement} el
     * @param {function} done - callback to tell Vue we want to hide the component
     */
    handleLeave(el, done) {
      setTimeout(done, 200);
    },
    togglePreview() {
      if (!this.hasRuntimePreview) {
        return;
      }

      this.$emit('runtime-preview-toggle', !this.isRuntimePreviewVisible);
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$preview-margin: 1rem;

$runtime-preview-transition-curve: ease-in !default;
$duration: 0.2s;

.code-preview {
  position: sticky;
  @include overflow-y;
  background-color: var(--background, var(--color-step-background));

  $height-ide: 100vh;
  height: calc(#{$height-ide} - #{$nav-height});

  &.ide {
    height: $height-ide;
  }

  /deep/ .code-listing {
    color: var(--text, var(--color-code-plain));
  }

  /deep/ pre {
    @include font-styles(code-preview);
  }
}

.header {
  @include font-styles(caption);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: stretch;
  cursor: pointer;
  font-weight: $font-weight-semibold;
  padding: 8px 12px;
  border-radius: $border-radius $border-radius 0 0;
  z-index: 1;
  background: var(--color-runtime-preview-background);
  color: var(--colors-runtime-preview-text, var(--color-runtime-preview-text));

  &:focus {
    outline-style: none;
  }

  #app.fromkeyboard &:focus {
    @include focus-shadow-form-element;
  }
}

.runtime-preview {
  --color-runtime-preview-shadow: rgba(0, 0, 0, 0.4);
  @include prefers-dark {
    --color-runtime-preview-shadow: rgba(255, 255, 255, 0.4);
  }

  position: absolute;
  top: 0;
  right: 0;
  background: var(--color-runtime-preview-background);
  border-radius: $border-radius;
  margin: $preview-margin;
  margin-left: 0;
  // For animation
  // Width and height must have a pixel value in order to be transitioned
  transition: width $duration $runtime-preview-transition-curve;
  // fallback to correctly stretch the toggle button for older browsers
  @supports not (width: stretch) {
    display: flex;
    flex-direction: column;
  }

  .runtimve-preview__container {
    border-radius: $border-radius;
    overflow: hidden;
  }

  box-shadow: 0px 0px 3px 0px var(--color-runtime-preview-shadow);
}

.runtime-preview-ide {
  top: 0;

  .runtime-preview-asset {
    /deep/ img {
      background-color: var(--color-runtime-preview-background);
    }
  }
}

.runtime-preview.collapsed {
  box-shadow: 0px 0px 3px 0px var(--color-runtime-preview-shadow);
  // Set for a specific size of "Preview ↙".
  // If this changes in the future, these dimensions or the approach will
  // need to be rethought.
  // Potentially a JS method that can create the proper dimensions
  // based on text.
  width: 102px;

  .header {
    border-radius: $border-radius;
  }
}

.runtime-preview.disabled {
  box-shadow: 0px 0px 3px 0px transparent;

  .header {
    color: var(--color-runtime-preview-disabled-text);
    cursor: auto;
  }
}

.runtime-preview-asset {
  border-radius: 0 0 $border-radius $border-radius;

  /deep/ img {
    border-bottom-left-radius: $border-radius;
    border-bottom-right-radius: $border-radius;
  }
}

.preview-icon {
  height: 0.8em;
  width: 0.8em;
  user-select: none;
}

// mirror the arrow icon to point down
.preview-show {
  transform: scale(-1);
}
</style>
