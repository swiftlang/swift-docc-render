<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="collapsible-code-listing"
    :class="{ 'single-line': content[0].code.length === 1 }"
  >
    <!-- Do not add newlines in <pre>, as they'll appear in the rendered HTML. -->
    <pre><div><div
      v-for="(content, index) in this.content"
      :class="['container-general',{ collapsible: content.collapsible === true },
    { collapsed: content.collapsible === true && collapsed }]"
      :key="index"
    ><code
      v-for="(line, index) in content.code"
      class="code-line-container"
      :key="index"
    >
      <div v-show="showLineNumbers" class="code-number" />
      <div class="code-line">{{ line }}</div>
    </code></div></div></pre>
  </div>
</template>

<script>
export default {
  name: 'CollapsibleCodeListing',
  props: {
    collapsed: {
      type: Boolean,
      required: false,
    },
    content: {
      type: Array,
      required: true,
    },
    showLineNumbers: {
      type: Boolean,
      default: () => true,
    },
  },
};
</script>

<style scoped lang="scss">
@import "docc-render/styles/_core.scss";

code {
  // ensure the code is at least as wide as the parent
  width: 100%;
}

.container-general {
  display: flex;
  flex-flow: row wrap;
  .code-line {
    flex: 1 0 auto;
  }
}

.code-line-container {
  align-items: center;
  display: flex;
  border-left: 4px solid transparent;
  counter-increment: linenumbers;
  padding-right: 14px;
}

.code-number {
  @include font-styles(documentation-code-listing-number);
  padding: $code-number-padding;
  text-align: right;
  min-width: 2.01em;
  user-select: none;

  &::before {
    content: counter(linenumbers);
  }
}

.code-line {
  display: flex;
}

pre {
  padding: $code-listing-with-numbers-padding;
  display: flex;
  // allow items to wrap, because they fill 100% width
  flex-flow: row wrap;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  white-space: pre;
  word-wrap: normal;
  @include breakpoint(small) {
    padding-top: rem(14px);
  }
}

.collapsible-code-listing {
  background: var(--background, var(--color-code-background));
  border-color: var(--colors-grid, var(--color-grid));
  color: var(--text, var(--color-code-plain));
  border-radius: $border-radius;
  border-style: solid;
  border-width: 1px;
  counter-reset: linenumbers;
  font-size: 15px;

  &.single-line {
    border-radius: $large-border-radius;
  }
}

.collapsible {
  background: var(--color-code-collapsible-background);
  color: var(--color-code-collapsible-text);
}

.collapsed {
  &::before {
    content: "⋯";
    display: inline-block;
    font-family: monospace;
    font-weight: $font-weight-bold;
    height: 100%;
    line-height: 1;
    text-align: right;
    width: 2.3rem;
  }

  .code-line-container {
    height: 0;
    visibility: hidden;
  }
}
</style>
