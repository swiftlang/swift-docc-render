<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <pre
    ref="declarationGroup"
    class="source"
    :class="{ [multipleLinesClass]: hasMultipleLines }"
  ><code ref="code"><Token
    v-for="(token, i) in tokens"
    :key="i"
    v-bind="propsFor(token)" /></code></pre>
</template>

<script>
import { indentDeclaration } from 'docc-render/utils/indentation';
import { hasMultipleLines } from 'docc-render/utils/multipleLines';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';
import DeclarationToken from './DeclarationToken.vue';

export default {
  name: 'DeclarationSource',
  data() {
    return {
      hasMultipleLines: false,
      multipleLinesClass,
    };
  },
  components: { Token: DeclarationToken },
  props: {
    tokens: {
      type: Array,
      required: true,
    },
    simpleIndent: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      required: false,
    },
  },
  methods: {
    propsFor(token) {
      return {
        kind: token.kind,
        identifier: token.identifier,
        text: token.text,
        tokens: token.tokens,
      };
    },
  },
  async mounted() {
    if (hasMultipleLines(this.$refs.declarationGroup)) this.hasMultipleLines = true;

    if (!this.language) return;
    await this.$nextTick();
    indentDeclaration(this.$refs.code, this.language);
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$indent-spacing: em(32px);
$horizontal-padding: em($code-source-spacing + rem(5px));

$docs-declaration-source-border-width: 1px !default;

.source {
  background: var(--background, var(--color-code-background));
  border-color: var(--color-grid);
  color: var(--text, var(--color-code-plain));
  border-radius: $big-border-radius;
  border-style: solid;
  border-width: $docs-declaration-source-border-width;
  padding: $code-block-style-elements-padding;
  speak: literal-punctuation;
  line-height: 25px;

  &.has-multiple-lines {
    border-radius: $border-radius;
  }

  // simple indent
  &.indented {
    padding-left: $indent-spacing + $horizontal-padding;
    text-indent: -$indent-spacing;
    white-space: normal;
  }

  > code {
    @include font-styles(documentation-code-listing);
    display: block;
  }
}
</style>
