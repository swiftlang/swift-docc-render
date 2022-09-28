<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div class="column" :style="style">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Column',
  props: {
    span: {
      type: Number,
      default: null,
    },
  },
  computed: {
    style: ({ span }) => ({ '--col-span': span }),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.column {
  grid-column: span var(--col-span);
  min-width: 0;
  @include breakpoint(small) {
    grid-column: span 1;
  }
}
</style>
