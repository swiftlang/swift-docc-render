<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <s>
    <slot />
  </s>
</template>

<script>
export default {
  name: 'StrikeThrough',
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

s::before, s::after {
  @include visuallyhidden()
}

s::before {
  content: " [start of stricken text] ";
}

s::after {
  content: " [end of stricken text] ";
}
</style>
