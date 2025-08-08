<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2025 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="code-listing"
    :data-syntax="syntaxNameNormalized"
    :class="{ 'single-line': syntaxHighlightedLines.length === 1, 'is-wrapped': wrap > 0 }"
    :style="wrap > 0 ? { '--wrap-ch': wrap } : null"
  >
    <Filename
      v-if="fileName"
      :isActionable="isFileNameActionable"
      @click="$emit('file-name-click')"
      :fileType="fileType"
    >{{ fileName }}
    </Filename>
    <div class="container-general">
      <button
        v-if="copyToClipboard"
        class="copy-button"
        :class="copyState"
        @click="copyCodeToClipboard"
        :aria-label="$t('icons.copy')"
        :title="$t('icons.copy')"
      >
        <CopyIcon v-if="copyState === CopyState.idle" class="copy-icon"/>
        <CheckmarkIcon v-else-if="copyState === CopyState.success" class="checkmark-icon"/>
        <CrossIcon v-else-if="copyState === CopyState.failure" class="cross-icon"/>

      </button>
      <!-- Do not add newlines in <pre>, as they'll appear in the rendered HTML. -->
      <pre><CodeBlock><template
        v-for="(line, index) in syntaxHighlightedLines"
      ><span
        :key="index"
        :class="[
          'code-line-container',
          {
            highlighted: isHighlighted(index) || isUserHighlighted(index),
            strikethrough: isUserStrikethrough(index),
          }
        ]"
      ><span
        v-if="showLineNumbers"
        class="code-number"
        :data-line-number="lineNumberFor(index)"
      /><span
        class="code-line"
        v-html="line"
      /></span><!-- This new line must stay -->
</template></CodeBlock></pre>
    </div>
  </div>
</template>

<script>
import { escapeHtml } from 'docc-render/utils/strings';
import Language from 'docc-render/constants/Language';
import CodeBlock from 'docc-render/components/CodeBlock.vue';
import CopyIcon from 'theme/components/Icons/CopyIcon.vue';
import CheckmarkIcon from 'theme/components/Icons/CheckmarkIcon.vue';
import CrossIcon from 'theme/components/Icons/CrossIcon.vue';
import { highlightContent, registerHighlightLanguage } from 'docc-render/utils/syntax-highlight';

import CodeListingFilename from './CodeListingFilename.vue';

const CopyState = {
  idle: 'idle',
  success: 'success',
  failure: 'failure',
};

