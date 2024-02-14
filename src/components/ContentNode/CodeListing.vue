<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="code-listing"
    :data-syntax="syntaxNameNormalized"
    :class="{ 'single-line': syntaxHighlightedLines.length === 1 }"
  >
    <Filename
      v-if="fileName"
      :isActionable="isFileNameActionable"
      @click="$emit('file-name-click')"
      :fileType="fileType"
    >{{ fileName }}
    </Filename>
    <div class="container-general">
      <!-- Do not add newlines in <pre>, as they'll appear in the rendered HTML. -->
      <pre><CodeBlock><template
        v-for="(line, index) in syntaxHighlightedLines"
      ><span
        :key="index"
        :class="['code-line-container',{ highlighted: isHighlighted(index) }]"
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
import { highlightContent, registerHighlightLanguage } from 'docc-render/utils/syntax-highlight';

import CodeListingFilename from './CodeListingFilename.vue';

export default {
  name: 'CodeListing',
  components: { Filename: CodeListingFilename, CodeBlock },
  data() {
    return {
      syntaxHighlightedLines: [],
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
  // we need to establish a new stacking context to resolve a Safari bug where
  // the scrollbar is not clipped by this element depending on its border-radius
  @include new-stacking-context;

  &.single-line {
    border-radius: $large-border-radius;
  }
}

.container-general {
  overflow: auto;
}

.container-general,
pre {
  flex-grow: 1;
}

</style>
