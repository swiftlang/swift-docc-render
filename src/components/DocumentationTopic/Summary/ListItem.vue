<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <li
    class="summary-list-item"
    ref="apiChangesDiff"
    :class="{ [multipleLinesClass]: hasMultipleLinesAfterAPIChanges }"
  >
    <slot />
  </li>
</template>

<script>
import { APIChangesMultipleLines } from 'docc-render/mixins/apiChangesHelpers';

export default {
  name: 'ListItem',
  mixins: [APIChangesMultipleLines],
  props: {
    change: {
      type: Boolean,
      default: () => false,
    },
  },
};
</script>

<style scoped lang="scss">
.summary-list-item {
  margin-right: 9px;
  padding-left: 0; // override default li style

  &:last-child {
    margin-right: 0;
  }
}
</style>
