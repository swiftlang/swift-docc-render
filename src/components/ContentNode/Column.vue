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
const AlignmentMap = {
  leading: 'flex-start',
  center: 'center',
  trailing: 'flex-end',
};

export default {
  name: 'Column',
  props: {
    span: {
      type: Number,
      default: null,
    },
    alignment: {
      type: String,
      default: null,
      validator: v => Object.hasOwn(AlignmentMap, v) || v === null,
    },
  },
  computed: {
    style: ({ span, alignment }) => ({
      '--col-span': span,
      '--col-alignment': AlignmentMap[alignment] || null,
    }),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.column {
  display: flex;
  flex-direction: column;
  align-items: var(--col-alignment, flex-start);
  grid-column: span var(--col-span);
  min-width: 0;
  @include breakpoint(small) {
    grid-column: span 1;
  }
}
</style>
