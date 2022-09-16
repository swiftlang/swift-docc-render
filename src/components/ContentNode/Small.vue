<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <small>
    <slot />
  </small>
</template>

<script>
export default {
  name: 'Small',
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

small {
  @include font-styles(body-reduced-tight);
  color: var(--color-figure-gray);
}
</style>
