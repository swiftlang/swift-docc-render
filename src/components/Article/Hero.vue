<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <TutorialHero v-bind="$props" />
</template>

<script>
import TutorialHero from 'theme/components/Tutorial/Hero.vue';

export default {
  name: 'Hero',
  components: { TutorialHero },
  props: TutorialHero.props,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.tutorial-hero {
  margin-bottom: $inter-section-spacing-single-side;

  @include breakpoint(small) {
    margin-bottom: 0;
  }
}
</style>
