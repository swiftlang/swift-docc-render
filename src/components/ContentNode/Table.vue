<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="table-wrapper">
    <table :class="{ spanned }">
      <slot />
    </table>
  </div>
</template>

<script>
export default {
  name: 'Table',
  props: {
    spanned: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss">
@import 'docc-render/styles/_core.scss';

.table-wrapper {
  @include space-out-between-siblings($stacked-margin-xlarge);
}
</style>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.table-wrapper {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  border-style: hidden;
}

/deep/ {
  th {
    font-weight: $font-weight-semibold;
  }

  td,
  th {
    border-color: var(--color-fill-gray-tertiary);
    border-style: solid;
    border-width: var(--table-border-width, 1px 1px);
    padding: rem(10px);

    &.left-cell {
      text-align: left;
    }

    &.right-cell {
      text-align: right;
    }

    &.center-cell {
      text-align: center;
    }
  }
}
</style>
