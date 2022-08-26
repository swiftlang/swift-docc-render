<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div class="grid" :style="style" :class="{ 'with-columns': columns }">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'grid',
  props: {
    columns: {
      type: Number,
      default: null,
      required: false,
      validator: v => v > 0,
    },
  },
  computed: {
    style: ({ columns }) => ({ '--col-count': columns }),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, unquote('minmax(calc(100%/12), 1fr)'));

  &.with-columns {
    grid-template-columns: repeat(var(--col-count, 12), 1fr);
    grid-auto-flow: row;

    @include breakpoint(small) {
      grid-template-columns: 1fr;
    }
  }

  @include breakpoint(small) {
    grid-template-columns: 1fr;
    grid-auto-flow: row;
  }
}
</style>