export default {
  name: 'CodeListing',
  components: {
    Filename: CodeListingFilename,
    CodeBlock,
    CopyIcon,
    CheckmarkIcon,
    CrossIcon,
  },
  data() {
    return {
      syntaxHighlightedLines: [],
      copyState: CopyState.idle,
      CopyState,
    };
  },
  props: {
    fileName: String,
    isFileNameActionable: {
      type: Boolean,
      default: () => false,
    },
    syntax: String,
    fileType: String,
    content: {
      type: Array,
      required: true,
    },
    copyToClipboard: {
      type: Boolean,
      default: () => false,
    },
    wrap: {
      type: Number,
      default: () => 0,
    },
    lineAnnotations: {
      type: Array,
      default: () => [],
    },
    startLineNumber: {
      type: Number,
      default: () => 1,
    },
    highlights: {
      type: Array,
      default: () => [],
    },
    showLineNumbers: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    escapedContent: ({ content }) => content.map(escapeHtml),
    highlightedLineNumbers() {
      return new Set(this.highlights.map(({ line }) => line));
    },
    syntaxNameNormalized() {
      // `occ` is a legacy naming convention
      const fallbackMap = { occ: Language.objectiveC.key.url };
      return fallbackMap[this.syntax] || this.syntax;
    },
    copyableText() {
      return this.content.join('\n');
    },
  },
  watch: {
    content: {
      handler: 'syntaxHighlightLines',
      immediate: true,
    },
  },
  methods: {
    isHighlighted(index) {
      return this.highlightedLineNumbers.has(this.lineNumberFor(index));
    },
    isLineInStyle(index, style) {
      const lineNumber = this.lineNumberFor(index);

      return this.lineAnnotations
        .filter(a => a.style === style)
        .some((a) => {
          if (!a.range || !a.range[0] || !a.range[1]) return false;
          const startLine = a.range[0].line;
          const endLine = a.range[1].line;
          return lineNumber >= startLine && lineNumber <= endLine;
        });
    },
    isUserHighlighted(index) {
      return this.isLineInStyle(index, 'highlight');
    },
    isUserStrikethrough(index) {
      return this.isLineInStyle(index, 'strikeout');
    },
    // Returns the line number for the line at the given index in `content`.
    lineNumberFor(index) {
      return this.startLineNumber + index;
    },
    async syntaxHighlightLines() {
      let lines;
      try {
        // register the language
        await registerHighlightLanguage(this.syntaxNameNormalized);
        lines = highlightContent(this.content, this.syntaxNameNormalized);
      } catch (error) {
        // just use the original content without syntax highlighting if there
        // was any problem (if the syntax lang is not supported for example)
        lines = this.escapedContent;
      }
      this.syntaxHighlightedLines = lines.map(line => (
        line === '' ? '\n' : line
      ));
    },
    copyCodeToClipboard() {
      navigator.clipboard.writeText(this.copyableText)
        .then(() => {
          this.copyState = CopyState.success;
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          this.copyState = CopyState.failure;
        })
        .finally(() => {
          setTimeout(() => {
            this.copyState = CopyState.idle;
          }, 1000);
        });
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.code-line-container {
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
}

.code-number {
  display: inline-block;
  padding: $code-number-padding;
  text-align: right;
  min-width: 2em;
  color: light-color(figure-gray-secondary);
  user-select: none;

  &::before {
    content: attr(data-line-number);
  }
}

.highlighted {
  background: var(--line-highlight, var(--color-code-line-highlight));
  border-left: $highlighted-border-width solid var(--color-code-line-highlight-border);

  .code-number {
    padding-left: $code-number-padding-left - $highlighted-border-width;
  }
}

.strikethrough {
  text-decoration-line: line-through;
  text-decoration-color: var(--color-figure-gray);
  opacity: 0.85;
}

pre {
  padding: $code-listing-with-numbers-padding;
  display: flex;
  // set as `unset` to fix a Safari issue, where the scrollbar is hidden until you resize window
  overflow: unset;
  -webkit-overflow-scrolling: touch;
  white-space: pre;
  word-wrap: normal;
  height: 100%;
  tab-size: var(--code-indentationWidth, 4);
  @include breakpoint(small) {
    padding-top: rem(14px);
  }
}

code {
  white-space: pre;
  word-wrap: normal;
  flex-grow: 9999;
}

.code-listing,
.container-general {
  display: flex;
}

.code-listing {
  flex-direction: column;
  border-radius: var(--code-border-radius, $border-radius);
  overflow: hidden;
  position: relative;
  // we need to establish a new stacking context to resolve a Safari bug where
  // the scrollbar is not clipped by this element depending on its border-radius
  @include new-stacking-context;

  &.single-line {
    border-radius: $large-border-radius;
  }
}

.is-wrapped pre,
.is-wrapped code {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: normal;
}

.is-wrapped pre {
  max-width: calc(var(--wrap-ch) * 1ch);
}

.container-general {
  overflow: auto;
}

.container-general,
pre {
  flex-grow: 1;
}

.copy-button {
  position: absolute;
  top: 0.2em;
  right: 0.2em;
  width: 1.5em;
  height: 1.5em;
  background: var(--color-fill-gray-tertiary);
  border: none;
  border-radius: var(--button-border-radius, $button-radius);
  padding: 4px;
}

@media (hover: hover) {
  .copy-button {
    opacity: 0;
    transition: all 0.2s ease-in-out;
  }

  .copy-button:hover {
    background-color: var(--color-fill-gray);
  }

  .copy-button .copy-icon {
    opacity: 0.8;
  }

  .copy-button:hover .copy-icon {
    opacity: 1;
  }

  .container-general:hover .copy-button {
    opacity: 1;
  }
}

@media (hover: none) {
  .copy-button {
    opacity: 1;
  }
}

.copy-button .copy-icon {
  fill: var(--color-figure-gray);
}

.copy-button.success .checkmark-icon {
  color: var(--color-figure-blue);
  fill: currentColor;
}

.copy-button.failure .cross-icon {
  color: var(--color-figure-red);
  fill: currentColor;
}

</style>
