<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <code
    tabindex="0"
    :data-before-code="$t('accessibility.code.start')"
    :data-after-code="$t('accessibility.code.end')"
  >
    <slot />
  </code>
</template>

<script>

export default {
  name: 'CodeBlock',
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

code {
  /* enforce "ltr" direction for text in code blocks right now since code is
     likely to remain as English and not translated */
  direction: ltr;

  &::before {
    content: attr(data-before-code);
  }
  &::after {
    content: attr(data-after-code);
  }
  &::before, &::after {
    // ensure the pseudo elements dont fly off in space
    display: block;
    @include visuallyhidden()
  }
}
</style>
