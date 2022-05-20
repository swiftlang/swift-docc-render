<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <OnThisPageSection
    class="contenttable alt-light"
    :anchor="anchor"
    :title="title"
  >
    <div class="container">
      <h2 class="title">{{title}}</h2>
      <slot />
    </div>
  </OnThisPageSection>
</template>

<script>
import OnThisPageSection from './OnThisPageSection.vue';

export default {
  name: 'ContentTable',
  components: { OnThisPageSection },
  props: {
    anchor: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.container {
  @include dynamic-content-container;
  padding-bottom: $section-spacing-single-side;
}

.title {
  @include font-styles(heading-2-reduced);
  padding-top: $section-spacing-single-side;
  border-top-color: var(--color-grid);
  border-top-style: solid;
  border-top-width: 1px;
}
</style>
