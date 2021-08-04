<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="row">
    <slot />
  </div>
</template>

<script>
export default { name: 'GridRow' };
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.row {
  box-sizing: border-box;
  display: flex;
  flex-flow: row wrap;
}
</style>
