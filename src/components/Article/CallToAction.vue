<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <TutorialCTA v-bind="$props" />
</template>

<script>
// eslint-disable-next-line import/no-named-default
import { default as TutorialCTA } from 'docc-render/components/Tutorial/CallToAction.vue';

export default {
  name: 'CallToAction',
  components: { TutorialCTA },
  props: TutorialCTA.props,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.call-to-action {
  @include breakpoint(small) {
    margin-top: 0;
  }
}
</style>
