<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <WordBreak tag="code"><slot /></WordBreak>
</template>

<script>
import WordBreak from 'docc-render/components/WordBreak.vue';

export default {
  name: 'CodeVoice',
  components: { WordBreak },
};
</script>

<style scoped>
code {
  speak-punctuation: code;
}

.inline-code {
  background-color: var(--color-inline-code-background);
  padding: var(--inline-code-padding);
  border-radius: var(--inline-code-border-radius);
}
</style>
