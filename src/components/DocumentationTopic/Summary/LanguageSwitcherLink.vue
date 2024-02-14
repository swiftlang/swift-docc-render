<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <a v-if="url" :href="url" @click.prevent="$emit('click')"><slot /></a>
  <span v-else><slot /></span>
</template>

<script>
export default {
  name: 'LanguageSwitcherLink',
  props: {
    url: [String, Object],
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

  a {
    @include underline-text;
    color: inherit;
    font-weight: $font-weight-semibold;
  }
</style>
