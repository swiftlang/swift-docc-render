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
    v-for="(token, i) in formattedTokens"
    :key="i"
    v-bind="propsFor(token)" /></code></pre>
</template>

<script>
import { indentDeclaration } from 'docc-render/utils/indentation';
import { hasMultipleLines } from 'docc-render/utils/multipleLines';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';
import Language from 'docc-render/constants/Language';
import DeclarationToken from './DeclarationToken.vue';

const { TokenKind } = DeclarationToken.constants;

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
  computed: {
    formattedTokens: ({
      language,
      formattedSwiftTokens,
      tokens,
    }) => (language === Language.swift.api ? formattedSwiftTokens : tokens),
    formattedSwiftTokens: ({ tokens }) => {
      let indentedParams = false;
      const newTokens = [];
      let i = 0;
      let j = 1;
      let openParenTokenIndex = null;
      let openParenCharIndex = null;
      let closeParenTokenIndex = null;
      let closeParenCharIndex = null;
      let numUnclosedParens = 0;

      while (i < tokens.length) {
        const token = tokens[i];
        const nextToken = j < tokens.length ? tokens[j] : undefined;

        // eslint-disable-next-line no-plusplus
        for (let k = 0; k < token.text.length; k++) {
          if (token.text.charAt(k) === '(') {
            numUnclosedParens += 1;
            if (openParenCharIndex == null) {
              openParenCharIndex = k;
              openParenTokenIndex = i;
            }
          }

          if (token.text.charAt(k) === ')') {
            numUnclosedParens -= 1;
            if (openParenTokenIndex !== null && numUnclosedParens === 0) {
              closeParenCharIndex = k;
              closeParenTokenIndex = i;
            }
          }
        }

        if (openParenTokenIndex === null && token.text.indexOf('(') !== -1) {
          openParenTokenIndex = i;
          openParenCharIndex = token.text.indexOf('(');
        }

        if (token.text.endsWith(', ') && nextToken && nextToken.kind === TokenKind.externalParam) {
          token.text = `${token.text.trimEnd()}\n    `;
          indentedParams = true;
        }

        newTokens.push(token);
        i += 1;
        j += 1;
      }

      if (indentedParams && openParenTokenIndex !== null) {
        const originalText = newTokens[openParenTokenIndex].text;
        const begin = originalText.slice(0, openParenCharIndex);
        const end = originalText.slice(openParenCharIndex);
        const newText = `${begin}${end}\n    `;
        newTokens[openParenTokenIndex].text = newText;
      }

      if (indentedParams && closeParenTokenIndex !== null) {
        const originalText = newTokens[closeParenTokenIndex].text;
        const begin = originalText.slice(0, closeParenCharIndex);
        const end = originalText.slice(closeParenCharIndex);
        const newText = `${begin}\n${end}`;
        newTokens[closeParenTokenIndex].text = newText;
      }

      return newTokens;
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
