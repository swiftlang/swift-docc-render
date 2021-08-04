<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <code class="decorated-title">
    <component
      v-for="(token, i) in tokens"
      :class="[classFor(token), emptyTokenClass(token)]"
      :is="componentFor(token)"
      :key="i"
    >{{ token.text }}</component>
  </code>
</template>

<script>
import DeclarationToken from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';

const { TokenKind } = DeclarationToken.constants;

const TokenClass = {
  decorator: 'decorator',
  identifier: 'identifier',
  label: 'label',
};

export default {
  name: 'DecoratedTopicTitle',
  components: { WordBreak },
  props: {
    tokens: {
      type: Array,
      required: true,
      default: () => ([]),
    },
  },
  constants: { TokenKind },
  methods: {
    emptyTokenClass: ({ text }) => ({ 'empty-token': text === ' ' }),
    classFor({ kind }) {
      switch (kind) {
      case TokenKind.externalParam:
      case TokenKind.identifier:
        return TokenClass.identifier;
      case TokenKind.label:
        return TokenClass.label;
      default:
        return TokenClass.decorator;
      }
    },
    componentFor(token) {
      // don't attempt to use `WordBreak` for whitespace only tokens since the
      // default slot won't be properly passed by Vue
      return /^\s+$/.test(token.text) ? (
        'span'
      ) : (
        WordBreak
      );
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.decorator, .label {
  color: var(--colors-secondary-label, var(--color-secondary-label));
}

.label {
  @include font-styles(body)
}

// This class is added to tokens with a single whitespace as a workaround to a
// Safari-only bug where the link underline doesn't properly display for these
// tokens
.empty-token {
  font-size: 0;

  &:after {
    content: '\00a0';
    font-size: 1rem;
  }
}
</style>
