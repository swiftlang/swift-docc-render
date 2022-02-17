<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="topictitle">
    <span v-if="eyebrow" class="eyebrow">{{eyebrow}}</span>
    <WordBreak class="title" tag="h1"><slot /></WordBreak>
  </div>
</template>

<script>
import WordBreak from 'docc-render/components/WordBreak.vue';

export default {
  name: 'Title',
  components: { WordBreak },
  props: {
    eyebrow: {
      type: String,
      required: false,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.eyebrow {
  @include font-styles(eyebrow-reduced);
  color: light-color(fill-gray-tertiary);
  display: block;
  margin-bottom: rem(20px);
}

.title {
  @include font-styles(headline-reduced);
  color: light-color(fill);
  margin-bottom: rem(12px);
}
</style>
