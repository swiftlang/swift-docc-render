<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="body">
    <BodyContent :content="content" />
  </div>
</template>

<script>
import BodyContent from './BodyContent.vue';

export default {
  name: 'Body',
  components: { BodyContent },
  props: BodyContent.props,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.body {
  $overlap: $inter-section-spacing-single-side * 1.5;

  background: var(--colors-text-background, var(--color-article-body-background));
  @include breakpoint-content;
  border-radius: 10px;
  transform: translateY(-$overlap);

  @include breakpoint(small) {
    border-radius: 0;
    transform: none;
  }

  /deep/ {
    & ~ * {
      // needed to account for `translateY` shift from article body
      margin-top: -$article-stacked-margin-large;
    }
  }
}

.body-content {
  padding:
   $article-stacked-margin-large
   calculate-column-width(1)
   ($article-stacked-margin-large * 2)
   calculate-column-width(1);

  @include breakpoint(small) {
    padding: 0 0 $article-stacked-margin-large 0;
  }
}
</style>
