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
import { getSetting } from 'docc-render/utils/theme-settings';
import Language from 'docc-render/constants/Language';
import DeclarationToken from './DeclarationToken.vue';

const { TokenKind } = DeclarationToken.constants;

const DEFAULT_INDENTATION_WIDTH = 4;

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
    language: {
      type: String,
      required: false,
    },
  },
  computed: {
    indentationWidth: () => getSetting([
      'theme',
      'code',
      'indentationWidth',
    ], DEFAULT_INDENTATION_WIDTH),
    formattedTokens: ({
      language,
      formattedSwiftTokens,
      tokens,
    }) => (language === Language.swift.key.api ? formattedSwiftTokens : tokens),
    // Return a formatted version of the tokens array, with additional
    // indentation whitespace to break parameters onto individual lines for
    // improved readability and scanning of Swift functions/initializers.
    //
    // This is implemented in a single pass loop where text tokens are updated
    // at certain key points to insert spaces and newlines so that each
    // parameter of a multi-parameter function gets its own line.
    //
    // Ideally this should be implemented with a tool like SwiftFormat in the
    // future with the raw text before it gets tokenized for syntax
    // highlighting—however, this post-tokenization JavaScript logic should be
    // an improvement until that kind of work can be integrated.
    //
    // @param {Array} tokens The original syntax tokens.
    //   See `DeclarationToken.props`
    // @return {Array} A formatted version of the original tokens.
    //   See `DeclarationToken.props`
    formattedSwiftTokens: ({ indentationWidth, tokens }) => {
      const indent = ' '.repeat(indentationWidth);
      let indentedParams = false;
      const newTokens = [];
      let i = 0;
      let j = 1;
      let openParenTokenIndex = null;
      let openParenCharIndex = null;
      let closeParenTokenIndex = null;
      let closeParenCharIndex = null;
      let numUnclosedParens = 0;

      // loop through every declaration token
      while (i < tokens.length) {
        // keep track of the current token and the next one (if any)
        const token = tokens[i];
        const newToken = { ...token };
        const nextToken = j < tokens.length ? tokens[j] : undefined;

        // loop through the token text to look for "(" and ")" characters
        const tokenLength = (token.text || '').length;
        // eslint-disable-next-line no-plusplus
        for (let k = 0; k < tokenLength; k++) {
          if (token.text.charAt(k) === '(') {
            numUnclosedParens += 1;
            // keep track of the token/character position of the first "("
            if (openParenCharIndex == null) {
              openParenCharIndex = k;
              openParenTokenIndex = i;
            }
          }

          if (token.text.charAt(k) === ')') {
            numUnclosedParens -= 1;
            // if this ")" balances out the number of "(" characters that have
            // been seen, this is the one that pairs up with the first one
            if (openParenTokenIndex !== null && numUnclosedParens === 0) {
              closeParenCharIndex = k;
              closeParenTokenIndex = i;
            }
          }
        }

        // if we find some text ending with ", " and the next token is the start
        // of a new param, update this token text to replace the space with a
        // newline followed by 4 spaces
        if (token.text && token.text.endsWith(', ')
          && nextToken && nextToken.kind === TokenKind.externalParam) {
          newToken.text = `${token.text.trimEnd()}\n${indent}`;
          indentedParams = true;
        }

        newTokens.push(newToken);
        i += 1;
        j += 1;
      }

      // if we indented some params, we want to find the opening "(" symbol
      // and add a newline and 4 spaces to the end of it, breaking the first
      // param onto its own line
      if (indentedParams && openParenTokenIndex !== null) {
        const originalText = newTokens[openParenTokenIndex].text;
        newTokens[openParenTokenIndex].text = `${originalText}\n${indent}`;
      }

      // if we indented some params, we want to find the closing ")" symbol
      // to prepend a newline to it so that the return clause is on its own
      // line and not included with the last param
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
    if (this.language === Language.objectiveC.key.api) {
      await this.$nextTick();
      indentDeclaration(this.$refs.code, this.language);
    }
    if (hasMultipleLines(this.$refs.declarationGroup)) this.hasMultipleLines = true;
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
  border-radius: $large-border-radius;
  border-style: solid;
  border-width: $docs-declaration-source-border-width;
  padding: $code-block-style-elements-padding;
  speak: literal-punctuation;
  line-height: 25px;

  &.has-multiple-lines {
    border-radius: $border-radius;
  }

  > code {
    @include font-styles(documentation-code-listing);
    display: block;
  }
}
</style>
