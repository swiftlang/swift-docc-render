<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <s>
    <span class="visuallyhidden">{{ $t('accessibility.strike.start') }}</span>
      <slot />
    <span class="visuallyhidden">{{ $t('accessibility.strike.end') }}</span>
  </s>
</template>

<script>
export default {
  name: 'StrikeThrough',
};
</script>
