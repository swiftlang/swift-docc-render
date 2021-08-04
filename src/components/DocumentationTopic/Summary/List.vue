<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ul class="summary-list"><slot /></ul>
</template>

<script>
export default { name: 'List' };
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.summary-list {
  font-size: rem(14px);
  list-style: none;
  margin: 0;
}
</style>
