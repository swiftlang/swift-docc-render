<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <BackgroundTheme class="mobile-code-preview">
    <GenericModal
      v-if="code"
      class="full-code-listing-modal"
      :theme="isTargetIDE ? 'code' : 'light'"
      :codeBackgroundColorOverride="modalBackgroundColor"
      isFullscreen
      :visible.sync="fullCodeIsVisible"
    >
      <div class="full-code-listing-modal-content">
        <CodeTheme>
          <CodeListing class="full-code-listing" v-bind="codeProps" showLineNumbers />
        </CodeTheme>
      </div>
    </GenericModal>
    <CodeTheme>
      <MobileCodeListing
        v-if="code"
        v-bind="codeProps"
        showLineNumbers
        @file-name-click="toggleFullCode"
      />
    </CodeTheme>
    <CodeTheme class="preview-toggle-container">
      <PreviewToggle :isActionable="!!$slots.default" @click="togglePreview" />
    </CodeTheme>
    <GenericModal
      v-if="$slots.default"
      :theme="isTargetIDE ? 'dynamic' : 'light'"
      class="runtime-preview-modal"
      isFullscreen
      :visible.sync="previewIsVisible"
    >
      <div class="runtime-preview-modal-content">
        <span class="runtime-preview-label">Preview</span>
        <slot />
      </div>
    </GenericModal>
  </BackgroundTheme>
</template>

<script>
import CodeListing from 'docc-render/components/ContentNode/CodeListing.vue';
import MobileCodeListing from 'docc-render/components/ContentNode/MobileCodeListing.vue';
import GenericModal from 'docc-render/components/GenericModal.vue';
import MobileCodePreviewToggle from './MobileCodePreviewToggle.vue';
import BackgroundTheme from './BackgroundTheme.vue';
import CodeTheme from './CodeTheme.vue';

export default {
  name: 'MobileCodePreview',
  inject: [
    'references',
    'isTargetIDE',
    'store',
  ],
  components: {
    GenericModal,
    CodeListing,
    MobileCodeListing,
    PreviewToggle: MobileCodePreviewToggle,
    CodeTheme,
    BackgroundTheme,
  },
  props: {
    code: {
      type: String,
      required: true,
    },
  },
  computed: {
    codeProps() {
      return this.references[this.code];
    },
    modalBackgroundColor() {
      const { codeColors } = this.store.state;

      if (!codeColors) {
        return null;
      }

      return codeColors.background;
    },
  },
  data() {
    return {
      previewIsVisible: false,
      fullCodeIsVisible: false,
    };
  },
  methods: {
    togglePreview() {
      this.previewIsVisible = !this.previewIsVisible;
    },
    toggleFullCode() {
      this.fullCodeIsVisible = !this.fullCodeIsVisible;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.mobile-code-preview {
  background-color: var(--background, var(--color-step-background));
  padding: $code-listing-with-numbers-padding;

  @include breakpoint(small) {
    display: flex;
    flex-direction: column;
  }
}

$-preview-padding: 60px;

.runtime-preview-modal-content {
  padding: 45px $-preview-padding 0 $-preview-padding;
  min-width: calc(320px - 2 * #{$-preview-padding});

  /deep/ img:not(.file-icon) {
    border-radius: $border-radius;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
    max-height: 80vh;
    width: auto;
    display: block;
    margin-bottom: 1rem;
  }

  .runtime-preview-label {
    @include font-styles(caption);
    color: var(--color-runtime-preview-text);
    display: block;
    text-align: center;
    padding: 0.5em;
  }
}

/deep/ .code-listing {
  color: var(--text, var(--color-code-plain));
}

/deep/ .full-code-listing {
  padding-top: $-preview-padding;
  min-height: calc(100vh - #{$-preview-padding});
}

/deep/ pre {
  @include font-styles(code-preview);
}

.preview-toggle-container {
  align-self: flex-end;
  margin-right: 20px;
}

</style>
