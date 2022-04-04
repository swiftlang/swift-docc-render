<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="summary-section"><slot /></div>
</template>

<script>
export default { name: 'Section' };
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';
.summary-section {

  &:last-of-type {
    margin-right: 0;
  }

  @include breakpoint(small) {
    margin-right: 0;
  }
}
</style>
