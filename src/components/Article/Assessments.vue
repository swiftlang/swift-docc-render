<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <TutorialAssessments v-bind="$props">
    <p slot="success">Great job, you've answered all the questions for this article.</p>
  </TutorialAssessments>
</template>

<script>
// eslint-disable-next-line import/no-named-default
import { default as TutorialAssessments } from 'docc-render/components/Tutorial/Assessments.vue';

export default {
  name: 'Assessments',
  components: { TutorialAssessments },
  props: TutorialAssessments.props,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.assessments-wrapper {
  padding-bottom: $article-stacked-margin-large;
  padding-top: 0;
  @include breakpoint(small) {
    padding-top: $tutorial-section-spacing-single-side;
  }
}
</style>
