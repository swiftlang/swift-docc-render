<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Row>
    <p class="title">Question {{ index }} of {{ total }}</p>
  </Row>
</template>

<script>
import GridRow from 'docc-render/components/GridRow.vue';

export default {
  name: 'AssessmentsProgress',
  components: {
    Row: GridRow,
  },
  props: {
    index: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.title {
  @include font-styles(caption);
  color: var(--colors-secondary-label, var(--color-secondary-label));
}

</style>
