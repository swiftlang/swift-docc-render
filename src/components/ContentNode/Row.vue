<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div class="row" :style="style" :class="{ 'with-columns': columns }">
    <slot />
  </div>
</template>

<script>
/**
 * A Row component that accepts an optional `columns` prop.
 * When columns is passed, the grid will have that exact number of columns.
 * If no `columns` provided, width is split up equally across each cell.
 */
export default {
  name: 'Row',
  props: {
    columns: {
      type: Number,
      default: null,
      required: false,
      validator: v => v > 0,
    },
    gap: {
      type: Number,
      required: false,
    },
  },
  computed: {
    style: ({ columns, gap }) => ({
      '--col-count': columns,
      '--col-gap': gap && `${gap}px`,
    }),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  grid-gap: var(--col-gap, #{$article-stacked-margin-small});

  &.with-columns {
    grid-template-columns: repeat(var(--col-count), 1fr);
    grid-auto-flow: row;

    @include breakpoint(small) {
      grid-template-columns: 1fr;
    }
  }

  @include breakpoint(small) {
    grid-template-columns: 1fr;
    grid-auto-flow: row;
  }

  /deep/ + * {
    margin-top: $stacked-margin-large;
  }
}
</style>
