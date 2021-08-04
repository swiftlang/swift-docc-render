<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="code-listing-preview" :data-syntax="syntax">
    <CodeListing
      :fileName="fileName"
      :syntax="syntax"
      :fileType="fileType"
      :content="previewedLines"
      :startLineNumber="displayedRange.start"
      :highlights="highlights"
      showLineNumbers
      isFileNameActionable
      @file-name-click="$emit('file-name-click')"
    />
  </div>
</template>

<script>
import CodeListing from 'docc-render/components/ContentNode/CodeListing.vue';

export default {
  name: 'MobileCodeListing',
  components: { CodeListing },
  props: {
    fileName: String,
    syntax: String,
    fileType: String,
    content: {
      type: Array,
      required: true,
    },
    highlights: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    highlightedLineNumbers() {
      return new Set(this.highlights.map(({ line }) => line));
    },
    firstHighlightRange() {
      if (this.highlightedLineNumbers.size === 0) {
        return { start: 1, end: this.content.length };
      }

      const start = Math.min(...this.highlightedLineNumbers.values());

      // Compute the end of the highlighted section.
      let end = start;
      while (this.highlightedLineNumbers.has(end + 1)) {
        end += 1;
      }

      return { start, end };
    },
    displayedRange() {
      const range = this.firstHighlightRange;

      // Set bounds to two lines before and after the highlighted section.
      const start = range.start - 2 < 1 ? 1 : range.start - 2;
      const end = range.end + 3 >= this.content.length + 1
        ? this.content.length + 1 : range.end + 3;

      return { start, end };
    },
    previewedLines() {
      return this.content.slice(this.displayedRange.start - 1, this.displayedRange.end - 1);
    },
  },
};
</script>

<style scoped lang="scss">
/deep/ pre {
  padding: 10px 0;
}
</style>
